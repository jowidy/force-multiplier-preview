import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { load } from 'cheerio';

// Inspect the deployable artifact, not source intent. This verifier is read-only.
const root = fileURLToPath(new URL('../', import.meta.url));
const distArg = process.argv.indexOf('--dist');
const dist = path.resolve(root, distArg >= 0 ? process.argv[distArg + 1] || 'dist' : 'dist');
const manifest = JSON.parse(await fs.readFile(new URL('./routes.json', import.meta.url), 'utf8'));
const buildTarget = process.env.PUBLIC_SITE_TARGET || 'preview';
if (!['preview', 'staging', 'production'].includes(buildTarget)) {
  throw new Error(`Unknown PUBLIC_SITE_TARGET: ${buildTarget}`);
}
const isProduction = buildTarget === 'production';
const hasServerForm = buildTarget !== 'preview';
const { productionOrigin } = manifest;
const previewOrigin = hasServerForm ? productionOrigin : manifest.previewOrigin;
const previewBase = hasServerForm ? '/' : manifest.previewBase;
const failures = new Set();
const checkedLinks = new Set();
const documents = new Map();
const textFiles = new Map();
const check = (condition, message) => {
  if (!condition) failures.add(message);
};
const cleanRoute = (value) => (value === '/' ? '/' : `/${value.replace(/^\/+|\/+$/g, '')}`);
const normalizeText = (value) => value.replace(/\s+/g, ' ').trim();
const canonical = (route) =>
  `${productionOrigin}${cleanRoute(route)}${cleanRoute(route) === '/' ? '' : '/'}`;

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const location = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) failures.add(`Deployable output contains a symlink: ${location}`);
    else if (entry.isDirectory()) result.push(...(await walk(location)));
    else result.push(location);
  }
  return result;
}

let files;
try {
  files = await walk(dist);
} catch (error) {
  console.error(`Output verification cannot read ${dist}. Run the build first. ${error.message}`);
  process.exit(1);
}
const relative = (file) => path.relative(dist, file).replaceAll(path.sep, '/');
const fileSet = new Set(files.map(relative));
const routeForFile = (file) =>
  file === 'index.html'
    ? '/'
    : file.endsWith('/index.html')
      ? cleanRoute(file.slice(0, -11))
      : cleanRoute(file.replace(/\.html$/, ''));
const outputForPath = (pathname) => {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const candidate = decoded.replace(/^\/+/, '');
  if (candidate.split('/').some((part) => part === '..') || candidate.includes('\\')) return null;
  return (
    [
      candidate,
      `${candidate.replace(/\/$/, '')}/index.html`,
      `${candidate.replace(/\/$/, '')}.html`,
    ]
      .map((item) => item.replace(/^\//, ''))
      .find((item) => fileSet.has(item)) ||
    (candidate === '' && fileSet.has('index.html') ? 'index.html' : null)
  );
};
const fileForRoute = (route) => outputForPath(route);
const documentUrl = (file) =>
  `${previewOrigin}${previewBase}${file === 'index.html' ? '' : file.endsWith('/index.html') ? file.slice(0, -10) : file}`;

for (const file of files) {
  const rel = relative(file);
  check(
    !/(?:^|\/)(?:sources?|docs|design|node_modules|\.git|\.astro|\.env(?:\.[^/]*)?)(?:\/|$)/i.test(
      rel,
    ),
    `Private or source path shipped: ${rel}`,
  );
  check(
    !/\.(?:md|mdx|astro|tsx?|map|py|ps1|toml|ya?ml|fig|zip)$/i.test(rel),
    `Source/archive file shipped: ${rel}`,
  );
  check(
    !/(?:^|\/)(?:package(?:-lock)?\.json|pnpm-lock\.yaml|routes\.json|url-inventory\.(?:json|csv)|capture-summary\.json|PRODUCT\.md|AGENTS\.md)$/i.test(
      rel,
    ),
    `Working file shipped: ${rel}`,
  );
  if (/\.(?:html|css|js|json|xml|txt|svg)$/i.test(rel)) {
    const text = await fs.readFile(file, 'utf8');
    textFiles.set(rel, text);
    check(
      !/(?:C:[\\/]Users[\\/][^\\/\s]+|C:[\\/]Vaults|machine-identity[\\/]|Knowledge Vault)/i.test(
        text,
      ),
      `Private machine path/context leaked: ${rel}`,
    );
    check(
      !/(?:-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{40,}\b|\bAKIA[A-Z0-9]{16}\b)/.test(
        text,
      ),
      `Possible credential leaked: ${rel}`,
    );
    if (/\.(?:json|html|xml)$/i.test(rel))
      check(
        !/["'](?:html_file|text_file|capture_time|content_type_category)["']\s*:/.test(text),
        `Source-archive metadata shipped: ${rel}`,
      );
    if (rel.endsWith('.html')) documents.set(rel, load(text));
  }
}
check(documents.size > 0, 'Build has no HTML documents.');
check(
  manifest.routes.filter((item) => item.origin === 'existing').length === 28,
  'Migration map must cover the 28 inventoried existing URLs.',
);
check(
  new Set(manifest.routes.map((item) => item.path)).size === manifest.routes.length,
  'Migration map contains duplicate source routes.',
);
const routeMap = new Map(manifest.routes.map((item) => [item.path, item]));
for (const item of manifest.routes) {
  check(Boolean(fileForRoute(item.path)), `Required route missing: ${item.path}`);
  check(
    Boolean(fileForRoute(item.target)),
    `Migration target missing: ${item.path} -> ${item.target}`,
  );
  check(
    routeMap.has(item.target) && routeMap.get(item.target).target === item.target,
    `Alias chain or unmapped target: ${item.path} -> ${item.target}`,
  );
}

function verifyUrl(value, fromFile, context, asset = false) {
  const raw = value?.trim();
  if (!raw) return;
  if (/^(?:mailto|tel|sms|data|blob):/i.test(raw)) return;
  check(!/^javascript:/i.test(raw), `${fromFile}: executable javascript URL in ${context}`);
  if (/^javascript:/i.test(raw)) return;
  let url;
  try {
    url = new URL(raw, documentUrl(fromFile));
  } catch {
    failures.add(`${fromFile}: invalid URL in ${context}: ${raw}`);
    return;
  }
  if (asset)
    check(
      !/(?:^|\.)(?:squarespace\.com|squarespace-cdn\.com)$/i.test(url.hostname),
      `${fromFile}: asset still depends on Squarespace: ${raw}`,
    );
  if (url.origin !== previewOrigin) return;
  check(
    url.pathname.startsWith(previewBase),
    `${fromFile}: ${context} escapes preview base: ${raw}`,
  );
  if (!url.pathname.startsWith(previewBase)) return;
  const target = outputForPath(url.pathname.slice(previewBase.length));
  const key = `${fromFile}|${url.pathname}${url.hash}`;
  if (checkedLinks.has(key)) return;
  checkedLinks.add(key);
  check(Boolean(target), `${fromFile}: missing ${context} target: ${raw}`);
  if (target && url.hash && documents.has(target)) {
    let id;
    try {
      id = decodeURIComponent(url.hash.slice(1));
    } catch {
      id = url.hash.slice(1);
    }
    if (id && !id.startsWith(':~:text=')) {
      const $target = documents.get(target);
      const exists = $target('[id], a[name]')
        .toArray()
        .some((el) => $target(el).attr('id') === id || $target(el).attr('name') === id);
      check(exists, `${fromFile}: missing fragment ${url.hash} in ${target}`);
    }
  }
}

const caseRoutes = manifest.routes.filter((item) => item.path.startsWith('/case-studies/'));
check(caseRoutes.length === 6, 'Expected six case-study routes.');
for (const [file, $] of documents) {
  const route = routeForFile(file);
  const rule = routeMap.get(route);
  check(Boolean(rule), `Unmapped HTML route: ${route}`);
  check($('html').attr('lang')?.startsWith('en'), `${file}: missing English page language`);
  check(
    $('h1').length === 1 && normalizeText($('h1').text()).length > 0,
    `${file}: expected exactly one meaningful H1`,
  );
  check(
    $('title').length === 1 && normalizeText($('title').text()).length >= 10,
    `${file}: expected one descriptive title`,
  );
  check(
    $('meta[name="description"]').length === 1 &&
      ($('meta[name="description"]').attr('content')?.trim().length || 0) >= 30,
    `${file}: expected one meaningful meta description`,
  );
  const robots = ($('meta[name="robots"]').attr('content') || '').toLowerCase().split(/[\s,]+/);
  const excluded =
    !isProduction || ['/404', '/thank-you'].includes(route) || rule?.path !== rule?.target;
  check(
    excluded
      ? robots.includes('noindex') && robots.includes('nofollow')
      : robots.includes('index') && robots.includes('follow') && !robots.includes('noindex'),
    `${file}: unexpected indexing policy for ${buildTarget}`,
  );
  check(
    isProduction ? !$('.review-label').length : true,
    `${file}: production still shows a review label`,
  );
  check($('link[rel="canonical"]').length === 1, `${file}: expected exactly one canonical`);
  const expectedCanonical = canonical(rule?.target || route);
  check(
    $('link[rel="canonical"]').attr('href') === expectedCanonical,
    `${file}: canonical should be ${expectedCanonical}`,
  );
  check(
    $('meta[property="og:url"]').attr('content') === expectedCanonical,
    `${file}: og:url must match canonical`,
  );
  for (const field of ['og:title', 'og:description', 'og:image', 'og:image:alt'])
    check(
      Boolean($(`meta[property="${field}"]`).attr('content')?.trim()),
      `${file}: missing ${field}`,
    );
  verifyUrl($('meta[property="og:image"]').attr('content'), file, 'social image', true);
  const structured = $('script[type="application/ld+json"]');
  check(structured.length > 0, `${file}: missing structured data`);
  structured.each((_, element) => {
    try {
      const data = JSON.parse($(element).text());
      check(
        Boolean(data && typeof data === 'object'),
        `${file}: JSON-LD must contain an object or graph`,
      );
    } catch (error) {
      failures.add(`${file}: invalid JSON-LD: ${error.message}`);
    }
  });
  const visibleBody = $('body').clone();
  visibleBody.find('script, style, template').remove();
  check(!visibleBody.text().includes('\u2014'), `${file}: authored em dash in visible HTML`);
  const visibleText = normalizeText($('main').text());
  check(
    !/\b(?:TODO|TBD|lorem ipsum)\b/i.test(visibleText),
    `${file}: unfinished placeholder in visible content`,
  );
  check(
    !/^(?:#\s*){1,6}\s*(?:Insights|Services|Work)$/m.test($('main').text()),
    `${file}: raw Markdown heading rendered as content`,
  );
  if (route.startsWith('/case-studies/')) {
    check(
      $('article h2').length >= 3,
      `${file}: case lacks substantive problem/work/evidence sections`,
    );
    const paragraphs = $('article p')
      .toArray()
      .map((el) => normalizeText($(el).text()));
    const hasLimits = paragraphs.some(
      (text) =>
        text.length >= 80 &&
        /\b(?:does not|doesn't|not a claim|cannot|not establish|not measured|did not)\b/i.test(
          text,
        ),
    );
    check(hasLimits, `${file}: case lacks a substantive evidence-limit paragraph`);
    check(/\banonymi[sz]ed\b/i.test(visibleText), `${file}: case anonymity is not disclosed`);
  }
  // A number must retain its meaning where it appears, including teaser cards.
  $('main p, main h1, main h2, main h3').each((_, element) => {
    const text = normalizeText($(element).text());
    if (/\b60\b/.test(text) && /\b30\b/.test(text)) {
      const local = normalizeText($(element).parent().text());
      check(
        /\bestimat\w*\b/i.test(local) && /\b(?:narrow\w*|smaller|scope|first.phase)\b/i.test(local),
        `${file}: 60/30 metric lacks nearby estimate/scope qualification`,
      );
      const card = $(element).closest('a[href]');
      if (card.length)
        check(
          (card.attr('href') || '').includes('/case-studies/local-proof-online'),
          `${file}: estimate teaser links to the wrong supporting case`,
        );
    }
  });
  $('a[href], area[href]').each((_, el) => verifyUrl($(el).attr('href'), file, 'link'));
  $('link[href]')
    .not('[rel="canonical"]')
    .each((_, el) => verifyUrl($(el).attr('href'), file, 'linked asset', true));
  $('[src], [poster], object[data]').each((_, el) => {
    for (const attr of ['src', 'poster', 'data'])
      if ($(el).attr(attr)) verifyUrl($(el).attr(attr), file, attr, true);
  });
  $('[srcset], [imagesrcset]').each((_, el) => {
    const value = $(el).attr('srcset') || $(el).attr('imagesrcset') || '';
    if (!value.startsWith('data:'))
      for (const candidate of value.split(','))
        verifyUrl(candidate.trim().split(/\s+/)[0], file, 'srcset asset', true);
  });
  $('form[action]').each((_, el) => verifyUrl($(el).attr('action'), file, 'form action'));
  $('[style], style').each((_, el) => verifyCss($(el).attr('style') || $(el).text(), file));
  $('img').each((_, el) => {
    check($(el).attr('alt') !== undefined, `${file}: image missing alt attribute`);
    check(
      Number($(el).attr('width')) > 0 && Number($(el).attr('height')) > 0,
      `${file}: image missing positive intrinsic dimensions`,
    );
  });
  if (route === '/contact') verifyContact($, file, visibleText);
}

function verifyContact($, file, visibleText) {
  const form = $('#inquiry-form');
  if (hasServerForm) {
    check(form.length === 1, `${file}: expected one inquiry form`);
    check(form.attr('name') === 'inquiry', `${file}: Netlify form name must be inquiry`);
    check(form.attr('method')?.toLowerCase() === 'post', `${file}: inquiry must POST`);
    check(form.attr('data-netlify') === 'true', `${file}: Netlify static form detection missing`);
    check(
      form.attr('action') === '/thank-you/',
      `${file}: native POST must target the direct success route`,
    );
    check(
      form.attr('netlify-honeypot') === 'bot-field' ||
        form.attr('data-netlify-honeypot') === 'bot-field',
      `${file}: missing spam honeypot declaration`,
    );
    check(
      form.find('input[name="form-name"]').attr('value') === 'inquiry',
      `${file}: missing form-name payload`,
    );
    check(form.find('input[name="bot-field"]').length === 1, `${file}: missing honeypot control`);
    for (const name of ['name', 'email', 'message']) {
      check(
        form.find(`[name="${name}"][required]`).length === 1,
        `${file}: missing required ${name}`,
      );
    }
    check(
      !form.find('fieldset[disabled]').length,
      `${file}: production form must work without JavaScript`,
    );
    check(
      !/Nothing is submitted or stored/.test(visibleText),
      `${file}: production retains preview storage claim`,
    );
    return;
  }
  const fields = form.find('#inquiry-fields');
  check(form.length === 1, `${file}: expected one inquiry draft form`);
  check(
    fields.length === 1 && fields.is('fieldset[disabled]'),
    `${file}: inquiry fieldset must be disabled in initial HTML`,
  );
  check(
    !form.attr('action')?.trim() &&
      (form.attr('method') || '').toLowerCase() !== 'post' &&
      form.attr('data-netlify') === undefined,
    `${file}: preview draft form must not expose a live submission endpoint`,
  );
  const controls = form.find(
    'input[name], textarea[name], select[name], button[type="submit"], button:not([type]), #copy-inquiry',
  );
  check(controls.length >= 3, `${file}: inquiry draft controls missing`);
  controls.each((_, control) => {
    const enclosing = $(control).closest('fieldset[disabled]');
    check(
      enclosing.length === 1 && enclosing.attr('id') === 'inquiry-fields',
      `${file}: inquiry control is enabled before JavaScript initializes: ${$(control).attr('id') || $(control).attr('name')}`,
    );
    const exemptLegend = fields.children('legend').first();
    check(
      !exemptLegend.length || !exemptLegend.find(control).length,
      `${file}: inquiry control is inside the disabled fieldset's exempt first legend`,
    );
    check(
      !$(control).attr('formaction')?.trim(),
      `${file}: inquiry control overrides the draft form with a submission endpoint`,
    );
  });
  $('[form="inquiry-form"]').each((_, control) =>
    check(
      fields.find(control).length === 1,
      `${file}: externally associated inquiry control bypasses the disabled fieldset`,
    ),
  );
  check(
    /\bemail (?:app|draft)\b/i.test(visibleText) &&
      /\bsend it there\b|\bsend (?:it |the (?:email|draft) )?(?:from|in)\b/i.test(visibleText),
    `${file}: contact must explain that the visitor sends the email draft`,
  );
  check(
    /\bnothing\b[^.]{0,90}\bstored\b|\b(?:not|never) (?:be )?stored\b/i.test(visibleText),
    `${file}: contact must explain that inquiry details are not stored`,
  );
  // HTML parsers with scripting enabled represent noscript contents as text.
  const noScriptContent = load(form.find('noscript').html() || '');
  check(
    noScriptContent('a[href^="mailto:"]').length > 0,
    `${file}: JavaScript-disabled visitors need a direct email fallback`,
  );

  // Execute only the generated draft-builder initialization against tiny test
  // doubles. This checks registration order without sending or composing mail.
  // A minifier may rename variables, so matching source variable names is unsafe.
  const initialization = [];
  $('script')
    .not('[type="application/ld+json"]')
    .each((_, script) => {
      let code = $(script).text();
      const src = $(script).attr('src');
      if (src) {
        const url = new URL(src, documentUrl(file));
        if (url.origin === previewOrigin && url.pathname.startsWith(previewBase))
          code = textFiles.get(outputForPath(url.pathname.slice(previewBase.length))) || '';
      }
      if (code.includes('inquiry-form')) initialization.push(code);
    });
  check(
    initialization.length === 1,
    `${file}: expected one discoverable inquiry initialization script`,
  );
  const listeners = new Map();
  const mock = (id) => ({
    addEventListener: (type, callback) => listeners.set(`${id}:${type}`, callback),
  });
  const nodes = new Map([
    ['#inquiry-form', { ...mock('form'), dataset: { email: form.attr('data-email') } }],
    ['#copy-inquiry', mock('copy')],
    ['#form-status', {}],
    ['#copy-fallback', {}],
    ['#inquiry-copy', {}],
  ]);
  let disabled = true;
  let enabled = false;
  nodes.set(
    '#inquiry-fields',
    Object.defineProperty({}, 'disabled', {
      get: () => disabled,
      set: (value) => {
        if (value === false) {
          check(
            typeof listeners.get('form:submit') === 'function' &&
              typeof listeners.get('copy:click') === 'function',
            `${file}: inquiry controls enable before submit/copy listeners are registered`,
          );
          enabled = true;
        }
        disabled = value;
      },
    }),
  );
  for (const code of initialization) {
    try {
      vm.runInNewContext(
        code,
        { document: { querySelector: (selector) => nodes.get(selector) || null } },
        { timeout: 1000 },
      );
    } catch (error) {
      failures.add(`${file}: inquiry initialization safety test failed: ${error.message}`);
    }
  }
  check(
    enabled && disabled === false,
    `${file}: inquiry controls do not enable after safe initialization`,
  );
}

function verifyCss(css, file) {
  for (const match of css.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi))
    verifyUrl(match[2], file, 'CSS asset', true);
  for (const match of css.matchAll(/@import\s+(['"])(.*?)\1/gi))
    verifyUrl(match[2], file, 'CSS import', true);
}
for (const [file, content] of textFiles) if (file.endsWith('.css')) verifyCss(content, file);

// Draft filters must cover feeds, JSON and indexes as well as page routes.
const sourceFiles = await walk(path.join(root, 'src/content/entries'));
let draftCount = 0;
let publishedCount = 0;
for (const file of sourceFiles.filter((file) => file.endsWith('.md'))) {
  const source = await fs.readFile(file, 'utf8');
  const front = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  const readField = (key) => {
    const value = front.match(new RegExp(`^${key}:\\s*([^\\r\\n]+)$`, 'm'))?.[1]?.trim();
    if (!value) return value;
    if (value.startsWith('"') && value.endsWith('"')) {
      try {
        return JSON.parse(value);
      } catch {
        return value.slice(1, -1);
      }
    }
    return value.startsWith("'") && value.endsWith("'")
      ? value.slice(1, -1).replaceAll("''", "'")
      : value;
  };
  const route = readField('path');
  const title = readField('title');
  if (/^draft:\s*true\s*$/m.test(front)) {
    draftCount++;
    check(!fileForRoute(route || '/__invalid_draft__'), `Draft page shipped: ${route}`);
    for (const [output, text] of textFiles)
      if (/\.(?:html|json|xml|txt)$/i.test(output)) {
        const plain = output.endsWith('.html') ? documents.get(output).text() : text;
        check(
          !(title?.length >= 16 && plain.includes(title)),
          `${output}: draft title leaked: ${title}`,
        );
        check(
          !(route && text.includes(`${previewBase}${route.replace(/^\//, '')}`)),
          `${output}: draft route leaked: ${route}`,
        );
      }
  } else {
    publishedCount++;
    check(
      Boolean(route && fileForRoute(route)),
      `Published content route missing: ${route || path.basename(file)}`,
    );
  }
}
check(
  publishedCount === 18,
  `Expected 18 published structured entries, found ${publishedCount}. Update the release contract deliberately if content scope changes.`,
);
check(
  fileSet.has('fonts/OFL.txt') || [...fileSet].some((file) => /(?:^|\/)OFL\.txt$/i.test(file)),
  'Published local fonts require their OFL license.',
);
const robotsText = textFiles.get('robots.txt') || '';
check(
  !/^Disallow:\s*\/\s*$/im.test(robotsText),
  'robots.txt blocks all crawling, preventing crawlers from reading preview noindex metadata.',
);
const sitemap = load(textFiles.get('sitemap.xml') || '', { xmlMode: true });
const sitemapUrls = sitemap('loc')
  .toArray()
  .map((el) => sitemap(el).text());
const expectedSitemap = isProduction
  ? manifest.routes
      .filter((item) => item.path === item.target && !['/404', '/thank-you'].includes(item.path))
      .map((item) => canonical(item.path))
  : [];
check(
  sitemapUrls.length === expectedSitemap.length,
  'Sitemap URL count does not match the indexing policy.',
);
for (const url of expectedSitemap) check(sitemapUrls.includes(url), `Sitemap missing ${url}`);
check(
  isProduction
    ? robotsText.includes(`Sitemap: ${productionOrigin}/sitemap.xml`)
    : !robotsText.includes('Sitemap:'),
  'robots.txt sitemap policy is incorrect.',
);

const summary = {
  buildTarget,
  htmlPages: documents.size,
  expectedRoutes: manifest.routes.length,
  existingUrlsCovered: 28,
  aliases: manifest.routes.filter((item) => item.path !== item.target).length,
  contentEntries: publishedCount,
  caseStudies: caseRoutes.length,
  draftsChecked: draftCount,
  localReferencesChecked: checkedLinks.size,
  deployableFiles: files.length,
  failures: failures.size,
};
console.log(JSON.stringify(summary, null, 2));
if (failures.size) {
  console.error('\nOutput verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else
  console.log(
    `PASS: ${buildTarget} routes, references, metadata, evidence and output boundaries verified.`,
  );

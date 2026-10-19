import fs from 'node:fs/promises';
import { load } from 'cheerio';
import { conversationBookingUrl } from '../src/lib/service-request.mjs';
const expected = [
  'social-posts',
  'community-engagement',
  'meta-ads',
  'google-ads',
  'seo-content',
  'newsletters',
  'website-support',
  'landing-page',
  'homepage',
  'website-page',
  'google-business-profile',
];
const failures = [];
const sentences = new Intl.Segmenter('en', { granularity: 'sentence' });
const scenarioComparisons = new Set(['seo-content', 'newsletters', 'website-support']);
const selectedRanges = [
  '$7,100–$9,500+',
  '$3,500–$4,800+',
  '$4,200–$5,700+',
  '$3,900–$5,400+',
  '$3,700–$5,100+',
  '$4,600–$6,300+',
  '$2,600–$3,500+',
  '$7,400–$9,700+',
  '$8,800–$11,500+',
  '$2,400–$3,200+',
  '$2,600–$3,500+',
];
const exactTooltip = 'Estimated from industry standard cost projection methods 2026.';
const check = (ok, message) => {
  if (!ok) failures.push(message);
};
for (const slug of expected) {
  const text = await fs.readFile(
    new URL(`../dist/services/${slug}/index.html`, import.meta.url),
    'utf8',
  );
  const $ = load(text),
    main = $('main').text().replace(/\s+/g, ' '),
    form = $('[data-demo-inquiry]');
  check(form.length === 1, `${slug}: missing demo form`);
  check(form.find('option[selected]').val() === slug, `${slug}: wrong preselected service`);
  check(form.find('[data-demo-fields][disabled]').length === 1, `${slug}: unsafe no-JS controls`);
  check(!form.attr('action') && !form.attr('data-netlify'), `${slug}: live endpoint on demo`);
  check(
    form.find('select[name="service"] option').length === 12,
    `${slug}: unexpected service catalog`,
  );
  check(
    main.includes('$400') &&
      main.includes('Costs outside the $400 fee') &&
      main.includes('Scope to confirm'),
    `${slug}: missing price or scope disclosure`,
  );
  check(
    main.includes('Nothing is sent or saved') &&
      main.includes('Choose a time on our work calendar') &&
      main.includes('QuickBooks'),
    `${slug}: unclear demonstration status`,
  );
  check(
    form.find('[data-step-review][hidden]').length === 1 &&
      form.find('[data-step-onboarding],[data-preview-next]').length === 0 &&
      $('[data-schedule-pending]').length === 0 &&
      $('[data-schedule-link]').attr('href') === conversationBookingUrl &&
      $('a[href="mailto:john.dye@forcemultiplier.work"]').length >= 1,
    `${slug}: missing safe conversation or verified scheduling destination`,
  );
  check(
    !/simulate payment|payment is simulated|no sales call|pay now|pay and start onboarding/i.test(
      main,
    ),
    `${slug}: superseded storefront copy remains`,
  );
  check(
    $('.service-hero a.button').text().trim().startsWith('Schedule a call'),
    `${slug}: primary CTA must schedule a call`,
  );
  if (slug === 'seo-content')
    check(
      main.includes('Two onsite SEO articles per month'),
      'SEO: approved article quantity missing',
    );
  if (slug === 'newsletters')
    check(
      main.includes('Two newsletters per month') && main.includes('list-building work'),
      'Newsletters: approved quantity or active list building missing',
    );
  if (slug === 'website-support')
    check(
      !/\b(?:60 minutes|\d+[- ]hours?|hour allowance|hour limits?|hourly commitments)\b/i.test(
        main,
      ),
      'Maintenance: unapproved hourly commitment or internal guidance leaked',
    );
  check(
    !/(?:tel:|sms:|318.{0,4}376.{0,4}6914|googletagmanager\.com|google-analytics\.com)/i.test(text),
    `${slug}: personal phone or tracker leaked`,
  );
  check(
    $('meta[name="robots"]').attr('content') === 'noindex, nofollow',
    `${slug}: preview is indexable`,
  );
  for (const input of form.find('input:not([type="checkbox"]),select,textarea').toArray())
    check($(`label[for="${$(input).attr('id')}"]`).length === 1, `${slug}: unlabeled control`);
}
const $ = load(await fs.readFile(new URL('../dist/services/index.html', import.meta.url), 'utf8'));
const overviewCopy = [
  $('body').clone().find('script,style').remove().end().text(),
  $('title').text(),
  ...$('meta[content]')
    .map((_, el) => $(el).attr('content'))
    .get(),
  ...$('[aria-label],[alt],[title]')
    .map((_, el) =>
      [$(el).attr('aria-label'), $(el).attr('alt'), $(el).attr('title')].filter(Boolean).join(' '),
    )
    .get(),
].join(' ');
check(
  !/\beleven\b|\b11(?![\d,])\b/i.test(overviewCopy),
  'Overview must use count-independent wording, including metadata and accessibility text',
);
check($('.service-card').length === 11, 'Overview must show exactly11 services');
check(
  $('#monthly .service-card').length === 7 && $('#one-time .service-card').length === 4,
  'Catalog cadence mismatch',
);
check($('[data-price-comparison]').length === 1, 'Missing all-services price comparison');
check(
  $('[data-comparison-row]').length === 11,
  'Comparison must cover all eleven original services',
);
for (const slug of expected) {
  const row = $(`[data-comparison-row][data-service="${slug}"]`);
  check(row.length === 1, `${slug}: missing or duplicate comparison`);
  check(
    !row.is('[data-comparison-pending]') &&
      row.find('[data-source-number]').text().trim() === selectedRanges[expected.indexOf(slug)],
    `${slug}: comparison must use the selected base SMB-to-enterprise range`,
  );
  check(
    row.find('[data-comparison-scenario]').length === (scenarioComparisons.has(slug) ? 1 : 0),
    `${slug}: comparison scenario must be distinguished from FM scope`,
  );
  check(row.find('[data-target-number]').text() === '$400', `${slug}: wrong FM fee`);
  check(
    row.find('.comparison-agency [data-price-label="agency"]').text().trim() === 'Other Agencies' &&
      row.find('.comparison-fm [data-price-label="fm"]').text().trim() === 'Force Multiplier' &&
      row.find('[data-fm-result] [data-price-label]').length === 0,
    `${slug}: mobile labels must identify both prices and stay outside the animated result`,
  );
  const summary = row.find('[data-comparison-summary]');
  check(
    summary.length === 1 && summary.text().trim() === exactTooltip,
    `${slug}: comparison tooltip must use the owner's exact wording`,
  );
  check(
    [...sentences.segment(summary.text().trim())].length === 1 &&
      row.find('.comparison-evidence p').length === 1,
    `${slug}: comparison disclosure must contain only one sentence`,
  );
  check(
    row.find('[data-price-canvas][aria-hidden="true"]').length === 1,
    `${slug}: decorative canvas exposed`,
  );
  check(
    row.find('[data-source-info] summary').length === 1,
    `${slug}: missing accessible source disclosure`,
  );
  check(
    row.find('.comparison-number-line [data-source-number]').length === 1 &&
      row.find('.comparison-number-line [data-source-info]').length === 1,
    `${slug}: information control must sit next to the comparison price`,
  );
}
check(!/published example/i.test($('main').text()), 'Comparison uses the removed label');
check(
  $('[data-comparison-pending]').length === 0 &&
    $('[data-comparison-row]:not([data-comparison-pending])').length === 11 &&
    !/Scope pending/i.test($('[data-price-comparison]').text()),
  'All eleven comparisons must show the selected ranges without pending placeholders',
);
check(
  $('[role="columnheader"]').eq(1).text().trim() === 'Other Agencies',
  'Comparison heading must remain Other Agencies',
);
check(
  $('#comparison-methodology').length === 0 &&
    $('a[href*="#comparison-methodology"]').length === 0 &&
    !$('main').text().includes('How these agency estimates were modeled'),
  'Removed methodology section and links must not remain on the comparison page',
);
const home = load(await fs.readFile(new URL('../dist/index.html', import.meta.url), 'utf8'));
check(
  home('a[href*="#comparison-methodology"]').length === 0,
  'Homepage must not link to the removed methodology section',
);
check(!/published example/i.test(home('main').text()), 'Homepage uses the removed label');
check(
  JSON.stringify(
    home('.comparison-range')
      .map((_, el) => home(el).text().trim())
      .get(),
  ) === JSON.stringify([selectedRanges[0], selectedRanges[3], selectedRanges[8]]) &&
    home('.provider-overlay strong').text().trim() === selectedRanges[3],
  'Homepage comparisons must match the same selected ranges',
);
check(
  $('[data-comparison-row][data-cadence="monthly"]').length === 7 &&
    $('[data-comparison-row][data-cadence="once"]').length === 4,
  'Comparison cadence mismatch',
);
const contact = load(
  await fs.readFile(new URL('../dist/contact/index.html', import.meta.url), 'utf8'),
);
check(contact('option[value="help-choose"]').length === 1, 'Contact must allow undecided service');
console.log(
  JSON.stringify({ servicePages: expected.length, monthly: 7, oneTime: 4, failures }, null, 2),
);
if (failures.length) process.exit(1);

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildRequestPreview,
  needsAdSpend,
  validateServiceRequest,
} from '../src/lib/service-request.mjs';

const catalog = [
  {
    slug: 'social-posts',
    title: 'Social posts',
    category: 'monthly',
    costs: 'Paid promotion and agreed scheduling software are separate.',
    deliverables: ['20 custom social posts with imagery each month.'],
    preparation: ['Your brand voice examples.'],
    scopeReview: ['Confirm the platforms and publishing arrangement.'],
  },
  {
    slug: 'homepage',
    title: 'Homepage',
    category: 'once',
    costs: 'Your domain and hosting are separate.',
    deliverables: ['A small-business homepage.'],
    preparation: ['Your business facts and existing logo.'],
    scopeReview: ['Confirm the page sections and review process.'],
  },
  {
    slug: 'meta-ads',
    title: 'Meta ads',
    category: 'monthly',
    costs: 'Ad spend is additional and paid to Meta through your account.',
    deliverables: ['Meta ads management, optimization and testing.'],
    preparation: ['Your offer and approved budget.'],
    scopeReview: ['Confirm the markets and campaign scope.'],
  },
  {
    slug: 'google-ads',
    title: 'Google Ads',
    category: 'monthly',
    costs: 'Your Google Ads media budget is separate and paid through your account.',
    deliverables: ['Google Ads management, optimization and testing.'],
    preparation: ['Your destination page and business goal.'],
    scopeReview: ['Confirm measurement readiness.'],
  },
];
const validInput = {
  service: 'social-posts',
  name: '  Sample Owner  ',
  email: ' owner@example.com ',
  business: ' Sample Business ',
  website: ' https://example.com ',
  location: ' Texas ',
  timeZone: 'America/Chicago',
  startTiming: 'unsure',
  details: ' A useful goal. ',
  acknowledge: 'on',
};
const validate = (overrides = {}, allowUndecided = false) =>
  validateServiceRequest({ ...validInput, ...overrides }, catalog, allowUndecided);

test('monthly preview uses the service fee and cadence, current scope and tailored onboarding', () => {
  const validation = validate();
  assert.equal(validation.valid, true);
  assert.equal(validation.request.name, 'Sample Owner');
  assert.equal(validation.request.email, 'owner@example.com');
  const preview = buildRequestPreview(validation);
  assert.equal(
    preview.summary,
    'Social posts for Sample Business: $400 per month, month-to-month.',
  );
  assert.deepEqual(preview.scope, catalog[0].scopeReview);
  assert.deepEqual(preview.included, catalog[0].deliverables);
  assert.deepEqual(preview.preparation, catalog[0].preparation);
  assert.ok(preview.outsideCosts.startsWith(catalog[0].costs));
  assert.match(preview.nextStep, /separate service agreement, then pay and start onboarding/);
  assert.match(preview.onboardingNote, /Payment was simulated only/);
  assert.equal(preview.requiresFitReview, false);
});

test('one-time service never implies a subscription and uses its own preparation', () => {
  const preview = buildRequestPreview(validate({ service: 'homepage' }));
  assert.match(preview.summary, /\$400 one time/);
  assert.doesNotMatch(preview.summary, /per month|month-to-month/);
  assert.deepEqual(preview.preparation, catalog[1].preparation);
  assert.ok(preview.outsideCosts.startsWith(catalog[1].costs));
});

test('help-choose is permitted only where offered and stays on the fit-review path', () => {
  assert.equal(validate({ service: 'help-choose' }).valid, false);
  const preview = buildRequestPreview(validate({ service: 'help-choose' }, true));
  assert.equal(preview.requiresFitReview, true);
  assert.match(preview.summary, /No service has been selected/);
  assert.match(preview.nextStep, /fit review before payment/);
  assert.doesNotMatch(preview.onboardingNote, /Payment was simulated/);
  assert.equal(validate({ service: 'not-in-catalog' }, true).valid, false);
});

test('outside-offer requests stop at a fit-review checklist without implying payment', () => {
  const preview = buildRequestPreview(validate({ needsReview: 'on' }));
  assert.equal(preview.requiresFitReview, true);
  assert.equal(preview.onboardingTitle, 'Your fit-review checklist');
  assert.match(preview.onboardingNote, /Nothing has been sent, agreed, paid or booked/);
  assert.match(
    preview.nextStep,
    /sales call is only needed if work outside the offer requires one/,
  );
});

test('ad-spend estimate is required only for Meta and Google, with an unsure route', () => {
  for (const service of ['meta-ads', 'google-ads']) {
    assert.equal(needsAdSpend(service), true);
    assert.match(validate({ service }).errors.adSpend, /range or Not sure/);
    assert.equal(validate({ service, adSpend: 'invented' }).valid, false);
    const preview = buildRequestPreview(validate({ service, adSpend: 'unsure' }));
    assert.match(preview.context.join(' '), /Estimated ad spend: Not sure yet/);
    assert.match(preview.context.join(' '), /does not authorize spending/);
    assert.equal(preview.requiresFitReview, true);
    assert.match(preview.nextStep, /Confirm an advertising budget/);
    assert.ok(preview.outsideCosts.startsWith(catalog.find((item) => item.slug === service).costs));
    assert.equal(
      buildRequestPreview(validate({ service, adSpend: '500-999' })).requiresFitReview,
      false,
    );
  }
  const validation = validate({ adSpend: '5000-plus' });
  assert.equal(validation.valid, true);
  assert.equal(validation.request.adSpend, '');
  assert.doesNotMatch(buildRequestPreview(validation).context.join(' '), /Estimated ad spend/);
});

test('website is required unless explicitly absent; no-site removes stale site data', () => {
  assert.equal(validate({ website: '' }).valid, false);
  const validation = validate({ noWebsite: 'on', website: 'bad-stale-url' });
  assert.equal(validation.valid, true);
  assert.equal(validation.request.website, '');
  assert.match(buildRequestPreview(validation).context[0], /no website yet/);
});

test('rejects whitespace-only required values, malformed email, and unsafe or incomplete URLs', () => {
  for (const field of [
    'name',
    'business',
    'location',
    'email',
    'website',
    'timeZone',
    'startTiming',
  ]) {
    assert.ok(validate({ [field]: ' \n ' }).errors[field], field);
  }
  for (const email of ['owner', 'owner@', 'owner@example', 'owner@exam ple.com']) {
    assert.ok(validate({ email }).errors.email, email);
  }
  for (const website of [
    'example.com',
    'javascript:alert(1)',
    'ftp://example.com',
    'https://user:password@example.com',
    'https://',
  ]) {
    assert.ok(validate({ website }).errors.website, website);
  }
  assert.equal(validate({ website: 'https://example.com/services?ref=sample' }).valid, true);
  assert.equal(validate({ acknowledge: false }).valid, false);
});

test('uncertain timezone and start date are accepted without confirming timing', () => {
  const preview = buildRequestPreview(validate({ timeZone: 'unsure', startTiming: 'unsure' }));
  assert.match(preview.context.join(' '), /Not sure/);
  assert.match(preview.context.join(' '), /Timing is not confirmed/);
});

test('no website for content, support or an additional page prompts fit confirmation', () => {
  for (const slug of ['seo-content', 'website-support', 'website-page']) {
    const service = { ...catalog[0], slug };
    const validation = validateServiceRequest({ ...validInput, service: slug, noWebsite: 'on' }, [
      service,
    ]);
    assert.equal(validation.valid, true);
    const preview = buildRequestPreview(validation);
    assert.equal(preview.requiresFitReview, true);
    assert.match(preview.nextStep, /Confirm the website this service would support/);
    assert.doesNotMatch(preview.nextStep, /ineligible|rejected|must book|mandatory call/);
  }
  for (const slug of ['homepage', 'landing-page']) {
    const service = { ...catalog[1], slug };
    const validation = validateServiceRequest({ ...validInput, service: slug, noWebsite: 'on' }, [
      service,
    ]);
    assert.equal(validation.valid, true);
    assert.equal(buildRequestPreview(validation).requiresFitReview, false);
  }
});

test('invalid requests cannot advance to a payment preview', () => {
  assert.throws(() => buildRequestPreview(validate({ name: '' })), /valid request is required/);
});

test('review content is plain text and does not mutate catalog or input objects', () => {
  const input = Object.freeze({ ...validInput, business: '<img src=x onerror=alert(1)>' });
  const preview = buildRequestPreview(validateServiceRequest(input, catalog));
  assert.match(preview.summary, /<img src=x onerror=alert\(1\)>/);
  preview.scope.push('Local preview edit');
  preview.preparation.push('Local preview edit');
  assert.equal(catalog[0].scopeReview.length, 1);
  assert.equal(catalog[0].preparation.length, 1);
});

test('private sample details are processed without touching network, storage or telemetry', () => {
  const keys = [
    'fetch',
    'localStorage',
    'sessionStorage',
    'dataLayer',
    'gtag',
    'XMLHttpRequest',
    'navigator',
  ];
  const previous = keys.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]);
  try {
    for (const key of keys)
      Object.defineProperty(globalThis, key, {
        configurable: true,
        get() {
          throw new Error(`Unexpected ${key} access`);
        },
      });
    const preview = buildRequestPreview(
      validate({
        name: 'Private Sample',
        email: 'private@example.com',
        details: 'Private business plan',
      }),
    );
    assert.ok(preview.summary);
    assert.doesNotMatch(
      JSON.stringify(preview),
      /private@example.com|Private Sample|Private business plan/,
    );
  } finally {
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});

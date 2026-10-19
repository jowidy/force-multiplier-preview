/** @typedef {{slug: string, title: string, category: 'monthly' | 'once', costs: string, deliverables: string[], preparation: string[], scopeReview: string[]}} RequestService */
/** @typedef {Record<string, unknown>} RequestInput */

export const startOptions = [
  ['soon', 'As soon as the scope and setup are ready'],
  ['this-month', 'This month'],
  ['next-month', 'Next month'],
  ['later', 'Later'],
  ['unsure', 'Not sure yet'],
];

export const timeZoneOptions = [
  ['America/New_York', 'Eastern'],
  ['America/Chicago', 'Central'],
  ['America/Denver', 'Mountain'],
  ['America/Los_Angeles', 'Pacific'],
  ['America/Anchorage', 'Alaska'],
  ['Pacific/Honolulu', 'Hawaii'],
  ['America/Phoenix', 'Arizona (no daylight saving time)'],
  ['America/Puerto_Rico', 'Puerto Rico / U.S. Virgin Islands'],
  ['Pacific/Guam', 'Guam / Northern Mariana Islands'],
  ['Pacific/Pago_Pago', 'American Samoa'],
  ['unsure', 'Not sure / another time zone'],
];

export const adSpendOptions = [
  ['under-500', 'Under $500 per month'],
  ['500-999', '$500–$999 per month'],
  ['1000-2499', '$1,000–$2,499 per month'],
  ['2500-4999', '$2,500–$4,999 per month'],
  ['5000-plus', '$5,000+ per month'],
  ['unsure', 'Not sure yet'],
];

/** @param {unknown} value */
function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/** @param {unknown} value */
function checked(value) {
  return value === true || value === 'on';
}

/** @param {string} service */
export function needsAdSpend(service) {
  return service === 'meta-ads' || service === 'google-ads';
}

/** @param {string[][]} options @param {string} value */
function optionLabel(options, value) {
  return options.find(([key]) => key === value)?.[1] ?? '';
}

/**
 * Validate only this local preview. This module performs no delivery, persistence or tracking.
 * @param {RequestInput} input
 * @param {RequestService[]} services
 * @param {boolean} [allowUndecided]
 */
export function validateServiceRequest(input, services, allowUndecided = false) {
  const service = text(input.service);
  const noWebsite = checked(input.noWebsite);
  const request = {
    service,
    name: text(input.name),
    email: text(input.email),
    business: text(input.business),
    website: noWebsite ? '' : text(input.website),
    noWebsite,
    location: text(input.location),
    timeZone: text(input.timeZone),
    startTiming: text(input.startTiming),
    adSpend: needsAdSpend(service) ? text(input.adSpend) : '',
    details: text(input.details),
    needsReview: checked(input.needsReview),
    acknowledge: checked(input.acknowledge),
  };
  /** @type {Record<string, string>} */
  const errors = {};
  const selected = services.find((item) => item.slug === service);
  if (!selected && !(allowUndecided && service === 'help-choose')) {
    errors.service = 'Choose a service.';
  }
  for (const [field, label, limit] of /** @type {[keyof typeof request, string, number][]} */ ([
    ['name', 'your name', 100],
    ['business', 'your business name', 150],
    ['location', 'your state or territory', 100],
  ])) {
    const value = text(request[field]);
    if (!value) errors[field] = `Enter ${label}.`;
    else if (value.length > limit) errors[field] = `Use ${limit} characters or fewer.`;
  }
  if (request.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
    errors.email = 'Enter a complete email address, such as owner@example.com.';
  }
  if (!noWebsite) {
    try {
      const url = new URL(request.website);
      if (
        request.website.length > 500 ||
        !['http:', 'https:'].includes(url.protocol) ||
        !url.hostname.includes('.') ||
        url.username ||
        url.password
      ) {
        throw new Error('Invalid public website');
      }
    } catch {
      errors.website =
        'Enter a public website address starting with https://, or choose no website yet.';
    }
  }
  if (!optionLabel(timeZoneOptions, request.timeZone))
    errors.timeZone = 'Choose a time zone or Not sure.';
  if (!optionLabel(startOptions, request.startTiming))
    errors.startTiming = 'Choose a start preference or Not sure.';
  if (needsAdSpend(service) && !optionLabel(adSpendOptions, request.adSpend)) {
    errors.adSpend = 'Choose an estimated ad spend range or Not sure.';
  }
  if (request.details.length > 2000) errors.details = 'Use 2,000 characters or fewer.';
  if (!request.acknowledge)
    errors.acknowledge = 'Confirm that you understand this is a preview with no order or charge.';
  return { valid: Object.keys(errors).length === 0, errors, request, selected };
}

/**
 * Plain-text review and onboarding content; consumers must render with textContent.
 * @param {ReturnType<typeof validateServiceRequest>} validation
 */
export function buildRequestPreview(validation) {
  if (!validation.valid) throw new Error('A valid request is required before previewing payment.');
  const { request, selected } = validation;
  const fitQuestions = [
    ...(!selected ? ['Choose a service before confirming fit.'] : []),
    ...(request.needsReview
      ? ['Confirm the work you flagged as outside the service or uncertain.']
      : []),
    ...(needsAdSpend(request.service) && request.adSpend === 'unsure'
      ? ['Confirm an advertising budget before a live payment or campaign setup.']
      : []),
    ...(request.noWebsite &&
    ['seo-content', 'website-support', 'website-page'].includes(request.service)
      ? ['Confirm the website this service would support; you selected no website yet.']
      : []),
  ];
  const requiresFitReview = fitQuestions.length > 0;
  const fee = selected
    ? selected.category === 'monthly'
      ? '$400 per month, month-to-month'
      : '$400 one time'
    : 'Each service is separately contracted for $400; cadence depends on the service selected';
  return {
    requiresFitReview,
    summary: selected
      ? `${selected.title} for ${request.business}: ${fee}.`
      : `Help choosing a service for ${request.business}. ${fee}. No service has been selected.`,
    context: [
      request.noWebsite ? 'Website: no website yet.' : `Website: ${request.website}`,
      `Location: ${request.location}. Time zone: ${optionLabel(timeZoneOptions, request.timeZone)}.`,
      `Preferred start: ${optionLabel(startOptions, request.startTiming)}. Timing is not confirmed.`,
      ...(request.adSpend
        ? [
            `Estimated ad spend: ${optionLabel(adSpendOptions, request.adSpend)}. This is separate from the $400 management fee and does not authorize spending.`,
          ]
        : []),
    ],
    outsideCosts: selected
      ? `${selected.costs} Confirm the exact scope before payment. No extra cost is authorized by this preview.`
      : 'Ad spend, software, hosting, domains and other third-party costs are separate where needed. Confirm those costs and the exact scope before payment. No extra cost is authorized by this preview.',
    included: selected ? [...selected.deliverables] : [],
    scope: selected
      ? [...selected.scopeReview]
      : ['Choose a service and confirm its scope, cadence and outside costs.'],
    nextStep: requiresFitReview
      ? `${fitQuestions.join(' ')} This request needs a fit review before payment. A sales call is only needed if work outside the offer requires one. This preview does not contact anyone or book a call.`
      : 'For the live path: confirm fit and scope, review the separate service agreement, then pay and start onboarding. No sales call is required for work within the confirmed offer.',
    onboardingTitle: requiresFitReview ? 'Your fit-review checklist' : 'Your onboarding preview',
    onboardingNote: requiresFitReview
      ? 'Nothing has been sent, agreed, paid or booked. Confirm the service and any work outside the offer before moving to an agreement, payment and onboarding.'
      : 'Payment was simulated only. No order, charge or agreement exists. After a real payment for the confirmed scope, onboarding would collect these items through the agreed process.',
    preparation: selected
      ? [...selected.preparation]
      : [
          'Describe the business goal you want help with.',
          'Choose the closest service and confirm whether any work falls outside that offer.',
        ],
  };
}

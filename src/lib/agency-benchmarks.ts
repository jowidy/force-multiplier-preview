/**
 * Named, first-party published offers from the supplied October 2026 research.
 * Reopened October 18, 2026. These are not industry averages or equivalent quotes.
 * Keep label, period, caveat and source beside each animated amount.
 */
export type AgencyBenchmark = {
  slug: string;
  provider: string;
  price: string;
  pricePrefix?: string;
  period: 'per month' | 'one time' | 'per word';
  fmPeriod: 'per month' | 'one time';
  label: string;
  fit: 'published-package' | 'broader-package' | 'component-only' | 'conditional-add-on';
  caveat: string;
  method?: string;
  sources: { label: string; url: string }[];
  checkedAt: string;
};

export const agencyBenchmarks: AgencyBenchmark[] = [
  {
    slug: 'social-posts',
    provider: 'High Meadow Agency',
    price: '$1,900–$3,800',
    period: 'per month',
    fmPeriod: 'per month',
    label: '20-post mixed-format production pack',
    fit: 'published-package',
    caveat:
      'Formats and unique-asset wording differ. Publishing adds $150–$400 per month per platform; third-party costs are extra. Final quote depends on scope. FM includes 20 custom posts with imagery; other scope is agreed before work.',
    method: 'One provider’s published range, not an agency-market range.',
    sources: [
      { label: 'High Meadow service prices', url: 'https://highmeadowagency.com/services' },
    ],
    checkedAt: '2026-10-18',
  },
  {
    slug: 'community-engagement',
    provider: 'Faith Wachter Consulting',
    price: '$450',
    pricePrefix: 'From',
    period: 'per month',
    fmPeriod: 'per month',
    label: '15 minutes of weekday community engagement',
    fit: 'published-package',
    caveat:
      'Three-month minimum. Includes DM/comment management and relevant-account following on Instagram, LinkedIn and Facebook. Strategic resharing is not expressly included. FM’s frequency, platforms and response windows are agreed separately.',
    method: 'Named entry offer; no full-scope community-engagement average is established.',
    sources: [{ label: 'Faith Wachter service prices', url: 'https://faithwachter.com/services/' }],
    checkedAt: '2026-10-18',
  },
  {
    slug: 'meta-ads',
    provider: 'Feedbird',
    price: '$499',
    period: 'per month',
    fmPeriod: 'per month',
    label: 'Meta ads management with performance creative',
    fit: 'published-package',
    caveat:
      'Includes a media buyer, static/video creative and weekly optimization. Cancel anytime. New Pixel/CAPI setup is a separate $249 add-on. Creative quantities and service scope differ. Ad spend is extra for both providers.',
    method: 'One published flat management fee, with media excluded.',
    sources: [
      { label: 'Feedbird Meta ads pricing', url: 'https://feedbird.com/meta-ads-management/' },
    ],
    checkedAt: '2026-10-18',
  },
  {
    slug: 'google-ads',
    provider: 'Feedbird',
    price: '$499',
    period: 'per month',
    fmPeriod: 'per month',
    label: 'Google Ads management across multiple campaign types',
    fit: 'broader-package',
    caveat:
      'Published scope includes Search, Performance Max and Shopping. Cancel anytime; new conversion tracking is separate. FM’s campaign scope is agreed before work. Ad spend is extra for both providers.',
    method: 'One published management fee; broader campaign coverage is not an identical package.',
    sources: [
      { label: 'Feedbird Google Ads pricing', url: 'https://feedbird.com/google-ads-management/' },
    ],
    checkedAt: '2026-10-18',
  },
  {
    slug: 'seo-content',
    provider: 'Express Writers',
    price: '$1,500',
    pricePrefix: 'From',
    period: 'per month',
    fmPeriod: 'per month',
    label: 'Managed content workflow, scoped individually',
    fit: 'broader-package',
    caveat:
      'A managed-plan starting price, with no fixed article count published. Individual writing is $0.30 per word; strategy and publishing are separately offered. This is not a matched SEO-content package. FM’s article volume and publishing scope still require agreement.',
    method:
      'Published managed-plan minimum; no invented four-article allowance or per-word conversion.',
    sources: [
      { label: 'Express Writers published pricing', url: 'https://shop.expresswriters.com/' },
    ],
    checkedAt: '2026-10-18',
  },
  {
    slug: 'newsletters',
    provider: 'Lotiva',
    price: '$2,000',
    period: 'per month',
    fmPeriod: 'per month',
    label: 'Four email/SMS campaigns plus one new automation',
    fit: 'broader-package',
    caveat:
      'A broader package with list-growth forms, popups and lead magnets, plus flow maintenance. Requires a 3-, 6- or 12-month contract. Platform/carrier fees are extra. FM’s campaign and growth-task counts are not yet fixed; acquisition spend is separate.',
    method: 'Named broader bundle, not an equal-volume newsletter quote.',
    sources: [
      { label: 'Lotiva email and SMS pricing', url: 'https://lotiva.com/pricing/email-sms/' },
    ],
    checkedAt: '2026-10-18',
  },
  {
    slug: 'website-support',
    provider: 'FatLab Web Support',
    price: '$199',
    period: 'per month',
    fmPeriod: 'per month',
    label: 'WordPress care with hosting and one developer hour',
    fit: 'published-package',
    caveat:
      'This published offer costs less than FM. Includes WordPress hosting, backups, security and one monthly development hour. Basic care without routine development starts at $99. FM’s platform, work allowance and third-party costs are scoped separately.',
    method: 'A lower-priced named option is retained; $400 is not a universal lowest-price claim.',
    sources: [
      {
        label: 'FatLab WordPress care pricing',
        url: 'https://fatlabwebsupport.com/services/wordpress-maintenance/',
      },
    ],
    checkedAt: '2026-10-18',
  },
  {
    slug: 'landing-page',
    provider: 'Eco York',
    price: '$500',
    pricePrefix: 'From',
    period: 'one time',
    fmPeriod: 'one time',
    label: 'Campaign landing page, plus monthly hosting',
    fit: 'published-package',
    caveat:
      'A starting build price. Monthly hosting is additional and its amount is not stated. Functionality, design complexity and section count affect the quote. FM’s $400 is a one-time service fee; hosting and other third-party costs are separate.',
    method: 'Published starting price, not an all-in project quote.',
    sources: [
      {
        label: 'Eco York landing-page pricing',
        url: 'https://www.ecoyork.com/landing-pages-design/',
      },
    ],
    checkedAt: '2026-10-18',
  },
  {
    slug: 'homepage',
    provider: 'Coxswain',
    price: '$1,995',
    period: 'one time',
    fmPeriod: 'one time',
    label: 'Homepage copy, design, mobile build and handover',
    fit: 'published-package',
    caveat:
      'Small-studio package with inquiry form, metadata and one punch-list pass. Requires supplied inputs and written scope confirmation. No required care plan; taxes and third-party costs are extra. Design and delivery scope differ from FM.',
    method: 'One named studio quote, not a representative homepage-market rate.',
    sources: [{ label: 'Coxswain website pricing', url: 'https://builtbycoxswain.com/pricing/' }],
    checkedAt: '2026-10-18',
  },
  {
    slug: 'website-page',
    provider: 'Coxswain',
    price: '$300',
    period: 'one time',
    fmPeriod: 'one time',
    label: 'Extra page added to a Coxswain website build',
    fit: 'conditional-add-on',
    caveat:
      'This add-on costs less than FM but depends on Coxswain’s $1,995 base build. It is not an unconditional quote for any existing website. Unusual integrations and larger sites need a quote; taxes and third-party costs are extra.',
    method: 'Conditional per-page add-on; no whole-site price divided by page count.',
    sources: [
      { label: 'Coxswain extra-page pricing', url: 'https://builtbycoxswain.com/pricing/' },
    ],
    checkedAt: '2026-10-18',
  },
  {
    slug: 'google-business-profile',
    provider: 'GMB Gorilla',
    price: '$500',
    period: 'one time',
    fmPeriod: 'one time',
    label: 'Business Profile setup only, per profile (1–4 profiles)',
    fit: 'component-only',
    caveat:
      'Includes profile creation, verification support and tracking parameters. GA4 setup and Google account linking are not established in this fee. No verified combined quote matches FM’s full Profile plus relevant Google/Analytics setup service. Google controls verification.',
    method: 'One separately sold component; never a synthetic combined GBP-plus-Analytics price.',
    sources: [
      {
        label: 'GMB Gorilla profile-setup pricing',
        url: 'https://gmbgorilla.com/google-my-business-setup-service/',
      },
    ],
    checkedAt: '2026-10-18',
  },
];

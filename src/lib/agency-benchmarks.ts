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
  statisticLabel: 'Comparable median' | 'Published example';
  /** Independent published offers behind the displayed amount, not all reviewed records. */
  sampleSize: number;
  method: string;
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
    method:
      'Comparable median not established. The six researched offers mix a production range, a broad bundle, templated publishing slots, graphics without copy and different post counts. The displayed range is one provider offer, so sample size is 1.',
    sources: [
      {
        label: 'High Meadow service prices',
        url: 'https://highmeadowagency.com/services',
      },
    ],
    checkedAt: '2026-10-18',
    statisticLabel: 'Published example',
    sampleSize: 1,
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
    method:
      'Comparable median not established. Five researched offers mix standalone engagement and bundles; none establishes the complete combination of replies, proactive relationship-building comments and strategic shares. The displayed price is one named offer, so sample size is 1.',
    sources: [
      {
        label: 'Faith Wachter service prices',
        url: 'https://faithwachter.com/services/',
      },
    ],
    checkedAt: '2026-10-18',
    statisticLabel: 'Published example',
    sampleSize: 1,
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
    method:
      'Comparable median not established. Only two researched providers combine rolling-monthly terms with explicit ongoing creative testing. A three-provider median would require mixed contract terms and an assumed media budget. The displayed flat fee is one offer, so sample size is 1.',
    sources: [
      {
        label: 'Feedbird Meta ads pricing',
        url: 'https://feedbird.com/meta-ads-management/',
      },
    ],
    checkedAt: '2026-10-18',
    statisticLabel: 'Published example',
    sampleSize: 1,
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
    method:
      'Comparable median not established. Only two researched providers support rolling-monthly search management with testing. The four-provider calculation assumes $4,000 media spend and mixes initial commitments and setup costs. The displayed flat fee is one offer, so sample size is 1.',
    sources: [
      {
        label: 'Feedbird Google Ads pricing',
        url: 'https://feedbird.com/google-ads-management/',
      },
    ],
    checkedAt: '2026-10-18',
    statisticLabel: 'Published example',
    sampleSize: 1,
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
      'Comparable median not established. Five researched providers use per-word rates, minimum word orders, short-blog prices or retainers without fixed counts; full human-written SEO and publishing scopes do not match. No FM article quantity is assumed. The displayed minimum is one offer, so sample size is 1.',
    sources: [
      {
        label: 'Express Writers published pricing',
        url: 'https://shop.expresswriters.com/',
      },
    ],
    checkedAt: '2026-10-18',
    statisticLabel: 'Published example',
    sampleSize: 1,
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
    method:
      'Comparable median not established. The six researched offers have different campaign counts and acquisition scope, and one has conflicting prices. Only Lotiva clearly includes implemented list-growth work. No FM campaign count is assumed. The displayed bundle is one offer, so sample size is 1.',
    sources: [
      {
        label: 'Lotiva email and SMS pricing',
        url: 'https://lotiva.com/pricing/email-sms/',
      },
    ],
    checkedAt: '2026-10-18',
    statisticLabel: 'Published example',
    sampleSize: 1,
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
    method:
      'Comparable median not established. Nine researched records cover five providers with different platforms, hosting, update schedules and edit/development allowances. Multiple tiers from one provider are not independent observations. The displayed lower-priced plan is one offer, so sample size is 1.',
    sources: [
      {
        label: 'FatLab WordPress care pricing',
        url: 'https://fatlabwebsupport.com/services/wordpress-maintenance/',
      },
    ],
    checkedAt: '2026-10-18',
    statisticLabel: 'Published example',
    sampleSize: 1,
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
    method:
      'Comparable median not established. Seven researched offers mix template and custom builds, starting prices and conditional repeat-page add-ons. Copy, hosting and tracking inclusions differ. The displayed starting price is one offer, so sample size is 1.',
    sources: [
      {
        label: 'Eco York landing-page pricing',
        url: 'https://www.ecoyork.com/landing-pages-design/',
      },
    ],
    checkedAt: '2026-10-18',
    statisticLabel: 'Published example',
    sampleSize: 1,
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
    method:
      'Comparable median not established. Only two independently priced US-supported studio homepage builds remain after exclusions, below the minimum sample of three; copy and delivery scope also differ. The displayed price is one studio offer, so sample size is 1.',
    sources: [
      {
        label: 'Coxswain website pricing',
        url: 'https://builtbycoxswain.com/pricing/',
      },
    ],
    checkedAt: '2026-10-18',
    statisticLabel: 'Published example',
    sampleSize: 1,
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
    method:
      'Comparable median not established. Three core providers publish page add-ons tied to different base builds or paid plans; some prices are ceilings. They do not establish comparable work on any existing website. The displayed lower-priced add-on is one offer, so sample size is 1.',
    sources: [
      {
        label: 'Coxswain extra-page pricing',
        url: 'https://builtbycoxswain.com/pricing/',
      },
    ],
    checkedAt: '2026-10-18',
    statisticLabel: 'Published example',
    sampleSize: 1,
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
    method:
      'Comparable median not established. All 21 researched records price separate GBP or GA4 components, volume tiers, or unverified offers. No verified combined package covers the full FM service; component prices are not added together. The displayed GBP component is one offer, so sample size is 1.',
    sources: [
      {
        label: 'GMB Gorilla profile-setup pricing',
        url: 'https://gmbgorilla.com/google-my-business-setup-service/',
      },
    ],
    checkedAt: '2026-10-18',
    statisticLabel: 'Published example',
    sampleSize: 1,
  },
];

import research from './agency-range-model.json';

/**
 * October 18, 2026: same modeled scope/hours, SMB and enterprise base sell rates.
 * Original dataset: libfile_6ea13633c0c081918e4d1de2c1915358.
 * Supporting report: libfile_872c64272f4c8191ba8814f009fe8b4d.
 * These are rounded standalone BASE endpoints, not low/high scenario bounds.
 * Research assumptions are comparison scenarios, not approved FM contract caps.
 */
export type AgencyBenchmark = {
  slug: string;
  status: 'estimate' | 'pending';
  price: string;
  period: 'per month' | 'one time' | '';
  fmPeriod: 'per month' | 'one time';
  tooltipSummary: string;
  checkedAt: string;
  sources: { name: string; url: string }[];
  assumptions: string;
  confidence: string;
  sourceKey: string;
  title: string;
  smbBase: number;
  enterpriseBase: number;
  modelScope: string;
  scenarioLabel?: string;
  onboardingPrice?: string;
};

type Scope = {
  sourceKey: string;
  slug: string;
  modelScope: string;
  scenarioLabel?: string;
};

const scopes: Scope[] = [
  {
    sourceKey: 'social',
    slug: 'social-posts',
    modelScope:
      '20 original concepts across up to two networks: approximately 16 single-image posts and four simple carousels, including planning, copy, design, scheduling, accessibility, QA and reporting.',
  },
  {
    sourceKey: 'community',
    slug: 'community-engagement',
    modelScope:
      '20 business days of scheduled human coverage, up to 100 routine inbound reply actions, 60 proactive comments and four partner shares, with escalation rules; no immediate-response or 24/7 moderation promise.',
  },
  {
    sourceKey: 'meta',
    slug: 'meta-ads',
    modelScope:
      'One Meta Ads account, up to three campaigns and six ad sets, four simple creative variants, optimization, test interpretation and reporting; video production and landing-page development are separate.',
  },
  {
    sourceKey: 'google',
    slug: 'google-ads',
    modelScope:
      'One Google Search Ads account, up to three campaigns and 15 ad groups, four copy/asset variants, optimization and reporting; Shopping, Performance Max, feed work and new markets are separate.',
  },
  {
    sourceKey: 'seo_2',
    slug: 'seo-content',
    modelScope:
      'Two 900–1,200-word human-researched and human-written articles per month, with metadata, tagging, links, sourced imagery, publishing, QA, shared content planning and reporting.',
    scenarioLabel: 'Comparison scenario: 2 articles/month',
  },
  {
    sourceKey: 'email_2',
    slug: 'newsletters',
    modelScope:
      'Two 400–700-word templated newsletter issues per month plus active list-acquisition experiments/signup improvements, list hygiene and analysis; new lead magnets, bespoke acquisition pages and complex nurture programs are separately scoped.',
    scenarioLabel: 'Comparison scenario: 2 issues/month + list building',
  },
  {
    sourceKey: 'maintenance',
    slug: 'website-support',
    modelScope:
      'Approximately 30 daily human website checks per month, proactive updates, QA, detailed reporting and four routine support hours; urgent incidents outside that allowance require additional scope.',
    scenarioLabel: 'Comparison scenario: daily checks + 4 routine support hours/month',
  },
  {
    sourceKey: 'landing_page',
    slug: 'landing-page',
    modelScope:
      'One complete 6–8-section responsive page on a functioning site stack, including copy, design, build, one standard form, a conversion event, metadata, review rounds and QA.',
  },
  {
    sourceKey: 'homepage',
    slug: 'homepage',
    modelScope:
      'One 7–9-section small-business homepage with responsive header/footer, copy, design, CMS implementation, review rounds and QA; not a complete website or brand transformation.',
  },
  {
    sourceKey: 'additional_page',
    slug: 'website-page',
    modelScope:
      'One 3–5-section page within an existing design system, including copy, build and QA; the richness of the content affects actual effort.',
  },
  {
    sourceKey: 'gbp_analytics_setup',
    slug: 'google-business-profile',
    modelScope:
      'One-location Google Business Profile plus ordinary GA4 installation and QA, up to three simple key events and relevant account links; ownership disputes, complex ecommerce/server-side integrations and guaranteed Google verification are excluded.',
  },
];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const comparisonTooltip = 'Estimated from industry standard cost projection methods 2026.';
export const comparisonQualification =
  'Modeled comparable-service SMB-to-enterprise fees; actual quotes vary.';

export const agencyBenchmarks: AgencyBenchmark[] = scopes.map((scope): AgencyBenchmark => {
  const row = research.services.find((item) => item.id === scope.sourceKey);
  if (!row) throw new Error(`Missing comparison research for ${scope.sourceKey}`);
  const fmPeriod = row.cadence === 'monthly' ? 'per month' : 'one time';
  const smbBase = row.smb.standalone.rounded_catalog_fee_usd.base;
  const enterpriseBase = row.enterprise.standalone.rounded_catalog_fee_usd.base;
  const smbOnboarding = row.smb.onboarding_standalone?.rounded_catalog_fee_usd.base;
  const enterpriseOnboarding = row.enterprise.onboarding_standalone?.rounded_catalog_fee_usd.base;

  return {
    ...scope,
    title: row.title,
    status: 'estimate',
    price: `${currency.format(smbBase)}\u2013${currency.format(enterpriseBase)}+`,
    period: fmPeriod,
    fmPeriod,
    smbBase,
    enterpriseBase,
    tooltipSummary: comparisonTooltip,
    checkedAt: research.as_of,
    sources: research.sources.map((source) => ({ name: source.finding, url: source.url })),
    assumptions: scope.modelScope,
    confidence: 'Modeled planning comparison; not an empirical confidence interval.',
    onboardingPrice:
      smbOnboarding !== undefined && enterpriseOnboarding !== undefined
        ? `${currency.format(smbOnboarding)}\u2013${currency.format(enterpriseOnboarding)}`
        : undefined,
  };
});

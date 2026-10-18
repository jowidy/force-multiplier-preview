import research from './agency-estimates-research.json';

/**
 * October 18, 2026 scope-based estimates, not measured market averages.
 * Original dataset: libfile_b9206a7534dc8191b804170356ac696e.
 * Supporting research: libfile_296f5b9d0fc48191b52c8df66c5d4e97.
 * Preserve the imported dataset; modeled agency workloads are not approved FM caps.
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
};

const slugs: Record<string, string> = {
  social_posts: 'social-posts',
  community_engagement: 'community-engagement',
  meta_ads: 'meta-ads',
  google_ads: 'google-ads',
  seo_content: 'seo-content',
  newsletter_growth: 'newsletters',
  website_support: 'website-support',
  landing_page: 'landing-page',
  homepage: 'homepage',
  additional_page: 'website-page',
  google_setup: 'google-business-profile',
};

const pending: Record<string, string> = {
  seo_content:
    'Monthly agency cost depends on the agreed article count, length and publishing scope.',
  newsletter_growth:
    'Monthly agency cost depends on newsletter frequency and the agreed list-growth work.',
  website_support:
    'Monthly agency cost depends on the agreed proactive support and reporting workload.',
};

const summaries: Record<string, string> = {
  social_posts:
    'Estimated $2,000/month for 20 branded posts, informed by Lotiva, The Hood Collective and agency effort.',
  community_engagement:
    'Estimated $1,500/month for active engagement, informed by agency effort, The Hood Collective and Sprout Social’s historical survey.',
  meta_ads:
    'Estimated $1,500/month for Meta optimization and testing, informed by GrossiWeb and Lotiva; ad spend is separate.',
  google_ads:
    'Estimated $1,500/month for Google Ads optimization and testing, informed by WebFX and Lotiva; ad spend is separate.',
  landing_page:
    'Estimated $3,000 for a complete landing page, informed by WebFX, Raised Media and the copy, build and revision scope.',
  homepage:
    'Estimated $2,500 for a homepage, informed by Organiq Media’s one-page pricing and agency effort.',
  additional_page:
    'Estimated $500 for a standard additional page, informed by Organiq Media and Web Design Miami Company.',
  google_setup:
    'Estimated $1,500 for GBP and standard GA4 setup, informed by GMB Gorilla and Eleventh Peak Digital.',
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export const agencyBenchmarks: AgencyBenchmark[] = research.rows.map((row): AgencyBenchmark => {
  const fmPeriod = ['month', 'article'].includes(row.unit) ? 'per month' : 'one time';
  const isPending = Object.hasOwn(pending, row.id);
  return {
    slug: slugs[row.id],
    status: isPending ? 'pending' : 'estimate',
    price: isPending ? 'Scope pending' : currency.format(row.central_estimate),
    period: isPending ? '' : fmPeriod,
    fmPeriod,
    tooltipSummary: isPending ? pending[row.id] : summaries[row.id],
    checkedAt: research.researched_at,
    sources: row.sources,
    assumptions: row.assumptions,
    confidence: row.confidence,
  };
});

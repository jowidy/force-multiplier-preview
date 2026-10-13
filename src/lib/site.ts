export const site = {
  name: 'Force Multiplier',
  domain: 'https://www.forcemultiplier.work',
  email: 'contact@forcemultiplier.work',
  phone: '+13183766914',
  displayPhone: '(318) 376-6914',
  address: '1220 N 18th St, Suite 200, Monroe, LA 71201',
};

export const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const href = (path = '/') =>
  `${base}/${path.replace(/^\/+|\/+$/g, '')}${path === '/' ? '' : '/'}`;
export const asset = (path: string) => `${base}/${path.replace(/^\/+/, '')}`;
export const canonical = (path = '/') =>
  `${site.domain}${path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`}`;
export const nav = [
  ['Services', '/services'],
  ['Work', '/case-studies'],
  ['Insights', '/insights'],
  ['About', '/about'],
] as const;
export const serviceGroups = [
  {
    title: 'Get found.',
    detail: 'Local search + Google Ads',
    text: 'Help the right customers find your business and understand what to do next.',
    path: '/seo-google-ads-local-business',
  },
  {
    title: 'Make your offer clear.',
    detail: 'Websites + messaging',
    text: 'Turn what you know about your work into a website your customers can use.',
    path: '/websites-and-messaging',
  },
  {
    title: 'Keep the work moving.',
    detail: 'Marketing operations + automation',
    text: 'Make the handoffs, tools and follow-up behind your marketing work together.',
    path: '/marketing-operations-consulting',
  },
  {
    title: 'Choose a useful direction.',
    detail: 'Strategy + delivery support',
    text: 'Build a practical plan around the decision, launch or next stage in front of you.',
    path: '/go-to-market-strategy',
  },
];

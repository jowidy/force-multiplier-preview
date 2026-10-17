import { getCollection } from 'astro:content';
import { canonical, isProduction } from '../lib/site';
import { services } from '../lib/service-catalog';

export async function GET() {
  const entries = await getCollection('entries', ({ data }) => !data.draft);
  const paths = isProduction
    ? [
        '/',
        '/services',
        '/case-studies',
        '/insights',
        '/about',
        '/contact',
        '/privacy',
        ...services.map((service) => `/services/${service.slug}`),
        ...entries.map(({ data }) => data.path),
      ]
    : [];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...new Set(paths)].map((path) => `<url><loc>${canonical(path)}</loc></url>`).join('')}</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}

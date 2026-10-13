import { isProduction, site } from '../lib/site';

export function GET() {
  return new Response(
    `User-agent: *\nAllow: /\n${isProduction ? `Sitemap: ${site.domain}/sitemap.xml\n` : ''}`,
    { headers: { 'Content-Type': 'text/plain' } },
  );
}

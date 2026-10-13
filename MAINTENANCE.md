# Force Multiplier website

A bespoke Astro site with structured Markdown content. GitHub Pages hosts the presentation preview. Production migration is a separate, user-reviewed step.

## Development

Use Node 24 and pnpm 11.25.0. Run `pnpm install --frozen-lockfile`, then `pnpm dev`. The local path includes `/force-multiplier-preview/` to exercise the same routing as GitHub Pages.

Before publication, run `pnpm check`, `pnpm build` and `pnpm test:output`. Review the rendered pages on mobile and desktop. Pushes to `codex/site-preview` run the same checks and deploy the built output to GitHub Pages.

## Content

Edit `src/content/entries/*.md`. Each entry has a title, description, lead, stable path, kind, category, order, source URL, draft flag and related paths. The schema is in `src/content.config.ts`. Draft entries are excluded from all site collections and generated pages. Do not link published content to draft paths.

Preserve evidence qualifications. Do not turn estimates into achieved savings, implementations into measured business outcomes, or multiple interventions into separate clients. New client names, testimonials and artifacts require verified permission and evidence.

Use supplied brand assets and licensed fonts. Public asset provenance is in `public/asset-provenance.json`; the Poppins license ships in `public/fonts/OFL.txt`. No external Squarespace image dependencies are required by the built site.

## Preview contact behavior

GitHub Pages cannot receive the form as an application backend. The contact page validates entered fields and opens an email draft, or prepares text for copying. It does not send or store an inquiry. The interface explains this before the action and in its recovery states.

All preview HTML is `noindex, nofollow`. This is an indexing instruction, not privacy protection. Publish only material suitable for public access. No analytics or advertising scripts run in this preview.

## Production build targets

The approved visual preview stays on `codex/site-preview`. Production preparation is on `codex/production-migration`; pushing that branch runs verification without deploying to GitHub Pages.

`PUBLIC_SITE_TARGET` has three allowed values. Unknown values fail the build:

| Target              | Base path                    | Contact              | Indexing                                              |
| ------------------- | ---------------------------- | -------------------- | ----------------------------------------------------- |
| `preview` (default) | `/force-multiplier-preview/` | Email draft and copy | All pages noindex                                     |
| `staging`           | `/`                          | Netlify Forms        | All pages noindex; empty sitemap                      |
| `production`        | `/`                          | Netlify Forms        | Content indexable; 404, aliases and thank-you noindex |

Run `pnpm build:staging` or `pnpm build:production` to build and verify the corresponding output. These commands do not publish. `pnpm build` and `pnpm test:output` retain the default preview behavior. The last build replaces `dist`; always build the intended target immediately before a manual deployment.

Netlify reads `netlify.toml`. Its first deployment deliberately uses `staging`. Once the host, form and domain checks below pass, change the production build target in that file to `production`. Deploy-preview and branch-deploy contexts stay `staging`. Do not assume a dashboard variable overrides a value in the committed configuration.

Netlify forms require form detection enabled before deploying. The static HTML declares the `inquiry` form with a honeypot. Configure retained submissions and an email notification to the verified business destination. The contact page sends a named, URL-encoded POST; it preserves text on an unconfirmed result. The form must also work with JavaScript disabled. A thank-you page view alone does not establish delivery.

The five retired paths have forced 301 rules. Active pages use directory output with trailing-slash canonical URLs; Netlify normalizes the old slashless paths. Do not add a site-wide rewrite to the homepage or a redirect affecting POST targets. Keep a real unknown-route 404.

## Before domain cutover

After review, configure the selected production host and verified form destination. Replace preview email composition only when real submission retention, notification receipt, reply-to behavior and error states have been tested. Update the privacy text to match the configured services.

Test both the host-provided staging address and the primary domain. Verify the root base path, social image, canonical URLs, sitemap and indexing policy from deployed HTML. Verify permanent redirects, query-string preservation, no-JavaScript POST, and retained submission plus actual mailbox notification and reply-to. GitHub preview alias pages are not HTTP 301 redirects.

Preserve existing email and domain records. Record the exact old web-routing values and keep the Squarespace service available through stabilization. Verify HTTPS, routes, form receipt, analytics and email before any subscription cancellation. This repository does not automatically change production DNS or billing.

## Production analytics

Only production HTML includes the analytics choice notice and footer settings control. Preview and staging output contain no analytics loader or consent interface. The website and inquiry form work without analytics, including when JavaScript is disabled.

The existing Google Tag Manager container is `GTM-MNZSRTLV`, with Google Analytics 4 tag `G-V06S26HMNK`. The authenticated container review found the Google tag and `contact_click` and `service_cta_click` tags. Production loads the container only after an explicit acceptance, or a saved acceptance from an earlier page. There is no noscript tracker. The site's loader adds only GTM's initialization event; it does not send inquiry values or add lead events. Container configuration can change independently of this repository, so review published tags before changing tracking behavior.

Google Analytics measures website use, including page views, navigation and configured link interactions, using cookies and technical information such as referral sources, browser and device details. The verified GA4 stream also enables enhanced measurement for scrolls, outbound clicks, site search, video engagement, file downloads and form interactions. An automatic `form_submit` event is not proof of retained inquiry delivery or a verified conversion. The production privacy page describes website-use and form-interaction analytics and links to [Google’s privacy policy](https://policies.google.com/privacy). This documentation describes the implementation; it makes no legal compliance claim.

The local-storage key `fm-analytics-choice` stores only `yes` or `no`. Both notice choices have equal visual treatment. Analytics settings in the footer reopens the notice. Declining after analytics has loaded saves `no` and reloads the page to stop the loaded code. An accepted page also checks for a later saved decline on a cross-tab storage event and when restored from the browser's back/forward cache. It does not delete historical analytics data or remove existing Google Analytics cookies.

Storage access is guarded. If storage is unavailable, the choice remains in memory for the current page and the interface explains that it may need repeating on another page or visit. When a decline cannot be saved after analytics has already loaded, the reload carries a single deny-only `fm_analytics=no` URL parameter. The next page consumes and removes that parameter before reading stored consent, so an old saved `yes` cannot restart analytics on that reload. A blocked URL cleanup retains the deny-only parameter. No inquiry content is put into storage or the URL.

Run `pnpm test` for the consent state, storage failure and loader checks. The output verifier checks that the consent runtime and fixed container occur only in production, with no eager Google script or iframe. Verify the deployed production behavior and existing click events after consent before treating analytics carryover as confirmed; generated HTML alone does not prove receipt in Google Analytics.

## Repository boundary

Only the site, public assets, dependency lockfile and build/release configuration belong in this public repository. Original site captures, competitor audit material, internal notes, local QA dependencies and secrets are excluded. Review staged paths before every publication.

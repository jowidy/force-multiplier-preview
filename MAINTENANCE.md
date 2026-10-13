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

The current build does not install analytics or advertising scripts. Reconcile the existing site's tracking container, account access, event behavior and visitor privacy choices before adding tracking. Missing tracking verification is an open migration item.

## Repository boundary

Only the site, public assets, dependency lockfile and build/release configuration belong in this public repository. Original site captures, competitor audit material, internal notes, local QA dependencies and secrets are excluded. Review staged paths before every publication.

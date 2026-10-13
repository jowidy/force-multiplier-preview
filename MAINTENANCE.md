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

## Before production migration

After review, configure the selected production host and verified form destination. Replace preview email composition only when real submission retention, notification receipt, reply-to behavior and error states have been tested. Update the privacy text to match the configured services.

Change Astro site/base configuration, social metadata and canonical behavior deliberately. Enable the production sitemap and appropriate indexing. Implement the route map's consolidated paths as permanent HTTP redirects on the production host. GitHub preview alias pages are not HTTP 301 redirects.

Preserve existing email and domain records. Record the exact old web-routing values and keep the Squarespace service available through stabilization. Verify HTTPS, routes, form receipt, analytics and email before any subscription cancellation. This repository does not automatically change production DNS or billing.

## Repository boundary

Only the site, public assets, dependency lockfile and build/release configuration belong in this public repository. Original site captures, competitor audit material, internal notes, local QA dependencies and secrets are excluded. Review staged paths before every publication.

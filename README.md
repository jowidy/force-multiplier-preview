# Force Multiplier

The bespoke Force Multiplier website, built with Astro and portable structured content.

[Open the website review preview](https://jowidy.github.io/force-multiplier-preview/)

## Included

- Responsive homepage, services, work, insights, About, Contact and privacy pages.
- Six case studies, four practical guides and eight service or specialist landing pages.
- Authentic brand assets, local Poppins fonts, John Dye's existing public portrait and a Force Multiplier workspace photograph.
- Original editorial illustrations, illustrated case covers and a blue, gold and coral visual system.
- Eleven $400 service landing pages, a catalog, and safely testable on-page inquiry summaries.
- Accessible navigation, sourced price examples and a reduced-motion-friendly price reveal.
- Automated static-output checks and GitHub Pages deployment.
- Separate staging and production targets with Netlify form markup, redirects and indexing checks.

## Local development

Use Node 24 and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:4321/force-multiplier-preview/`.

```sh
pnpm check
pnpm build
pnpm test:output
node scripts/verify-service-review.mjs
```

See [MAINTENANCE.md](MAINTENANCE.md) for content editing, review, contact behavior and the production migration boundary.

This repository publishes a review version. The production domain and Squarespace site are not modified by its deployment workflow.

The October 19 review adds seven separately contracted month-to-month services and four one-time projects. Only the 20-post monthly quantity is approved; other scope decisions are visibly flagged. Preview forms send nothing, store nothing and cannot charge or book work. Media, software, hosting, domains and other third-party costs are separate. The current review branch continues the existing visual design; production readiness is not implied by a passing preview build.

Production preparation is on `codex/production-migration`. It does not replace the approved GitHub preview. `pnpm build:staging` and `pnpm build:production` build and verify the respective target locally; hosting access, real form delivery and domain checks are required before cutover.

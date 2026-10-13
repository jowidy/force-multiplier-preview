# Force Multiplier

The bespoke Force Multiplier website, built with Astro and portable structured content.

[Open the website review preview](https://jowidy.github.io/force-multiplier-preview/)

## Included

- Responsive homepage, services, work, insights, About, Contact and privacy pages.
- Six case studies, four practical guides and eight service or specialist landing pages.
- Authentic brand assets, local Poppins fonts and John Dye's existing public portrait.
- Accessible navigation, email-draft preparation and copy recovery.
- Automated static-output checks and GitHub Pages deployment.

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
```

See [MAINTENANCE.md](MAINTENANCE.md) for content editing, review, contact behavior and the production migration boundary.

This repository publishes a review version. The production domain and Squarespace site are not modified by its deployment workflow.

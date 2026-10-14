# Bright Side

A mobile-first, device-local good news demo built from [plan.md](plan.md). Discover a story, swipe left to skip or right to save, tap to read, and revisit your collection.

**All 24 stories are fictional demos.** They are not real news, clinical results, or verified achievements. Stock photographs illustrate themes; they do not depict the imagined events. There are no accounts, backend, ingestion service, or notification subscriptions. Saves and preferences remain in this browser on this device.

## Run locally

Tested on Windows with **Node 24.13.1, npm 11.8.0**. `.nvmrc` pins that Node release. Vite's installed engine requirement is `^20.19.0 || >=22.12.0`; the complete stack was tested with Node 24. Dependencies are pinned, with one npm lockfile.

```sh
npm ci
npm run dev
```

Open the URL Vite prints, normally **http://127.0.0.1:5173** or **http://localhost:5173**. The app is local-only; nothing has been deployed. The scripts use Vite's runner configuration loader to avoid Windows native-module config bundling issues.

For a phone on the same trusted network:

```sh
npm run dev -- --host 0.0.0.0
```

Use Vite's printed LAN URL. Windows Firewall may need to permit Node on the private network. Localhost sharing links work on the development computer; they are not public article URLs. HTTP LAN preview is not HTTPS/PWA installability. PWA work remains phase 6.

## Check and build

```sh
npm run typecheck
npm run lint
npm run test
npm run build
npm run preview
```

Browser tests use Playwright, **the installed Google Chrome** for the Chromium project, and Playwright WebKit. System Chrome was used for the full suite. Install Chrome if absent and the WebKit binary before running:

```sh
npx playwright install webkit
npm run test:e2e
```

The test configuration starts Vite if needed and reuses a server already running on port 5173. `npm run test:e2e -- --project=chromium` runs only Chrome. CDP touch synthesis is Chrome-specific; its WebKit counterpart is intentionally skipped. WebKit's default tab behavior skips native links; its skip-link test explicitly focuses the link and activates it, while the Chrome test checks tab order.

`npm run format` uses the single Prettier configuration. `scripts/visual-review.mjs` captures the five requested viewport sizes and light/dark screens to `.impeccable/review/`; it needs the development server. `scripts/map-smoke.mjs` checks real demo tiles separately from deterministic provider-failure tests.

## What works

- Deterministic 12-story deck, swipe thresholds and flicks, visible Skip/Save buttons, keyboard alternatives, exact Undo, calm exhaustion and explicit new batches.
- Immediate, idempotent saving, including navigation during exit animation. Versioned runtime-validated localStorage; malformed or unavailable storage falls back to usable in-memory state with a message.
- Article details, full titles/body, demo notices, date/source/location/image credit, related stories, origin-aware Back, native share and copy/selectable URL fallback.
- Discover search and topics combine with AND semantics. URL filters survive article navigation. Lazy MapLibre map with grouped coordinates/clusters, location sheet, Map/List alternatives, failure recovery through the list.
- Newest-first saved stories and automatic multi-topic collections. Unsave offers six-second Undo restoring its original timestamp.
- Preferred topics for explicit new batches, light/dark/system appearance with light as the default, a header sun/moon toggle, OS and user reduced motion, and confirmed local-data reset.
- Mobile safe areas, responsive grids, centered desktop deck, reserved bottom navigation space, keyboard focus, focus-trapped dialogs with opener restoration, unknown-route and story states.

## Routes and source

`/`, `/discover`, `/discover/map`, `/saved`, `/saved/topic/:topicId`, `/profile`, `/story/:storyId`.

`src/app` owns routing and navigation; `features` owns each experience; `state` owns shared reducer/persistence semantics; `lib` holds schema validation, storage, and the replaceable `StoryRepository`; `components/ui` holds customized shadcn-style Radix primitives; `styles` holds light/dark semantic tokens. `src/data/stories.json` is local content. `generate-data.mjs` reproducibly creates the demo dataset; run Prettier afterward if regenerating it.

Future static SPA hosting must rewrite unknown application routes to `/index.html` while serving existing assets normally. Deployment is a separate owner-authorized step.

## Maps, assets, and design skills

Development uses MapLibre demo tiles. A production provider account, plan, cost, allowed-origin restrictions, and traffic quotas must be selected before deployment. Optional `VITE_MAPTILER_KEY` is a **public browser key**; `.env.example` documents it. See [map provider decision](docs/MAP_PROVIDER.md) and [asset credits](docs/ASSET_CREDITS.md). No runtime image or font downloads are required.

Taste `high-end-visual-design` is installed at `.agents/skills/high-end-visual-design`; `skills-lock.json` records source `Leonxlnx/taste-skill`, path `skills/soft-skill/SKILL.md`, hash `f730e4132775f13eea19e3dc39afc6bb453cfc0498872b127ad8f0d47cfd802d`. Impeccable **4.5.2** is installed project-locally at `.agents/skills/impeccable`, without automatic hooks. Both SKILL.md files were read and installation verified. Impeccable context, craft guidance, hardening/polish guidance, and one detector scan were applied. Product requirements override conflicting skill aesthetics. Reload Codex to expose newly installed project skills in its picker.

The four plan reference screenshots were absent. [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md), and [PROGRESS.md](PROGRESS.md) preserve the written decisions and next steps. The brief supplied enough product/layout authority to continue without an additional concept-selection gate.

## Validation and remaining limits

Final checks: build, typecheck, and lint pass; **12 unit/integration tests** pass. Browser results are recorded in [PROGRESS.md](PROGRESS.md). Unit/integration coverage includes reducer idempotence and final-card Undo, batch semantics, prior save membership, invalid/unavailable storage, stale IDs, data validity, AND filtering, geographic grouping, map cleanup and effective motion override, and a working UI under quota failure. Browser coverage includes buttons/swipes/tap suppression, reload, article Back, filters, collections, preferences/reset, keyboard, reduced motion, dialog focus, sharing fallback/cancellation, and synthesized Chrome touch/cancel.

Screens inspected at **320×568, 390, 430, 768, and 1440px**. Physical iOS/Android gesture tuning and a manual screen-reader audit remain outstanding. No sustained 60fps measurement is claimed. Map availability depends on provider/network/WebGL; list browsing works without it. MapTiler production quota/cost selection remains deferred. Contributor names for stock photos have not been independently verified; source identifiers and licenses are recorded. Missing-image stories intentionally use a designed fallback.

The build emits a large-chunk warning: the app bundle is approximately 193KB gzipped, with MapLibre separately lazy-loaded at approximately 280KB gzipped plus its worker. Map code is not loaded on Home. This is a performance limit to revisit before production, not a failed build.

PWA/offline caching, verified live news, custom collections, authentication, synchronization, and translation are deliberately deferred to an owner-approved extension.

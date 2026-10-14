# Bright Side — Mobile-First Good News App

## 1. Instructions for the VS Code coding agent

Build a polished, mobile-first web application for discovering credible, hopeful news. Read this entire plan before implementing. Treat it as the product and design contract. Bright Side is a working name, not a finalized brand.

- Implement phases in order. Finish and verify the current phase before advancing; continue automatically unless the owner requests a pause.
- Maintain `PROGRESS.md` with completed work, validation results, decisions, and the next task so development can resume in a new session.
- Preserve existing files. Inspect the repository before scaffolding; never overwrite this plan or project instructions.
- Use the approved visual references and requirements ahead of aesthetic defaults from external skills.
- Build real navigation and interactions. Do not leave dead buttons, placeholder handlers, invented account behavior, or unfinished implementation comments.
- Keep code modular, typed, and understandable. Avoid adding libraries when an existing dependency or a small function solves the problem.
- At the end of each phase, report what works, how to preview it, checks completed, and any remaining limitation.
- Do not deploy or publish automatically. Local development and preview are the initial scope.

## 2. Product purpose and principles

People often encounter overwhelming news. This app offers an intentional space to discover progress, kindness, scientific advances, environmental improvements, and community achievements. Its goal is to help people feel informed and hopeful about the world.

Core experience: discover a story → swipe to skip or save → tap to read → revisit saved stories.

Principles:

1. Hopeful and accurate: preserve uncertainty, dates, and context; never turn early research into a proven breakthrough.
2. Calm and intentional: avoid streaks, urgency, autoplay, or rewards for excessive consumption.
3. Credible and transparent: expose source, date, image credit, and demo status.
4. Mobile first: design for touch, short screens, readable text, and thumb reach.
5. Accessible alternatives: every gesture has an equivalent visible control.
6. Immediate saving: never interrupt a swipe with a collection-selection dialog.

## 3. Scope and assumptions

### Initial MVP: phases 1–5

- Four sections: Home, Discover, Saved, Profile.
- Vertical stacked-card discovery, Skip, Save, Undo, and article details.
- Discover search, topics, interactive world map, and list alternative.
- Saved stories and automatic topic collections.
- Device-local preferences and saved state without login.
- 24 fictional, clearly labeled demo stories with locally available images.
- English UI and content initially, with copy organized for later translation.
- Responsive phone, tablet, and desktop layouts.

### Later: phase 6 and beyond

- Installable PWA and deliberate offline support.
- Verified real content and content-management workflow.
- Custom collections, account login, cross-device sync, and additional languages.
- Notifications only if explicitly added to the product requirements.

Do not invent a news API, scrape publishers, implement a backend, or add authentication to the MVP. Keep the data-access interface replaceable for later content integration.

## 4. Technical foundation

| Area | Decision |
|---|---|
| Application | React + TypeScript with Vite |
| Routing | React Router in declarative SPA mode |
| Styling | Tailwind CSS with semantic CSS variables |
| UI foundations | shadcn/ui, customized to the visual contract |
| Icons | Lucide React, consistent stroke weight |
| Gestures and motion | Motion for React; imports from `motion/react` |
| Map | MapLibre GL JS, lazy-loaded |
| App state | React Context + reducer; local component state for transient UI |
| Persistence | Versioned localStorage adapter with runtime validation |
| Validation | Zod for story and persisted-state schemas |
| Tests | Vitest + React Testing Library; Playwright for core browser flows |
| PWA, later | Evaluate current `vite-plugin-pwa` documentation in phase 6 |
| Package manager | npm and one committed `package-lock.json` |

Use a currently supported Node LTS release compatible with all dependencies. Node 22.12+ meets the Vite requirement checked during planning, but verify package engine requirements at setup time. Record the exact tested Node and npm versions in README and the chosen Node version in `.nvmrc`.

Use stable releases, inspect peer dependencies, and commit resolved versions. Do not blindly upgrade packages during subsequent phases. Do not mix Tailwind major-version installation instructions, obsolete Framer Motion imports, or React Router framework-mode setup with this SPA.

### Initial scaffolding

For a new parent folder with no existing app:

```bash
npm create vite@latest bright-side -- --template react-ts
cd bright-side
npm install
npm install react-router motion lucide-react maplibre-gl zod
```

Move this plan into the app root if it is outside it. For an existing repository, adapt the setup rather than nesting another app without reason.

Then follow the current official Tailwind Vite integration and shadcn Vite instructions. Configure the `@/` alias consistently in Vite and TypeScript. Add only UI components actually needed: Button, Dialog, Sheet, Input, Switch, Select, and related accessible primitives. Choose one supported shadcn primitive foundation and keep it consistent.

Required scripts: `dev`, `build`, `preview`, `lint`, `typecheck`, `test`, and `test:e2e`. Keep the scaffold's build-time TypeScript checks. Add testing dependencies when implementing the meaningful tests described below.

```bash
npm run dev
```

Use the URL printed by Vite, normally `http://localhost:5173`. For a phone on the same trusted network, use `npm run dev -- --host 0.0.0.0` and the printed LAN URL. Explain any local firewall requirement. Installability and service workers must later be tested through HTTPS or localhost; an ordinary HTTP LAN URL is not equivalent.

Recommended VS Code extensions: the chosen AI coding agent, ESLint, and Tailwind CSS IntelliSense. Add Prettier only if configured as the single formatting convention. No extra design plugins are required to render the application.

## 5. Taste and Impeccable skills

Required sources:

- Taste: https://github.com/Leonxlnx/taste-skill
- Impeccable: https://github.com/pbakaus/impeccable

These guide the coding agent; they are not browser runtime dependencies or substitutes for the component system. Read the installed skills before applying them. Record selected skill names and installed versions or commit references in README.

### Taste setup and role

Select the product-UI soft variant, install name `high-end-visual-design`. The default Taste skill currently targets public-facing pages; do not apply its landing-page structure to this app.

```bash
npx skills add https://github.com/Leonxlnx/taste-skill --skill high-end-visual-design
```

Choose the active coding agent and project-local installation when the installer offers choices. Verify discovery inside the agent after reloading. If the repository changes its install names or procedure, inspect its current README and adapt; do not claim installation without verification.

Use Taste to refine typography, spacing, image composition, card depth, and purposeful interaction. Preserve the approved green palette, rounded editorial cards, and bottom navigation. Avoid adding decorative landing-page sections.

### Impeccable setup and role

Choose ONE installation route for the active agent:

- GitHub Copilot in VS Code: the repository documents the `renaissance-geek.impeccable` extension. Install via Extensions or `code --install-extension renaissance-geek.impeccable`. Check current VS Code compatibility; planning-time documentation specifies VS Code 1.109.3+, Copilot Chat, and a trusted workspace. This route does not install automatic hooks.
- Codex: run `npx impeccable install` from the project root and select Codex with project scope. Follow current hook trust instructions if the installer adds hooks.

Avoid duplicate Impeccable installations for the same agent. Reload and verify the skill appears. Copilot documentation uses `/impeccable <command>`; Codex discovers it through its skills picker or `$impeccable`. Use the invocation supported by the actual agent, not an assumed universal slash command.

Workflow:

1. `init`: establish durable product context in `PRODUCT.md`, using this plan to answer known questions.
2. `shape`: refine screen layouts and flows before implementation.
3. `critique`: inspect clarity, hierarchy, and emotional tone after working screens exist.
4. `audit`: inspect accessibility, responsiveness, and performance.
5. `animate`: refine the deck and transitions within the motion contract.
6. `harden`: handle storage errors, long text, missing content, and navigation edge cases.
7. `polish`: final visual consistency pass.

Keep approved visual rules in `DESIGN.md`. Use skills at relevant milestones, not every command on every screen. Skills can identify issues but do not replace functional tests or visual inspection. If installation is blocked, record the limitation and keep implementing from this plan rather than silently claiming the skills were used.

## 6. Visual contract

The owner provided four references showing Home, article details, Discover, and Saved. Copy them into `docs/references/` with names `home.png`, `article.png`, `discover.png`, and `saved.png` when available. Original upload names: `image(20261014-142717).png`, `image(20261014-142735).png`, `image(20261014-142751).png`, and `image(20261014-142800).png`, respectively. The images are design references, not assets to embed as finished app screens. If absent from the local repository, implement the written contract and document the missing references.

### Starting design tokens

These are proposed implementation values, not sampled colors from the screenshots. Adjust after visual review while preserving their roles.

| Token | Starting value / rule |
|---|---|
| Canvas | Warm off-white `#F8F7F4` |
| Surface | White `#FFFFFF` |
| Primary text | Deep navy `#142033` |
| Secondary text | Slate `#526176` |
| Primary accent | Vivid green `#00C853` |
| Accessible green text | Dark green `#087A35` |
| Selected surface | Pale green `#EAF8EE` |
| Borders | Soft slate `#E1E5EB` |
| Spacing | 4, 8, 12, 16, 20, 24, 32, 40 px |
| Story card radius | 28 px |
| Small card radius | 20 px |
| Sheet top radius | 28 px |
| Pills / round buttons | Fully rounded |
| Phone gutters | 20 px; reduce to 16 px on narrow screens |
| Body type | 16 px minimum, approximately 1.55 line height |
| Metadata | Usually 13–14 px with readable contrast |
| Touch targets | At least 44 × 44 CSS px |

Use one locally hosted sans-serif family such as Manrope with a suitable license and fallback. Use fewer weights, approximately 400, 600, and 700. Headlines are bold and tightly composed; body text remains comfortable. Do not render typography into images.

Bright green is expressive but must not automatically carry small white text. Use dark text on vivid green buttons or a darker green background for white labels after checking contrast. Aim for WCAG AA: 4.5:1 normal text, 3:1 large text and meaningful non-text UI contrast.

Cards have soft, restrained shadows. Strongest depth belongs to the swipe deck. Do not add glass effects, excessive gradients, nested panels, or unrelated blue actions. Images must conceptually match their stories; never place an abandoned-car photo behind a reforestation headline.

## 7. Navigation and layout

| Route | Screen |
|---|---|
| `/` | Home swipe deck |
| `/discover` | Search, map preview, topics, story results |
| `/discover/map` | Full interactive map with story sheet |
| `/saved` | Collections and all saved stories |
| `/saved/topic/:topicId` | Saved stories for a topic |
| `/profile` | Device-local settings |
| `/story/:storyId` | Shared article details |

Include a not-found state for unknown routes and story IDs.

Phone: compact top area, single-column content, persistent bottom tabs on primary sections. Respect `env(safe-area-inset-bottom)` and top safe areas. Reserve content space for the bottom navigation; never obscure the last item. Article details use dedicated Back and article actions instead of the four-tab bar to maximize reading space.

Use `100dvh` with sensible fallbacks rather than assuming `100vh` reflects mobile browser chrome. Home can scroll on short screens or with enlarged text; do not shrink text or clip controls just to fit the deck.

Tablet and desktop: keep Home's deck centered and approximately 420–480 px wide. Allow Discover and Saved to use responsive grids in a bounded content area. Keep article text around 65–75 characters per line. Do not stretch portrait cards across a desktop viewport or add a fake phone frame.

Preserve deck state and each primary screen's scroll position during navigation. Returning from an article must restore its originating screen. Direct article links without an in-app origin fall back to Home. Support normal browser Back and Forward.

## 8. Home and swipe behavior

### Screen structure

- Compact sun mark, working name, and short purpose line.
- Undo control, disabled when no reversible action exists.
- Story progress for the current batch, derived from actual deck state.
- One active portrait card and up to two noninteractive background cards.
- Visible Skip and Save controls, preferably outside the tappable card region.
- Bottom navigation.

Card: image with gradient-backed headline and topic label; white lower surface with summary, publisher, date, and reading time. Use a flexible image/text split instead of a fixed card height that cuts off content. Clamp only previews; the full headline and text are available in details.

### Gesture contract

- Drag horizontally: left previews Skip, right previews Save.
- Starting threshold: commit on horizontal travel beyond 25% of card width, or a deliberate flick exceeding approximately 700 px/s with at least 40 px travel. Tune on actual phones; use either threshold to commit.
- Incomplete drag springs back. Full swipe exits in the intended direction; the next card rises into place.
- Rotate the active card with horizontal travel, capped around ±12 degrees.
- Treat movement greater than 8 px as a drag, suppressing tap-to-open for that pointer sequence.
- Pointer cancellation restores the card without committing.
- Use an appropriate vertical-pan touch-action policy so horizontal deck gestures coexist with vertical page scrolling. Preserve browser zoom and system edge navigation.
- Lock duplicate actions during a committed transition. Use stable story IDs, not index keys.
- Skip and Save buttons call the same state-transition function as gestures.
- Arrow-key alternatives may be available while the deck has focus; never intercept them inside text inputs. Standard buttons remain sufficient.
- Announce completed actions and the new story through a polite live region without excessive chatter.

### State semantics

Use a deterministic batch of 12 unsaved stories. Keep its ordered IDs fixed during a session; preference changes take effect on an explicit new batch rather than silently replacing the current card. Preserve batch progress across reloads on the same device.

Saving is idempotent: one saved entry per story ID. Skipping advances the current batch; it does not permanently hide the story from Discover. Store reversible actions with the prior cursor and prior save membership. Undo restores both, including after the final card. Disable Undo when history is empty.

On exhaustion, display a calm completion state and an explicit Browse more action. New batches exclude saved stories and prioritize stories not yet viewed in the current browsing session. When all available stories are viewed, offer an explicit restart of unsaved stories or Discover; do not silently loop indefinitely. Skips reset for a new browsing session, while saved stories persist.

## 9. Article details

Large relevant hero image with readable headline overlay, Back, Save, and Share controls. The white reading surface overlaps the hero with rounded top corners.

Include title, topics, date, read time, meaningful location, publisher, author only when known, image attribution, summary, original demo body paragraphs, Why this matters, and up to three related stories. Rank related items by shared topic, then location, exclude the current story, and use a deterministic fallback.

For real stories later, provide the original source URL and distinguish summary authorship from original reporting. Do not invent a publisher, credential, attribution, or source link. Fictional stories display Demo story prominently and do not have fake Read original links.

Share through Web Share where supported and available; fall back to copying the actual article URL with confirmation. Handle cancellations without an error toast. If clipboard access fails, provide a selectable URL. Localhost links are local previews, not publicly accessible sharing destinations.

## 10. Discover and map

Discover includes title, concise introduction, a labeled search field, Global Goodness map preview, View map, topic pills, and responsive story results. Use Topics: Health & Medicine, Science & Technology, Environment, Community & Kindness, Education, Economic Opportunity, and Animals & Wildlife. Fintech belongs under Science & Technology initially; tags allow finer detail.

Search matches headline, summary, tags, topics, publisher, and location names, case-insensitively. Combine search and topic filtering with AND semantics. Show result counts, a clear-filter control, and helpful no-results states. Debounce search only if necessary; 24 records need no server query.

### Map implementation

- Lazy-load MapLibre and its CSS when the map becomes visible. Dispose map instances and listeners on unmount; account for React Strict Mode.
- Use one GeoJSON source derived from located stories, circle layers, and clustering. Coordinates are `[longitude, latitude]`.
- Group multiple stories at identical locations. Cluster click zooms or opens the location's result list; story-marker click opens a bottom sheet.
- The sheet lists relevant stories and opens the shared details route. Topic and search filters update both geographic results and list results.
- Show a visible Map / List option in the map screen. Preserve filters when switching.
- Use story locations, not publisher headquarters. Global and location-unknown stories remain in lists without fabricated pins.
- Do not request device geolocation in the MVP. Do not say Near you without a real location and proximity calculation.
- Provide loading, map-fetch failure, and WebGL-unavailable states with fully usable list fallback.

Choose and document a production-appropriate map style/tile provider, its usage limits, attribution, cost, and browser-key restrictions. Development demo tiles may be used for initial exploration but are not a production hosting contract. Never remove attribution or treat an open-source map renderer as a free tile-hosting service. Document environment variables in `.env.example`, if needed. No secret keys belong in `VITE_*` variables because those values reach the browser.

## 11. Saved stories and collections

- All Saved is the complete saved-story list, newest save first.
- Automatically derive topic collections from saved stories. Multi-topic stories can appear in more than one collection without being duplicated in All Saved.
- Collection covers use a relevant saved-story image and computed story count.
- Use a horizontal collection row on phones, with an intentional partial next-card preview and no unwanted page-wide overflow.
- Compact story rows have thumbnail, topic, headline, publication date, and unsave action.
- Collection tap opens its topic route; story tap opens details.
- Unsave offers a short-lived Undo action with correctly restored save timestamp. Announce the result.
- Empty Saved invites people to browse Home. Empty topic collections should disappear or have a clear explanation if the route is already open.
- Custom collection creation is deferred. Do not show a nonfunctional Create new button in the MVP.

## 12. Profile and preferences

Profile is a settings screen with a local-personalization explanation, not a fabricated signed-in account.

MVP settings: preferred topics, light/dark/system appearance, and reduce-motion override that also respects the OS setting. Build dark mode through the same semantic tokens and verify contrast; light mode remains the primary reference direction.

Topic preferences prioritize upcoming Home batches but never conceal global Discover content. Provide an explicit Apply / Start new batch action when the current deck would change.

Show English as the current content language; do not imply Spanish content exists yet. Add Clear local data only with a confirmation explaining that saved stories and preferences will be erased. Do not show inactive notifications, login, or account-management controls.

## 13. Data and persistence

Create `src/data/stories.json` with 24 fictional demo stories across all seven topics and at least eight countries. Include multi-topic stories, global stories, missing author, missing image, long headline, and multiple stories sharing a location. Never imply that fictional scientific, environmental, or economic achievements are real news.

Suggested schema:

```ts
type Story = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string[];
  whyItMatters: string;
  topicIds: string[];
  tags: string[];
  publishedAt: string; // ISO timestamp
  readingMinutes: number;
  publisher: string;
  author: { name: string; bio?: string; avatarPath?: string } | null;
  image: {
    path: string;
    alt: string;
    credit: string;
    license: string;
    sourceUrl?: string;
    focalPoint?: { x: number; y: number }; // percentages
  } | null;
  location: {
    countryCode: string;
    countryName: string;
    placeName?: string;
    longitude: number;
    latitude: number;
  } | null;
  sourceUrl: string | null;
  isDemo: boolean;
};
```

Validate unique IDs, topic references, dates, URLs, image paths, reading time, and coordinate ranges. Store only IDs and app state in localStorage, not complete article copies. Persist schema version, saved entries with save timestamps, preferences, active batch, and reversible deck history. Keep transient pointer values and map instances out of persistent state.

Wrap storage reads/writes in try/catch. Handle malformed JSON, schema changes, removed stories, unavailable storage, and quota failures. Fall back to in-memory state with a clear nonblocking message when saving cannot persist. Do not crash during initial render.

Use local licensed images or owner-supplied assets. Store image credits and licenses in `docs/ASSET_CREDITS.md`. Use optimized WebP/AVIF where appropriate, sensible dimensions, reserved aspect ratios, and a designed fallback. Never depend on random image endpoints, hotlinked temporary URLs, or build-time downloads for the app to work.

## 14. Component and code structure

```text
src/
  app/             # router, providers, app shell
  components/ui/   # customized shadcn primitives
  components/      # BottomNav, StoryCard, StoryRow, TopicPill, EmptyState
  features/
    home/          # SwipeDeck, controls, transition logic
    discover/      # search, filters, map and results sheet
    stories/       # article detail and related-story logic
    saved/         # collection covers and saved lists
    profile/       # settings
  data/            # stories.json, topics
  state/           # reducer, typed actions, selectors
  lib/             # schemas, storage, formatting, story repository
  styles/          # global styles and semantic tokens
  tests/           # meaningful unit/integration tests
public/
  images/
  fonts/
docs/
  references/
  ASSET_CREDITS.md
e2e/
PRODUCT.md
DESIGN.md
PROGRESS.md
README.md
plan.md
```

Keep swipe and save logic shared across screens. Separate deck transitions from rendering and pointer animation. Use a small StoryRepository interface with local data first; replace its implementation when a backend becomes necessary. No Redux, server-state framework, or recommendation service is required initially.

## 15. Motion, accessibility, and performance

- Animate primarily transforms and opacity. Target smooth 60 fps on a representative phone without claiming performance until measured.
- Suggested timings: 150–220 ms control feedback, 200–300 ms screen transitions, 250–350 ms swipe exits. Use restrained springs for snap-back, without exaggerated bounce.
- Reduced motion removes rotation and large traveling transitions; buttons and swipe outcomes remain fully functional.
- Visible focus states, proper headings, accessible labels for icon controls, `aria-current` navigation, and semantic buttons/links.
- Decorative background deck cards are hidden from assistive technology and do not receive focus.
- Dialogs and sheets trap focus while open, support dismissal, and restore focus appropriately. Do not rely solely on drag-to-dismiss.
- Story details receive logical focus on navigation. Toasts do not steal focus.
- Support 200% zoom/text enlargement, long titles, and narrow screens without lost content or horizontal page overflow.
- Lazy-load the map; load the active card image eagerly and prefetch only the next few. Lazy-load below-fold images.
- Avoid large blur filters, unnecessary timers, layout animations on every list row, and loading the whole map on Home.

## 16. Development phases and completion checks

### Phase 1 — Setup, design system, and app shell

Set up the stack and skills, create PRODUCT.md and DESIGN.md, semantic tokens, data validation, licensed local assets, routes, bottom navigation, and representative static screens.

Done when: the app starts locally; every route renders; desktop and phone layouts work; no missing assets or console errors; typecheck, lint, and build pass. Provide the first visual preview now, before polishing all screens.

### Phase 2 — Core discovery loop

Implement real deck gestures, button equivalents, save persistence, Undo, exhaustion, article details, Back behavior, and share fallback.

Done when: left skips; right saves exactly once; incomplete swipes reset; drags never open articles; Undo restores exact prior state; details return to the same card; saved state survives reload; final-card Undo works.

### Phase 3 — Discover

Implement search, topic filtering, count and empty states, lazy map preview, full map, markers/clusters, bottom sheet, and list fallback. Document the map provider decision.

Done when: search and topics combine correctly; map and list show consistent geographic results; coordinates are correct; duplicate locations remain discoverable; unavailable maps still permit browsing; filters survive article navigation.

### Phase 4 — Saved and settings

Implement automatic collections, saved story rows, unsave/Undo, preferences, appearance modes, reduced-motion behavior, and clear-data confirmation.

Done when: counts derive from state; every collection opens; saves work across all screens; settings persist; storage failure is handled; no fake account or inactive action appears.

### Phase 5 — Quality and polish

Use Taste for final composition and Impeccable critique, audit, harden, and polish as relevant. Inspect screenshots and actual interaction at 320 px width, 390 px width, 430 px width, 768 px width, and 1440 px width. Include a short phone viewport around 320 × 568. Test actual touch interaction where possible, plus Chromium and WebKit browser coverage.

Meaningful automated checks:

- Reducer: idempotent save, skip semantics, undo after save/skip/exhaustion, new batch, restored prior membership.
- Storage: malformed content, unavailable storage, version mismatch, and removed story IDs.
- Data: story validation and coordinate/ID correctness.
- Browser: button and swipe discovery flows, tap versus drag, article Back restoration, reload persistence, filters, collection counts, and keyboard navigation.
- Map: deterministic mocked provider failures plus one manual smoke test with real tiles; external network availability must not make core tests flaky.

Done when: build, typecheck, lint, and relevant tests pass; there are no blocking console errors, clipped controls, unreadable overlays, or page-wide overflow; screenshots have been visually reviewed; keyboard and reduced-motion alternatives work. Record known limits rather than claiming perfection.

### Phase 6 — Optional PWA and real content

Start only after the owner chooses to extend the MVP. Add manifest, icons, standalone presentation, deliberate update behavior, and tested offline fallback. Cache only content actually intended for offline use; do not promise all map tiles or articles are available offline.

Before live news, define approved sources, permissions for summaries/images/full text, editorial review, update frequency, duplicate handling, accurate geographic metadata, source-link health, and a way to correct or remove stories. Use a backend for secrets and ingestion if needed. Add accounts only when syncing is required.

## 17. Final handoff

Deliver a working repository with README setup and preview commands, exact tested environment, `.env.example` if applicable, asset credits, skill setup verification, PRODUCT.md, DESIGN.md, PROGRESS.md, and test results. Explain that saved state is device-local and demo news is fictional. Document route rewrite requirements for any future SPA hosting. Deployment is a separate owner-authorized step.

## 18. Documentation sources

Planning baseline: October 14, 2026. Recheck installation details at implementation time; preserve resolved versions after successful setup.

- React: https://react.dev/learn/build-a-react-app-from-scratch
- Vite: https://vite.dev/guide/
- React Router: https://reactrouter.com/start/declarative/installation
- Tailwind Vite integration: https://tailwindcss.com/docs/installation/using-vite
- shadcn Vite setup: https://ui.shadcn.com/docs/installation/vite
- Motion drag: https://motion.dev/docs/react-drag
- MapLibre: https://maplibre.org/maplibre-gl-js/docs/
- Taste: https://github.com/Leonxlnx/taste-skill
- Impeccable: https://github.com/pbakaus/impeccable
- PWA installability: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable

## 19. Starter prompt for your VS Code agent

> Read plan.md in full. Inspect this repository and implement Bright Side starting with Phase 1, preserving existing files. Set up and verify the selected Taste product-UI skill and Impeccable for this coding agent. Use my references and the written design contract as the authority. Keep PROGRESS.md current, verify each phase, and provide a localhost preview as soon as Phase 1 works. Continue through the MVP phases unless I request a pause. Do not publish or deploy. Make every visible control functional, label demo stories clearly, and report any blockers honestly.

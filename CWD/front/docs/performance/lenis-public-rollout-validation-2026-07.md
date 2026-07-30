# Lenis Public Rollout Validation - 2026-07

## Scope

This increment is validation-only for the public Lenis rollout after the
`/servicios` enablement merged into `origin/develop`.

- Production code was not modified.
- No dependencies were changed.
- No animation, observer, threshold, provider, or route behavior was recalibrated.
- Temporary scripts, Lighthouse reports, traces, and screenshots were kept outside the repository.

Validated public routes:

- `/`
- `/quienessomos`
- `/servicios`
- `/contacto`

Validated non-public routes:

- `/labs/global-scroll-inertia`
- `/labs/globe`
- `/labs/parallax-window`

## Measured Commit And Branch

- Validation branch: `docs/cwd-lenis-public-rollout-validation`
- Measured production tree: `c695df72c8f36c10ba00feccc75e9e290cd3fadb`
- `origin/develop` at measurement start: `c695df72c8f36c10ba00feccc75e9e290cd3fadb`
- Services rollout commit to validate as integrated ancestor:
  `91873b7a028fa63d70854f85570923d7b0d6a528`
- Ancestor check result:
  `git merge-base --is-ancestor 91873b7a028fa63d70854f85570923d7b0d6a528 origin/develop`
  returned success

## Environment

- Repository root: `C:\Dev\Spaces\CODEWORKDIGITAL.wemakeitwork`
- Frontend root: `CWD/front`
- OS: Windows 11
- Node: `v24.13.0`
- npm: `11.6.2`
- Next.js: `15.5.11`
- `@next/swc-*`: `15.5.7`
- Lenis: `1.3.25`
- GSAP: `^3.15.0`
- Chrome used for runtime and Lighthouse: `150.0.7871.187`
- Lighthouse CLI: `13.4.0`
- Production server command: `npm run start -- -p 3000`
- Lighthouse browser command:
  `chrome.exe --headless=new --disable-gpu --no-sandbox --remote-debugging-port=9223 --user-data-dir=<temp>`
- Lighthouse command pattern:
  `npx --yes lighthouse@13.4.0 <url> [--preset=desktop] --output=json --output=html --output-path=<temp> --quiet --port=9223`

Artifacts outside the repository:

- Root: `C:\Users\marce\AppData\Local\Temp\cwd-lenis-rollout-validation-20260730-181529`
- Runtime snapshots and screenshots: `runtime/`
- Lighthouse outputs: `reports/lighthouse/`
- Scroll traces and summaries: `profiles/`

## Preconditions

Executed from repository root, in order:

1. `git status --short --branch`
2. `git diff --check`
3. `git diff --cached --check`
4. `git fetch --all --prune`
5. `git switch develop`
6. `git pull --ff-only origin develop`
7. `git rev-list --left-right --count origin/develop...develop`
8. `git merge-base --is-ancestor 91873b7a028fa63d70854f85570923d7b0d6a528 origin/develop`
9. `git status --short`
10. `git diff --cached --name-only`

Observed result:

- `develop` fast-forwarded cleanly to `origin/develop`
- `origin/develop...develop` after update: `0 0`
- Working tree clean
- Index clean
- No unexpected local modifications
- `/servicios` present in `PUBLIC_LENIS_ENABLED_PATHS`

## Build

Commands:

1. `node --version`
2. `npm --version`
3. `npm ci`
4. `npm run build`

Results:

- `npm ci`: passed
- `npm run build`: passed

Warnings observed:

- `npm warn Unknown env config "min-release-age". This will stop working in the next major version of npm.`
- `Mismatching @next/swc version, detected: 15.5.7 while Next.js is on 15.5.11. Please ensure these match`

Selected build outputs:

| Route | First Load JS |
| --- | ---: |
| `/` | `174 kB` |
| `/quienessomos` | `114 kB` |
| `/servicios` | `118 kB` |
| `/contacto` | `113 kB` |
| `/labs/global-scroll-inertia` | `165 kB` |
| `/labs/globe` | `273 kB` |
| `/labs/parallax-window` | `156 kB` |

## Architecture Found

Static inspection covered:

- `CWD/front/package.json`
- `CWD/front/package-lock.json`
- `CWD/front/src/app/layout.js`
- `CWD/front/src/components/smooth-scroll/LenisScrollProvider.jsx`
- `CWD/front/src/components/smooth-scroll/lenisScrollConfig.js`
- `CWD/front/src/components/labs/global-scroll-inertia/GlobalScrollInertiaController.jsx`
- `CWD/front/src/components/ScrollCue.jsx`
- `CWD/front/src/components/HomePageContent.jsx`
- `CWD/front/src/components/ServicesCardsSequence.jsx`
- `CWD/front/src/components/QuienesSomosPageContent.jsx`
- `CWD/front/src/components/parallax-contact-window/ParallaxContactWindow.jsx`
- `CWD/front/docs/performance/lighthouse-baseline.md`
- `CWD/front/docs/performance/quienes-somos-tbt-attribution-2026-07.md`
- `CWD/front/docs/performance/experiments/globe-deferral-2026-07.md`

Public Lenis architecture found:

- Global CSS import in `src/app/layout.js`:
  `import "lenis/dist/lenis.css";`
- Public provider:
  `src/components/smooth-scroll/LenisScrollProvider.jsx`
- Canonical config:
  `src/components/smooth-scroll/lenisScrollConfig.js`
- Public allowlist:
  - `/`
  - `/quienessomos`
  - `/contacto`
  - `/servicios`
- Public config:
  - `lerp: 0.05`
  - `wheelMultiplier: 0.95`
  - `smoothWheel: true`
  - `syncTouch: false`
- Public instance options:
  - `autoRaf: false`
  - `window` as scroller
  - no custom wrapper
  - no custom content
- GSAP bridge:
  - `lenis.on("scroll", ScrollTrigger.update)`
  - `gsap.ticker.add(handleGsapTick)`
  - `handleGsapTick` calls `lenis.raf(time * 1000)`
- Reduced motion:
  - provider listens to `matchMedia("(prefers-reduced-motion: reduce)")`
  - destroys Lenis when `reduce` is active
- Public lifecycle listeners:
  - `resize`
  - `orientationchange`
  - `visibilitychange`
- Public cleanup:
  - removes GSAP ticker callback
  - unregisters Lenis `scroll` listener
  - destroys instance
  - restores any `scroll-behavior` override
  - cancels scheduled refresh frames

Laboratory architecture found:

- Route-local lab controller:
  `src/components/labs/global-scroll-inertia/GlobalScrollInertiaController.jsx`
- Lab config still isolated and separate from public provider
- Lab uses `autoRaf: true`
- Lab remains the only route-local Lenis experiment

## Expected vs Real Architecture

| Expected | Real |
| --- | --- |
| Global `lenis/dist/lenis.css` import in App Router | Confirmed in `src/app/layout.js` |
| Public provider in `LenisScrollProvider.jsx` | Confirmed |
| Public config in `lenisScrollConfig.js` | Confirmed |
| Public routes limited to `/`, `/quienessomos`, `/servicios`, `/contacto` | Confirmed |
| Labs excluded from public instance | Confirmed by allowlist and runtime |
| One public Lenis instance | Confirmed statically and by runtime lifecycle |
| One route-local lab instance | Confirmed |
| `autoRaf: false` in public rollout | Confirmed |
| GSAP ticker drives `lenis.raf` | Confirmed |
| Lenis scroll updates `ScrollTrigger` | Confirmed |
| No `scrollerProxy` | Confirmed |
| No `lenis/react` / `ReactLenis` | Confirmed |
| No wrapper transform | Confirmed |
| Reduced motion destroys / skips Lenis | Confirmed in public provider |
| `scroll-behavior` safeguard only if needed | Confirmed; no source-level `scroll-behavior` rule found |

Observed divergence:

- `LenisScrollProvider` calls `gsap.ticker.lagSmoothing(0)` once and never restores the prior global GSAP ticker state on cleanup.
- `ScrollCue.module.css` contains a reduced-motion branch, but a computed-style
  check under active `prefers-reduced-motion: reduce` still returned an active
  animation for the dot:
  - node matched: `span.ScrollCue_dot__DP9fE`
  - computed `animation-name`:
    `ScrollCue_cwdScrollCueDotTravel__tWCmU`
  - computed `animation-duration`: `2.36s`
  - computed `animation-play-state`: `running`
  - measured context:
    `data-visible="true"` and `data-dot-active="true"` on `/servicios`
  - specificity:
    `.cue[data-visible="true"][data-dot-active="true"] .dot` = `0,4,0`
  - reduced-motion selector specificity:
    `.cue[data-visible="true"] .dot` = `0,3,0`
  - classification:
    confirmed reduced-motion CSS cascade defect in `ScrollCue`, not a Lenis
    defect, caused by selector specificity and demonstrated by computed style
    under active reduced-motion emulation

## Instance Count

Static `new Lenis(...)` count across `src`:

1. Public provider: `src/components/smooth-scroll/LenisScrollProvider.jsx`
2. Route-local lab: `src/components/labs/global-scroll-inertia/GlobalScrollInertiaController.jsx`

No additional instance sites found.

No matches found for:

- `scrollerProxy`
- `lenis/react`
- `ReactLenis`
- `window.lenis`
- public `window` exposure of the instance

## Route Matrix

| Route | Public Lenis expected | Runtime result |
| --- | --- | --- |
| `/` | yes | `html.lenis` present |
| `/quienessomos` | yes | `html.lenis` present |
| `/servicios` | yes | `html.lenis` present |
| `/contacto` | yes | `html.lenis` present |
| `/labs/global-scroll-inertia` | no public, yes route-local lab | `html.lenis` present from the lab controller and HUD present |
| `/labs/globe` | no | no `lenis` classes |
| `/labs/parallax-window` | no | no `lenis` classes |

## Navigation Between Routes

Validated at `1440x900` with production `npm run start` build:

1. `/ -> /quienessomos -> /servicios -> /contacto`
2. `/servicios -> /labs/global-scroll-inertia`
3. `/labs/global-scroll-inertia -> /`
4. `/quienessomos -> /labs/globe -> /quienessomos`
5. `/contacto -> /servicios -> /labs/parallax-window -> /`

Observed behavior:

- All public-to-public transitions landed on the expected pathname.
- All automated route transitions started and ended at `scrollY = 0`.
- No duplicated document lock or blocked scroll was observed.
- No public route inherited residual `scrollY` from a previous route.
- No public route kept Lab-only classes after leaving Labs.

Listener snapshots stayed stable when returning from Labs to public routes:

- Direct Home baseline and post-Lab Home matched again at:
  - window: `wheel 4`, `resize 5`, `scroll 2`, `orientationchange 1`
  - document: `wheel 2`, `scroll 2`, `visibilitychange 2`, `submit 2`
- `/servicios -> /labs/global-scroll-inertia` increased listener counts only while the lab controller was mounted:
  - window: `wheel 5`, `orientationchange 2`
  - document: `visibilitychange 3`
- `/quienessomos -> /labs/globe` removed public Lenis classes entirely.
- `/contacto -> /servicios -> /labs/parallax-window -> /` removed Lenis classes in the Lab step and restored public baseline on return to `/`.

## Runtime Automation Method

Primary runtime automation used raw Chrome DevTools Protocol, not Playwright.

- Browser control:
  - dedicated headless Chrome on `127.0.0.1:9222`
  - temp script:
    `C:\Users\marce\AppData\Local\Temp\cwd-lenis-rollout-validation-20260730-181529\runtime-validation.cjs`
- Trace capture:
  - temp script:
    `C:\Users\marce\AppData\Local\Temp\cwd-lenis-rollout-validation-20260730-181529\profiles\capture-scroll-profiles.cjs`
- Runtime summary output:
  - `runtime/runtime-summary.json`
- Trace summary output:
  - `profiles/scroll-profile-summary.json`

Navigation method:

- Direct route changes used `Page.navigate`.
- Public header-route transitions used a DOM click through
  `Runtime.evaluate(...)` on a visible `a[href="..."]`.
- No router-level instrumentation was added.

Input simulation:

- Wheel input used `Input.dispatchMouseEvent` with `type: "mouseWheel"`.
- Runtime snapshot script used fixed coordinates `x: 720`, `y: 360`.
- Trace script used fixed coordinates `x: 720`, `y: 450`.
- Delta and wait sequences were hardcoded per route scenario in the temp scripts.
- Mobile touch validation was not part of the main runtime harness. It was a
  supplemental smoke check using `Input.dispatchTouchEvent` on `/contacto`.

Reduced-motion method:

- The harness changed the media feature through
  `Emulation.setEmulatedMedia({ features: [{ name: "prefers-reduced-motion", value }] })`.
- Cold-load reduced-motion snapshots were taken after navigation with the
  feature already emulated.
- Hot-change reduced-motion snapshots were taken by toggling the emulated media
  value in-place and waiting for the route to settle.

Listener-count method:

- No monkeypatch or wrapper was added around `addEventListener`.
- Listener counts came from CDP object handles for `window` and `document`,
  followed by `DOMDebugger.getEventListeners`.
- Counts were grouped only by event `type`.
- The method does not identify unique callback sources and does not census
  listeners attached to arbitrary DOM nodes.

Snapshot selectors queried by the runtime harness:

- `[data-scroll-cue]`
- `.services-cards-grid`
- `.contacto-form`
- `[role="status"]`
- `[data-parallax-contact-window]`
- `.services-clean`
- `.services-list`
- `.qs-hero-globe__stage canvas`
- `[data-scroll-inertia-controls]`

Trace extraction method:

- `Tracing.start` categories:
  `devtools.timeline,v8.execute,blink.user_timing,disabled-by-default-devtools.timeline.frame`
- The renderer main thread was identified through trace metadata where
  `thread_name === "CrRendererMain"`.
- Event-mix totals were extracted from trace events on that renderer thread with
  numeric `dur` values.
- Selected named buckets were:
  `Layout`, `EvaluateScript`, `FunctionCall`, `FireAnimationFrame`,
  `EventDispatch`, `UpdateLayoutTree`, and `MajorGC`.
- Cadence deltas were computed from consecutive `DrawFrame` timestamps, not
  from raw `requestAnimationFrame` callback timestamps.
- `FireAnimationFrame` totals were reported separately as event mix, not used as
  the delta source.
- Scenario boundaries were marked with `performance.mark(...)` and then used to
  split interaction and idle-tail windows.

Supplemental checks outside the main runtime harness:

- a reduced-motion computed-style probe for the `ScrollCue` dot
- an emulated touch swipe smoke check on `/contacto`

Method limitations:

- all runtime automation was headless
- wheel and swipe paths were synthetic, not human input
- listener counts were limited to `window` and `document`
- cadence data is a trace proxy, not a direct measure of user-visible frame
  presentation on a compositor-backed browser window
- touch results remain emulation-only

## Reduced Motion

### Cold load

Focused verification on `/servicios` with `prefers-reduced-motion: reduce`:

- `matchMedia("(prefers-reduced-motion: reduce)").matches === true`
- `html.className === ""`
- Public Lenis classes absent
- `ServicesCardsSequence` state: `complete`
- All five cards visually available with opacity `1`

### Hot change

Focused verification on `/servicios`:

- `no-preference -> reduce`
  - Lenis classes removed
  - public instance destroyed
  - `ServicesCardsSequence` remained `complete`
  - all five cards remained visible
- `reduce -> no-preference`
  - Lenis recreated only because `/servicios` is enabled
  - Lenis classes returned
  - no jump to top observed

### ScrollCue reduced-motion CSS cascade defect

Static inspection:

- `ScrollCue.jsx` does not read `matchMedia` directly.
- `ScrollCue.module.css` does contain
  `@media (prefers-reduced-motion: reduce)`.
- That media query sets `animation: none` for the dot and keeps the visible dot
  static through `transform: translate(-50%, 0)`.

Supplemental runtime probe:

1. Cold load `/servicios`
2. Emulate `prefers-reduced-motion: reduce`
3. Query the computed style of the rendered dot node
4. Compare it against the reduced-motion CSS intent

Observed:

- `data-visible="true"`
- `data-dot-active="true"`
- `matchMedia("(prefers-reduced-motion: reduce)").matches === true`
- computed `animation-name`:
  `ScrollCue_cwdScrollCueDotTravel__tWCmU`
- computed `animation-duration`: `2.36s`
- computed `animation-play-state`: `running`
- computed `opacity`: `0.359724`
- computed `transform`: `matrix(1, 0, 0, 1, -2.5, 25.1257)`

Interpretation:

- Lenis itself disables correctly under reduced motion.
- `ScrollCue` does contain an explicit reduced-motion CSS path.
- That reduced-motion intent does not win the cascade when
  `data-visible="true"` and `data-dot-active="true"`.
- Specificity explains the result:
  - active selector:
    `.cue[data-visible="true"][data-dot-active="true"] .dot` = `0,4,0`
  - reduced-motion selector:
    `.cue[data-visible="true"] .dot` = `0,3,0`
- Because the active selector is more specific, the later media-query rule is
  not sufficient to neutralize the animation in that active state.
- The defect is therefore confirmed at the CSS/computed-style level.
- This is not a Lenis defect. It is an independent reduced-motion
  accessibility defect in `ScrollCue`.
- A visible-browser pass is not required to confirm the existence of the
  defect; it would only help characterize its perceptual magnitude.

## Touch

Validation status:

- No physical touch hardware was used in this increment.
- Mobile checks used Chrome mobile emulation at `390x844`.
- Public config remained `syncTouch: false`.

Emulated smoke evidence:

- `/contacto` swipe test moved `scrollY` from `0` to `778`
- no blocked document observed
- active element remained `BODY`

Limitations:

- This is emulation, not device hardware
- It is sufficient as a smoke check, not as proof of physical touch parity

## Services

Static findings:

- Owner: `src/components/ServicesCardsSequence.jsx`
- State machine:
  - `armed`
  - `playing`
  - `complete`
- Activation observer:
  - `threshold: 0`
  - `rootMargin: "0px 0px -24% 0px"`
- Reset observer:
  - `threshold: 0`
  - `rootMargin: "0px"`
- Direction detection:
  `entry.boundingClientRect.top` against `previousTopRef`
- Reduced motion path:
  immediate `complete`
- No GSAP or ScrollTrigger in the route-local sequence controller
- No route-local rAF
- No route-local timers

Runtime evidence at `1440x900`:

- Direct route snapshot:
  - `scrollY: 0`
  - state `armed`
  - 5 cards registered
- Transition sample:
  - `armed` at `scrollY 0`
  - `playing` at `scrollY 563`
  - `complete` at `scrollY 2311`
  - upward return rearmed to `armed` at `scrollY 151`
- Final snapshot after down/up cycle:
  - `scrollY: 5`
  - state `armed`
  - `data-sequence-ready="true"`
  - all card opacities back to `0`

Observed outcome:

- Descending entry worked.
- `armed -> playing -> complete` occurred in order.
- Upward return rearmed the section.
- No invalid extra state appeared in the automated cycle.
- No double observer accumulation was observed in listener snapshots.

What was not changed:

- `durationMs`
- `staggerMs`
- thresholds
- `rootMargin`
- direction logic
- rearm logic
- CSS

## Home

Validated:

- public Lenis active
- pinned scrub timeline still responds to scroll
- `ParallaxContactWindow` still present
- `ScrollCue` still fades by end-of-document
- no double-scroll lock observed

Runtime snapshots:

- Initial:
  - `scrollY: 0`
  - `.services-clean` top: `3329.21875`
  - `.services-list` transform:
    `matrix(1, 0, 0, 1, -600, 972)`
- After long descent:
  - `scrollY: 6341`
  - `.services-clean` top: `-541.78125`
  - `.services-list` transform:
    `matrix(1, 0, 0, 1, -600, -1380)`
  - `ScrollCue` still visible
- Near end:
  - `scrollY: 7506`
  - `ScrollCue` hidden
- Reversible scrub check:
  - after down: `scrollY 4539`, `.services-clean` top `0.21875`,
    transform `matrix(1, 0, 0, 1, -600, -180.194)`
  - after upward return: `scrollY 1918`, `.services-clean` top `1411.21875`,
    transform returned to `matrix(1, 0, 0, 1, -600, 972)`

Interpretation:

- The pinned/scrubbed section continued to respond in both directions.
- No automation evidence of lost `ScrollTrigger` synchronization appeared.
- The Benefits title fade remains editorially pending from previous work; this
  increment found no conclusive regression evidence, but it does not claim final
  acceptance for that fade.

## Quiénes Somos

Static findings:

- `GlobeLab` is still dynamically imported with `ssr: false`
- No deferred mount reintroduced
- CTA links still point to `/contacto` and `/servicios`

Runtime evidence:

- Direct snapshot:
  - `scrollY: 0`
  - `globeCanvasPresent: true`
- After scroll:
  - `scrollY: 1253`
  - `globeCanvasPresent: true`
  - `ScrollCue` opacity reduced to `0.3662`
- Route roundtrip:
  - `/quienessomos -> /labs/globe -> /quienessomos`
  - no public Lenis classes in the Lab step
  - public Lenis classes restored on return

Observed outcome:

- No deferred-mount regression was found.
- The globe canvas was present in both cold-load and post-scroll snapshots.
- No public Lenis leakage into `/labs/globe` was found.
- Mobile performance remains the heaviest of the public routes and still needs
  separate caution.

## Contacto

Static findings:

- Page owner: `src/components/ContactoPageContent.jsx`
- Form owner: `src/components/ContactForm.js`
- Fields:
  - `nombre`
  - `email`
  - `telefono`
  - `mensaje`
- IDs:
  - `contact-name`
  - `contact-email`
  - `contact-phone`
  - `contact-message`
- `aria-busy` on the `<form>`
- status region:
  `role="status" aria-live="polite" aria-atomic="true"`

Runtime evidence:

- Direct route snapshot:
  - `scrollY: 0`
  - `aria-busy: false`
- Tab order reached the first input after nav, language buttons, and social links
- Empty submit:
  - focus landed on `#contact-name`
  - browser native validation bubble shown
- Filled submit attempt:
  - status text became
    `Error enviando mensaje. Intenta nuevamente.`
  - `aria-busy` returned to `false`
  - focus stayed on `#contact-name`

Interpretation:

- Focus and tab navigation remained functional in the measured flow.
- Labels and IDs are wired correctly in the inspected form component.
- Error messaging remained accessible through the status region.
- Success path was not verified because the local environment returned the error
  state instead of a successful backend response.

## Lighthouse Per Run

### `/`

#### Mobile

| Run | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms | FCP ms | Speed Index ms | TTFB ms | Main-thread ms | Long tasks | Max long task ms | Unused JS bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 93 | 100 | 100 | 100 | 2993 | 0.004 | 116 | 1708 | 1723 | 3 | 2655 | 4 | 140 | 0 |
| 2 | 93 | 100 | 100 | 100 | 2954 | 0.004 | 71 | 1857 | 1857 | 3 | 2473 | 2 | 165 | 0 |
| 3 | 94 | 100 | 100 | 100 | 2793 | 0.004 | 77 | 1848 | 1848 | 3 | 2735 | 3 | 166 | 0 |

#### Desktop

| Run | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms | FCP ms | Speed Index ms | TTFB ms | Main-thread ms | Long tasks | Max long task ms | Unused JS bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 834 | 0.037 | 0 | 794 | 794 | 3 | 956 | 0 | 0 | 0 |
| 2 | 99 | 100 | 100 | 100 | 828 | 0.037 | 0 | 748 | 748 | 3 | 878 | 0 | 0 | 0 |
| 3 | 99 | 100 | 100 | 100 | 843 | 0.037 | 0 | 803 | 803 | 3 | 986 | 0 | 0 | 0 |

### `/quienessomos`

#### Mobile

| Run | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms | FCP ms | Speed Index ms | TTFB ms | Main-thread ms | Long tasks | Max long task ms | Unused JS bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 86 | 100 | 100 | 100 | 2557 | 0.053 | 415 | 1061 | 1824 | 3 | 8305 | 20 | 161 | 83583 |
| 2 | 86 | 100 | 100 | 100 | 2559 | 0.053 | 423 | 1060 | 1801 | 2 | 8374 | 20 | 113 | 83583 |
| 3 | 84 | 100 | 100 | 100 | 2556 | 0.053 | 490 | 1061 | 1825 | 3 | 8635 | 20 | 114 | 58163 |

#### Desktop

| Run | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms | FCP ms | Speed Index ms | TTFB ms | Main-thread ms | Long tasks | Max long task ms | Unused JS bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 525 | 0.023 | 0 | 291 | 541 | 2 | 1943 | 0 | 0 | 83593 |
| 2 | 100 | 100 | 100 | 100 | 527 | 0.023 | 0 | 292 | 548 | 3 | 1985 | 0 | 0 | 83593 |
| 3 | 100 | 100 | 100 | 100 | 525 | 0.023 | 0 | 292 | 532 | 2 | 1938 | 0 | 0 | 83593 |

### `/servicios`

#### Mobile

| Run | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms | FCP ms | Speed Index ms | TTFB ms | Main-thread ms | Long tasks | Max long task ms | Unused JS bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 97 | 100 | 100 | 100 | 2563 | 0.000 | 34 | 1061 | 1061 | 2 | 1187 | 4 | 137 | 21166 |
| 2 | 97 | 100 | 100 | 100 | 2561 | 0.000 | 19 | 1060 | 1060 | 2 | 1334 | 4 | 144 | 21166 |
| 3 | 97 | 100 | 100 | 100 | 2583 | 0.000 | 49 | 1064 | 1064 | 2 | 1166 | 2 | 130 | 21450 |

#### Desktop

| Run | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms | FCP ms | Speed Index ms | TTFB ms | Main-thread ms | Long tasks | Max long task ms | Unused JS bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 527 | 0.000 | 0 | 290 | 290 | 4 | 306 | 0 | 0 | 21461 |
| 2 | 100 | 100 | 100 | 100 | 527 | 0.000 | 0 | 291 | 291 | 2 | 292 | 0 | 0 | 21461 |
| 3 | 100 | 100 | 100 | 100 | 526 | 0.000 | 0 | 290 | 290 | 2 | 299 | 0 | 0 | 21461 |

### `/contacto`

#### Mobile

| Run | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms | FCP ms | Speed Index ms | TTFB ms | Main-thread ms | Long tasks | Max long task ms | Unused JS bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 97 | 100 | 100 | 100 | 2563 | 0.027 | 31 | 1061 | 1061 | 2 | 1149 | 3 | 110 | 20828 |
| 2 | 97 | 100 | 100 | 100 | 2557 | 0.027 | 13 | 1060 | 1060 | 2 | 1206 | 3 | 132 | 20828 |
| 3 | 97 | 100 | 100 | 100 | 2563 | 0.027 | 32 | 1059 | 1059 | 2 | 1162 | 3 | 116 | 20828 |

#### Desktop

| Run | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms | FCP ms | Speed Index ms | TTFB ms | Main-thread ms | Long tasks | Max long task ms | Unused JS bytes |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 100 | 100 | 100 | 100 | 530 | 0.000 | 0 | 292 | 292 | 2 | 291 | 0 | 0 | 21176 |
| 2 | 100 | 100 | 100 | 100 | 528 | 0.000 | 0 | 290 | 290 | 2 | 277 | 0 | 0 | 21176 |
| 3 | 100 | 100 | 100 | 100 | 528 | 0.000 | 0 | 293 | 296 | 2 | 299 | 0 | 0 | 20839 |

## Metric Medians

The table below uses independent per-metric medians across the three runs of
each route/profile set.

- It is not a "selected run" table.
- A given row may combine medians drawn from different underlying runs.
- The per-run Lighthouse tables above remain the source of truth for each raw
  report.

| Route | Profile | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms | FCP ms | Speed Index ms | TTFB ms | Main-thread ms | Long tasks | Max long task ms |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | mobile | 93 | 100 | 100 | 100 | 2954 | 0.004 | 77 | 1848 | 1848 | 3 | 2655 | 3 | 165 |
| `/` | desktop | 99 | 100 | 100 | 100 | 834 | 0.037 | 0 | 794 | 794 | 3 | 956 | 0 | 0 |
| `/quienessomos` | mobile | 86 | 100 | 100 | 100 | 2557 | 0.053 | 423 | 1061 | 1824 | 3 | 8374 | 20 | 114 |
| `/quienessomos` | desktop | 100 | 100 | 100 | 100 | 525 | 0.023 | 0 | 292 | 541 | 2 | 1943 | 0 | 0 |
| `/servicios` | mobile | 97 | 100 | 100 | 100 | 2563 | 0 | 34 | 1061 | 1061 | 2 | 1187 | 4 | 137 |
| `/servicios` | desktop | 100 | 100 | 100 | 100 | 527 | 0 | 0 | 290 | 290 | 2 | 299 | 0 | 0 |
| `/contacto` | mobile | 97 | 100 | 100 | 100 | 2563 | 0.027 | 31 | 1060 | 1060 | 2 | 1162 | 3 | 116 |
| `/contacto` | desktop | 100 | 100 | 100 | 100 | 528 | 0 | 0 | 292 | 292 | 2 | 291 | 0 | 0 |

## Historical Comparison

Reference sources:

- `docs/performance/lighthouse-baseline.md`
- `docs/performance/quienes-somos-tbt-attribution-2026-07.md`

Comparison caveats:

- Historical commercial-route data in `lighthouse-baseline.md` was mostly `n=1`
  outside Home.
- Historical baseline used Chrome `149.0.7827.201`.
- Historical `/quienessomos` TBT attribution used Chrome `150.0.7871.127`.
- Current validation used Chrome `150.0.7871.187`.
- Therefore changes below are directional, not exact apples-to-apples claims.

### Against `lighthouse-baseline.md`

| Route | Profile | Historical | Current | Read |
| --- | --- | --- | --- | --- |
| `/` | mobile Perf / TBT / LCP | `93 / 123 ms / 2.89 s` | `93 / 77 ms / 2.95 s` | performance stable, TBT lower, LCP slightly higher and not conclusive under non-identical environments |
| `/` | desktop Perf / TBT / LCP | `99 / 0 ms / 0.85 s` | `99 / 0 ms / 0.83 s` | stable |
| `/quienessomos` | mobile Perf / TBT / LCP | `82 / 638 ms / 2.16 s` | `86 / 423 ms / 2.56 s` | better Perf/TBT, slower LCP, still heaviest route |
| `/quienessomos` | desktop Perf / TBT / LCP | `100 / 0 ms / 0.48 s` | `100 / 0 ms / 0.53 s` | stable within small variance |
| `/servicios` | mobile Perf / TBT / LCP | `99 / 30 ms / 2.14 s` | `97 / 34 ms / 2.56 s` | slight Perf/LCP regression, not clearly material under changed environment and old `n=1` baseline |
| `/servicios` | desktop Perf / TBT / LCP | `100 / 0 ms / 0.48 s` | `100 / 0 ms / 0.53 s` | stable within small variance |
| `/contacto` | mobile Perf / TBT / LCP | `99 / 25 ms / 2.13 s` | `97 / 31 ms / 2.56 s` | slight Perf/LCP regression, not clearly material under changed environment and old `n=1` baseline |
| `/contacto` | desktop Perf / TBT / LCP | `100 / 0 ms / 0.48 s` | `100 / 0 ms / 0.53 s` | stable within small variance |

### Against `/quienessomos` TBT attribution doc

The July attribution document measured a much harsher mobile headless profile for
the globe route:

- Historical median `/quienessomos` mobile TBT there: `1314 ms`
- Current validation metric median `/quienessomos` mobile TBT: `423 ms`

Interpretation:

- current numbers are materially lower than that attribution run set
- the route is still the worst public mobile page by main-thread cost
- this validation does not overturn the attribution document's core conclusion
  that the globe remains the dominant public-route performance risk

## Long Tasks

Lighthouse median long-task counts:

- `/` mobile: `3`, max `165 ms`
- `/quienessomos` mobile: `20`, max `114 ms`
- `/servicios` mobile: `4`, max `137 ms`
- `/contacto` mobile: `3`, max `116 ms`
- all desktop medians: `0`

Interpretation:

- no new desktop long-task problem surfaced after the rollout
- `/quienessomos` remains the dominant mobile long-task route
- Home is the second-highest public mobile main-thread workload

## requestAnimationFrame Cadence And Headless Trace Proxy

Scroll traces were captured for:

- Home
- `/quienessomos`
- `/servicios`

Trace summaries:

| Route | Interaction frames | Avg delta | Max delta | Over 20 ms | Over 33 ms | Idle frames | Idle avg delta | Idle max delta |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 218 | `17.74 ms` | `50.51 ms` | 17 | 5 | 85 | `16.66 ms` | `18.40 ms` |
| `/quienessomos` | 201 | `16.66 ms` | `21.93 ms` | 1 | 0 | 91 | `16.66 ms` | `18.19 ms` |
| `/servicios` | 183 | `19.23 ms` | `216.62 ms` | 10 | 6 | 91 | `16.68 ms` | `18.79 ms` |

Interpretation:

- The trace harness did not measure user-visible compositor presentation
  directly.
- The delta table above was derived from headless trace `DrawFrame`
  timestamps.
- `FireAnimationFrame` totals are reported in the next section as event mix,
  not as the delta source.
- These cadence numbers are therefore a headless scheduling proxy, not a
  definitive visible-browser FPS claim.
- Home and `/quienessomos` showed idle-tail `DrawFrame` spacing clustered near
  `16.66 ms` in the measured headless trace.
- `/servicios` showed the largest interaction gap in the same proxy data.
- That `/servicios` `216.62 ms` gap did not pair with any renderer-main event
  above `50 ms`, so it should be treated as low/medium-confidence evidence of a
  scheduling anomaly rather than a confirmed visual defect.

## Scroll-Profile Event Mix

Selected renderer-main totals during interaction:

- Home:
  - `FunctionCall`: `3918`, total `314.29 ms`
  - `FireAnimationFrame`: `652`, total `54.72 ms`
  - `EventDispatch`: `1271`, total `193.10 ms`
  - `UpdateLayoutTree`: `386`, total `128.60 ms`
- `/quienessomos`:
  - `FunctionCall`: `1531`, total `121.33 ms`
  - `FireAnimationFrame`: `750`, total `103.96 ms`
  - `UpdateLayoutTree`: `265`, total `41.12 ms`
- `/servicios`:
  - `FunctionCall`: `1414`, total `59.72 ms`
  - `FireAnimationFrame`: `579`, total `47.60 ms`
  - `UpdateLayoutTree`: `240`, total `29.67 ms`

Idle tails still showed ongoing animation-frame activity:

- Home idle:
  - `FunctionCall`: `880`, total `72.31 ms`
  - `FireAnimationFrame`: `192`, total `30.70 ms`
- `/quienessomos` idle:
  - `FunctionCall`: `287`, total `33.05 ms`
  - `FireAnimationFrame`: `279`, total `34.60 ms`
- `/servicios` idle:
  - `FunctionCall`: `194`, total `21.14 ms`
  - `FireAnimationFrame`: `188`, total `22.78 ms`

Read:

- Public routes do not go completely silent at rest.
- That is consistent with the public GSAP ticker owning `lenis.raf(...)` and
  with route-level animation work.
- Listener counts did not grow across navigation cycles, so this looks like
  expected persistent ticker activity rather than duplicated callbacks.

## Lag Smoothing Analysis

Static finding:

- `LenisScrollProvider.jsx` calls `gsap.ticker.lagSmoothing(0)`
- cleanup does not restore the prior GSAP global lag-smoothing state
- `node_modules/lenis/README.md` includes the same GSAP integration pattern and
  explicitly recommends `gsap.ticker.lagSmoothing(0)` in that setup example

Focused runtime comparison:

- Case A: navigate from `/` to `/labs/parallax-window`
- Case B: cold direct open of `/labs/parallax-window`

Observed parity:

- initial `scrollY: 0` in both cases
- no `lenis` classes in both cases
- one wheel gesture moved `scrollY` to `900` in both cases
- no scroll blocking observed

Conclusion:

- No observable user-facing regression from the non-restored `lagSmoothing(0)`
  was reproduced in this smoke validation.
- The global-state mutation remains an ownership ambiguity and maintenance risk
  because it survives cleanup and applies beyond enabled Lenis routes.
- In the current evidence set, it is not a reproduced user-facing bug.

## Overall Conclusion

- No functional defect of the public Lenis rollout was confirmed in this
  validation update.
- One independent accessibility defect was confirmed in `ScrollCue` reduced
  motion: its dot animation is not neutralized when the active selector wins
  the CSS cascade on specificity.

## Defects Found

No functional Lenis defect was confirmed in this corrective review.

### 1. ScrollCue reduced-motion rule loses the CSS cascade

Reproduced on:

- public-route `ScrollCue`
- focused runtime probe on `/servicios`
- `prefers-reduced-motion: reduce`

Observed:

- `matchMedia("(prefers-reduced-motion: reduce)").matches === true`
- `data-visible="true"`
- `data-dot-active="true"`
- computed `animation-name`:
  `ScrollCue_cwdScrollCueDotTravel__tWCmU`
- computed `animation-duration`: `2.36s`
- computed `animation-play-state`: `running`
- computed `transform`: `matrix(1, 0, 0, 1, -2.5, 25.1257)`

Cause:

- reduced-motion selector:
  `.cue[data-visible="true"] .dot` = `0,3,0`
- active selector:
  `.cue[data-visible="true"][data-dot-active="true"] .dot` = `0,4,0`
- the active selector is more specific, so the later reduced-motion media-query
  rule does not override it in the active visible state

Impact:

- global `ScrollCue` on public routes does not currently neutralize its dot
  animation under reduced motion when the cue is visible and active

Classification:

- confirmed accessibility defect
- not a Lenis defect
- documented only; not corrected in this branch

### 2. Contact success path not verified in local environment

Reproduced on:

- `/contacto`
- desktop `1440x900`

Observed:

- filled submit attempt reached error status:
  `Error enviando mensaje. Intenta nuevamente.`
- form remained focus-safe and accessible

Impact:

- this validation confirms accessible error handling
- it does not confirm successful delivery in the current local environment

Classification:

- environment-dependent / not enough evidence to classify as a Lenis defect

## Limitations

- Touch validation used mobile emulation only, not physical hardware.
- Visual judgment for the Home Benefits title fade remains inconclusive here.
- Lighthouse and trace results are synthetic and headless.
- The ScrollCue reduced-motion cascade defect was confirmed through a headless
  computed-style probe; this validation did not measure its perceptual
  magnitude in a visible-browser pass.
- Listener counts came from CDP snapshots of `window` and `document` only.
- Metric medians are independent per metric and do not correspond to a single
  coherent Lighthouse report.
- Historical comparisons mix Chrome `149` and `150` and mix `n=1` and `n=3`
  baselines.
- Success path for the canonical Contact form was not observed locally.
- Out-of-scope known issues were not corrected:
  - `GlassContactForm` submit interception
  - Home Benefits title fade still needing stronger visual evidence
  - `/labs/global-scroll-inertia` missing `robots` noindex
  - Next / SWC version mismatch

## Residual Risks

- `ScrollCue` does not currently neutralize its dot animation under
  `prefers-reduced-motion` because its reduced-motion selector loses on
  specificity.
- `gsap.ticker.lagSmoothing(0)` remains globally mutated after public Lenis cleanup.
- `/quienessomos` is still the highest-cost public mobile route by main-thread work.
- Public routes keep idle animation-frame activity; this is not duplicated, but it
  means the rollout should not be described as "fully idle" after settling.
- `/servicios` interaction trace showed the largest frame gap in headless capture;
  visual behavior remained acceptable in the measured smoke, but a non-headless
  pass would reduce uncertainty.

## Recommendation For The Next Increment

Recommended next follow-up, without mixing concerns:

1. Apply a scoped CSS fix for `ScrollCue` reduced motion so the active dot rule
   no longer outranks the reduced-motion override, without changing normal
   behavior and without touching Lenis, routes, provider, GSAP, observers, or
   other animations.
2. Decide whether `gsap.ticker.lagSmoothing(0)` should be restored on cleanup or
   intentionally owned at a broader lifecycle boundary.
3. Keep globe work isolated from Lenis rollout decisions; `/quienessomos` remains
   a route-specific performance topic.
4. Continue any non-headless visual follow-up as perceptual validation work,
   not as a prerequisite for confirming the ScrollCue cascade defect.

## Declaration

- No production code was modified in this increment.
- No dependency was changed.
- No route was recalibrated.
- No observer, threshold, or state-machine code was edited.
- The only repository file intended for this increment is this document.

# `/quienessomos` Mobile TBT Attribution - 2026-07

## Scope

This is a measurement-and-attribution increment for `/quienessomos` mobile Total
Blocking Time. It does not optimize production source and it does not change the
accepted globe visual output.

Work is split deliberately:

- The operator must provide raw empirical artifacts from a real browser and the
  documented reference environment.
- Codex performs deterministic repository work: git checks, static source
  inspection, clean install/build, build-manifest attribution, and documentation.

Hard rule for this report: no empirical measurement is invented, estimated, or
reconstructed. Missing raw artifacts are recorded as `UNRESOLVED — artifact
missing`.

## Non-Negotiable Visual Constraint

The globe is a primary visual element. This increment does not change and does
not recommend changing point counts, point appearance, palette, intensity,
radius, axial tilt, camera, position, dimensions, pixel-ratio cap, route
segments, route destinations, geometry, pulse appearance, timing, atmosphere,
bloom, tone mapping, exposure, shader reveal, choreography order, rotation,
animation loop, or reduced-motion behavior.

Rejected approaches remain rejected: lower-quality mobile tier, static globe
poster, skeleton replacement, deferred mount, idle mount, IntersectionObserver
mount scheduling, delayed hydration, bloom removal, DPR reduction, point-count
reduction, and route simplification.

## Base And Environment

- Branch: `perf/cwd-quienes-somos-tbt-attribution`
- Old branch HEAD before fast-forward: `595c991`
- Current base commit: `f6ef3a8`
- Base commit subject: `Merge pull request #35 from Yamila-Pereyra/fix/cwd-home-accessibility-remediation`
- `origin/develop...HEAD` after fast-forward: `0 0`
- Home accessibility remediation: commit `20cb183` is present in the base through `origin/develop`
- Node.js: `v24.13.0`
- npm: `11.6.2`
- Next.js: `15.5.11`

## Operator Artifact Inventory

No operator-provided raw empirical artifacts were supplied to Codex for this
increment.

| Artifact set | Required | Provided path | Integrity | Status |
| --- | --- | --- | --- | --- |
| `/quienessomos` Lighthouse mobile JSON/HTML, n=5 | yes | not provided | not available | UNRESOLVED — artifact missing |
| `/quienessomos` Lighthouse desktop JSON/HTML, n=3 | yes | not provided | not available | UNRESOLVED — artifact missing |
| `/labs/globe` Lighthouse mobile JSON/HTML, n=3 | yes | not provided | not available | UNRESOLVED — artifact missing |
| `/labs/globe` Lighthouse desktop guard JSON/HTML, n=1 | yes | not provided | not available | UNRESOLVED — artifact missing |
| Median `/quienessomos` Lighthouse trace/artifacts | yes | not provided | not available | UNRESOLVED — artifact missing |
| DevTools Performance profile for median `/quienessomos` | yes | not provided | not available | UNRESOLVED — artifact missing |
| Runtime JS coverage for `/quienessomos` | yes | not provided | not available | UNRESOLVED — artifact missing |
| Runtime JS coverage for `/labs/globe` | yes | not provided | not available | UNRESOLVED — artifact missing |
| GPU-enabled DevTools trace for `/quienessomos` globe reveal | yes | not provided | not available | UNRESOLVED — artifact missing |
| GPU-enabled DevTools trace for `/labs/globe` globe reveal | yes | not provided | not available | UNRESOLVED — artifact missing |
| `window.__codeworkGlobeTimingRuns`, `/quienessomos`, n>=5 | yes | not provided | not available | UNRESOLVED — artifact missing |
| `window.__codeworkGlobeTimingRuns`, `/labs/globe`, n>=5 | yes | not provided | not available | UNRESOLVED — artifact missing |
| `window.__codeworkGlobeLastTimings`, both routes | yes | not provided | not available | UNRESOLVED — artifact missing |
| Visual-fidelity screenshots/recordings | yes | not provided | not available | UNRESOLVED — artifact missing |

## Historical Evidence

Historical data was read from:

- `CWD/front/docs/performance/lighthouse-baseline.md`
- `CWD/front/docs/performance/experiments/globe-deferral-2026-07.md`

These values are indicative only. They were measured on old commit `11b7461`
with `/quienessomos` mobile n=1, before later work landed on `develop`.

Historical `/quienessomos` mobile:

| Metric | Value |
| --- | ---: |
| Performance | 82 |
| TBT | 638 ms |
| Main-thread work | 8.8 s |
| LCP | 2.16 s |
| CLS | 0.053 |
| Unused JavaScript estimate | ~85 KiB |

Historical `/labs/globe` mobile, same progressive globe, n=1:

| Metric | Value |
| --- | ---: |
| Performance | 93 |
| TBT | 272 ms |

Rejected deferred-mount experiment:

| Metric | Result |
| --- | ---: |
| Performance | 77 |
| TBT | 910 ms |
| LCP delta | no material improvement |
| CLS delta | no material improvement |

The deferred-mount experiment was reverted and must not be reintroduced as a
candidate. The historical `638 ms` TBT may no longer represent the current
route because substantial Home/accessibility/contact changes landed after
`11b7461`.

## Current Implementation Map

Inspected files:

- `CWD/front/src/components/QuienesSomosPageContent.jsx`
- `CWD/front/src/components/labs/globe/GlobeLab.jsx`
- `CWD/front/src/components/labs/globe/globe-points.worker.js`
- `CWD/front/src/components/labs/globe/globe-lab.css`
- `CWD/front/src/app/labs/globe/page.jsx`
- `CWD/front/package.json`
- `CWD/front/next.config.mjs`

### Callers

| Caller | Loading mode | Props | Current mode |
| --- | --- | --- | --- |
| `QuienesSomosPageContent.jsx` | `dynamic(() => import("@/components/labs/globe/GlobeLab"), { ssr: false })` | `wrapper="div"`, route classes, `ariaLabel`, `progressiveReveal` | progressive |
| `app/labs/globe/page.jsx` | static import | `progressiveReveal` | progressive |

Both verified callers pass `progressiveReveal`. Therefore non-progressive-only
runtime code is dormant for current known routes. It is a candidate boundary for
future investigation only, not removable evidence in this increment.

### Static Imports

`GlobeLab.jsx` imports:

- React `useEffect`, `useRef`
- `three`
- `EffectComposer`
- `RenderPass`
- `UnrealBloomPass`
- `topojson-client`
- `world-atlas/land-110m.json`
- `./globe-lab.css`

`globe-points.worker.js` imports:

- `topojson-client`
- `world-atlas/land-110m.json`

### Main-Thread Progressive Work

In progressive mode, main-thread work includes:

- Three.js scene, camera, renderer, tone mapping and pixel-ratio setup
- optional bloom composer setup, deferred until `enableBloom()` in the current
  progressive path unless the choreography setting changes
- globe axis/group construction
- shell geometry/material creation
- capital marker geometry/material creation
- large typed-array allocation for positions, colors, reveal timings,
  durations, sizes, and intensities
- `BufferGeometry` and shader material setup
- draw-range updates and `BufferAttribute.needsUpdate` on worker batches
- route-stage scheduling and route construction with `routeSegments = 72`
- animation-loop startup through `requestAnimationFrame`
- resize handling and renderer/composer sizing
- timing-global publication on every progressive run

### Worker Work

The worker performs:

- topology feature conversion and land polygon preparation at module load
- candidate point sampling
- land containment checks
- deterministic color, reveal-time, reveal-duration, size and intensity
  generation
- batched transfer of `Float32Array` buffers for positions, colors, reveal
  times, reveal durations, sizes and intensities

Worker messages transfer buffers, not cloned payload buffers. Main-thread
handling still copies each incoming batch into preallocated destination buffers.

### Fallback Main-Thread Point Generation

If worker startup fails or workers are unavailable, progressive mode falls back
to main-thread point generation. This fallback exercises the same topology and
point-generation concepts on the main thread. Because current browser support is
unknown without operator traces, fallback execution is not assumed.

### Non-Progressive Dormant Code

Non-progressive code currently follows the `if (progressiveReveal) { ... return
cleanup; }` branch exit and is not exercised by the verified callers. It
includes synchronous land-point generation through `getContinentalSphereData`,
static point material setup, route construction, bloom composer creation at
initial setup when `useBloom` is true, and timing publication only when
debugging is enabled.

This code is dormant for known production/lab callers but must not be deleted in
this increment.

### Lab-Only Diagnostics

`debugTimings` defaults to `false`. Timing globals are populated for progressive
runs regardless of URL flag; `globeDebug=1` additionally triggers
`console.table`. The lab page is `noindex`.

## Clean Production Build

Commands run from `CWD/front`:

```powershell
Remove-Item -LiteralPath .next -Recurse -Force
npm ci
npm run build
```

`npm ci` result:

- Success
- Added 26 packages
- Audited 27 packages
- Warnings: `Unknown env config "min-release-age"`
- Vulnerabilities: `3 vulnerabilities (1 moderate, 2 high)`

`npm run build` result:

- Success
- Next.js `15.5.11`
- Compiled successfully
- Generated static pages: 11/11

Build warnings:

- `Unknown env config "min-release-age"`
- `Mismatching @next/swc version, detected: 15.5.7 while Next.js is on 15.5.11`

Next route sizes:

| Route | Size | First Load JS |
| --- | ---: | ---: |
| `/` | 56.3 kB | 171 kB |
| `/_not-found` | 991 B | 104 kB |
| `/contacto` | 2.78 kB | 117 kB |
| `/icon.png` | 0 B | 0 B |
| `/labs/globe` | 170 kB | 273 kB |
| `/quienessomos` | 1.78 kB | 113 kB |
| `/robots.txt` | 127 B | 103 kB |
| `/servicios` | 1.68 kB | 119 kB |
| `/sitemap.xml` | 127 B | 103 kB |

Shared first-load chunks:

| Chunk | Size |
| --- | ---: |
| `chunks/255-35bf8c00c5dde345.js` | 46 kB |
| `chunks/4bd1b696-c023c6e3521b1417.js` | 54.2 kB |
| Other shared chunks | 2.65 kB |

## Build Manifest Attribution

From `.next/app-build-manifest.json` and `.next/react-loadable-manifest.json`:

`/quienessomos/page` initial route files:

| File | Bytes |
| --- | ---: |
| `static/chunks/webpack-5fcaf2c780fd5a50.js` | 5,057 |
| `static/chunks/4bd1b696-c023c6e3521b1417.js` | 173,019 |
| `static/chunks/255-35bf8c00c5dde345.js` | 172,500 |
| `static/chunks/main-app-5da43266f058b91f.js` | 555 |
| `static/chunks/999-7f21a9ed5bd99a3d.js` | 28,600 |
| `static/chunks/app/quienessomos/page-66e6b9bb1760bbbe.js` | 5,151 |

Dynamic `GlobeLab` files loaded by `QuienesSomosPageContent.jsx`:

| File | Bytes |
| --- | ---: |
| `static/css/c68ee3bdd08eb935.css` | 318 |
| `static/chunks/bd904a5c-ea064c5fbddd022f.js` | 197,748 |
| `static/chunks/b536a0f1-398ddf0b801ede08.js` | 347,605 |
| `static/chunks/680-3600909222dc88d5.js` | 56,878 |
| `static/chunks/96-7741e1d85ed9d7b2.js` | 16,047 |
| `static/chunks/692-0e59529941cc7fac.js` | 29,289 |

`/labs/globe/page` includes the same globe-related chunk set in its route
manifest plus `static/chunks/app/labs/globe/page-490133e90b4faf0c.js` at 197
bytes.

Static bundle attribution indicates that `/quienessomos` can load the globe
implementation through the dynamic component boundary, while `/labs/globe`
includes the same globe chunk family directly in the route. Used-vs-unused byte
counts require runtime coverage and remain unresolved.

## Current Lighthouse Results

UNRESOLVED — artifact missing.

No current operator-provided Lighthouse JSON/HTML artifacts were supplied.
Codex did not run substitute Lighthouse rebaselines because the prompt assigns
raw empirical artifact production to the operator and forbids reconstructing
missing measurements.

Required missing data:

- five `/quienessomos` mobile runs
- three `/quienessomos` desktop runs
- three `/labs/globe` mobile runs
- one `/labs/globe` desktop guard run

Median selection, score spread, TBT spread, and comparison against the
historical 638 ms cannot be determined from supplied artifacts.

## Long-Task Attribution

UNRESOLVED — artifact missing.

No representative mobile trace was supplied. Therefore no tasks above 50 ms can
be tabulated and no cumulative TBT represented by identified tasks can be
computed.

Required missing fields per task:

- start time
- duration
- category
- script URL or chunk
- function/stack when available
- hydration, React, Three.js, renderer setup, module evaluation,
  topology/atlas processing, buffer allocation/upload, worker-message handling,
  route construction, bloom/composer, animation frame, or unrelated site code
  classification

## Globe Phase Timings

UNRESOLVED — artifact missing.

No dumps of `window.__codeworkGlobeTimingRuns` or
`window.__codeworkGlobeLastTimings` were supplied. Median/spread by phase cannot
be calculated.

Known available timing labels from static source include:

- `globe:renderer`
- `globe:first-shell`
- `globe:point-geometry-ready`
- `globe:bloom-composer-ready`
- `globe:first-point-batch`
- `globe:first-points`
- `globe:low-density-globe`
- `globe:capital-drop-start`
- `globe:atmosphere-fade-start`
- `globe:dense-mesh-revealed`
- `globe:first-revealed-points`
- `globe:trajectory-N`
- `globe:full-visual-completion`
- `globe:rendered-points`
- `globe:candidate-points`
- `globe:data-cache-hit`
- `globe:pixel-ratio-cap`
- `globe:bloom`
- `globe:progressive-reveal`
- `globe:shader-reveal`
- `globe:reveal-duration-ms`
- `globe:reduced-motion`

Static labels are not measurements.

## GPU-Disabled Versus GPU-Enabled Comparison

UNRESOLVED — artifact missing.

Historical Lighthouse used headless Chrome with `--disable-gpu`, but no current
GPU-enabled traces were supplied for comparison. The report cannot determine
whether current synthetic TBT is strongly coupled to the no-GPU environment.

The correct future comparison requires:

- no-GPU Lighthouse trace
- GPU-enabled DevTools trace for `/quienessomos`
- GPU-enabled DevTools trace for `/labs/globe`
- comparable throttling
- frame cadence and renderer initialization comparison

## JavaScript Coverage And Bundle Findings

Runtime used-vs-unused coverage:

UNRESOLVED — artifact missing.

Static build findings:

- The route `/quienessomos` has small page code in the initial manifest and
  loads the globe implementation through a dynamic `GlobeLab` boundary.
- The route `/labs/globe` includes the same globe chunk family directly.
- The globe chunk family includes large chunks consistent with Three.js and
  postprocessing, plus smaller implementation/runtime chunks.
- `GlobeLab.jsx` statically imports `three`, `EffectComposer`, `RenderPass`,
  `UnrealBloomPass`, `topojson-client`, and `world-atlas/land-110m.json`.
- `globe-points.worker.js` also imports `topojson-client` and
  `world-atlas/land-110m.json`.
- Both verified callers use `progressiveReveal`, so non-progressive-only code
  is dormant for current callers but still present in the module.
- Whether dormant code is downloaded, parsed, evaluated, or tree-shaken in a
  way that materially affects TBT requires source-map and runtime coverage
  correlation with real traces.

## Dominant TBT Classification

Classification: `J. mixed / insufficient attribution`

Confidence: high that attribution is insufficient; low for any specific source
category.

Reason:

- No current median Lighthouse artifacts were provided.
- No representative long-task trace was provided.
- No runtime coverage was provided.
- Static source and build manifests identify plausible boundaries but cannot
  establish blocking duration or causality.

Candidate categories that remain plausible but unproven:

- JavaScript download/parse/compile
- module evaluation
- renderer/scene initialization
- worker-message handling and buffer copies/uploads
- route construction
- bloom/composer initialization
- unrelated `/quienessomos` page code

No category is selected as dominant without trace evidence.

## Mandatory Route-Delta Diagnosis

UNRESOLVED — artifact missing.

Historical n=1 route delta:

- `/quienessomos` mobile TBT: 638 ms
- `/labs/globe` mobile TBT: 272 ms
- Historical delta: 366 ms

This historical delta is informative but not sufficient. It may reflect
globe-intrinsic work, `/quienessomos` page-specific hydration/layout/surrounding
content, no-GPU variance, or n=1 measurement variance. Current measurements for
both routes are required to reconcile the delta.

Because no current `/quienessomos` and `/labs/globe` raw Lighthouse/trace
artifacts were supplied, the current route delta cannot be attributed.

## Candidate Next Increments

No implementation candidate is approved yet because the hard decision rules
require a current meaningful TBT issue and concrete trace attribution.

Evidence-gated candidates for later consideration only:

| Rank | Candidate | Expected TBT mechanism | Source boundary | Visual risk | Implementation risk | Required validation | Rollback condition |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | Isolate dormant non-progressive code from the progressive production entrypoint | Reduce parse/evaluation if dormant code is currently included in the progressive path | `GlobeLab.jsx` module boundary | low if output unchanged | medium | source-map coverage, before/after Lighthouse/trace, visual baseline match | any visual diff or no TBT reduction |
| 2 | Prevent progressive routes from parsing main-thread fallback topology until Worker failure | Reduce initial parse/evaluation if fallback topology is loaded eagerly | fallback point-generation/topology boundary | low if fallback behavior preserved | medium | coverage proves fallback parsed unused, Worker failure test, before/after trace | fallback regression or no measurable reduction |
| 3 | Split expensive postprocessing module loading from initial module evaluation while preserving exact bloom onset/final appearance | Move or reduce initial module evaluation tied to bloom only if trace shows postprocessing dominates | `EffectComposer`, `RenderPass`, `UnrealBloomPass` boundary | medium because bloom timing must remain exact | medium-high | trace proves bloom module cost, pixel/recording comparison, before/after timings | bloom onset/final-state mismatch |

Selected next increment: none. The correct next action is to collect the missing
operator artifacts first. If current median mobile TBT is materially healthy,
the next increment should be RUM/INP collection rather than source
optimization.

## Visual-Fidelity Baseline Artifacts

UNRESOLVED — artifact missing.

No screenshot, recording, canvas metadata, effective pixel ratio, point count,
route count, or visual-completion timing artifacts were supplied. A future
optimization cannot be accepted until these captures exist outside the repo and
are referenced here or in a follow-up report.

Required captures:

- initial shell
- Italy seed
- continental reveal in progress
- capitals
- atmosphere
- trajectories
- bloom-complete final state
- desktop and representative mobile viewport
- `es`, `en`, `it`
- normal and reduced motion

## Limitations

- No raw empirical operator artifacts were provided.
- No current Lighthouse medians or spreads were calculated.
- No long tasks were attributed.
- No globe timing medians were calculated.
- No GPU/no-GPU comparison was possible.
- No runtime coverage used/unused bytes were recorded.
- Static build manifests identify chunk boundaries but cannot prove blocking
  causality.

## Explicit Production-Source Statement

No production source changed in this increment. The only repository change is
this documentation file:

`CWD/front/docs/performance/quienes-somos-tbt-attribution-2026-07.md`

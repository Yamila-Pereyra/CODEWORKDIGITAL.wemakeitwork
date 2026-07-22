# `/quienessomos` Mobile TBT Attribution - 2026-07

## Scope

This is a measurement-and-attribution increment for `/quienessomos` mobile Total
Blocking Time. It does not optimize production source and it does not change the
accepted globe visual output.

No production source changed in this increment. The only repository change is
this documentation file.

## Visual Constraint

The globe is a primary visual element. This report does not change or recommend
changing point counts, point appearance, palette, intensity, radius, axial tilt,
camera, position, dimensions, pixel-ratio cap, route segments, destinations,
geometry, pulse appearance, timing, atmosphere, bloom, tone mapping, exposure,
shader reveal, choreography order, rotation, animation loop, or reduced-motion
behavior.

Rejected approaches remain rejected: lower-quality mobile tier, static poster,
skeleton replacement, deferred mount, idle mount, IntersectionObserver mount
scheduling, delayed hydration, bloom removal, DPR reduction, point-count
reduction, and route simplification.

## Base And Environment

- Branch: `perf/cwd-quienes-somos-tbt-attribution`
- Base commit: `55b1c46`
- Base subject: `Merge pull request #36 from Yamila-Pereyra/perf/cwd-quienes-somos-tbt-attribution`
- Previous documentation commit already merged: `a02d797`
- Node.js: `v24.13.0`
- npm: `11.6.2`
- Next.js: `15.5.11`
- Lighthouse: `13.4.0` through `npx --yes lighthouse@13.4.0`
- Browser: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Browser version: `150.0.7871.127`
- Production server command: `npm run start -- -p 3000`
- Production server port: `3000`

Tool discovery:

| Command | Result |
| --- | --- |
| `where.exe chrome` | not found, exit `1` |
| `where.exe msedge` | not found, exit `1` |
| `where.exe chromium` | not found, exit `1` |
| `where.exe lighthouse` | not found, exit `1` |
| `where.exe npx` | found JetBrains Node runtime and `C:\Program Files\nodejs\npx`, exit `0` |

Common browser paths inspected:

| Path | Exists | Version |
| --- | --- | --- |
| `C:\Program Files\Google\Chrome\Application\chrome.exe` | yes | `150.0.7871.127` |
| `C:\Program Files(x86)\Google\Chrome\Application\chrome.exe` | no | n/a |
| `%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe` | no | n/a |
| `C:\Program Files\Microsoft\Edge\Application\msedge.exe` | no | n/a |
| `C:\Program Files(x86)\Microsoft\Edge\Application\msedge.exe` | no | n/a |
| `%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe` | no | n/a |

## Build

Commands run from `CWD/front`:

```powershell
if (Test-Path .next) { Remove-Item -LiteralPath .next -Recurse -Force }
npm ci
npm run build
```

Results:

- `npm ci`: success; added 26 packages; audited 27 packages.
- `npm ci` warnings: `Unknown env config "min-release-age"`.
- `npm ci` vulnerabilities: `3 vulnerabilities (1 moderate, 2 high)`.
- `npm run build`: success.
- Build warnings: `Unknown env config "min-release-age"` and repeated
  `Mismatching @next/swc version, detected: 15.5.7 while Next.js is on 15.5.11`.

Next route sizes:

| Route | Size | First Load JS |
| --- | ---: | ---: |
| `/` | 56.3 kB | 171 kB |
| `/contacto` | 2.79 kB | 117 kB |
| `/labs/globe` | 170 kB | 273 kB |
| `/quienessomos` | 1.78 kB | 113 kB |
| `/servicios` | 1.68 kB | 119 kB |

Server checks:

- `http://localhost:3000/quienessomos`: HTTP 200.
- `http://localhost:3000/labs/globe`: HTTP 200.

## Artifact Inventory

Raw artifacts were written outside the repository:

`C:\Users\marce\AppData\Local\Temp\cwd-tbt-attribution-20260722-173109`

The complete per-file inventory with SHA-256 hashes is in:

| Artifact | Bytes | SHA-256 |
| --- | ---: | --- |
| `derived-summary.json` | 47,081 | `EF6E39D00817810BFB4C6F4258B975B5AF6A37525F2DDBAC98C169456560439D` |
| `lighthouse-summary.json` | 9,419 | `39CD71E9F7BA7569C24F735AF2EFACED8BAD7D0E7A839D2CEF69238BBACA3CE8` |
| `quienessomos-mobile-2.report.json` | 804,508 | `F6BD6D5326E20E0FA59A4E925DDA2DA99EAC6DF8957FB3113A7D70C977E576F6` |
| `quienessomos-mobile-2.report.html` | 865,712 | `D80FCEB2CA3CCA52B3F8DF970B5A9F0F3DD00F349298476FA03BA27D92603357` |
| `quienessomos-mobile-trace.json` | 14,596,467 | `BD72449D8BF68ACD7EC514962E0DB63B47A32E1F64446D5A3832EFEC5937ED15` |
| `quienessomos-mobile-longtasks.json` | 4,851 | `59460F9184C33C60B828C90E9EA54717568DB46A1702C221A76A785F0A3B6C02` |
| `quienessomos-timings.json` | 15,334 | `0C0778B9CF326A4D4B5F4601FFB83529B197E4997E61AD8F29DE28A05BC2FC35` |
| `labs-globe-timings.json` | 15,344 | `9C605F25835065F7544A043ACDF0A8A4E8D8817FA0FADA689CDED57F31BB0077` |
| `quienessomos-coverage.json` | 3,758 | `6C62287F376452289A80E35ABD496E87C0D408E8B22FDA808974358EEB5459C2` |
| `labs-globe-coverage.json` | 3,740 | `1601DFD51451AEE18B603DBB310B434EAEA6F0334409DF68EA09ED669F5C918A` |
| `quienessomos-gpu-windowed-timings.json` | 15,262 | `05CCFB4FD35DB38500583578DCBF6C5BDE8032EF3AA0F05ED57F4F5DC91E4110` |
| `quienessomos-desktop-final-bloom.png` | 632,892 | `64CC0A7B0B5A33E4A549F53DB004F143C2F3D0F6F0E12535495718590FC16573` |
| `quienessomos-mobile-final-bloom.png` | 199,605 | `43190BEEB470038FDCA306DBBEE9BBC504B6946C49B90C37EE8C1155A2322258` |

Initial failed attempt:

- Attempted to run Lighthouse through `Start-Process -ArgumentList @(...)
  + ...`.
- Failure: PowerShell parameter binding error,
  `A positional parameter cannot be found that accepts argument '+'`.
- Exit condition: no JSON/HTML was produced by that attempt.
- Resolution: reran with a prebuilt `$args` array and sequential Chrome
  remote-debugging sessions.

CDP trace attempt note:

- First Puppeteer trace attempt under throttling timed out at navigation:
  `TimeoutError: Navigation timeout of 60000 ms exceeded`.
- Resolution: reran with `waitUntil: "load"`, explicit canvas waits, and fixed
  post-load waits.

## Historical Evidence

Historical data was read from:

- `CWD/front/docs/performance/lighthouse-baseline.md`
- `CWD/front/docs/performance/experiments/globe-deferral-2026-07.md`

Historical `/quienessomos` mobile, old commit `11b7461`, n=1:

| Metric | Value |
| --- | ---: |
| Performance | 82 |
| TBT | 638 ms |
| Main-thread work | 8.8 s |
| LCP | 2.16 s |
| CLS | 0.053 |
| Unused JavaScript estimate | ~85 KiB |

Historical `/labs/globe` mobile, same progressive globe, old commit `11b7461`,
n=1:

| Metric | Value |
| --- | ---: |
| Performance | 93 |
| TBT | 272 ms |

Rejected deferred-mount experiment:

| Metric | Result |
| --- | ---: |
| Performance | 77 |
| TBT | 910 ms |
| LCP / CLS | no material improvement |

The deferred-mount experiment was reverted and must not be reintroduced.

## Current Implementation Map

Inspected files:

- `CWD/front/src/components/QuienesSomosPageContent.jsx`
- `CWD/front/src/components/labs/globe/GlobeLab.jsx`
- `CWD/front/src/components/labs/globe/globe-points.worker.js`
- `CWD/front/src/components/labs/globe/globe-lab.css`
- `CWD/front/src/app/labs/globe/page.jsx`
- `CWD/front/package.json`
- `CWD/front/next.config.mjs`

Callers:

| Caller | Loading mode | Props | Current mode |
| --- | --- | --- | --- |
| `QuienesSomosPageContent.jsx` | `dynamic(..., { ssr: false })` | route wrapper/classes, `ariaLabel`, `progressiveReveal` | progressive |
| `app/labs/globe/page.jsx` | static import | `progressiveReveal` | progressive |

Both verified callers pass `progressiveReveal`. Non-progressive-only runtime code
is dormant for current known routes.

Progressive main-thread work includes renderer setup, scene/camera/groups,
shell/capital marker creation, large typed-array allocation, `BufferGeometry`
and shader material setup, draw-range and attribute updates, route-stage
scheduling, route construction, animation-loop startup, resize handling, and
timing-global publication.

Worker work includes topology feature conversion, land polygon preparation,
candidate point sampling, land containment checks, deterministic point
attribute generation, and transferred `Float32Array` batches. Main-thread batch
handling copies incoming buffers into preallocated destination buffers.

## Build Manifest Attribution

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
manifest plus a tiny lab page chunk.

## Lighthouse Commands

Each run used a fresh Chrome process launched with:

```powershell
C:\Program Files\Google\Chrome\Application\chrome.exe `
  --headless --no-sandbox --disable-gpu --disable-dev-shm-usage `
  --remote-debugging-port=<port> `
  --remote-debugging-address=127.0.0.1 `
  --user-data-dir=<temp-profile> about:blank
```

Mobile command pattern:

```powershell
npx --yes lighthouse@13.4.0 http://localhost:3000/quienessomos `
  --port=<port> --output=json --output=html --output-path=<artifact-base> --quiet
```

Desktop command pattern:

```powershell
npx --yes lighthouse@13.4.0 http://localhost:3000/quienessomos `
  --port=<port> --preset=desktop --output=json --output=html `
  --output-path=<artifact-base> --quiet
```

Equivalent commands were used for `/labs/globe`.

## Lighthouse Results

`/quienessomos` mobile, n=5:

| Run | Perf | TBT ms | LCP ms | CLS | FCP ms | Speed Index ms | TTFB ms | Main-thread ms | Long tasks | Max long task ms | Unused JS KiB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `quienessomos-mobile-1` | 76 | 1042 | 2143 | 0.053 | 1088 | 1963 | 9 | 9967 | n/a | n/a | n/a |
| `quienessomos-mobile-2` | 74 | 1314 | 2127 | 0.053 | 1066 | 1930 | 4 | 10248 | n/a | n/a | n/a |
| `quienessomos-mobile-3` | 69 | 2730 | 2126 | 0.053 | 1065 | 1928 | 3 | 10271 | n/a | n/a | n/a |
| `quienessomos-mobile-4` | 71 | 1862 | 2160 | 0.053 | 1065 | 1868 | 3 | 10231 | n/a | n/a | n/a |
| `quienessomos-mobile-5` | 75 | 1189 | 2153 | 0.053 | 1066 | 1900 | 3 | 10184 | n/a | n/a | n/a |

Median selection by TBT: `quienessomos-mobile-2`.

Spread:

| Metric | Min | Median | Max | Spread |
| --- | ---: | ---: | ---: | ---: |
| Performance | 69 | 74 | 76 | 7 |
| TBT | 1042 ms | 1314 ms | 2730 ms | 1688 ms |
| LCP | 2126 ms | 2143 ms | 2160 ms | 34 ms |
| CLS | 0.053 | 0.053 | 0.053 | 0 |

`/quienessomos` desktop, n=3:

| Run | Perf | TBT ms | LCP ms | CLS | FCP ms | Speed Index ms | TTFB ms | Main-thread ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `quienessomos-desktop-1` | 100 | 0 | 477 | 0.023 | 295 | 574 | 2 | 1998 |
| `quienessomos-desktop-2` | 100 | 0 | 480 | 0.023 | 293 | 574 | 3 | 1975 |
| `quienessomos-desktop-3` | 100 | 0 | 478 | 0.023 | 291 | 568 | 3 | 1972 |

`/labs/globe` mobile, n=3:

| Run | Perf | TBT ms | LCP ms | CLS | FCP ms | Speed Index ms | TTFB ms | Main-thread ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `labs-globe-mobile-1` | 72 | 1542 | 2346 | 0 | 1068 | 2186 | 3 | 10712 |
| `labs-globe-mobile-2` | 73 | 1295 | 2343 | 0 | 1066 | 2043 | 2 | 10307 |
| `labs-globe-mobile-3` | 70 | 1517 | 2693 | 0 | 1066 | 2127 | 2 | 10334 |

Median selection by TBT: `labs-globe-mobile-3`.

`/labs/globe` desktop guard:

| Run | Perf | TBT ms | LCP ms | CLS | FCP ms | Speed Index ms | TTFB ms | Main-thread ms |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `labs-globe-desktop-1` | 100 | 3 | 587 | 0 | 298 | 574 | 3 | 2166 |

Historical comparison:

- Historical `/quienessomos` mobile TBT: 638 ms.
- Current `/quienessomos` mobile median TBT: 1314 ms.
- Historical value is not representative of this local run set.
- Current results are noisier and worse under Chrome 150 / Lighthouse 13.4.0 in
  this environment.

Note on script evaluation / parse compile:

- Lighthouse `bootup-time` details are available by URL but not as the
  `scriptEvaluation` / `scriptParseCompile` group names used by the first
  extractor.
- Representative `quienessomos-mobile-2` shows large bootup totals for
  `122-29a8c2073e7f64ee.js` (`6741.5 ms` total), `c15bf2b0-52e8419f34af26ab.js`
  (`1442.3 ms` total), and `255-35bf8c00c5dde345.js` (`655.7 ms` total).

## Long-Task Attribution

Representative trace:

`C:\Users\marce\AppData\Local\Temp\cwd-tbt-attribution-20260722-173109\quienessomos-mobile-trace.json`

Trace limitation:

- CDP trace extraction identified `RunTask` events above 50 ms, but these events
  did not include reliable script stack attribution in the extracted event
  payload.
- Lighthouse JSON did attribute long tasks to URLs for the median run, but not
  function stacks.
- Therefore script/chunk attribution is medium confidence by Lighthouse URL and
  function-level attribution remains unresolved.

Top Lighthouse long tasks for `quienessomos-mobile-2`:

| Start ms | Duration ms | URL / chunk | Category | Confidence |
| ---: | ---: | --- | --- | --- |
| 4081.4 | 249 | `/_next/static/chunks/255-35bf8c00c5dde345.js` | shared Next/React chunk task | medium |
| 777.4 | 150 | `/quienessomos` | route document / hydration-adjacent task | low |
| 608.4 | 113 | `Unattributable` | unattributed startup task | low |
| 2131.7 | 108 | `/_next/static/chunks/4bd1b696-c023c6e3521b1417.js` | shared framework chunk task | medium |
| 9919.4 | 94 | `/_next/static/chunks/122-29a8c2073e7f64ee.js` | repeated globe-related task candidate | medium |
| 10339.4 | 90 | `/_next/static/chunks/122-29a8c2073e7f64ee.js` | repeated globe-related task candidate | medium |
| 10675.4 | 90 | `/_next/static/chunks/122-29a8c2073e7f64ee.js` | repeated globe-related task candidate | medium |
| 11489.4 | 90 | `/_next/static/chunks/122-29a8c2073e7f64ee.js` | repeated globe-related task candidate | medium |
| 11739.4 | 89 | `/_next/static/chunks/122-29a8c2073e7f64ee.js` | repeated globe-related task candidate | medium |
| 3619.4 | 87 | `/_next/static/chunks/c15bf2b0-52e8419f34af26ab.js` | large globe/Three-adjacent chunk candidate | medium |

CDP trace long tasks:

- Long tasks above 50 ms: 24.
- Represented blocking time from trace `sum(duration - 50)`: 4506 ms.
- Top five task durations: 1097.0, 872.2, 768.2, 596.6, 457.3 ms.
- Top five cumulative blocking time: 3541 ms.
- Function stacks: unresolved in extracted trace.

The long-task evidence indicates repeated expensive work after initial page
startup and strongly implicates the globe chunk family, especially
`122-29a8c2073e7f64ee.js`, but the current trace extraction is not sufficient
for function-level causality.

## Globe Phase Timings

Collected from `window.__codeworkGlobeTimingRuns` and
`window.__codeworkGlobeLastTimings`, five completed mobile runs per route.

`/quienessomos?globeDebug=1`:

| Phase | Min ms | Median ms | Max ms | Spread ms |
| --- | ---: | ---: | ---: | ---: |
| renderer | 40.0 | 45.6 | 73.4 | 33.4 |
| first shell | 51.9 | 56.2 | 98.0 | 46.1 |
| point geometry ready | 1.1 | 1.4 | 3.1 | 2.0 |
| Worker startup | 200.1 | 240.2 | 395.5 | 195.4 |
| first point batch | 466.1 | 535.1 | 789.5 | 323.4 |
| first points | 505.4 | 536.4 | 790.7 | 285.3 |
| low-density globe | 509.9 | 574.8 | 791.7 | 281.8 |
| first trajectory | 10.9 | 16.5 | 64.5 | 53.6 |
| full visual completion | 5884.1 | 5907.6 | 5929.0 | 44.9 |
| rendered points | 17000 | 17000 | 17000 | 0 |
| candidate points | 60000 | 60000 | 60000 | 0 |
| pixel-ratio cap | 2 | 2 | 2 | 0 |

`/labs/globe?globeDebug=1`:

| Phase | Min ms | Median ms | Max ms | Spread ms |
| --- | ---: | ---: | ---: | ---: |
| renderer | 44.1 | 55.0 | 68.7 | 24.6 |
| first shell | 57.2 | 64.6 | 79.5 | 22.3 |
| point geometry ready | 1.3 | 2.0 | 3.4 | 2.1 |
| Worker startup | 131.2 | 135.4 | 147.4 | 16.2 |
| first point batch | 403.6 | 431.4 | 457.5 | 53.9 |
| first points | 431.9 | 463.7 | 546.4 | 114.5 |
| low-density globe | 478.2 | 530.6 | 563.8 | 85.6 |
| first trajectory | 12.6 | 15.8 | 43.9 | 31.3 |
| full visual completion | 5919.9 | 5944.8 | 5963.3 | 43.4 |
| rendered points | 17000 | 17000 | 17000 | 0 |
| candidate points | 60000 | 60000 | 60000 | 0 |
| pixel-ratio cap | 2 | 2 | 2 | 0 |

`globe:worker-complete` and `globe:bloom-composer-ready` were not present in the
timing summaries. This is a current instrumentation gap, not a value of zero.

Important distinction: `full visual completion` is elapsed choreography time,
not blocking time.

## GPU Comparison

Headless Lighthouse/CDP conditions:

- Chrome launched with `--headless --disable-gpu`.
- `/quienessomos` mobile median TBT: 1314 ms.
- `/labs/globe` mobile median TBT: 1517 ms.
- `/quienessomos` timing median renderer: 45.6 ms.
- `/quienessomos` timing median first point batch: 535.1 ms.
- `/quienessomos` timing median low-density globe: 574.8 ms.

Windowed GPU-enabled diagnostic attempt:

- Puppeteer launched Chrome with `headless: false` and no `--disable-gpu`.
- Five timing runs were collected in
  `quienessomos-gpu-windowed-timings.json`.

GPU-enabled `/quienessomos` timing medians:

| Phase | Median |
| --- | ---: |
| renderer | 17.6 ms |
| first shell | 10.2 ms |
| point geometry ready | 0.1 ms |
| Worker startup | 24.9 ms |
| first point batch | 122.3 ms |
| first points | 146.8 ms |
| low-density globe | 211.3 ms |
| first trajectory | 4.7 ms |
| full visual completion | 5837.1 ms |

Interpretation:

- GPU/windowed diagnostics show substantially faster renderer and point-phase
  timings than headless `--disable-gpu`.
- The synthetic Lighthouse result should not be dismissed, but the poor mobile
  TBT appears materially coupled to the headless/no-GPU/throttled environment.
- Visual choreography completion remains near 5.8-5.9 s in both modes because
  it is intentionally timed choreography, not blocking work.

## Runtime JavaScript Coverage

Coverage was collected with Puppeteer JS coverage on `/quienessomos` and
`/labs/globe`.

Totals:

| Route | Bytes | Used bytes | Unused bytes |
| --- | ---: | ---: | ---: |
| `/quienessomos` | 1,209,522 | 740,015 | 469,507 |
| `/labs/globe` | 1,205,311 | 722,045 | 483,266 |

Identifiable chunk groups:

| Route | Group | Bytes | Used bytes | Unused bytes |
| --- | --- | ---: | ---: | ---: |
| `/quienessomos` | Three.js chunks | 545,353 | 328,325 | 217,028 |
| `/quienessomos` | postprocessing/globe chunks | 102,214 | 88,303 | 13,911 |
| `/labs/globe` | Three.js chunks | 545,353 | 328,325 | 217,028 |
| `/labs/globe` | postprocessing/globe chunks | 102,214 | 88,303 | 13,911 |

Limitations:

- Coverage is URL/chunk based, not source-symbol perfect.
- Precise progressive vs non-progressive vs fallback byte usage requires
  source-map symbol attribution beyond this collected coverage.
- Coverage still shows substantial unused bytes in Three.js chunks while both
  routes use the same visual globe.

## Visual-Fidelity Baseline

Visual captures were stored outside the repository under:

`C:\Users\marce\AppData\Local\Temp\cwd-tbt-attribution-20260722-173109`

Captured phases for `/quienessomos` desktop `1440x900` and mobile `390x844`:

- shell
- Italy seed
- progressive reveal
- capitals
- atmosphere
- trajectories
- final bloom

Final-state examples:

| Capture | Viewport | DPR | Canvas | Rendered points | Candidate points | Route count | Final timing |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: |
| `quienessomos-desktop-final-bloom.png` | 1440x900 | 1 | captured in metadata JSON | 17000 | 60000 | 11 | timing metadata file |
| `quienessomos-mobile-final-bloom.png` | 390x844 | 1 | captured in metadata JSON | 17000 | 60000 | 11 | timing metadata file |

Metadata files:

- `quienessomos-desktop-visual-baseline.json`
- `quienessomos-mobile-visual-baseline.json`

Locale-specific visual captures for `es`, `en`, and `it` were not separately
captured in this automated pass. The globe itself is locale-independent; locale
text visual regression remains a manual follow-up if required.

## Route-Delta Diagnosis

Current mobile median TBT:

- `/quienessomos`: 1314 ms.
- `/labs/globe`: 1517 ms.
- `/quienessomos - /labs/globe`: -203 ms.

This reverses the historical n=1 delta where `/quienessomos` was 366 ms worse.
In the current local run set, `/labs/globe` is slightly worse than
`/quienessomos`, and both routes show similarly high main-thread work and the
same globe chunk/coverage profile.

Diagnosis:

- The current TBT issue is primarily globe-intrinsic or environment/globe
  interaction, not clearly `/quienessomos` page-specific.
- The route-specific surrounding `/quienessomos` content does not explain the
  current median TBT because the lab route rendering the same globe is worse.
- The historical delta is likely stale and/or n=1 variance under older commits
  and older browser conditions.

Confidence: medium. The route delta is clear in the current Lighthouse runs,
but function-level long-task attribution remains incomplete.

## Dominant TBT Classification

Classification: `J. mixed / insufficient function-level attribution`, with a
strong globe-chunk signal.

Supporting evidence:

- Both `/quienessomos` and `/labs/globe` mobile medians have high TBT.
- Both routes share the same globe chunk family and similar coverage totals.
- Lighthouse median long tasks repeatedly point at globe-related chunks,
  especially `122-29a8c2073e7f64ee.js`.
- GPU/windowed timing phases are substantially faster than headless/no-GPU
  timing phases.
- Function stacks were not reliably extracted from CDP trace events.

Alternative explanations:

- Headless/no-GPU synthetic environment amplifies WebGL/Three scheduling costs.
- Shared framework and route hydration tasks contribute early blocking.
- Source-map/function attribution is needed before cutting code.

Confidence:

- High confidence that current synthetic TBT remains meaningful in Lighthouse.
- Medium confidence that the issue is globe-related rather than
  `/quienessomos`-specific.
- Low confidence for a single exact source function boundary.

## Candidate Next Increments

No visual-quality reduction is acceptable. No deferred mount is proposed.

Ranked candidates:

| Rank | Candidate | Expected TBT mechanism | Source boundary | Visual risk | Implementation risk | Validation | Rollback |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | Improve attribution before optimization by adding source-map-aware trace parsing for globe chunks | Converts chunk-level evidence into function-level source boundaries | trace analysis tooling only | none | low | same artifacts plus source maps | if no clearer attribution |
| 2 | Investigate splitting dormant non-progressive/fallback code from the progressive entrypoint | May reduce parse/evaluation if source-map attribution confirms dormant code in active chunks | `GlobeLab.jsx` progressive vs fallback/non-progressive boundaries | low if output unchanged | medium | before/after TBT, coverage, screenshots, timing globals | any visual diff or no TBT reduction |
| 3 | Investigate buffer-copy / worker-message handling only if trace stacks confirm it | May reduce main-thread batch handling while preserving identical buffers | `appendPointBatch` and worker message boundary | low-medium | medium | byte-for-byte point buffer checks, timings, screenshots | point/timing visual mismatch |

Selected next increment:

Candidate 1: source-map-aware attribution tooling/reporting. It preserves visual
output and addresses the remaining blocker: current evidence identifies chunks
but not exact functions. A source optimization should wait until Candidate 1
confirms a concrete source boundary.

## Limitations

- Lighthouse script-evaluation group extraction needed manual interpretation
  because the JSON grouped bootup data by URL columns, not the initially
  expected group names.
- CDP trace extraction found `RunTask` long tasks but not reliable function
  stacks.
- Locale-specific visual baseline captures were not collected in this automated
  pass.
- Frame cadence was not quantified beyond timing globals and traces.
- No production source was modified.

## Explicit Production-Source Statement

No production source changed. Raw JSON, HTML, traces, coverage files,
screenshots, temporary scripts, `.next`, and `node_modules` were not committed.

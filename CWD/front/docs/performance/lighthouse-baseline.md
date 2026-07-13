# Lighthouse / Web Vitals Baseline — CodeWork Digital

## Scope

This document captures a reproducible lab baseline for the CodeWork Digital frontend after the SEO foundation and hero image optimization increments.

It is measurement-only:

- no UI behavior changed
- no SEO behavior changed
- no source optimization was introduced in this increment
- raw Lighthouse reports were generated outside the repository and were not committed

## Measurement metadata

- Measurement date: 2026-07-10 America/Buenos_Aires
- JSON `fetchTime` timestamps: 2026-07-11 UTC
- Commit measured: `11b74619684df4e13276e269ca6f89c01982f784`
- Node.js: `v24.13.0`
- npm: `11.6.2`
- Next.js: `15.5.11`
- Lighthouse: `13.4.0`
- Browser binary: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Browser version: `149.0.7827.201`
- OS: `Microsoft Windows 11 Home Single Language 10.0.26200 64-bit`
- CPU: `13th Gen Intel(R) Core(TM) i7-1355U`, `10` cores, `12` logical processors

## Environment notes

- These results are lab-only and environment-specific.
- They were collected with Headless Chrome on Windows, not from real users.
- They are suitable for longitudinal comparison only against future runs collected in the same class of environment.
- Lighthouse mobile runs used simulated throttling:
  - RTT `150ms`
  - throughput `1638.4 Kbps`
  - CPU slowdown `4x`
- Lighthouse desktop runs used simulated throttling:
  - RTT `40ms`
  - throughput `10240 Kbps`
  - CPU slowdown `1x`
- Chrome was launched in headless mode with:
  - `--headless`
  - `--no-sandbox`
  - `--disable-gpu`
  - `--disable-dev-shm-usage`
- INP is not established by this baseline.
- Use TBT only as the lab proxy for responsiveness.
- WebGL caveat for `/labs/globe`:
  - the route was measured in headless Chrome with `--disable-gpu`
  - rendering behavior does not represent real-device GPU performance
  - `/labs/globe` is reported separately and is not averaged with commercial pages

## Tooling inspection

Inspected files:

- `CWD/front/package.json`
- `CWD/front/package-lock.json`
- `CWD/front/next.config.mjs`

Findings:

- no Lighthouse dependency existed in the project
- no Lighthouse CI tooling existed
- no additional orchestration tooling existed
- `output: "export"` is not configured in `next.config.mjs`

Least invasive measurement approach chosen:

- use `npx --yes lighthouse@13.4.0`
- do not add a permanent devDependency
- record the exact Lighthouse version and commands in this report

Note on Windows process handling:

- `npx lighthouse` with `--chrome-path` hit a Windows `EPERM` while `chrome-launcher` tried to delete its temp profile directory after a successful run
- measurement was made reproducible by launching Chrome manually with `--remote-debugging-port` and connecting Lighthouse with `--port=9222`
- this avoided source changes and avoided adding dependencies

## Commands used

Install and build:

```powershell
npm ci
npm run build
```

Server start and readiness:

```powershell
$baseDir = Join-Path $env:TEMP 'cwd-lighthouse'
$reportDir = Join-Path $baseDir 'reports'
$logOut = Join-Path $baseDir 'next-start.out.log'
$logErr = Join-Path $baseDir 'next-start.err.log'
$pidFile = Join-Path $baseDir 'next-server.pid'
$wrapperPidFile = Join-Path $baseDir 'next-wrapper.pid'

$proc = Start-Process npm -ArgumentList 'run','start','--','-p','3000' `
  -WindowStyle Hidden `
  -RedirectStandardOutput $logOut `
  -RedirectStandardError $logErr `
  -PassThru

$proc.Id | Set-Content $wrapperPidFile

for ($i = 1; $i -le 30; $i++) {
  Start-Sleep -Seconds 1
  try {
    $resp = Invoke-WebRequest -Uri 'http://127.0.0.1:3000/' -UseBasicParsing -TimeoutSec 3
    if ($resp.StatusCode -eq 200) { break }
  } catch {}
}

$listenerPid = (Get-NetTCPConnection -LocalPort 3000 -State Listen |
  Select-Object -First 1 -ExpandProperty OwningProcess)
$listenerPid | Set-Content $pidFile
```

Chrome availability and version:

```powershell
Test-Path 'C:\Program Files\Google\Chrome\Application\chrome.exe'
(Get-Item 'C:\Program Files\Google\Chrome\Application\chrome.exe').VersionInfo.ProductVersion
```

Lighthouse version:

```powershell
npx --yes lighthouse@13.4.0 --version
```

Lighthouse launch pattern used for every run:

```powershell
$chromePath = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$port = 9222
$profileDir = Join-Path $profilesDir $runName

$chromeArgs = @(
  '--headless',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-dev-shm-usage',
  "--remote-debugging-port=$port",
  '--remote-debugging-address=127.0.0.1',
  "--user-data-dir=$profileDir",
  'about:blank'
)

$chromeProc = Start-Process -FilePath $chromePath -ArgumentList $chromeArgs -WindowStyle Hidden -PassThru

npx --yes lighthouse@13.4.0 <url> --port=9222 --output=json --output=html --output-path=<temp-path> --quiet
npx --yes lighthouse@13.4.0 <url> --port=9222 --preset=desktop --output=json --output=html --output-path=<temp-path> --quiet
```

Server termination:

```powershell
Stop-Process -Id (Get-Content $pidFile) -Force -ErrorAction SilentlyContinue
Stop-Process -Id (Get-Content $wrapperPidFile) -Force -ErrorAction SilentlyContinue
Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*next start*' }
```

Raw report location:

```txt
C:\Users\marce\AppData\Local\Temp\cwd-lighthouse\reports
```

## Routes measured

Commercial routes:

- `/`
- `/quienessomos`
- `/servicios`
- `/contacto`

Lab route:

- `/labs/globe`

Runs per route:

- `/`: 3 mobile runs, 3 desktop runs
- `/quienessomos`: 1 mobile run, 1 desktop run
- `/servicios`: 1 mobile run, 1 desktop run
- `/contacto`: 1 mobile run, 1 desktop run
- `/labs/globe`: 1 mobile run, 1 desktop run

## Commercial routes

| Route | Profile | Runs | Perf | A11y | BP | SEO | LCP | CLS | TBT | FCP | Speed Index | TTFB |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | mobile | 3, median `home-mobile-1` | 93 | 90 | 100 | 100 | 2.89 s | 0.004 | 123 ms | 2.00 s | 2.00 s | 3 ms |
| `/` | desktop | 3, median `home-desktop-1` | 99 | 88 | 100 | 100 | 0.85 s | 0.037 | 0 ms | 0.83 s | 0.83 s | 3 ms |
| `/quienessomos` | mobile | 1 | 82 | 96 | 100 | 100 | 2.16 s | 0.053 | 638 ms | 1.06 s | 1.86 s | 3 ms |
| `/quienessomos` | desktop | 1 | 100 | 96 | 100 | 100 | 0.48 s | 0.023 | 0 ms | 0.29 s | 0.58 s | 2 ms |
| `/servicios` | mobile | 1 | 99 | 96 | 100 | 100 | 2.14 s | 0.000 | 30 ms | 1.06 s | 1.06 s | 3 ms |
| `/servicios` | desktop | 1 | 100 | 96 | 100 | 100 | 0.48 s | 0.000 | 0 ms | 0.29 s | 0.29 s | 3 ms |
| `/contacto` | mobile | 1 | 99 | 91 | 100 | 100 | 2.13 s | 0.028 | 25 ms | 1.06 s | 1.06 s | 3 ms |
| `/contacto` | desktop | 1 | 100 | 91 | 100 | 100 | 0.48 s | 0.003 | 0 ms | 0.29 s | 0.29 s | 2 ms |

### Home median-run selection

Mobile home runs:

- `home-mobile-1`: Performance `93`, LCP `2.89 s`
- `home-mobile-2`: Performance `93`, LCP `2.91 s`
- `home-mobile-3`: Performance `92`, LCP `2.89 s`
- Performance spread: `92-93`
- Selected median run: `home-mobile-1`

Desktop home runs:

- `home-desktop-1`: Performance `99`, LCP `0.85 s`
- `home-desktop-2`: Performance `98`, LCP `0.87 s`
- `home-desktop-3`: Performance `99`, LCP `0.84 s`
- Performance spread: `98-99`
- Selected median run: `home-desktop-1`

### Largest Contentful Paint element

Home mobile median:

- selector: `section.premium-carousel > div.hero-track > div.premium-slide > img`
- label: `Creamos experiencias visuales`

Home desktop median:

- Lighthouse 13 JSON did not surface a dedicated LCP node for the selected desktop run

### Key Lighthouse opportunities / diagnostics

`/` mobile:

- Render-blocking requests: estimated savings `~550 ms`
- Reduce unused JavaScript: estimated savings `~21 KiB`
- Main-thread work: `2.8 s`
- Elements use prohibited ARIA attributes
- Heading order is not sequentially descending

`/` desktop:

- Render-blocking requests: estimated savings `~450 ms`
- Elements use prohibited ARIA attributes
- Visible labels do not match accessible names
- Links do not have discernible names
- Accessibility tree is not well-formed

`/quienessomos` mobile:

- Render-blocking requests: estimated savings `~300 ms`
- Reduce unused JavaScript: estimated savings `~85 KiB`
- Main-thread work: `8.8 s`
- Visible labels do not match accessible names
- Links do not have discernible names

`/quienessomos` desktop:

- Reduce unused JavaScript: estimated savings `~85 KiB`
- Visible labels do not match accessible names
- Links do not have discernible names
- Accessibility tree is not well-formed
- Forced reflow insight

`/servicios` mobile:

- Render-blocking requests: estimated savings `~300 ms`
- Reduce unused JavaScript: estimated savings `~24 KiB`
- Visible labels do not match accessible names
- Links do not have discernible names
- Accessibility tree is not well-formed

`/servicios` desktop:

- Reduce unused JavaScript: estimated savings `~24 KiB`
- Visible labels do not match accessible names
- Links do not have discernible names
- Accessibility tree is not well-formed
- Forced reflow insight

`/contacto` mobile:

- Render-blocking requests: estimated savings `~450 ms`
- Reduce unused JavaScript: estimated savings `~24 KiB`
- Visible labels do not match accessible names
- Links do not have discernible names
- Accessibility tree is not well-formed

`/contacto` desktop:

- Reduce unused JavaScript: estimated savings `~24 KiB`
- Visible labels do not match accessible names
- Links do not have discernible names
- Accessibility tree is not well-formed
- Forced reflow insight

## Lab route

Important caveat:

- `/labs/globe` is intentionally `noindex`
- its Lighthouse SEO score is therefore not comparable to commercial routes
- it also uses WebGL and was measured in headless Chrome with `--disable-gpu`

| Route | Profile | Runs | Perf | A11y | BP | SEO | LCP | CLS | TBT | FCP | Speed Index | TTFB |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `/labs/globe` | mobile | 1 | 93 | 91 | 100 | 66 | 2.34 s | 0.000 | 272 ms | 1.06 s | 2.16 s | 6 ms |
| `/labs/globe` | desktop | 1 | 100 | 92 | 100 | 66 | 0.58 s | 0.000 | 0 ms | 0.29 s | 0.55 s | 3 ms |

Largest Contentful Paint element reported by Lighthouse:

- selector: `header.top-header > div.logo-container > a.logo-link > img.logo-img`
- label: `Isotipo Code Work Digital`

Key Lighthouse opportunities / diagnostics:

`/labs/globe` mobile:

- Render-blocking requests: estimated savings `~350 ms`
- Reduce unused JavaScript: estimated savings `~84 KiB`
- Main-thread work: `8.4 s`
- Elements use prohibited ARIA attributes
- Visible labels do not match accessible names

`/labs/globe` desktop:

- Render-blocking requests: estimated savings `~100 ms`
- Legacy JavaScript: estimated savings `~12 KiB`
- Reduce unused JavaScript: estimated savings `~84 KiB`
- Elements use prohibited ARIA attributes
- Visible labels do not match accessible names

## Interpretation

Commercial routes:

- SEO is strong on all commercial routes: `100` across the measured set.
- Best Practices is `100` across all measured routes.
- Mobile home is close to, but still above, the Core Web Vitals LCP target:
  - measured LCP `2.89 s`
  - target context `<= 2.5 s`
- `/quienessomos` mobile is the clearest next optimization target:
  - Performance `82`
  - TBT `638 ms`
  - Main-thread work `8.8 s`
  - unused JS `~85 KiB`
- `/servicios` and `/contacto` are comparatively healthy on mobile:
  - Performance `99`
  - low TBT
  - LCP around `2.1 s`
- Accessibility is the most consistent non-performance weakness:
  - home: `88-90`
  - contacto: `91`
  - servicios and quienes somos: `96`
  - common failures include discernible link names, accessible-name mismatch, prohibited ARIA attributes, and accessibility-tree issues

Lab-only indications versus confirmed bottlenecks:

- confirmed within this lab setup:
  - mobile home LCP is still slightly above target
  - `/quienessomos` mobile has materially higher TBT than the other commercial routes
  - render-blocking requests recur across routes
  - common accessibility issues recur across routes
- environment-specific only:
  - absolute timings and scores are specific to this Windows headless environment
  - `/labs/globe` is especially sensitive to headless no-GPU execution
  - do not claim real-user INP or full Core Web Vitals compliance from these results

## Most important findings

- The SEO foundation is holding: commercial routes scored `100` for Lighthouse SEO.
- The hero image optimization likely helped the home route stay in the low `90s` on mobile and high `90s` on desktop, but mobile home LCP is still above `2.5 s`.
- `/quienessomos` mobile is the highest-value next target because its TBT and main-thread work are meaningfully worse than the other commercial pages.
- Repeated accessibility failures are present across the site and should be treated as a distinct remediation track.
- `/labs/globe` should remain separated from commercial-route averages because its SEO score is intentionally depressed by `noindex` and its rendering characteristics are atypical.

## PageSpeed Insights

- Not run in this increment.
- When available for a public production URL, PSI should be used as a follow-up because it can surface CrUX field data when traffic exists.

## Raw artifacts

- Raw JSON reports: generated locally only, outside the repo
- Raw HTML reports: generated locally only, outside the repo
- Committed artifact: this Markdown summary only

## Future RUM increment

- add the `web-vitals` package
- collect LCP, INP, CLS, FCP, TTFB
- report to a privacy-friendly endpoint or analytics backend
- segment by route and device class

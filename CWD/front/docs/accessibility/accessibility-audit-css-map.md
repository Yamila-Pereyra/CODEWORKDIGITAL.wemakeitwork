# Accessibility Audit and CSS Ownership Map — CodeWork Digital

## 1. Scope and methodology

This increment is analysis, measurement, and documentation only. No production JSX, CSS, translations, configuration, routing, metadata, or backend files were changed.

Current-source authority and Stage 0 revalidation:

- The reused branch `docs/cwd-accessibility-audit-map` was revalidated on 2026-07-16 and remained identical to `origin/develop` at `78fda8de6486ef87759e335be459c85ea676ea51`.
- `git status --short` stayed empty before any frontend work.
- `c9e811a` was available locally.
- `git diff --stat c9e811a origin/develop -- CWD/front/docs/performance/lighthouse-baseline.md CWD/front/docs/performance/experiments/globe-deferral-2026-07.md` returned no output, so the persisted docs matched the historical snapshot exactly.
- Content-verification criteria passed for the fetched `origin/develop` documents:
  1. `lighthouse-baseline.md` still contains the four commercial routes with scores consistent with the accepted baseline.
  2. `lighthouse-baseline.md` still preserves the accepted measurement environment and procedure.
  3. `globe-deferral-2026-07.md` still records the deferred-mount globe experiment as rejected, reverted, and negative for TBT/Performance.
  4. No later edit contradicted the accepted baseline or the rejected-experiment conclusion.
- `git grep -n -e "shouldMountGlobe" -e "setShouldMountGlobe" -e "requestIdleCallback" -e "cancelIdleCallback" origin/develop -- CWD/front/src/components/QuienesSomosPageContent.jsx` returned no matches, so the rejected source experiment is not present in current `develop`.

Measurement limits used throughout this document:

- Lighthouse was run only against the rendered Spanish state (`es`).
- Every Lighthouse run used a fresh Chrome profile, so localStorage, sessionStorage, cookies, service-worker state, and cache state started clean.
- Before each recorded run, a separate fresh-profile `--dump-dom` verification confirmed:
  - `<html lang="es">`
  - the `ES` language button rendered active
  - route-specific Spanish content rendered in the DOM
  - the mobile menu was closed in the initial state
- Lighthouse default runs only cover the initial rendered state. They do not prove correctness for open mobile menus, language-switched states, carousel interaction states, or async form feedback.
- Source inspection was used to classify current defects outside Lighthouse coverage when the current implementation was unambiguous.
- Browser smoke review was bounded to the shared navigation, language selector, carousel controls, footer links, and contact form behavior.

## 2. Measurement environment

| Field | Value |
| --- | --- |
| Measurement date | 2026-07-16 |
| Source measured | `docs/cwd-accessibility-audit-map` at `78fda8de6486ef87759e335be459c85ea676ea51` |
| Equivalent fetched `origin/develop` commit | `78fda8de6486ef87759e335be459c85ea676ea51` |
| Node.js | `v24.13.0` |
| npm | `11.6.2` |
| Next.js | `15.5.11` |
| Lighthouse | `13.4.0` via `npx --yes lighthouse@13.4.0` |
| Chrome binary | `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| Chrome version | `150.0.7871.124` |
| OS | `Microsoft Windows 11 Home Single Language 10.0.26200 64-bit` |
| App host / port | `http://127.0.0.1:3000` |
| Chrome flags for Lighthouse | `--headless --no-sandbox --disable-gpu --disable-dev-shm-usage --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1 --user-data-dir=<fresh profile>` |
| Chrome flags for DOM verification | `--headless --no-sandbox --disable-gpu --disable-dev-shm-usage --dump-dom --virtual-time-budget=5000 --user-data-dir=<fresh profile>` |
| Raw report directory | `C:\Users\marce\AppData\Local\Temp\cwd-accessibility-audit\reports` |
| Temporary extraction outputs | `C:\Users\marce\AppData\Local\Temp\cwd-accessibility-audit\accessibility-summary.json` and `browser-smoke.json` |

Tooling inspected before running Lighthouse:

- `CWD/front/package.json`
- `CWD/front/package-lock.json`
- `CWD/front/next.config.mjs`
- `CWD/front/docs/performance/lighthouse-baseline.md`

Build and runtime results:

- `npm ci`: succeeded.
- `npm run build`: succeeded.
- `npm run start -- -p 3000 --hostname 127.0.0.1`: succeeded; readiness confirmed with `Invoke-WebRequest` to `http://127.0.0.1:3000/`.

Build and runtime warnings captured:

- `npm warn Unknown env config "min-release-age". This will stop working in the next major version of npm.` during `npm -v`, `npm ci`, `npm run build`, `npm run start`, and each Lighthouse run.
- `npm ci` reported `2 vulnerabilities (1 moderate, 1 high)` without affecting install completion.
- `npm run build` reported repeated Next SWC mismatch warnings: `Mismatching @next/swc version, detected: 15.5.7 while Next.js is on 15.5.11. Please ensure these match`.
- No production-start failure occurred.

Lighthouse JSON extraction method:

- Only `categories.accessibility.auditRefs` were traversed.
- Automatic failures were filtered to audits with:
  - `scoreDisplayMode` of `binary` or `numeric`
  - non-null score
  - score `< 1`
- Category scores were converted with `Math.round(category.score * 100)`.

## 3. Accessibility scores by route/profile

| Route | Profile | Locale | Accessibility score | Raw report |
| --- | --- | --- | ---: | --- |
| `/` | mobile | `es` | 90 | `home-mobile-es.json` |
| `/` | desktop | `es` | 88 | `home-desktop-es.json` |
| `/quienessomos` | mobile | `es` | 96 | `quienessomos-mobile-es.json` |
| `/quienessomos` | desktop | `es` | 96 | `quienessomos-desktop-es.json` |
| `/servicios` | mobile | `es` | 96 | `servicios-mobile-es.json` |
| `/servicios` | desktop | `es` | 96 | `servicios-desktop-es.json` |
| `/contacto` | mobile | `es` | 91 | `contacto-mobile-es.json` |
| `/contacto` | desktop | `es` | 91 | `contacto-desktop-es.json` |

These scores reproduce the accepted baseline exactly.

## 4. Exact failed Lighthouse audits

All confirmed automatic failures below had:

- raw audit score `0`
- `scoreDisplayMode: binary`

| Route | Profile | A11y score | Audit ID | Audit title | Failure count | Selector(s) | Snippet(s) | Raw report |
| --- | --- | ---: | --- | --- | ---: | --- | --- | --- |
| `/` | mobile | 90 | `aria-prohibited-attr` | Elements use prohibited ARIA attributes | 1 | `div.hero-brand-lockup > section.cwd-narrative-core > div.hero-value-stack > p.value-proposition` | `<p class="value-proposition is-typing" aria-label="Somos creadores de experiencias digitales respaldadas por ingeniería, priv…">` | `home-mobile-es.json` |
| `/` | mobile | 90 | `heading-order` | Heading elements are not in a sequentially-descending order | 1 | `div.services-cards-scroll > div.services-list > div.service-item > h3` | `<h3>` | `home-mobile-es.json` |
| `/` | mobile | 90 | `link-name` | Links do not have a discernible name | 2 | `body.__className_c4891e > footer > div.footer-socials > a`<br>`body.__className_c4891e > footer > div.footer-socials > a` | `<a href="https://instagram.com/TUUSUARIO" target="_blank" rel="noopener noreferrer">`<br>`<a href="https://facebook.com/TUPAGINA" target="_blank" rel="noopener noreferrer">` | `home-mobile-es.json` |
| `/` | mobile | 90 | `label-content-name-mismatch` | Elements with visible text labels do not have matching accessible names. | 1 | `div.language-selector > div.lang-options > span.lang-option-wrap > button.lang-option` | `<button type="button" class="lang-option " aria-label="Cambiar idioma a Ingles" aria-pressed="false">` | `home-mobile-es.json` |
| `/` | desktop | 88 | `aria-prohibited-attr` | Elements use prohibited ARIA attributes | 1 | `div.hero-brand-lockup > section.cwd-narrative-core > div.hero-value-stack > p.value-proposition` | `<p class="value-proposition is-typing" aria-label="Somos creadores de experiencias digitales respaldadas por ingeniería, priv…">` | `home-desktop-es.json` |
| `/` | desktop | 88 | `color-contrast` | Background and foreground colors do not have a sufficient contrast ratio. | 1 | `aside.code-cascade > article.code-cascade-card > header.code-cascade-header > small` | `<small>` | `home-desktop-es.json` |
| `/` | desktop | 88 | `link-name` | Links do not have a discernible name | 2 | `body.__className_c4891e > footer > div.footer-socials > a`<br>`body.__className_c4891e > footer > div.footer-socials > a` | `<a href="https://instagram.com/TUUSUARIO" target="_blank" rel="noopener noreferrer">`<br>`<a href="https://facebook.com/TUPAGINA" target="_blank" rel="noopener noreferrer">` | `home-desktop-es.json` |
| `/` | desktop | 88 | `label-content-name-mismatch` | Elements with visible text labels do not have matching accessible names. | 1 | `div.language-selector > div.lang-options > span.lang-option-wrap > button.lang-option` | `<button type="button" class="lang-option " aria-label="Cambiar idioma a Ingles" aria-pressed="false">` | `home-desktop-es.json` |
| `/quienessomos` | mobile | 96 | `link-name` | Links do not have a discernible name | 2 | `body.__className_c4891e > footer > div.footer-socials > a`<br>`body.__className_c4891e > footer > div.footer-socials > a` | `<a href="https://instagram.com/TUUSUARIO" target="_blank" rel="noopener noreferrer">`<br>`<a href="https://facebook.com/TUPAGINA" target="_blank" rel="noopener noreferrer">` | `quienessomos-mobile-es.json` |
| `/quienessomos` | mobile | 96 | `label-content-name-mismatch` | Elements with visible text labels do not have matching accessible names. | 1 | `div.language-selector > div.lang-options > span.lang-option-wrap > button.lang-option` | `<button type="button" class="lang-option " aria-label="Cambiar idioma a Ingles" aria-pressed="false">` | `quienessomos-mobile-es.json` |
| `/quienessomos` | desktop | 96 | `link-name` | Links do not have a discernible name | 2 | `body.__className_c4891e > footer > div.footer-socials > a`<br>`body.__className_c4891e > footer > div.footer-socials > a` | `<a href="https://instagram.com/TUUSUARIO" target="_blank" rel="noopener noreferrer">`<br>`<a href="https://facebook.com/TUPAGINA" target="_blank" rel="noopener noreferrer">` | `quienessomos-desktop-es.json` |
| `/quienessomos` | desktop | 96 | `label-content-name-mismatch` | Elements with visible text labels do not have matching accessible names. | 1 | `div.language-selector > div.lang-options > span.lang-option-wrap > button.lang-option` | `<button type="button" class="lang-option " aria-label="Cambiar idioma a Ingles" aria-pressed="false">` | `quienessomos-desktop-es.json` |
| `/servicios` | mobile | 96 | `link-name` | Links do not have a discernible name | 2 | `body.__className_c4891e > footer > div.footer-socials > a`<br>`body.__className_c4891e > footer > div.footer-socials > a` | `<a href="https://instagram.com/TUUSUARIO" target="_blank" rel="noopener noreferrer">`<br>`<a href="https://facebook.com/TUPAGINA" target="_blank" rel="noopener noreferrer">` | `servicios-mobile-es.json` |
| `/servicios` | mobile | 96 | `label-content-name-mismatch` | Elements with visible text labels do not have matching accessible names. | 1 | `div.language-selector > div.lang-options > span.lang-option-wrap > button.lang-option` | `<button type="button" class="lang-option " aria-label="Cambiar idioma a Ingles" aria-pressed="false">` | `servicios-mobile-es.json` |
| `/servicios` | desktop | 96 | `link-name` | Links do not have a discernible name | 2 | `body.__className_c4891e > footer > div.footer-socials > a`<br>`body.__className_c4891e > footer > div.footer-socials > a` | `<a href="https://instagram.com/TUUSUARIO" target="_blank" rel="noopener noreferrer">`<br>`<a href="https://facebook.com/TUPAGINA" target="_blank" rel="noopener noreferrer">` | `servicios-desktop-es.json` |
| `/servicios` | desktop | 96 | `label-content-name-mismatch` | Elements with visible text labels do not have matching accessible names. | 1 | `div.language-selector > div.lang-options > span.lang-option-wrap > button.lang-option` | `<button type="button" class="lang-option " aria-label="Cambiar idioma a Ingles" aria-pressed="false">` | `servicios-desktop-es.json` |
| `/contacto` | mobile | 91 | `label` | Form elements do not have associated labels | 4 | `div.contacto-form-wrapper > form.contacto-form > p > input`<br>`div.contacto-form-wrapper > form.contacto-form > p > input`<br>`div.contacto-form-wrapper > form.contacto-form > p > input`<br>`div.contacto-form-wrapper > form.contacto-form > p > textarea` | `<input type="text" required="" name="nombre" value="">`<br>`<input type="email" required="" name="email" value="">`<br>`<input type="text" name="telefono" value="">`<br>`<textarea name="mensaje" rows="4" required="">` | `contacto-mobile-es.json` |
| `/contacto` | mobile | 91 | `link-name` | Links do not have a discernible name | 2 | `body.__className_c4891e > footer > div.footer-socials > a`<br>`body.__className_c4891e > footer > div.footer-socials > a` | `<a href="https://instagram.com/TUUSUARIO" target="_blank" rel="noopener noreferrer">`<br>`<a href="https://facebook.com/TUPAGINA" target="_blank" rel="noopener noreferrer">` | `contacto-mobile-es.json` |
| `/contacto` | mobile | 91 | `label-content-name-mismatch` | Elements with visible text labels do not have matching accessible names. | 1 | `div.language-selector > div.lang-options > span.lang-option-wrap > button.lang-option` | `<button type="button" class="lang-option " aria-label="Cambiar idioma a Ingles" aria-pressed="false">` | `contacto-mobile-es.json` |
| `/contacto` | desktop | 91 | `label` | Form elements do not have associated labels | 4 | `div.contacto-form-wrapper > form.contacto-form > p > input`<br>`div.contacto-form-wrapper > form.contacto-form > p > input`<br>`div.contacto-form-wrapper > form.contacto-form > p > input`<br>`div.contacto-form-wrapper > form.contacto-form > p > textarea` | `<input type="text" required="" name="nombre" value="">`<br>`<input type="email" required="" name="email" value="">`<br>`<input type="text" name="telefono" value="">`<br>`<textarea name="mensaje" rows="4" required="">` | `contacto-desktop-es.json` |
| `/contacto` | desktop | 91 | `link-name` | Links do not have a discernible name | 2 | `body.__className_c4891e > footer > div.footer-socials > a`<br>`body.__className_c4891e > footer > div.footer-socials > a` | `<a href="https://instagram.com/TUUSUARIO" target="_blank" rel="noopener noreferrer">`<br>`<a href="https://facebook.com/TUPAGINA" target="_blank" rel="noopener noreferrer">` | `contacto-desktop-es.json` |
| `/contacto` | desktop | 91 | `label-content-name-mismatch` | Elements with visible text labels do not have matching accessible names. | 1 | `div.language-selector > div.lang-options > span.lang-option-wrap > button.lang-option` | `<button type="button" class="lang-option " aria-label="Cambiar idioma a Ingles" aria-pressed="false">` | `contacto-desktop-es.json` |

Relevant manual-audit coverage captured in every report:

- `focusable-controls` — Interactive controls are keyboard focusable
- `interactive-element-affordance` — Interactive elements indicate their purpose and state
- `logical-tab-order` — The page has a logical tab order
- `visual-order-follows-dom` — Visual order on the page follows DOM order
- `focus-traps` — User focus is not accidentally trapped in a region
- `managed-focus` — The user's focus is directed to new content added to the page
- `use-landmarks` — HTML5 landmark elements are used to improve navigation
- `offscreen-content-hidden` — Offscreen content is hidden from assistive technology
- `custom-controls-labels` — Custom controls have associated labels
- `custom-controls-roles` — Custom controls have ARIA roles

## 5. DOM-node to source-component traceability

| Audit ID | Route / profile occurrence | DOM selector | Source location | Source component | JSX signature | Name / content origin | Shared? | Delivered routes | Evidence type | Likely source cause |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `link-name` | all 8 commercial route/profile audits | `body.__className_c4891e > footer > div.footer-socials > a` | `src/components/Footer.jsx:21` | `Footer` | `<a href="https://instagram.com/TUUSUARIO"><FaInstagram /></a>` | icon-only children, no text, no `aria-label`, no `title` | Yes | `/`, `/quienessomos`, `/servicios`, `/contacto` | Automatic + browser | Shared footer social link renders without any accessible-name source |
| `link-name` | all 8 commercial route/profile audits | `body.__className_c4891e > footer > div.footer-socials > a` | `src/components/Footer.jsx:29` | `Footer` | `<a href="https://facebook.com/TUPAGINA"><FaFacebookF /></a>` | icon-only children, no text, no `aria-label`, no `title` | Yes | `/`, `/quienessomos`, `/servicios`, `/contacto` | Automatic + browser | Same shared footer defect as the Instagram icon link |
| `label-content-name-mismatch` | all 8 commercial route/profile audits | `div.language-selector > div.lang-options > span.lang-option-wrap > button.lang-option` | `src/components/LanguageSelector.jsx:32` | `LanguageSelector` | `<button className={\`lang-option ...\`} aria-label={\`Cambiar idioma a ${option.name}\`}>{option.label}</button>` | visible text `ES` / `EN` / `IT`; accessible name from hardcoded Spanish `aria-label` | Yes | `/`, `/quienessomos`, `/servicios`, `/contacto` | Automatic + static + browser | The visible abbreviation is not included in the computed accessible name; the labels also remain Spanish after switching to `en` or `it` |
| `label` | `/contacto` mobile, `/contacto` desktop | `div.contacto-form-wrapper > form.contacto-form > p > input` | `src/components/ContactForm.js:59` | `ContactForm` | `<label>{formCopy.name}</label><input type="text" name="nombre" ... />` | visible translation label rendered as a sibling text node | No | `/contacto` | Automatic + static | Label is neither wrapping the control nor associated with `htmlFor` / `id` |
| `label` | `/contacto` mobile, `/contacto` desktop | `div.contacto-form-wrapper > form.contacto-form > p > input` | `src/components/ContactForm.js:64` | `ContactForm` | `<label>{formCopy.email}</label><input type="email" name="email" ... />` | visible translation label rendered as a sibling text node | No | `/contacto` | Automatic + static | Same missing association pattern |
| `label` | `/contacto` mobile, `/contacto` desktop | `div.contacto-form-wrapper > form.contacto-form > p > input` | `src/components/ContactForm.js:69` | `ContactForm` | `<label>{formCopy.phone}</label><input type="text" name="telefono" ... />` | visible translation label rendered as a sibling text node | No | `/contacto` | Automatic + static | Same missing association pattern |
| `label` | `/contacto` mobile, `/contacto` desktop | `div.contacto-form-wrapper > form.contacto-form > p > textarea` | `src/components/ContactForm.js:74` | `ContactForm` | `<label>{formCopy.message}</label><textarea name="mensaje" ... />` | visible translation label rendered as a sibling text node | No | `/contacto` | Automatic + static | Same missing association pattern |
| `aria-prohibited-attr` | `/` mobile, `/` desktop | `div.hero-brand-lockup > section.cwd-narrative-core > div.hero-value-stack > p.value-proposition` | `src/components/HomePageContent.jsx:601` | `HomePageContent` | `<p className={\`value-proposition ...\`} aria-label={heroValueProposition}>...</p>` | translation-derived expression `heroValueProposition` | No | `/` | Automatic + static | `aria-label` is applied directly to a plain paragraph element without a valid ARIA role that permits it |
| `heading-order` | `/` mobile | `div.services-cards-scroll > div.services-list > div.service-item > h3` | `src/components/HomePageContent.jsx:797` | `HomePageContent` | `<div className="service-item ..."><h3>{item.titulo}</h3></div>` | `servicios.items[].titulo` from translations | No | `/` | Automatic + static | The rendered Home outline contains a second `h1` (`SERVICIOS`) followed directly by service-card `h3` nodes before the next `h2` |
| `color-contrast` | `/` desktop | `aside.code-cascade > article.code-cascade-card > header.code-cascade-header > small` | `src/components/CodeCascade.jsx:416` | `CodeCascade` | `<small>{activeMeta.title}</small>` | literal demo metadata from the code-cascade dataset | No | `/` | Automatic + static | `home1.css` applies low-opacity small text on a black background, producing Lighthouse's measured 2.9:1 contrast ratio |

## 6. Shared defects versus route-local defects

Automatic-failure summary:

| Metric | Count |
| --- | ---: |
| Automatic audit occurrences across the 8 reports | 22 |
| Failing node instances across the 8 reports | 36 |
| Unique automatic source defects | 6 |
| Shared automatic source defects | 2 |
| Route-local automatic source defects | 4 |

Shared automatic source defects:

| Source defect | Node instances | Audit occurrences | Routes affected | Notes |
| --- | ---: | ---: | --- | --- |
| Footer social icon links have no accessible names | 16 | 8 | all 4 routes | This is the current cross-route `link-name` failure. The current Footer icon links are confirmed as the repeated discernible-name defect. |
| Language-selector button visible labels do not match accessible names | 8 | 8 | all 4 routes | The reported node is the non-active button; current source shows the same pattern for all three language buttons. |

Route-local automatic source defects:

| Source defect | Node instances | Audit occurrences | Routes affected |
| --- | ---: | ---: | --- |
| Contact form controls have no associated labels | 8 | 2 | `/contacto` |
| Home value proposition uses prohibited `aria-label` on `<p>` | 2 | 2 | `/` |
| Home services section breaks heading order | 1 | 1 | `/` mobile |
| Home code-cascade filename text fails contrast | 1 | 1 | `/` desktop |

The shared-source count is the important implementation count. There are 22 automatic audit occurrences, but only 6 unique automatic source defects to remediate.

## 7. CSS import graph

Current import graph revalidated against current `develop`:

| Import source | Import statement | Delivered routes | Current status | Notes |
| --- | --- | --- | --- | --- |
| `src/app/layout.js:1` | `import "@/styles/globals.css";` | all 4 commercial routes | Present | Shared base header, navigation, footer, language selector, WhatsApp float, and mobile menu styling |
| `src/app/layout.js:2` | `import "@/styles/quienessomos.css";` | all 4 commercial routes | Present | Route-named file is globally delivered, not route-local by import boundary |
| `src/app/layout.js:3` | `import "@/styles/servicios.css";` | all 4 commercial routes | Present | Route-named file is globally delivered, not route-local by import boundary |
| `src/app/layout.js:4` | `import "@/styles/contacto.css";` | all 4 commercial routes | Present | Contact-page stylesheet participates globally by import boundary |
| `src/app/page.js:1` | `import "@/app/home1.css";` | `/` only | Present | Home route loads additional route-specific CSS not delivered elsewhere |
| `src/app/page.js:2` | `import "@/styles/contacto.css";` | `/` only, in addition to layout delivery | Present | Duplicate source import of `contacto.css`; Next may dedupe the bundle, but the source relationship still exists and matters for ownership analysis |

Revalidated repository searches:

- Repo-root `rg -n 'home\.css|home1\.css' .` found `src/app/page.js` importing `home1.css`, documentation references to `home1.css`, and no confirmed consumer for `src/styles/home.css`.
- `CWD/front` `rg -n 'import .*\.css|require\(.*\.css' src` found only:
  - `src/app/layout.js`
  - `src/app/page.js`
  - `src/components/labs/globe/GlobeLab.jsx`

Immediate ownership conclusion:

- `globals.css`, `quienessomos.css`, `servicios.css`, and `contacto.css` are all delivered from the shared root layout.
- `home1.css` is home-only and can still override shared components on `/`.
- `src/styles/home.css` exists but has no confirmed consumer in current source, build config, or repo search; it remains a separate verification item rather than a confirmed dead file.

## 8. Bounded selector ownership/consumption map

| Selector | Defined in | Import source | Component consumed by | Routes loaded on | Routes matched on | MQ | Dyn | Tag dep | Specificity / order | `!important` | Duplicate / overlap | Computed winner | Verification | Evidence | Risk | Future-change warning |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `.footer-socials a` | `src/styles/globals.css:187-197` | `src/app/layout.js` | `Footer` | all 4 routes | all 4 routes | none | No | `a` descendants | class + type descendants; no route-local overlap found | No | none in inspected files | `color: rgba(255,255,255,0.75)`, `font-size: 24px` confirmed on `/` desktop | browser computed style | `browser-smoke.json` home desktop | Low | Accessible-name fixes can safely add inner text or `aria-label`, but changing wrapper structure can affect spacing and hover behavior |
| `footer` | `src/styles/globals.css:166-175`, `src/styles/globals.css:323-325`, `src/app/home1.css:2153-2155` | layout + home page | `Footer` | all 4 routes; extra home rule on `/` | all 4 routes | mobile | No | `footer` | same tag selector in both files; home1 loads after layout on `/` | No | duplicated between globals and home1 | `/` mobile uses `padding-bottom: 90px`; `/servicios` mobile uses `padding-bottom: 50px` | browser computed style | `browser-smoke.json` home mobile vs servicios mobile | High | Footer markup or spacing changes on home mobile can diverge from the other routes even though the component is shared |
| `.whatsapp-float` | `src/styles/globals.css:1059-1127`, `src/app/home1.css:2067-2072` | layout + home page | RootLayout floating WhatsApp link | all 4 routes; extra home rule on `/` | all 4 routes on mobile | mobile | No | `a` via class on shared link | same class selector; home1 loads after layout on `/` | No | duplicated between globals and home1 | `/` mobile uses `56px`, `bottom: 18px`; `/servicios` mobile uses `60px`, `bottom: 20px` | browser computed style | `browser-smoke.json` home mobile vs servicios mobile | High | Shared WhatsApp link is visually route-dependent on mobile because home1 overrides size and position |
| `nav .holder` | `src/styles/globals.css:78-86`, `133-141`, `412-414`, `548-550`, `900-937`, `988-990`; `src/app/home1.css:101-109`, `1827-1839`, `1924-1929`, `2078-2080` | layout + home page | `Nav` | all 4 routes; extra home rule on `/` | all 4 routes | desktop + mobile | Yes (`open`) | `ul` / `li` structure | multiple descendant selectors; later mobile-drawer rules in `globals.css` are more relevant than older home rules | mixed `!important` in mobile rules | heavily duplicated across globals and home1 | `/` mobile base menu uses `position: fixed`, `width: 168px`, `opacity: 0` before open, matching `globals.css:900-937` | browser computed style + static cascade | `browser-smoke.json` home mobile | High | Changing list markup, wrapper depth, or class names risks breaking the mobile drawer across all routes and the home-specific overlaps |
| `nav .holder.open` | `src/styles/globals.css:416-422`, `533-536`, `551-572`, `939-943`, `992-1022`; `src/app/home1.css:1841-1843` | layout + home page | `Nav` | all 4 routes; extra home rule on `/` | all 4 routes in open mobile state | mobile | Yes (`open`) | `ul` class state | later globals mobile drawer rules dominate home1's simpler `display:flex` rule | many `!important` in globals mobile rules | heavily duplicated across globals and home1 | Opening the menu on `/` mobile yields `class="holder open"` and the next Tab reaches the first nav link, consistent with `globals.css:939-943` | browser computed style + browser interaction | targeted CDP browser smoke | High | Any future change to `open` state handling needs regression checks on both home and non-home routes |
| `.menu-toggle` | `src/styles/globals.css:498-530`, `573-577`, `894-898`; `src/app/home1.css:1768-1785`, `1823-1825` | layout + home page | `Nav` | all 4 routes; extra home rule on `/` | all 4 routes on mobile | mobile | No | `button` via class | globals contains later mobile drawer stack and z-index rules; home1 contains an older duplicate family | mixed `!important` in globals mobile rules | duplicated across globals and home1 | Button is second tab stop on `/` mobile and toggles the menu with Enter; focus remains on the button | browser interaction | targeted CDP browser smoke | High | Menu semantics can be fixed without renaming the class, but structural refactors must preserve focus order and fixed positioning behavior |
| `.hero-carousel-progress__segment:focus-visible` | `src/app/home1.css:1050-1053` | `src/app/page.js` | `HomePageContent` | `/` | `/` | none | state classes `is-active` / `is-filled` / `is-pending` | `button` | class + pseudo-class; no conflicting rule found in inspected files | No | none in inspected files | Focused segment shows `outline-style: solid`, `outline-width: 2px`, `outline-color: rgba(255,255,255,0.88)` | browser computed style | targeted CDP browser smoke | Low | Carousel semantics can change with low CSS risk as long as the button class and focus ring remain |
| `.value-proposition` | `src/app/home1.css:492-563`, `2222-2225`, `2294-2297` | `src/app/page.js` | `HomePageContent` | `/` | `/` | desktop + mobile | Yes (`is-typing`, `is-impact`, `is-complete`) | `p` via class | single-class selector; state classes determine animation phase | No | no direct CSS overlap outside home1 | Current rendered node is the exact Lighthouse `aria-prohibited-attr` target | static + Lighthouse DOM evidence | `HomePageContent.jsx:601-627` + `home1.css` | Medium | Replacing the `<p>` element or moving the text wrapper must preserve animation state classes and spacing |
| `.code-cascade-header small` | `src/app/home1.css:256-264` | `src/app/page.js` | `CodeCascade` | `/` | `/` desktop | desktop | No | `small` | class descendant plus type selector | No | no conflicting rule found in inspected files | Lighthouse measured 2.9:1 contrast on black; current color is `rgba(255,255,255,.42)` | Lighthouse + static CSS | `CodeCascade.jsx:414-416` + `home1.css:256-264` | Medium | Contrast fixes can be isolated to the `small` text without changing CodeCascade layout |
| `.services-bg-title h1` | `src/app/home1.css:1363-1376`, `1523-1524`, `1979-1980`, `2046-2048`, `2324-2327` | `src/app/page.js` | `HomePageContent` | `/` | `/` | desktop + mobile | No | `h1` | class descendant with explicit `h1` tag dependency | No | overlaps with the Home outline itself, not with another file | This decorative/visual heading is the second `h1` in the Home outline | static DOM + source map | Home DOM dump + `HomePageContent.jsx:782-785` | High | Re-tagging or removing the Home services background heading can affect both visual presentation and the `heading-order` fix strategy |
| `.service-item h3` | `src/app/home1.css:1490-1499`, `2055-2057`, `2365-2367` | `src/app/page.js` | `HomePageContent` | `/` | `/` | desktop + mobile | No | `h3` | class descendant with explicit `h3` tag dependency | No | linked to `.service-item` GSAP animation surface | These are the exact nodes reported by the Home mobile `heading-order` audit | static DOM + Lighthouse node evidence | `HomePageContent.jsx:789-799` + GSAP selectors at `HomePageContent.jsx:446-484` | High | Changing the service-card heading level requires regression checks for CSS sizing and the pinned/animated services section |

Highest-risk CSS cross-dependencies confirmed by current evidence:

- Shared `Footer` mobile spacing differs on `/` because `home1.css` overrides `footer` padding-bottom after the shared layout CSS.
- Shared floating WhatsApp control differs on `/` mobile because `home1.css` overrides `.whatsapp-float`.
- Mobile navigation depends on a heavily duplicated selector family across `globals.css` and `home1.css`, with multiple conflicting mobile implementations and `!important` overrides.

## 9. Accessible-name and i18n inventory

Spanish automatic evidence, cross-language static findings, and browser-verified language behavior are separated below.

| Component | Source location | JSX signature | Current value | Accessible-name source | Active-language aware? | Languages affected | Visible label present? | Conflict risk | Evidence type | Classification | Recommended future mechanism |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `RootLayout` logo link image | `src/app/layout.js:52` | `<img src="/icon.png" alt="Isotipo Code Work Digital" />` | `Isotipo Code Work Digital` | `alt` (becomes link name) | No | `en`, `it` | No | No | Static | Hardcoded Spanish | translated `alt` or adjacent visible brand text with localized hidden supplement |
| `Nav` mobile menu button | `src/components/Nav.js:25` | `<button className="menu-toggle" aria-label="Toggle menu">` | `Toggle menu` | `aria-label` | No | `es`, `it` | No | No | Static + browser | Hardcoded English | translated `aria-label`, plus `aria-expanded` and `aria-controls` |
| `LanguageSelector` container | `src/components/LanguageSelector.jsx:20` | `<div className="language-selector" aria-label="Selector de idioma">` | `Selector de idioma` | `aria-label` | No | `en`, `it` | No | No | Static | Hardcoded Spanish | translated label or visible text referenced with `aria-labelledby` |
| `LanguageSelector` group | `src/components/LanguageSelector.jsx:26` | `<div className="lang-options" role="group" aria-label="Cambiar idioma">` | `Cambiar idioma` | `aria-label` | No | `en`, `it` | No | No | Static | Hardcoded Spanish | translated group label or visible group text |
| `LanguageSelector` option buttons | `src/components/LanguageSelector.jsx:32` | `<button className="lang-option ..." aria-label={\`Cambiar idioma a ${option.name}\`}>{option.label}</button>` | `Cambiar idioma a Espanol / Ingles / Italiano` | `aria-label` | No | all 3 | Yes (`ES` / `EN` / `IT`) | Yes | Automatic + static + browser | Hardcoded Spanish; conflicts with visible text | translated label that includes the visible abbreviation, or visible text plus `aria-labelledby` |
| `RootLayout` floating WhatsApp link | `src/app/layout.js:74` | `<a className="whatsapp-float" aria-label="WhatsApp">` | `WhatsApp` | `aria-label` | Yes (proper name) | none | No | No | Static | Language-neutral proper name | keep as proper name unless future content needs additional context |
| `Footer` social links | `src/components/Footer.jsx:21` and `:29` | icon-only `<a>` elements with `<FaInstagram />` / `<FaFacebookF />` | missing | none | No | all 3 | No | n/a | Automatic + browser | Missing | visible text, hidden text, or `aria-label` sourced from translations |
| `HomePageContent` value proposition paragraph | `src/components/HomePageContent.jsx:601` | `<p className="value-proposition ..." aria-label={heroValueProposition}>` | translation-derived value proposition | `aria-label` | Yes | none | No | n/a | Automatic + static | Translation-derived, but prohibited ARIA usage on unsupported element | native paragraph text or `aria-labelledby` only if semantics require it |
| `HomePageContent` carousel progress region | `src/components/HomePageContent.jsx:701` | `<div className="hero-carousel-progress ..." aria-label="Progreso del carrusel principal">` | `Progreso del carrusel principal` | `aria-label` | No | `en`, `it` | No | No | Static | Hardcoded Spanish | translated label or visible heading referenced with `aria-labelledby` |
| `HomePageContent` carousel buttons | `src/components/HomePageContent.jsx:706` | `<button ... aria-label={\`Ir al slide ${i + 1} de ${slides.length}\`}>` | `Ir al slide 1/2/3 de 3` | `aria-label` | No | `en`, `it` | No | No | Static | Hardcoded Spanish | translated `aria-label` per locale |
| `HomePageContent` benefits heading | `src/components/HomePageContent.jsx:767` | `<h2 aria-label={beneficiosHeader.titulo}>...hidden visual lines...</h2>` | translation-derived `beneficiosHeader.titulo` | `aria-label` | Yes | none | Yes (hidden visual lines form the same text) | Low | Static | Translation-derived | keep if future animation still requires hidden line fragments |
| `ContactoPageContent` social buttons | `src/components/ContactoPageContent.jsx:24`, `:34`, `:44` | `<a className="social-btn" aria-label="Instagram / Facebook / WhatsApp">` | `Instagram / Facebook / WhatsApp` | `aria-label` | Yes (proper names) | none | No | No | Static | Language-neutral proper name | keep names; address only destination placeholders separately |
| `ContactForm` name field | `src/components/ContactForm.js:59` | `<label>{formCopy.name}</label><input name="nombre" ... />` | translation-derived `Nombre` / `Name` / `Nome` | visible text only; no computed association | Yes | all 3 | Yes | n/a | Automatic + static | Missing | explicit `htmlFor` / `id` or wrapped native label association |
| `ContactForm` email field | `src/components/ContactForm.js:64` | `<label>{formCopy.email}</label><input name="email" ... />` | translation-derived `Email` | visible text only; no computed association | Yes | all 3 | Yes | n/a | Automatic + static | Missing | explicit `htmlFor` / `id` or wrapped native label association |
| `ContactForm` phone field | `src/components/ContactForm.js:69` | `<label>{formCopy.phone}</label><input name="telefono" ... />` | translation-derived `Teléfono` / `Phone` / `Telefono` | visible text only; no computed association | Yes | all 3 | Yes | n/a | Automatic + static | Missing | explicit `htmlFor` / `id` or wrapped native label association |
| `ContactForm` message field | `src/components/ContactForm.js:74` | `<label>{formCopy.message}</label><textarea name="mensaje" ... />` | translation-derived `Mensaje` / `Message` / `Messaggio` | visible text only; no computed association | Yes | all 3 | Yes | n/a | Automatic + static | Missing | explicit `htmlFor` / `id` or wrapped native label association |

Browser-verified language behavior:

- Switching from `es` to `en` updated `document.documentElement.lang` to `en` and changed the navigation text to `Home`, but the active language button still exposed `aria-label="Cambiar idioma a Ingles"`.
- Switching from `es` to `it` updated `document.documentElement.lang` to `it` and kept navigation text localized (`Home`, `Chi siamo`, `Servizi`, `Contatto`), but the active button still exposed `aria-label="Cambiar idioma a Italiano"`.
- The hardcoded Spanish language-control labels are therefore both a source-level defect and a reproduced browser defect in non-Spanish states.

## 10. Heading and semantic outline map

Route outline tables below reflect the verified rendered Spanish DOM.

### `/`

| Order | Level | Visible text / source | Source component / location | JSX signature | CSS tag dependency | JS / animation dependency | Lighthouse evidence | Semantic concern | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `h1` | `CodeWork Digital` | `HomePageContent.jsx:558` | `<h1 className="hero-title">` | `src/app/home1.css:46-56`, `391-403`, `1807-1809` | none | no direct audit node | primary page heading | DOM + source |
| 2 | `h2` | `Diseñamos. Construimos. Medimos.` | `HomePageContent.jsx:585` | `<h2 className="brutal-triad" id="cwd-narrative-title">` | `src/app/home1.css:46-56`, `451-462`, `1815-1817` | referenced by `aria-labelledby="cwd-narrative-title"` at `HomePageContent.jsx:572-585` | no direct audit node | sequential after the primary `h1` | DOM + source |
| 3 | `h2` | `Más visibilidad. Más clientes. Más resultados.` | `HomePageContent.jsx:693` | `<h2>{slide.title}</h2>` | `src/app/home1.css:1856-1860`, `1952-1954`, `2129-2131`, `2498-2500`, `2609-2611` | none | no direct audit node | carousel slide heading; clone text also appears later | DOM + source |
| 4 | `h2` | `Creamos experiencias visuales` | `HomePageContent.jsx:693` | same as above | same as above | none | no direct audit node | carousel slide heading | DOM + source |
| 5 | `h2` | `Apps móviles que conectan con tus usuarios` | `HomePageContent.jsx:693` | same as above | same as above | none | no direct audit node | carousel slide heading | DOM + source |
| 6 | `h2` | `Más visibilidad. Más clientes. Más resultados.` | `HomePageContent.jsx:693` | same as above | same as above | none | no direct audit node | cloned slide heading | DOM + source |
| 7 | `h2` | `Creamos experiencias visuales` | `HomePageContent.jsx:693` | same as above | same as above | none | no direct audit node | cloned slide heading | DOM + source |
| 8 | `h3` | `Websites que convierten` | `HomePageContent.jsx:747` | `<h3>{item.title}</h3>` | `src/app/home1.css:1273-1276` | none | no direct audit node | card front heading | DOM + source |
| 9 | `h3` | `Websites que convierten` | `HomePageContent.jsx:754` | `<h3>{expanded.title}</h3>` | `src/app/home1.css:1278-1284` | none | no direct audit node | duplicated card-back heading | DOM + source |
| 10 | `h3` | `Apps mobile a medida` | `HomePageContent.jsx:747` | same card-front pattern | same as order 8 | none | no direct audit node | card front heading | DOM + source |
| 11 | `h3` | `Apps mobile a medida` | `HomePageContent.jsx:754` | same card-back pattern | same as order 9 | none | no direct audit node | duplicated card-back heading | DOM + source |
| 12 | `h3` | `Backend robusto` | `HomePageContent.jsx:747` | same card-front pattern | same as order 8 | none | no direct audit node | card front heading | DOM + source |
| 13 | `h3` | `Backend robusto` | `HomePageContent.jsx:754` | same card-back pattern | same as order 9 | none | no direct audit node | duplicated card-back heading | DOM + source |
| 14 | `h3` | `Integraciones inteligentes` | `HomePageContent.jsx:747` | same card-front pattern | same as order 8 | none | no direct audit node | card front heading | DOM + source |
| 15 | `h3` | `Integraciones inteligentes` | `HomePageContent.jsx:754` | same card-back pattern | same as order 9 | none | no direct audit node | duplicated card-back heading | DOM + source |
| 16 | `h3` | `Performance y estabilidad` | `HomePageContent.jsx:747` | same card-front pattern | same as order 8 | none | no direct audit node | card front heading | DOM + source |
| 17 | `h3` | `Performance y estabilidad` | `HomePageContent.jsx:754` | same card-back pattern | same as order 9 | none | no direct audit node | duplicated card-back heading | DOM + source |
| 18 | `h3` | `Evolución continua` | `HomePageContent.jsx:747` | same card-front pattern | same as order 8 | none | no direct audit node | card front heading | DOM + source |
| 19 | `h3` | `Evolución continua` | `HomePageContent.jsx:754` | same card-back pattern | same as order 9 | none | no direct audit node | duplicated card-back heading | DOM + source |
| 20 | `h2` | `Tecnología pensada para crear, crecer y evolucionar.` | `HomePageContent.jsx:767` | `<h2 aria-label={beneficiosHeader.titulo}>` | `src/app/home1.css:1144-1156` | GSAP animates child `.why-title-line` spans at `HomePageContent.jsx:302-407` | no direct audit node | sequentially valid after card headings | DOM + source |
| 21 | `h1` | `SERVICIOS` | `HomePageContent.jsx:784` | `<div className="services-bg-title"><h1>{servicios.titulo}</h1></div>` | `src/app/home1.css:1363-1376`, `1523-1524`, `1979-1980`, `2046-2048`, `2324-2327` | services animation queries `.services-cards-scroll`, `.services-list`, `.service-item` at `HomePageContent.jsx:446-516`; no direct `h1` query | no direct audit node | second `h1` is not automatically invalid, but it creates the later `h1 -> h3` jump | DOM + source |
| 22 | `h3` | `Desarrollo Web` | `HomePageContent.jsx:797` | `<div className="service-item ..."><h3>{item.titulo}</h3></div>` | `src/app/home1.css:1490-1499`, `2055-2057`, `2365-2367` | GSAP animates `.service-item` at `HomePageContent.jsx:446-516` | exact `heading-order` audit node on mobile | invalid jump from the preceding `h1` | DOM + source |
| 23 | `h3` | `E-Commerce` | `HomePageContent.jsx:797` | same service-item pattern | same as order 22 | same as order 22 | same section implicated by `heading-order` | same jump pattern | DOM + source |
| 24 | `h3` | `SEO & Optimización` | `HomePageContent.jsx:797` | same service-item pattern | same as order 22 | same as order 22 | same section implicated by `heading-order` | same jump pattern | DOM + source |
| 25 | `h3` | `Desarrollo de Apps Mobile` | `HomePageContent.jsx:797` | same service-item pattern | same as order 22 | same as order 22 | same section implicated by `heading-order` | same jump pattern | DOM + source |
| 26 | `h3` | `Analítica y Decisiones` | `HomePageContent.jsx:797` | same service-item pattern | same as order 22 | same as order 22 | same section implicated by `heading-order` | same jump pattern | DOM + source |
| 27 | `h2` | `Transformemos tu idea en una experiencia digital que genere resultados.` | `HomePageContent.jsx:811` | `<h2>{cta.titulo}</h2>` | `src/app/home1.css:1599-1604`, `1755-1757`, `1992-1994`, `2149-2151` | none | no direct audit node | rendered after the invalid `h1 -> h3` section | DOM + source |
| 28 | `h3` | `CodeWork Digital` | `Footer.jsx:39` | `<h3>{footer.title}</h3>` | `src/styles/globals.css:209-216`, `327-329` | none | no direct audit node | footer heading | DOM + source |

Home heading-order conclusion:

- Multiple `h1` elements are present, but Lighthouse did not fail because of count alone.
- The exact Lighthouse evidence points to `HomePageContent.jsx:797` service-card `h3` nodes.
- The semantic break is the rendered `h1` `SERVICIOS` at order 21 followed directly by service-card `h3` nodes at orders 22-26.

### `/quienessomos`

| Order | Level | Visible text / source | Source component / location | JSX signature | CSS tag dependency | JS / animation dependency | Lighthouse evidence | Semantic concern | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `h1` | `Somos creadores de sitios web, aplicaciones y experiencias digitales que generan resultados.` | `QuienesSomosPageContent.jsx:34` | `<h1>{qs.titulo}</h1>` | `src/styles/quienessomos.css:61-69`, `430-432` | none | no direct audit node | valid primary page heading | DOM + source |
| 2 | `h2` | `Tecnología, diseño y estrategia trabajando juntos.` | `QuienesSomosPageContent.jsx:58` | `<h2>{qs.manifiestoTitulo}</h2>` | `src/styles/quienessomos.css:265-272`, `376-378`, `473-475` | none | no direct audit node | valid secondary heading | DOM + source |
| 3 | `h3` | `Diseño con propósito` | `QuienesSomosPageContent.jsx:69` | `<h3>{item.titulo}</h3>` | `src/styles/quienessomos.css:321-326` | none | no direct audit node | valid tertiary card heading | DOM + source |
| 4 | `h3` | `Tecnología sólida` | `QuienesSomosPageContent.jsx:69` | same card pattern | same as order 3 | none | no direct audit node | valid tertiary card heading | DOM + source |
| 5 | `h3` | `Acompañamiento real` | `QuienesSomosPageContent.jsx:69` | same card pattern | same as order 3 | none | no direct audit node | valid tertiary card heading | DOM + source |
| 6 | `h3` | `CodeWork Digital` | `Footer.jsx:39` | `<h3>{footer.title}</h3>` | `src/styles/globals.css:209-216`, `327-329` | none | no direct audit node | footer heading | DOM + source |

### `/servicios`

| Order | Level | Visible text / source | Source component / location | JSX signature | CSS tag dependency | JS / animation dependency | Lighthouse evidence | Semantic concern | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `h1` | `Sitios web, aplicaciones y herramientas digitales diseñadas para impulsar tu negocio.` | `ServiciosPageContent.jsx:34` | `<h1>{copy.hero.title}</h1>` | `src/styles/servicios.css:34-41`, `314-316` | none | no direct audit node | valid primary page heading | DOM + source |
| 2 | `h2` | `Soluciones digitales adaptadas a las necesidades de cada proyecto.` | `ServiciosPageContent.jsx:51` | `<h2>{copy.list.title}</h2>` | `src/styles/servicios.css:170-177` | none | no direct audit node | valid secondary heading | DOM + source |
| 3 | `h3` | `Desarrollo Web Profesional` | `ServiciosPageContent.jsx:64` | `<h3>{item.titulo}</h3>` | `src/styles/servicios.css:233-237` | none | no direct audit node | valid card heading | DOM + source |
| 4 | `h3` | `Tiendas Online y E-commerce` | `ServiciosPageContent.jsx:64` | same card pattern | same as order 3 | none | no direct audit node | valid card heading | DOM + source |
| 5 | `h3` | `Aplicaciones Web y Móviles` | `ServiciosPageContent.jsx:64` | same card pattern | same as order 3 | none | no direct audit node | valid card heading | DOM + source |
| 6 | `h3` | `Optimización y Presencia Digital` | `ServiciosPageContent.jsx:64` | same card pattern | same as order 3 | none | no direct audit node | valid card heading | DOM + source |
| 7 | `h3` | `Analítica y Decisiones` | `ServiciosPageContent.jsx:64` | same card pattern | same as order 3 | none | no direct audit node | valid card heading | DOM + source |
| 8 | `h2` | `Tu próximo cliente puede estar buscando exactamente lo que vos ofrecés.` | `ServiciosPageContent.jsx:76` | `<h2>{copy.cta.title}</h2>` | `src/styles/servicios.css:255-262` | none | no direct audit node | valid CTA heading | DOM + source |
| 9 | `h3` | `CodeWork Digital` | `Footer.jsx:39` | `<h3>{footer.title}</h3>` | `src/styles/globals.css:209-216`, `327-329` | none | no direct audit node | footer heading | DOM + source |

### `/contacto`

| Order | Level | Visible text / source | Source component / location | JSX signature | CSS tag dependency | JS / animation dependency | Lighthouse evidence | Semantic concern | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `h1` | `Hablemos sobre tu próximo proyecto digital.` | `ContactoPageContent.jsx:58` | `<h1>{copy.hero.title}</h1>` | `src/styles/contacto.css:38-44`, `298-300` | none | no direct audit node | valid primary page heading | DOM + source |
| 2 | `h2` | `¿Cómo podemos ayudarte?` | `ContactoPageContent.jsx:65` | `<h2>{copy.info.title}</h2>` | `src/styles/contacto.css:75-80` | none | no direct audit node | valid secondary heading | DOM + source |
| 3 | `h3` | `Formulario de contacto` | `ContactForm.js:56` | `<h3>{formCopy.title}</h3>` | No explicit route-local `h3` selector was found in `src/styles/contacto.css`. `src/app/home1.css` is not delivered on `/contacto`. The heading uses shared body/font inheritance plus browser heading defaults. | none | no direct audit node | valid tertiary heading | DOM + source |
| 4 | `h3` | `CodeWork Digital` | `Footer.jsx:39` | `<h3>{footer.title}</h3>` | `src/styles/globals.css:209-216`, `327-329` | none | no direct audit node | footer heading | DOM + source |

## 11. Confirmed findings

### Confirmed automatic failures

| Finding | Route coverage | Audit ID(s) | Evidence |
| --- | --- | --- | --- |
| Footer Instagram and Facebook icon links have no accessible names | all 4 routes, mobile and desktop | `link-name` | Lighthouse reported both footer anchors in every report; browser AX names were empty for both links |
| Language-selector buttons expose accessible names that do not match their visible labels | all 4 routes, mobile and desktop | `label-content-name-mismatch` | Lighthouse reported the language button node in every report |
| Contact form controls have no associated labels | `/contacto`, mobile and desktop | `label` | Lighthouse reported 4 controls in both `/contacto` reports; browser `labels.length` was `0` for all four fields |
| Home value proposition uses prohibited `aria-label` on a paragraph | `/`, mobile and desktop | `aria-prohibited-attr` | Lighthouse reported the exact `p.value-proposition` node in both Home reports |
| Home services section breaks heading order | `/`, mobile only | `heading-order` | Lighthouse reported `div.services-cards-scroll > div.services-list > div.service-item > h3` |
| Home code-cascade filename text fails contrast | `/`, desktop only | `color-contrast` | Lighthouse reported `aside.code-cascade ... > small` at 2.9:1 contrast |

### Confirmed static defects

| Finding | Components | Current evidence |
| --- | --- | --- |
| The mobile menu button is hardcoded in English (`Toggle menu`) and is not locale-aware | `Nav` | `src/components/Nav.js:25-31`; browser mobile state also exposed the same English label |
| The mobile menu button does not expose `aria-expanded` or `aria-controls` despite toggling shared navigation state | `Nav` | `src/components/Nav.js:25-31`; browser mobile smoke confirmed open/close behavior while both attributes remained `null` |
| The language selector container and group labels are hardcoded Spanish in all locales | `LanguageSelector` | `src/components/LanguageSelector.jsx:20-27` |
| The language selector button labels remain Spanish after switching to `en` and `it` | `LanguageSelector` | current source plus browser language switching to `en` and `it` |
| Home carousel region and slide buttons use hardcoded Spanish labels even when the app language changes | `HomePageContent` | `src/components/HomePageContent.jsx:701-721` |
| The logo link accessible name is hardcoded Spanish (`Isotipo Code Work Digital`) in all locales | `RootLayout` | `src/app/layout.js:52-56` |
| Contact form success and error messages are not announced programmatically | `ContactForm` | `src/components/ContactForm.js:83-85`; browser inspection found no `role`, no `aria-live`, and no status region |

### Verified browser defects

| Finding | Route / viewport | Steps | Observed result | Expected behavior |
| --- | --- | --- | --- | --- |
| Footer social links still have empty computed accessible names | `/` desktop | Browser AX inspection of both footer social anchors | Both names resolved to the empty string | Each link should expose a discernible accessible name |
| Switching to `en` leaves the active language button labelled in Spanish | `/` desktop | Focus `EN` button, press Space | `html.lang` became `en`, nav text localized to `Home`, active button label stayed `Cambiar idioma a Ingles` | Control labels should follow the active language |
| Switching to `it` leaves the active language button labelled in Spanish | `/` desktop | Focus `IT` button, press Enter | `html.lang` became `it`, nav text localized, active button label stayed `Cambiar idioma a Italiano` | Control labels should follow the active language |

Verified browser passes from the bounded smoke review:

- Mobile menu button is keyboard reachable on `/` mobile; it was the second tab stop after the logo link.
- Pressing Enter on the focused mobile menu button opened the menu, left focus on the button, and the next Tab moved to the first navigation link.
- Pressing Enter again on the focused mobile menu button closed the menu.
- Carousel progress buttons are in the desktop tab order on `/`.
- A focused carousel progress button matched `:focus-visible` and showed the intended outline from `home1.css`.
- Focusing the second carousel progress button and pressing Enter moved the active slide to `Apps móviles que conectan con tus usuarios`.
- Desktop `/servicios` tab order was logical through logo, nav links, language buttons, main CTA links, footer social links, email link, and telephone link.

## 12. Ambiguous/manual findings requiring browser review

Only items that remained unresolved after source inspection are listed here.

| Item | Current evidence | Why it remains here | Next verification surface |
| --- | --- | --- | --- |
| Real production contact-form success and error behavior against the intended backend endpoint | Source proves there is no live region; this environment also compiled `undefined/api/contacto` because `NEXT_PUBLIC_API_BASE_URL` was unset | The async network path and any production focus management after a real response were not verified against the intended backend contract | Browser test with a valid production-equivalent `NEXT_PUBLIC_API_BASE_URL`, then keyboard and screen-reader review |
| Brand-policy decision for the logo link accessible name across `en` and `it` | `alt="Isotipo Code Work Digital"` is hardcoded Spanish | Current source proves the label is not locale-aware, but the desired replacement text is a content/brand decision rather than a purely technical one | Product/content review plus browser verification in all three locales |
| Manual-audit coverage not expanded into route-specific findings | Lighthouse manual IDs were captured in every report | These require broader assistive-technology review beyond the bounded smoke performed here | `focus-traps`, `managed-focus`, `use-landmarks`, `offscreen-content-hidden`, `custom-controls-labels`, `custom-controls-roles` |

## 13. Recommended remediation increments

### Increment A — Shared accessible names and i18n

- Objective: fix shared and cross-route accessible-name defects without changing broader layout structure.
- Exact audit IDs addressed: `link-name`, `label-content-name-mismatch`.
- Confirmed static defects addressed:
  - `Nav` menu button hardcoded English name
  - `Nav` menu button missing state exposure
  - `LanguageSelector` hardcoded Spanish labels
  - `RootLayout` logo-link accessible name not locale-aware
  - `Footer` social icon links missing accessible names
  - `HomePageContent` carousel labels hardcoded Spanish
- Exact components: `src/app/layout.js`, `src/components/Nav.js`, `src/components/Footer.jsx`, `src/components/LanguageSelector.jsx`, `src/components/HomePageContent.jsx`, `src/translations.js`
- Expected files: the component files above and potentially `src/styles/globals.css` if visible helper text or focus styling needs small adjustments
- CSS risk: medium, because shared Nav/Footer/LanguageSelector markup is globally styled and Home mobile overrides touch the same surfaces
- i18n impact: high; this is the main locale-alignment increment
- Browser-validation strategy: keyboard smoke on all shared header/footer controls in `es`, `en`, and `it`; verify computed accessible names for footer links and language buttons
- Lighthouse-validation strategy: rerun the same 8 `route × profile` accessibility-only reports and verify `link-name` and `label-content-name-mismatch` disappear
- Suggested branch: `fix/cwd-shared-a11y-names-i18n`
- Suggested commit: `fix(front): align shared accessible names with active locale`
- Dependencies on prior increments: none

### Increment B — Home ARIA and semantic structure

- Objective: remove the invalid ARIA usage on Home and fix the Home heading-order failure with minimal semantic churn
- Exact audit IDs addressed: `aria-prohibited-attr`, `heading-order`
- Confirmed static defects addressed: Home services outline inconsistency and any Home-only aria misuse
- Exact components: `src/components/HomePageContent.jsx`, `src/app/home1.css`
- Expected files: `HomePageContent.jsx`, `home1.css`
- CSS risk: high, because Home headings are tied to explicit `h1` / `h2` / `h3` selectors and the services section has pinned / animated layout logic
- i18n impact: low to medium, limited to preserving translation-driven text while adjusting semantics
- Browser-validation strategy: verify Home heading order in rendered DOM, carousel controls, and Home services animation behavior on desktop and mobile
- Lighthouse-validation strategy: rerun `/` mobile and desktop accessibility reports and verify `aria-prohibited-attr` and `heading-order` are cleared without creating new failures
- Suggested branch: `fix/cwd-home-a11y-structure`
- Suggested commit: `fix(front): correct home aria usage and heading structure`
- Dependencies on prior increments: none, but it composes cleanly after Increment A

### Increment C — Contact form semantics and feedback

- Objective: make the contact form programmatically labelled and expose async status updates accessibly
- Exact audit IDs addressed: `label`
- Confirmed static defects addressed:
  - missing label/control association
  - success/error message announcement absence
- Exact components: `src/components/ContactForm.js`, optionally `src/components/ContactoPageContent.jsx` if structural wrappers need light adjustment
- Expected files: `ContactForm.js`, possibly `contacto.css` for any small focus or helper-text styling updates
- CSS risk: low to medium; the main risk is preserving current spacing in `.contacto-form-wrapper`
- i18n impact: medium, because form copy is translation-driven and any added status semantics must remain locale-aware
- Browser-validation strategy: keyboard submit flow with mocked success and error responses; verify name exposure, focus behavior, and status announcement semantics
- Lighthouse-validation strategy: rerun `/contacto` mobile and desktop accessibility reports and verify `label` is cleared
- Suggested branch: `fix/cwd-contact-form-a11y`
- Suggested commit: `fix(front): associate contact form labels and announce feedback`
- Dependencies on prior increments: none

### Increment D — Home route-local contrast cleanup

- Objective: fix the Home desktop code-cascade contrast failure without changing the CodeCascade structure
- Exact audit IDs addressed: `color-contrast`
- Confirmed static defects addressed: none outside the measured contrast issue
- Exact components: `src/components/CodeCascade.jsx`, `src/app/home1.css`
- Expected files: `home1.css` only if the current markup can stay intact
- CSS risk: low; the measured failure is isolated to `small` text color and opacity
- i18n impact: none
- Browser-validation strategy: confirm updated computed contrast styling on desktop Home and verify the code-cascade still reads visually as a background layer
- Lighthouse-validation strategy: rerun `/` desktop accessibility and confirm `color-contrast` is cleared
- Suggested branch: `fix/cwd-home-code-cascade-contrast`
- Suggested commit: `fix(front): raise home code cascade contrast`
- Dependencies on prior increments: none

### Possible later refactor — CSS ownership

- Objective: reduce shared-component styling overlap between layout-level CSS and home-only CSS
- Exact audit IDs addressed: none directly; this is a risk-reduction refactor
- Confirmed static defects addressed: none directly
- Exact components: shared `RootLayout`, `Nav`, `Footer`, `LanguageSelector`, floating WhatsApp link, Home services section
- Expected files: `src/styles/globals.css`, `src/app/home1.css`, and any future extracted shared stylesheet
- CSS risk: high, because the current overlap includes mobile menu, header, footer, and WhatsApp styles
- i18n impact: none directly
- Browser-validation strategy: compare desktop/mobile computed styles on `/` versus non-home commercial routes before and after refactor
- Lighthouse-validation strategy: rerun the 8 accessibility reports after the refactor to prove no regressions
- Suggested branch: `refactor/cwd-css-ownership`
- Suggested commit: `refactor(front): isolate shared and home-only commercial CSS`
- Dependencies on prior increments: preferably after A-D, not before them

### Possible later hygiene increment — Replace placeholder destinations

- Objective: replace current placeholder social and telephone destinations with confirmed real values
- Exact audit IDs addressed: none directly
- Confirmed static defects addressed: placeholder destinations only
- Exact components: `Footer`, `ContactoPageContent`
- Expected files: `src/components/Footer.jsx`, `src/components/ContactoPageContent.jsx`
- CSS risk: none
- i18n impact: none
- Browser-validation strategy: click-test all affected links in each route that renders them
- Lighthouse-validation strategy: none required beyond regression smoke
- Suggested branch: `chore/cwd-placeholder-destinations`
- Suggested commit: `chore(front): replace placeholder social and telephone destinations`
- Dependencies on prior increments: none

### Possible later hygiene increment — Remove tracked development logs

- Objective: stop carrying local dev logs in Git history
- Exact audit IDs addressed: none
- Confirmed static defects addressed: tracked repository hygiene issue only
- Exact components: none
- Expected files: `CWD/front/next-dev.log`, `CWD/front/next-dev.err.log`, plus ignore rules if desired in a separate change
- CSS risk: none
- i18n impact: none
- Browser-validation strategy: not applicable
- Lighthouse-validation strategy: not applicable
- Suggested branch: `chore/cwd-remove-tracked-dev-logs`
- Suggested commit: `chore(front): stop tracking local next dev logs`
- Dependencies on prior increments: none

### Possible later hygiene increment — Verify `home.css` consumption before removal

- Objective: confirm whether `src/styles/home.css` is truly dead before deleting or repurposing it
- Exact audit IDs addressed: none
- Confirmed static defects addressed: possible dead stylesheet only
- Exact components: none yet
- Expected files: `src/styles/home.css` and whichever build or entrypoint surfaces the verification proves relevant
- CSS risk: medium, because `home.css` still contains global `h2` rules and should not be removed on search evidence alone
- i18n impact: none
- Browser-validation strategy: only if a consumer is discovered
- Lighthouse-validation strategy: only if the file is later removed or repurposed
- Suggested branch: `investigate/cwd-home-css-consumption`
- Suggested commit: `docs(front): verify home css consumption before cleanup`
- Dependencies on prior increments: none

## 14. Risks and regression surfaces

- Shared navigation is globally styled and also overlaps with home-only selector families. Future markup changes to `Nav` or `.holder` should be validated on `/` and at least one non-home route in desktop and mobile states.
- Shared footer markup is globally styled, but Home mobile adds route-specific footer padding. Footer spacing changes should be verified on `/` mobile separately from the other routes.
- The floating WhatsApp link is shared markup with different mobile computed styles on `/`. Accessibility fixes to its name are low-risk, but structural or class changes are not.
- The language selector is shared, globally styled, and keyboard-reachable across all routes. Any changes to labels or wrapper structure must preserve tab order and visible active-state styling.
- The Home services section mixes semantics, CSS tag selectors, and GSAP selectors. Heading changes there should be treated as animation-sensitive.
- The Home benefits section uses hidden visual lines under a heading with `aria-label`. Semantics can be improved, but the current line-based animation depends on child `.why-title-line` spans.
- The contact form route is styled through `contacto.css`, but that stylesheet is also globally delivered. Form markup changes should be smoke-tested on `/` as well as `/contacto`.

## 15. Backlog updates

Only currently confirmed items are included here.

| Backlog item | Type | Evidence |
| --- | --- | --- |
| Shared Footer social links need accessible names | accessibility | Lighthouse `link-name` across all 8 reports; `Footer.jsx:21-34`; browser AX names empty |
| Shared language-selector button names must match visible labels and active locale | accessibility | Lighthouse `label-content-name-mismatch` across all 8 reports; `LanguageSelector.jsx:20-48`; browser `en` and `it` switching kept Spanish labels |
| Shared mobile menu button needs locale-aware name and disclosure state exposure | accessibility | `Nav.js:25-31`; browser mobile smoke confirmed open/close behavior with `aria-expanded` and `aria-controls` missing |
| Home value proposition needs semantic treatment that does not rely on prohibited ARIA | accessibility | Lighthouse `aria-prohibited-attr`; `HomePageContent.jsx:601-627` |
| Home services section needs a valid heading sequence | accessibility | Lighthouse `heading-order`; Home outline map and `HomePageContent.jsx:782-799` |
| Home code-cascade filename text needs higher contrast | accessibility | Lighthouse `color-contrast`; `CodeCascade.jsx:414-416`; `home1.css:256-264` |
| Contact form controls need programmatic label association | accessibility | Lighthouse `label`; `ContactForm.js:59-75`; browser `labels.length = 0` |
| Contact form success/error feedback needs announcement semantics | accessibility | `ContactForm.js:83-85`; browser found no `role`, no `aria-live`, no status region |
| Home carousel labels need locale-aware accessible text | accessibility | `HomePageContent.jsx:701-721`; browser language switching showed other controls localize while these labels stay Spanish |
| Footer Instagram destination is still placeholder | hygiene | `Footer.jsx:22` |
| Footer Facebook destination is still placeholder | hygiene | `Footer.jsx:30` |
| Footer telephone destination is still placeholder | hygiene | `Footer.jsx:45` |
| Contact page Facebook destination is still placeholder | hygiene | `ContactoPageContent.jsx:35` |
| `CWD/front/next-dev.log` is still tracked | hygiene | `git ls-files -- CWD/front/next-dev.log` |
| `CWD/front/next-dev.err.log` is still tracked | hygiene | `git ls-files -- CWD/front/next-dev.err.log` |
| `src/styles/home.css` still needs an independent consumption review before any cleanup | hygiene | file exists and is tracked; no confirmed consumer found by repo-root or `src` import searches |

## 16. Snapshot-derived finding revalidation

### Placeholder destinations

| Candidate | Historical source | Current verification | Current status | Active backlog? | Evidence |
| --- | --- | --- | --- | --- | --- |
| Footer Instagram placeholder | `c9e811a` snapshot | `rg -n 'TUUSUARIO|TUPAGINA|TU_FACEBOOK|tel:\+39XXXXXXXXX' src/components src/app` | Present | Yes | `src/components/Footer.jsx:22` |
| Footer Facebook placeholder | `c9e811a` snapshot | same command as above | Present | Yes | `src/components/Footer.jsx:30` |
| Footer telephone placeholder | `c9e811a` snapshot | same command as above | Present | Yes | `src/components/Footer.jsx:45` |
| `ContactoPageContent` Facebook placeholder | `c9e811a` snapshot | same command as above | Present | Yes | `src/components/ContactoPageContent.jsx:35` |

### File and repository-hygiene candidates

| Candidate | Historical source | Current verification | Current status | Active backlog? | Evidence |
| --- | --- | --- | --- | --- | --- |
| `src/styles/home.css` apparent lack of consumption | `c9e811a` snapshot | repo-root `rg -n 'home\.css|home1\.css' .`; `CWD/front` `rg -n 'import .*\.css|require\(.*\.css' src`; manual inspection of `src/app/layout.js`, `src/app/page.js`, `next.config.mjs`, `.env.example` | Present as an unresolved possible dead stylesheet | Yes | tracked file at `src/styles/home.css`; no confirmed current consumer found |
| `CWD/front/next-dev.log` tracked state | `c9e811a` snapshot | `git ls-files -- CWD/front/next-dev.log CWD/front/next-dev.err.log` | Present | Yes | `git ls-files` returned `CWD/front/next-dev.log` |
| `CWD/front/next-dev.err.log` tracked state | `c9e811a` snapshot | `git ls-files -- CWD/front/next-dev.log CWD/front/next-dev.err.log` | Present | Yes | `git ls-files` returned `CWD/front/next-dev.err.log` |
| `ContactForm postUr` contract anomaly | `c9e811a` snapshot | `rg -n '\bpostUr\b|\bpostUrl\b' src`; client bundle inspection in `.next`; browser-intercepted form submission | Present as a consistent current prop contract with no producer/consumer mismatch | No | `ContactForm.js:8,30`; `ContactoPageContent.jsx:78`; no `postUrl` contract exists; browser captured request URL `undefined/api/contacto` because `NEXT_PUBLIC_API_BASE_URL` was unset in the audit environment; the intended backend flow was not verified in that environment |
| Known unnamed Footer icon links | `c9e811a` snapshot | current source + Lighthouse + browser AX inspection | Present | Yes | `Footer.jsx:21-34`; Lighthouse `link-name`; browser AX names empty |

### Known accessible-name examples

| Candidate | Historical source | Current verification | Current status | Active backlog? | Evidence |
| --- | --- | --- | --- | --- | --- |
| `Nav` `aria-label="Toggle menu"` | `c9e811a` snapshot | `Nav.js`; browser mobile smoke | Present | Yes | `src/components/Nav.js:25-31` |
| `LanguageSelector` `aria-label="Selector de idioma"` | `c9e811a` snapshot | `LanguageSelector.jsx` | Present | Yes | `src/components/LanguageSelector.jsx:20-23` |
| `LanguageSelector` `aria-label="Cambiar idioma"` | `c9e811a` snapshot | `LanguageSelector.jsx` | Present | Yes | `src/components/LanguageSelector.jsx:26` |
| `LanguageSelector` `aria-label={\`Cambiar idioma a ${option.name}\`}` | `c9e811a` snapshot | `LanguageSelector.jsx`; Lighthouse; browser locale switching | Present | Yes | `src/components/LanguageSelector.jsx:32-37` |
| `HomePageContent` `aria-label="Progreso del carrusel principal"` | `c9e811a` snapshot | `HomePageContent.jsx` | Present | Yes | `src/components/HomePageContent.jsx:701-704` |
| `HomePageContent` `aria-label={\`Ir al slide ${i + 1} de ${slides.length}\`}` | `c9e811a` snapshot | `HomePageContent.jsx` | Present | Yes | `src/components/HomePageContent.jsx:706-721` |
| `HomePageContent` `aria-label={heroValueProposition}` | `c9e811a` snapshot | `HomePageContent.jsx`; Lighthouse `aria-prohibited-attr` | Present | Yes | `src/components/HomePageContent.jsx:601-627` |
| `HomePageContent` `aria-label={beneficiosHeader.titulo}` | `c9e811a` snapshot | `HomePageContent.jsx`; DOM dump | Present | No | `src/components/HomePageContent.jsx:767-777` |
| `RootLayout` floating WhatsApp `aria-label="WhatsApp"` | `c9e811a` snapshot | `layout.js`; browser smoke | Present | No | `src/app/layout.js:74-80` |
| `ContactoPageContent` social `aria-label="Instagram"` | `c9e811a` snapshot | `ContactoPageContent.jsx` | Present | No | `src/components/ContactoPageContent.jsx:24-31` |
| `ContactoPageContent` social `aria-label="Facebook"` | `c9e811a` snapshot | `ContactoPageContent.jsx` | Present | No | `src/components/ContactoPageContent.jsx:34-41` |
| `ContactoPageContent` social `aria-label="WhatsApp"` | current source follow-up | `ContactoPageContent.jsx` | Present | No | `src/components/ContactoPageContent.jsx:44-51` |

### Known CSS import relationships

| Candidate | Historical source | Current verification | Current status | Active backlog? | Evidence |
| --- | --- | --- | --- | --- | --- |
| `src/app/layout.js` imports `src/styles/globals.css` | `c9e811a` snapshot | manual inspection of `src/app/layout.js` | Present | No | `src/app/layout.js:1` |
| `src/app/layout.js` imports `src/styles/quienessomos.css` | `c9e811a` snapshot | manual inspection of `src/app/layout.js` | Present | No | `src/app/layout.js:2` |
| `src/app/layout.js` imports `src/styles/servicios.css` | `c9e811a` snapshot | manual inspection of `src/app/layout.js` | Present | No | `src/app/layout.js:3` |
| `src/app/layout.js` imports `src/styles/contacto.css` | `c9e811a` snapshot | manual inspection of `src/app/layout.js` | Present | No | `src/app/layout.js:4` |
| `src/app/page.js` imports `src/app/home1.css` | `c9e811a` snapshot | manual inspection of `src/app/page.js`; repo-root CSS search | Present | No | `src/app/page.js:1` |
| `src/app/page.js` imports `src/styles/contacto.css` | `c9e811a` snapshot | manual inspection of `src/app/page.js`; `src` CSS import search | Present | No | `src/app/page.js:2` |

### Known duplicated selector families

| Candidate | Historical source | Current verification | Current status | Active backlog? | Evidence |
| --- | --- | --- | --- | --- | --- |
| `nav .holder` in `src/styles/globals.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/styles/globals.css:78-86`, `133-141`, `900-937`, `988-990` |
| `nav .holder` in `src/app/home1.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/app/home1.css:101-109`, `1827-1839`, `1924-1929`, `2078-2080` |
| `nav .holder.open` in `src/styles/globals.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/styles/globals.css:416-422`, `533-536`, `551-572`, `939-943`, `992-1022` |
| `nav .holder.open` in `src/app/home1.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/app/home1.css:1841-1843` |
| `nav .holder li a` in `src/styles/globals.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/styles/globals.css:88-118`, `143-152`, `675-699`, `950-980`, `1029-1054` |
| `nav .holder li a` in `src/app/home1.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/app/home1.css:111-126`, `2082-2084` |
| `.menu-toggle` in `src/styles/globals.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/styles/globals.css:498-530`, `573-577`, `894-898` |
| `.menu-toggle` in `src/app/home1.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/app/home1.css:1768-1785`, `1823-1825` |
| `.top-header` in `src/styles/globals.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/styles/globals.css:31-53`, `594-699`, `811-872`, `887-983` |
| `.top-header` in `src/app/home1.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/app/home1.css:1898-1904` |
| `.logo-link` in `src/styles/globals.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/styles/globals.css:59-63`, `441-445`, `642-644`, `840-842` |
| `.logo-link` in `src/app/home1.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/app/home1.css:1912-1914`, `2087-2089` |
| `.logo-img` in `src/styles/globals.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/styles/globals.css:65-69`, `344-347`, `365-367`, `402-404`, `646-649`, `844-846` |
| `.logo-img` in `src/app/home1.css` | `c9e811a` snapshot | selector search + manual cascade inspection | Present | No | `src/app/home1.css:1916-1918`, `2091-2093` |

Category-level note:

- The historical CSS import relationships all share the same current status: present.
- The historical duplicated selector families listed above also all share the same current status: present.
- They are still reported as individual facts because the current map depends on the per-file ownership boundaries and overlaps.

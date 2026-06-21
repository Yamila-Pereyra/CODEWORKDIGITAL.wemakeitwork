# Hero Code Cascade

Technical guide for the decorative code strip used in the home hero.

## Files

- `src/app/page.js`: renders the code layer in the home hero.
- `src/app/home1.css`: positions and styles the layer, viewport, fade and lines.
- `src/components/CodeCascade.jsx`: owns the snippets, animation queue and tuning constants.

## Structure

The strip is intentionally separated from the `CODEWORK DIGITAL` lockup:

```jsx
<div className="hero-showcase-composition">
  <div className="hero-code-layer" aria-hidden="true">
    <CodeCascade />
  </div>

  <section className="hero">
    ...
  </section>
</div>
```

`hero-code-layer` is the decorative positioning layer. `CodeCascade` is relative inside it.
This keeps the strip visually independent from the branding block and prevents it from affecting normal layout height.

## Layering

Current z-index relationship:

- `.hero-code-layer`: `z-index: 1`
- `.hero-brand-lockup`: `z-index: 2`

The code strip stays behind the main brand/narrative content. It is decorative and uses `pointer-events: none`.

## Current Configuration

The main tuning source is `CODE_CASCADE_CONFIG` in `src/components/CodeCascade.jsx`:

```js
const CODE_CASCADE_CONFIG = {
  viewportHeight: "clamp(970px, 74vw, 1155px)",
  tabletViewportHeight: "clamp(511px, 74vw, 668px)",
  mobileViewportHeight: "clamp(371px, 97vw, 488px)",
  initialVisibleLines: 43,
  fadeoutLines: 14,
  lineHeightPx: 18.7,
  opacityFadeStartLine: 16,
  opacityFadeStep: 0.034,
  maxRenderedLines: 82,
};
```

## Parameter Meaning

`viewportHeight`

Controls the desktop visual height of the strip. This is passed to CSS as `--code-cascade-height`.
Increase this when the viewport itself needs to extend downward.

`tabletViewportHeight` and `mobileViewportHeight`

Responsive equivalents for the same visual height. Keep these proportional to desktop changes unless intentionally changing mobile behavior.

`initialVisibleLines`

Controls how many lines are present on first render. Increasing height without increasing this can make the lower area feel empty or underpopulated.

`maxRenderedLines`

Controls the maximum number of lines kept in the rolling stream. This bounds DOM size and memory. If the viewport grows, this often needs to grow too.

`fadeoutLines`

Controls the mask/fade depth at the bottom of the viewport. It is converted to pixels:

```js
fadeoutLines * lineHeightPx
```

`lineHeightPx`

Shared line-height assumption used to convert line counts into pixel fade values. If CSS font size or line-height changes, revisit this value.

`opacityFadeStartLine`

Line index where the per-line opacity decay begins. Higher values keep more lines fully visible before the fade begins.

`opacityFadeStep`

Amount of opacity removed per line after `opacityFadeStartLine`.
Lower values create a longer, more gradual visible tail. Higher values make the strip disappear sooner.

## CSS Flow

`CodeCascade` exposes CSS custom properties inline:

```js
"--code-cascade-height"
"--code-cascade-tablet-height"
"--code-cascade-mobile-height"
"--code-cascade-line-height"
"--code-cascade-opacity-fade-start"
"--code-cascade-opacity-fade-step"
"--code-cascade-fade-height"
"--code-cascade-fade-midpoint"
```

`home1.css` consumes them in:

- `.code-cascade-stream`: physical viewport height.
- `.code-cascade-viewport`: bottom mask.
- `.code-cascade-viewport::after`: bottom dark fade overlay.
- `.code-cascade-line`: per-line opacity decay.

## Why Height Alone May Not Look Different

The visible length is controlled by three things together:

1. Viewport height.
2. Available/rendered line count.
3. Opacity and mask fade behavior.

If only `viewportHeight` increases, but `initialVisibleLines`, `maxRenderedLines`, or opacity fade remain too low/aggressive, the strip may not appear longer.

For visible length changes, usually tune these together:

```js
viewportHeight
initialVisibleLines
maxRenderedLines
opacityFadeStartLine
opacityFadeStep
```

## Recommended Adjustment Patterns

Small increase, about 5-8%:

- Increase `viewportHeight` clamp values by 5-8%.
- Add 2-4 to `initialVisibleLines`.
- Add 4-8 to `maxRenderedLines`.
- Keep `opacityFadeStartLine` and `opacityFadeStep` unless the added area looks too faint.

Medium increase, about 10%:

- Increase `viewportHeight` clamp values by about 10%.
- Add 4-6 to `initialVisibleLines`.
- Add 8-10 to `maxRenderedLines`.
- Move `opacityFadeStartLine` down by 1-2 lines or reduce `opacityFadeStep` slightly.

Shorter, more editorial version:

- Reduce `viewportHeight`.
- Reduce `initialVisibleLines` and `maxRenderedLines`.
- Use a higher `opacityFadeStep` so the lower strip disappears sooner.

## Guardrails

Do not move the strip back inside `.hero-brand-lockup`.

Do not solve length by increasing hero height. The strip is decorative and should not push layout.

Do not set large values blindly. Previous excessive ranges made the strip compete with lower content:

```js
height: clamp(1123px, 86vw, 1291px)
```

Avoid horizontal changes unless explicitly requested:

- `.hero-code-layer left`
- `.hero-code-layer width`
- `.code-cascade-code font-size`
- token colors

## Responsive Notes

Desktop uses absolute positioning:

```css
.hero-code-layer {
  position: absolute;
  left: max(24px, calc((100% - 1420px) / 2));
  top: 24px;
}
```

At tablet/mobile breakpoints, the layer returns to normal flow so the hero remains stable:

```css
.hero-code-layer {
  position: relative;
  left: auto;
  top: auto;
  order: 2;
}
```

When changing desktop height, update tablet/mobile values proportionally unless the mobile composition is being tuned separately.

## Reduced Motion

`CodeCascade` uses `prefers-reduced-motion` through `useReducedMotion()`.
When reduced motion is enabled, the component uses a stable/static code state instead of the rolling typing stream.

## Current Visual Intent

The current direction is an editorial/premium technical rail:

- tall enough to support the hero composition;
- visually subordinate to `CODEWORK DIGITAL` and the narrative block;
- fading before it competes with carousel/cards;
- decorative, non-interactive, and non-semantic.


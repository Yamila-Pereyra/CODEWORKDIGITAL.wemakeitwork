# Performance Experiment - Deferred `/quienessomos` Globe Mount

## Status

**Rejected and reverted.**

This experiment was not adopted because it worsened the target Lighthouse
metric in the measurement environment.

## Context

The accepted `/quienessomos` mobile Lighthouse baseline was:

| Metric | Baseline |
|---|---:|
| Performance | 82 |
| TBT | 638 ms |
| LCP | 2.16 s |
| CLS | 0.053 |
| FCP | 1.06 s |
| Speed Index | 1.86 s |

The route renders a decorative `GlobeLab` instance behind the hero content.
`GlobeLab` performs substantial work when mounted, including Three.js renderer
setup, scene and geometry preparation, worker startup, animation-loop startup,
and progressive point/route preparation.

The `progressiveReveal` prop controls the visual choreography, but it does not
prevent the initial heavy setup from occurring when the component mounts.

## Hypothesis

Mounting `GlobeLab` after the initial paint through an idle callback would move
its heavy initialization out of the initial hydration path and reduce mobile
Total Blocking Time.

## Implementation tested

The experiment was limited to:

`CWD/front/src/components/QuienesSomosPageContent.jsx`

It introduced:

- local `shouldMountGlobe` state;
- conditional rendering of `<GlobeLab />`;
- scheduling through `requestIdleCallback({ timeout: 1500 })`;
- a `setTimeout` fallback;
- cleanup for both scheduling mechanisms;
- an always-rendered absolute wrapper to avoid layout shift.

`GlobeLab.jsx` was not modified.

## Result

Median of three mobile Lighthouse runs:

| Metric | Baseline | Experiment | Delta |
|---|---:|---:|---:|
| Performance | 82 | 77 | -5 |
| TBT | 638 ms | 910 ms | +272 ms |
| LCP | 2.16 s | 2.15 s | -0.01 s |
| CLS | 0.053 | 0.053 | 0 |
| FCP | 1.06 s | 1.07 s | +0.01 s |
| Speed Index | 1.86 s | 1.91 s | +0.05 s |

Performance spread across the three experiment runs:

`74-77`

The intervention did not improve the target metric. LCP, CLS, and FCP remained
materially unchanged, while TBT and the aggregate Performance score regressed.

## Interpretation

The demonstrated conclusion is that deferred mounting by itself did not reduce
the amount of work performed by `GlobeLab` and did not improve this route in the
measurement environment.

The most consistent explanation is that the intervention relocated the same
expensive bootstrap to a later point without reducing its total work. The
initialization still occurred early enough to be penalized within Lighthouse's
responsiveness measurement window and may also have delayed time to
interactivity.

This explanation is directional rather than formally proven because raw
before/after performance traces were not retained as committed evidence.

## Decision

The deferred-mount implementation was reverted.

The original visual behavior and accepted Lighthouse baseline were restored.

The original `/quienessomos` result is considered acceptable provisionally,
particularly because:

- LCP and CLS are healthy;
- desktop performance is strong;
- the measurement environment is synthetic, headless, and GPU-constrained;
- the globe is an intentional visual element;
- visual degradation is not justified without real-user evidence.

## Future investigation threshold

Do not reopen globe optimization solely to improve the synthetic Lighthouse
score.

Reopen this area only if one or more of the following provides evidence of a
real problem:

- field INP data;
- CrUX data;
- real-device profiling;
- visible interaction delays;
- user-reported responsiveness issues.

`GlobeLab` currently exposes tuning controls including:

- `useBloom`;
- `candidatePointCount`;
- `pixelRatioCap`;
- `routeSegments`;
- `debugTimings`.

These are possible investigation tools, not an approved optimization recipe.

Any future experiment must:

- preserve near-identical visual quality;
- measure before and after in the same environment;
- use `debugTimings` or equivalent phase evidence;
- reduce or split actual work rather than merely relocate it;
- treat deferred mounting as a rejected standalone technique.

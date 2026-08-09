# Globe Visual Regression Attribution (2026-08-09)

## 1. Sintoma

El globo compartido por `/quienessomos` y `/labs/globe` perdió halo, bloom y presencia general. La degradacion visible incluye:

- puntos mas secos y menos luminosos;
- arcos/trayectorias casi sin glow;
- cuerpo oceanico/atmosferico mas opaco visualmente;
- menos contraste neon magenta/rosa respecto del baseline aprobado.

## 2. Baseline historico

- `a04ef6c` (2026-06-17) es el ultimo baseline bueno reproducible en esta investigacion.
- `b8d057d` (2026-06-20) introduce `progressiveReveal` en `/labs/globe` y reemplaza en `/quienessomos` la invocacion historica `candidatePointCount={22000} pixelRatioCap={1.25} routeSegments={32} useBloom` por `progressiveReveal`.
- `HEAD` (`e410259`, 2026-08-09) mantiene el mismo `GlobeLab.jsx` que `b8d057d`.

## 3. Timeline de commits

### GlobeLab

`git log --follow --oneline -- CWD/front/src/components/labs/globe/GlobeLab.jsx`

- `7804aa0` crea el laboratorio.
- `b8d057d` agrega `progressiveReveal`, nueva choreography de bloom y nueva ruta de composer.
- No hay commits posteriores sobre `GlobeLab.jsx`.

### Integracion en /quienessomos

`git log --follow --oneline -- CWD/front/src/app/quienessomos/page.js`

- `ad9e400` integra el globo en el hero de About y agrega el wrapper CSS con `opacity` y `mask-image`.
- `b8d057d` cambia la integracion de About desde props explicitas a `progressiveReveal`.
- `a3b7a1e` extrae el markup a `QuienesSomosPageContent.jsx`, sin cambiar la invocacion del globo.

### CSS de /quienessomos

`git log --follow --oneline -- CWD/front/src/styles/quienessomos.css`

- `ad9e400` introduce la capa `.qs-hero-globe` con `opacity: 0.74` y `mask-image`.
- `1b7e9ab`, `61ec3d7`, `932f287` cambian otras zonas del archivo; no introducen cambios nuevos en el hero desktop del globo.
- `932f287` ajusta mobile copy/alignment; no cambia el desktop hero y mantiene `opacity: 0.30` en mobile.

## 4. Source diffs

### `b8d057d` vs `HEAD`

Resultados de `git diff b8d057d HEAD -- ...`

- `CWD/front/src/components/labs/globe/GlobeLab.jsx`: sin cambios.
- `CWD/front/src/components/labs/globe/globe-lab.css`: sin cambios.
- `CWD/front/src/app/labs/globe/page.jsx`: solo metadata SEO.
- `CWD/front/src/components/QuienesSomosPageContent.jsx`: archivo nuevo por extraccion desde `page.js`; la invocacion del globo sigue siendo `progressiveReveal`.
- `CWD/front/src/styles/quienessomos.css`: cambios en botones, cards y mobile layout; no hay cambio nuevo en el hero desktop del globo.

### `a04ef6c` vs `b8d057d`

- `/labs/globe` pasa de `<GlobeLab />` a `<GlobeLab progressiveReveal />`.
- `/quienessomos` pasa de props explicitas:
  - `candidatePointCount={22000}`
  - `pixelRatioCap={1.25}`
  - `routeSegments={32}`
  - `useBloom`
  a:
  - `progressiveReveal`
- `GlobeLab.jsx` introduce `createBloomComposer(...)`, `prepareBloomComposer()`, `enableBloom()`, `finishProgressiveRun()` y el nuevo camino de composer diferido.

## 5. Dependency diffs

Comparacion de `package.json` y `package-lock.json` entre `a04ef6c`, `b8d057d` y `HEAD`:

- `next`: `15.5.11` en las tres revisiones.
- `react`: `19.1.0` en las tres revisiones.
- `react-dom`: `19.1.0` en las tres revisiones.
- `three`: `^0.184.0` en las tres revisiones.
- Cambio posterior a `b8d057d`: se agrega `lenis@1.3.25`.

Hallazgo adicional:

- Las tres revisiones construyen con `next@15.5.11` pero resuelven `@next/swc-win32-x64-msvc@15.5.7`.
- Ese mismatch ya existe en `a04ef6c`, `b8d057d` y `HEAD`, por lo tanto no explica el inicio de la regresion visual.

## 6. Lab vs About

Clasificacion requerida:

- `CASE A`: ambos estan degradados respecto de `a04ef6c`.

Evidencia:

- `HEAD /labs/globe` ya aparece sin bloom real y con menos halo general que `a04ef6c`.
- `HEAD /quienessomos` esta aun mas atenuado porque encima del fallo de bloom aplica `opacity` y `mask-image` en el wrapper del hero.
- `b8d057d` reproduce el mismo aspecto degradado que `HEAD` tanto en lab como en About.

Conclusion:

- La causa primaria no esta en CSS de About.
- La causa primaria esta en el runtime/composer de `GlobeLab` introducido con `progressiveReveal`.
- El CSS de `/quienessomos` es un factor secundario que amplifica la perdida visual solo en esa ruta.

## 7. Evidencia runtime de composer/bloom

Builds y navegacion ejecutadas el domingo 2026-08-09:

- `npm ci`
- `npm run build`
- `npm run start`

Revisiones levantadas:

- `HEAD` en `http://127.0.0.1:3000`
- `b8d057d` en `http://127.0.0.1:3001`
- `a04ef6c` en `http://127.0.0.1:3002`

Captura runtime:

- Browser plugin sin backend disponible en esta sesion.
- Fallback usado: Playwright local, Chromium `151.0.7922.34`, viewport desktop `1440x1200`, `deviceScaleFactor: 2`.
- JSON de evidencia: [globe-inspection.json](</C:/Users/marce/AppData/Local/Temp/cwd-globe-visual-regression/artifacts/globe-inspection.json>)

### HEAD y `b8d057d`

En ambas rutas (`/labs/globe?globeDebug=1` y `/quienessomos?globeDebug=1`) aparece:

- `globe:bloom = false`
- `globe:bloom-composer-error = "Cannot set properties of undefined (setting 'bloomPass')"`
- `globe:composer-render-error`: no aparece
- `globe:full-visual-completion`: si aparece

Esto prueba:

1. `useBloom=true` no significa bloom activo.
2. El `UnrealBloomPass` no queda operativo en el camino `progressiveReveal`.
3. La aplicacion continua sin bloom porque el error ocurre en `prepareBloomComposer()` y queda absorbido por el `catch`.
4. El render sigue por el branch normal `if (composer) ... else renderer.render(...)`, o sea, queda activo el renderer fallback sin bloom.

### `a04ef6c`

En `a04ef6c`:

- `globe:bloom = true` en `/labs/globe`
- `globe:bloom = true` en `/quienessomos`
- no aparece `globe:bloom-composer-error`
- no aparece `globe:composer-render-error`

Esto confirma que el baseline historico si tenia bloom funcional bajo las mismas condiciones de browser, viewport y DPR.

## 8. Causa confirmada

### Causa primaria confirmada

La regresion nace en `b8d057d` dentro del nuevo camino `progressiveReveal`.

Lineas relevantes en [GlobeLab.jsx](/C:/Dev/Spaces/CODEWORKDIGITAL.wemakeitwork/CWD/front/src/components/labs/globe/GlobeLab.jsx:433):

- `createBloomComposer()` crea `composer`, `renderPass` y `bloomPass`.
- Luego ejecuta `composer.userData.bloomPass = bloomPass` en la linea 445.

En runtime eso falla con:

- `Cannot set properties of undefined (setting 'bloomPass')`

O sea:

- `composer.userData` es `undefined` en esta ruta;
- el error ocurre antes de que el composer quede listo;
- `prepareBloomComposer()` lo captura en [GlobeLab.jsx](/C:/Dev/Spaces/CODEWORKDIGITAL.wemakeitwork/CWD/front/src/components/labs/globe/GlobeLab.jsx:1223);
- `bloomComposerFailed` pasa a `true`;
- `finishProgressiveRun()` termina reportando `globe:bloom: false` en [GlobeLab.jsx](/C:/Dev/Spaces/CODEWORKDIGITAL.wemakeitwork/CWD/front/src/components/labs/globe/GlobeLab.jsx:1576).

Como el loop de render usa:

- `composer.render()` solo si `composer` existe;
- si no, cae en `renderer.render(scene, camera)` en [GlobeLab.jsx](/C:/Dev/Spaces/CODEWORKDIGITAL.wemakeitwork/CWD/front/src/components/labs/globe/GlobeLab.jsx:1451)

el globo sigue funcionando, pero sin bloom real.

### Factor secundario confirmado

About atenúa aun mas el resultado por CSS en [quienessomos.css](/C:/Dev/Spaces/CODEWORKDIGITAL.wemakeitwork/CWD/front/src/styles/quienessomos.css:206):

- desktop: `.qs-hero-globe { opacity: 0.74; mask-image: ... }`
- tablet: `.qs-hero-globe { opacity: 0.48; }` en [quienessomos.css](/C:/Dev/Spaces/CODEWORKDIGITAL.wemakeitwork/CWD/front/src/styles/quienessomos.css:415)
- mobile: `.qs-hero-globe { opacity: 0.30; mask-image: none; }` en [quienessomos.css](/C:/Dev/Spaces/CODEWORKDIGITAL.wemakeitwork/CWD/front/src/styles/quienessomos.css:466)

Pero:

- `filter: none`
- `mix-blend-mode: normal`
- `visibility: visible`

en todos los breakpoints inspeccionados.

Por lo tanto:

- el CSS no crea la perdida de bloom;
- solo reduce aun mas la presencia visual del output ya degradado.

## 9. CSS computed evidence

`HEAD /quienessomos?globeDebug=1`

### Desktop (`1440x1200`, DPR 2)

- `.qs-hero-globe opacity = 0.74`
- `.qs-hero-globe mask-image = linear-gradient(...)`
- `.qs-hero-globe overflow = hidden`
- `canvas opacity = 1`
- `canvas filter = none`
- `canvas mix-blend-mode = normal`

### Tablet (`1024x1366`, DPR 2)

- `.qs-hero-globe opacity = 0.48`
- `.qs-hero-globe mask-image = linear-gradient(...)`

### Mobile (`390x844`, DPR 2)

- `.qs-hero-globe opacity = 0.3`
- `.qs-hero-globe mask-image = none`
- `.qs-hero-globe-layer overflow = hidden`

No se detecto:

- `filter` degradante;
- `mix-blend-mode` raro;
- `visibility:hidden`;
- clipping inesperado del `canvas` fuera de lo definido por el wrapper.

## 10. Screenshots comparativas

### HEAD

- [/labs/globe desktop](</C:/Users/marce/AppData/Local/Temp/cwd-globe-visual-regression/artifacts/head-labs-globe-desktop.png>)
- [/quienessomos desktop](</C:/Users/marce/AppData/Local/Temp/cwd-globe-visual-regression/artifacts/head-quienessomos-desktop.png>)
- [/quienessomos tablet](</C:/Users/marce/AppData/Local/Temp/cwd-globe-visual-regression/artifacts/head-quienessomos-tablet.png>)
- [/quienessomos mobile](</C:/Users/marce/AppData/Local/Temp/cwd-globe-visual-regression/artifacts/head-quienessomos-mobile.png>)

### `b8d057d`

- [/labs/globe desktop](</C:/Users/marce/AppData/Local/Temp/cwd-globe-visual-regression/artifacts/b8d057d-labs-globe-desktop.png>)
- [/quienessomos desktop](</C:/Users/marce/AppData/Local/Temp/cwd-globe-visual-regression/artifacts/b8d057d-quienessomos-desktop.png>)

### `a04ef6c`

- [/labs/globe desktop](</C:/Users/marce/AppData/Local/Temp/cwd-globe-visual-regression/artifacts/a04ef6c-labs-globe-desktop.png>)
- [/quienessomos desktop](</C:/Users/marce/AppData/Local/Temp/cwd-globe-visual-regression/artifacts/a04ef6c-quienessomos-desktop.png>)

Resumen visual:

- `a04ef6c` muestra glow/halo mucho mas fuerte, nodos mas brillantes, trayectorias mas legibles y atmosfera azul mas evidente.
- `HEAD` y `b8d057d` se ven practicamente iguales entre si.
- `HEAD /quienessomos` es aun mas tenue que `HEAD /labs/globe` por la envolvente CSS de About.

## 11. Primer commit bueno / primer commit malo

- Primer commit bueno reproducible: `a04ef6c` (2026-06-17).
- Primer commit malo reproducible: `b8d057d` (2026-06-20).

Matiz importante:

- La primera divergencia de wrapper entre Lab y About aparece en `ad9e400` (2026-06-17), cuando About agrega `opacity` y `mask-image`.
- La primera divergencia que rompe el bloom real aparece en `b8d057d`.

## 12. Recomendacion de fix minimo

No tocar:

- bloom constants;
- opacidades;
- shaders;
- densidad;
- performance knobs;
- produccion source fuera de la rama de fix.

Fix minimo recomendado:

- corregir la ruta `createBloomComposer()` / `prepareBloomComposer()` para que el `bloomPass` se transporte sin depender de `composer.userData` inexistente.

Opciones minimas validas:

1. inicializar `composer.userData = {}` antes de asignar `bloomPass`;
2. o mejor, devolver `{ composer, bloomPass }` desde `createBloomComposer()` y consumir ambos explicitamente.

Recomendacion tecnica:

- preferir la opcion 2 porque evita depender de una propiedad no garantizada del `EffectComposer`.

## 13. Riesgos

- Al reactivar bloom real, el costo GPU volvera al nivel intencional/aprobado del globo. Eso no es una regresion funcional nueva, pero si subira respecto del estado accidentalmente bloomless actual.
- `/quienessomos` seguira viendose algo mas tenue que `/labs/globe` aun despues del fix, porque su wrapper aplica `opacity` y `mask-image`. Eso es separable del bug de composer.
- Si el objetivo final es igualar exactamente la presencia de `a04ef6c` en About, despues del fix del composer habra que decidir si la envolvente CSS de About sigue siendo diseño aprobado o si requiere un ajuste posterior independiente.

## Respuesta ejecutiva

- `GlobeLab.jsx` no cambio desde `b8d057d`.
- `/labs/globe` tambien esta degradado.
- El bloom composer no esta realmente activo en `HEAD` ni en `b8d057d`.
- Si hubo `bloom-composer-error`.
- No hubo `composer-render-error`.
- Si queda activo el fallback renderer sin bloom.
- La causa primaria esta en `GlobeLab`; `/quienessomos` CSS solo agrava el resultado.
- `b8d057d` es el primer commit malo reproducible para la perdida de bloom.
- `a04ef6c` se ve claramente mejor bajo las mismas condiciones.
- El fix minimo recomendado es reparar el transporte de `bloomPass` en la ruta `progressiveReveal`, sin tocar constantes visuales.

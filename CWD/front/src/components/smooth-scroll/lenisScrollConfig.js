export const PUBLIC_LENIS_ENABLED_PATHS = Object.freeze([
  "/",
  "/quienessomos",
  "/contacto",
  "/servicios",
]);

export const PUBLIC_LENIS_CONFIG = Object.freeze({
  lerp: 0.05,
  wheelMultiplier: 0.95,
  smoothWheel: true,
  syncTouch: false,
});

export const isPublicLenisPathEnabled = (pathname) =>
  PUBLIC_LENIS_ENABLED_PATHS.includes(pathname);

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { feature } from "topojson-client";
import landTopology from "world-atlas/land-110m.json";
import "./globe-lab.css";

const GLOBE_RADIUS = 1.25;
const GLOBE_CANDIDATE_POINT_COUNT = 60000;
const EARTH_AXIAL_TILT = THREE.MathUtils.degToRad(23.4);
const ROUTE_RADIUS = GLOBE_RADIUS * 1.012;
const ARC_ALTITUDE = 1.42;
const PULSE_SIZE = 0.032;
const ORIGIN_NODE_RADIUS = 0.017;
const ORIGIN_NODE_HALO_RADIUS = 0.027;
const ORIGIN_RING_RADIUS = 0.0385;
const BLOOM_STRENGTH = 0.82;
const BLOOM_RADIUS = 0.46;
const BLOOM_THRESHOLD = 0.12;
const GLOBE_DEBUG_TIMINGS = false;
const LAB_GLOBE_BLOOM_CHOREOGRAPHY = {
  enabled: true,
  final: {
    strength: BLOOM_STRENGTH,
    radius: BLOOM_RADIUS,
    threshold: BLOOM_THRESHOLD,
  },
  stages: {
    initial: {
      strength: 0,
      radius: 0,
      threshold: 1,
    },
    italySeed: {
      strength: 0.16,
      radius: 0.22,
      threshold: 0.34,
    },
    continentalPoints: {
      strength: 0.34,
      radius: 0.3,
      threshold: 0.24,
    },
    capitals: {
      strength: 0.46,
      radius: 0.36,
      threshold: 0.2,
    },
    atmosphere: {
      strength: 0.62,
      radius: 0.42,
      threshold: 0.16,
    },
    trajectories: {
      strength: BLOOM_STRENGTH,
      radius: BLOOM_RADIUS,
      threshold: BLOOM_THRESHOLD,
    },
  },
  composer: {
    createAfterFirstShell: false,
    createDelayMs: 80,
  },
};
const LAB_GLOBE_REVEAL_CHOREOGRAPHY = {
  enabled: true,
  italy: {
    pointRevealMs: 220,
    ringRevealMs: 320,
    pulseMs: 560,
    initialScale: 0.18,
    finalScale: 1,
    pulseScale: 1.42,
  },
  continentalPoints: {
    durationMs: 1955,
    strategy: "distance-from-italy",
    deterministicJitter: 0.08,
    startAfterMs: 420,
  },
  capitals: {
    dropDurationMs: 420,
    staggerMs: 110,
    initialYOffset: 0.16,
    startAfterContinentalProgress: 0.7,
  },
  atmosphere: {
    fadeDurationMs: 1300,
    revealMode: "antipodal-polar",
    revealOrigin: "italy-antipode",
    polarSoftness: 0.28,
    initialOpacity: 0,
    overlapWithCapitalsMs: 300,
    finalOpacity: 0.045,
    intensityRamp: 1,
  },
  trajectories: {
    revealDurationMs: 460,
    pulseDurationMs: 720,
    staggerMs: 260,
    startAfterCapitalsProgress: 0.82,
  },
  reducedMotion: {
    revealDurationMs: 0,
  },
};
const PROGRESSIVE_REVEAL_CONFIG = {
  workerEnabled: true,
  shaderRevealEnabled: true,
  revealDurationMs: LAB_GLOBE_REVEAL_CHOREOGRAPHY.continentalPoints.durationMs,
  reducedMotionRevealDurationMs: 120,
  pointSizeMin: 0.013,
  pointSizeMax: 0.026,
  revealWindowMin: 0.055,
  revealWindowMax: 0.105,
  intensityMin: 0.84,
  intensityMax: 1.34,
  pointScale: 1,
  initialPointBudget: 900,
  lowDensityPointBudget: 3200,
  workerBatchCandidateBudget: 1800,
  pointBatchBudget: 1400,
  pointBatchDelayMs: 18,
  routeBatchDelayMs: 120,
};
let landPolygonsCache = null;
const GLOBE_DATA_CACHE = new Map();
const GLOBE_PALETTE = [
  new THREE.Color(0xff8a1c),
  new THREE.Color(0xff5a5f),
  new THREE.Color(0xff4fcf),
  new THREE.Color(0xa855f7),
  new THREE.Color(0x7c3cff),
  new THREE.Color(0xffd36a),
];
const ROUTE_ORIGIN = {
  name: "Roma, Italia",
  lat: 41.9028,
  lng: 12.4964,
};
const ROUTE_DESTINATIONS = [
  { name: "Londres, Reino Unido", lat: 51.5074, lng: -0.1278 },
  { name: "Madrid, España", lat: 40.4168, lng: -3.7038 },
  { name: "Berlín, Alemania", lat: 52.52, lng: 13.405 },
  { name: "Nueva York, Estados Unidos", lat: 40.7128, lng: -74.006 },
  { name: "Ciudad de México, México", lat: 19.4326, lng: -99.1332 },
  { name: "São Paulo, Brasil", lat: -23.5505, lng: -46.6333 },
  { name: "Dubái, Emiratos Árabes Unidos", lat: 25.2048, lng: 55.2708 },
  { name: "Singapur", lat: 1.3521, lng: 103.8198 },
  { name: "Tokio, Japón", lat: 35.6762, lng: 139.6503 },
  { name: "Sídney, Australia", lat: -33.8688, lng: 151.2093 },
  { name: "Buenos Aires, Argentina", lat: -34.6037, lng: -58.3816 },
];

function getRingsBBox(rings) {
  let minLon = Infinity;
  let maxLon = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  rings.forEach((ring) => {
    ring.forEach(([longitude, latitude]) => {
      minLon = Math.min(minLon, longitude);
      maxLon = Math.max(maxLon, longitude);
      minLat = Math.min(minLat, latitude);
      maxLat = Math.max(maxLat, latitude);
    });
  });

  return { minLon, maxLon, minLat, maxLat };
}

function shiftRingsLongitude(rings) {
  return rings.map((ring) => (
    ring.map(([longitude, latitude]) => [
      longitude < 0 ? longitude + 360 : longitude,
      latitude,
    ])
  ));
}

function normalizeRingsLongitude(rings) {
  const originalBBox = getRingsBBox(rings);
  const shiftedRings = shiftRingsLongitude(rings);
  const shiftedBBox = getRingsBBox(shiftedRings);
  const originalWidth = originalBBox.maxLon - originalBBox.minLon;
  const shiftedWidth = shiftedBBox.maxLon - shiftedBBox.minLon;

  if (originalWidth > 180 && shiftedWidth < 180) {
    return {
      rings: shiftedRings,
      bbox: shiftedBBox,
      longitudeShifted: true,
    };
  }

  return {
    rings,
    bbox: originalBBox,
    longitudeShifted: false,
  };
}

function prepareLandPolygons(featureCollection) {
  return featureCollection.features.flatMap((landFeature) => {
    const { geometry } = landFeature;
    const polygons = geometry.type === "MultiPolygon"
      ? geometry.coordinates
      : [geometry.coordinates];

    return polygons.map((rings) => normalizeRingsLongitude(rings));
  });
}

function getLandPolygons() {
  if (!landPolygonsCache) {
    const landFeature = feature(landTopology, landTopology.objects.land);
    landPolygonsCache = prepareLandPolygons(landFeature);
  }

  return landPolygonsCache;
}

function isPointInRing(longitude, latitude, ring) {
  let inside = false;

  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const [currentLon, currentLat] = ring[index];
    const [previousLon, previousLat] = ring[previous];
    const intersects = (currentLat > latitude) !== (previousLat > latitude)
      && longitude < ((previousLon - currentLon) * (latitude - currentLat))
        / (previousLat - currentLat)
        + currentLon;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function isLandPoint(longitude, latitude) {
  return getLandPolygons().some(({ rings, bbox, longitudeShifted }) => {
    const testLongitude = longitudeShifted && longitude < 0
      ? longitude + 360
      : longitude;

    if (
      testLongitude < bbox.minLon
      || testLongitude > bbox.maxLon
      || latitude < bbox.minLat
      || latitude > bbox.maxLat
    ) {
      return false;
    }

    if (!isPointInRing(testLongitude, latitude, rings[0])) {
      return false;
    }

    for (let index = 1; index < rings.length; index += 1) {
      if (isPointInRing(testLongitude, latitude, rings[index])) {
        return false;
      }
    }

    return true;
  });
}

function normalizeLongitude(longitude) {
  if (longitude > 180) {
    return longitude - 360;
  }

  if (longitude < -180) {
    return longitude + 360;
  }

  return longitude;
}

function lonLatToSphere(longitude, latitude, radius) {
  const lon = THREE.MathUtils.degToRad(normalizeLongitude(longitude));
  const lat = THREE.MathUtils.degToRad(latitude);
  const radial = Math.cos(lat);

  return {
    x: radial * Math.cos(lon),
    y: Math.sin(lat),
    z: -radial * Math.sin(lon),
    longitude: normalizeLongitude(longitude),
    latitude,
    radius,
  };
}

function latLngToVector3(latitude, longitude, radius) {
  const point = lonLatToSphere(longitude, latitude, radius);

  return new THREE.Vector3(point.x * radius, point.y * radius, point.z * radius);
}

function samplePalette(stops, progress) {
  const clampedProgress = THREE.MathUtils.clamp(progress, 0, 1);
  const scaledProgress = clampedProgress * (stops.length - 1);
  const colorIndex = Math.min(Math.floor(scaledProgress), stops.length - 2);
  const localProgress = scaledProgress - colorIndex;

  return stops[colorIndex].clone().lerp(stops[colorIndex + 1], localProgress);
}

function getWarmNeonColor(point) {
  const latitudeFactor = (point.y + 1) / 2;
  const longitudeWave = (Math.sin(point.longitude * 0.035) + 1) / 2;
  const depthFactor = (point.z + 1) / 2;
  const angularFactor = (
    Math.sin(point.x * 3.2 + point.z * 2.4 + point.y * 1.6)
    + 1
  ) / 2;
  const paletteProgress = THREE.MathUtils.clamp(
    latitudeFactor * 0.34
      + longitudeWave * 0.26
      + depthFactor * 0.24
      + angularFactor * 0.16,
    0,
    1,
  );
  const color = samplePalette(GLOBE_PALETTE, paletteProgress);
  const highlight = samplePalette(GLOBE_PALETTE, (paletteProgress + 0.18) % 1);
  const highlightAmount = THREE.MathUtils.clamp(
    0.08 + depthFactor * 0.08 + Math.abs(point.y) * 0.05,
    0,
    0.18,
  );

  return color.lerp(highlight, highlightAmount);
}

function pushGlobePoint(positions, colors, point) {
  positions.push(
    point.x * point.radius,
    point.y * point.radius,
    point.z * point.radius,
  );

  const color = getWarmNeonColor(point);
  colors.push(color.r, color.g, color.b);
}

function createContinentalSphereData(count, radius) {
  const positions = [];
  const colors = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < count; index += 1) {
    const y = 1 - (index / (count - 1)) * 2;
    const radial = Math.sqrt(1 - y * y);
    const theta = goldenAngle * index;
    const x = Math.cos(theta) * radial;
    const z = Math.sin(theta) * radial;
    const longitude = THREE.MathUtils.radToDeg(Math.atan2(-z, x));
    const latitude = THREE.MathUtils.radToDeg(Math.asin(y));

    if (isLandPoint(longitude, latitude)) {
      pushGlobePoint(
        positions,
        colors,
        { x, y, z, longitude, latitude, radius },
      );
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
  };
}

function getContinentalSphereData(count, radius) {
  const cacheKey = `${count}:${radius}`;
  const cacheHit = GLOBE_DATA_CACHE.has(cacheKey);

  if (!cacheHit) {
    GLOBE_DATA_CACHE.set(cacheKey, createContinentalSphereData(count, radius));
  }

  return {
    data: GLOBE_DATA_CACHE.get(cacheKey),
    cacheHit,
  };
}

function scheduleIdleTask(callback, delay = 0) {
  if (delay > 0) {
    return {
      type: "timeout",
      id: window.setTimeout(callback, delay),
    };
  }

  if (typeof window.requestIdleCallback === "function") {
    return {
      type: "idle",
      id: window.requestIdleCallback(callback, { timeout: 50 }),
    };
  }

  return {
    type: "timeout",
    id: window.setTimeout(callback, delay),
  };
}

function cancelScheduledTask(task) {
  if (!task) {
    return;
  }

  if (task.type === "idle" && typeof window.cancelIdleCallback === "function") {
    window.cancelIdleCallback(task.id);
    return;
  }

  window.clearTimeout(task.id);
}

function createBloomComposer(renderer, scene, camera) {
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(1, 1),
    BLOOM_STRENGTH,
    BLOOM_RADIUS,
    BLOOM_THRESHOLD,
  );

  composer.addPass(renderPass);
  composer.addPass(bloomPass);
  composer.userData.bloomPass = bloomPass;

  return composer;
}

function clamp01(value) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function easeOutCubic(value) {
  const inverse = 1 - clamp01(value);
  return 1 - inverse * inverse * inverse;
}

function easeInOutCubic(value) {
  const clamped = clamp01(value);
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - ((-2 * clamped + 2) ** 3) / 2;
}

function lerpValue(from, to, amount) {
  return from + (to - from) * clamp01(amount);
}

function getTimelineProgress(elapsedMs, startMs, durationMs) {
  if (durationMs <= 0) {
    return elapsedMs >= startMs ? 1 : 0;
  }

  return clamp01((elapsedMs - startMs) / durationMs);
}

function getInterpolatedBloomState(fromState, toState, progress) {
  const easedProgress = easeInOutCubic(progress);

  return {
    strength: lerpValue(fromState.strength, toState.strength, easedProgress),
    radius: lerpValue(fromState.radius, toState.radius, easedProgress),
    threshold: lerpValue(fromState.threshold, toState.threshold, easedProgress),
  };
}

function applyBloomState(bloomPass, bloomState) {
  if (!bloomPass) {
    return;
  }

  bloomPass.strength = bloomState.strength;
  bloomPass.radius = bloomState.radius;
  bloomPass.threshold = bloomState.threshold;
}

function createGlobePointMaterial({ shaderRevealEnabled, reducedMotion }) {
  if (!shaderRevealEnabled) {
    return new THREE.PointsMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      size: 0.015,
      sizeAttenuation: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
  }

  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uRevealProgress: { value: reducedMotion ? 1 : 0 },
      uTime: { value: 0 },
      uGlobalOpacity: { value: 0.82 },
      uPointScale: { value: PROGRESSIVE_REVEAL_CONFIG.pointScale },
      uPixelRatio: { value: 1 },
      uPerspectiveScale: { value: 980 },
    },
    vertexShader: `
      attribute vec3 aPointColor;
      attribute float aRevealTime;
      attribute float aRevealDuration;
      attribute float aSize;
      attribute float aIntensity;

      uniform float uRevealProgress;
      uniform float uTime;
      uniform float uPointScale;
      uniform float uPixelRatio;
      uniform float uPerspectiveScale;

      varying vec3 vColor;
      varying float vAlpha;

      float easeOutCubic(float value) {
        float inverse = 1.0 - value;
        return 1.0 - inverse * inverse * inverse;
      }

      void main() {
        vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * modelViewPosition;

        float localProgress = clamp(
          (uRevealProgress - aRevealTime) / max(aRevealDuration, 0.001),
          0.0,
          1.0
        );
        float reveal = easeOutCubic(localProgress);
        float shimmer = 1.0 + sin(uTime * 1.8 + aRevealTime * 18.0) * 0.035;
        float revealBloomPeak = 1.08 + (1.0 - abs(localProgress * 2.0 - 1.0)) * 0.52;

        vColor = mix(aPointColor, vec3(1.0), 0.16) * aIntensity * revealBloomPeak * shimmer;
        vAlpha = reveal;
        gl_PointSize = aSize
          * uPointScale
          * uPixelRatio
          * uPerspectiveScale
          / max(0.45, -modelViewPosition.z)
          * mix(0.38, 1.0, reveal);
      }
    `,
    fragmentShader: `
      uniform float uGlobalOpacity;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec2 centeredPoint = gl_PointCoord - vec2(0.5);
        float distanceFromCenter = length(centeredPoint);
        float radialMask = 1.0 - smoothstep(0.16, 0.5, distanceFromCenter);
        float core = 1.0 - smoothstep(0.0, 0.28, distanceFromCenter);
        float alpha = max(radialMask * 0.72, core) * vAlpha * uGlobalOpacity;

        if (alpha <= 0.001) {
          discard;
        }

        gl_FragColor = vec4(vColor, alpha);
      }
    `,
  });
}

function createAtmosphereMaterial({
  finalOpacity,
  initialProgress,
  revealOrigin,
  softness,
}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uAtmosphereRevealProgress: { value: initialProgress },
      uAtmosphereRevealOrigin: { value: revealOrigin },
      uAtmosphereRevealSoftness: { value: softness },
      uAtmosphereFinalOpacity: { value: finalOpacity },
      uAtmosphereIntensity: { value: LAB_GLOBE_REVEAL_CHOREOGRAPHY.atmosphere.intensityRamp },
    },
    vertexShader: `
      varying vec3 vObjectNormal;

      void main() {
        vObjectNormal = normalize(normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uAtmosphereRevealProgress;
      uniform vec3 uAtmosphereRevealOrigin;
      uniform float uAtmosphereRevealSoftness;
      uniform float uAtmosphereFinalOpacity;
      uniform float uAtmosphereIntensity;

      varying vec3 vObjectNormal;

      void main() {
        vec3 normalDirection = normalize(vObjectNormal);
        vec3 originDirection = normalize(uAtmosphereRevealOrigin);
        float alignment = dot(normalDirection, originDirection);
        float revealFront = mix(1.05, -1.05, uAtmosphereRevealProgress);
        float revealMask = smoothstep(
          revealFront - uAtmosphereRevealSoftness,
          revealFront + uAtmosphereRevealSoftness,
          alignment
        );
        float opacityRamp = smoothstep(0.0, 0.18, uAtmosphereRevealProgress);
        vec3 color = vec3(0.019, 0.545, 1.0) * uAtmosphereIntensity;
        float alpha = revealMask * opacityRamp * uAtmosphereFinalOpacity;

        if (alpha <= 0.001) {
          discard;
        }

        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
}

function createShell(
  globeGroup,
  {
    oceanOpacity = 0.035,
    atmosphereOpacity = 0.045,
    atmosphereRevealOrigin = new THREE.Vector3(0, 0, 1),
    atmosphereRevealProgress = 1,
    atmosphereRevealSoftness = 0.28,
    directionalAtmosphere = false,
  } = {},
) {
  const oceanGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 0.985, 64, 64);
  const oceanMaterial = new THREE.MeshBasicMaterial({
    color: 0x03111a,
    transparent: true,
    opacity: oceanOpacity,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const oceanCore = new THREE.Mesh(oceanGeometry, oceanMaterial);
  oceanCore.renderOrder = 0;
  globeGroup.add(oceanCore);

  const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 64, 64);
  const atmosphereMaterial = directionalAtmosphere
    ? createAtmosphereMaterial({
      finalOpacity: atmosphereOpacity,
      initialProgress: atmosphereRevealProgress,
      revealOrigin: atmosphereRevealOrigin,
      softness: atmosphereRevealSoftness,
    })
    : new THREE.MeshBasicMaterial({
      color: 0x4fc3ff,
      transparent: true,
      opacity: atmosphereOpacity,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  atmosphere.renderOrder = 1;
  globeGroup.add(atmosphere);

  return {
    oceanGeometry,
    oceanMaterial,
    atmosphereGeometry,
    atmosphereMaterial,
  };
}

function createCapitalMarkers(globeGroup) {
  const capitalGroup = new THREE.Group();
  capitalGroup.renderOrder = 4;
  globeGroup.add(capitalGroup);

  const nodeGeometry = new THREE.SphereGeometry(ORIGIN_NODE_RADIUS, 12, 12);
  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0077,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const destinationNodeMaterial = new THREE.MeshBasicMaterial({
    color: 0xb8f1ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const originNodeHaloGeometry = new THREE.SphereGeometry(ORIGIN_NODE_HALO_RADIUS, 16, 16);
  const originNodeHaloMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0077,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const originRingGeometry = new THREE.TorusGeometry(ORIGIN_RING_RADIUS, 0.002, 8, 48);
  const originRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xffd8f1,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const originRingGlowGeometry = new THREE.TorusGeometry(ORIGIN_RING_RADIUS * 1.08, 0.004, 8, 48);
  const originRingGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const originPosition = latLngToVector3(ROUTE_ORIGIN.lat, ROUTE_ORIGIN.lng, ROUTE_RADIUS * 1.01);
  const originNormal = originPosition.clone().normalize();
  const originQuaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    originNormal,
  );
  const originNode = new THREE.Mesh(nodeGeometry, nodeMaterial);
  originNode.position.copy(originPosition);
  originNode.renderOrder = 5;
  capitalGroup.add(originNode);

  const originNodeHalo = new THREE.Mesh(originNodeHaloGeometry, originNodeHaloMaterial);
  originNodeHalo.position.copy(originPosition);
  originNodeHalo.renderOrder = 4;
  capitalGroup.add(originNodeHalo);

  const originRing = new THREE.Mesh(originRingGeometry, originRingMaterial);
  originRing.position.copy(originPosition);
  originRing.quaternion.copy(originQuaternion);
  originRing.renderOrder = 5;
  capitalGroup.add(originRing);

  const originRingGlow = new THREE.Mesh(originRingGlowGeometry, originRingGlowMaterial);
  originRingGlow.position.copy(originPosition);
  originRingGlow.quaternion.copy(originQuaternion);
  originRingGlow.renderOrder = 5;
  capitalGroup.add(originRingGlow);

  const markers = ROUTE_DESTINATIONS.map((destination, index) => {
    const finalPosition = latLngToVector3(destination.lat, destination.lng, ROUTE_RADIUS * 1.008);
    const startPosition = finalPosition
      .clone()
      .add(finalPosition.clone().normalize().multiplyScalar(LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.initialYOffset));
    const node = new THREE.Mesh(nodeGeometry, destinationNodeMaterial);
    node.position.copy(startPosition);
    node.userData.finalPosition = finalPosition;
    node.userData.startPosition = startPosition;
    node.userData.index = index;
    node.renderOrder = 4;
    capitalGroup.add(node);

    return node;
  });

  return {
    group: capitalGroup,
    originNode,
    originNodeHalo,
    originRing,
    originRingGlow,
    markers,
    nodeGeometry,
    nodeMaterial,
    destinationNodeMaterial,
    originNodeHaloGeometry,
    originNodeHaloMaterial,
    originRingGeometry,
    originRingMaterial,
    originRingGlowGeometry,
    originRingGlowMaterial,
  };
}

function createRoutes(
  globeGroup,
  routeSegments,
  routePulses,
  {
    startIndex = 0,
    endIndex = ROUTE_DESTINATIONS.length,
    includeOrigin = true,
    includeNodes = true,
  } = {},
) {
  const routesGroup = new THREE.Group();
  routesGroup.renderOrder = 3;
  globeGroup.add(routesGroup);

  const routeMaterial = new THREE.LineBasicMaterial({
    color: 0xff4fcf,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const pulseTexture = createPulseTexture();
  const pulseMaterial = new THREE.SpriteMaterial({
    map: pulseTexture,
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const routeGeometries = [];
  const destinations = ROUTE_DESTINATIONS.slice(startIndex, endIndex);

  destinations.forEach((destination, localIndex) => {
    const index = startIndex + localIndex;
    const curve = createRouteCurve(ROUTE_ORIGIN, destination, ROUTE_RADIUS);
    const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(routeSegments));
    const route = new THREE.Line(geometry, routeMaterial);
    route.renderOrder = 3;
    routesGroup.add(route);
    routeGeometries.push(geometry);

    const pulse = new THREE.Sprite(pulseMaterial);
    pulse.scale.set(PULSE_SIZE, PULSE_SIZE, PULSE_SIZE);
    pulse.renderOrder = 5;
    routesGroup.add(pulse);
    routePulses.push({
      curve,
      mesh: pulse,
      progress: (index * 0.137) % 1,
      speed: 0.04 + ((index * 0.019) % 0.03),
    });
  });

  const nodeGeometry = new THREE.SphereGeometry(ORIGIN_NODE_RADIUS, 12, 12);
  const nodeMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0077,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const destinationNodeMaterial = new THREE.MeshBasicMaterial({
    color: 0xb8f1ff,
    transparent: true,
    opacity: 0.54,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const originNodeHaloGeometry = new THREE.SphereGeometry(ORIGIN_NODE_HALO_RADIUS, 16, 16);
  const originNodeHaloMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0077,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const originRingGeometry = new THREE.TorusGeometry(ORIGIN_RING_RADIUS, 0.002, 8, 48);
  const originRingMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0077,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  const originRingGlowGeometry = new THREE.TorusGeometry(ORIGIN_RING_RADIUS * 1.08, 0.004, 8, 48);
  const originRingGlowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  });
  if (includeNodes && includeOrigin) {
    const originNode = new THREE.Mesh(nodeGeometry, nodeMaterial);
    originNode.position.copy(latLngToVector3(ROUTE_ORIGIN.lat, ROUTE_ORIGIN.lng, ROUTE_RADIUS * 1.01));
    originNode.renderOrder = 4;
    routesGroup.add(originNode);

    const originNodeHalo = new THREE.Mesh(originNodeHaloGeometry, originNodeHaloMaterial);
    originNodeHalo.position.copy(originNode.position);
    originNodeHalo.renderOrder = 4;
    routesGroup.add(originNodeHalo);

    const originRing = new THREE.Mesh(originRingGeometry, originRingMaterial);
    const originRingGlow = new THREE.Mesh(originRingGlowGeometry, originRingGlowMaterial);
    const originRingPosition = latLngToVector3(ROUTE_ORIGIN.lat, ROUTE_ORIGIN.lng, ROUTE_RADIUS * 1.01);
    const originRingNormal = originRingPosition.clone().normalize();
    const originRingQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      originRingNormal,
    );
    originRing.position.copy(originRingPosition);
    originRing.quaternion.copy(originRingQuaternion);
    originRing.renderOrder = 5;
    originRingGlow.position.copy(originRingPosition);
    originRingGlow.quaternion.copy(originRingQuaternion);
    originRingGlow.renderOrder = 5;
    routesGroup.add(originRingGlow, originRing);
  }

  if (includeNodes) {
    destinations.forEach((destination) => {
      const node = new THREE.Mesh(nodeGeometry, destinationNodeMaterial);
      node.position.copy(latLngToVector3(destination.lat, destination.lng, ROUTE_RADIUS * 1.008));
      node.renderOrder = 4;
      routesGroup.add(node);
    });
  }

  return {
    routesGroup,
    routeMaterial,
    pulseTexture,
    pulseMaterial,
    routeGeometries,
    nodeGeometry,
    nodeMaterial,
    destinationNodeMaterial,
    originNodeHaloGeometry,
    originNodeHaloMaterial,
    originRingGeometry,
    originRingMaterial,
    originRingGlowGeometry,
    originRingGlowMaterial,
  };
}

function createRouteCurve(origin, destination, radius) {
  const start = latLngToVector3(origin.lat, origin.lng, radius);
  const end = latLngToVector3(destination.lat, destination.lng, radius);
  const distance = start.distanceTo(end);
  const altitude = THREE.MathUtils.clamp(
    ARC_ALTITUDE + distance * 0.18,
    1.28,
    1.72,
  );
  const mid = start.clone().add(end).normalize().multiplyScalar(radius * altitude);

  return new THREE.CatmullRomCurve3([start, mid, end]);
}

function createPulseTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );

  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.28, "rgba(255,255,255,.88)");
  gradient.addColorStop(0.54, "rgba(255,79,207,.48)");
  gradient.addColorStop(1, "rgba(255,79,207,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  return texture;
}

export default function GlobeLab({
  className = "globe-lab",
  stageClassName = "globe-lab__stage",
  wrapper: Wrapper = "main",
  ariaLabel = "Three.js globe lab",
  candidatePointCount = GLOBE_CANDIDATE_POINT_COUNT,
  pixelRatioCap = 2,
  routeSegments = 72,
  useBloom = true,
  progressiveReveal = false,
  debugTimings = GLOBE_DEBUG_TIMINGS,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const totalStart = performance.now();
    const timings = {};
    const mark = (label, startedAt) => {
      timings[label] = Math.round((performance.now() - startedAt) * 10) / 10;
    };

    const rendererStart = performance.now();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioCap));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    container.appendChild(renderer.domElement);

    camera.position.set(0, 0, 4);

    const composer = useBloom && !progressiveReveal
      ? createBloomComposer(renderer, scene, camera)
      : null;
    mark("globe:renderer", rendererStart);

    const globeAxis = new THREE.Group();
    globeAxis.rotation.z = -EARTH_AXIAL_TILT;
    scene.add(globeAxis);

    const globeGroup = new THREE.Group();
    globeAxis.add(globeGroup);

    if (progressiveReveal) {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scheduledTasks = [];
      const disposables = [];
      const routePulses = [];
      const routeResources = [];
      let cancelled = false;
      let frameId;
      let composer = null;
      let bloomPass = null;
      let bloomComposerPrepared = false;
      let bloomComposerFailed = false;
      let pointWorker = null;
      let candidateIndex = 0;
      let pointCount = 0;
      let workerFirstBatchMarked = false;
      let firstPointsMarked = false;
      let lowDensityMarked = false;
      let routesStarted = false;
      let pointGenerationComplete = false;
      let secondaryTrajectoriesReady = false;
      let completeMarked = false;
      let denseMeshMarked = false;
      let firstRevealedPointsMarked = false;
      let currentRevealProgress = reducedMotion ? 1 : 0;
      let capitalsStarted = false;
      let atmosphereStarted = false;
      let routesStartedAt = null;
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const effectiveCandidatePointCount = reducedMotion
        ? Math.min(candidatePointCount, 24000)
        : candidatePointCount;
      const revealDurationMs = reducedMotion
        ? PROGRESSIVE_REVEAL_CONFIG.reducedMotionRevealDurationMs
        : PROGRESSIVE_REVEAL_CONFIG.revealDurationMs;
      const choreographyStartedAt = performance.now();
      const continentalStartMs = reducedMotion
        ? 0
        : LAB_GLOBE_REVEAL_CHOREOGRAPHY.continentalPoints.startAfterMs;
      const capitalStartMs = reducedMotion
        ? 0
        : continentalStartMs
          + revealDurationMs * LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.startAfterContinentalProgress;
      const lastCapitalStartMs = capitalStartMs
        + ROUTE_DESTINATIONS.length * LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.staggerMs;
      const atmosphereStartMs = reducedMotion
        ? 0
        : Math.max(
          capitalStartMs,
          lastCapitalStartMs
            - LAB_GLOBE_REVEAL_CHOREOGRAPHY.atmosphere.overlapWithCapitalsMs,
        );
      const routeStartMs = reducedMotion
        ? 0
        : capitalStartMs
          + LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.dropDurationMs
          + ROUTE_DESTINATIONS.length * LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.staggerMs
          * LAB_GLOBE_REVEAL_CHOREOGRAPHY.trajectories.startAfterCapitalsProgress;
      const maxPointCapacity = candidatePointCount;
      const positionsBuffer = new Float32Array(maxPointCapacity * 3);
      const colorsBuffer = new Float32Array(maxPointCapacity * 3);
      const revealTimeBuffer = new Float32Array(maxPointCapacity);
      const revealDurationBuffer = new Float32Array(maxPointCapacity);
      const sizeBuffer = new Float32Array(maxPointCapacity);
      const intensityBuffer = new Float32Array(maxPointCapacity);
      const italyAntipodeDirection = latLngToVector3(
        ROUTE_ORIGIN.lat,
        ROUTE_ORIGIN.lng,
        1,
      ).normalize().negate();

      const shellStart = performance.now();
      const shellResources = createShell(globeGroup, {
        atmosphereOpacity: LAB_GLOBE_REVEAL_CHOREOGRAPHY.atmosphere.finalOpacity,
        atmosphereRevealOrigin: italyAntipodeDirection,
        atmosphereRevealProgress: reducedMotion ? 1 : 0,
        atmosphereRevealSoftness: LAB_GLOBE_REVEAL_CHOREOGRAPHY.atmosphere.polarSoftness,
        directionalAtmosphere:
          LAB_GLOBE_REVEAL_CHOREOGRAPHY.atmosphere.revealMode === "antipodal-polar",
      });
      const capitalMarkers = createCapitalMarkers(globeGroup);
      disposables.push(
        shellResources.oceanGeometry,
        shellResources.oceanMaterial,
        shellResources.atmosphereGeometry,
        shellResources.atmosphereMaterial,
        capitalMarkers.nodeGeometry,
        capitalMarkers.nodeMaterial,
        capitalMarkers.destinationNodeMaterial,
        capitalMarkers.originNodeHaloGeometry,
        capitalMarkers.originNodeHaloMaterial,
        capitalMarkers.originRingGeometry,
        capitalMarkers.originRingMaterial,
        capitalMarkers.originRingGlowGeometry,
        capitalMarkers.originRingGlowMaterial,
      );
      mark("globe:first-shell", shellStart);

      const geometryStart = performance.now();
      const globeGeometry = new THREE.BufferGeometry();
      const positionAttribute = new THREE.BufferAttribute(positionsBuffer, 3);
      const colorAttribute = new THREE.BufferAttribute(colorsBuffer, 3);
      const revealTimeAttribute = new THREE.BufferAttribute(revealTimeBuffer, 1);
      const revealDurationAttribute = new THREE.BufferAttribute(revealDurationBuffer, 1);
      const sizeAttribute = new THREE.BufferAttribute(sizeBuffer, 1);
      const intensityAttribute = new THREE.BufferAttribute(intensityBuffer, 1);
      globeGeometry.setAttribute("position", positionAttribute);
      globeGeometry.setAttribute(
        PROGRESSIVE_REVEAL_CONFIG.shaderRevealEnabled ? "aPointColor" : "color",
        colorAttribute,
      );
      globeGeometry.setAttribute("aRevealTime", revealTimeAttribute);
      globeGeometry.setAttribute("aRevealDuration", revealDurationAttribute);
      globeGeometry.setAttribute("aSize", sizeAttribute);
      globeGeometry.setAttribute("aIntensity", intensityAttribute);
      globeGeometry.setDrawRange(0, 0);

      const globeMaterial = createGlobePointMaterial({
        shaderRevealEnabled: PROGRESSIVE_REVEAL_CONFIG.shaderRevealEnabled,
        reducedMotion,
      });
      const globe = new THREE.Points(globeGeometry, globeMaterial);
      globe.renderOrder = 2;
      globeGroup.add(globe);
      disposables.push(globeGeometry, globeMaterial);
      mark("globe:point-geometry-ready", geometryStart);

      const resize = () => {
        const { clientWidth, clientHeight } = container;

        camera.aspect = clientWidth / Math.max(clientHeight, 1);
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight, false);
        if (composer) {
          composer.setSize(clientWidth, clientHeight);
        }
        if (globeMaterial.uniforms) {
          globeMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, pixelRatioCap);
        }
      };

      const prepareBloomComposer = () => {
        if (
          !useBloom
          || !LAB_GLOBE_BLOOM_CHOREOGRAPHY.enabled
          || composer
          || bloomComposerFailed
          || cancelled
        ) {
          return;
        }

        const bloomStart = performance.now();
        try {
          composer = createBloomComposer(renderer, scene, camera);
          bloomPass = composer.userData.bloomPass;
          applyBloomState(bloomPass, LAB_GLOBE_BLOOM_CHOREOGRAPHY.stages.initial);
          const { clientWidth, clientHeight } = container;
          composer.setSize(clientWidth, clientHeight);
          bloomComposerPrepared = true;
          mark("globe:bloom-composer-ready", bloomStart);
        } catch (error) {
          bloomComposerFailed = true;
          timings["globe:bloom-composer-error"] = error.message || "Bloom composer failed";
          if (composer) {
            composer.dispose();
            composer = null;
          }
          bloomPass = null;
        }
      };

      const clock = new THREE.Clock();
      const renderFrame = () => {
        const delta = clock.getDelta();
        const elapsedMs = performance.now() - choreographyStartedAt;
        const italyPointProgress = reducedMotion
          ? 1
          : easeOutCubic(getTimelineProgress(
            elapsedMs,
            0,
            LAB_GLOBE_REVEAL_CHOREOGRAPHY.italy.pointRevealMs,
          ));
        const italyRingProgress = reducedMotion
          ? 1
          : easeOutCubic(getTimelineProgress(
            elapsedMs,
            LAB_GLOBE_REVEAL_CHOREOGRAPHY.italy.pointRevealMs * 0.35,
            LAB_GLOBE_REVEAL_CHOREOGRAPHY.italy.ringRevealMs,
          ));
        const italyPulseProgress = reducedMotion
          ? 1
          : getTimelineProgress(
            elapsedMs,
            LAB_GLOBE_REVEAL_CHOREOGRAPHY.italy.pointRevealMs,
            LAB_GLOBE_REVEAL_CHOREOGRAPHY.italy.pulseMs,
          );
        const revealProgress = reducedMotion
          ? 1
          : easeInOutCubic(getTimelineProgress(elapsedMs, continentalStartMs, revealDurationMs));
        const atmosphereProgress = reducedMotion
          ? 1
          : easeOutCubic(getTimelineProgress(
            elapsedMs,
            atmosphereStartMs,
            LAB_GLOBE_REVEAL_CHOREOGRAPHY.atmosphere.fadeDurationMs,
          ));
        const routeSequenceDurationMs =
          ROUTE_DESTINATIONS.length * LAB_GLOBE_REVEAL_CHOREOGRAPHY.trajectories.staggerMs
          + LAB_GLOBE_REVEAL_CHOREOGRAPHY.trajectories.revealDurationMs;
        currentRevealProgress = revealProgress;

        if (
          LAB_GLOBE_BLOOM_CHOREOGRAPHY.composer.createAfterFirstShell
          && !bloomComposerPrepared
          && elapsedMs >= LAB_GLOBE_BLOOM_CHOREOGRAPHY.composer.createDelayMs
        ) {
          prepareBloomComposer();
        }

        if (bloomPass) {
          const bloomStages = LAB_GLOBE_BLOOM_CHOREOGRAPHY.stages;
          let bloomState = bloomStages.initial;

          if (reducedMotion) {
            bloomState = LAB_GLOBE_BLOOM_CHOREOGRAPHY.final;
          } else if (elapsedMs < continentalStartMs) {
            bloomState = getInterpolatedBloomState(
              bloomStages.initial,
              bloomStages.italySeed,
              getTimelineProgress(
                elapsedMs,
                0,
                LAB_GLOBE_REVEAL_CHOREOGRAPHY.italy.pointRevealMs
                  + LAB_GLOBE_REVEAL_CHOREOGRAPHY.italy.pulseMs,
              ),
            );
          } else if (elapsedMs < capitalStartMs) {
            bloomState = getInterpolatedBloomState(
              bloomStages.italySeed,
              bloomStages.continentalPoints,
              revealProgress,
            );
          } else if (elapsedMs < atmosphereStartMs) {
            bloomState = getInterpolatedBloomState(
              bloomStages.continentalPoints,
              bloomStages.capitals,
              getTimelineProgress(
                elapsedMs,
                capitalStartMs,
                LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.dropDurationMs
                  + ROUTE_DESTINATIONS.length * LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.staggerMs,
              ),
            );
          } else if (elapsedMs < routeStartMs) {
            bloomState = getInterpolatedBloomState(
              bloomStages.capitals,
              bloomStages.atmosphere,
              atmosphereProgress,
            );
          } else {
            bloomState = getInterpolatedBloomState(
              bloomStages.atmosphere,
              bloomStages.trajectories,
              getTimelineProgress(elapsedMs, routeStartMs, routeSequenceDurationMs),
            );
          }

          applyBloomState(bloomPass, bloomState);
        }

        const italyPulseScale = 1
          + (1 - italyPulseProgress)
            * (LAB_GLOBE_REVEAL_CHOREOGRAPHY.italy.pulseScale - 1)
            * Math.sin(italyPulseProgress * Math.PI);
        const italyScale = THREE.MathUtils.lerp(
          LAB_GLOBE_REVEAL_CHOREOGRAPHY.italy.initialScale,
          LAB_GLOBE_REVEAL_CHOREOGRAPHY.italy.finalScale,
          italyPointProgress,
        );
        capitalMarkers.originNode.scale.setScalar(italyScale * italyPulseScale);
        capitalMarkers.originNodeHalo.scale.setScalar(italyScale * (1.05 + italyRingProgress * 0.18));
        capitalMarkers.originRing.scale.setScalar(italyRingProgress);
        capitalMarkers.originRingGlow.scale.setScalar(italyRingProgress * italyPulseScale);
        capitalMarkers.nodeMaterial.opacity = italyPointProgress;
        capitalMarkers.originNodeHaloMaterial.opacity = 0.42 * italyRingProgress;
        capitalMarkers.originRingMaterial.opacity = 1 * italyRingProgress;
        capitalMarkers.originRingGlowMaterial.opacity = 0.72 * italyRingProgress * (0.68 + (1 - italyPulseProgress) * 0.32);

        capitalMarkers.markers.forEach((marker, index) => {
          const markerProgress = reducedMotion
            ? 1
            : easeOutCubic(getTimelineProgress(
              elapsedMs,
              capitalStartMs + index * LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.staggerMs,
              LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.dropDurationMs,
            ));
          marker.position.lerpVectors(
            marker.userData.startPosition,
            marker.userData.finalPosition,
            markerProgress,
          );
          marker.scale.setScalar(0.74 + markerProgress * 0.26);
        });
        capitalMarkers.destinationNodeMaterial.opacity = 0.54 * (reducedMotion
          ? 1
          : easeOutCubic(getTimelineProgress(
            elapsedMs,
            capitalStartMs,
            LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.dropDurationMs
              + ROUTE_DESTINATIONS.length * LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.staggerMs,
          )));
        if (shellResources.atmosphereMaterial.uniforms) {
          shellResources.atmosphereMaterial.uniforms.uAtmosphereRevealProgress.value = atmosphereProgress;
          shellResources.atmosphereMaterial.uniforms.uAtmosphereRevealOrigin.value.copy(italyAntipodeDirection);
        } else {
          shellResources.atmosphereMaterial.opacity =
            LAB_GLOBE_REVEAL_CHOREOGRAPHY.atmosphere.finalOpacity * atmosphereProgress;
        }

        if (globeMaterial.uniforms) {
          globeMaterial.uniforms.uRevealProgress.value = revealProgress;
          globeMaterial.uniforms.uTime.value += delta;
        }

        if (!capitalsStarted && elapsedMs >= capitalStartMs) {
          capitalsStarted = true;
          mark("globe:capital-drop-start", totalStart);
        }

        if (!atmosphereStarted && elapsedMs >= atmosphereStartMs) {
          atmosphereStarted = true;
          mark("globe:atmosphere-fade-start", totalStart);
        }

        if (!denseMeshMarked && revealProgress >= 0.96) {
          denseMeshMarked = true;
          mark("globe:dense-mesh-revealed", totalStart);
        }

        if (!firstRevealedPointsMarked && pointCount > 0 && revealProgress >= 0.035) {
          firstRevealedPointsMarked = true;
          mark("globe:first-revealed-points", totalStart);
        }

        if (lowDensityMarked && !routesStarted && elapsedMs >= routeStartMs) {
          scheduleRouteStages();
        }

        if (
          pointGenerationComplete
          && secondaryTrajectoriesReady
          && !completeMarked
          && elapsedMs >= routeStartMs
            + ROUTE_DESTINATIONS.length * LAB_GLOBE_REVEAL_CHOREOGRAPHY.trajectories.staggerMs
            + LAB_GLOBE_REVEAL_CHOREOGRAPHY.trajectories.revealDurationMs
        ) {
          enableBloom();
          finishProgressiveRun();
        }

        routePulses.forEach((pulse) => {
          pulse.progress = (pulse.progress + pulse.speed * delta) % 1;
          pulse.mesh.position.copy(pulse.curve.getPointAt(pulse.progress));
        });

        routeResources.forEach((resources) => {
          const routeProgress = reducedMotion
            ? 1
            : easeOutCubic(getTimelineProgress(
              performance.now(),
              resources.startedAt,
              LAB_GLOBE_REVEAL_CHOREOGRAPHY.trajectories.revealDurationMs,
            ));
          resources.routeMaterial.opacity = 0.48 * routeProgress;
          resources.pulseMaterial.opacity = 1 * routeProgress;
        });

        globeGroup.rotation.y += 0.0025;

        try {
          if (composer) {
            composer.render();
          } else {
            renderer.render(scene, camera);
          }
        } catch (error) {
          timings["globe:composer-render-error"] = error.message || "Composer render failed";
          bloomComposerFailed = true;
          if (composer) {
            composer.dispose();
            composer = null;
            bloomPass = null;
          }
          renderer.render(scene, camera);
        } finally {
          frameId = window.requestAnimationFrame(renderFrame);
        }
      };

      const pushScheduledTask = (callback, delay = 0) => {
        const task = scheduleIdleTask(() => {
          if (!cancelled) {
            callback();
          }
        }, delay);
        scheduledTasks.push(task);
      };

      const updateDrawRange = () => {
        globeGeometry.setDrawRange(0, pointCount);
        positionAttribute.needsUpdate = true;
        colorAttribute.needsUpdate = true;
        revealTimeAttribute.needsUpdate = true;
        revealDurationAttribute.needsUpdate = true;
        sizeAttribute.needsUpdate = true;
        intensityAttribute.needsUpdate = true;
      };

      const appendPoint = (point) => {
        const bufferIndex = pointCount * 3;
        positionsBuffer[bufferIndex] = point.x * point.radius;
        positionsBuffer[bufferIndex + 1] = point.y * point.radius;
        positionsBuffer[bufferIndex + 2] = point.z * point.radius;

        const color = getWarmNeonColor(point);
        colorsBuffer[bufferIndex] = color.r;
        colorsBuffer[bufferIndex + 1] = color.g;
        colorsBuffer[bufferIndex + 2] = color.b;
        revealTimeBuffer[pointCount] = THREE.MathUtils.clamp(
          candidateIndex / Math.max(effectiveCandidatePointCount, 1),
          0,
          0.92,
        );
        revealDurationBuffer[pointCount] = PROGRESSIVE_REVEAL_CONFIG.revealWindowMin;
        sizeBuffer[pointCount] = PROGRESSIVE_REVEAL_CONFIG.pointSizeMin;
        intensityBuffer[pointCount] = PROGRESSIVE_REVEAL_CONFIG.intensityMin;
        pointCount += 1;
      };

      const appendPointBatch = ({
        positions,
        colors,
        revealTimes,
        revealDurations,
        sizes,
        intensities,
      }) => {
        const incomingPointCount = positions.length / 3;
        const availablePointCount = maxPointCapacity - pointCount;
        const copiedPointCount = Math.min(incomingPointCount, availablePointCount);

        if (copiedPointCount <= 0) {
          return;
        }

        const positionOffset = pointCount * 3;
        const positionLength = copiedPointCount * 3;
        positionsBuffer.set(positions.subarray(0, positionLength), positionOffset);
        colorsBuffer.set(colors.subarray(0, positionLength), positionOffset);
        revealTimeBuffer.set(revealTimes.subarray(0, copiedPointCount), pointCount);
        revealDurationBuffer.set(revealDurations.subarray(0, copiedPointCount), pointCount);
        sizeBuffer.set(sizes.subarray(0, copiedPointCount), pointCount);
        intensityBuffer.set(intensities.subarray(0, copiedPointCount), pointCount);
        pointCount += copiedPointCount;
        updateDrawRange();

        if (!workerFirstBatchMarked) {
          workerFirstBatchMarked = true;
          mark("globe:first-point-batch", totalStart);
        }

        if (!firstPointsMarked && pointCount >= PROGRESSIVE_REVEAL_CONFIG.initialPointBudget) {
          firstPointsMarked = true;
          mark("globe:first-points", totalStart);
        }

        if (!lowDensityMarked && pointCount >= PROGRESSIVE_REVEAL_CONFIG.lowDensityPointBudget) {
          lowDensityMarked = true;
          mark("globe:low-density-globe", totalStart);
          scheduleRouteStages();
        }
      };

      const createRouteStage = (label, options) => {
        const routesStart = performance.now();
        const resources = createRoutes(globeGroup, routeSegments, routePulses, options);
        resources.startedAt = performance.now();
        resources.routeMaterial.opacity = 0;
        resources.pulseMaterial.opacity = 0;
        routeResources.push(resources);
        mark(label, routesStart);
      };

      const enableBloom = () => {
        if (!useBloom || cancelled) {
          return;
        }

        prepareBloomComposer();
        if (bloomPass) {
          applyBloomState(bloomPass, LAB_GLOBE_BLOOM_CHOREOGRAPHY.final);
        }
      };

      const finishProgressiveRun = () => {
        if (completeMarked) {
          return;
        }

        completeMarked = true;
        mark("globe:full-visual-completion", totalStart);
        const shouldDebugTimings = debugTimings
          || window.location.search.includes("globeDebug=1");
        const timingSummary = {
          ...timings,
          "globe:rendered-points": pointCount,
          "globe:candidate-points": effectiveCandidatePointCount,
          "globe:data-cache-hit": false,
          "globe:pixel-ratio-cap": pixelRatioCap,
          "globe:bloom": Boolean(composer),
          "globe:progressive-reveal": true,
          "globe:shader-reveal": Boolean(globeMaterial.uniforms),
          "globe:reveal-duration-ms": revealDurationMs,
          "globe:reduced-motion": reducedMotion,
        };
        window.__codeworkGlobeTimingRuns = window.__codeworkGlobeTimingRuns || [];
        window.__codeworkGlobeTimingRuns.push(timingSummary);
        window.__codeworkGlobeLastTimings = timingSummary;
        if (shouldDebugTimings) {
          console.table(timingSummary);
        }
      };

      const scheduleRouteStages = () => {
        if (routesStarted || cancelled) {
          return;
        }

        if (
          PROGRESSIVE_REVEAL_CONFIG.shaderRevealEnabled
          && !reducedMotion
          && currentRevealProgress < LAB_GLOBE_REVEAL_CHOREOGRAPHY.capitals.startAfterContinentalProgress
        ) {
          return;
        }

        routesStarted = true;
        routesStartedAt = performance.now();
        ROUTE_DESTINATIONS.forEach((destination, index) => {
          pushScheduledTask(() => {
            createRouteStage(`globe:trajectory-${index + 1}`, {
              startIndex: index,
              endIndex: index + 1,
              includeOrigin: false,
              includeNodes: false,
            });
            if (index === ROUTE_DESTINATIONS.length - 1) {
              secondaryTrajectoriesReady = true;
              if (
                pointGenerationComplete
                && performance.now() - routesStartedAt
                  >= LAB_GLOBE_REVEAL_CHOREOGRAPHY.trajectories.revealDurationMs
              ) {
                enableBloom();
                finishProgressiveRun();
              }
            }
          }, index * LAB_GLOBE_REVEAL_CHOREOGRAPHY.trajectories.staggerMs);
        });
        pushScheduledTask(() => {
          secondaryTrajectoriesReady = true;
          if (pointGenerationComplete) {
            enableBloom();
            finishProgressiveRun();
          }
        }, ROUTE_DESTINATIONS.length * LAB_GLOBE_REVEAL_CHOREOGRAPHY.trajectories.staggerMs
          + LAB_GLOBE_REVEAL_CHOREOGRAPHY.trajectories.revealDurationMs);
      };

      const startWorkerPointGeneration = () => {
        if (!PROGRESSIVE_REVEAL_CONFIG.workerEnabled || typeof Worker === "undefined") {
          return false;
        }

        const workerStart = performance.now();

        try {
          pointWorker = new Worker(new URL("./globe-points.worker.js", import.meta.url), {
            type: "module",
          });
        } catch (error) {
          timings["globe:worker-start-error"] = error.message;
          pointWorker = null;
          return false;
        }

        pointWorker.onmessage = (event) => {
          if (cancelled) {
            return;
          }

          const { type, payload } = event.data || {};

          if (type === "ready") {
            timings["globe:worker-startup"] = Math.round((performance.now() - workerStart) * 10) / 10;
            timings["globe:worker-internal-startup"] = payload.startupMs;
            return;
          }

          if (type === "batch") {
            appendPointBatch(payload);
            return;
          }

          if (type === "complete") {
            timings["globe:worker-total"] = payload.totalMs;
            timings["globe:worker-batches"] = payload.batchCount;
            mark("globe:full-point-data-ready", totalStart);
            mark("globe:land-points", totalStart);
            pointGenerationComplete = true;
            if (!lowDensityMarked) {
              lowDensityMarked = true;
              mark("globe:low-density-globe", totalStart);
              scheduleRouteStages();
            }
            if (secondaryTrajectoriesReady && currentRevealProgress >= 0.98) {
              enableBloom();
              finishProgressiveRun();
            }
          }
        };

        pointWorker.onerror = (error) => {
          timings["globe:worker-error"] = error.message || "Worker point generation failed";
          if (pointWorker) {
            pointWorker.terminate();
            pointWorker = null;
          }
          if (!cancelled && pointCount === 0) {
            generatePointBatch();
          }
        };

        pointWorker.postMessage({
          type: "start",
          payload: {
            totalPointBudget: effectiveCandidatePointCount,
            radius: GLOBE_RADIUS,
            batchCandidateBudget: reducedMotion
              ? effectiveCandidatePointCount
              : PROGRESSIVE_REVEAL_CONFIG.workerBatchCandidateBudget,
          },
        });

        return true;
      };

      const generatePointBatch = () => {
        const batchStart = performance.now();
        const batchBudget = reducedMotion
          ? effectiveCandidatePointCount
          : PROGRESSIVE_REVEAL_CONFIG.pointBatchBudget;
        let processed = 0;

        while (candidateIndex < effectiveCandidatePointCount && processed < batchBudget) {
          const y = 1 - (candidateIndex / (effectiveCandidatePointCount - 1)) * 2;
          const radial = Math.sqrt(1 - y * y);
          const theta = goldenAngle * candidateIndex;
          const x = Math.cos(theta) * radial;
          const z = Math.sin(theta) * radial;
          const longitude = THREE.MathUtils.radToDeg(Math.atan2(-z, x));
          const latitude = THREE.MathUtils.radToDeg(Math.asin(y));

          if (isLandPoint(longitude, latitude)) {
            appendPoint({ x, y, z, longitude, latitude, radius: GLOBE_RADIUS });
          }

          candidateIndex += 1;
          processed += 1;
        }

        updateDrawRange();

        if (!firstPointsMarked && pointCount >= PROGRESSIVE_REVEAL_CONFIG.initialPointBudget) {
          firstPointsMarked = true;
          mark("globe:first-points", totalStart);
        }

        if (!lowDensityMarked && pointCount >= PROGRESSIVE_REVEAL_CONFIG.lowDensityPointBudget) {
          lowDensityMarked = true;
          mark("globe:low-density-globe", totalStart);
          scheduleRouteStages();
        }

        if (candidateIndex < effectiveCandidatePointCount && !cancelled) {
          const delay = Math.max(
            PROGRESSIVE_REVEAL_CONFIG.pointBatchDelayMs,
            performance.now() - batchStart,
          );
          pushScheduledTask(generatePointBatch, delay);
          return;
        }

        mark("globe:land-points", totalStart);
        pointGenerationComplete = true;
        if (!lowDensityMarked) {
          lowDensityMarked = true;
          mark("globe:low-density-globe", totalStart);
          scheduleRouteStages();
        }
        if (secondaryTrajectoriesReady && currentRevealProgress >= 0.98) {
          enableBloom();
          finishProgressiveRun();
        }
      };

      resize();
      renderFrame();
      window.addEventListener("resize", resize);

      if (!startWorkerPointGeneration()) {
        timings["globe:worker-fallback"] = true;
        if (reducedMotion) {
          generatePointBatch();
          scheduleRouteStages();
        } else {
          pushScheduledTask(generatePointBatch, 0);
        }
      }

      return () => {
        cancelled = true;
        if (pointWorker) {
          pointWorker.terminate();
          pointWorker = null;
        }
        scheduledTasks.forEach(cancelScheduledTask);
        window.cancelAnimationFrame(frameId);
        window.removeEventListener("resize", resize);

        scene.remove(globeAxis);
        routeResources.forEach((resources) => {
          resources.routeGeometries.forEach((geometry) => geometry.dispose());
          resources.routeMaterial.dispose();
          resources.pulseTexture.dispose();
          resources.pulseMaterial.dispose();
          resources.nodeGeometry.dispose();
          resources.nodeMaterial.dispose();
          resources.destinationNodeMaterial.dispose();
          resources.originNodeHaloGeometry.dispose();
          resources.originNodeHaloMaterial.dispose();
          resources.originRingGeometry.dispose();
          resources.originRingMaterial.dispose();
          resources.originRingGlowGeometry.dispose();
          resources.originRingGlowMaterial.dispose();
        });
        disposables.forEach((disposable) => disposable.dispose());
        if (composer) {
          composer.dispose();
        }
        renderer.dispose();

        if (renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement);
        }
      };
    }

    const landPointsStart = performance.now();
    const globeDataResult = getContinentalSphereData(
      candidatePointCount,
      GLOBE_RADIUS,
    );
    const globeData = globeDataResult.data;
    mark("globe:land-points", landPointsStart);

    const geometryStart = performance.now();
    const globeGeometry = new THREE.BufferGeometry();
    globeGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(globeData.positions, 3),
    );
    globeGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(globeData.colors, 3),
    );

    const globeMaterial = new THREE.PointsMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      size: 0.015,
      sizeAttenuation: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const globe = new THREE.Points(globeGeometry, globeMaterial);
    globe.renderOrder = 2;
    globeGroup.add(globe);

    const oceanGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 0.985, 64, 64);
    const oceanMaterial = new THREE.MeshBasicMaterial({
      color: 0x03111a,
      transparent: true,
      opacity: 0.035,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const oceanCore = new THREE.Mesh(oceanGeometry, oceanMaterial);
    oceanCore.renderOrder = 0;
    globeGroup.add(oceanCore);

    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 64, 64);
    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x4fc3ff,
      transparent: true,
      opacity: 0.045,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.renderOrder = 1;
    globeGroup.add(atmosphere);
    mark("globe:geometry", geometryStart);

    const routesStart = performance.now();
    const routesGroup = new THREE.Group();
    routesGroup.renderOrder = 3;
    globeGroup.add(routesGroup);

    const routeMaterial = new THREE.LineBasicMaterial({
      color: 0xff4fcf,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const pulseTexture = createPulseTexture();
    const pulseMaterial = new THREE.SpriteMaterial({
      map: pulseTexture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const routePulses = [];
    const routeGeometries = ROUTE_DESTINATIONS.map((destination, index) => {
      const curve = createRouteCurve(ROUTE_ORIGIN, destination, ROUTE_RADIUS);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(routeSegments));
      const route = new THREE.Line(geometry, routeMaterial);
      route.renderOrder = 3;
      routesGroup.add(route);

      const pulse = new THREE.Sprite(pulseMaterial);
      pulse.scale.set(PULSE_SIZE, PULSE_SIZE, PULSE_SIZE);
      pulse.renderOrder = 5;
      routesGroup.add(pulse);
      routePulses.push({
        curve,
        mesh: pulse,
        progress: (index * 0.137) % 1,
        speed: 0.04 + ((index * 0.019) % 0.03),
      });

      return geometry;
    });

    const nodeGeometry = new THREE.SphereGeometry(ORIGIN_NODE_RADIUS, 12, 12);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0077,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const destinationNodeMaterial = new THREE.MeshBasicMaterial({
      color: 0xb8f1ff,
      transparent: true,
      opacity: 0.54,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const originNode = new THREE.Mesh(nodeGeometry, nodeMaterial);
    originNode.position.copy(latLngToVector3(ROUTE_ORIGIN.lat, ROUTE_ORIGIN.lng, ROUTE_RADIUS * 1.01));
    originNode.renderOrder = 4;
    routesGroup.add(originNode);

    const originNodeHaloGeometry = new THREE.SphereGeometry(ORIGIN_NODE_HALO_RADIUS, 16, 16);
    const originNodeHaloMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0077,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const originNodeHalo = new THREE.Mesh(originNodeHaloGeometry, originNodeHaloMaterial);
    originNodeHalo.position.copy(originNode.position);
    originNodeHalo.renderOrder = 4;
    routesGroup.add(originNodeHalo);

    const originRingGeometry = new THREE.TorusGeometry(ORIGIN_RING_RADIUS, 0.002, 8, 48);
    const originRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0077,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const originRingGlowGeometry = new THREE.TorusGeometry(ORIGIN_RING_RADIUS * 1.08, 0.004, 8, 48);
    const originRingGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const originRing = new THREE.Mesh(originRingGeometry, originRingMaterial);
    const originRingGlow = new THREE.Mesh(originRingGlowGeometry, originRingGlowMaterial);
    const originRingPosition = latLngToVector3(ROUTE_ORIGIN.lat, ROUTE_ORIGIN.lng, ROUTE_RADIUS * 1.01);
    const originRingNormal = originRingPosition.clone().normalize();
    const originRingQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      originRingNormal,
    );
    originRing.position.copy(originRingPosition);
    originRing.quaternion.copy(originRingQuaternion);
    originRing.renderOrder = 5;
    originRingGlow.position.copy(originRingPosition);
    originRingGlow.quaternion.copy(originRingQuaternion);
    originRingGlow.renderOrder = 5;
    routesGroup.add(originRingGlow, originRing);

    ROUTE_DESTINATIONS.forEach((destination) => {
      const node = new THREE.Mesh(nodeGeometry, destinationNodeMaterial);
      node.position.copy(latLngToVector3(destination.lat, destination.lng, ROUTE_RADIUS * 1.008));
      node.renderOrder = 4;
      routesGroup.add(node);
    });
    mark("globe:routes", routesStart);

    let frameId;
    const clock = new THREE.Clock();

    const resize = () => {
      const { clientWidth, clientHeight } = container;

      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
      if (composer) {
        composer.setSize(clientWidth, clientHeight);
      }
    };

    const animate = () => {
      const delta = clock.getDelta();

      routePulses.forEach((pulse) => {
        pulse.progress = (pulse.progress + pulse.speed * delta) % 1;
        pulse.mesh.position.copy(pulse.curve.getPointAt(pulse.progress));
      });

      globeGroup.rotation.y += 0.0025;

      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
    mark("globe:total", totalStart);
    const shouldDebugTimings = debugTimings
      || window.location.search.includes("globeDebug=1");
    const timingSummary = {
        ...timings,
        "globe:rendered-points": globeData.positions.length / 3,
        "globe:candidate-points": candidatePointCount,
        "globe:data-cache-hit": globeDataResult.cacheHit,
        "globe:pixel-ratio-cap": pixelRatioCap,
        "globe:bloom": useBloom,
    };
    if (shouldDebugTimings) {
      window.__codeworkGlobeTimingRuns = window.__codeworkGlobeTimingRuns || [];
      window.__codeworkGlobeTimingRuns.push(timingSummary);
      window.__codeworkGlobeLastTimings = timingSummary;
      console.table(timingSummary);
    }
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);

      scene.remove(globeAxis);
      globeGeometry.dispose();
      globeMaterial.dispose();
      oceanGeometry.dispose();
      oceanMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      routeGeometries.forEach((geometry) => geometry.dispose());
      routeMaterial.dispose();
      pulseTexture.dispose();
      pulseMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      originNodeHaloGeometry.dispose();
      originNodeHaloMaterial.dispose();
      destinationNodeMaterial.dispose();
      originRingGeometry.dispose();
      originRingMaterial.dispose();
      originRingGlowGeometry.dispose();
      originRingGlowMaterial.dispose();
      if (composer) {
        composer.dispose();
      }
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [candidatePointCount, debugTimings, pixelRatioCap, progressiveReveal, routeSegments, useBloom]);

  return (
    <Wrapper className={className}>
      <div className={stageClassName} ref={containerRef} aria-label={ariaLabel} />
    </Wrapper>
  );
}

import { feature } from "topojson-client";
import landTopology from "world-atlas/land-110m.json";

const GLOBE_PALETTE = [
  0xff8a1c,
  0xff5a5f,
  0xff4fcf,
  0xa855f7,
  0x7c3cff,
  0xffd36a,
].map(hexToLinearRgb);

function srgbChannelToLinear(value) {
  if (value <= 0.04045) {
    return value / 12.92;
  }

  return ((value + 0.055) / 1.055) ** 2.4;
}

function hexToLinearRgb(hex) {
  const r = ((hex >> 16) & 255) / 255;
  const g = ((hex >> 8) & 255) / 255;
  const b = (hex & 255) / 255;

  return [
    srgbChannelToLinear(r),
    srgbChannelToLinear(g),
    srgbChannelToLinear(b),
  ];
}

const LAND_FEATURE = feature(landTopology, landTopology.objects.land);
const LAND_POLYGONS = prepareLandPolygons(LAND_FEATURE);
const ROUTE_ORIGIN = { lat: 41.9028, lng: 12.4964 };
const ROUTE_DESTINATIONS = [
  { lat: 51.5074, lng: -0.1278 },
  { lat: 40.4168, lng: -3.7038 },
  { lat: 52.52, lng: 13.405 },
  { lat: 40.7128, lng: -74.006 },
  { lat: 19.4326, lng: -99.1332 },
  { lat: -23.5505, lng: -46.6333 },
  { lat: 25.2048, lng: 55.2708 },
  { lat: 1.3521, lng: 103.8198 },
  { lat: 35.6762, lng: 139.6503 },
  { lat: -33.8688, lng: 151.2093 },
  { lat: -34.6037, lng: -58.3816 },
];
const REVEAL_DEFAULTS = {
  pointSizeMin: 0.013,
  pointSizeMax: 0.026,
  revealWindowMin: 0.055,
  revealWindowMax: 0.105,
  intensityMin: 0.84,
  intensityMax: 1.34,
  deterministicJitter: 0.08,
};

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
  return LAND_POLYGONS.some(({ rings, bbox, longitudeShifted }) => {
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

function lerpColor(from, to, amount) {
  return [
    from[0] + (to[0] - from[0]) * amount,
    from[1] + (to[1] - from[1]) * amount,
    from[2] + (to[2] - from[2]) * amount,
  ];
}

function samplePalette(stops, progress) {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const scaledProgress = clampedProgress * (stops.length - 1);
  const colorIndex = Math.min(Math.floor(scaledProgress), stops.length - 2);
  const localProgress = scaledProgress - colorIndex;

  return lerpColor(stops[colorIndex], stops[colorIndex + 1], localProgress);
}

function getWarmNeonColor(point) {
  const latitudeFactor = (point.y + 1) / 2;
  const longitudeWave = (Math.sin(point.longitude * 0.035) + 1) / 2;
  const depthFactor = (point.z + 1) / 2;
  const angularFactor = (
    Math.sin(point.x * 3.2 + point.z * 2.4 + point.y * 1.6)
    + 1
  ) / 2;
  const paletteProgress = Math.max(
    0,
    Math.min(
      1,
      latitudeFactor * 0.34
        + longitudeWave * 0.26
        + depthFactor * 0.24
        + angularFactor * 0.16,
    ),
  );
  const color = samplePalette(GLOBE_PALETTE, paletteProgress);
  const highlight = samplePalette(GLOBE_PALETTE, (paletteProgress + 0.18) % 1);
  const highlightAmount = Math.max(
    0,
    Math.min(0.18, 0.08 + depthFactor * 0.08 + Math.abs(point.y) * 0.05),
  );

  return lerpColor(color, highlight, highlightAmount);
}

function getAngularDistance(latitudeA, longitudeA, latitudeB, longitudeB) {
  const latA = (latitudeA * Math.PI) / 180;
  const latB = (latitudeB * Math.PI) / 180;
  const lonDelta = ((longitudeB - longitudeA) * Math.PI) / 180;
  const sinLatDelta = Math.sin((latB - latA) / 2);
  const sinLonDelta = Math.sin(lonDelta / 2);
  const haversine = sinLatDelta * sinLatDelta
    + Math.cos(latA) * Math.cos(latB) * sinLonDelta * sinLonDelta;

  return 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(Math.max(0, 1 - haversine)));
}

function createRevealAttributes({ candidateIndex, totalPointBudget, latitude, longitude, point }) {
  const italyDistance = getAngularDistance(latitude, longitude, ROUTE_ORIGIN.lat, ROUTE_ORIGIN.lng);
  const distanceProgress = Math.max(0, Math.min(1, italyDistance / Math.PI));
  const organicWave = (Math.sin(point.x * 4.1 + point.z * 3.3 + point.y * 2.2) + 1) / 2;
  const deterministicJitter = (
    Math.sin(candidateIndex * 12.9898 + point.x * 78.233 + point.z * 37.719)
    * 43758.5453
  ) % 1;
  const normalizedJitter = Math.abs(deterministicJitter) * REVEAL_DEFAULTS.deterministicJitter;
  const italyInfluence = Math.max(0, Math.min(1, 1 - italyDistance / 0.42));
  const revealTime = Math.max(
    0,
    Math.min(
      0.92,
      distanceProgress * 0.9 + normalizedJitter,
    ),
  );
  const revealDuration = REVEAL_DEFAULTS.revealWindowMin
    + (REVEAL_DEFAULTS.revealWindowMax - REVEAL_DEFAULTS.revealWindowMin)
      * (0.45 + organicWave * 0.55);
  const size = REVEAL_DEFAULTS.pointSizeMin
    + (REVEAL_DEFAULTS.pointSizeMax - REVEAL_DEFAULTS.pointSizeMin)
      * Math.max(italyInfluence, organicWave * 0.72);
  const intensity = REVEAL_DEFAULTS.intensityMin
    + (REVEAL_DEFAULTS.intensityMax - REVEAL_DEFAULTS.intensityMin)
      * Math.max(italyInfluence * 0.92, organicWave * 0.58);

  return {
    revealTime,
    revealDuration,
    size,
    intensity,
  };
}

function createPointBatch({
  startIndex,
  endIndex,
  totalPointBudget,
  radius,
}) {
  const positions = [];
  const colors = [];
  const revealTimes = [];
  const revealDurations = [];
  const sizes = [];
  const intensities = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let candidateIndex = startIndex; candidateIndex < endIndex; candidateIndex += 1) {
    const y = 1 - (candidateIndex / (totalPointBudget - 1)) * 2;
    const radial = Math.sqrt(1 - y * y);
    const theta = goldenAngle * candidateIndex;
    const x = Math.cos(theta) * radial;
    const z = Math.sin(theta) * radial;
    const longitude = normalizeLongitude((Math.atan2(-z, x) * 180) / Math.PI);
    const latitude = (Math.asin(y) * 180) / Math.PI;

    if (isLandPoint(longitude, latitude)) {
      positions.push(x * radius, y * radius, z * radius);

      const color = getWarmNeonColor({ x, y, z, longitude, latitude });
      colors.push(color[0], color[1], color[2]);

      const revealAttributes = createRevealAttributes({
        candidateIndex,
        totalPointBudget,
        latitude,
        longitude,
        point: { x, y, z },
      });
      revealTimes.push(revealAttributes.revealTime);
      revealDurations.push(revealAttributes.revealDuration);
      sizes.push(revealAttributes.size);
      intensities.push(revealAttributes.intensity);
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    revealTimes: new Float32Array(revealTimes),
    revealDurations: new Float32Array(revealDurations),
    sizes: new Float32Array(sizes),
    intensities: new Float32Array(intensities),
  };
}

self.onmessage = (event) => {
  const { type, payload } = event.data || {};

  if (type !== "start") {
    return;
  }

  const startedAt = performance.now();
  const {
    totalPointBudget,
    radius,
    batchCandidateBudget,
  } = payload;
  let candidateIndex = 0;
  let batchIndex = 0;

  self.postMessage({
    type: "ready",
    payload: {
      startupMs: Math.round((performance.now() - startedAt) * 10) / 10,
      totalPointBudget,
    },
  });

  while (candidateIndex < totalPointBudget) {
    const endIndex = Math.min(candidateIndex + batchCandidateBudget, totalPointBudget);
    const batchStartedAt = performance.now();
    const batch = createPointBatch({
      startIndex: candidateIndex,
      endIndex,
      totalPointBudget,
      radius,
    });

    self.postMessage(
      {
        type: "batch",
        payload: {
          batchIndex,
          startIndex: candidateIndex,
          endIndex,
          pointCount: batch.positions.length / 3,
          generationMs: Math.round((performance.now() - batchStartedAt) * 10) / 10,
          positions: batch.positions,
          colors: batch.colors,
          revealTimes: batch.revealTimes,
          revealDurations: batch.revealDurations,
          sizes: batch.sizes,
          intensities: batch.intensities,
        },
      },
      [
        batch.positions.buffer,
        batch.colors.buffer,
        batch.revealTimes.buffer,
        batch.revealDurations.buffer,
        batch.sizes.buffer,
        batch.intensities.buffer,
      ],
    );

    candidateIndex = endIndex;
    batchIndex += 1;
  }

  self.postMessage({
    type: "complete",
    payload: {
      totalMs: Math.round((performance.now() - startedAt) * 10) / 10,
      batchCount: batchIndex,
    },
  });
};

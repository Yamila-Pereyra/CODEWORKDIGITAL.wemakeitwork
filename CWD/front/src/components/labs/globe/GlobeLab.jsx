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
const BLOOM_STRENGTH = 0.46;
const BLOOM_RADIUS = 0.32;
const BLOOM_THRESHOLD = 0.24;
const GLOBE_DEBUG_TIMINGS = false;
const LAND_FEATURE = feature(landTopology, landTopology.objects.land);
const LAND_POLYGONS = prepareLandPolygons(LAND_FEATURE);
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

    const composer = useBloom ? new EffectComposer(renderer) : null;
    if (composer) {
      const renderPass = new RenderPass(scene, camera);
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(1, 1),
        BLOOM_STRENGTH,
        BLOOM_RADIUS,
        BLOOM_THRESHOLD,
      );
      composer.addPass(renderPass);
      composer.addPass(bloomPass);
    }
    mark("globe:renderer", rendererStart);

    const globeAxis = new THREE.Group();
    globeAxis.rotation.z = -EARTH_AXIAL_TILT;
    scene.add(globeAxis);

    const globeGroup = new THREE.Group();
    globeAxis.add(globeGroup);

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
  }, [candidatePointCount, debugTimings, pixelRatioCap, routeSegments, useBloom]);

  return (
    <Wrapper className={className}>
      <div className={stageClassName} ref={containerRef} aria-label={ariaLabel} />
    </Wrapper>
  );
}

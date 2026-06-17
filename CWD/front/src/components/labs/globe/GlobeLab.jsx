"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { feature } from "topojson-client";
import landTopology from "world-atlas/land-110m.json";
import "./globe-lab.css";

const GLOBE_RADIUS = 1.25;
const GLOBE_CANDIDATE_POINT_COUNT = 60000;
const EARTH_AXIAL_TILT = THREE.MathUtils.degToRad(23.4);
const LAND_FEATURE = feature(landTopology, landTopology.objects.land);
const LAND_POLYGONS = prepareLandPolygons(LAND_FEATURE);
const GLOBE_PALETTE = [
  new THREE.Color(0xff8a1c),
  new THREE.Color(0xff5a5f),
  new THREE.Color(0xff4fcf),
  new THREE.Color(0xa855f7),
  new THREE.Color(0x7c3cff),
  new THREE.Color(0xffd36a),
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

export default function GlobeLab() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    camera.position.set(0, 0, 4);

    const globeAxis = new THREE.Group();
    globeAxis.rotation.z = -EARTH_AXIAL_TILT;
    scene.add(globeAxis);

    const globeGroup = new THREE.Group();
    globeAxis.add(globeGroup);

    const globeData = createContinentalSphereData(
      GLOBE_CANDIDATE_POINT_COUNT,
      GLOBE_RADIUS,
    );
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

    let frameId;

    const resize = () => {
      const { clientWidth, clientHeight } = container;

      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);
    };

    const animate = () => {
      globeGroup.rotation.y += 0.0025;

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    resize();
    animate();
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
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <main className="globe-lab">
      <div className="globe-lab__stage" ref={containerRef} aria-label="Three.js globe lab" />
    </main>
  );
}

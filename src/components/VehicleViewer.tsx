"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { VehicleKey } from "@/lib/types";

interface Props {
  vehicle: VehicleKey;
}

type ModelSpec = {
  name: string;
  className: string;
  paint: string;
  accent: string;
  length: number;
  width: number;
  height: number;
  roof: string;
  nose: string;
  wheelRadius: number;
  wheelbase: number;
  rearDeck: number;
};

const MODEL_SPECS: Record<VehicleKey, ModelSpec> = {
  accord: {
    name: "2023 Honda Accord",
    className: "mid-size sedan",
    paint: "#6e8194",
    accent: "#29d3a2",
    length: 5.05,
    width: 2.05,
    height: 1.18,
    roof: "sedan",
    nose: "wide",
    wheelRadius: 0.43,
    wheelbase: 3.35,
    rearDeck: 0.52,
  },
  camry: {
    name: "2023 Toyota Camry",
    className: "angular sedan",
    paint: "#586f86",
    accent: "#63b3ff",
    length: 5.02,
    width: 2.06,
    height: 1.2,
    roof: "sedan",
    nose: "sharp",
    wheelRadius: 0.44,
    wheelbase: 3.28,
    rearDeck: 0.55,
  },
  bmw: {
    name: "2023 BMW 330i",
    className: "sport luxury sedan",
    paint: "#4c5f73",
    accent: "#d8e8ff",
    length: 4.82,
    width: 2.04,
    height: 1.08,
    roof: "sport",
    nose: "kidney",
    wheelRadius: 0.48,
    wheelbase: 3.18,
    rearDeck: 0.48,
  },
  tesla: {
    name: "2023 Tesla Model 3",
    className: "minimal EV fastback",
    paint: "#8a9bab",
    accent: "#29d3a2",
    length: 4.76,
    width: 2.03,
    height: 1.07,
    roof: "fastback",
    nose: "ev",
    wheelRadius: 0.46,
    wheelbase: 3.22,
    rearDeck: 0.38,
  },
  crv: {
    name: "2023 Honda CR-V",
    className: "compact SUV",
    paint: "#71869a",
    accent: "#ffc857",
    length: 4.78,
    width: 2.12,
    height: 1.62,
    roof: "suv",
    nose: "suv",
    wheelRadius: 0.5,
    wheelbase: 3.05,
    rearDeck: 0.65,
  },
};

function darkenHex(hex: string, factor: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  const r = Math.floor(((num >> 16) & 0xff) * factor);
  const g = Math.floor(((num >> 8) & 0xff) * factor);
  const b = Math.floor((num & 0xff) * factor);
  return `rgb(${r},${g},${b})`;
}

function softenEdge(value: number, limit: number, radius: number): number {
  if (Math.abs(value) < limit - radius) return value;
  return Math.sign(value) * (limit - radius + radius * 0.86);
}

function roundedBox(
  w: number, h: number, d: number, r: number,
  mat: THREE.Material,
): THREE.Mesh {
  const geo = new THREE.BoxGeometry(w, h, d, 3, 3, 3);
  const pos = geo.attributes["position"] as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      softenEdge(pos.getX(i), w / 2, r),
      softenEdge(pos.getY(i), h / 2, r),
      softenEdge(pos.getZ(i), d / 2, r),
    );
  }
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

function slopedPanel(
  pts: [number, number, number][],
  mat: THREE.Material,
): THREE.Mesh {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pts.flat(), 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

function trapezoidCabin(
  length: number, height: number, width: number, spec: ModelSpec,
  mat: THREE.Material,
): THREE.Mesh {
  const bottom = length / 2;
  const top =
    spec.roof === "fastback" ? length * 0.33
    : spec.roof === "suv"     ? length * 0.43
    : length * 0.36;
  const shape = new THREE.Shape([
    new THREE.Vector2(-bottom, 0),
    new THREE.Vector2(bottom, 0),
    new THREE.Vector2(top, height),
    new THREE.Vector2(-top * 0.92, height),
  ]);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: width, bevelEnabled: true,
    bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2,
  });
  geo.center();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

type Materials = {
  paint: THREE.MeshPhysicalMaterial;
  darkPaint: THREE.MeshPhysicalMaterial;
  glass: THREE.MeshPhysicalMaterial;
  tire: THREE.MeshStandardMaterial;
  rim: THREE.MeshStandardMaterial;
  light: THREE.MeshStandardMaterial;
  black: THREE.MeshStandardMaterial;
  tailLight: THREE.MeshStandardMaterial;
};

function makeMaterials(spec: ModelSpec): Materials {
  return {
    paint: new THREE.MeshPhysicalMaterial({
      color: spec.paint, metalness: 0.78, roughness: 0.26,
      clearcoat: 0.7, clearcoatRoughness: 0.18,
    }),
    darkPaint: new THREE.MeshPhysicalMaterial({
      color: darkenHex(spec.paint, 0.45), metalness: 0.72, roughness: 0.32, clearcoat: 0.5,
    }),
    glass: new THREE.MeshPhysicalMaterial({
      color: "#9ddfff", metalness: 0, roughness: 0.05,
      transmission: 0.12, transparent: true, opacity: 0.48,
    }),
    tire: new THREE.MeshStandardMaterial({ color: "#050608", metalness: 0.15, roughness: 0.72 }),
    rim:  new THREE.MeshStandardMaterial({ color: "#c4ced8", metalness: 0.95, roughness: 0.22 }),
    light: new THREE.MeshStandardMaterial({
      color: spec.accent, emissive: spec.accent, emissiveIntensity: 1.4, roughness: 0.2,
    }),
    black: new THREE.MeshStandardMaterial({ color: "#070b0f", metalness: 0.4, roughness: 0.38 }),
    tailLight: new THREE.MeshStandardMaterial({
      color: "#ff5b5b", emissive: "#ff2d2d", emissiveIntensity: 1.1,
    }),
  };
}

function buildCabin(spec: ModelSpec, bodyY: number, mats: Materials): THREE.Group {
  const g = new THREE.Group();
  const cLen    = spec.roof === "suv" ? spec.length * 0.52 : spec.length * 0.42;
  const cHeight = spec.roof === "suv" ? spec.height * 0.52 : spec.height * 0.46;
  const cWidth  = spec.width * 0.78;
  const xOff    = spec.roof === "fastback" ? 0.06 : spec.roof === "sport" ? -0.04 : 0;

  const roof = trapezoidCabin(cLen, cHeight, cWidth, spec, mats.glass);
  roof.position.set(xOff, bodyY + spec.height * 0.48, 0);
  roof.castShadow = true;
  g.add(roof);

  const ws = roundedBox(cLen * 0.34, cHeight * 0.74, 0.035, 0.04, mats.glass);
  ws.position.set(-cLen * 0.34 + xOff, bodyY + spec.height * 0.58, 0);
  ws.rotation.z = spec.roof === "suv" ? -0.28 : -0.46;
  ws.scale.z = cWidth * 0.96;
  g.add(ws);

  const sg = roundedBox(cLen * 0.5, cHeight * 0.48, 0.035, 0.04, mats.glass);
  sg.position.set(xOff + cLen * 0.06, bodyY + spec.height * 0.72, -cWidth * 0.52);
  g.add(sg);
  const sgR = sg.clone();
  sgR.position.z = cWidth * 0.52;
  g.add(sgR);

  return g;
}

function addFront(g: THREE.Group, spec: ModelSpec, bodyY: number, mats: Materials) {
  const fx = -spec.length / 2 - 0.04;
  const y  = bodyY + spec.height * 0.04;
  if (spec.nose === "kidney") {
    const left = roundedBox(0.05, spec.height * 0.28, spec.width * 0.16, 0.035, mats.black);
    left.position.set(fx, y, -spec.width * 0.1);
    g.add(left);
    const right = left.clone();
    right.position.z = spec.width * 0.1;
    g.add(right);
  } else if (spec.nose === "ev") {
    const smooth = roundedBox(0.035, spec.height * 0.12, spec.width * 0.56, 0.08, mats.paint);
    smooth.position.set(fx, y + spec.height * 0.05, 0);
    g.add(smooth);
  } else {
    const gh = spec.nose === "suv" ? spec.height * 0.34 : spec.height * 0.2;
    const grille = roundedBox(0.045, gh, spec.width * 0.62, 0.045, mats.black);
    grille.position.set(fx, y, 0);
    g.add(grille);
  }
}

function addLights(g: THREE.Group, spec: ModelSpec, bodyY: number, mats: Materials) {
  const fx = -spec.length / 2 - 0.08;
  const rx = spec.length / 2 + 0.02;
  const hy = bodyY + spec.height * 0.18;
  const z  = spec.width * 0.4;

  const hl = roundedBox(0.045, 0.075, spec.width * 0.22, 0.03, mats.light);
  hl.position.set(fx, hy, -z);
  g.add(hl);
  const hlR = hl.clone();
  hlR.position.z = z;
  g.add(hlR);

  const tl = roundedBox(0.04, 0.08, spec.width * 0.18, 0.025, mats.tailLight);
  tl.position.set(rx, hy, -z);
  g.add(tl);
  const tlR = tl.clone();
  tlR.position.z = z;
  g.add(tlR);
}

function addWheels(g: THREE.Group, spec: ModelSpec, mats: Materials) {
  const wx = spec.wheelbase / 2;
  const wz = spec.width * 0.55;
  const positions: [number, number, number][] = [
    [-wx, spec.wheelRadius, -wz],
    [ wx, spec.wheelRadius, -wz],
    [-wx, spec.wheelRadius,  wz],
    [ wx, spec.wheelRadius,  wz],
  ];

  positions.forEach(([x, y, pz]) => {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(spec.wheelRadius, spec.wheelRadius, 0.32, 48),
      mats.tire,
    );
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(spec.wheelRadius * 0.56, spec.wheelRadius * 0.56, 0.34, 32),
      mats.rim,
    );
    rim.rotation.z = Math.PI / 2;
    wheel.add(rim);

    for (let i = 0; i < 6; i++) {
      const spoke = roundedBox(spec.wheelRadius * 0.12, spec.wheelRadius * 0.68, 0.035, 0.012, mats.black);
      spoke.rotation.x = (Math.PI / 6) * i;
      wheel.add(spoke);
    }

    wheel.position.set(x, y, pz);
    g.add(wheel);
  });
}

function addDetails(g: THREE.Group, spec: ModelSpec, bodyY: number, mats: Materials) {
  const belt = roundedBox(spec.length * 0.72, 0.035, 0.035, 0.02, mats.black);
  belt.position.set(0.08, bodyY + spec.height * 0.26, -spec.width * 0.535);
  g.add(belt);
  const beltR = belt.clone();
  beltR.position.z = spec.width * 0.535;
  g.add(beltR);

  const mirL = roundedBox(0.12, 0.08, 0.18, 0.04, mats.darkPaint);
  mirL.position.set(-spec.length * 0.14, bodyY + spec.height * 0.58, -spec.width * 0.62);
  g.add(mirL);
  const mirR = mirL.clone();
  mirR.position.z = spec.width * 0.62;
  g.add(mirR);
}

function buildCar(spec: ModelSpec): THREE.Group {
  const mats = makeMaterials(spec);
  const group = new THREE.Group();
  const groundY = spec.wheelRadius;
  const bodyY   = groundY + spec.height * 0.34;
  const hL      = spec.length / 2;

  const body = roundedBox(spec.length, spec.height * 0.58, spec.width, 0.22, mats.paint);
  body.position.set(0, bodyY, 0);
  body.castShadow = true;
  group.add(body);

  const hood = slopedPanel([
    [-hL + 0.28, bodyY + spec.height * 0.22, -spec.width * 0.52],
    [-hL + 1.15, bodyY + spec.height * 0.36, -spec.width * 0.52],
    [-hL + 1.28, bodyY + spec.height * 0.36, spec.width * 0.52],
    [-hL + 0.36, bodyY + spec.height * 0.2,  spec.width * 0.52],
  ], mats.darkPaint);
  hood.castShadow = true;
  group.add(hood);

  const cabin = buildCabin(spec, bodyY, mats);
  group.add(cabin);

  const rearDeck = roundedBox(spec.rearDeck, spec.height * 0.2, spec.width * 0.94, 0.12, mats.darkPaint);
  rearDeck.position.set(hL - spec.rearDeck * 0.7, bodyY + spec.height * 0.2, 0);
  rearDeck.castShadow = true;
  group.add(rearDeck);

  addFront(group, spec, bodyY, mats);
  addLights(group, spec, bodyY, mats);
  addWheels(group, spec, mats);
  addDetails(group, spec, bodyY, mats);

  group.rotation.y = -0.52;
  return group;
}

function disposeGroup(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
  });
}

export default function VehicleViewer({ vehicle }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setVehicleRef = useRef<((v: VehicleKey) => void) | null>(null);

  useEffect(() => {
    const hostEl = containerRef.current;
    if (!hostEl) return;

    let frameId = 0;

    const scene    = new THREE.Scene();
    scene.background = null;

    const camera   = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(6.8, 3.2, 6.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    hostEl.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 5.8;
    controls.maxDistance = 10;
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.target.set(0, 0.65, 0);

    scene.add(new THREE.HemisphereLight("#d8ecff", "#111820", 2.4));
    const key = new THREE.DirectionalLight("#ffffff", 4);
    key.position.set(4, 7, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    scene.add(key);
    const rimLight = new THREE.DirectionalLight("#29d3a2", 2.2);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(5.8, 96),
      new THREE.MeshStandardMaterial({ color: "#101820", metalness: 0.25, roughness: 0.56, transparent: true, opacity: 0.92 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(10, 18, "#29d3a2", "#253241");
    (grid.material as THREE.Material & { transparent: boolean; opacity: number }).transparent = true;
    (grid.material as THREE.Material & { transparent: boolean; opacity: number }).opacity = 0.18;
    scene.add(grid);

    let carGroup = buildCar(MODEL_SPECS[vehicle]);
    scene.add(carGroup);

    setVehicleRef.current = (v: VehicleKey) => {
      scene.remove(carGroup);
      disposeGroup(carGroup);
      carGroup = buildCar(MODEL_SPECS[v]);
      scene.add(carGroup);
    };

    function resize() {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const { width, height } = hostEl!.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    }
    resize();
    window.addEventListener("resize", resize);

    function animate() {
      frameId = requestAnimationFrame(animate);
      carGroup.rotation.y += 0.0018;
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      if (renderer.domElement.parentNode === hostEl) {
        hostEl.removeChild(renderer.domElement);
      }
      setVehicleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setVehicleRef.current?.(vehicle);
  }, [vehicle]);

  return (
    <div
      ref={containerRef}
      className="vehicle-viewer"
      aria-label="3D vehicle model viewer"
    />
  );
}

import * as THREE from "https://esm.sh/three@0.164.1";
import { OrbitControls } from "https://esm.sh/three@0.164.1/examples/jsm/controls/OrbitControls.js";

const host = document.querySelector("#vehicleViewer");

const modelSpecs = {
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

let renderer;
let scene;
let camera;
let controls;
let carGroup;
let frameId;

const materials = {};

function init() {
  if (!host) return;

  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(6.8, 3.2, 6.5);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 5.8;
  controls.maxDistance = 10;
  controls.minPolarAngle = Math.PI * 0.22;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.target.set(0, 0.65, 0);

  buildStudio();
  setVehicleModel("accord");
  resize();
  animate();

  window.addEventListener("resize", resize);
}

function buildStudio() {
  scene.add(new THREE.HemisphereLight("#d8ecff", "#111820", 2.4));

  const key = new THREE.DirectionalLight("#ffffff", 4);
  key.position.set(4, 7, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  scene.add(key);

  const rim = new THREE.DirectionalLight("#29d3a2", 2.2);
  rim.position.set(-5, 3, -4);
  scene.add(rim);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5.8, 96),
    new THREE.MeshStandardMaterial({
      color: "#101820",
      metalness: 0.25,
      roughness: 0.56,
      transparent: true,
      opacity: 0.92,
    }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(10, 18, "#29d3a2", "#253241");
  grid.material.transparent = true;
  grid.material.opacity = 0.18;
  scene.add(grid);
}

function createMaterials(spec) {
  materials.paint = new THREE.MeshPhysicalMaterial({
    color: spec.paint,
    metalness: 0.78,
    roughness: 0.26,
    clearcoat: 0.7,
    clearcoatRoughness: 0.18,
  });

  materials.darkPaint = new THREE.MeshPhysicalMaterial({
    color: darken(spec.paint, 0.45),
    metalness: 0.72,
    roughness: 0.32,
    clearcoat: 0.5,
  });

  materials.glass = new THREE.MeshPhysicalMaterial({
    color: "#9ddfff",
    metalness: 0,
    roughness: 0.05,
    transmission: 0.12,
    transparent: true,
    opacity: 0.48,
  });

  materials.tire = new THREE.MeshStandardMaterial({
    color: "#050608",
    metalness: 0.15,
    roughness: 0.72,
  });

  materials.rim = new THREE.MeshStandardMaterial({
    color: "#c4ced8",
    metalness: 0.95,
    roughness: 0.22,
  });

  materials.light = new THREE.MeshStandardMaterial({
    color: spec.accent,
    emissive: spec.accent,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });

  materials.black = new THREE.MeshStandardMaterial({
    color: "#070b0f",
    metalness: 0.4,
    roughness: 0.38,
  });
}

function setVehicleModel(modelKey) {
  const spec = modelSpecs[modelKey] || modelSpecs.accord;
  createMaterials(spec);

  if (carGroup) {
    scene.remove(carGroup);
    disposeObject(carGroup);
  }

  carGroup = buildCar(spec);
  scene.add(carGroup);
}

function buildCar(spec) {
  const group = new THREE.Group();
  const groundY = spec.wheelRadius;
  const bodyY = groundY + spec.height * 0.34;
  const halfLength = spec.length / 2;

  const lowerBody = createRoundedBox(spec.length, spec.height * 0.58, spec.width, 0.22, materials.paint);
  lowerBody.position.set(0, bodyY, 0);
  lowerBody.scale.z = 1;
  lowerBody.castShadow = true;
  group.add(lowerBody);

  const hood = createSlopedPanel(
    [
      [-halfLength + 0.28, bodyY + spec.height * 0.22, -spec.width * 0.52],
      [-halfLength + 1.15, bodyY + spec.height * 0.36, -spec.width * 0.52],
      [-halfLength + 1.28, bodyY + spec.height * 0.36, spec.width * 0.52],
      [-halfLength + 0.36, bodyY + spec.height * 0.2, spec.width * 0.52],
    ],
    materials.darkPaint,
  );
  hood.castShadow = true;
  group.add(hood);

  const cabin = buildCabin(spec, bodyY);
  group.add(cabin);

  const rearDeck = createRoundedBox(spec.rearDeck, spec.height * 0.2, spec.width * 0.94, 0.12, materials.darkPaint);
  rearDeck.position.set(halfLength - spec.rearDeck * 0.7, bodyY + spec.height * 0.2, 0);
  rearDeck.castShadow = true;
  group.add(rearDeck);

  addFrontTreatment(group, spec, bodyY);
  addLighting(group, spec, bodyY);
  addWheels(group, spec);
  addDetails(group, spec, bodyY);

  group.rotation.y = -0.52;
  return group;
}

function buildCabin(spec, bodyY) {
  const group = new THREE.Group();
  const cabinLength = spec.roof === "suv" ? spec.length * 0.52 : spec.length * 0.42;
  const cabinHeight = spec.roof === "suv" ? spec.height * 0.52 : spec.height * 0.46;
  const cabinWidth = spec.width * 0.78;
  const xOffset = spec.roof === "fastback" ? 0.06 : spec.roof === "sport" ? -0.04 : 0;

  const roof = createTrapezoidCabin(cabinLength, cabinHeight, cabinWidth, spec);
  roof.position.set(xOffset, bodyY + spec.height * 0.48, 0);
  roof.castShadow = true;
  group.add(roof);

  const windshield = createGlassPanel(cabinLength * 0.34, cabinHeight * 0.74, cabinWidth * 0.96);
  windshield.position.set(-cabinLength * 0.34 + xOffset, bodyY + spec.height * 0.58, 0);
  windshield.rotation.z = spec.roof === "suv" ? -0.28 : -0.46;
  group.add(windshield);

  const sideGlass = createRoundedBox(cabinLength * 0.5, cabinHeight * 0.48, 0.035, 0.04, materials.glass);
  sideGlass.position.set(xOffset + cabinLength * 0.06, bodyY + spec.height * 0.72, -cabinWidth * 0.52);
  group.add(sideGlass);

  const farGlass = sideGlass.clone();
  farGlass.position.z = cabinWidth * 0.52;
  group.add(farGlass);

  return group;
}

function createTrapezoidCabin(length, height, width, spec) {
  const bottom = length / 2;
  const top = spec.roof === "fastback" ? length * 0.33 : spec.roof === "suv" ? length * 0.43 : length * 0.36;
  const yTop = height;
  const points = [
    new THREE.Vector2(-bottom, 0),
    new THREE.Vector2(bottom, 0),
    new THREE.Vector2(top, yTop),
    new THREE.Vector2(-top * 0.92, yTop),
  ];

  const shape = new THREE.Shape(points);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: width,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: 2,
  });
  geometry.center();

  const mesh = new THREE.Mesh(geometry, materials.glass);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function createGlassPanel(width, height, depth) {
  const panel = createRoundedBox(width, height, 0.035, 0.04, materials.glass);
  panel.rotation.y = Math.PI / 2;
  panel.scale.z = depth;
  return panel;
}

function addFrontTreatment(group, spec, bodyY) {
  const frontX = -spec.length / 2 - 0.04;
  const y = bodyY + spec.height * 0.04;

  if (spec.nose === "kidney") {
    const left = createRoundedBox(0.05, spec.height * 0.28, spec.width * 0.16, 0.035, materials.black);
    left.position.set(frontX, y, -spec.width * 0.1);
    group.add(left);
    const right = left.clone();
    right.position.z = spec.width * 0.1;
    group.add(right);
  } else if (spec.nose === "ev") {
    const smooth = createRoundedBox(0.035, spec.height * 0.12, spec.width * 0.56, 0.08, materials.paint);
    smooth.position.set(frontX, y + spec.height * 0.05, 0);
    group.add(smooth);
  } else {
    const grilleHeight = spec.nose === "suv" ? spec.height * 0.34 : spec.height * 0.2;
    const grille = createRoundedBox(0.045, grilleHeight, spec.width * 0.62, 0.045, materials.black);
    grille.position.set(frontX, y, 0);
    group.add(grille);
  }
}

function addLighting(group, spec, bodyY) {
  const frontX = -spec.length / 2 - 0.08;
  const rearX = spec.length / 2 + 0.02;
  const headY = bodyY + spec.height * 0.18;
  const z = spec.width * 0.4;

  const headLeft = createRoundedBox(0.045, 0.075, spec.width * 0.22, 0.03, materials.light);
  headLeft.position.set(frontX, headY, -z);
  group.add(headLeft);

  const headRight = headLeft.clone();
  headRight.position.z = z;
  group.add(headRight);

  const tailMat = new THREE.MeshStandardMaterial({
    color: "#ff5b5b",
    emissive: "#ff2d2d",
    emissiveIntensity: 1.1,
  });
  const tailLeft = createRoundedBox(0.04, 0.08, spec.width * 0.18, 0.025, tailMat);
  tailLeft.position.set(rearX, headY, -z);
  group.add(tailLeft);

  const tailRight = tailLeft.clone();
  tailRight.position.z = z;
  group.add(tailRight);
}

function addWheels(group, spec) {
  const wheelX = spec.wheelbase / 2;
  const z = spec.width * 0.55;
  const positions = [
    [-wheelX, spec.wheelRadius, -z],
    [wheelX, spec.wheelRadius, -z],
    [-wheelX, spec.wheelRadius, z],
    [wheelX, spec.wheelRadius, z],
  ];

  positions.forEach(([x, y, wheelZ]) => {
    const wheel = new THREE.Group();
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(spec.wheelRadius, spec.wheelRadius, 0.32, 48),
      materials.tire,
    );
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);

    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(spec.wheelRadius * 0.56, spec.wheelRadius * 0.56, 0.34, 32),
      materials.rim,
    );
    rim.rotation.z = Math.PI / 2;
    wheel.add(rim);

    for (let i = 0; i < 6; i += 1) {
      const spoke = createRoundedBox(spec.wheelRadius * 0.12, spec.wheelRadius * 0.68, 0.035, 0.012, materials.black);
      spoke.rotation.x = (Math.PI / 6) * i;
      wheel.add(spoke);
    }

    wheel.position.set(x, y, wheelZ);
    group.add(wheel);
  });
}

function addDetails(group, spec, bodyY) {
  const belt = createRoundedBox(spec.length * 0.72, 0.035, 0.035, 0.02, materials.black);
  belt.position.set(0.08, bodyY + spec.height * 0.26, -spec.width * 0.535);
  group.add(belt);

  const farBelt = belt.clone();
  farBelt.position.z = spec.width * 0.535;
  group.add(farBelt);

  const mirrorLeft = createRoundedBox(0.12, 0.08, 0.18, 0.04, materials.darkPaint);
  mirrorLeft.position.set(-spec.length * 0.14, bodyY + spec.height * 0.58, -spec.width * 0.62);
  group.add(mirrorLeft);

  const mirrorRight = mirrorLeft.clone();
  mirrorRight.position.z = spec.width * 0.62;
  group.add(mirrorRight);
}

function createRoundedBox(width, height, depth, radius, material) {
  const geometry = new THREE.BoxGeometry(width, height, depth, 3, 3, 3);
  const position = geometry.attributes.position;

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    position.setXYZ(
      i,
      softenEdge(x, width / 2, radius),
      softenEdge(y, height / 2, radius),
      softenEdge(z, depth / 2, radius),
    );
  }

  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function createSlopedPanel(points, material) {
  const geometry = new THREE.BufferGeometry();
  const vertices = points.flat();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function softenEdge(value, limit, radius) {
  if (Math.abs(value) < limit - radius) return value;
  return Math.sign(value) * (limit - radius + radius * 0.86);
}

function resize() {
  const { width, height } = host.getBoundingClientRect();
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function animate() {
  frameId = requestAnimationFrame(animate);
  if (carGroup) {
    carGroup.rotation.y += 0.0018;
  }
  controls.update();
  renderer.render(scene, camera);
}

function disposeObject(object) {
  object.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
  });
}

function darken(hex, factor) {
  const color = hex.replace("#", "");
  const num = Number.parseInt(color, 16);
  const r = Math.floor((num >> 16) * factor);
  const g = Math.floor(((num >> 8) & 0xff) * factor);
  const b = Math.floor((num & 0xff) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

window.FairDriveCarViewer = {
  setVehicleModel,
};

init();

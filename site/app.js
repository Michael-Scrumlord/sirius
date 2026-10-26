import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { BODIES, LINKS } from "./data.js";

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const canvas = document.getElementById("sky");
const panel = document.getElementById("panel");
const tip = document.getElementById("tip");

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
} catch {
  document.getElementById("about").hidden = false;  // no WebGL: the text still explains everything
  throw new Error("WebGL unavailable");
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x03050c, 0.0035);
const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 2000);
const OVERVIEW = { pos: new THREE.Vector3(4, 22, 70), target: new THREE.Vector3(0, 0, -12) };
camera.position.copy(OVERVIEW.pos);
const controls = new OrbitControls(camera, canvas);
controls.target.copy(OVERVIEW.target);
controls.enableDamping = true;
controls.minDistance = 4;
controls.maxDistance = 180;
controls.autoRotate = !reduced;
controls.autoRotateSpeed = 0.25;
scene.add(new THREE.AmbientLight(0x6070a0, 0.6));

// ---- background: stars and a faint band ----
function starfield(count, rMin, rMax, size, opacity) {
  const pos = new Float32Array(count * 3), col = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(rMin + Math.random() * (rMax - rMin));
    v.y *= 0.6 + 0.4 * Math.random();
    pos.set([v.x, v.y, v.z], i * 3);
    c.setHSL(0.58 + Math.random() * 0.1, 0.4, 0.75 + Math.random() * 0.25);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ size, vertexColors: true, transparent: true, opacity,
    sizeAttenuation: true, depthWrite: false, fog: false }));
}
scene.add(starfield(5000, 400, 900, 1.6, 0.9), starfield(1500, 150, 400, 0.9, 0.6));

function glowTexture(color, soft = 0.35) {
  const s = 256, cv = Object.assign(document.createElement("canvas"), { width: s, height: s });
  const ctx = cv.getContext("2d"), g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(soft * 0.4, color);
  g.addColorStop(soft, color + "55");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(cv);
}
function sprite(tex, scale, opacity) {
  const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false }));
  m.scale.setScalar(scale);
  return m;
}

// ---- the three stars and their planets ----
const pickables = [], movers = [], stars = {};
for (const [key, b] of Object.entries(BODIES)) {
  const sys = new THREE.Group();
  sys.position.fromArray(b.position);
  sys.rotation.set((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.4);
  scene.add(sys);

  const core = new THREE.Mesh(new THREE.SphereGeometry(b.radius, 48, 32), new THREE.MeshBasicMaterial({ color: b.color }));
  core.userData = { kind: "star", key };
  pickables.push(core);
  sys.add(core, sprite(glowTexture(b.glow), b.radius * 7, 0.9), sprite(glowTexture(b.glow, 0.6), b.radius * 18, 0.25));
  sys.add(new THREE.PointLight(b.color, 120, 0, 1.6));

  b.groups.forEach((grp, i) => {
    const r = b.radius * 2.4 + i * (b.radius * 0.55 + 0.9);
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: 128 }, (_, k) => new THREE.Vector3(Math.cos(k / 128 * Math.PI * 2) * r, 0, Math.sin(k / 128 * Math.PI * 2) * r))),
      new THREE.LineBasicMaterial({ color: 0x9cc4ff, transparent: true, opacity: 0.12 }));
    sys.add(ring);
    const planet = new THREE.Mesh(new THREE.SphereGeometry(0.22 + 0.06 * grp.items.length, 24, 16),
      new THREE.MeshStandardMaterial({ color: grp.color, emissive: grp.color, emissiveIntensity: 0.35, roughness: 0.7 }));
    planet.userData = { kind: "planet", key, group: i, r, angle: Math.random() * Math.PI * 2, speed: 0.35 / Math.sqrt(r) };
    planet.add(sprite(glowTexture("#" + grp.color.toString(16).padStart(6, "0")), 1.6 + 0.2 * grp.items.length, 0.35));
    sys.add(planet);
    pickables.push(planet);
    movers.push(planet);
  });
  stars[key] = { body: b, sys, reach: b.radius * 2.4 + b.groups.length * (b.radius * 0.55 + 0.9) };
}

// constellation lines: what flows between the machines
for (const [a, c] of LINKS) {
  const g = new THREE.BufferGeometry().setFromPoints([stars[a].sys.position, stars[c].sys.position]);
  const line = new THREE.Line(g, new THREE.LineDashedMaterial({ color: 0x9cc4ff, dashSize: 0.8, gapSize: 0.8, transparent: true, opacity: 0.28 }));
  line.computeLineDistances();
  scene.add(line);
}

// ---- panel ----
const hex = (n) => "#" + n.toString(16).padStart(6, "0");
function showOverview() {
  panel.innerHTML = `<h2>Three stars</h2><p class="exp">One server and two companions</p>
    <p class="tag">Each star is a machine; its planets are groups of services.</p>
    <p class="about">Sirius holds the apps, the files and the agents' workplace. Vega is the house's voice. Rigel
    takes the voice work and has room to grow. Click a star, or use the buttons, to fly there.</p>
    ${Object.entries(BODIES).map(([k, b]) => `<div class="group"><h3><i style="color:${b.glow};background:${b.glow}"></i>${b.name}</h3>
      <ul><li><span>${b.tagline}</span></li></ul><button data-go="${k}">Visit ${b.name}</button></div>`).join("")}
    <div class="links">Between them: ${LINKS.map(([a, c, w]) => `${BODIES[a].name} ↔ ${BODIES[c].name}: ${w}`).join("; ")}.</div>`;
}
function showBody(key, lit = -1) {
  const b = BODIES[key];
  panel.innerHTML = `<h2>${b.name}</h2><p class="exp">${b.expansion}</p><p class="tag">${b.tagline}</p><p class="about">${b.about}</p>
    ${b.groups.map((g, i) => `<div class="group${i === lit ? " lit" : ""}" id="g-${key}-${i}"><h3><i style="color:${hex(g.color)};background:${hex(g.color)}"></i>${g.title}</h3>
      <ul>${g.items.map(([n, w]) => `<li><b>${n}</b> <span>${w}</span></li>`).join("")}</ul></div>`).join("")}`;
  if (lit >= 0) document.getElementById(`g-${key}-${lit}`)?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
}

// ---- flying ----
let flight = null;
function fly(to, target) {
  if (reduced) { camera.position.copy(to); controls.target.copy(target); return; }
  flight = { start: performance.now(), fromPos: camera.position.clone(), fromTarget: controls.target.clone(), to, target };
}
// Keep what you look at clear of the panel: shift the view left of it on wide screens, above it on phones.
function frame() {
  const w = innerWidth, h = innerHeight, r = panel.getBoundingClientRect();
  if (w > 760) camera.setViewOffset(w, h, Math.round(r.width / 2), 0, w, h);
  else camera.setViewOffset(w, h, 0, Math.round(Math.min(h - r.top, h * 0.5) / 2), w, h);
}
let current = "overview";
function go(key, lit = -1) {
  current = key;
  document.querySelectorAll("nav button[data-go]").forEach((btn) => btn.classList.toggle("on", btn.dataset.go === key));
  if (key === "overview") {
    showOverview();
    fly(OVERVIEW.pos.clone(), OVERVIEW.target.clone());
    controls.autoRotate = !reduced;
    return;
  }
  const s = stars[key], center = s.sys.position.clone();
  const dir = camera.position.clone().sub(center).setY(0).normalize();
  if (!isFinite(dir.x)) dir.set(0, 0, 1);
  const dist = s.reach * 2.3 + 4;
  fly(center.clone().add(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, dist * 0.38, 0)), center);
  controls.autoRotate = false;
  showBody(key, lit);
}
document.addEventListener("click", (e) => {
  const goBtn = e.target.closest("[data-go]");
  if (goBtn) return go(goBtn.dataset.go);
  const open = e.target.closest("[data-open]");
  if (open) { e.preventDefault(); document.getElementById(open.dataset.open).hidden = false; return; }
  const close = e.target.closest("[data-close]");
  if (close) document.getElementById(close.dataset.close).hidden = true;
});
addEventListener("keydown", (e) => { if (e.key === "Escape") document.getElementById("about").hidden = true; });

// ---- pointer: hover tooltips, click to visit ----
const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
let hovered = null, downAt = null;
function pick(e) {
  ptr.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(ptr, camera);
  return ray.intersectObjects(pickables, false)[0]?.object || null;
}
canvas.addEventListener("pointermove", (e) => {
  hovered = pick(e);
  canvas.style.cursor = hovered ? "pointer" : "grab";
  if (!hovered) { tip.hidden = true; return; }
  const u = hovered.userData, b = BODIES[u.key];
  tip.innerHTML = u.kind === "star" ? `<b>${b.name}</b>${b.tagline}`
    : `<b>${b.groups[u.group].title} · ${b.name}</b>${b.groups[u.group].items.map(([n]) => n).join(", ")}`;
  tip.style.left = e.clientX + "px";
  tip.style.top = e.clientY + "px";
  tip.hidden = false;
});
canvas.addEventListener("pointerdown", (e) => { downAt = [e.clientX, e.clientY]; });
canvas.addEventListener("pointerup", (e) => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;  // a drag, not a click
  const hit = pick(e);
  if (hit) go(hit.userData.key, hit.userData.kind === "planet" ? hit.userData.group : -1);
});
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  renderer.setSize(innerWidth, innerHeight);
  frame();
});

// ---- loop ----
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), 0.05);
  for (const p of movers) {
    const u = p.userData;
    u.angle += u.speed * dt * (reduced ? 0.2 : 1);
    p.position.set(Math.cos(u.angle) * u.r, Math.sin(u.angle * 2) * 0.15, Math.sin(u.angle) * u.r);
  }
  if (flight) {
    const t = Math.min(1, (performance.now() - flight.start) / 1400);
    const k = ease(t);
    camera.position.lerpVectors(flight.fromPos, flight.to, k);
    controls.target.lerpVectors(flight.fromTarget, flight.target, k);
    if (t === 1) flight = null;
  }
  controls.update();
  renderer.render(scene, camera);
});
go("overview");
frame();

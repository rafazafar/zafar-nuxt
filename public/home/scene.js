// Renders the city block behind the homepage and drives it from the scroll position:
// it draws itself on load, flies to each project, turns see-through for the x-ray chapter,
// warms up for the people chapter and ends as a plan drawing.
import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { buildBlock, stages, crane, traffic, lot, billboard, lift, ambulance, rnd } from './block.js'

const root = document.documentElement
const canvas = document.getElementById('block')
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const darkMq = matchMedia('(prefers-color-scheme: dark)')
const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : darkMq.matches

const col = h => new THREE.Color(h)
const V = (x, y, z) => new THREE.Vector3(x, y, z)
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = k => k * k * (3 - 2 * k)
const easeOut = k => 1 - Math.pow(1 - k, 3)
const mix = (a, b, t) => a + (b - a) * t

const PAL = {
  bgDay: col('#f3f5f1'), bgNight: col('#121827'), bgDusk: col('#f7ecdc'), bgDuskNight: col('#1c1826'), bgX: col('#0a111d'),
  inkDay: col('#2c4a86'), inkNight: col('#8fb4ff'), softDay: col('#5b6480'), softNight: col('#7f8fb8'),
  teal: col('#63e0dc'), xdark: col('#0c2630'), red: col('#ff6b62'), amber: col('#ffb347'),
  sunDay: col('#ffffff'), sunNight: col('#9fb2ff'), sunDusk: col('#ffc48a'), white: col('#ffffff')
}

// camera stops, keyed by each section's data-cam
const CAM = {
  hero: [[50, 42, 65], [1, 6, 0]],
  nexco: [[32, 11, -3], [13, 5, -11.5]],
  axa: [[6, 14, 22], [-11, 10, -5]],
  site: [[13, 13, 14], [-.5, 8, -5]],
  seekers: [[27, 13, 15], [8.8, 7.5, -5]],
  kokoromil: [[1, 9.5, 28], [-12, 2.6, 9.5]],
  cars: [[16, 8, 25], [4, 1, 10]],
  xray: [[42, 20, 64], [0, 4.5, 0]],
  people: [[24, 7, 30], [1, 2, 2]],
  people2: [[17, 4.5, 9], [8.5, 1.6, -1.5]],
  people3: [[-3, 5.5, 25], [-12, 1.2, 12.5]],
  people4: [[22, 4, 8], [2, 1.6, 1]],
  people5: [[32, 15, 38], [0, 3, 0]],
  plan: [[0, 96, 2], [0, 0, 1.5]]
}
const TAGS = [
  ['nexco', 'Highway AI', [12, 8, -11.5]],
  ['axa', 'COBOL to serverless', [-13.9, 13.6, -2.1]],
  ['site', 'Drawing-check AI', [-1.5, 14.6, -5]],
  ['seekers', 'AI recruitment', [10.1, 14.6, -2.4]],
  ['kokoromil', 'Medical wearables', [-13, 5.4, 9]],
  ['cars', 'Used-car market data', [3.5, 3.6, 11]]
]
// callouts that appear once the camera has closed in on a project
const NOTES = [
  ['nexco', 'Forecast: slowing ahead', [9, 7.2, -11.5]],
  ['nexco', 'Roadside sensor feed', [15.5, 6.6, -9.4]],
  ['axa', 'Jobs that run on demand', [-9.2, 12.6, -2.2]],
  ['axa', 'Legacy core, retired floor by floor', [-12.6, 5.2, -2.2]],
  ['site', 'Flagged on the drawing', [-.3, 9.9, -2]],
  ['site', 'Correction issued', [1.9, 7.1, -3.4]],
  ['seekers', 'Job ad, written by AI', [10.1, 13.6, -2.4]],
  ['seekers', 'Candidate matched', [7.2, 6.2, -2]],
  ['kokoromil', 'Local-first ECG, live', [-12.2, 5.9, 11.9]],
  ['cars', 'Price history per listing', [2.5, 4, 10]]
]
const KEYS = ['nexco', 'axa', 'site', 'seekers', 'kokoromil', 'cars']
const OPEN = { axa: .42, seekers: .4 }
const WARM = new THREE.Color('#ffd08a')
const NARROW = { xray: .58 }

function start () {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.LinearToneMapping
  const scene = new THREE.Scene()
  scene.background = PAL.bgDay.clone()
  scene.fog = new THREE.Fog(scene.background, 95, 210)
  const camera = new THREE.PerspectiveCamera(30, 1, 1, 900)

  const hemi = new THREE.HemisphereLight('#ffffff', '#d8d6cc', 1.05)
  const sun = new THREE.DirectionalLight('#ffffff', 2.3)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -32, right: 32, top: 32, bottom: -32, near: 1, far: 140 })
  sun.shadow.bias = -.0004
  sun.shadow.normalBias = .03
  scene.add(hemi, sun)

  // the table the model sits on: a shadow catcher, a drafting grid and a title block
  const shadowMat = new THREE.ShadowMaterial({ opacity: .2, depthWrite: false })
  const table = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), shadowMat)
  table.rotation.x = -Math.PI / 2
  table.position.y = -1
  table.receiveShadow = true
  scene.add(table)
  const grids = [[200, 200, .06], [200, 40, .15]].map(([s, d, o]) => {
    const g = new THREE.GridHelper(s, d)
    Object.assign(g.material, { transparent: true, opacity: o, depthWrite: false, vertexColors: false })
    g.userData.o = o
    g.position.y = -.996
    scene.add(g)
    return g
  })
  const tb = Object.assign(document.createElement('canvas'), { width: 1024, height: 384 }), tg = tb.getContext('2d')
  tg.strokeStyle = tg.fillStyle = '#fff'
  tg.lineWidth = 4
  tg.strokeRect(4, 4, 1016, 376)
  for (const [x1, y1, x2, y2] of [[4, 128, 1020, 128], [4, 256, 1020, 256], [512, 128, 512, 380], [768, 256, 768, 380]]) {
    tg.beginPath()
    tg.moveTo(x1, y1)
    tg.lineTo(x2, y2)
    tg.stroke()
  }
  const text = (s, x, y, f) => {
    tg.font = f
    tg.fillText(s, x, y)
  }
  const mono = '"JetBrains Mono", ui-monospace, monospace'
  text('ZAFAR.DEV', 28, 92, `600 72px ${mono}`)
  text('SHEET 01', 760, 84, `400 40px ${mono}`)
  text('CITY BLOCK · SELECTED WORK', 28, 208, `400 30px ${mono}`)
  text('DRAWN  A. ZAFAR', 540, 208, `400 30px ${mono}`)
  text('TOKYO · 35.68 N 139.69 E', 28, 334, `400 28px ${mono}`)
  text('1 : 300', 540, 334, `400 30px ${mono}`)
  text('REV 09', 796, 334, `400 30px ${mono}`)
  const tbTex = new THREE.CanvasTexture(tb)
  tbTex.anisotropy = 8
  const titleMat = new THREE.MeshBasicMaterial({ alphaMap: tbTex, transparent: true, depthWrite: false, opacity: .8 })
  const title = new THREE.Mesh(new THREE.PlaneGeometry(13, 4.875), titleMat)
  title.rotation.x = -Math.PI / 2
  title.position.set(11.5, -.99, 20.5)
  scene.add(title)

  const mat4 = new THREE.Matrix4(), quat = new THREE.Quaternion(), scl = V(1, 1, 1), tmp = V()
  buildBlock(scene)
  for (const c of traffic) if (c.fast) c.s.key = 'nexco'

  // people: one instanced mesh, coloured only once the block is about people
  const body = mergeGeometries([new THREE.CapsuleGeometry(.11, .34, 3, 8).translate(0, .28, 0), new THREE.SphereGeometry(.1, 10, 8).translate(0, .68, 0)])
  const tones = ['#e58f76', '#5d8fd6', '#f0c75e', '#7fbf9a', '#b9a5c9', '#d9534a', '#3f4a5a', '#f4ede3']
  const walkers = []
  const lane = (axis, fixed, a, b, y, n) => {
    for (let i = 0; i < n; i++) walkers.push({ axis, fixed: fixed + (rnd() - .5) * .3, a, b, y, p: mix(a, b, rnd()), v: (.45 + rnd() * .55) * (rnd() > .5 ? 1 : -1), c: col(tones[walkers.length % tones.length]) })
  }
  lane('x', -.45, -19.5, 12.9, .12, 8)
  lane('x', 4.3, -19.5, 12.9, .12, 7)
  lane('z', 12.7, 5.2, 14.6, .12, 3)
  lane('z', 17.3, -8.6, -1.2, .12, 2)
  for (const [x, z, y] of [[1.1, 4.45, .12], [1.9, 4.4, .12], [-7.5, 9.2, .1], [9.6, 9.5, .06], [10.1, 9.8, .06], [-11.2, 13.2, .1]]) walkers.push({ still: true, x, z, y, c: col(tones[walkers.length % tones.length]) })
  const peopleMat = new THREE.MeshStandardMaterial({ roughness: .8, transparent: true, opacity: 0 })
  const people = new THREE.InstancedMesh(body, peopleMat, walkers.length)
  people.castShadow = true
  people.frustumCulled = false
  scene.add(people)
  const grey = col('#aeb6bf'), tmpC = col(0)
  let peopleTone = -1

  // the cast: people with a job to do at each project
  const actors = []
  const walk = (pts, o = {}) => {
    const len = [0]
    for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + V(...pts[i]).distanceTo(V(...pts[i - 1])))
    actors.push({ pts: pts.map(q => V(...q)), len, u: rnd() * 2, v: o.v || .5, c: o.c || tones[actors.length % tones.length], fade: o.fade, s: o.s || 1, pos: V() })
    return actors[actors.length - 1]
  }
  const HIVIS = ['#f08a24', '#f0c75e', '#f08a24', '#e9e9e4']
  // site crew on the open floors, two of them fixing what the drawing check flagged
  walk([[-4.4, 7.8, -2.9], [1.2, 7.8, -2.9]], { c: HIVIS[0], v: .55 })
  walk([[-4.3, 10.4, -3.3], [1.3, 10.4, -3.3]], { c: HIVIS[1], v: .45 })
  walk([[-4.2, 11.7, -3.6], [1, 11.7, -6.6]], { c: HIVIS[2], v: .5 })
  walk([[2.42, 9.1, -7.6], [2.42, 9.1, -2.4]], { c: HIVIS[3], v: .4 })
  const fixers = [[-.5, 9.1, -2.55], [1.6, 6.5, -2.6], [-2.6, 11.7, -2.6]]
  fixers.forEach((q, i) => actors.push({ fix: true, pos: V(...q), c: HIVIS[i % 4], s: 1 }))
  // candidates in and out of Seekers, and two riding the lift
  for (const sx of [5.6, 7, 9.4, 10.8, 11.6]) walk([[sx, .12, -.45], [8.5, .12, -1], [8.5, .12, -2.35]], { fade: true, v: .55 + rnd() * .3 })
  for (const dx of [-.2, .2]) actors.push({ ride: true, dx, c: tones[actors.length % tones.length], s: .95, pos: V() })
  // patients in the clinic garden wearing their monitors, and one heading in
  const elders = [
    walk([[-18.6, .1, 14.4], [-8.4, .1, 14.4]], { c: '#b9a5c9', v: .16, s: .9 }),
    walk([[-17.5, .1, 13.6], [-9.2, .1, 13.6]], { c: '#f4ede3', v: .13, s: .88 }),
    walk([[-15, .1, 14], [-10, .1, 14.5]], { c: '#9cc3b1', v: .11, s: .9 }),
    walk([[-6.7, .1, 12.6], [-6.9, .1, 9.6], [-8.05, .1, 9.6]], { c: '#d9b38c', v: .28, s: .9, fade: true })
  ]
  const cast = new THREE.InstancedMesh(body, peopleMat, actors.length)
  cast.frustumCulled = false
  cast.castShadow = true
  actors.forEach((a, i) => cast.setColorAt(i, tmpC.set(a.c)))
  scene.add(cast)
  // things that only read while the block is solid: monitor lights, welding sparks, the ambulance beacon
  const liveMats = []
  const live = m => {
    m.transparent = true
    m.depthWrite = false
    liveMats.push(m)
    return m
  }
  const dots = (n, color, size) => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3))
    const pts = new THREE.Points(g, live(new THREE.PointsMaterial({ color, size })))
    pts.frustumCulled = false
    scene.add(pts)
    return pts
  }
  const holters = dots(elders.length, '#ff5a4d', .2)
  const sparks = dots(fixers.length * 4, '#ffb347', .13)
  const beacon = new THREE.Mesh(new THREE.BoxGeometry(.5, .12, .28), live(new THREE.MeshBasicMaterial({ color: '#ff3b30' })))
  beacon.position.set(-.2, 1.08, 0)
  ambulance.s.root.add(beacon)
  const AMB = [V(-21, 0, 3), V(-6.1, 0, 3), V(-6.1, 0, 9.9)]

  // x-ray layer
  const xg = new THREE.Group()
  scene.add(xg)
  const xmats = []
  const xmat = (m, o = 1, keys = [], tint = true) => {
    m.transparent = true
    m.opacity = 0
    m.depthWrite = false
    m.userData.o = o
    m.userData.k = keys
    m.userData.c = tint && m.color.clone()
    xmats.push(m)
    return m
  }
  const xline = (v, o = 1, keys = []) => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
    const l = new THREE.LineSegments(g, xmat(new THREE.LineBasicMaterial({ color: PAL.teal }), o, keys))
    xg.add(l)
    return l
  }
  const rect = (v, x, y, z, w, d) => {
    const a = w / 2, b = d / 2
    v.push(x - a, y, z - b, x + a, y, z - b, x + a, y, z - b, x + a, y, z + b, x + a, y, z + b, x - a, y, z + b, x - a, y, z + b, x - a, y, z - b)
  }
  const cage = (v, x, y0, y1, z, w, d) => {
    rect(v, x, y0, z, w, d)
    rect(v, x, y1, z, w, d)
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) v.push(x + a * w / 2, y0, z + b * d / 2, x + a * w / 2, y1, z + b * d / 2)
  }
  const plates = [], plates2 = []
  for (let i = 0; i < 10; i++) rect(plates, -11, 3 + i * .98, -5, 5.6, 5.6)
  for (let i = 0; i < 4; i++) rect(plates, -11, 13.3 + i, -5, 4.3, 4.3)
  for (let i = 0; i < 6; i++) rect(plates2, 8.5, 2.2 + i * 1.15, -5, 6.8, 5.8)
  for (let i = 0; i < 2; i++) rect(plates2, 10.1, 9.3 + i * 1.2, -5, 5.2, 6.4)
  xline(plates, .3, ['axa'])
  xline(plates2, .3, ['seekers'])
  // the mainframe room under AXA
  const base = []
  cage(base, -11, -3.6, -.2, -5, 7.2, 6.8)
  for (let i = 0; i < 5; i++) cage(base, -13.4 + i * 1.2, -3.5, -1.2, -5, .8, 3)
  xline(base, .9, ['axa'])
  // data bus under the street
  const paths = [[-1.5, -5, 11.7], [8.5, -5, 9], [-12.2, 9.6, 2.7], [3.75, 10.25, .4], [8, -11.5, 4.4]]
    .map(([x, z, h]) => [V(x, h, z), V(x, -.6, z), V(x, -.6, 2), V(-11, -.6, 2), V(-11, -.6, -5), V(-11, -2, -5)])
  const bus = [-11, -2, -5, -11, 19, -5]
  for (const p of paths) {
    p.len = [0]
    for (let i = 1; i < p.length; i++) {
      bus.push(...p[i - 1].toArray(), ...p[i].toArray())
      p.len.push(p.len[i - 1] + p[i].distanceTo(p[i - 1]))
    }
  }
  xline(bus, .45, ['axa', 'seekers'])
  const NP = 280
  const packetGeo = new THREE.BufferGeometry()
  packetGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(NP * 3), 3))
  xg.add(new THREE.Points(packetGeo, xmat(new THREE.PointsMaterial({ color: '#c8fffb', size: .34 }), 1, ['axa', 'seekers'])))
  const packets = Array.from({ length: NP }, (_, i) => ({ path: paths[i % paths.length], u: Math.random(), v: .05 + Math.random() * .16, back: i % 3 === 0 }))
  // serverless: work that only exists while it runs
  const NT = 70
  const twGeo = new THREE.BufferGeometry()
  const twArr = new Float32Array(NT * 3)
  const twSet = i => {
    twArr[i * 3] = -11 + (Math.random() - .5) * 5.2
    twArr[i * 3 + 1] = 3 + Math.random() * 9.6
    twArr[i * 3 + 2] = -5 + (Math.random() - .5) * 5.2
  }
  for (let i = 0; i < NT; i++) twSet(i)
  twGeo.setAttribute('position', new THREE.BufferAttribute(twArr, 3))
  xg.add(new THREE.Points(twGeo, xmat(new THREE.PointsMaterial({ color: '#ffffff', size: .26 }), .9, ['axa'])))
  // the highway being read
  const scanV = []
  for (let i = 0; i < 3; i++) scanV.push(i * .5, 4.85, -13.9, i * .5, 6.4, -13.9, i * .5, 6.4, -13.9, i * .5, 6.4, -9.1, i * .5, 6.4, -9.1, i * .5, 4.85, -9.1)
  const scan = xline(scanV, .8, ['nexco'])
  const ghostMat = new THREE.LineBasicMaterial({ color: PAL.teal, transparent: true, opacity: 0, depthWrite: false })
  const ghostGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.5, .5, .64))
  for (const c of traffic) {
    if (!c.fast) continue
    c.ghost = new THREE.LineSegments(ghostGeo, ghostMat)
    scene.add(c.ghost)
  }
  // price history over the car lot
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(.42, 1, .42).translate(0, .5, 0), xmat(new THREE.MeshBasicMaterial({ color: PAL.teal }), .32, ['cars']), lot.cars.length)
  bars.frustumCulled = false
  xg.add(bars)
  // heartbeat over the clinic
  const NE = 90
  const ecgArr = new Float32Array(NE * 3)
  const ecgGeo = new THREE.BufferGeometry()
  ecgGeo.setAttribute('position', new THREE.BufferAttribute(ecgArr, 3))
  xg.add(new THREE.Line(ecgGeo, xmat(new THREE.LineBasicMaterial({ color: PAL.teal }), 1, ['kokoromil'])))
  const beat = u => {
    u = u % 1
    if (u < .08) return Math.sin(u / .08 * Math.PI) * .18
    if (u > .2 && u < .24) return -(u - .2) / .04 * .3
    if (u >= .24 && u < .29) return -.3 + (u - .24) / .05 * 1.9
    if (u >= .29 && u < .34) return 1.6 - (u - .29) / .05 * 2.1
    if (u >= .34 && u < .38) return -.5 + (u - .34) / .04 * .5
    if (u > .5 && u < .66) return Math.sin((u - .5) / .16 * Math.PI) * .3
    return 0
  }
  // the forecast, floating beside the lanes it describes
  const NF = 28
  const fcast = new THREE.InstancedMesh(new THREE.BoxGeometry(1.25, .06, .7), xmat(new THREE.MeshBasicMaterial(), .85, ['nexco'], false), NF)
  fcast.frustumCulled = false
  xg.add(fcast)
  const flow = [col('#3fc98e'), col('#ffb347'), col('#ff5a4d')]
  // AXA, switched over one floor at a time
  const bandY = [...Array.from({ length: 10 }, (_, i) => [3 + i * .98, 6.2]), ...Array.from({ length: 4 }, (_, i) => [13.3 + i, 4.9])]
  const bands = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .1, 1), xmat(new THREE.MeshBasicMaterial(), .5, ['axa'], false), bandY.length)
  bands.frustumCulled = false
  bandY.forEach(([y, w], i) => {
    mat4.compose(tmp.set(-11, y, -5), quat, scl.set(w, 1, w))
    bands.setMatrixAt(i, mat4)
  })
  xg.add(bands)
  // a reader passing over the car lot
  const sweepV = []
  for (const y of [.15, 2.3]) sweepV.push(0, y, 6.1, 0, y, 14.4)
  for (const z of [6.1, 14.4]) sweepV.push(0, .15, z, 0, 2.3, z)
  const sweep = xline(sweepV, .9, ['cars'])
  // the drawing check resizing a panel that was drawn too wide
  const fixGeo = new THREE.BufferGeometry()
  fixGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(16 * 3), 3))
  const fixMat = xmat(new THREE.LineBasicMaterial(), 1, ['site'], false)
  const fixLine = new THREE.LineSegments(fixGeo, fixMat)
  fixLine.frustumCulled = false
  xg.add(fixLine)

  // security chapter: the block under constant, boring attack
  const ringGeo = new THREE.RingGeometry(.9, 1, 48)
  const HITS = [[-11, 12, -2.2], [-11, 6, -2.2], [-1.5, 9, -2], [8.5, 5.4, -2], [10, 12, -1.7], [-12, 2, 11.8], [3.75, 1, 10], [8, 5.5, -11.5], [-8, 5.5, -11.5], [-11, 17, -5], [14, 1, 2], [-6, 1, 2]].map(q => V(...q))
  const NR = 20
  const rayGeo = new THREE.BufferGeometry()
  rayGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NR * 6), 3))
  const rayLines = new THREE.LineSegments(rayGeo, xmat(new THREE.LineBasicMaterial({ color: PAL.red }), 1, [], false))
  rayLines.frustumCulled = false
  xg.add(rayLines)
  const aim = r => {
    const a = Math.random() * Math.PI * 2, d = 48 + Math.random() * 30
    r.from = V(Math.cos(a) * d, 6 + Math.random() * 26, Math.sin(a) * d)
    r.to = HITS[Math.floor(Math.random() * HITS.length)]
    r.u = -Math.random() * 1.6
    r.v = .7 + Math.random() * .9
    return r
  }
  const rays = Array.from({ length: NR }, () => aim({}))
  const pings = Array.from({ length: 14 }, () => {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }))
    m.userData.life = 1
    xg.add(m)
    return m
  })
  let pingAt = 0, blocked = 0
  const planeV = []
  rect(planeV, 0, 0, 0, 41, 31)
  for (let x = -18; x <= 18; x += 6) planeV.push(x, 0, -15.5, x, 0, 15.5)
  const sheetScan = xline(planeV, .35)
  const webV = []
  const tops = [[-11, 19, -5], [-1.5, 12.2, -5], [10.1, 11.9, -5], [-13, 4.9, 9], [10.4, 1.8, 7.4], [0, 6.4, -11.5]]
  tops.forEach((a, i) => tops.forEach((b, j) => { if (j > i) webV.push(...a, ...b) }))
  xline(webV, .22)
  const VOL = [[-11, -5, 5.6, 5.6, 19], [-1.5, -5, 7, 6, 12], [8.5, -5, 7, 6, 11.5], [-12.2, 9.6, 8, 4.4, 3], [0, -11.5, 40, 4, 5], [3.75, 10.25, 16, 8, 2.5]]
  const NRAIN = 700
  const rainArr = new Float32Array(NRAIN * 3), rainV = new Float32Array(NRAIN), rainTop = new Float32Array(NRAIN)
  for (let i = 0; i < NRAIN; i++) {
    const [x, z, w, d, h] = VOL[i % VOL.length]
    rainArr[i * 3] = x + (Math.random() - .5) * w
    rainArr[i * 3 + 1] = Math.random() * h
    rainArr[i * 3 + 2] = z + (Math.random() - .5) * d
    rainV[i] = 2 + Math.random() * 7
    rainTop[i] = h
  }
  const rainGeo = new THREE.BufferGeometry()
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainArr, 3))
  xg.add(new THREE.Points(rainGeo, xmat(new THREE.PointsMaterial({ color: PAL.teal, size: .13 }), .75)))

  // a breach at Seekers, and review marks on the drawings next door
  const breachMat = xmat(new THREE.MeshBasicMaterial({ color: PAL.red }), 1, [], false)
  const ringMat = xmat(new THREE.MeshBasicMaterial({ color: PAL.red, side: THREE.DoubleSide }), 1, [], false)
  const breach = new THREE.Mesh(new THREE.SphereGeometry(.36, 20, 12), breachMat)
  const ring = new THREE.Mesh(ringGeo, ringMat)
  breach.position.set(8.5, 5.4, -5)
  ring.position.copy(breach.position)
  xg.add(breach, ring)
  const marks = [[-.3, 9.2, -2], [1.9, 6.4, -3.4], [-3, 11.9, -4.2]].map((p, i) => {
    const m = new THREE.Mesh(ringGeo, xmat(new THREE.MeshBasicMaterial({ color: PAL.amber, side: THREE.DoubleSide }), 1, ['site'], false))
    m.position.set(...p)
    m.scale.setScalar(.7)
    m.userData.i = i
    xg.add(m)
    return m
  })

  // tags on the hero, and the breach readout
  const tagBox = document.getElementById('tags')
  const tags = TAGS.map(([id, name, pos]) => {
    const el = document.createElement('a')
    el.className = 'tag'
    el.href = `#p-${id}`
    el.innerHTML = `<span>${name}</span><i></i>`
    tagBox.append(el)
    return { el, pos: V(...pos), stage: { nexco: .18, axa: .3, site: .46, seekers: .53, kokoromil: .6, cars: .68 }[id] }
  })
  const notes = NOTES.map(([stop, name, pos]) => {
    const el = document.createElement('div')
    el.className = 'tag note'
    el.innerHTML = `<span>${name}</span><i></i>`
    tagBox.append(el)
    return { el, stop, pos: V(...pos) }
  })
  const HIT_TEXT = ['SQLi probe · dropped', 'Token replay · blocked', 'Port scan · dropped', 'IDOR attempt · denied', 'Credential stuffing · throttled', 'Pairing downgrade · refused', 'Stale dependency · patched']
  const hitTags = Array.from({ length: 4 }, () => {
    const el = document.createElement('div')
    el.className = 'tag alert'
    el.innerHTML = '<span></span><i></i>'
    tagBox.append(el)
    return { el, pos: V(), ttl: 0 }
  })
  let hitAt = 0
  const hudLog = document.getElementById('hud-log'), hudN = document.getElementById('hud-n')
  const LOG = ['threat-model: trust boundaries mapped', 'authz: IDOR on order lookup, fixed', 'deps: advisories open 3 → 0', 'waf: sqli probe dropped', 'session: token replay blocked', 'ble: pairing downgrade refused', 'secrets: none in repo history', 'cve: advisory → patch → verified', 'rate-limit: credential stuffing throttled', 'csp: inline script blocked', 'audit: PII fields masked', 'tls: weak cipher refused', 'upload: content type spoof rejected', 'ssrf: metadata endpoint unreachable', 'backup: restore drill passed']
  let logAt = 0, logI = 0
  const alertEl = document.createElement('div')
  alertEl.className = 'tag alert'
  alertEl.innerHTML = '<span></span><i></i>'
  tagBox.append(alertEl)

  // post
  const target = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType })
  const composer = new EffectComposer(renderer, target)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0, .65, .1)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  let W = 1, H = 1
  function resize () {
    W = innerWidth
    H = innerHeight
    renderer.setPixelRatio(Math.min(devicePixelRatio, W < 800 ? 1.5 : 2))
    renderer.setSize(W, H, false)
    composer.setPixelRatio(renderer.getPixelRatio())
    composer.setSize(W, H)
    camera.aspect = W / H
    // keep the block clear of the copy: to the right on wide screens, up top on narrow ones
    if (W >= 900) camera.setViewOffset(W, H, -W * .15, H * .02, W, H)
    else camera.setViewOffset(W, H, 0, H * .2, W, H)
    camera.updateProjectionMatrix()
  }
  addEventListener('resize', resize)
  resize()

  // state: build runs on a clock, everything else eases towards what the current section asks for
  const S = { build: reduced ? 1 : 0, x: 0, warm: 0, night: isDark() ? 1 : 0, draft: 0, focus: 0 }
  const T = { x: 0, warm: 0, draft: 0, focus: 0 }
  // how far each project is opened up; only the one the camera is on
  const F = Object.fromEntries(KEYS.map(k => [k, 0]))
  let buildStart = performance.now(), camKey = 'hero', covered = false
  const BUILD_MS = 9000
  const sections = [...document.querySelectorAll('[data-cam]')]
  const solid = document.querySelector('.solid')
  function readScroll () {
    const mid = scrollY + H * .5
    let s = sections[0]
    for (const el of sections) if (el.offsetTop <= mid) s = el
    if (solid) {
      const r = solid.getBoundingClientRect()
      covered = r.top <= 0 && r.bottom >= H
      if (r.top < H * .5 && r.bottom > H * .5) s = null
    }
    if (!s) {
      root.dataset.mode = 'built'
      return
    }
    camKey = s.dataset.cam
    const mode = s.dataset.mode || 'built'
    if (root.dataset.mode !== mode) root.dataset.mode = mode
    T.x = mode === 'xray' ? 1 : 0
    T.warm = mode === 'people' ? 1 : 0
    T.draft = mode === 'draft' ? 1 : 0
    T.focus = camKey === 'nexco' ? 1 : 0
  }
  addEventListener('scroll', readScroll, { passive: true })
  readScroll()
  document.getElementById('replay')?.addEventListener('click', () => {
    buildStart = performance.now()
    S.build = 0
  })
  // arriving mid-page: don't make them wait for the drawing
  if (scrollY > H * .5) buildStart -= BUILD_MS

  const mouse = { x: 0, y: 0, sx: 0, sy: 0 }
  addEventListener('pointermove', e => {
    mouse.x = e.clientX / W - .5
    mouse.y = e.clientY / H - .5
  })

  const pos = V(...CAM.hero[0]), at = V(...CAM.hero[1]), tp = V(), ta = V(), UP = V(0, 1, 0)
  const bg = col(0), ink = col(0), soft = col(0), tc = col(0)
  let last = performance.now(), zoom = 1

  function frame (now) {
    requestAnimationFrame(frame)
    const dt = Math.min(.05, (now - last) / 1000), t = now / 1000
    last = now
    if (document.hidden || covered) return
    if (!reduced) S.build = clamp((now - buildStart) / BUILD_MS)
    const k = reduced ? 1 : 1 - Math.exp(-dt * 3)
    S.x += (T.x - S.x) * k
    S.warm += (T.warm - S.warm) * k
    S.draft += (T.draft - S.draft) * k
    S.focus += (T.focus - S.focus) * k
    let anyF = 0
    for (const key of KEYS) {
      F[key] += ((camKey === key && !T.x && !T.warm && !T.draft ? 1 : 0) - F[key]) * k
      anyF = Math.max(anyF, F[key])
    }
    S.night += ((isDark() ? 1 : 0) - S.night) * k
    const X = S.x, Wm = S.warm, N = S.night, D = S.draft
    const done = clamp((S.build - .92) / .08)

    // light and colour
    bg.copy(PAL.bgDay).lerp(PAL.bgNight, N)
    tc.copy(PAL.bgDusk).lerp(PAL.bgDuskNight, N)
    bg.lerp(tc, Wm).lerp(PAL.bgX, X)
    scene.background.copy(bg)
    scene.fog.color.copy(bg)
    ink.copy(PAL.inkDay).lerp(PAL.inkNight, N)
    soft.copy(PAL.softDay).lerp(PAL.softNight, N)
    sun.color.copy(PAL.sunDay).lerp(PAL.sunNight, N).lerp(PAL.sunDusk, Wm)
    sun.intensity = mix(mix(2.3, .55, N), mix(2.5, 1, N), Wm) * (1 - X * .85)
    sun.position.set(mix(-24, -34, Wm), mix(38, 16, Wm), mix(20, 12, Wm))
    hemi.intensity = mix(mix(1.05, .34, N), mix(.8, .4, N), Wm) * (1 - X * .7)
    shadowMat.opacity = mix(.2, .3, Math.max(N, Wm)) * (1 - X) * (1 - D)
    const glow = Math.max(N * .62, Wm * mix(.7, .95, N)) * (1 - X)
    bloom.strength = X * .32 + N * .18 * (1 - X) + Wm * .1
    for (const g of grids) {
      g.material.color.copy(ink).lerp(PAL.teal, X)
      g.material.opacity = g.userData.o * mix(1, .7, X) * mix(1, 1.6, D)
    }
    titleMat.color.copy(ink).lerp(PAL.teal, X)

    for (const s of stages) {
      const l = clamp((S.build * 1.1 - s.at) / s.dur)
      s.root.visible = l > 0
      if (l <= 0) continue
      const f = clamp(l / .35), e = easeOut(clamp((l - .3) / .4)), c = clamp((l - .7) / .3) * (1 - D)
      s.group.scale.y = Math.max(.0005, e)
      // the building the camera is on turns to tracing paper, so its insides show
      const open = OPEN[s.key] ? F[s.key] * OPEN[s.key] : 0
      // everything that is not the current project steps back towards the paper
      let other = 0
      for (const key of KEYS) if (key !== s.key) other = Math.max(other, F[key])
      const dim = other * (s.key ? .62 : .3) * (1 - X)
      const op = c * (1 - X * .965) * (1 - open)
      if (s.solid) {
        const m = s.solid.material
        m.opacity = op
        m.transparent = op < .999
        m.depthWrite = X < .5 && open < .3
        m.color.copy(PAL.white).lerp(PAL.xdark, X).multiplyScalar(1 - dim)
        m.emissive.copy(bg).multiplyScalar(dim)
        s.solid.visible = op > .004
        s.solid.castShadow = c > .5 && X < .5
      }
      const gop = c * (1 - X) * (1 - open * .8)
      for (const g of [s.lit, s.dark]) {
        if (!g) continue
        g.material.opacity = gop
        g.material.transparent = gop < .999
        g.visible = gop > .004
        g.material.color.setScalar(1 - dim)
        g.material.emissive.copy(bg).multiplyScalar(dim)
      }
      if (s.lit) {
        s.lit.material.emissive.add(tc.copy(WARM).multiplyScalar(glow * (1 - dim)))
        s.lit.material.emissiveIntensity = 1
      }
      for (const m of s.extras) {
        m.material.opacity = gop
        m.visible = gop > .004
      }
      if (s.edges) {
        const m = s.edges.material
        s.edges.geometry.setDrawRange(0, Math.ceil(f * s.edges.userData.n / 2) * 2)
        m.color.copy(ink).lerp(soft, c).lerp(PAL.teal, X)
        m.opacity = mix(mix(.95, mix(.3, .22, N), c), .75, Math.max(X, open)) * (1 - dim * .55)
      }
      if (s.details) {
        const m = s.details.material, o = (1 - c * .92) * (1 - X) * .7
        s.details.geometry.setDrawRange(0, Math.ceil(f * s.details.userData.n / 2) * 2)
        s.details.visible = o > .01
        m.color.copy(ink)
        m.opacity = o
      }
    }
    if (billboard.mesh) billboard.mesh.material.emissiveIntensity = glow * .7

    // things that move
    crane.jib.root.rotation.y = Math.PI + .25 + Math.sin(t * .22) * .5
    for (const c of traffic) {
      const p = c.s.root.position
      p.x += c.dir * c.v * dt
      if (p.x > 21.5) p.x = -21.5
      if (p.x < -21.5) p.x = 21.5
      if (c.ghost) {
        c.ghost.position.set(p.x + c.dir * (2.6 + Math.sin(t * 1.1 + c.v * 3) * .6), p.y + .32, p.z)
        c.ghost.visible = Math.abs(c.ghost.position.x) < 20
      }
    }
    ghostMat.opacity = Math.max(X, S.focus * .9) * done
    ghostMat.color.copy(ink).lerp(PAL.teal, X)

    const pl = clamp((S.build * 1.1 - .9) / .14), pc = ease(clamp((pl - .2) / .8)) * (1 - D)
    people.visible = pc > .01
    if (people.visible) {
      const tone = Math.round(Math.max(Wm, .22) * 40)
      walkers.forEach((w, i) => {
        if (!w.still) {
          w.p += w.v * dt
          if (w.p > w.b || w.p < w.a) {
            w.v *= -1
            w.p = clamp(w.p, w.a, w.b)
          }
        }
        const x = w.still ? w.x : (w.axis === 'x' ? w.p : w.fixed), z = w.still ? w.z : (w.axis === 'x' ? w.fixed : w.p)
        tmp.set(x, w.y + (w.still ? 0 : Math.abs(Math.sin(t * 7 + i)) * .035), z)
        mat4.compose(tmp, quat, scl.setScalar(pc))
        people.setMatrixAt(i, mat4)
        if (tone !== peopleTone) people.setColorAt(i, tmpC.copy(grey).lerp(w.c, tone / 40))
      })
      people.instanceMatrix.needsUpdate = true
      if (tone !== peopleTone) {
        people.instanceColor.needsUpdate = true
        peopleTone = tone
      }
      peopleMat.opacity = pc
      peopleMat.transparent = pc < .999
      peopleMat.emissive.copy(PAL.teal).multiplyScalar(X * 1.5)
      people.castShadow = X < .5
    }

    // the cast
    cast.visible = pc > .01
    const lf = lift.s.root.position
    lf.y = 2 + ease(clamp(Math.abs(((t * .11) % 1) * 2 - 1) * 1.3 - .15)) * 6.1
    {
      // ambulance: in from the street, parked with the beacon going, then gone
      const ph = (t % 15) / 15, u = ease(clamp(ph / .36)), r = ambulance.s.root
      const d1 = AMB[0].distanceTo(AMB[1]), d2 = AMB[1].distanceTo(AMB[2]), d = u * (d1 + d2)
      if (d < d1) r.position.lerpVectors(AMB[0], AMB[1], d / d1)
      else r.position.lerpVectors(AMB[1], AMB[2], (d - d1) / d2)
      r.rotation.y = -Math.PI / 2 * ease(clamp((d - d1 + 1.2) / 2.4))
      r.scale.setScalar(Math.max(.001, clamp(ph / .03) * clamp((1 - ph) / .05)))
      beacon.visible = Math.sin(t * 14) > 0
    }
    if (cast.visible) {
      actors.forEach((a, i) => {
        let sy = 1, sc = a.s * pc
        if (a.fix) {
          sy = .72 + Math.sin(t * 3 + i) * .1
        } else if (a.ride) {
          a.pos.set(lf.x + a.dx, lf.y + .06, lf.z)
        } else {
          const total = a.len[a.len.length - 1]
          a.u = (a.u + a.v * dt / total) % 2
          const d = (a.u < 1 ? a.u : 2 - a.u) * total
          let k = 1
          while (k < a.pts.length - 1 && a.len[k] < d) k++
          a.pos.lerpVectors(a.pts[k - 1], a.pts[k], (d - a.len[k - 1]) / (a.len[k] - a.len[k - 1]))
          a.pos.y += Math.abs(Math.sin(t * (4 + a.v * 6) + i)) * .03
          if (a.fade) sc *= clamp((total - d) / .5)
        }
        mat4.compose(a.pos, quat, scl.set(sc, sc * sy, sc))
        cast.setMatrixAt(i, mat4)
      })
      cast.instanceMatrix.needsUpdate = true
      cast.castShadow = X < .5
      const ha = holters.geometry.attributes.position.array
      elders.forEach((a, i) => ha.set([a.pos.x, a.pos.y + .42, a.pos.z + .13], i * 3))
      holters.geometry.attributes.position.needsUpdate = true
      holters.material.size = .3 + Math.max(0, beat(t * 1.1)) * .22
      const sa = sparks.geometry.attributes.position.array
      fixers.forEach((q, i) => {
        for (let j = 0; j < 4; j++) sa.set([q[0] + .22 + (Math.random() - .5) * .3, q[1] + .12 + Math.random() * .3, q[2] + (Math.random() - .5) * .3], (i * 4 + j) * 3)
      })
      sparks.geometry.attributes.position.needsUpdate = true
    }
    for (const m of liveMats) m.opacity = pc * (1 - X)
    sparks.material.opacity *= Math.random() > .35 ? 1 : 0

    // x-ray
    xg.visible = X > .01 || anyF > .01
    if (xg.visible) {
      for (const m of xmats) {
        let v = X
        for (const key of m.userData.k) v = Math.max(v, F[key])
        m.opacity = m.userData.o * v * done * mix(1.6, 1, X)
        if (m.userData.c) m.color.copy(ink).lerp(m.userData.c, X)
      }
      const arr = packetGeo.attributes.position.array
      packets.forEach((q, i) => {
        q.u = (q.u + q.v * dt) % 1
        const p = q.path, d = (q.back ? 1 - q.u : q.u) * p.len[p.len.length - 1]
        let s = 1
        while (s < p.length - 1 && p.len[s] < d) s++
        tmp.lerpVectors(p[s - 1], p[s], (d - p.len[s - 1]) / (p.len[s] - p.len[s - 1])).toArray(arr, i * 3)
      })
      packetGeo.attributes.position.needsUpdate = true
      for (let i = 0; i < 3; i++) twSet(Math.floor(Math.random() * NT))
      twGeo.attributes.position.needsUpdate = true
      scan.position.x = (t * 5) % 42 - 21
      lot.cars.forEach(([x, z], i) => {
        tmp.set(x, 1, z)
        mat4.compose(tmp, quat, scl.set(1, .5 + (Math.sin(t * .9 + i * 1.7) * .5 + .5) * 2.2, 1))
        bars.setMatrixAt(i, mat4)
      })
      bars.instanceMatrix.needsUpdate = true
      for (let i = 0; i < NE; i++) {
        const u = i / (NE - 1)
        ecgArr[i * 3] = -16.2 + u * 8
        ecgArr[i * 3 + 1] = 4.7 + beat(u * 2.5 - t * .55 + 100) * .8
        ecgArr[i * 3 + 2] = 11.9
      }
      ecgGeo.attributes.position.needsUpdate = true
      for (let i = 0; i < NF; i++) {
        const x = -19 + i * 1.4, v = .5 + .5 * Math.sin(x * .28 - t * .9)
        mat4.compose(tmp.set(x, 6.9, -13.6), quat, scl.set(1, 1, 1))
        fcast.setMatrixAt(i, mat4)
        fcast.setColorAt(i, v < .5 ? tmpC.copy(flow[0]).lerp(flow[1], v * 2) : tmpC.copy(flow[1]).lerp(flow[2], v * 2 - 1))
      }
      fcast.instanceMatrix.needsUpdate = true
      fcast.instanceColor.needsUpdate = true
      const q = (t * 1.1) % (bandY.length + 5)
      bandY.forEach((_, i) => bands.setColorAt(i, i + 1 < q ? tmpC.copy(PAL.teal).lerp(ink, .25 * (1 - X)) : i < q ? PAL.white : PAL.amber))
      bands.instanceColor.needsUpdate = true
      sweep.position.x = -4.2 + (t * 2.6) % 16.6
      {
        // panel on the open floor: drawn too wide, flagged, pulled back to size
        const ph = (t % 6) / 6, w = mix(3.1, 2.1, ease(clamp((ph - .35) / .25))), x0 = -4.6, x1 = x0 + w, y0 = 9.15, y1 = 10.25, z = -1.96, a = fixGeo.attributes.position.array
        a.set([x0, y0, z, x1, y0, z, x1, y0, z, x1, y1, z, x1, y1, z, x0, y1, z, x0, y1, z, x0, y0, z,
          x0, y1 + .32, z, x1, y1 + .32, z, x0, y1 + .2, z, x0, y1 + .44, z, x1, y1 + .2, z, x1, y1 + .44, z, x0, y0, z, x1, y1, z])
        fixGeo.attributes.position.needsUpdate = true
        fixMat.color.copy(ph < .5 ? PAL.amber : PAL.teal)
        if (!X && ph >= .5) fixMat.color.lerp(ink, .35)
      }
      if (X > .01) {
        const ra = rayGeo.attributes.position.array
        rays.forEach((r, i) => {
          r.u += r.v * dt
          if (r.u >= 1) {
            const pg = pings[pingAt++ % pings.length]
            pg.position.copy(r.to)
            pg.userData.life = 0
            blocked++
            if (Math.random() < .3) {
              const h = hitTags[hitAt++ % hitTags.length]
              h.pos.copy(r.to)
              h.ttl = 1.5
              h.el.firstChild.textContent = HIT_TEXT[Math.floor(Math.random() * HIT_TEXT.length)]
            }
            aim(r)
          }
          const u1 = clamp(r.u), u0 = clamp(r.u - .1)
          tmp.lerpVectors(r.from, r.to, u0).toArray(ra, i * 6)
          tmp.lerpVectors(r.from, r.to, u1).toArray(ra, i * 6 + 3)
        })
        rayGeo.attributes.position.needsUpdate = true
        sheetScan.position.y = (t * 4.5) % 20
        for (let i = 0; i < NRAIN; i++) {
          rainArr[i * 3 + 1] -= rainV[i] * dt
          if (rainArr[i * 3 + 1] < 0) rainArr[i * 3 + 1] = rainTop[i]
        }
        rainGeo.attributes.position.needsUpdate = true
      }
      for (const pg of pings) {
        const l = pg.userData.life = Math.min(1, pg.userData.life + dt * 1.3)
        pg.material.opacity = X * done * (1 - l)
        pg.material.color.copy(l < .35 ? PAL.red : PAL.teal)
        pg.scale.setScalar(.3 + l * 2.6)
        pg.quaternion.copy(camera.quaternion)
      }
      // breach loop: flares red, gets traced, turns teal once sealed
      const ph = (t % 8) / 8, hot = ph < .55
      tc.copy(hot ? PAL.red : PAL.teal)
      breachMat.color.copy(tc)
      ringMat.color.copy(tc)
      breachMat.opacity *= hot ? .7 + Math.sin(t * 10) * .3 : .85
      const r = hot ? (t * .8) % 1 : 0
      ring.scale.setScalar(1 + r * 4.5)
      ring.quaternion.copy(camera.quaternion)
      ringMat.opacity *= hot ? 1 - r : .5
      for (const m of marks) {
        const fixed = ((t + m.userData.i * 2.6) % 8) / 8 > .5
        m.material.color.copy(fixed ? PAL.teal : PAL.amber)
        m.quaternion.copy(camera.quaternion)
      }
      const label = hot ? 'CVE alert · tracing' : 'Patched'
      if (alertEl.firstChild.textContent !== label) {
        alertEl.firstChild.textContent = label
        alertEl.classList.toggle('ok', !hot)
      }
    }

    // camera
    const stop = CAM[camKey] || CAM.hero
    const ck = reduced ? 1 : 1 - Math.exp(-dt * 2.1)
    pos.lerp(tp.set(...stop[0]), ck)
    at.lerp(ta.set(...stop[1]), ck)
    mouse.sx += (mouse.x - mouse.sx) * k
    mouse.sy += (mouse.y - mouse.sy) * k
    const sway = reduced ? 0 : Math.sin(t * .11) * .09 + mouse.sx * .14 - (1 - ease(clamp(S.build * 1.15))) * .5
    // portrait screens pull the camera back to fit the block; some stops read better closer in
    zoom += ((camera.aspect < 1 ? NARROW[camKey] || 1 : 1) - zoom) * ck
    const far = Math.max(1, 1.5 / camera.aspect) * zoom
    scene.fog.near = 95 * far
    scene.fog.far = 210 * far
    tmp.copy(pos).sub(at).multiplyScalar(far).applyAxisAngle(UP, sway)
    camera.position.copy(at).add(tmp)
    camera.position.y += mouse.sy * -2.5 * (1 - D)
    camera.lookAt(at)
    camera.updateMatrixWorld()

    const hero = camKey === 'hero'
    for (const g of tags) {
      const on = hero && S.build * 1.1 >= g.stage + .2
      g.el.classList.toggle('on', on)
      if (!on) continue
      tmp.copy(g.pos).project(camera)
      g.el.style.transform = `translate(${((tmp.x * .5 + .5) * W).toFixed(1)}px, ${((-tmp.y * .5 + .5) * H).toFixed(1)}px) translate(-50%, -100%)`
    }
    for (const g of notes) {
      const on = camKey === g.stop && F[g.stop] > .75 && done > .5
      g.el.classList.toggle('on', on)
      if (!on) continue
      tmp.copy(g.pos).project(camera)
      g.el.style.transform = `translate(${((tmp.x * .5 + .5) * W).toFixed(1)}px, ${((-tmp.y * .5 + .5) * H).toFixed(1)}px) translate(-50%, -100%)`
    }
    const alertOn = camKey === 'xray' && X > .6 && done > .5
    alertEl.classList.toggle('on', alertOn)
    if (alertOn) {
      tmp.copy(breach.position).project(camera)
      alertEl.style.transform = `translate(${((tmp.x * .5 + .5) * W).toFixed(1)}px, ${((-tmp.y * .5 + .5) * H - 22).toFixed(1)}px) translate(-50%, -100%)`
    }

    const xOn = camKey === 'xray' && X > .6 && done > .5
    for (const h of hitTags) {
      h.ttl -= dt
      const on = xOn && h.ttl > 0
      h.el.classList.toggle('on', on)
      h.el.classList.toggle('ok', h.ttl < .8)
      if (!on) continue
      tmp.copy(h.pos).project(camera)
      h.el.style.transform = `translate(${((tmp.x * .5 + .5) * W).toFixed(1)}px, ${((-tmp.y * .5 + .5) * H).toFixed(1)}px) translate(-50%, -100%)`
    }
    if (xOn && hudLog && now > logAt) {
      logAt = now + 240 + Math.random() * 420
      const li = document.createElement('li')
      li.textContent = `${new Date().toTimeString().slice(0, 8)}  ${LOG[logI++ % LOG.length]}`
      hudLog.append(li)
      while (hudLog.children.length > 9) hudLog.firstChild.remove()
      hudN.textContent = blocked
    }

    composer.render()
  }
  root.classList.add('gl')
  requestAnimationFrame(frame)
}

try {
  start()
} catch (err) {
  console.warn('The 3D block could not start, showing the page without it.', err)
  root.classList.add('no-gl')
}

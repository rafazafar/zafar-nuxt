// The city block on the homepage: every project is a piece of one street.
// Geometry is generated here and merged into a few "stages" so each can be shown as a drawing,
// a wireframe or a solid. scene.js owns the renderer, the camera and the animation.
import * as THREE from 'three'

const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), ONE = new THREE.Vector3(1, 1, 1)
const C = new THREE.Color()
const PI = Math.PI

let seed = 11
export const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647
const pick = a => a[Math.floor(rnd() * a.length)]

export const stages = []
const bufs = () => ({ p: [], n: [], c: [] })

export class Stage {
  constructor (at, dur = .18) {
    this.at = at
    this.dur = dur
    this.buf = { solid: bufs(), lit: bufs(), dark: bufs() }
    this.edge = []
    this.detail = []
    this.extras = []
    this.xf = null
    this.root = new THREE.Group()
    this.group = new THREE.Group()
    this.root.add(this.group)
    stages.push(this)
  }

  // o: x y z rx ry rz, kind (solid | lit | dark | glass), edge (true | false | 'detail')
  geo (g, color, o = {}) {
    if (g.index) g = g.toNonIndexed()
    E.set(o.rx || 0, o.ry || 0, o.rz || 0)
    M.compose(P.set(o.x || 0, o.y || 0, o.z || 0), Q.setFromEuler(E), ONE)
    g.applyMatrix4(M)
    if (this.xf) g.applyMatrix4(this.xf)
    const kind = o.kind === 'glass' ? (rnd() > .3 ? 'lit' : 'dark') : (o.kind || 'solid')
    const b = this.buf[kind], pa = g.attributes.position.array, na = g.attributes.normal.array
    C.set(color)
    for (let i = 0; i < pa.length; i += 3) {
      b.p.push(pa[i], pa[i + 1], pa[i + 2])
      b.n.push(na[i], na[i + 1], na[i + 2])
      b.c.push(C.r, C.g, C.b)
    }
    if (o.edge !== false) {
      const ea = new THREE.EdgesGeometry(g, 28).attributes.position.array
      const dst = o.edge === 'detail' ? this.detail : this.edge
      for (let i = 0; i < ea.length; i++) dst.push(ea[i])
    }
    return this
  }

  box (w, h, d, x, y, z, color, o = {}) {
    return this.geo(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), color, { x, y, z, ...o })
  }

  cyl (rt, rb, h, x, y, z, color, o = {}) {
    return this.geo(new THREE.CylinderGeometry(rt, rb, h, o.seg || 10).translate(0, h / 2, 0), color, { x, y, z, ...o })
  }

  ball (r, x, y, z, color, o = {}) {
    return this.geo(new THREE.IcosahedronGeometry(r, o.detail || 0), color, { x, y, z, ...o })
  }

  // flat list of segment endpoints; detail lines belong to the drawing and fade once built
  line (v, detail) {
    const dst = detail ? this.detail : this.edge
    for (let i = 0; i < v.length; i += 3) {
      P.set(v[i], v[i + 1], v[i + 2])
      if (this.xf) P.applyMatrix4(this.xf)
      dst.push(P.x, P.y, P.z)
    }
    return this
  }

  // polyline through points
  path (pts, detail) {
    const v = []
    for (let i = 0; i < pts.length - 1; i++) v.push(...pts[i], ...pts[i + 1])
    return this.line(v, detail)
  }

  // a window: a glass pane plus its outline on the drawing
  pane (w, h, d, x, y, z, kind = 'glass') {
    this.box(w, h, d, x, y, z, kind === 'dark' ? '#71879c' : '#a9bfd1', { kind, edge: false })
    if (d <= w) this.path([[x - w / 2, y, z], [x + w / 2, y, z], [x + w / 2, y + h, z], [x - w / 2, y + h, z], [x - w / 2, y, z]], true)
    else this.path([[x, y, z - d / 2], [x, y, z + d / 2], [x, y + h, z + d / 2], [x, y + h, z - d / 2], [x, y, z - d / 2]], true)
    return this
  }

  done (scene) {
    const mesh = (b, mat) => {
      if (!b.p.length) return null
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3))
      g.setAttribute('normal', new THREE.Float32BufferAttribute(b.n, 3))
      g.setAttribute('color', new THREE.Float32BufferAttribute(b.c, 3))
      const m = new THREE.Mesh(g, mat)
      this.group.add(m)
      return m
    }
    const std = o => new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0, ...o })
    this.solid = mesh(this.buf.solid, std({ roughness: .92 }))
    if (this.solid) this.solid.receiveShadow = true
    this.lit = mesh(this.buf.lit, std({ roughness: .3, emissive: '#ffd08a', emissiveIntensity: 0 }))
    this.dark = mesh(this.buf.dark, std({ roughness: .3 }))
    const lines = (arr) => {
      if (!arr.length) return null
      // lowest segments first, so the footprint is drawn before the walls
      const n = arr.length / 6, idx = Array.from({ length: n }, (_, i) => i)
      idx.sort((a, b) => (arr[a * 6 + 1] + arr[a * 6 + 4]) - (arr[b * 6 + 1] + arr[b * 6 + 4]))
      const out = new Float32Array(arr.length)
      idx.forEach((s, i) => { for (let k = 0; k < 6; k++) out[i * 6 + k] = arr[s * 6 + k] })
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.BufferAttribute(out, 3))
      const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }))
      l.userData.n = n * 2
      this.group.add(l)
      return l
    }
    this.edges = lines(this.edge)
    this.details = lines(this.detail)
    this.buf = this.edge = this.detail = null
    scene.add(this.root)
    return this
  }
}

const K = {
  slab: '#eceee9', road: '#cdd0cc', walk: '#e7e8e2', paint: '#fbfbf7', concrete: '#cfd1cc', slabs: '#e0e1dc',
  steel: '#7d8894', dark: '#3a4350', wood: '#d6c19d',
  stone: '#dfd2bc', stone2: '#cdbda1', stone3: '#b9a888', axa: '#1d2f8f',
  coral: '#e58f76', cream: '#f4ede3', mint: '#bfe0cf', white: '#f5f6f2', crane: '#efb23e', tarp: '#5d8fd6', dirt: '#dbd0bb',
  grass: '#cfe0c2', greens: ['#a9c9a0', '#8fb98b', '#bdd6a8', '#9cc4a4'], pink: '#f3bfcd', red: '#d9534a', sign: '#2f8f6b', yellow: '#f0c75e'
}
const CARS = ['#eceae5', '#3f4a5a', '#c9534a', '#8fa3b8', '#d9b38c', '#9cc3b1', '#f0c75e', '#6d7f96', '#f1f1ee', '#b9a5c9']

// windows on the two faces the camera sees (+z and +x) of a box centred on cx, cz
function windows (s, cx, y0, cz, w, d, cols, rows, fh, o = {}) {
  const colsX = o.colsX || cols, wh = o.wh || fh * .6, fill = o.fill || .58
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * fh + (fh - wh) / 2
    for (let c = 0; c < cols; c++) s.pane(w / cols * fill, wh, .05, cx - w / 2 + (c + .5) * w / cols, y, cz + d / 2 + .03)
    for (let c = 0; c < colsX; c++) s.pane(.05, wh, d / colsX * fill, cx + w / 2 + .03, y, cz - d / 2 + (c + .5) * d / colsX)
  }
}

const carShape = new THREE.Shape([[-.75, .13], [-.75, .31], [-.56, .36], [-.3, .54], [.2, .54], [.44, .36], [.72, .31], [.75, .13]].map(p => new THREE.Vector2(...p)))
function wheels (s, xs, zs, r = .13) {
  for (const x of xs) for (const z of zs) s.geo(new THREE.CylinderGeometry(r, r, .1, 10), '#2c3139', { x, y: r, z, rx: PI / 2, edge: false })
}
// vehicles are modelled pointing along +x, then placed with a transform
function place (s, x, y, z, ry, fn) {
  s.xf = new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)), ONE)
  fn()
  s.xf = null
}
function car (s, x, y, z, ry, color) {
  place(s, x, y, z, ry, () => {
    s.geo(new THREE.ExtrudeGeometry(carShape, { depth: .62, bevelEnabled: false }).translate(0, 0, -.31), color)
    s.box(.7, .13, .64, -.04, .39, 0, '#34404f', { edge: false })
    wheels(s, [-.46, .46], [-.29, .29])
  })
}
function van (s, x, y, z, ry, color, stripe) {
  place(s, x, y, z, ry, () => {
    s.box(1.7, .78, .7, 0, .14, 0, color)
    s.box(.5, .3, .72, .52, .56, 0, '#34404f', { edge: false })
    if (stripe) s.box(1.72, .1, .72, 0, .42, 0, stripe, { edge: false })
    wheels(s, [-.5, .52], [-.32, .32])
  })
}
function bus (s, x, y, z, ry, color) {
  place(s, x, y, z, ry, () => {
    s.box(3, .95, .78, 0, .16, 0, color)
    s.box(2.8, .34, .8, 0, .62, 0, '#34404f', { edge: false })
    wheels(s, [-1, 1], [-.36, .36], .15)
  })
}
function truck (s, x, y, z, ry, color) {
  place(s, x, y, z, ry, () => {
    s.box(.7, .8, .74, 1.05, .16, 0, color)
    s.box(.3, .3, .76, 1.22, .58, 0, '#34404f', { edge: false })
    s.box(2, 1.05, .8, -.4, .2, 0, '#e9e9e4')
    wheels(s, [-1, -.3, 1.05], [-.35, .35], .15)
  })
}

function tree (s, x, y, z, h, color) {
  s.cyl(.06, .09, .9 * h, x, y, z, '#a58d74', { seg: 6, edge: false })
  s.ball(.62 * h, x, y + 1.25 * h, z, color, { ry: rnd() * 3, rx: rnd() })
  s.ball(.44 * h, x + (rnd() - .5) * .5, y + 1.8 * h, z + (rnd() - .5) * .5, color, { ry: rnd() * 3 })
  if (rnd() > .4) s.ball(.4 * h, x + (rnd() - .5) * .9, y + 1.1 * h, z + (rnd() - .5) * .9, color, { ry: rnd() * 3 })
}

function lamp (s, x, y, z, dx, dz, h = 2.7) {
  s.cyl(.04, .055, h, x, y, z, K.dark, { seg: 6, edge: false })
  s.box(Math.abs(dx) || .05, .05, Math.abs(dz) || .05, x + dx / 2, y + h, z + dz / 2, K.dark, { edge: false })
  s.box(.3, .07, .16, x + dx, y + h - .05, z + dz, '#fff3d6', { kind: 'lit', edge: false, ry: dz ? PI / 2 : 0 })
  s.path([[x, y, z], [x, y + h, z], [x + dx, y + h, z + dz]])
}

// lattice: a zigzag between two rails, for crane masts and jibs
function zig (a, b, n) {
  const pts = []
  for (let i = 0; i <= n; i++) {
    const t = i / n, r = i % 2 ? b : a
    pts.push([r[0][0] + (r[1][0] - r[0][0]) * t, r[0][1] + (r[1][1] - r[0][1]) * t, r[0][2] + (r[1][2] - r[0][2]) * t])
  }
  return pts
}

function sheet () {
  const s = new Stage(0, .14)
  s.box(40, 1, 30, 0, -1, 0, K.slab)
  // dimension lines on the table, as on a drafting sheet
  const y = -.99, v = []
  v.push(-20, y, 17, 20, y, 17)
  for (let x = -20; x <= 20; x += 4) v.push(x, y, 16.5, x, y, 17.5)
  v.push(22, y, -15, 22, y, 15)
  for (let z = -15; z <= 15; z += 5) v.push(21.5, y, z, 22.5, y, z)
  v.push(-20, y, 15.3, -20, y, 18.2, 20, y, 15.3, 20, y, 18.2, 20.3, y, -15, 23.2, y, -15, 20.3, y, 15, 23.2, y, 15)
  s.line(v)
  return s
}

function roads () {
  const s = new Stage(.04)
  s.box(40, .05, 4, 0, 0, 2, K.road)
  s.box(3.6, .05, 9, 15, 0, -4.5, K.road)
  s.box(3.6, .05, 11, 15, 0, 9.5, K.road)
  s.box(40, .04, 6, 0, 0, -12, '#dddeda', { edge: false })
  for (const z of [-.5, 4.5]) {
    s.box(33.2, .12, 1, -3.4, 0, z, K.walk)
    s.box(3.2, .12, 1, 18.4, 0, z, K.walk)
  }
  for (const x of [12.7, 17.3]) {
    s.box(1, .12, 8, x, 0, -5, K.walk)
    s.box(1, .12, 10, x, 0, 10, K.walk)
  }
  const paint = (w, d, x, z) => s.box(w, .012, d, x, .05, z, K.paint, { edge: false })
  for (let x = -19; x < 11; x += 2) paint(1, .08, x, 2)
  for (let z = 6.5; z < 15; z += 2) paint(.08, 1, 15, z)
  for (let z = -8.5; z < -1.5; z += 2) paint(.08, 1, 15, z)
  for (let z = .35; z < 3.9; z += .55) {
    paint(1.1, .3, 12.3, z)
    paint(1.1, .3, 17.7, z)
  }
  for (let x = 13.5; x < 16.7; x += .55) {
    paint(.3, 1.1, x, 4.8)
    paint(.3, 1.1, x, -.8)
  }
  paint(.12, 1.9, 11.4, 3)
  paint(.12, 1.9, 18.6, 1)
  // forecourt of the clinic
  s.box(2.6, .05, 9.4, -6.1, 0, 9.7, K.road)
  return s
}

function expressway () {
  const z = -11.5
  let s = new Stage(.1)
  for (const x of [-16, -8, 0, 8, 19]) {
    s.box(1.5, .25, 1.7, x, 0, z, K.concrete, { edge: false })
    s.box(1.1, 3.4, 1.3, x, .25, z, K.concrete)
    s.box(1.3, .35, 2.6, x, 3.65, z, K.concrete, { edge: false })
    s.box(1.3, .35, 4.6, x, 4, z, K.concrete)
  }
  s = new Stage(.14)
  s.box(40, .45, 5, 0, 4.35, z, '#dadcd8')
  s.box(40, .12, 5.2, 0, 4.25, z, '#c6c9c5', { edge: false })
  for (const dz of [-2.43, 2.43]) s.box(40, .5, .14, 0, 4.8, z + dz, '#e3e4e0')
  s.box(40, .3, .18, 0, 4.8, z, K.concrete, { edge: false })
  for (let x = -19; x < 20; x += 2.2) {
    s.box(1, .012, .07, x, 4.8, z + 1.25, K.paint, { edge: false })
    s.box(1, .012, .07, x, 4.8, z - 1.25, K.paint, { edge: false })
  }
  s = new Stage(.18)
  // sound wall, lights, the sign gantry and the roadside sensors the forecasting reads
  s.box(40, 1.25, .07, 0, 5.3, z - 2.43, '#c9dbe3')
  for (let x = -19; x <= 19; x += 2) s.box(.1, 1.3, .16, x, 5.3, z - 2.43, K.steel, { edge: false })
  for (let x = -18; x <= 18; x += 9) {
    lamp(s, x, 4.8, z, 0, 1.3, 2.3)
    lamp(s, x, 4.8, z, 0, -1.3, 2.3)
  }
  for (const dz of [-2.3, 2.3]) s.box(.18, 2.7, .18, 5, 4.8, z + dz, K.steel)
  s.box(.22, .3, 4.8, 5, 7.4, z, K.steel)
  for (const dz of [-1.2, 1.2]) {
    s.box(.08, 1.1, 2, 5.12, 6.2, z + dz, K.sign)
    s.box(.02, .1, 1.4, 5.17, 6.9, z + dz, K.paint, { edge: false })
    s.box(.02, .1, 1, 5.17, 6.6, z + dz - .2, K.paint, { edge: false })
  }
  for (const x of [-13, -4, 12]) {
    s.cyl(.04, .05, 1.7, x, 5.3, z + 2.43, K.steel, { seg: 6, edge: false })
    s.box(.34, .14, .16, x + .16, 6.95, z + 2.43, K.white)
    s.path([[x, 5.3, z + 2.43], [x, 7, z + 2.43]])
  }
}

function axa () {
  const x = -11, z = -5
  let s = new Stage(.2)
  s.box(7.8, .3, 7.4, x, 0, z, K.stone3)
  s.box(7.4, 2.3, 7, x, .3, z, K.stone2)
  s.box(7.7, .22, 7.3, x, 2.6, z, K.stone)
  s.box(3.4, .12, .9, x, 0, z + 3.9, K.stone3)
  s.box(2.8, 2.1, .3, x, .3, z + 3.55, K.stone3)
  s.pane(1.9, 1.6, .06, x, .35, z + 3.72, 'lit')
  s.box(3.2, .14, 1.2, x, 2.05, z + 4, K.axa)
  s.box(1.5, .4, .06, x, 2.2, z + 4.62, K.paint, { edge: false })
  for (const dx of [-2.75, -1.95, 1.95, 2.75]) s.pane(.5, 1.5, .06, x + dx, .7, z + 3.53)
  for (let i = 0; i < 6; i++) s.pane(.06, 1.5, .62, x + 3.73, .7, z - 2.7 + i * 1.08)
  for (const dx of [-3.4, 3.4]) {
    s.cyl(.035, .045, 3.4, x + dx, .12, z + 4.3, K.steel, { seg: 6, edge: false })
    s.box(.8, .45, .02, x + dx + .42, 3, z + 4.3, dx < 0 ? K.axa : K.white)
    s.path([[x + dx, .12, z + 4.3], [x + dx, 3.52, z + 4.3]])
  }
  s = new Stage(.25, .2)
  s.box(5.8, 10, 5.8, x, 2.82, z, K.stone)
  for (let i = 0; i <= 6; i++) {
    const u = -2.9 + i * 5.8 / 6
    s.box(.26, 10, .16, x + u, 2.82, z + 2.92, K.stone2)
    s.box(.16, 10, .26, x + 2.92, 2.82, z + u, K.stone2)
  }
  windows(s, x, 3, z, 5.8, 5.8, 6, 10, .98, { fill: .5, wh: .62 })
  s.box(6.2, .28, 6.2, x, 12.82, z, K.stone2)
  for (const dx of [-2.65, 2.65]) for (const dz of [-2.65, 2.65]) s.box(.5, .75, .5, x + dx, 13.1, z + dz, K.stone2)
  s = new Stage(.3, .2)
  s.box(4.5, 4.3, 4.5, x, 13.1, z, K.stone)
  for (const dx of [-2.2, 2.2]) for (const dz of [-2.2, 2.2]) s.box(.4, 4.3, .4, x + dx, 13.1, z + dz, K.stone2, { edge: false })
  windows(s, x, 13.3, z, 4.5, 4.5, 4, 4, 1, { fill: .5 })
  s.box(4.9, .24, 4.9, x, 17.4, z, K.stone2)
  s.box(3.2, 2.1, 3.2, x, 17.64, z, K.stone)
  windows(s, x, 17.8, z, 3.2, 3.2, 3, 2, .9, { fill: .5 })
  s.box(3.5, .2, 3.5, x, 19.74, z, K.stone2)
  s.cyl(.3, 2.2, 1.9, x, 19.94, z, K.stone2, { seg: 4, ry: PI / 4 })
  s.cyl(.03, .08, 2.8, x, 21.84, z, K.steel, { seg: 6, edge: false })
  s.path([[x, 21.84, z], [x, 24.64, z]])
  s.ball(.12, x, 24.7, z, K.red, { kind: 'lit', edge: false, detail: 1 })
}

export const crane = { jib: null }
function site () {
  const x = -1.5, z = -5
  let s = new Stage(.34)
  s.box(10.2, .06, 7.4, -.9, 0, z, K.dirt)
  // hoarding
  const fence = (w, d, fx, fz) => {
    s.box(w, .95, d, fx, .06, fz, K.white)
    s.box(w + .01, .16, d + .01, fx, .55, fz, '#6f9bd1', { edge: false })
  }
  fence(5.2, .06, -3.4, -1.4)
  fence(2.6, .06, 2.9, -1.4)
  fence(.06, 7.2, 4.2, z)
  fence(.06, 7.2, -6, z)
  fence(10.2, .06, -.9, -8.6)
  s.box(2, 13.8, 2, -3.9, .06, -6.9, K.concrete)
  s.box(2.2, .2, 2.2, -3.9, 13.86, -6.9, '#bfc2bd', { edge: false })
  const fl = 1.3
  for (let i = 0; i < 9; i++) {
    s.box(7, .18, 6, x, fl * (i + 1) - .18, z, K.slabs)
    for (const cx of [-4.7, -2.57, -.43, 1.7]) {
      for (const cz of [-7.7, -5, -2.3]) s.box(.24, 1.12, .24, cx, fl * i, cz, K.concrete, { edge: cx === 1.7 || cz === -2.3 })
    }
  }
  // rebar waiting for the next pour
  const top = fl * 9
  for (const cx of [-4.7, -2.57, -.43, 1.7]) {
    for (const cz of [-7.7, -5, -2.3]) {
      for (const [a, b] of [[-.08, -.08], [.08, -.08], [-.08, .08], [.08, .08]]) s.line([cx + a, top, cz + b, cx + a, top + .9, cz + b])
    }
  }
  s.box(1, .55, .7, 3.5, .06, -2.4, K.wood)
  s.box(.9, .35, .7, 3.5, .61, -2.4, K.wood, { edge: false })
  s.box(1, 1, 2.2, 3.5, .06, -4.3, '#e9e9e4')
  s.pane(.05, .4, .8, 4.02, .5, -4.3)
  for (let i = 0; i < 3; i++) s.geo(new THREE.CylinderGeometry(.13, .13, 2.4, 8), '#aeb6bd', { x: -1 + i * .28, y: .2, z: -1.85, rz: PI / 2, edge: false })

  s = new Stage(.38, .2)
  // curtain wall going on from the bottom up, unfinished towards the top
  const bays = [6, 6, 6, 5, 3, 1]
  bays.forEach((n, i) => { for (let b = 0; b < n; b++) s.pane(1.04, 1.02, .06, x - 3.5 + (b + .5) * 7 / 6, fl * i + .05, z + 3.02) })
  const baysX = [5, 5, 5, 3]
  baysX.forEach((n, i) => { for (let b = 0; b < n; b++) s.pane(.06, 1.02, 1.08, x + 3.52, fl * i + .05, z + 3 - (b + .5) * 1.2) })
  s.box(2.3, 1.15, .04, .8, fl * 6, z + 3.04, K.tarp)
  // edge protection on the open floors
  for (let i = 5; i < 9; i++) {
    const y = fl * (i + 1)
    s.path([[x - 3.5, y + .5, z + 3], [x + 3.5, y + .5, z + 3]])
    for (let b = 0; b <= 6; b++) s.line([x - 3.5 + b * 7 / 6, y, z + 3, x - 3.5 + b * 7 / 6, y + .5, z + 3])
  }
  // scaffolding up the street side
  const sx = [x + 3.62, x + 4.22], zs = [-8, -6.5, -5, -3.5, -2]
  for (const a of sx) for (const b of zs) s.line([a, .06, b, a, 12.6, b])
  for (let i = 1; i <= 9; i++) {
    const y = fl * i
    for (const a of sx) s.line([a, y, -8, a, y, -2])
    for (const b of zs) s.line([sx[0], y, b, sx[1], y, b])
    s.line([sx[1], y + .55, -8, sx[1], y + .55, -2])
    if (i > 3) s.box(.6, .05, 6, x + 3.92, y, z, K.wood, { edge: false })
  }
  for (let i = 0; i < 9; i++) {
    const k = i % 4
    s.line([sx[1], fl * i, zs[k], sx[1], fl * (i + 1), zs[k + 1 > 4 ? 3 : k + 1]])
  }

  s = new Stage(.42, .22)
  // tower crane: lattice mast, then the jib, which scene.js slews
  const mx = 3.3, mz = -7.6, mh = 18
  s.box(1.4, .3, 1.4, mx, .06, mz, K.concrete)
  const legs = [[-.3, -.3], [.3, -.3], [.3, .3], [-.3, .3]]
  for (const [a, b] of legs) s.box(.08, mh, .08, mx + a, .36, mz + b, K.crane, { edge: false })
  for (let i = 0; i < 4; i++) {
    const a = legs[i], b = legs[(i + 1) % 4]
    s.line([mx + a[0], .36, mz + a[1], mx + a[0], mh + .36, mz + a[1]])
    s.path(zig([[mx + a[0], .36, mz + a[1]], [mx + a[0], mh + .36, mz + a[1]]], [[mx + b[0], .36, mz + b[1]], [mx + b[0], mh + .36, mz + b[1]]], 24))
  }
  s.box(.95, .35, .95, mx, mh + .36, mz, K.dark)

  const j = crane.jib = new Stage(.46, .2)
  j.root.position.set(mx, mh + .71, mz)
  j.box(.7, .3, .7, 0, 0, 0, K.crane)
  j.box(.6, .6, .7, .55, -.45, .5, K.white)
  j.pane(.5, .34, .05, .55, -.3, .88, 'lit')
  // A-frame
  j.cyl(.05, .05, 2.6, 0, .3, 0, K.crane, { seg: 6, edge: false })
  j.path([[-.3, .3, 0], [0, 2.9, 0], [.3, .3, 0]])
  // jib truss
  const L = 12.5
  for (const dz of [-.3, .3]) j.box(L, .07, .07, L / 2, .3, dz, K.crane, { edge: false })
  j.box(L, .07, .07, L / 2, .95, 0, K.crane, { edge: false })
  for (const dz of [-.3, .3]) {
    j.line([0, .33, dz, L, .33, dz])
    j.path(zig([[0, .33, dz], [L, .33, dz]], [[0, .98, 0], [L, .98, 0]], 26))
  }
  j.line([0, .98, 0, L, .98, 0])
  j.path(zig([[0, .33, -.3], [L, .33, -.3]], [[0, .33, .3], [L, .33, .3]], 26))
  // counter-jib and ballast
  j.box(4.6, .12, .6, -2.3, .3, 0, K.crane)
  j.box(.7, .8, .66, -3.5, -.5, 0, K.concrete)
  j.box(.7, .8, .66, -4.25, -.5, 0, K.concrete)
  j.path([[-4.4, .42, 0], [0, 2.9, 0], [7.6, 1, 0]])
  j.path([[0, 2.9, 0], [3.2, 1, 0]])
  // trolley, hoist rope and a load of beams
  j.box(.45, .16, .5, 8, .1, 0, K.dark)
  j.line([8, .1, 0, 8, -4.7, 0])
  j.box(.22, .28, .22, 8, -5, 0, K.crane)
  j.path([[7.3, -5.7, 0], [8, -5, 0], [8.7, -5.7, 0]])
  for (const dz of [-.12, .12]) j.box(1.9, .14, .14, 8, -5.9, dz, K.steel)
}

export const billboard = { mesh: null }
export const lift = { s: null }
function seekers () {
  const x = 8.5, z = -5
  let s = new Stage(.48, .2)
  // glazed ground floor behind a colonnade
  s.box(6.3, 1.7, 5.3, x, .12, z, '#e9e2d8')
  for (const dx of [-3.35, 3.35]) for (const dz of [-2.85, 2.85]) s.box(.3, 1.7, .3, x + dx, .12, z + dz, K.cream)
  s.box(7, .12, 6, x, 0, z, K.walk, { edge: false })
  for (let i = 0; i < 5; i++) s.pane(1.04, 1.35, .06, x - 2.6 + i * 1.3, .22, z + 2.68, i === 2 ? 'lit' : 'glass')
  for (let i = 0; i < 4; i++) s.pane(.06, 1.35, 1.04, x + 3.18, .22, z - 1.95 + i * 1.3)
  s.box(6.7, .08, 1, x, 1.62, z + 3.3, K.coral, { rx: .16 })
  // office floors: cream spandrels and ribbon windows
  const fl = 1.15
  for (let i = 0; i < 6; i++) {
    const y = 1.82 + fl * i
    s.box(7, .4, 6, x, y, z, K.cream)
    s.box(6.8, .75, 5.8, x, y + .4, z, '#d3dbe1', { edge: false })
    for (let b = 0; b < 6; b++) s.pane(1.03, .67, .05, x - 3.5 + (b + .5) * 7 / 6, y + .44, z + 2.93)
    for (let b = 0; b < 5; b++) s.pane(.05, .67, 1.06, x + 3.43, y + .44, z + 3 - (b + .5) * 1.2)
  }
  s.box(7, .45, 6, x, 1.82 + fl * 6, z, K.cream)
  s.box(.14, 3.4, .75, x + 3.6, 4.6, z + 2.3, K.coral)
  s.box(.16, 7.3, .3, x - 2.3, 1.82, z + 3.06, K.coral)

  s = new Stage(.53, .2)
  const y = 1.82 + fl * 6 + .45
  // the top two floors slide out over the street corner
  s.box(5.4, 2.5, 6.6, x + 1.6, y, z, '#f7f1e9')
  for (let b = 0; b < 4; b++) s.pane(1.14, 1.75, .05, x - .9 + (b + .5) * 1.25, y + .38, z + 3.33)
  for (let b = 0; b < 5; b++) s.pane(.05, 1.75, 1.1, x + 4.33, y + .38, z + 3.1 - (b + .5) * 1.24)
  s.box(5.7, .16, 6.9, x + 1.6, y + 2.5, z, K.cream)
  // roof terrace on what is left
  const rail = [[x - 3.5, y + .55, z + 3], [x - 1.1, y + .55, z + 3]]
  s.path([[x - 3.5, y + .55, z - 3], ...rail])
  for (let i = 0; i <= 4; i++) s.line([x - 3.5, y, z - 3 + i * 1.5, x - 3.5, y + .55, z - 3 + i * 1.5])
  for (let i = 0; i <= 2; i++) s.line([x - 3.5 + i * 1.2, y, z + 3, x - 3.5 + i * 1.2, y + .55, z + 3])
  s.box(1.9, .32, .42, x - 2.3, y, z + 2.5, '#cdbfa8')
  for (let i = 0; i < 3; i++) s.ball(.28, x - 2.9 + i * .6, y + .5, z + 2.5, pick(K.greens), { ry: rnd() * 3 })
  s.cyl(.03, .03, 1.3, x - 2.4, y, z + .6, K.dark, { seg: 6, edge: false })
  s.geo(new THREE.ConeGeometry(.85, .35, 8).translate(0, .17, 0), K.coral, { x: x - 2.4, y: y + 1.25, z: z + .6 })
  s.cyl(.4, .4, .05, x - 2.4, y + .5, z + .6, K.white, { edge: false })
  s.box(1.2, .55, .9, x - 2.3, y, z - 2, '#c9ced2')
  s.box(.9, .5, .7, x + .2, y + 2.66, z - 2.2, '#c9ced2')
  // billboard
  const by = y + 2.66
  for (const dx of [-1.6, 1.6]) {
    s.cyl(.05, .05, .75, x + 1.6 + dx, by, z + 2.6, K.steel, { seg: 6, edge: false })
    s.path([[x + 1.6 + dx, by, z + 2.6], [x + 1.6 + dx, by + 1.6, z + 2.6], [x + 1.6 + dx, by, z + 1.5]])
  }
  s.box(4.8, 1.7, .14, x + 1.6, by + .7, z + 2.6, K.white)
  const cv = Object.assign(document.createElement('canvas'), { width: 1024, height: 320 }), g = cv.getContext('2d')
  g.fillStyle = '#fbf8f1'
  g.fillRect(0, 0, 1024, 320)
  g.fillStyle = '#d9694a'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = '700 150px "Instrument Sans", system-ui, sans-serif'
  g.fillText('NOW HIRING', 512, 135)
  g.fillStyle = '#3a4350'
  g.font = '500 46px "JetBrains Mono", ui-monospace, monospace'
  g.fillText('matched by AI in minutes', 512, 262)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  const m = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.5), new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ffffff', emissiveIntensity: 0, transparent: true, opacity: 0 }))
  m.position.set(x + 1.6, by + 1.55, z + 2.68)
  s.group.add(m)
  s.extras.push(m)
  billboard.mesh = m
  // glass lift on the street front; scene.js runs it up and down the coral fin
  const l = lift.s = new Stage(.55, .2)
  l.box(.9, .06, .5, 0, 0, 0, K.dark, { edge: false })
  l.box(.9, .06, .5, 0, 1.06, 0, K.dark, { edge: false })
  l.pane(.86, 1, .04, 0, .06, .23, 'lit')
  for (const dx of [-.43, .43]) l.line([dx, .06, .23, dx, 1.06, .23, dx, .06, -.23, dx, 1.06, -.23])
  l.root.position.set(x - 2.3, 2, z + 3.5)
}

function clinic () {
  const s = new Stage(.6, .2)
  const x = -12.2, z = 9.6
  s.box(8, 2.7, 4.4, x, .1, z, K.white)
  s.box(8.2, .3, 4.6, x, 2.8, z, K.mint)
  s.box(4, 4.5, 4.2, x - 4.4, .1, z - 1.4, K.white)
  s.box(4.2, .3, 4.4, x - 4.4, 4.6, z - 1.4, K.mint)
  s.box(12.6, .1, 7.4, x - 1.3, 0, z + .4, K.walk, { edge: false })
  // cross on the taller wing, facing the street corner
  s.box(.1, 1.05, .32, x - 2.36, 3.3, z - 1.4, K.red)
  s.box(.1, .32, 1.05, x - 2.36, 3.67, z - 1.4, K.red)
  for (let i = 0; i < 6; i++) s.pane(.92, 1.35, .06, x - 3.3 + i * 1.32, .8, z + 2.23)
  for (let i = 0; i < 2; i++) for (let r = 0; r < 2; r++) s.pane(.8, 1.1, .06, x - 5.75 + i * 1.15, .9 + r * 2, z + .73)
  // entrance on the forecourt side
  s.pane(.06, 2, 1.9, x + 4.03, .12, z, 'lit')
  for (const dz of [-1.65, 1.65]) s.pane(.06, 1.3, .8, x + 4.03, .8, z + dz)
  s.box(2.1, .14, 2.9, x + 5, 2.2, z, K.mint)
  for (const dz of [-1.25, 1.25]) {
    s.cyl(.07, .07, 2.1, x + 5.85, .1, z + dz, K.white, { seg: 8, edge: false })
    s.line([x + 5.85, .1, z + dz, x + 5.85, 2.2, z + dz])
  }
  // roof: solar, plant
  for (let i = 0; i < 4; i++) for (let r = 0; r < 2; r++) s.box(1.45, .05, .8, x - 2.4 + i * 1.6, 3.2, z - 1 + r * 1.3, '#2f4466', { rx: -.32 })
  s.box(.9, .5, .6, x + 3, 3.1, z + 1.3, '#c9ced2')
  // sign by the road
  s.cyl(.06, .06, 2.7, -7.8, .12, 5.6, K.steel, { seg: 6, edge: false })
  s.box(1, 1, .14, -7.8, 2.7, 5.6, K.white)
  s.box(.5, .16, .16, -7.8, 3.12, 5.6, K.red, { edge: false })
  s.box(.16, .5, .16, -7.8, 2.95, 5.6, K.red, { edge: false })
  s.line([-7.8, .12, 5.6, -7.8, 2.7, 5.6])
  // garden
  s.box(7.6, .38, .45, x, .1, z + 3, K.greens[1])
  s.box(12.6, .1, 2, x - 1.3, 0, 14, K.grass)
  s.box(1.3, .07, .36, x + 1, .45, 13.3, K.wood)
  for (const dx of [-.5, .5]) s.box(.07, .35, .3, x + 1 + dx, .1, 13.3, K.dark, { edge: false })
  // the ambulance is its own piece: scene.js drives it in from the street
  const a = ambulance.s = new Stage(.62, .2)
  van(a, 0, .05, 0, 0, K.white, K.red)
  a.box(.5, .1, .26, -.2, .97, 0, K.red, { edge: false })
}

export const ambulance = { s: null }
export const lot = { cars: [] }
function carLot () {
  const s = new Stage(.68, .2)
  s.box(16.5, .06, 8.5, 3.75, 0, 10.25, '#d8d9d5')
  const rows = [7.5, 10.25, 13]
  rows.forEach((z, r) => {
    for (let i = 0; i < 9; i++) {
      const x = -3.2 + i * 1.5
      s.box(.05, .012, 1.9, x - .75, .06, z, K.paint, { edge: false })
      if (r === 0 && i > 6) continue
      if (rnd() < .12) continue
      car(s, x, .06, z, PI / 2 * (r === 1 ? -1 : 1), pick(CARS))
      lot.cars.push([x, z])
    }
    s.box(.05, .012, 1.9, -3.2 + 9 * 1.5 - .75, .06, z, K.paint, { edge: false })
  })
  // sales pavilion
  s.box(2.8, 1.5, 2.2, 10.4, .06, 7.4, K.white)
  for (let i = 0; i < 2; i++) s.pane(1.1, 1.1, .06, 9.8 + i * 1.2, .26, 8.53, i ? 'lit' : 'glass')
  s.pane(.06, 1.1, 1.6, 11.83, .26, 7.4)
  s.box(3.6, .12, 3, 10.4, 1.56, 7.4, K.dark)
  s.box(2.3, .5, .1, 10.4, 1.68, 8.7, K.yellow)
  // the one on the turntable
  s.cyl(1.2, 1.2, .2, 10.6, .06, 12.4, K.white, { seg: 24 })
  car(s, 10.6, .26, 12.4, .6, '#c9534a')
  lot.cars.push([10.6, 12.4])
  s.cyl(.07, .07, 3.5, -3.9, .06, 14, K.steel, { seg: 6, edge: false })
  s.box(1.7, 1, .14, -3.9, 3.5, 14, K.yellow)
  s.line([-3.9, .06, 14, -3.9, 3.5, 14])
  const poles = [[0, 8.9], [6, 8.9], [0, 11.6], [6, 11.6]]
  for (const [x, z] of poles) {
    lamp(s, x, .06, z, .7, 0, 3)
    lamp(s, x, .06, z, -.7, 0, 3)
  }
  // bunting
  const flags = ['#d9534a', '#f0c75e', '#5d8fd6', '#9cc3b1']
  for (const [a, b] of [[poles[0], poles[1]], [poles[2], poles[3]], [poles[1], [10.4, 7.4]]]) {
    const pts = []
    for (let i = 0; i <= 10; i++) {
      const t = i / 10, y = 3.06 - (poles.includes(b) ? 0 : 1.3 * t) - Math.sin(t * PI) * .35
      const p = [a[0] + (b[0] - a[0]) * t, y, a[1] + (b[1] - a[1]) * t]
      pts.push(p)
      if (i && i < 10) s.box(.16, .16, .02, p[0], p[1] - .17, p[2], flags[i % 4], { edge: false })
    }
    s.path(pts)
  }
}

function furniture () {
  const s = new Stage(.76, .2)
  for (let x = -18; x <= 10; x += 7) lamp(s, x, .12, -.2, 0, .9)
  lamp(s, 17.4, .12, 8, -.9, 0)
  lamp(s, 12.6, .12, -6, .9, 0)
  // utility poles and their wires, because this is Tokyo
  const px = [-18, -11, -4, 3, 10]
  for (const x of px) {
    s.cyl(.06, .085, 3.7, x, .12, 4.8, '#8a8377', { seg: 6, edge: false })
    s.box(.06, .06, 1.1, x, 3.4, 4.8, '#8a8377', { edge: false })
    s.box(.06, .06, .7, x, 2.9, 4.8, '#8a8377', { edge: false })
    if (x % 2) s.cyl(.17, .17, .5, x + .2, 2.2, 4.8, '#a3abb1', { seg: 8 })
    s.line([x, .12, 4.8, x, 3.82, 4.8, x, 3.43, 4.25, x, 3.43, 5.35])
  }
  for (let i = 0; i < px.length - 1; i++) {
    for (const [dz, y] of [[-.5, 3.46], [0, 3.46], [.5, 3.46], [-.3, 2.96], [.3, 2.96]]) {
      const pts = []
      for (let k = 0; k <= 8; k++) pts.push([px[i] + (px[i + 1] - px[i]) * k / 8, y - Math.sin(k / 8 * PI) * .22, 4.8 + dz])
      s.path(pts)
    }
  }
  // signals at the crossing
  for (const [x, z, dx, dz] of [[12.7, -.5, 0, 2.2], [17.3, 4.5, 0, -2.2]]) {
    s.cyl(.05, .06, 3.1, x, .12, z, K.dark, { seg: 6, edge: false })
    s.box(.05, .05, Math.abs(dz), x, 3.15, z + dz / 2, K.dark, { edge: false })
    s.box(.16, .2, .5, x + dx, 2.9, z + dz, K.dark)
    for (const [k, c] of [[-.15, '#ff7a6b'], [0, '#ffd166'], [.15, '#7be0a0']]) s.ball(.055, x + dx + .09, 3, z + dz + k, c, { kind: 'lit', edge: false, detail: 1 })
    s.path([[x, .12, z], [x, 3.2, z], [x, 3.2, z + dz]])
  }
  // vending machines
  for (const [x, c] of [[11.1, '#d9534a'], [11.7, '#4a7fc9']]) {
    s.box(.5, .98, .42, x, .12, -.72, c)
    s.box(.4, .5, .03, x, .5, -.5, '#f4f8ff', { kind: 'lit', edge: false })
  }
  // bus stop
  s.box(2.3, .07, .85, 1.5, 1.62, 4.35, K.dark)
  for (const dx of [-1.05, 1.05]) s.box(.06, 1.5, .06, 1.5 + dx, .12, 4.7, K.dark, { edge: false })
  s.pane(2.1, 1.1, .04, 1.5, .4, 4.72, 'dark')
  s.box(1.5, .06, .3, 1.5, .5, 4.5, K.wood)
  s.cyl(.03, .03, 1.8, 3, .12, 4.3, K.steel, { seg: 6, edge: false })
  s.geo(new THREE.CylinderGeometry(.2, .2, .04, 14), '#4a7fc9', { x: 3, y: 1.95, z: 4.3, rx: PI / 2 })
  // post box, benches, bollards
  s.cyl(.05, .05, .5, -8.6, .12, -.6, K.red, { seg: 6, edge: false })
  s.box(.34, .5, .3, -8.6, .6, -.6, K.red)
  for (const x of [-15, -1.5, 6]) {
    s.box(1.2, .06, .34, x, .47, -.75, K.wood)
    for (const dx of [-.45, .45]) s.box(.06, .35, .28, x + dx, .12, -.75, K.dark, { edge: false })
  }
  for (const [x, z] of [[12.35, -.15], [12.35, 4.15], [17.65, -.15], [17.65, 4.15]]) s.cyl(.06, .06, .5, x, .12, z, K.yellow, { seg: 8, edge: false })
  // green edges
  s.box(2.2, .1, 8, 18.9, 0, -5, K.grass)
  s.box(2.2, .1, 10, 18.9, 0, 10, K.grass)
  s.box(4.6, .1, 7.4, -17.3, 0, -5, K.grass)
  s.box(1.6, .5, 1.6, -17.3, .1, -5, K.stone)
  s.geo(new THREE.TorusKnotGeometry(.5, .13, 48, 6), '#c9ced2', { x: -17.3, y: 1.45, z: -5 })
}

function trees () {
  const s = new Stage(.8, .2)
  const spots = [
    [-16.5, -.6], [-13.2, -.6], [-6.4, -.6], [-.2, -.6], [4.4, -.6], [8.2, -.6],
    [-14.5, 4.4], [-7.5, 4.4], [-.6, 4.4], [6.6, 4.4],
    [18.9, -7.6], [18.6, -4.6], [19.2, -2.2], [18.9, 6.2], [19.1, 9.4], [18.6, 12.6],
    [-18.6, -7.2], [-15.8, -7.4], [-18.8, -2.8], [-15.9, -2.6],
    [-17.6, 13.6], [-9, 13.9], [-13, 14.3], [12.8, 13.8]
  ]
  spots.forEach(([x, z], i) => tree(s, x, .1, z, .8 + rnd() * .45, i % 7 === 3 ? K.pink : pick(K.greens)))
}

export const traffic = []
function vehicles () {
  const lanes = [[-10.25, 1, 4.8, true], [-12.75, -1, 4.8, true], [1, 1, .05, false], [3, -1, .05, false]]
  const kinds = [car, car, bus, car, truck, car, car, van, car]
  lanes.forEach(([z, dir, y, fast], li) => {
    const n = fast ? 5 : 3
    for (let i = 0; i < n; i++) {
      const s = new Stage(.84, .16), kind = fast ? kinds[(i * 2 + li) % kinds.length] : (i === 1 && li === 2 ? van : car)
      kind(s, 0, 0, 0, dir > 0 ? 0 : PI, pick(CARS))
      s.root.position.set(-20 + (i + rnd() * .6) * 40 / n, y, z)
      traffic.push({ s, dir, v: fast ? 3.2 + rnd() * 1.6 : 1.3 + rnd() * .5, fast })
    }
  })
}

export function buildBlock (scene) {
  // stages remember which project they belong to, so a stop can open up its own building
  const part = (key, fn) => {
    const n = stages.length
    fn()
    for (const s of stages.slice(n)) s.key = key
  }
  sheet()
  roads()
  part('nexco', expressway)
  part('axa', axa)
  part('site', site)
  part('seekers', seekers)
  part('kokoromil', clinic)
  part('cars', carLot)
  furniture()
  trees()
  vehicles()
  for (const s of stages) s.done(scene)
}

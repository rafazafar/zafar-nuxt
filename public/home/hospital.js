// The 0-to-1 chapter: one clinic floor, run like a management game.
// Patients queue at the door and walk the rooms; each slide changes the floor and the queue shows the result.
import * as THREE from 'three'

const C = new THREE.Color()
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = k => k * k * (3 - 2 * k)
const mix = (a, b, t) => a + (b - a) * t
const AT = [-13.5, 0, 10]
const Y = .14
// a 4 x 2 grid of rooms either side of one corridor (z = 0); the door is on the +x wall
const CELL = { B0: [-4.5, -1.75], B1: [-1.5, -1.75], B2: [1.5, -1.75], B3: [4.5, -1.75], F0: [-4.5, 1.75], F1: [-1.5, 1.75], F2: [1.5, 1.75], F3: [4.5, 1.75] }
// a: where the first build put it, b: where it belongs. Listed in the order the inspector walks them
const ROOMS = [
  ['R', 'Reception', 'B0', 'F3', '#dbe7e1', 'Scoped'],
  ['P', 'Pharmacy', 'F0', 'B3', '#efe4d6', 'Specified'],
  ['IT', 'Systems', 'B1', 'F0', '#dfe2e6', 'Secured'],
  ['L', 'Lab', 'F1', 'B1', '#e4e0ec', 'Tested'],
  ['W', 'Ward', 'B2', 'B0', '#e3ece6', 'Compliant'],
  ['Q', 'Waiting', 'F2', 'F2', '#e6e3da', 'Documented'],
  ['S', 'Stores', 'B3', 'F1', '#e9e6de', 'Audited'],
  ['C', 'Consulting', 'F3', 'B2', '#dde5ee', 'Approved']
]
const CAP = 8, POOL = 30
const TONES = ['#e58f76', '#5d8fd6', '#f0c75e', '#7fbf9a', '#b9a5c9', '#d9b38c', '#8fa3b8', '#c98f8f']

// merged solids plus their outline, so a part can be shown as wireframe or built
class Piece {
  constructor (parent) {
    this.p = []
    this.n = []
    this.c = []
    this.e = []
    this.group = new THREE.Group()
    parent.add(this.group)
  }

  box (w, h, d, x, y, z, color, edge = true) {
    const g = new THREE.BoxGeometry(w, h, d).translate(x, y + h / 2, z).toNonIndexed()
    const pa = g.attributes.position.array, na = g.attributes.normal.array
    C.set(color)
    for (let i = 0; i < pa.length; i += 3) {
      this.p.push(pa[i], pa[i + 1], pa[i + 2])
      this.n.push(na[i], na[i + 1], na[i + 2])
      this.c.push(C.r, C.g, C.b)
    }
    if (edge) this.e.push(...new THREE.EdgesGeometry(g, 28).attributes.position.array)
    return this
  }

  done () {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3))
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3))
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3))
    this.mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .9, transparent: true, opacity: 0 }))
    this.mesh.receiveShadow = true
    const l = new THREE.BufferGeometry()
    l.setAttribute('position', new THREE.Float32BufferAttribute(this.e, 3))
    this.lines = new THREE.LineSegments(l, new THREE.LineBasicMaterial({ transparent: true, opacity: 0 }))
    this.group.add(this.mesh, this.lines)
    this.p = this.n = this.c = this.e = null
    return this
  }

  // s: built, w: drawn as wireframe
  set (s, w, on, ink, soft) {
    const m = this.mesh.material, op = s * on
    m.opacity = op
    m.transparent = op < .999
    m.depthWrite = op > .5
    this.mesh.visible = op > .004
    this.mesh.castShadow = op > .5
    const lo = Math.max(w * .9, s * .3) * on
    this.lines.visible = lo > .004
    this.lines.material.opacity = lo
    this.lines.material.color.copy(ink).lerp(soft, s)
  }
}

const lineOf = v => {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }))
  l.frustumCulled = false
  return l
}
// a flat strip along a polyline, in short pieces so it can be dashed or drawn in gradually
const ribbon = (pts, w, dash) => {
  const v = []
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], len = a.distanceTo(b), n = Math.max(1, Math.round(len / .22))
    const nx = -(b.z - a.z) / len * w / 2, nz = (b.x - a.x) / len * w / 2
    for (let j = 0; j < n; j++) {
      if (dash && j % 2) continue
      const u0 = j / n, u1 = (j + (dash ? .8 : 1)) / n
      const x0 = mix(a.x, b.x, u0), z0 = mix(a.z, b.z, u0), x1 = mix(a.x, b.x, u1), z1 = mix(a.z, b.z, u1)
      v.push(x0 - nx, a.y, z0 - nz, x0 + nx, a.y, z0 + nz, x1 + nx, a.y, z1 + nz, x0 - nx, a.y, z0 - nz, x1 + nx, a.y, z1 + nz, x1 - nx, a.y, z1 - nz)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3))
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }))
  m.userData.n = v.length / 3
  m.frustumCulled = false
  return m
}
const dots = (n, size, vertexColors) => {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3))
  if (vertexColors) g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3))
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size, transparent: true, opacity: 0, depthWrite: false, vertexColors: !!vertexColors }))
  p.frustumCulled = false
  return p
}

// text for the floor: room names in ink, stamps boxed
function floorText (word, boxed) {
  const c = Object.assign(document.createElement('canvas'), { width: 512, height: boxed ? 160 : 96 }), g = c.getContext('2d')
  g.strokeStyle = g.fillStyle = '#fff'
  if (boxed) {
    g.lineWidth = 12
    g.beginPath()
    g.roundRect(10, 10, 492, 140, 14)
    g.stroke()
  }
  g.font = `${boxed ? 600 : 500} ${boxed ? 60 : 54}px "JetBrains Mono", ui-monospace, monospace`
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.letterSpacing = boxed ? '8px' : '10px'
  g.fillText(word.toUpperCase(), 260, boxed ? 84 : 50)
  const t = new THREE.CanvasTexture(c)
  t.anisotropy = 8
  return t
}
const decal = (tex, w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }))

// room interiors, drawn with the corridor on local +z
const white = '#f6f6f2', mint = '#9cc3b1', steel = '#8fa3b8', dark = '#3f4a5a', wood = '#d9b38c'
const FIT = {
  R: p => p.box(.95, .4, .4, -.55, .04, .2, mint).box(.5, .7, .3, 1, .04, -.95, '#c9ced2'),
  P: p => p.box(1.9, .4, .3, 0, .04, .3, wood).box(2.2, .7, .25, 0, .04, -.95, steel).box(.25, .5, .9, -1.1, .04, -.3, steel),
  IT: p => p.box(1, .35, .4, .7, .04, .5, '#c9ced2'),
  L: p => p.box(2, .4, .35, 0, .04, -.9, '#c9ced2').box(.4, .3, .3, -.6, .44, -.9, dark).box(.3, .4, .3, .5, .44, -.9, steel).box(.9, .4, .35, -.6, .04, .3, '#c9ced2'),
  W: p => {
    for (const x of [-.85, 0, .85]) p.box(.5, .25, 1.1, x, .04, -.55, white).box(.52, .06, .65, x, .29, -.35, mint, false)
  },
  Q: p => {
    for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) p.box(.28, .26, .28, -.9 + i * .45, .04, -.8 + r * .7, steel, false)
  },
  S: p => p.box(2.2, .8, .3, 0, .04, -.95, steel).box(.3, .8, 1.2, -1.1, .04, -.2, steel).box(.5, .35, .5, .5, .04, 0, wood).box(.4, .3, .4, .1, .04, .35, wood),
  C: p => {
    for (const x of [0, .8]) p.box(.5, .35, .3, x, .04, -.15, wood).box(.42, .22, .9, x, .04, -.75, white)
  }
}

export function buildHospital (scene, body, rnd) {
  const root = new THREE.Group()
  root.position.set(...AT)
  root.visible = false
  scene.add(root)

  // the plot: slab, two tall walls at the back, kerbs at the front, a gap for the door
  const shell = new Piece(root)
    .box(12.6, .1, 7.6, 0, 0, 0, '#e6e6e0')
    .box(12.4, .02, 1.1, 0, .1, 0, '#f1f1ec', false)
    .box(12.6, .8, .1, 0, .1, -3.75, white)
    .box(.1, .8, 7.6, -6.25, .1, 0, white)
    .box(12.6, .22, .1, 0, .1, 3.75, white)
    .box(.1, .22, 3.05, 6.25, .1, -2.27, white)
    .box(.1, .22, 3.05, 6.25, .1, 2.27, white)
    .box(.12, 1.1, .12, 6.25, .1, -.75, steel, false)
    .box(.12, 1.1, .12, 6.25, .1, .75, steel, false)
    .done()
  shell.s = shell.w = 0

  // the napkin version: plot, eight rooms, a door, every line drawn twice
  const napV = []
  const rect = (x, z, w, d) => {
    for (let k = 0; k < 2; k++) {
      const j = () => (rnd() - .5) * .26, a = w / 2, b = d / 2
      const c = [[x - a + j(), z - b + j()], [x + a + j(), z - b + j()], [x + a + j(), z + b + j()], [x - a + j(), z + b + j()]]
      c.forEach((q, i) => napV.push(q[0], Y, q[1], c[(i + 1) % 4][0], Y, c[(i + 1) % 4][1]))
    }
  }
  rect(0, 0, 12.6, 7.6)
  for (const [x, z] of Object.values(CELL)) rect(x, z, 2.5, 2.2)
  napV.push(6, Y, -.7, 7.2, Y, -.9, 6, Y, .7, 7.3, Y, .8)
  const nap = lineOf(napV)
  root.add(nap)

  const rooms = ROOMS.map(([id, name, a, b, tint, word], i) => {
    const r = { id, i, a: CELL[a], b: CELL[b], aa: CELL[a][1] > 0 ? Math.PI : 0, ab: CELL[b][1] > 0 ? Math.PI : 0, v: 0, r: 0, x: 0, z: 0, ang: 0, lift: 0, cos: 1, sin: 0 }
    r.piece = new Piece(root)
      .box(2.7, .04, 2.4, 0, 0, 0, tint)
      .box(2.7, .3, .06, 0, .04, -1.17, white)
      .box(.06, .3, 2.4, -1.32, .04, 0, white)
      .box(.06, .3, 2.4, 1.32, .04, 0, white)
    FIT[id](r.piece)
    if (id === 'IT') for (const x of [-.7, -.15, .4]) r.piece.box(.42, .75, .5, x, .04, -.8, dark)
    r.piece.done()
    r.group = r.piece.group
    r.label = decal(floorText(name), 1.5, .28)
    r.label.position.set(0, .05, .98)
    r.stamp = decal(floorText(word, true), .95, .3)
    r.stamp.position.set(.75, .055, .5)
    r.sv = 0
    r.group.add(r.label, r.stamp)
    return r
  })
  const by = Object.fromEntries(rooms.map(r => [r.id, r]))
  // the proof of concept is one desk, one bed and a monitor: the corner of what becomes Consulting
  const core = new Piece(root).box(.5, .35, .3, -.8, .04, -.15, wood).box(.42, .22, .9, -.8, .04, -.75, white).box(.05, .5, .05, -.45, .04, -.95, dark, false).box(.26, .22, .06, -.45, .5, -.95, dark).done()
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(.2, .16), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }))
  screen.position.set(-.45, .65, -.915)
  core.group.add(screen)
  // the second reception desk opens when the flows are tuned
  const desk2 = new Piece(by.R.group).box(.95, .4, .4, .55, .04, .2, mint).done()
  const leds = dots(6, .12)
  {
    const a = leds.geometry.attributes.position.array
    for (let i = 0; i < 6; i++) a.set([-.7 + (i % 3) * .55, .3 + (i > 2 ? .25 : 0), -.53], i * 3)
  }
  by.IT.group.add(leds)

  // sign by the door, for when people need to find the place
  const sign = new Piece(root).box(.08, 1.7, .08, 7.3, 0, 1.9, steel, false).box(1, 1, .1, 7.3, 1.7, 1.9, white).done()
  const cross = new Piece(sign.group).box(.56, .16, .14, 7.3, 2.12, 1.9, '#d9534a', false).box(.16, .56, .14, 7.3, 1.92, 1.9, '#d9534a', false).done()
  cross.mesh.material.emissive.set('#ff5a4a')

  const P = new THREE.Vector3(), P2 = new THREE.Vector3(), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3()
  const place = (r, k) => {
    r.x = mix(r.a[0], r.b[0], k)
    r.z = mix(r.a[1], r.b[1], k)
    r.ang = mix(r.aa, r.ab, k)
    r.cos = Math.cos(r.ang)
    r.sin = Math.sin(r.ang)
  }
  // route nodes: ['f', x, z] fixed, ['c', room, x, lane] corridor outside a room, ['s', room, x, z] spot inside it, ['w', seconds, flag]
  const resolve = (n, out) => {
    if (n[0] === 'f') return out.set(n[1], Y, n[2])
    const r = by[n[1]]
    if (n[0] === 'c') return out.set(r.x + n[2] * r.cos, Y, n[3])
    return out.set(r.x + n[2] * r.cos + n[3] * r.sin, Y, r.z - n[2] * r.sin + n[3] * r.cos)
  }
  const OUT = [['f', 6.2, -.25], ['f', 9.6, -2.6]]
  const full = (d, cs, ps, quick) => {
    const dx = d ? .55 : -.55, cx = [-.8, 0, .8][cs], px = ps ? .45 : -.45
    return [['f', 6.2, .2], ['c', 'R', dx, .2], ['s', 'R', dx, .72], ['w', quick ? .6 : 1.4, 'desk'], ['c', 'R', dx, 0], ['c', 'C', cx, 0], ['s', 'C', cx, .4], ['w', 2, 'done'],
      ['c', 'C', cx, -.2], ['c', 'P', px, -.2], ['s', 'P', px, .78], ['w', .8], ['c', 'P', px, -.2], ...OUT]
  }
  const poc = () => [['f', 6.2, .2], ['c', 'C', -.8, .2], ['s', 'C', -.8, .4], ['w', 2.4, 'booth'], ['c', 'C', -.8, -.2], ...OUT]

  // tuned: the walk the first layout forced, and the one that replaced it
  const routeOf = k => {
    rooms.forEach(r => place(r, k))
    return full(0, 1, 0).filter(n => n[0] !== 'w').map(n => resolve(n, new THREE.Vector3()).setY(.17))
  }
  const oldRoute = ribbon(routeOf(0), .07, true)
  const NEW = routeOf(1), newLen = [0]
  for (let i = 1; i < NEW.length; i++) newLen.push(newLen[i - 1] + NEW[i].distanceTo(NEW[i - 1]))
  const newRoute = ribbon(NEW, .1)
  const pulses = dots(5, .26)
  root.add(oldRoute, newRoute, pulses)

  // everyone: patients from a pool, then staff, the engineer and the inspector
  const STAFF = [['R', -.55, -.2, '#f4ede3'], ['C', -.45, -.1, '#f4ede3'], ['C', .35, -.1, '#9cc3b1'], ['C', 1.15, -.1, '#f4ede3'], ['P', 0, -.1, '#f4ede3'], ['L', 0, -.4, '#9cc3b1'], ['W', 0, .45, '#9cc3b1'], ['R', .55, -.2, '#9cc3b1']]
  const ENG = POOL + STAFF.length, INS = ENG + 1
  const folk = new THREE.InstancedMesh(body, new THREE.MeshStandardMaterial({ roughness: .8, transparent: true, opacity: 0 }), INS + 1)
  folk.frustumCulled = false
  for (let i = 0; i < POOL; i++) folk.setColorAt(i, C.set(TONES[i % TONES.length]))
  STAFF.forEach((s, i) => folk.setColorAt(POOL + i, C.set(s[3])))
  folk.setColorAt(ENG, C.set('#f08a24'))
  folk.setColorAt(INS, C.set('#2c3a5c'))
  root.add(folk)
  const marks = dots(POOL, .2, true)
  root.add(marks)
  const pool = Array.from({ length: POOL }, (_, i) => ({ i, on: false, pos: new THREE.Vector3(), s: 0 }))
  const queue = []
  const st = { ap: 0, re: 0, poc: 0, flow: 0, known: 0, idea: 0, staff: 0, spawn: 0, liveT: 0, f: 0, treated: 0, desks: [null, null], booth: null, n: 0 }
  const slot = (i, out) => out.set(6.9 + i * .46, Y, .2 + i * i * .035)
  const put = (i, pos, s, sy = 1) => {
    M.compose(pos, Q, S.set(s, s * sy, s))
    folk.setMatrixAt(i, M)
  }
  const info = { wait: 0, treated: 0, pWait: new THREE.Vector3(), pOut: new THREE.Vector3() }
  const amber = new THREE.Color(), teal = new THREE.Color(), hanko = new THREE.Color()

  // o: on (0..1 chapter visibility), step (slide index), k (easing step), t, dt, night, ink, soft
  return function update (o) {
    root.visible = o.on > .01
    if (!root.visible) {
      st.treated = 0
      return info
    }
    const { step, k, t, dt, on } = o
    const to = (key, v) => { st[key] += (v - st[key]) * k }
    to('poc', step >= 1 ? 1 : 0)
    to('idea', step === 0 ? 1 : 0)
    to('staff', step >= 3 ? 1 : 0)
    to('flow', step >= 5 ? 1 : 0)
    to('known', step >= 6 ? 1 : 0)
    st.ap = clamp(st.ap + dt / 2.4 * (step >= 2 ? 1 : -1))
    st.re = clamp(st.re + dt / 3 * (step >= 4 ? 1 : -1))
    st.liveT = step >= 3 ? st.liveT + dt : 0
    teal.set('#12a08c').lerp(C.set('#63e0dc'), o.night)
    amber.set('#d9902b').lerp(C.set('#ffb347'), o.night)
    hanko.set('#d23c2f').lerp(C.set('#ff6b5c'), o.night)

    shell.s += ((step >= 2 ? 1 : 0) - shell.s) * k
    shell.w += ((step >= 1 ? 1 : 0) - shell.w) * k
    shell.set(shell.s, shell.w, on, o.ink, o.soft)
    nap.material.opacity = st.idea * on * .9
    nap.material.color.copy(o.ink)

    // rooms: drop in one after another, then lift and slide to where they belong
    for (const r of rooms) {
      r.v = ease(clamp(st.ap * 1.9 - r.i * .11))
      r.r = ease(clamp(st.re * 1.9 - r.i * .11))
      place(r, r.r)
      r.lift = Math.sin(r.r * Math.PI) * .9
      r.group.position.set(r.x, .1 + r.lift, r.z)
      r.group.rotation.y = r.ang
      r.group.scale.y = Math.max(.001, r.v)
      r.piece.set(r.v, 0, on, o.ink, o.soft)
      r.label.rotation.y = -r.ang
      r.label.material.opacity = r.v * on * .75
      r.label.material.color.copy(o.ink)
      // the inspector signs each room off as they pass it
      r.sv += ((st.liveT > (r.i + .8) * 1.4 ? 1 : 0) - r.sv) * Math.min(1, k * 2.5)
      r.stamp.rotation.y = -r.ang + (r.i % 2 ? -.1 : .08)
      r.stamp.material.opacity = r.sv * on * .9
      r.stamp.material.color.copy(hanko)
      r.stamp.scale.setScalar(mix(1.6, 1, ease(r.sv)))
      r.stamp.visible = r.sv > .01
    }
    const cr = by.C
    core.group.position.copy(cr.group.position)
    core.group.rotation.y = cr.ang
    core.set(st.poc, 0, on, o.ink, o.soft)
    screen.material.opacity = st.poc * on
    screen.material.color.copy(teal).multiplyScalar(.75 + Math.sin(t * 4) * .25)
    desk2.group.scale.y = Math.max(.001, st.flow)
    desk2.set(st.flow * by.R.v, 0, on, o.ink, o.soft)
    sign.group.scale.y = Math.max(.001, st.known)
    sign.set(st.known, 0, on, o.ink, o.soft)
    cross.set(st.known, 0, on, o.ink, o.soft)
    cross.mesh.material.emissiveIntensity = st.known * (.8 + Math.sin(t * 2) * .2)

    // a rack goes down every so often; the engineer walks over and brings it back
    const eu = t % 11, broken = step >= 3 && eu < 5
    leds.material.opacity = by.IT.v * on * (broken ? (Math.sin(t * 12) > 0 ? 1 : .2) : 1)
    leds.material.color.set(broken ? '#ff5a4a' : '#4fd49a')

    // patients
    const desks = step >= 5 ? 2 : 1, speed = step >= 5 ? 2.1 : 1.5
    st.spawn -= dt
    if (st.spawn <= 0 && queue.length < CAP) {
      const p = pool.find(q => !q.on)
      if (p) {
        Object.assign(p, { on: true, seq: null, s: 0, tone: 0, fade: 1 })
        p.pos.set(11.5 + rnd(), Y, 3.4 + rnd() * 1.5)
        queue.push(p)
        st.spawn = [.9, 1.6, 1.9, 1.9, 2.9, 2.7, 1.3, 1.3][step] * (.8 + rnd() * .4)
      }
    }
    const head = queue[0]
    if (head && head.pos.distanceTo(slot(0, P)) < .6) {
      if (step === 1 && !st.booth) {
        st.booth = head
        head.seq = poc()
      } else if (step >= 2) {
        const d = st.desks[0] ? (desks > 1 && !st.desks[1] ? 1 : -1) : 0
        if (d >= 0) {
          st.desks[d] = head
          head.seq = full(d, st.n % 3, st.n % 2, step >= 5)
          st.n++
        }
      }
      if (head.seq) {
        head.at = 0
        head.wait = 0
        queue.shift()
      }
    }
    const ma = marks.geometry.attributes.position.array, mc = marks.geometry.attributes.color.array
    for (const p of pool) {
      let sc = 0
      if (p.on) {
        if (!p.seq) {
          const d = P.copy(slot(queue.indexOf(p), P2)).sub(p.pos), l = d.length()
          if (l > .01) p.pos.addScaledVector(d, Math.min(1, speed * dt / l))
          p.tone = 1
        } else {
          const n = p.seq[p.at]
          if (n[0] === 'w') {
            p.wait += dt
            if (p.wait >= n[1]) {
              if (n[2] === 'desk') st.desks[st.desks.indexOf(p)] = null
              if (n[2] === 'booth') st.booth = null
              if (n[2]) p.tone = n[2] === 'desk' ? 0 : 2
              p.wait = 0
              p.at++
            }
          } else {
            const d = resolve(n, P).sub(p.pos), l = d.length(), mv = speed * dt
            if (l <= mv) {
              p.pos.add(d)
              p.at++
            } else p.pos.addScaledVector(d, mv / l)
          }
          if (p.at >= p.seq.length) {
            p.on = false
            st.treated++
          } else if (p.at === p.seq.length - 1) p.fade = clamp(p.pos.distanceTo(resolve(p.seq[p.at], P)) / 1.2)
          else p.fade = 1
        }
        p.s += ((p.on ? 1 : 0) - p.s) * Math.min(1, k * 3)
        sc = p.s * (p.seq ? p.fade : 1) * .88
      }
      P.copy(p.pos)
      P.y += Math.abs(Math.sin(t * 6 + p.i)) * .025
      put(p.i, P, Math.max(.0001, sc))
      const show = p.on && sc > .5 && p.tone
      ma.set([p.pos.x, show ? p.pos.y + .98 : -50, p.pos.z], p.i * 3)
      C.copy(p.tone === 2 ? teal : amber)
      mc.set([C.r, C.g, C.b], p.i * 3)
    }
    marks.geometry.attributes.position.needsUpdate = true
    marks.geometry.attributes.color.needsUpdate = true
    marks.material.opacity = on

    // staff stand in their rooms and ride along when the rooms move
    STAFF.forEach(([id, x, z], i) => {
      const r = by[id], v = st.staff * r.v * (i === 7 ? st.flow : 1)
      const px = id === 'W' ? Math.sin(t * .5) * .9 : x
      P.set(r.x + px * r.cos + z * r.sin, Y + r.lift, r.z - px * r.sin + z * r.cos)
      put(POOL + i, P, Math.max(.0001, v * .9))
    })
    {
      const r = by.IT, w = ease(clamp((eu - 1.4) / 1.1)) * (1 - ease(clamp((eu - 5) / 1.1)))
      const x = mix(1.05, 0, w), z = mix(.75, -.3, w)
      P.set(r.x + x * r.cos + z * r.sin, Y + r.lift, r.z - x * r.sin + z * r.cos)
      put(ENG, P, Math.max(.0001, st.staff * r.v * .9), eu > 2.5 && eu < 5 ? .8 + Math.sin(t * 5) * .08 : 1)
    }
    {
      const u = st.liveT / 1.4, a = Math.min(7, Math.floor(u)), b = Math.min(7, a + 1)
      resolve(['c', rooms[a].id, 0, 0], P)
      P.lerp(resolve(['c', rooms[b].id, 0, 0], P2), ease(clamp((u - a) * 1.6 - .6)))
      put(INS, P, Math.max(.0001, st.staff * clamp(u * 2) * clamp(9.2 - u) * .92))
    }
    folk.instanceMatrix.needsUpdate = true
    folk.material.opacity = on
    folk.material.transparent = on < .999
    folk.castShadow = on > .5

    // routes: the old walk stays as a ghost while the new one draws in and carries a pulse
    st.f = step >= 5 ? Math.min(1, st.f + dt / 2.2) : 0
    oldRoute.material.opacity = st.flow * on * mix(.8, .4, st.f)
    oldRoute.material.color.copy(hanko)
    newRoute.geometry.setDrawRange(0, Math.ceil(st.f * newRoute.userData.n / 6) * 6)
    newRoute.material.opacity = st.flow * on * .85
    newRoute.material.color.copy(teal)
    const pa = pulses.geometry.attributes.position.array, total = newLen[newLen.length - 1]
    for (let i = 0; i < 5; i++) {
      const d = ((t * .16 + i / 5) % 1) * total
      let j = 1
      while (j < NEW.length - 1 && newLen[j] < d) j++
      P.lerpVectors(NEW[j - 1], NEW[j], (d - newLen[j - 1]) / (newLen[j] - newLen[j - 1]))
      pa.set([P.x, P.y + .05, P.z], i * 3)
    }
    pulses.geometry.attributes.position.needsUpdate = true
    pulses.material.opacity = st.flow * st.f * on
    pulses.material.color.copy(teal)

    info.wait = queue.length
    info.treated = st.treated
    root.localToWorld(slot(Math.max(1, queue.length - 1) * .5, info.pWait).setY(1.5))
    root.localToWorld(info.pOut.set(8.4, 1.5, -1.8))
    return info
  }
}

// Live-only multiplayer for the zafar.dev homepage: the "Stuff I've made" pile
// and everyone's cursors. One Durable Object per room keeps photo positions in
// memory while anyone is connected and forgets them when the last visitor
// leaves. Nothing about visitors is stored.
//
// The same worker also serves the current Tokyo weather for the homepage sky
// (GET /weather). A cron fetches it from Open-Meteo every 15 minutes into KV.
import { Server, routePartykitRequest, type Connection, type ConnectionContext } from 'partyserver'

type Env = { Pile: DurableObjectNamespace, WEATHER: KVNamespace }
type Pos = { x: number, y: number, r: number }
type Peer = { name: string, color: string, tokens: number, refill: number }

const ALLOWED_ORIGINS = [/^https:\/\/(www\.)?zafar\.dev$/, /^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/]
const COLORS = ['#d23c2f', '#2f9e6e', '#3a6fd8', '#c77d12', '#8a4fd1', '#d1478a', '#0f8a9e']
const MAX_PEERS = 40
const clamp = (v: unknown, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number(v) || 0))
const validId = (v: unknown): v is string => typeof v === 'string' && /^[a-z]{2,16}$/.test(v)

export class Pile extends Server<Env> {
  static options = { hibernate: false }
  pos = new Map<string, Pos>()
  peers = new Map<string, Peer>()
  nextColor = 0

  count() { return [...this.getConnections()].length }

  onConnect(conn: Connection, ctx: ConnectionContext) {
    if (this.count() > MAX_PEERS) { conn.close(1013, 'full'); return }
    const name = ctx.request.headers.get('x-visitor-place') || 'somewhere'
    const color = COLORS[this.nextColor++ % COLORS.length]!
    this.peers.set(conn.id, { name, color, tokens: 60, refill: Date.now() })
    const others = [...this.peers].filter(([id]) => id !== conn.id).map(([id, p]) => ({ id, name: p.name, color: p.color }))
    conn.send(JSON.stringify({ t: 'init', you: conn.id, color, pos: Object.fromEntries(this.pos), peers: others }))
    this.broadcast(JSON.stringify({ t: 'join', id: conn.id, name, color }), [conn.id])
  }

  onMessage(conn: Connection, raw: string | ArrayBuffer | ArrayBufferView) {
    const peer = this.peers.get(conn.id)
    if (!peer || typeof raw !== 'string' || raw.length > 300) return
    // token bucket: ~40 messages a second, bursts of 60
    const now = Date.now()
    peer.tokens = Math.min(60, peer.tokens + (now - peer.refill) * 0.04); peer.refill = now
    if (peer.tokens < 1) return
    peer.tokens -= 1
    let m: Record<string, unknown>
    try { m = JSON.parse(raw) } catch { return }

    if (m.t === 'move' || m.t === 'drop') {
      if (!validId(m.id)) return
      if (!this.pos.has(m.id) && this.pos.size >= 16) return
      // x may leave the pile's column: on wide screens photos can go into the side margins
      const p = { x: clamp(m.x, -1.6, 1.6), y: clamp(m.y, -0.6, 0.6), r: clamp(m.r, -12, 12) }
      this.pos.set(m.id, p)
      this.broadcast(JSON.stringify({ t: m.t, id: m.id, ...p, by: conn.id }), [conn.id])
    } else if (m.t === 'cur') {
      // s: which homepage section the cursor is over (x/y are relative to it); absent means the pile
      const s = m.s === undefined ? undefined : Math.round(clamp(m.s, 0, 15))
      this.broadcast(JSON.stringify({ t: 'cur', by: conn.id, s, x: clamp(m.x, -0.2, 1.2), y: clamp(m.y, -0.2, 1.2) }), [conn.id])
    } else if (m.t === 'out') {
      this.broadcast(JSON.stringify({ t: 'out', by: conn.id }), [conn.id])
    } else if (m.t === 'tidy') {
      this.pos.clear()
      this.broadcast(JSON.stringify({ t: 'tidy', by: conn.id }))
    }
  }

  onClose(conn: Connection) { this.leave(conn) }
  onError(conn: Connection) { this.leave(conn) }

  leave(conn: Connection) {
    if (!this.peers.delete(conn.id)) return
    this.broadcast(JSON.stringify({ t: 'bye', id: conn.id }))
    // live only: when the last person leaves, the pile goes back to how it was
    if (this.peers.size === 0) this.pos.clear()
  }
}

// ---------- Tokyo weather ----------
const WEATHER_KEY = 'tokyo'
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917'
  + '&current=temperature_2m,weather_code,cloud_cover,precipitation,visibility,is_day&timezone=Asia%2FTokyo'
type Weather = { code: number, cloud: number, precip: number, visibility: number | null, temp: number, isDay: number, observedAt: string, fetchedAt: string }

async function refreshWeather(env: Env): Promise<Weather> {
  const res = await fetch(WEATHER_URL, { headers: { 'user-agent': 'zafar.dev homepage sky' } })
  if (!res.ok) throw new Error(`open-meteo ${res.status}`)
  const c = (await res.json() as { current: Record<string, number | string> }).current
  const w: Weather = {
    code: Number(c.weather_code), cloud: Number(c.cloud_cover), precip: Number(c.precipitation) || 0,
    visibility: c.visibility == null ? null : Number(c.visibility), temp: Number(c.temperature_2m), isDay: Number(c.is_day),
    observedAt: `${c.time}+09:00`, fetchedAt: new Date().toISOString()
  }
  await env.WEATHER.put(WEATHER_KEY, JSON.stringify(w))
  return w
}

async function serveWeather(env: Env, origin: string): Promise<Response> {
  let body = await env.WEATHER.get(WEATHER_KEY)
  // first request before the cron has run, or the cron has been failing for a while
  if (!body || Date.now() - Date.parse((JSON.parse(body) as Weather).fetchedAt) > 45 * 60e3) {
    try { body = JSON.stringify(await refreshWeather(env)) } catch { /* serve what we have */ }
  }
  const headers = { 'content-type': 'application/json', 'access-control-allow-origin': origin, 'vary': 'Origin', 'cache-control': 'public, max-age=300' }
  return body ? new Response(body, { headers }) : new Response('{}', { status: 503, headers })
}

export default {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(refreshWeather(env).then(() => {}, err => console.warn('weather refresh failed', err)))
  },

  async fetch(req: Request, env: Env): Promise<Response> {
    const origin = req.headers.get('Origin') || ''
    if (!ALLOWED_ORIGINS.some(re => re.test(origin))) return new Response('forbidden', { status: 403 })
    if (new URL(req.url).pathname === '/weather') {
      if (req.method !== 'GET') return new Response('method not allowed', { status: 405 })
      return serveWeather(env, origin)
    }
    const cf = (req as Request & { cf?: { city?: string, country?: string } }).cf
    const headers = new Headers(req.headers)
    headers.set('x-visitor-place', (cf?.city || cf?.country || 'somewhere').slice(0, 40))
    const routed = await routePartykitRequest(new Request(req, { headers }), env as never)
    return routed || new Response('not found', { status: 404 })
  }
}

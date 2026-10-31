/**
 * Moteur de miettes.
 *  - desktop : physique Matter.js (import dynamique), <= 150 particules
 *  - mobile / appareil lent : particules canvas simples (gravité + rebond), ~ 20 max
 * Les deux exposent la même API et se nettoient entièrement avec `destroy()` (aucune fuite mémoire).
 */
export interface CrumbEngine {
  spawn(x: number, y: number, color: string, count?: number, power?: number): void
  fillPile(colors: string[], count: number): void
  impulse(x: number, y: number, radius?: number, force?: number): void
  resize(): void
  onIdle?: () => void
  destroy(): void
}
export interface CrumbOptions {
  physics: boolean
  max: number
  persistent?: boolean
}

function setupCanvas(canvas: HTMLCanvasElement, maxDpr: number) {
  const ctx = canvas.getContext('2d')!
  const s = { ctx, W: 0, H: 0 }
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr)
    s.W = canvas.clientWidth
    s.H = canvas.clientHeight
    canvas.width = Math.max(1, Math.round(s.W * dpr))
    canvas.height = Math.max(1, Math.round(s.H * dpr))
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  return { s, resize }
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

/* ------------------------- Version légère (canvas) ------------------------- */
interface P {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  rot: number
  vr: number
  color: string
  age: number
  ttl: number
  shape: number
  rest: boolean
}

function createLite(canvas: HTMLCanvasElement, o: CrumbOptions): CrumbEngine {
  const { s, resize } = setupCanvas(canvas, 1.5)
  let ps: P[] = []
  let raf = 0
  let last = 0
  let idle = 0
  let running = false
  const G = 1500

  const draw = (p: P) => {
    const c = s.ctx
    const life = o.persistent ? 1 : p.age > p.ttl * 0.7 ? 1 - (p.age - p.ttl * 0.7) / (p.ttl * 0.3) : 1
    c.save()
    c.globalAlpha = Math.max(0, life)
    c.translate(p.x, p.y)
    c.rotate(p.rot)
    c.fillStyle = p.color
    c.beginPath()
    if (p.shape === 0) c.rect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2)
    else if (p.shape === 1) {
      c.moveTo(0, -p.r)
      c.lineTo(p.r, p.r)
      c.lineTo(-p.r, p.r)
      c.closePath()
    } else c.ellipse(0, 0, p.r, p.r * 0.7, 0, 0, Math.PI * 2)
    c.fill()
    c.restore()
  }

  const drawAll = () => {
    s.ctx.clearRect(0, 0, s.W, s.H)
    ps.forEach(draw)
  }

  const frame = (t: number) => {
    const dt = Math.min((t - last) / 1000, 0.032)
    last = t
    let moving = 0
    for (const p of ps) {
      if (!p.rest) {
        p.vy += G * dt
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.vr * dt
        if (p.x < p.r) {
          p.x = p.r
          p.vx *= -0.5
        } else if (p.x > s.W - p.r) {
          p.x = s.W - p.r
          p.vx *= -0.5
        }
        if (p.y > s.H - p.r) {
          p.y = s.H - p.r
          p.vy *= -0.4
          p.vx *= 0.82
          p.vr *= 0.6
          if (Math.abs(p.vy) < 45) {
            p.vy = 0
            p.vx = 0
            p.vr = 0
            p.rest = true
          }
        }
        moving++
      }
      if (!o.persistent) p.age += dt
    }
    if (!o.persistent) ps = ps.filter((p) => p.age < p.ttl)
    drawAll()
    idle = moving ? 0 : idle + dt
    if (ps.length === 0 || (o.persistent && idle > 0.8)) {
      running = false
      if (ps.length === 0) engine.onIdle?.()
      return
    }
    raf = requestAnimationFrame(frame)
  }
  const start = () => {
    if (running) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  const engine: CrumbEngine = {
    spawn(x, y, color, count = 10, power = 1) {
      for (let i = 0; i < count; i++) {
        const a = -Math.PI * rnd(0.08, 0.92)
        const v = rnd(260, 640) * power
        ps.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          r: rnd(2.5, 5.5),
          rot: rnd(0, 6),
          vr: rnd(-9, 9),
          color,
          age: 0,
          ttl: rnd(1.6, 2.6),
          shape: Math.floor(rnd(0, 3)),
          rest: false,
        })
      }
      if (ps.length > o.max) ps = ps.slice(ps.length - o.max)
      start()
    },
    fillPile(colors, count) {
      ps = []
      for (let i = 0; i < Math.min(count, o.max); i++) {
        const x = rnd(0, s.W)
        const mound = Math.exp(-(((x - s.W / 2) / (s.W * 0.28)) ** 2)) * Math.min(s.H * 0.55, 90)
        const r = rnd(3, 6.5)
        ps.push({
          x,
          y: s.H - r - Math.random() * mound,
          vx: 0,
          vy: 0,
          r,
          rot: rnd(0, 6),
          vr: 0,
          color: colors[i % colors.length]!,
          age: 0,
          ttl: 1,
          shape: Math.floor(rnd(0, 3)),
          rest: true,
        })
      }
      drawAll()
    },
    impulse(x, y, radius = 70, force = 560) {
      let hit = false
      for (const p of ps) {
        const dx = p.x - x
        const dy = p.y - y
        const d = Math.hypot(dx, dy)
        if (d < radius) {
          const k = (1 - d / radius) * force
          p.rest = false
          p.vx += (dx / (d || 1)) * k
          p.vy += (dy / (d || 1)) * k - 220
          p.vr = rnd(-10, 10)
          hit = true
        }
      }
      if (hit) {
        idle = 0
        start()
      }
    },
    resize() {
      resize()
      drawAll()
    },
    destroy() {
      cancelAnimationFrame(raf)
      running = false
      ps = []
      s.ctx.clearRect(0, 0, s.W, s.H)
    },
  }
  return engine
}

/* ------------------------- Version physique (Matter.js) ------------------------- */
async function createMatter(canvas: HTMLCanvasElement, o: CrumbOptions): Promise<CrumbEngine> {
  const Matter = (await import('matter-js')).default
  const { Engine, Bodies, Body, Composite } = Matter
  const { s, resize } = setupCanvas(canvas, 2)
  const engine = Engine.create({ gravity: { x: 0, y: 1.15 } })
  type Meta = { color: string; age: number; ttl: number }
  const meta = new Map<Matter.Body, Meta>()
  let bodies: Matter.Body[] = []
  let walls: Matter.Body[] = []
  let raf = 0
  let last = 0
  let idle = 0
  let running = false

  const buildWalls = () => {
    Composite.remove(engine.world, walls)
    const t = 80
    walls = [
      Bodies.rectangle(s.W / 2, s.H + t / 2, s.W * 3, t, { isStatic: true, friction: 0.7 }),
      Bodies.rectangle(-t / 2, s.H / 2, t, s.H * 6, { isStatic: true }),
      Bodies.rectangle(s.W + t / 2, s.H / 2, t, s.H * 6, { isStatic: true }),
    ]
    Composite.add(engine.world, walls)
  }
  buildWalls()

  const add = (x: number, y: number, color: string, ttl: number) => {
    const b = Bodies.polygon(x, y, 3 + Math.floor(rnd(0, 3)), rnd(3, 7), {
      restitution: 0.35,
      friction: 0.3,
      frictionAir: 0.012,
      angle: rnd(0, 6),
    })
    meta.set(b, { color, age: 0, ttl })
    Composite.add(engine.world, b)
    bodies.push(b)
    return b
  }
  const drop = (b: Matter.Body) => {
    Composite.remove(engine.world, b)
    meta.delete(b)
  }

  const draw = () => {
    const c = s.ctx
    c.clearRect(0, 0, s.W, s.H)
    for (const b of bodies) {
      const m = meta.get(b)!
      const alpha = o.persistent ? 1 : m.age > m.ttl * 0.7 ? 1 - (m.age - m.ttl * 0.7) / (m.ttl * 0.3) : 1
      c.globalAlpha = Math.max(0, alpha)
      c.fillStyle = m.color
      c.beginPath()
      b.vertices.forEach((v, i) => (i ? c.lineTo(v.x, v.y) : c.moveTo(v.x, v.y)))
      c.closePath()
      c.fill()
    }
    c.globalAlpha = 1
  }

  const frame = (t: number) => {
    const dt = Math.min(t - last, 32)
    last = t
    Engine.update(engine, dt)
    let moving = 0
    if (!o.persistent) {
      for (const b of bodies) meta.get(b)!.age += dt / 1000
      const dead = bodies.filter((b) => meta.get(b)!.age >= meta.get(b)!.ttl)
      dead.forEach(drop)
      if (dead.length) bodies = bodies.filter((b) => !dead.includes(b))
    }
    for (const b of bodies) if (b.speed > 0.15) moving++
    draw()
    idle = moving ? 0 : idle + dt / 1000
    if (bodies.length === 0 || (o.persistent && idle > 1)) {
      running = false
      if (bodies.length === 0) api.onIdle?.()
      return
    }
    raf = requestAnimationFrame(frame)
  }
  const start = () => {
    if (running) return
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  const api: CrumbEngine = {
    spawn(x, y, color, count = 16, power = 1) {
      for (let i = 0; i < count; i++) {
        const b = add(x + rnd(-6, 6), y + rnd(-6, 6), color, rnd(2, 3.2))
        const a = -Math.PI * rnd(0.08, 0.92)
        const v = rnd(7, 16) * power
        Body.setVelocity(b, { x: Math.cos(a) * v, y: Math.sin(a) * v })
        Body.setAngularVelocity(b, rnd(-0.3, 0.3))
      }
      while (bodies.length > o.max) drop(bodies.shift()!)
      start()
    },
    fillPile(colors, count) {
      bodies.forEach(drop)
      bodies = []
      const n = Math.min(count, o.max)
      for (let i = 0; i < n; i++) {
        const x = s.W / 2 + (Math.random() + Math.random() - 1) * s.W * 0.3
        add(Math.min(s.W - 8, Math.max(8, x)), rnd(-s.H * 0.5, s.H * 0.3), colors[i % colors.length]!, 1)
      }
      // laisse la pile se former hors écran visuel : quelques pas de simulation instantanés
      for (let i = 0; i < 240; i++) Engine.update(engine, 16)
      draw()
    },
    impulse(x, y, radius = 90, force = 12) {
      let hit = false
      for (const b of bodies) {
        const dx = b.position.x - x
        const dy = b.position.y - y
        const d = Math.hypot(dx, dy)
        if (d < radius) {
          const k = (1 - d / radius) * force
          Body.setVelocity(b, { x: b.velocity.x + (dx / (d || 1)) * k, y: b.velocity.y + (dy / (d || 1)) * k - 3 })
          Body.setAngularVelocity(b, rnd(-0.25, 0.25))
          hit = true
        }
      }
      if (hit) {
        idle = 0
        start()
      }
    },
    resize() {
      resize()
      buildWalls()
      draw()
    },
    destroy() {
      cancelAnimationFrame(raf)
      running = false
      bodies.forEach(drop)
      bodies = []
      Composite.clear(engine.world, false)
      Engine.clear(engine)
      s.ctx.clearRect(0, 0, s.W, s.H)
    },
  }
  return api
}

export async function createCrumbEngine(canvas: HTMLCanvasElement, o: CrumbOptions): Promise<CrumbEngine> {
  return o.physics ? createMatter(canvas, o) : createLite(canvas, o)
}

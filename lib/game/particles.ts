export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  minSize: number
  color: string
  update(dt: number): boolean // returns true if still alive
  render(ctx: CanvasRenderingContext2D): void
}

class BaseParticle implements Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  minSize: number
  color: string

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    size: number,
    color: string,
    minSize: number = 0
  ) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.life = life
    this.maxLife = life
    this.size = size
    this.minSize = minSize
    this.color = color
  }

  update(dt: number): boolean {
    this.x += this.vx * (dt / 1000)
    this.y += this.vy * (dt / 1000)
    
    // Apply gravity
    this.vy += 300 * (dt / 1000)
    
    // Apply friction
    this.vx *= 0.98
    this.vy *= 0.98
    
    this.life -= dt
    
    // Shrink over time
    const lifeRatio = this.life / this.maxLife
    this.size = this.minSize + (this.size - this.minSize) * lifeRatio
    
    return this.life > 0
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.globalAlpha = Math.min(1, this.life / this.maxLife)
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

export class ParticleSystem {
  private particles: Particle[] = []

  addParticle(particle: Particle) {
    this.particles.push(particle)
  }

  addParticles(count: number, x: number, y: number, options: {
    velocity?: { min: number; max: number }
    angle?: { min: number; max: number }
    life?: { min: number; max: number }
    size?: { min: number; max: number }
    color: string
    minSize?: number
  }) {
    const velMin = options.velocity?.min || 50
    const velMax = options.velocity?.max || 150
    const angleMin = options.angle?.min || 0
    const angleMax = options.angle?.max || Math.PI * 2
    const lifeMin = options.life?.min || 500
    const lifeMax = options.life?.max || 1500
    const sizeMin = options.size?.min || 2
    const sizeMax = options.size?.max || 6

    for (let i = 0; i < count; i++) {
      const angle = angleMin + Math.random() * (angleMax - angleMin)
      const speed = velMin + Math.random() * (velMax - velMin)
      
      const vx = Math.cos(angle) * speed
      const vy = Math.sin(angle) * speed
      
      const life = lifeMin + Math.random() * (lifeMax - lifeMin)
      const size = sizeMin + Math.random() * (sizeMax - sizeMin)
      
      const particle = new BaseParticle(
        x,
        y,
        vx,
        vy,
        life,
        size,
        options.color,
        options.minSize || 0
      )
      
      this.particles.push(particle)
    }
  }

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      if (!this.particles[i].update(dt)) {
        this.particles.splice(i, 1)
      }
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    for (const particle of this.particles) {
      particle.render(ctx)
    }
  }

  clear() {
    this.particles = []
  }

  getParticleCount(): number {
    return this.particles.length
  }
}
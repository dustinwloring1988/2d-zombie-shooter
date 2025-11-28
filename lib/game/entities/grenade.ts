export type GrenadeType = "frag" | "stun"

export class Grenade {
  x: number
  y: number
  targetX: number
  targetY: number
  type: GrenadeType
  timer: number
  exploded = false

  private progress = 0
  private arcHeight = 100
  private travelTime = 800 // ms to reach target

  constructor(startX: number, startY: number, targetX: number, targetY: number, type: GrenadeType) {
    this.x = startX
    this.y = startY
    this.targetX = targetX
    this.targetY = targetY
    this.type = type
    this.timer = this.travelTime
  }

  update(dt: number): boolean {
    if (this.exploded) return true

    this.timer -= dt
    this.progress = 1 - this.timer / this.travelTime

    // Lerp position
    this.x = this.x + (this.targetX - this.x) * (dt / this.timer)
    this.y = this.y + (this.targetY - this.y) * (dt / this.timer)

    if (this.timer <= 0) {
      this.exploded = true
      return true
    }

    return false
  }

  getVisualY(): number {
    // Parabolic arc
    const arcProgress = Math.sin(this.progress * Math.PI)
    return this.y - arcProgress * this.arcHeight
  }

  getExplosionRadius(): number {
    return this.type === "frag" ? 150 : 200
  }

  getDamage(): number {
    return this.type === "frag" ? 500 : 0
  }

  getStunDuration(): number {
    return this.type === "stun" ? 4000 : 0
  }

  render(ctx: CanvasRenderingContext2D) {
    if (this.exploded) return

    ctx.save()
    ctx.translate(this.x, this.getVisualY())

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.beginPath()
    ctx.ellipse(0, this.y - this.getVisualY() + 5, 8, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    // Grenade body
    if (this.type === "frag") {
      ctx.fillStyle = "#2d5a27"
      ctx.beginPath()
      ctx.arc(0, 0, 10, 0, Math.PI * 2)
      ctx.fill()

      // Fuse
      ctx.strokeStyle = "#ff6600"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -10)
      ctx.lineTo(0, -15)
      ctx.stroke()
    } else {
      ctx.fillStyle = "#4a90d9"
      ctx.beginPath()
      ctx.arc(0, 0, 10, 0, Math.PI * 2)
      ctx.fill()

      // Flash indicator
      ctx.fillStyle = "#fff"
      ctx.beginPath()
      ctx.arc(0, 0, 4, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }

  renderExplosion(ctx: CanvasRenderingContext2D, progress: number) {
    const radius = this.getExplosionRadius() * progress
    const alpha = 1 - progress

    ctx.save()
    ctx.translate(this.targetX, this.targetY)

    if (this.type === "frag") {
      // Fire explosion
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
      gradient.addColorStop(0, `rgba(255, 200, 50, ${alpha})`)
      gradient.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.7})`)
      gradient.addColorStop(1, `rgba(100, 0, 0, 0)`)
      ctx.fillStyle = gradient
    } else {
      // Flash explosion
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
      gradient.addColorStop(0.5, `rgba(200, 230, 255, ${alpha * 0.7})`)
      gradient.addColorStop(1, `rgba(100, 150, 255, 0)`)
      ctx.fillStyle = gradient
    }

    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}

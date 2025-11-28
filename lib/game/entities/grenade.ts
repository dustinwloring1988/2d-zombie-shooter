export type GrenadeType = "frag" | "stun" | "molotov" | "disco"

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
    switch (this.type) {
      case "frag": return 150
      case "stun": return 200
      case "molotov": return 120
      case "disco": return 180
      default: return 150
    }
  }

  getDamage(): number {
    switch (this.type) {
      case "frag": return 500
      case "molotov": return 200  // Moderate damage over time effect
      default: return 0
    }
  }

  getStunDuration(): number {
    switch (this.type) {
      case "stun": return 4000
      case "disco": return 6000    // Longer disco effect
      default: return 0
    }
  }

  getFireDuration(): number {
    return this.type === "molotov" ? 5000 : 0  // 5 seconds of fire effect for molotov
  }

  getDiscoColor(): string {
    return this.type === "disco" ? `hsl(${(Date.now() / 10) % 360}, 100%, 70%)` : "#ffffff"
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

    // Grenade body - different appearance based on type
    switch (this.type) {
      case "frag":
        // Traditional grenade
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
        break

      case "stun":
        // Classic stun grenade (blue)
        ctx.fillStyle = "#4a90d9"
        ctx.beginPath()
        ctx.arc(0, 0, 10, 0, Math.PI * 2)
        ctx.fill()

        // Flash indicator
        ctx.fillStyle = "#fff"
        ctx.beginPath()
        ctx.arc(0, 0, 4, 0, Math.PI * 2)
        ctx.fill()
        break

      case "molotov":
        // Molotov cocktail - glass bottle with burning cloth
        ctx.fillStyle = "#8b4513" // Brown glass
        ctx.beginPath()
        ctx.arc(0, 0, 10, 0, Math.PI * 2)
        ctx.fill()

        // Burning part
        ctx.fillStyle = "#ff4500" // Orange flame
        ctx.beginPath()
        ctx.arc(0, -12, 6, 0, Math.PI * 2)
        ctx.fill()

        // Flame effect
        ctx.fillStyle = "#ffff00" // Yellow flame
        ctx.beginPath()
        ctx.arc(0, -16, 4, 0, Math.PI * 2)
        ctx.fill()
        break

      case "disco":
        // Disco ball - metallic with reflective surface
        // Create metallic radial gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12)
        gradient.addColorStop(0, "#e6e6fa") // Light pastel center
        gradient.addColorStop(0.5, "#9370db") // Purple
        gradient.addColorStop(1, "#7b68ee") // Medium purple

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(0, 0, 10, 0, Math.PI * 2)
        ctx.fill()

        // Add reflective spots
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(-3, -3, 2, 0, Math.PI * 2)
        ctx.arc(4, -1, 1.5, 0, Math.PI * 2)
        ctx.arc(0, 4, 2, 0, Math.PI * 2)
        ctx.arc(-2, 2, 1, 0, Math.PI * 2)
        ctx.fill()
        break

      default:
        // Default to frag grenade for safety
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
        break
    }

    ctx.restore()
  }

  renderExplosion(ctx: CanvasRenderingContext2D, progress: number) {
    const radius = this.getExplosionRadius() * progress
    const alpha = 1 - progress

    ctx.save()
    ctx.translate(this.targetX, this.targetY)

    switch (this.type) {
      case "frag":
        // Fire explosion
        const fireGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
        fireGradient.addColorStop(0, `rgba(255, 200, 50, ${alpha})`)
        fireGradient.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.7})`)
        fireGradient.addColorStop(1, `rgba(100, 0, 0, 0)`)
        ctx.fillStyle = fireGradient
        break

      case "stun":
        // Flash explosion
        const flashGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
        flashGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
        flashGradient.addColorStop(0.5, `rgba(200, 230, 255, ${alpha * 0.7})`)
        flashGradient.addColorStop(1, `rgba(100, 150, 255, 0)`)
        ctx.fillStyle = flashGradient
        break

      case "molotov":
        // Fire explosion with different color scheme
        const molotovGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
        molotovGradient.addColorStop(0, `rgba(255, 100, 0, ${alpha})`)
        molotovGradient.addColorStop(0.3, `rgba(255, 50, 0, ${alpha * 0.8})`)
        molotovGradient.addColorStop(0.7, `rgba(200, 50, 0, ${alpha * 0.5})`)
        molotovGradient.addColorStop(1, `rgba(150, 0, 0, 0)`)
        ctx.fillStyle = molotovGradient
        break

      case "disco":
        // Disco/party explosion with colorful gradient
        const discoGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
        discoGradient.addColorStop(0, `hsla(${(Date.now() / 20) % 360}, 100%, 70%, ${alpha})`)
        discoGradient.addColorStop(0.3, `hsla(${(Date.now() / 20 + 120) % 360}, 100%, 60%, ${alpha * 0.8})`)
        discoGradient.addColorStop(0.7, `hsla(${(Date.now() / 20 + 240) % 360}, 100%, 50%, ${alpha * 0.5})`)
        discoGradient.addColorStop(1, `rgba(0, 0, 0, 0)`)
        ctx.fillStyle = discoGradient
        break

      default:
        // Default to frag explosion
        const defaultGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
        defaultGradient.addColorStop(0, `rgba(255, 200, 50, ${alpha})`)
        defaultGradient.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.7})`)
        defaultGradient.addColorStop(1, `rgba(100, 0, 0, 0)`)
        ctx.fillStyle = defaultGradient
        break
    }

    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}

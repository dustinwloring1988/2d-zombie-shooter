export type PowerUpType = "insta-kill" | "double-points" | "max-ammo" | "nuke"

const POWER_UP_COLORS: Record<PowerUpType, string> = {
  "insta-kill": "#ff0000",
  "double-points": "#ffff00",
  "max-ammo": "#00ff00",
  nuke: "#ff00ff",
}

const POWER_UP_LABELS: Record<PowerUpType, string> = {
  "insta-kill": "INSTA",
  "double-points": "2X",
  "max-ammo": "MAX",
  nuke: "NUKE",
}

export class PowerUp {
  x: number
  y: number
  type: PowerUpType
  lifetime = 15000
  expired = false

  private bobOffset = 0

  constructor(x: number, y: number, type: PowerUpType) {
    this.x = x
    this.y = y
    this.type = type
  }

  update(dt: number) {
    this.lifetime -= dt
    if (this.lifetime <= 0) {
      this.expired = true
    }
    this.bobOffset += dt * 0.005
  }

  render(ctx: CanvasRenderingContext2D) {
    const bobY = Math.sin(this.bobOffset * 3) * 5
    const scale = 1 + Math.sin(this.bobOffset * 5) * 0.1

    ctx.save()
    ctx.translate(this.x, this.y + bobY)
    ctx.scale(scale, scale)

    // Glow
    ctx.shadowColor = POWER_UP_COLORS[this.type]
    ctx.shadowBlur = 20

    // Box
    ctx.fillStyle = POWER_UP_COLORS[this.type]
    ctx.fillRect(-20, -20, 40, 40)

    // Inner
    ctx.fillStyle = "#000"
    ctx.fillRect(-15, -15, 30, 30)

    // Label
    ctx.fillStyle = POWER_UP_COLORS[this.type]
    ctx.font = "bold 12px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(POWER_UP_LABELS[this.type], 0, 0)

    ctx.restore()

    // Blinking when about to expire
    if (this.lifetime < 3000 && Math.floor(this.lifetime / 200) % 2 === 0) {
      ctx.globalAlpha = 0.3
    }
  }
}

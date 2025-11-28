import { type WeaponData, MYSTERY_BOX_WEAPONS } from "./weapons"

export class WallBuy {
  x: number
  y: number
  weapon: WeaponData
  cost: number

  constructor(x: number, y: number, weapon: WeaponData, cost: number) {
    this.x = x
    this.y = y
    this.weapon = weapon
    this.cost = cost
  }

  isNear(playerX: number, playerY: number, range = 100): boolean {
    const dist = Math.hypot(this.x - playerX, this.y - playerY)
    return dist < range
  }

  render(ctx: CanvasRenderingContext2D, playerX: number, playerY: number) {
    const dist = Math.hypot(this.x - playerX, this.y - playerY)
    const isNearby = dist < 100

    ctx.save()
    ctx.translate(this.x, this.y)

    // Pulsing glow when nearby
    if (isNearby) {
      const pulse = Math.sin(Date.now() / 300) * 0.5 + 0.5
      const glowIntensity = 0.3 + pulse * 0.7
      ctx.shadowColor = "#ffcc00"
      ctx.shadowBlur = 15 * glowIntensity
    }

    // Wall mount background
    ctx.fillStyle = "#444"
    ctx.fillRect(-40, -50, 80, 70)

    // Weapon outline
    ctx.strokeStyle = isNearby ? "#ffcc00" : "#888"
    ctx.lineWidth = isNearby ? 3 : 2
    ctx.strokeRect(-35, -45, 70, 40)

    // Weapon icon (simplified)
    ctx.fillStyle = "#aaa"
    ctx.fillRect(-25, -35, 50, 20)

    // Weapon name
    ctx.fillStyle = isNearby ? "#fff" : "#aaa"
    ctx.font = "bold 10px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(this.weapon.name, 0, 5)

    // Cost
    ctx.fillStyle = isNearby ? "#ffcc00" : "#888"
    ctx.font = "bold 12px sans-serif"
    ctx.fillText(`$${this.cost}`, 0, 18)

    // Interaction hint
    if (isNearby) {
      ctx.shadowBlur = 0 // Clear shadow for text
      ctx.fillStyle = "#ffcc00"
      ctx.font = "bold 10px sans-serif"
      ctx.fillText("[E] Buy", 0, -55)
    }

    ctx.shadowBlur = 0
    ctx.restore()
  }
}

export class MysteryBox {
  x: number
  y: number
  cost = 950
  isOpen = false
  private currentWeapon: WeaponData | null = null

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  isNear(playerX: number, playerY: number, range = 100): boolean {
    const dist = Math.hypot(this.x - playerX, this.y - playerY)
    return dist < range
  }

  open(): WeaponData {
    this.isOpen = true
    this.currentWeapon = MYSTERY_BOX_WEAPONS[Math.floor(Math.random() * MYSTERY_BOX_WEAPONS.length)]

    // Reset after a delay
    setTimeout(() => {
      this.isOpen = false
      this.currentWeapon = null
    }, 100)

    return this.currentWeapon
  }

  reset() {
    this.isOpen = false
    this.currentWeapon = null
  }

  render(ctx: CanvasRenderingContext2D, playerX: number, playerY: number) {
    const dist = Math.hypot(this.x - playerX, this.y - playerY)
    const isNearby = dist < 100

    ctx.save()
    ctx.translate(this.x, this.y)

    // Enhanced pulsing glow when nearby
    if (isNearby) {
      const pulse = Math.sin(Date.now() / 400) * 0.5 + 0.5
      const glowIntensity = 0.5 + pulse * 0.8
      ctx.shadowColor = "#ff00ff"
      ctx.shadowBlur = 30 * glowIntensity
    }

    // Box shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(-35, -20, 75, 55)

    // Box body
    const gradient = ctx.createLinearGradient(-40, -25, -40, 25)
    gradient.addColorStop(0, "#8b4513")
    gradient.addColorStop(0.5, "#654321")
    gradient.addColorStop(1, "#3d2817")
    ctx.fillStyle = gradient
    ctx.fillRect(-40, -25, 80, 50)

    // Question mark
    ctx.fillStyle = "#ff00ff"
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("?", 0, 0)

    // Cost label
    ctx.shadowBlur = 0 // Clear shadow for text
    ctx.fillStyle = isNearby ? "#ffcc00" : "#aaa"
    ctx.font = "bold 11px sans-serif"
    ctx.fillText(`$${this.cost}`, 0, 35)

    // Interaction hint
    if (isNearby && !this.isOpen) {
      ctx.fillStyle = "#ffcc00"
      ctx.font = "bold 10px sans-serif"
      ctx.fillText("[E] Open", 0, -35)
    }

    ctx.shadowBlur = 0
    ctx.restore()
  }
}

export class VendingMachine {
  x: number
  y: number
  perkType: string
  cost: number

  private static PERK_COLORS: Record<string, string> = {
    juggernog: "#ff0000",
    "speed-cola": "#00ff00",
    "double-tap": "#ffff00",
    "quick-revive": "#00ffff",
    "stamin-up": "#ff8800",
  }

  private static PERK_NAMES: Record<string, string> = {
    juggernog: "Juggernog",
    "speed-cola": "Speed Cola",
    "double-tap": "Double Tap",
    "quick-revive": "Quick Revive",
    "stamin-up": "Stamin-Up",
  }

  constructor(x: number, y: number, perkType: string, cost: number) {
    this.x = x
    this.y = y
    this.perkType = perkType
    this.cost = cost
  }

  isNear(playerX: number, playerY: number, range = 100): boolean {
    const dist = Math.hypot(this.x - playerX, this.y - playerY)
    return dist < range
  }

  render(ctx: CanvasRenderingContext2D, playerX: number, playerY: number) {
    const dist = Math.hypot(this.x - playerX, this.y - playerY)
    const isNearby = dist < 100
    const color = VendingMachine.PERK_COLORS[this.perkType] || "#fff"
    const name = VendingMachine.PERK_NAMES[this.perkType] || this.perkType

    ctx.save()
    ctx.translate(this.x, this.y)

    // Enhanced pulsing glow when nearby
    if (isNearby) {
      const pulse = Math.sin(Date.now() / 500) * 0.5 + 0.5
      const glowIntensity = 0.5 + pulse * 0.7
      ctx.shadowColor = color
      ctx.shadowBlur = 20 * glowIntensity
    }

    // Machine shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(-25, -45, 55, 95)

    // Machine body
    ctx.fillStyle = "#333"
    ctx.fillRect(-30, -50, 60, 100)

    // Colored front panel
    ctx.fillStyle = color
    ctx.globalAlpha = isNearby ? 0.9 : 0.6
    ctx.fillRect(-25, -45, 50, 60)
    ctx.globalAlpha = 1

    // Perk icon
    ctx.fillStyle = "#000"
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("⚡", 0, -15)

    // Clear shadow for text elements
    ctx.shadowBlur = 0

    // Perk name
    ctx.fillStyle = isNearby ? "#fff" : "#aaa"
    ctx.font = "bold 8px sans-serif"
    ctx.fillText(name, 0, 25)

    // Cost
    ctx.fillStyle = isNearby ? "#ffcc00" : "#888"
    ctx.font = "bold 11px sans-serif"
    ctx.fillText(`$${this.cost}`, 0, 40)

    // Interaction hint
    if (isNearby) {
      ctx.fillStyle = "#ffcc00"
      ctx.font = "bold 10px sans-serif"
      ctx.fillText("[E] Buy", 0, -60)
    }

    ctx.shadowBlur = 0
    ctx.restore()
  }
}

export class MaxAmmoBox {
  x: number
  y: number
  cost: number

  constructor(x: number, y: number, cost: number) {
    this.x = x
    this.y = y
    this.cost = cost
  }

  isNear(playerX: number, playerY: number, range = 100): boolean {
    const dist = Math.hypot(this.x - playerX, this.y - playerY)
    return dist < range
  }

  render(ctx: CanvasRenderingContext2D, playerX: number, playerY: number) {
    const dist = Math.hypot(this.x - playerX, this.y - playerY)
    const isNearby = dist < 100

    ctx.save()
    ctx.translate(this.x, this.y)

    // Enhanced pulsing glow when nearby
    if (isNearby) {
      const pulse = Math.sin(Date.now() / 400) * 0.5 + 0.5
      const glowIntensity = 0.5 + pulse * 0.8
      ctx.shadowColor = "#ffcc00"
      ctx.shadowBlur = 25 * glowIntensity
    }

    // Crate shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(-25, -20, 55, 45)

    // Crate body
    ctx.fillStyle = "#2d4a1c"
    ctx.fillRect(-30, -25, 60, 50)

    // Crate stripes
    ctx.fillStyle = "#1a2e10"
    ctx.fillRect(-30, -15, 60, 5)
    ctx.fillRect(-30, 5, 60, 5)

    // Ammo icon
    ctx.fillStyle = isNearby ? "#ffcc00" : "#888"
    ctx.font = "bold 18px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("🔫", 0, -5)

    // Clear shadow for text elements
    ctx.shadowBlur = 0

    // Label
    ctx.fillStyle = isNearby ? "#fff" : "#aaa"
    ctx.font = "bold 9px sans-serif"
    ctx.fillText("MAX AMMO", 0, 35)

    // Cost
    ctx.fillStyle = isNearby ? "#ffcc00" : "#888"
    ctx.font = "bold 11px sans-serif"
    ctx.fillText(`$${this.cost}`, 0, 48)

    // Interaction hint
    if (isNearby) {
      ctx.fillStyle = "#ffcc00"
      ctx.font = "bold 10px sans-serif"
      ctx.fillText("[E] Buy", 0, -35)
    }

    ctx.shadowBlur = 0
    ctx.restore()
  }
}

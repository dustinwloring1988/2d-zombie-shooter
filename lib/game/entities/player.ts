import type { GameMap } from "../map"
import { Bullet } from "./bullet"
import { Grenade, type GrenadeType } from "./grenade"
import { type WeaponData, WEAPONS } from "../weapons"

export interface PlayerWeapon extends WeaponData {
  ammo: number
  reserveAmmo: number
}

export class Player {
  x: number
  y: number
  radius = 20
  angle = 0
  health = 100
  maxHealth = 100
  speed = 200

  weapons: PlayerWeapon[] = []
  currentWeaponIndex = 0
  usingKnife = false
  knifeTimer = 0

  fragGrenade = 0
  stunGrenade = 0
  static MAX_GRENADES = 1

  perks: string[] = []

  private velocityX = 0
  private velocityY = 0
  private targetVelocityX = 0
  private targetVelocityY = 0
  private static ACCELERATION = 12
  private static FRICTION = 10

  private shootCooldown = 0
  private reloading = false
  private reloadTimer = 0
  private regenDelay = 0
  private static REGEN_DELAY = 3000
  private static REGEN_RATE = 5

  private visualX: number
  private visualY: number
  private static VISUAL_SMOOTHING = 0.15

  // Hit effect properties
  private hitTimer = 0
  private static HIT_DURATION = 150 // ms

  // Recoil properties
  private recoilAngle = 0
  private recoilX = 0
  private recoilY = 0
  private recoilDecay = 0
  private static MAX_RECOIL_ANGLE = 0.1
  private static MAX_RECOIL_DISTANCE = 10

  // For muzzle flash effects
  onMuzzleFlash?: (x: number, y: number, angle: number) => void

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
    this.visualX = x
    this.visualY = y

    this.weapons.push({
      ...WEAPONS.pistol,
      ammo: WEAPONS.pistol.maxAmmo,
      reserveAmmo: WEAPONS.pistol.reserveAmmo,
    })

    this.fragGrenade = 1
    this.stunGrenade = 1
  }

  getHealthRatio(): number {
    return this.health / this.maxHealth
  }

  getVisualX(): number {
    return this.visualX
  }

  getVisualY(): number {
    return this.visualY
  }

  getRecoilX(): number {
    return this.recoilX
  }

  getRecoilY(): number {
    return this.recoilY
  }

  getRecoilAngle(): number {
    return this.recoilAngle
  }

  move(dx: number, dy: number, dt: number, gameMap: GameMap) {
    let speed = this.speed
    if (this.perks.includes("stamin-up")) {
      speed *= 1.3
    }

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy)
      this.targetVelocityX = (dx / len) * speed
      this.targetVelocityY = (dy / len) * speed
    } else {
      this.targetVelocityX = 0
      this.targetVelocityY = 0
    }

    const dtSeconds = dt / 1000
    const acceleration = Player.ACCELERATION * dtSeconds
    const friction = Player.FRICTION * dtSeconds

    if (this.targetVelocityX !== 0 || this.targetVelocityY !== 0) {
      // Accelerating
      this.velocityX += (this.targetVelocityX - this.velocityX) * acceleration
      this.velocityY += (this.targetVelocityY - this.velocityY) * acceleration
    } else {
      // Decelerating with friction
      this.velocityX *= Math.max(0, 1 - friction)
      this.velocityY *= Math.max(0, 1 - friction)

      // Snap to zero when very slow
      if (Math.abs(this.velocityX) < 0.1) this.velocityX = 0
      if (Math.abs(this.velocityY) < 0.1) this.velocityY = 0
    }

    // Apply velocity to position
    const newX = this.x + this.velocityX * dtSeconds
    const newY = this.y + this.velocityY * dtSeconds

    // Collision with walls - with velocity reset on collision
    if (!gameMap.isWall(newX, this.y)) {
      this.x = newX
    } else {
      this.velocityX = 0
    }
    if (!gameMap.isWall(this.x, newY)) {
      this.y = newY
    } else {
      this.velocityY = 0
    }

    // Clamp to map bounds
    this.x = Math.max(this.radius, Math.min(this.x, gameMap.width - this.radius))
    this.y = Math.max(this.radius, Math.min(this.y, gameMap.height - this.radius))

    this.visualX += (this.x - this.visualX) * Player.VISUAL_SMOOTHING
    this.visualY += (this.y - this.visualY) * Player.VISUAL_SMOOTHING
  }

  aimAt(worldX: number, worldY: number) {
    this.angle = Math.atan2(worldY - this.y, worldX - this.x)
  }

  aimAtAngle(angle: number) {
    this.angle = angle
  }

  shoot(dt: number): Bullet | null {
    if (this.usingKnife || this.reloading) return null

    this.shootCooldown -= dt
    if (this.shootCooldown > 0) return null

    const weapon = this.getCurrentWeapon()
    if (!weapon) return null

    if (weapon.ammo <= 0) {
      if (weapon.reserveAmmo > 0) {
        this.reload()
      }
      return null
    }

    weapon.ammo--

    let fireRate = weapon.fireRate
    if (this.perks.includes("double-tap")) {
      fireRate *= 0.7
    }
    this.shootCooldown = fireRate

    const bulletSpeed = 800
    const bulletX = this.x + Math.cos(this.angle) * 30
    const bulletY = this.y + Math.sin(this.angle) * 30

    // Add recoil effect
    this.applyRecoil(weapon)

    // Trigger muzzle flash
    if (this.onMuzzleFlash) {
      this.onMuzzleFlash(bulletX, bulletY, this.angle)
    }

    return new Bullet(bulletX, bulletY, this.angle, bulletSpeed, weapon.damage)
  }

  reload() {
    if (this.reloading) return

    const weapon = this.getCurrentWeapon()
    if (!weapon || weapon.ammo === weapon.maxAmmo || weapon.reserveAmmo <= 0) return

    this.reloading = true
    let reloadTime = weapon.reloadTime
    if (this.perks.includes("speed-cola")) {
      reloadTime *= 0.5
    }
    this.reloadTimer = reloadTime
  }

  update(dt: number) {
    // Update reload
    if (this.reloading) {
      this.reloadTimer -= dt
      if (this.reloadTimer <= 0) {
        this.reloading = false
        const weapon = this.getCurrentWeapon()
        if (weapon) {
          const needed = weapon.maxAmmo - weapon.ammo
          const available = Math.min(needed, weapon.reserveAmmo)
          weapon.ammo += available
          weapon.reserveAmmo -= available
        }
      }
    }

    // Update knife cooldown
    if (this.usingKnife) {
      this.knifeTimer -= dt
      if (this.knifeTimer <= 0) {
        this.usingKnife = false
      }
    }

    if (this.regenDelay > 0) {
      this.regenDelay -= dt
    } else if (this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + Player.REGEN_RATE * (dt / 1000))
    }

    // Update hit timer
    if (this.hitTimer > 0) {
      this.hitTimer -= dt
    }

    // Update recoil
    if (Math.abs(this.recoilX) > 0.1 || Math.abs(this.recoilY) > 0.1) {
      this.recoilX *= this.recoilDecay
      this.recoilY *= this.recoilDecay
    } else {
      this.recoilX = 0
      this.recoilY = 0
    }

    if (Math.abs(this.recoilAngle) > 0.001) {
      this.recoilAngle *= this.recoilDecay
    } else {
      this.recoilAngle = 0
    }

    this.visualX += (this.x - this.visualX) * Player.VISUAL_SMOOTHING
    this.visualY += (this.y - this.visualY) * Player.VISUAL_SMOOTHING
  }

  switchWeapon(index: number) {
    if (index < this.weapons.length) {
      this.currentWeaponIndex = index
      this.reloading = false
      this.usingKnife = false
    }
  }

  activateKnife() {
    this.usingKnife = true
    this.knifeTimer = 500
  }

  getCurrentWeapon(): PlayerWeapon | null {
    return this.weapons[this.currentWeaponIndex] || null
  }

  addWeapon(weapon: WeaponData) {
    this.weapons.push({
      ...weapon,
      ammo: weapon.maxAmmo,
      reserveAmmo: weapon.reserveAmmo,
    })
    this.currentWeaponIndex = this.weapons.length - 1
  }

  replaceWeapon(index: number, weapon: WeaponData) {
    this.weapons[index] = {
      ...weapon,
      ammo: weapon.maxAmmo,
      reserveAmmo: weapon.reserveAmmo,
    }
    this.currentWeaponIndex = index
  }

  swapWeapon(index: number, weapon: WeaponData) {
    this.replaceWeapon(index, weapon)
  }

  addPerk(perk: string) {
    if (!this.perks.includes(perk)) {
      this.perks.push(perk)

      if (perk === "juggernog") {
        this.maxHealth = 200
        this.health = Math.min(this.health + 100, this.maxHealth)
      }
    }
  }

  takeDamage(amount: number) {
    this.health -= amount
    if (this.health < 0) this.health = 0
    this.regenDelay = Player.REGEN_DELAY
    // Set hit timer to show hit effect
    this.hitTimer = Player.HIT_DURATION
  }

  applyRecoil(weapon: PlayerWeapon) {
    // Calculate recoil based on weapon properties
    const baseRecoil = weapon.damage * 0.005 // Base recoil factor

    // Set initial recoil values
    this.recoilAngle = -baseRecoil * (Math.random() * 0.5 + 0.75) // Random slight variation in direction

    // Recoil direction based on the weapon's angle and a small random offset
    const recoilAngleOffset = this.angle + (Math.random() * 0.2 - 0.1) // Small angle variation
    const recoilDistance = baseRecoil * 50 // Scale the distance

    this.recoilX = -Math.cos(recoilAngleOffset) * recoilDistance
    this.recoilY = -Math.sin(recoilAngleOffset) * recoilDistance

    // Set decay factor - how quickly recoil returns to normal
    this.recoilDecay = 0.8 // Higher = slower decay
  }

  fullHeal() {
    this.health = this.maxHealth
    this.regenDelay = 0
  }

  maxAmmo() {
    for (const weapon of this.weapons) {
      weapon.reserveAmmo = weapon.maxAmmo * 4
    }
  }

  throwGrenade(targetX: number, targetY: number, type: GrenadeType): Grenade | null {
    if (type === "frag" && this.fragGrenade > 0) {
      this.fragGrenade--
      return new Grenade(this.x, this.y, targetX, targetY, "frag")
    } else if (type === "stun" && this.stunGrenade > 0) {
      this.stunGrenade--
      return new Grenade(this.x, this.y, targetX, targetY, "stun")
    }
    return null
  }

  addGrenade(type: GrenadeType): boolean {
    if (type === "frag" && this.fragGrenade < Player.MAX_GRENADES) {
      this.fragGrenade++
      return true
    } else if (type === "stun" && this.stunGrenade < Player.MAX_GRENADES) {
      this.stunGrenade++
      return true
    }
    return false
  }

  hasGrenade(type: GrenadeType): boolean {
    return type === "frag" ? this.fragGrenade > 0 : this.stunGrenade > 0
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)

    // Apply recoil rotation to visual representation
    const effectiveAngle = this.angle + this.recoilAngle
    ctx.rotate(effectiveAngle)

    // Apply positional recoil effect
    ctx.translate(this.recoilX * 0.1, this.recoilY * 0.1) // Scale down for visual effect

    // Body
    if (this.hitTimer > 0) {
      // Flash when hit
      const flashIntensity = Math.sin(Date.now() / 30) * 0.5 + 0.5
      ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`
    } else {
      ctx.fillStyle = "#4a90d9"
    }
    ctx.beginPath()
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
    ctx.fill()

    // Direction indicator / weapon
    if (this.usingKnife) {
      ctx.fillStyle = "#888"
      ctx.fillRect(15, -3, 20, 6)
    } else {
      ctx.fillStyle = "#333"
      ctx.fillRect(10, -4, 25, 8)
    }

    // Eyes
    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.arc(5, -6, 4, 0, Math.PI * 2)
    ctx.arc(5, 6, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()

    // Health ring
    if (this.health < this.maxHealth) {
      ctx.strokeStyle = `hsl(${(this.health / this.maxHealth) * 120}, 70%, 50%)`
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2 * (this.health / this.maxHealth))
      ctx.stroke()
    }
  }
}

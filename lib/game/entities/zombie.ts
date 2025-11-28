import type { GameMap } from "../map"

interface SteeringForce {
  x: number
  y: number
}

export class Zombie {
  x: number
  y: number
  radius: number
  health: number
  maxHealth: number
  speed: number
  damage: number
  isBoss: boolean
  isExploder: boolean
  isToxic: boolean

  private vx = 0
  private vy = 0
  private readonly maxForce = 0.5
  private readonly separationDistance = 50
  private readonly wallAvoidDistance = 60

  private attackCooldown = 0
  private readonly attackRate = 1000

  private stunTimer = 0
  private baseSpeed: number

  // Hit effect properties
  private hitTimer = 0
  private static HIT_DURATION = 150 // ms

  constructor(x: number, y: number, round: number, isBoss = false, isExploder = false, isToxic = false) {
    this.x = x
    this.y = y
    this.isBoss = isBoss
    this.isExploder = isExploder
    this.isToxic = isToxic

    if (isBoss) {
      this.radius = 40
      this.maxHealth = 500 + round * 100
      this.speed = 60 + round * 2
      this.damage = 50
    } else {
      this.radius = 18
      this.maxHealth = 50 + round * 20
      this.speed = 80 + Math.min(round * 5, 100)
      this.damage = 15 + round * 2
    }

    this.health = this.maxHealth
    this.baseSpeed = this.speed // Store base speed
  }

  stun(duration: number) {
    this.stunTimer = Math.max(this.stunTimer, duration)
  }

  isStunned(): boolean {
    return this.stunTimer > 0
  }

  private seek(targetX: number, targetY: number): SteeringForce {
    const dx = targetX - this.x
    const dy = targetY - this.y
    const dist = Math.hypot(dx, dy)

    if (dist === 0) return { x: 0, y: 0 }

    // Normalize and scale by speed
    const desiredVx = (dx / dist) * this.speed
    const desiredVy = (dy / dist) * this.speed

    // Calculate steering force (desired - current)
    return {
      x: desiredVx - this.vx,
      y: desiredVy - this.vy,
    }
  }

  private separate(zombies: Zombie[]): SteeringForce {
    let steerX = 0
    let steerY = 0
    let count = 0

    for (const other of zombies) {
      if (other === this) continue

      const dx = this.x - other.x
      const dy = this.y - other.y
      const dist = Math.hypot(dx, dy)
      const minDist = this.radius + other.radius + this.separationDistance

      if (dist > 0 && dist < minDist) {
        // Weight by inverse distance (closer = stronger repulsion)
        const force = (minDist - dist) / minDist
        steerX += (dx / dist) * force * 2
        steerY += (dy / dist) * force * 2
        count++
      }
    }

    if (count > 0) {
      steerX /= count
      steerY /= count
    }

    return { x: steerX * this.speed, y: steerY * this.speed }
  }

  private avoidWalls(gameMap: GameMap): SteeringForce {
    let steerX = 0
    let steerY = 0
    const checkDist = this.wallAvoidDistance
    const angles = [
      0,
      Math.PI / 4,
      -Math.PI / 4,
      Math.PI / 2,
      -Math.PI / 2,
      (Math.PI * 3) / 4,
      (-Math.PI * 3) / 4,
      Math.PI,
    ]

    // Get current movement direction
    const moveAngle = Math.atan2(this.vy, this.vx)

    for (const offsetAngle of angles) {
      const angle = moveAngle + offsetAngle
      const checkX = this.x + Math.cos(angle) * checkDist
      const checkY = this.y + Math.sin(angle) * checkDist

      if (gameMap.isWall(checkX, checkY)) {
        // Push away from wall
        const force = Math.abs(offsetAngle) < Math.PI / 2 ? 2 : 1
        steerX -= Math.cos(angle) * force
        steerY -= Math.sin(angle) * force
      }
    }

    return { x: steerX * this.speed * 0.5, y: steerY * this.speed * 0.5 }
  }

  private findPathAround(targetX: number, targetY: number, gameMap: GameMap): SteeringForce {
    const dx = targetX - this.x
    const dy = targetY - this.y
    const directAngle = Math.atan2(dy, dx)
    const checkDist = 40

    // Check if direct path is blocked
    const checkX = this.x + Math.cos(directAngle) * checkDist
    const checkY = this.y + Math.sin(directAngle) * checkDist

    if (!gameMap.isWall(checkX, checkY)) {
      return { x: 0, y: 0 } // Direct path is clear
    }

    // Try alternative angles to find clear path
    for (let offset = Math.PI / 6; offset <= Math.PI; offset += Math.PI / 6) {
      for (const sign of [1, -1]) {
        const testAngle = directAngle + offset * sign
        const testX = this.x + Math.cos(testAngle) * checkDist
        const testY = this.y + Math.sin(testAngle) * checkDist

        if (!gameMap.isWall(testX, testY)) {
          return {
            x: Math.cos(testAngle) * this.speed * 0.8,
            y: Math.sin(testAngle) * this.speed * 0.8,
          }
        }
      }
    }

    return { x: 0, y: 0 }
  }

  moveToward(targetX: number, targetY: number, dt: number, gameMap: GameMap, allZombies: Zombie[] = []) {
    if (this.stunTimer > 0) {
      this.stunTimer -= dt
      this.vx *= 0.9 // Slow down while stunned
      this.vy *= 0.9

      // Still update attack cooldown
      if (this.attackCooldown > 0) {
        this.attackCooldown -= dt
      }

      // Update hit timer
      if (this.hitTimer > 0) {
        this.hitTimer -= dt
      }

      return
    }

    const dtSeconds = dt / 1000

    // Calculate all steering forces
    const seekForce = this.seek(targetX, targetY)
    const separateForce = this.separate(allZombies)
    const wallForce = this.avoidWalls(gameMap)
    const pathForce = this.findPathAround(targetX, targetY, gameMap)

    // Combine forces with weights
    let totalForceX = seekForce.x * 1.0 + separateForce.x * 1.5 + wallForce.x * 2.0 + pathForce.x * 1.2
    let totalForceY = seekForce.y * 1.0 + separateForce.y * 1.5 + wallForce.y * 2.0 + pathForce.y * 1.2

    // Limit force magnitude
    const forceMag = Math.hypot(totalForceX, totalForceY)
    const maxTotalForce = this.speed * this.maxForce
    if (forceMag > maxTotalForce) {
      totalForceX = (totalForceX / forceMag) * maxTotalForce
      totalForceY = (totalForceY / forceMag) * maxTotalForce
    }

    // Apply force to velocity (smooth acceleration)
    this.vx += totalForceX * dtSeconds
    this.vy += totalForceY * dtSeconds

    // Limit velocity to max speed
    const velMag = Math.hypot(this.vx, this.vy)
    if (velMag > this.speed) {
      this.vx = (this.vx / velMag) * this.speed
      this.vy = (this.vy / velMag) * this.speed
    }

    // Calculate new position
    const newX = this.x + this.vx * dtSeconds
    const newY = this.y + this.vy * dtSeconds

    // Collision resolution with sliding
    const canMoveX = !gameMap.isWall(newX + (this.vx > 0 ? this.radius : -this.radius), this.y)
    const canMoveY = !gameMap.isWall(this.x, newY + (this.vy > 0 ? this.radius : -this.radius))

    if (canMoveX) {
      this.x = newX
    } else {
      this.vx *= -0.3 // Bounce off wall slightly
    }

    if (canMoveY) {
      this.y = newY
    } else {
      this.vy *= -0.3 // Bounce off wall slightly
    }

    // Update attack cooldown
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt
    }

    // Update hit timer
    if (this.hitTimer > 0) {
      this.hitTimer -= dt
    }
  }

  canAttack(): boolean {
    return this.attackCooldown <= 0
  }

  attack(): number {
    this.attackCooldown = this.attackRate
    return this.damage
  }

  takeDamage(amount: number) {
    this.health -= amount
    // Set hit timer to show hit effect
    this.hitTimer = Zombie.HIT_DURATION
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)

    const angle = Math.atan2(this.vy, this.vx)
    ctx.rotate(angle + Math.PI / 2)

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.beginPath()
    ctx.ellipse(0, this.radius * 0.3, this.radius * 0.8, this.radius * 0.3, 0, 0, Math.PI * 2)
    ctx.fill()

    // Body color based on type
    let bodyColor = "#5a8f5a"
    if (this.isBoss) {
      bodyColor = "#8b0000"
    } else if (this.isExploder) {
      bodyColor = "#ff6600"
    } else if (this.isToxic) {
      bodyColor = "#00ff00"
    }

    if (this.stunTimer > 0) {
      bodyColor = "#6699ff" // Blue tint when stunned
    }

    // White flash when hit
    if (this.hitTimer > 0) {
      bodyColor = "#ffffff"
      // Flash effect - make it pulse
      const flashIntensity = Math.sin(Date.now() / 50) * 0.5 + 0.5
      ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`
    } else {
      ctx.fillStyle = bodyColor
    }

    // Body
    ctx.beginPath()
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2)
    ctx.fill()

    // Darker outline
    ctx.strokeStyle = "#2d4f2d"
    ctx.lineWidth = 2
    ctx.stroke()

    // Eyes (facing forward)
    ctx.fillStyle = "#ff0000"
    ctx.beginPath()
    ctx.arc(-this.radius * 0.3, -this.radius * 0.4, this.radius * 0.2, 0, Math.PI * 2)
    ctx.arc(this.radius * 0.3, -this.radius * 0.4, this.radius * 0.2, 0, Math.PI * 2)
    ctx.fill()

    // Mouth
    ctx.strokeStyle = "#2d4f2d"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, this.radius * 0.1, this.radius * 0.4, 0.2, Math.PI - 0.2)
    ctx.stroke()

    ctx.restore()

    // Health bar for damaged zombies (don't rotate)
    if (this.health < this.maxHealth) {
      const barWidth = this.radius * 2
      const barHeight = 4
      const healthPercent = this.health / this.maxHealth

      ctx.fillStyle = "#333"
      ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 15, barWidth, barHeight)

      ctx.fillStyle = this.isBoss ? "#ff0000" : "#00ff00"
      ctx.fillRect(this.x - barWidth / 2, this.y - this.radius - 15, barWidth * healthPercent, barHeight)
    }

    // Boss crown (don't rotate)
    if (this.isBoss) {
      ctx.fillStyle = "#ffd700"
      ctx.beginPath()
      ctx.moveTo(this.x - 15, this.y - this.radius - 10)
      ctx.lineTo(this.x - 10, this.y - this.radius - 20)
      ctx.lineTo(this.x - 5, this.y - this.radius - 10)
      ctx.lineTo(this.x, this.y - this.radius - 25)
      ctx.lineTo(this.x + 5, this.y - this.radius - 10)
      ctx.lineTo(this.x + 10, this.y - this.radius - 20)
      ctx.lineTo(this.x + 15, this.y - this.radius - 10)
      ctx.fill()
    }
  }
}

export class Bullet {
  x: number
  y: number
  angle: number
  speed: number
  damage: number

  constructor(x: number, y: number, angle: number, speed: number, damage: number) {
    this.x = x
    this.y = y
    this.angle = angle
    this.speed = speed
    this.damage = damage
  }

  update(dt: number) {
    this.x += Math.cos(this.angle) * this.speed * (dt / 1000)
    this.y += Math.sin(this.angle) * this.speed * (dt / 1000)
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.angle)

    // Bullet trail
    const gradient = ctx.createLinearGradient(-15, 0, 5, 0)
    gradient.addColorStop(0, "transparent")
    gradient.addColorStop(1, "#ffcc00")

    ctx.fillStyle = gradient
    ctx.fillRect(-15, -2, 20, 4)

    // Bullet head
    ctx.fillStyle = "#ffcc00"
    ctx.beginPath()
    ctx.arc(0, 0, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}

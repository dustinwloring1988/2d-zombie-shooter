export interface FloatingText {
  x: number
  y: number
  text: string
  color: string
  life: number
  maxLife: number
  velocityY: number
  size: number
  update(dt: number): boolean // returns true if still alive
  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, zoom: number): void
}

class BaseFloatingText implements FloatingText {
  x: number
  y: number
  text: string
  color: string
  life: number
  maxLife: number
  velocityY: number
  size: number

  constructor(
    x: number,
    y: number,
    text: string,
    color: string = "#ffffff",
    life: number = 1500,
    velocityY: number = -100,
    size: number = 16
  ) {
    this.x = x
    this.y = y
    this.text = text
    this.color = color
    this.life = life
    this.maxLife = life
    this.velocityY = velocityY
    this.size = size
  }

  update(dt: number): boolean {
    // Move upward
    this.y += this.velocityY * (dt / 1000)
    
    // Reduce life
    this.life -= dt
    
    return this.life > 0
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, zoom: number): void {
    // Calculate screen position
    const screenX = (this.x - cameraX) * zoom + ctx.canvas.width / 2
    const screenY = (this.y - cameraY) * zoom + ctx.canvas.height / 2
    
    // Only render if on screen
    if (screenX < -100 || screenX > ctx.canvas.width + 100 || screenY < -100 || screenY > ctx.canvas.height + 100) {
      return
    }
    
    const lifeRatio = this.life / this.maxLife
    const alpha = Math.min(1, lifeRatio * 2) // Fade out in the last half of life
    
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = `${this.size}px 'Geist', sans-serif`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = this.color
    
    // Add outline for better readability
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)"
    ctx.lineWidth = 2
    ctx.strokeText(this.text, screenX, screenY)
    ctx.fillText(this.text, screenX, screenY)
    
    ctx.restore()
  }
}

export class FloatingTextSystem {
  private texts: FloatingText[] = []

  addText(x: number, y: number, text: string, options?: {
    color?: string
    life?: number
    velocityY?: number
    size?: number
  }) {
    const floatingText = new BaseFloatingText(
      x,
      y,
      text,
      options?.color || "#ffffff",
      options?.life || 1500,
      options?.velocityY || -100,
      options?.size || 16
    )
    
    this.texts.push(floatingText)
  }

  update(dt: number) {
    for (let i = this.texts.length - 1; i >= 0; i--) {
      if (!this.texts[i].update(dt)) {
        this.texts.splice(i, 1)
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, zoom: number) {
    for (const text of this.texts) {
      text.render(ctx, cameraX, cameraY, zoom)
    }
  }

  clear() {
    this.texts = []
  }
}
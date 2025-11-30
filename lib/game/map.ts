interface Wall {
  x: number
  y: number
  width: number
  height: number
}

interface Door {
  id: string
  x: number
  y: number
  width: number
  height: number
  cost: number
  isOpen: boolean
  roomId: string
}

interface SpawnPoint {
  x: number
  y: number
  roomId: string
}

export class GameMap {
  width: number
  height: number
  walls: Wall[] = []
  doors: Door[] = []
  spawnPoints: SpawnPoint[] = []
  unlockedRooms: Set<string> = new Set(["start"])
  protected tileSize = 80

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.generateMap()
  }

  private generateMap() {
    // Outer walls
    this.walls.push({ x: 0, y: 0, width: this.width, height: 40 }) // Top
    this.walls.push({ x: 0, y: this.height - 40, width: this.width, height: 40 }) // Bottom
    this.walls.push({ x: 0, y: 0, width: 40, height: this.height }) // Left
    this.walls.push({ x: this.width - 40, y: 0, width: 40, height: this.height }) // Right

    // Starting room center area walls
    this.walls.push({ x: 800, y: 800, width: 30, height: 300 })
    this.walls.push({ x: 800, y: 1200, width: 30, height: 300 })
    this.walls.push({ x: 1600, y: 800, width: 30, height: 300 })
    this.walls.push({ x: 1600, y: 1200, width: 30, height: 300 })
    this.walls.push({ x: 800, y: 800, width: 300, height: 30 })
    this.walls.push({ x: 1200, y: 800, width: 430, height: 30 })
    this.walls.push({ x: 800, y: 1500, width: 300, height: 30 })
    this.walls.push({ x: 1200, y: 1500, width: 430, height: 30 })

    // North wing walls
    this.walls.push({ x: 400, y: 400, width: 500, height: 30 })
    this.walls.push({ x: 1100, y: 400, width: 500, height: 30 })
    this.walls.push({ x: 1800, y: 400, width: 300, height: 30 })
    this.walls.push({ x: 400, y: 400, width: 30, height: 350 })
    this.walls.push({ x: 2100, y: 400, width: 30, height: 350 })

    // South wing walls
    this.walls.push({ x: 400, y: 1900, width: 500, height: 30 })
    this.walls.push({ x: 1100, y: 1900, width: 500, height: 30 })
    this.walls.push({ x: 1800, y: 1900, width: 300, height: 30 })
    this.walls.push({ x: 400, y: 1600, width: 30, height: 330 })
    this.walls.push({ x: 2100, y: 1600, width: 30, height: 330 })

    // West wing walls
    this.walls.push({ x: 300, y: 900, width: 30, height: 250 })
    this.walls.push({ x: 300, y: 1250, width: 30, height: 250 })
    this.walls.push({ x: 100, y: 900, width: 200, height: 30 })
    this.walls.push({ x: 100, y: 1500, width: 200, height: 30 })

    // East wing walls
    this.walls.push({ x: 2100, y: 900, width: 30, height: 250 })
    this.walls.push({ x: 2100, y: 1250, width: 30, height: 250 })
    this.walls.push({ x: 2100, y: 900, width: 200, height: 30 })
    this.walls.push({ x: 2100, y: 1500, width: 200, height: 30 })

    this.doors = [
      // North door (from start to north wing)
      { id: "door-north", x: 1100, y: 800, width: 100, height: 30, cost: 750, isOpen: false, roomId: "north" },
      // South door (from start to south wing)
      { id: "door-south", x: 1100, y: 1500, width: 100, height: 30, cost: 750, isOpen: false, roomId: "south" },
      // West door (from start to west wing)
      { id: "door-west", x: 800, y: 1100, width: 30, height: 100, cost: 1000, isOpen: false, roomId: "west" },
      // East door (from start to east wing)
      { id: "door-east", x: 1600, y: 1100, width: 30, height: 100, cost: 1000, isOpen: false, roomId: "east" },
      // North-East secret room
      { id: "door-ne", x: 1800, y: 400, width: 100, height: 30, cost: 1500, isOpen: false, roomId: "secret-ne" },
      // South-West secret room
      { id: "door-sw", x: 400, y: 1900, width: 100, height: 30, cost: 1500, isOpen: false, roomId: "secret-sw" },
    ]

    this.spawnPoints = [
      // Start room spawns (always active)
      { x: 900, y: 900, roomId: "start" },
      { x: 1500, y: 900, roomId: "start" },
      { x: 900, y: 1400, roomId: "start" },
      { x: 1500, y: 1400, roomId: "start" },
      // North wing spawns
      { x: 600, y: 300, roomId: "north" },
      { x: 1200, y: 300, roomId: "north" },
      { x: 1800, y: 300, roomId: "north" },
      // South wing spawns
      { x: 600, y: 2000, roomId: "south" },
      { x: 1200, y: 2000, roomId: "south" },
      { x: 1800, y: 2000, roomId: "south" },
      // West wing spawns
      { x: 150, y: 1000, roomId: "west" },
      { x: 150, y: 1400, roomId: "west" },
      // East wing spawns
      { x: 2250, y: 1000, roomId: "east" },
      { x: 2250, y: 1400, roomId: "east" },
      // Secret rooms
      { x: 2000, y: 200, roomId: "secret-ne" },
      { x: 200, y: 2100, roomId: "secret-sw" },
    ]
  }

  getActiveSpawnPoints(): SpawnPoint[] {
    return this.spawnPoints.filter((sp) => this.unlockedRooms.has(sp.roomId))
  }

  purchaseDoor(doorId: string): boolean {
    const door = this.doors.find((d) => d.id === doorId)
    if (door && !door.isOpen) {
      door.isOpen = true
      this.unlockedRooms.add(door.roomId)
      return true
    }
    return false
  }

  getDoorNear(x: number, y: number, range = 80): Door | null {
    for (const door of this.doors) {
      if (door.isOpen) continue
      const doorCenterX = door.x + door.width / 2
      const doorCenterY = door.y + door.height / 2
      const dist = Math.hypot(x - doorCenterX, y - doorCenterY)
      if (dist < range) {
        return door
      }
    }
    return null
  }

  isWall(x: number, y: number): boolean {
    for (const wall of this.walls) {
      if (x >= wall.x && x <= wall.x + wall.width && y >= wall.y && y <= wall.y + wall.height) {
        return true
      }
    }
    for (const door of this.doors) {
      if (!door.isOpen) {
        if (x >= door.x && x <= door.x + door.width && y >= door.y && y <= door.y + door.height) {
          return true
        }
      }
    }
    return false
  }

  render(ctx: CanvasRenderingContext2D) {
    // Floor
    ctx.fillStyle = "#2a2a2a"
    ctx.fillRect(0, 0, this.width, this.height)

    // Floor tiles pattern
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 1
    for (let x = 0; x < this.width; x += this.tileSize) {
      for (let y = 0; y < this.height; y += this.tileSize) {
        ctx.strokeRect(x, y, this.tileSize, this.tileSize)
      }
    }

    for (const door of this.doors) {
      if (!door.isOpen) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
        // Shade the locked area slightly
      }
    }

    // Walls
    for (const wall of this.walls) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
      ctx.fillRect(wall.x + 5, wall.y + 5, wall.width, wall.height)

      const gradient = ctx.createLinearGradient(wall.x, wall.y, wall.x, wall.y + wall.height)
      gradient.addColorStop(0, "#555")
      gradient.addColorStop(1, "#333")
      ctx.fillStyle = gradient
      ctx.fillRect(wall.x, wall.y, wall.width, wall.height)

      ctx.fillStyle = "#666"
      ctx.fillRect(wall.x, wall.y, wall.width, 3)
    }

    for (const door of this.doors) {
      if (door.isOpen) {
        // Open door - render as floor with frame
        ctx.fillStyle = "#3a3a3a"
        ctx.fillRect(door.x, door.y, door.width, door.height)
        ctx.strokeStyle = "#555"
        ctx.lineWidth = 2
        ctx.strokeRect(door.x, door.y, door.width, door.height)
      } else {
        // Closed door - render as interactive barrier
        const gradient = ctx.createLinearGradient(door.x, door.y, door.x + door.width, door.y + door.height)
        gradient.addColorStop(0, "#8B4513")
        gradient.addColorStop(0.5, "#A0522D")
        gradient.addColorStop(1, "#8B4513")
        ctx.fillStyle = gradient
        ctx.fillRect(door.x, door.y, door.width, door.height)

        // Door frame
        ctx.strokeStyle = "#654321"
        ctx.lineWidth = 3
        ctx.strokeRect(door.x, door.y, door.width, door.height)

        // Door handle
        const handleX = door.width > door.height ? door.x + door.width - 15 : door.x + door.width / 2
        const handleY = door.width > door.height ? door.y + door.height / 2 : door.y + door.height - 15
        ctx.fillStyle = "#FFD700"
        ctx.beginPath()
        ctx.arc(handleX, handleY, 5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  renderDoorPrompts(ctx: CanvasRenderingContext2D, playerX: number, playerY: number) {
    for (const door of this.doors) {
      if (door.isOpen) continue

      const doorCenterX = door.x + door.width / 2
      const doorCenterY = door.y + door.height / 2
      const dist = Math.hypot(playerX - doorCenterX, playerY - doorCenterY)

      if (dist < 100) {
        ctx.save()
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
        ctx.beginPath()
        ctx.roundRect(doorCenterX - 60, doorCenterY - 45, 120, 50, 8)
        ctx.fill()

        ctx.fillStyle = "#FFD700"
        ctx.font = "bold 14px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`$${door.cost}`, doorCenterX, doorCenterY - 25)

        ctx.fillStyle = "#fff"
        ctx.font = "12px sans-serif"
        ctx.fillText("[E] Open Door", doorCenterX, doorCenterY - 8)
        ctx.restore()
      }
    }
  }
}

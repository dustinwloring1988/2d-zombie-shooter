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
  buildingId: string // Added to group doors by building
}

interface SpawnPoint {
  x: number
  y: number
  roomId: string
}

interface PowerSwitch {
  x: number
  y: number
  buildingId: string
  isOn: boolean
}

interface VendingMachine {
  x: number
  y: number
  perkType: string
  cost: number
  buildingId: string
  powered: boolean
}

interface MysteryBox {
  x: number
  y: number
  buildingId: string | null // null when not in a building
  available: boolean
}

export class GameMapLevel2 {
  width: number
  height: number
  walls: Wall[] = []
  doors: Door[] = []
  spawnPoints: SpawnPoint[] = []
  powerSwitches: PowerSwitch[] = []
  vendingMachines: VendingMachine[] = []
  mysteryBox: MysteryBox = { x: 1200, y: 1200, buildingId: null, available: true }
  unlockedRooms: Set<string> = new Set(["start"])
  unlockedBuildings: Set<string> = new Set()
  poweredBuildings: Set<string> = new Set() // Track which buildings have power
  mysteryBoxUses: number = 0
  maxMysteryBoxUses: number = 0 // Will be set to 3-6 when used
  mysteryBoxPositions: { x: number; y: number; buildingId: string }[] = []
  mysteryBoxCurrentPosition: number = 0

  private tileSize = 80

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.generateMap()
    this.setupMysteryBoxPositions()
  }

  private generateMap() {
    // Outer walls
    this.walls.push({ x: 0, y: 0, width: this.width, height: 40 }) // Top
    this.walls.push({ x: 0, y: this.height - 40, width: this.width, height: 40 }) // Bottom
    this.walls.push({ x: 0, y: 0, width: 40, height: this.height }) // Left
    this.walls.push({ x: this.width - 40, y: 0, width: 40, height: this.height }) // Right

    // Starting room - has max ammo box and single weapon
    this.walls.push({ x: 900, y: 900, width: 600, height: 30 }) // Top
    this.walls.push({ x: 900, y: 900, width: 30, height: 600 }) // Left
    this.walls.push({ x: 1470, y: 900, width: 30, height: 600 }) // Right
    this.walls.push({ x: 900, y: 1470, width: 600, height: 30 }) // Bottom

    // Building 1 (North) - Medium building with 2 doors
    this.walls.push({ x: 900, y: 300, width: 600, height: 30 }) // Top
    this.walls.push({ x: 900, y: 300, width: 30, height: 350 }) // Left
    this.walls.push({ x: 1470, y: 300, width: 30, height: 350 }) // Right
    this.walls.push({ x: 900, y: 650, width: 600, height: 30 }) // Bottom

    // Building 2 (Northeast) - Small building with 1 door
    this.walls.push({ x: 1500, y: 300, width: 500, height: 30 }) // Top
    this.walls.push({ x: 1500, y: 300, width: 30, height: 350 }) // Left
    this.walls.push({ x: 1970, y: 300, width: 30, height: 350 }) // Right
    this.walls.push({ x: 1500, y: 650, width: 500, height: 30 }) // Bottom

    // Building 3 (East) - Large building with 3 doors
    this.walls.push({ x: 1500, y: 900, width: 30, height: 600 }) // Left
    this.walls.push({ x: 2100, y: 900, width: 300, height: 30 }) // Top
    this.walls.push({ x: 2100, y: 1470, width: 300, height: 30 }) // Bottom
    this.walls.push({ x: 2370, y: 900, width: 30, height: 600 }) // Right

    // Building 4 (Southeast) - Medium building with 2 doors
    this.walls.push({ x: 1500, y: 1500, width: 600, height: 30 }) // Top
    this.walls.push({ x: 1500, y: 1500, width: 30, height: 350 }) // Left
    this.walls.push({ x: 2070, y: 1500, width: 30, height: 350 }) // Right
    this.walls.push({ x: 1500, y: 1850, width: 600, height: 30 }) // Bottom

    // Building 5 (South) - Small building with 1 door
    this.walls.push({ x: 900, y: 1500, width: 600, height: 30 }) // Top
    this.walls.push({ x: 900, y: 1500, width: 30, height: 350 }) // Left
    this.walls.push({ x: 1470, y: 1500, width: 30, height: 350 }) // Right
    this.walls.push({ x: 900, y: 1850, width: 600, height: 30 }) // Bottom

    // Building 6 (Southwest) - Medium building with 2 doors
    this.walls.push({ x: 300, y: 1500, width: 600, height: 30 }) // Top
    this.walls.push({ x: 300, y: 1500, width: 30, height: 350 }) // Left
    this.walls.push({ x: 870, y: 1500, width: 30, height: 350 }) // Right
    this.walls.push({ x: 300, y: 1850, width: 600, height: 30 }) // Bottom

    // Building 7 (West) - Large building with 3 doors
    this.walls.push({ x: 300, y: 900, width: 30, height: 600 }) // Right
    this.walls.push({ x: 30, y: 900, width: 270, height: 30 }) // Top
    this.walls.push({ x: 30, y: 1470, width: 270, height: 30 }) // Bottom
    this.walls.push({ x: 30, y: 900, width: 30, height: 600 }) // Left

    // Building 8 (Northwest) - Medium building with 2 doors
    this.walls.push({ x: 300, y: 300, width: 600, height: 30 }) // Top
    this.walls.push({ x: 300, y: 300, width: 30, height: 350 }) // Left
    this.walls.push({ x: 870, y: 300, width: 30, height: 350 }) // Right
    this.walls.push({ x: 300, y: 650, width: 600, height: 30 }) // Bottom

    // Grass areas between buildings
    // Center grass area already exists as starting room

    // Create doors for each building - all doors in same building have same cost
    this.doors = [
      // Building 1 doors (North - 2 doors)
      { id: "door-b1-1", x: 1000, y: 300, width: 100, height: 30, cost: 600, isOpen: false, roomId: "building1", buildingId: "building1" },
      { id: "door-b1-2", x: 1300, y: 300, width: 100, height: 30, cost: 600, isOpen: false, roomId: "building1", buildingId: "building1" },

      // Building 2 doors (Northeast - 1 door)
      { id: "door-b2-1", x: 1700, y: 300, width: 100, height: 30, cost: 700, isOpen: false, roomId: "building2", buildingId: "building2" },

      // Building 3 doors (East - 3 doors)
      { id: "door-b3-1", x: 1500, y: 1000, width: 30, height: 100, cost: 800, isOpen: false, roomId: "building3", buildingId: "building3" },
      { id: "door-b3-2", x: 1500, y: 1250, width: 30, height: 100, cost: 800, isOpen: false, roomId: "building3", buildingId: "building3" },
      { id: "door-b3-3", x: 1500, y: 1400, width: 30, height: 100, cost: 800, isOpen: false, roomId: "building3", buildingId: "building3" },

      // Building 4 doors (Southeast - 2 doors)
      { id: "door-b4-1", x: 1700, y: 1500, width: 100, height: 30, cost: 750, isOpen: false, roomId: "building4", buildingId: "building4" },
      { id: "door-b4-2", x: 1900, y: 1500, width: 100, height: 30, cost: 750, isOpen: false, roomId: "building4", buildingId: "building4" },

      // Building 5 doors (South - 1 door)
      { id: "door-b5-1", x: 1200, y: 1500, width: 100, height: 30, cost: 650, isOpen: false, roomId: "building5", buildingId: "building5" },

      // Building 6 doors (Southwest - 2 doors)
      { id: "door-b6-1", x: 500, y: 1500, width: 100, height: 30, cost: 650, isOpen: false, roomId: "building6", buildingId: "building6" },
      { id: "door-b6-2", x: 700, y: 1500, width: 100, height: 30, cost: 650, isOpen: false, roomId: "building6", buildingId: "building6" },

      // Building 7 doors (West - 3 doors)
      { id: "door-b7-1", x: 300, y: 1000, width: 30, height: 100, cost: 800, isOpen: false, roomId: "building7", buildingId: "building7" },
      { id: "door-b7-2", x: 300, y: 1250, width: 30, height: 100, cost: 800, isOpen: false, roomId: "building7", buildingId: "building7" },
      { id: "door-b7-3", x: 300, y: 1400, width: 30, height: 100, cost: 800, isOpen: false, roomId: "building7", buildingId: "building7" },

      // Building 8 doors (Northwest - 2 doors)
      { id: "door-b8-1", x: 500, y: 300, width: 100, height: 30, cost: 600, isOpen: false, roomId: "building8", buildingId: "building8" },
      { id: "door-b8-2", x: 700, y: 300, width: 100, height: 30, cost: 600, isOpen: false, roomId: "building8", buildingId: "building8" },
    ]

    // Spawn points for each building
    this.spawnPoints = [
      // Start room spawns
      { x: 1100, y: 1000, roomId: "start" },
      { x: 1300, y: 1000, roomId: "start" },
      { x: 1100, y: 1400, roomId: "start" },
      { x: 1300, y: 1400, roomId: "start" },

      // Building 1 spawns
      { x: 1100, y: 400, roomId: "building1" },
      { x: 1300, y: 400, roomId: "building1" },
      { x: 1200, y: 550, roomId: "building1" },

      // Building 2 spawns
      { x: 1700, y: 400, roomId: "building2" },
      { x: 1800, y: 400, roomId: "building2" },
      { x: 1750, y: 550, roomId: "building2" },

      // Building 3 spawns
      { x: 2200, y: 1000, roomId: "building3" },
      { x: 2200, y: 1200, roomId: "building3" },
      { x: 2200, y: 1400, roomId: "building3" },

      // Building 4 spawns
      { x: 1700, y: 1600, roomId: "building4" },
      { x: 1900, y: 1600, roomId: "building4" },
      { x: 1800, y: 1750, roomId: "building4" },

      // Building 5 spawns
      { x: 1100, y: 1600, roomId: "building5" },
      { x: 1300, y: 1600, roomId: "building5" },
      { x: 1200, y: 1750, roomId: "building5" },

      // Building 6 spawns
      { x: 500, y: 1600, roomId: "building6" },
      { x: 700, y: 1600, roomId: "building6" },
      { x: 600, y: 1750, roomId: "building6" },

      // Building 7 spawns
      { x: 200, y: 1000, roomId: "building7" },
      { x: 200, y: 1200, roomId: "building7" },
      { x: 200, y: 1400, roomId: "building7" },

      // Building 8 spawns
      { x: 500, y: 400, roomId: "building8" },
      { x: 700, y: 400, roomId: "building8" },
      { x: 600, y: 550, roomId: "building8" },
    ]

    // Power switches for each building (for vending machines)
    this.powerSwitches = [
      { x: 1200, y: 450, buildingId: "building1", isOn: false }, // Building 1
      { x: 1750, y: 450, buildingId: "building2", isOn: false }, // Building 2
      { x: 2300, y: 1200, buildingId: "building3", isOn: false }, // Building 3
      { x: 1800, y: 1700, buildingId: "building4", isOn: false }, // Building 4
      { x: 1200, y: 1700, buildingId: "building5", isOn: false }, // Building 5
      { x: 600, y: 1700, buildingId: "building6", isOn: false }, // Building 6
      { x: 100, y: 1200, buildingId: "building7", isOn: false }, // Building 7
      { x: 600, y: 450, buildingId: "building8", isOn: false }, // Building 8
    ]

    // Vending machines for each building (require power to use)
    this.vendingMachines = [
      // Building 1
      { x: 1100, y: 500, perkType: "juggernog", cost: 2500, buildingId: "building1", powered: false },
      // Building 2
      { x: 1800, y: 500, perkType: "speed-cola", cost: 3000, buildingId: "building2", powered: false },
      // Building 3
      { x: 2250, y: 1050, perkType: "double-tap", cost: 2000, buildingId: "building3", powered: false },
      { x: 2250, y: 1350, perkType: "stamin-up", cost: 2000, buildingId: "building3", powered: false },
      // Building 4
      { x: 1850, y: 1650, perkType: "quick-revive", cost: 1500, buildingId: "building4", powered: false },
      // Building 5
      { x: 1250, y: 1650, perkType: "juggernog", cost: 2500, buildingId: "building5", powered: false },
      // Building 6
      { x: 650, y: 1650, perkType: "speed-cola", cost: 3000, buildingId: "building6", powered: false },
      // Building 7
      { x: 150, y: 1050, perkType: "double-tap", cost: 2000, buildingId: "building7", powered: false },
      { x: 150, y: 1350, perkType: "stamin-up", cost: 2000, buildingId: "building7", powered: false },
      { x: 150, y: 1250, perkType: "quick-revive", cost: 1500, buildingId: "building7", powered: false },
      // Building 8
      { x: 650, y: 500, perkType: "juggernog", cost: 2500, buildingId: "building8", powered: false },
    ]
  }

  private setupMysteryBoxPositions() {
    // Define possible mystery box positions across different buildings
    this.mysteryBoxPositions = [
      { x: 1100, y: 450, buildingId: "building1" },
      { x: 1750, y: 450, buildingId: "building2" },
      { x: 2250, y: 1200, buildingId: "building3" },
      { x: 1800, y: 1700, buildingId: "building4" },
      { x: 1200, y: 1700, buildingId: "building5" },
      { x: 600, y: 1700, buildingId: "building6" },
      { x: 150, y: 1200, buildingId: "building7" },
      { x: 600, y: 450, buildingId: "building8" },
    ];

    // Set initial position
    const initialPos = this.mysteryBoxPositions[0];
    this.mysteryBox.x = initialPos.x;
    this.mysteryBox.y = initialPos.y;
    this.mysteryBox.buildingId = initialPos.buildingId;
  }

  moveMysteryBox() {
    // Find next valid position that's in an unlocked building
    let validPositions = this.mysteryBoxPositions.filter(pos =>
      this.unlockedBuildings.has(pos.buildingId)
    );

    // If no unlocked buildings yet, use the first position
    if (validPositions.length === 0) {
      validPositions = this.mysteryBoxPositions;
    }

    // Select a random position from valid ones
    if (validPositions.length > 0) {
      const randomPos = validPositions[Math.floor(Math.random() * validPositions.length)];
      this.mysteryBox.x = randomPos.x;
      this.mysteryBox.y = randomPos.y;
      this.mysteryBox.buildingId = randomPos.buildingId;
      this.mysteryBox.available = true;
    }
  }

  // Method to use mystery box (when player interacts with it)
  useMysteryBox() {
    if (this.mysteryBox.available) {
      this.mysteryBoxUses++;

      // If we've reached max uses, move the box
      if (this.maxMysteryBoxUses === 0) {
        // Set the max uses to a random value between 3-6 for this game session
        this.maxMysteryBoxUses = Math.floor(Math.random() * 4) + 3; // 3-6
      }

      if (this.mysteryBoxUses >= this.maxMysteryBoxUses) {
        this.moveMysteryBox();
        this.mysteryBoxUses = 0;
        this.maxMysteryBoxUses = 0; // Reset to be set again next time
      }

      // Return true to indicate successful use
      return true;
    }
    return false;
  }

  // Toggle power for a specific building
  togglePower(buildingId: string) {
    const switchIndex = this.powerSwitches.findIndex(sw => sw.buildingId === buildingId);
    if (switchIndex !== -1) {
      this.powerSwitches[switchIndex].isOn = !this.powerSwitches[switchIndex].isOn;

      if (this.powerSwitches[switchIndex].isOn) {
        this.poweredBuildings.add(buildingId);

        // Enable vending machines in this building
        for (const vm of this.vendingMachines) {
          if (vm.buildingId === buildingId) {
            vm.powered = true;
          }
        }
      } else {
        this.poweredBuildings.delete(buildingId);

        // Disable vending machines in this building
        for (const vm of this.vendingMachines) {
          if (vm.buildingId === buildingId) {
            vm.powered = false;
          }
        }
      }
    }
  }

  isPowerSwitchNear(x: number, y: number, buildingId: string, range = 80): boolean {
    const switchPos = this.powerSwitches.find(sw => sw.buildingId === buildingId);
    if (switchPos) {
      const dist = Math.hypot(switchPos.x - x, switchPos.y - y);
      return dist < range && !switchPos.isOn; // Only show prompt if it's off
    }
    return false;
  }

  getVendingMachineNear(x: number, y: number, range = 80): VendingMachine | null {
    for (const vm of this.vendingMachines) {
      const dist = Math.hypot(vm.x - x, vm.y - y);
      if (dist < range && vm.powered) { // Only return if powered
        return vm;
      }
    }
    return null;
  }

  getMysteryBoxNear(x: number, y: number, range = 80): MysteryBox | null {
    const dist = Math.hypot(this.mysteryBox.x - x, this.mysteryBox.y - y);
    if (dist < range && this.mysteryBox.available) {
      return this.mysteryBox;
    }
    return null;
  }

  getActiveSpawnPoints(): SpawnPoint[] {
    return this.spawnPoints.filter((sp) => this.unlockedRooms.has(sp.roomId))
  }

  purchaseDoor(doorId: string): boolean {
    const door = this.doors.find((d) => d.id === doorId)
    if (door && !door.isOpen) {
      // First, open this specific door
      door.isOpen = true
      this.unlockedRooms.add(door.roomId)

      // Then, unlock all doors in the same building
      this.unlockedBuildings.add(door.buildingId)

      for (const otherDoor of this.doors) {
        if (otherDoor.buildingId === door.buildingId && !otherDoor.isOpen) {
          otherDoor.isOpen = true
          this.unlockedRooms.add(otherDoor.roomId)
        }
      }

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
    // Floor (concrete)
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

    // Draw grass areas between buildings
    this.renderGrassAreas(ctx);

    // Draw power switches
    this.renderPowerSwitches(ctx);

    // Draw vending machines
    this.renderVendingMachines(ctx);

    // Draw mystery box
    this.renderMysteryBox(ctx);

    // Draw walls
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

    // Draw doors
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

  private renderGrassAreas(ctx: CanvasRenderingContext2D) {
    // Draw grass areas between buildings
    ctx.fillStyle = "#4a7c59"; // Green for grass

    // Draw grass in corridors between buildings
    ctx.fillRect(880, 680, 620, 220); // Between north buildings and center
    ctx.fillRect(1480, 880, 20, 620); // Vertical corridor east of center
    ctx.fillRect(880, 1480, 620, 20); // Horizontal corridor south of center
    ctx.fillRect(280, 880, 20, 620); // Vertical corridor west of center
    ctx.fillRect(280, 680, 620, 220); // Between northwest building and center
  }

  private renderPowerSwitches(ctx: CanvasRenderingContext2D) {
    for (const powerSwitch of this.powerSwitches) {
      ctx.save();
      ctx.translate(powerSwitch.x, powerSwitch.y);

      // Switch base
      ctx.fillStyle = powerSwitch.isOn ? "#00aa00" : "#aa0000"; // Green if on, red if off
      ctx.fillRect(-15, -15, 30, 30);

      // Switch handle
      ctx.fillStyle = "#333";
      ctx.fillRect(-5, -5, 10, 10);

      // Text label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("POWER", 0, 25);

      ctx.restore();
    }
  }

  private renderVendingMachines(ctx: CanvasRenderingContext2D) {
    for (const vm of this.vendingMachines) {
      ctx.save();
      ctx.translate(vm.x, vm.y);

      // Machine shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(-25, -45, 55, 95);

      // Machine body - dim if not powered
      ctx.fillStyle = vm.powered ? "#333" : "#222";
      ctx.fillRect(-30, -50, 60, 100);

      // Colored front panel - dim if not powered
      const color = vm.powered ? "#ff0000" : "#666"; // Red normally, gray when powered off
      ctx.fillStyle = color;
      ctx.globalAlpha = vm.powered ? 0.6 : 0.3;
      ctx.fillRect(-25, -45, 50, 60);
      ctx.globalAlpha = 1;

      // Perk icon - show only when powered
      if (vm.powered) {
        ctx.fillStyle = "#000";
        ctx.font = "bold 20px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("⚡", 0, -15);
      } else {
        // Show power icon when not powered
        ctx.fillStyle = "#999";
        ctx.font = "bold 16px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("❌", 0, -15);
      }

      // Perk name - dim if not powered
      ctx.fillStyle = vm.powered ? "#fff" : "#777";
      ctx.font = "bold 8px sans-serif";
      ctx.fillText("VEND", 0, 25);

      // Cost - show only when powered
      if (vm.powered) {
        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(`$${vm.cost}`, 0, 40);
      } else {
        ctx.fillStyle = "#aa5555";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("NO POWER", 0, 40);
      }

      ctx.restore();
    }
  }

  private renderMysteryBox(ctx: CanvasRenderingContext2D) {
    if (!this.mysteryBox.available) return;

    const dist = Math.hypot(this.mysteryBox.x - this.mysteryBox.x, this.mysteryBox.y - this.mysteryBox.y);
    const isNearby = true; // Always render since it's always available somewhere

    ctx.save();
    ctx.translate(this.mysteryBox.x, this.mysteryBox.y);

    // Enhanced pulsing glow when nearby
    if (isNearby) {
      const pulse = Math.sin(Date.now() / 400) * 0.5 + 0.5;
      const glowIntensity = 0.5 + pulse * 0.8;
      ctx.shadowColor = "#ff00ff";
      ctx.shadowBlur = 30 * glowIntensity;
    }

    // Box shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fillRect(-35, -20, 75, 55);

    // Box body
    const gradient = ctx.createLinearGradient(-40, -25, -40, 25);
    gradient.addColorStop(0, "#8b4513");
    gradient.addColorStop(0.5, "#654321");
    gradient.addColorStop(1, "#3d2817");
    ctx.fillStyle = gradient;
    ctx.fillRect(-40, -25, 80, 50);

    // Question mark
    ctx.fillStyle = "#ff00ff";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", 0, 0);

    // Cost label
    ctx.shadowBlur = 0; // Clear shadow for text
    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("$950", 0, 35);

    ctx.shadowBlur = 0;
    ctx.restore();
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
        ctx.fillText("[E] Unlock Building", doorCenterX, doorCenterY - 8)
        ctx.restore()
      }
    }
  }

  renderPowerSwitchPrompt(ctx: CanvasRenderingContext2D, playerX: number, playerY: number) {
    for (const powerSwitch of this.powerSwitches) {
      const dist = Math.hypot(powerSwitch.x - playerX, powerSwitch.y - playerY);
      if (dist < 80 && !powerSwitch.isOn) {
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.beginPath();
        ctx.roundRect(powerSwitch.x - 50, powerSwitch.y - 45, 100, 50, 8);
        ctx.fill();

        ctx.fillStyle = "#FF0000"; // Red for power off state
        ctx.font = "bold 14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("POWER OFF", powerSwitch.x, powerSwitch.y - 25);

        ctx.fillStyle = "#fff";
        ctx.font = "12px sans-serif";
        ctx.fillText("[E] Switch ON", powerSwitch.x, powerSwitch.y - 8);
        ctx.restore();
      }
    }
  }

  renderVendingMachinePrompts(ctx: CanvasRenderingContext2D, playerX: number, playerY: number) {
    for (const vm of this.vendingMachines) {
      const dist = Math.hypot(vm.x - playerX, vm.y - playerY);
      if (dist < 80) {
        ctx.save();

        if (vm.powered) {
          // Powered vending machine
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.beginPath();
          ctx.roundRect(vm.x - 60, vm.y - 50, 120, 55, 8);
          ctx.fill();

          ctx.fillStyle = "#00FF00"; // Green for powered
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("VEND", vm.x, vm.y - 30);

          ctx.fillStyle = "#FFD700"; // Gold for cost
          ctx.font = "bold 12px sans-serif";
          ctx.fillText(`$${vm.cost}`, vm.x, vm.y - 15);

          ctx.fillStyle = "#fff";
          ctx.font = "12px sans-serif";
          ctx.fillText("[E] Buy Perk", vm.x, vm.y - 2);
        } else {
          // Unpowered vending machine
          ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
          ctx.beginPath();
          ctx.roundRect(vm.x - 60, vm.y - 50, 120, 55, 8);
          ctx.fill();

          ctx.fillStyle = "#FF0000"; // Red for no power
          ctx.font = "bold 14px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("NO POWER", vm.x, vm.y - 30);

          ctx.fillStyle = "#ff9999"; // Light red
          ctx.font = "bold 12px sans-serif";
          ctx.fillText("NEED POWER", vm.x, vm.y - 15);

          ctx.fillStyle = "#fff";
          ctx.font = "12px sans-serif";
          ctx.fillText("[F] Check Pwr", vm.x, vm.y - 2);
        }

        ctx.restore();
      }
    }
  }

  renderMysteryBoxPrompt(ctx: CanvasRenderingContext2D, playerX: number, playerY: number) {
    if (!this.mysteryBox.available) return;

    const dist = Math.hypot(this.mysteryBox.x - playerX, this.mysteryBox.y - playerY);
    if (dist < 100) {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.beginPath();
      ctx.roundRect(this.mysteryBox.x - 60, this.mysteryBox.y - 45, 120, 50, 8);
      ctx.fill();

      ctx.fillStyle = "#ff00ff"; // Magenta for mystery box
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("$950", this.mysteryBox.x, this.mysteryBox.y - 25);

      ctx.fillStyle = "#fff";
      ctx.font = "12px sans-serif";
      ctx.fillText("[E] Mystery Box", this.mysteryBox.x, this.mysteryBox.y - 8);
      ctx.restore();
    }
  }
}
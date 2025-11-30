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

  tileSize = 80

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.generateMap()
    this.setupMysteryBoxPositions()
  }

  private generateMap() {
    // Outer walls - creating a compound layout with four main buildings
    this.walls.push({ x: 0, y: 0, width: this.width, height: 40 }) // Top
    this.walls.push({ x: 0, y: this.height - 40, width: this.width, height: 40 }) // Bottom
    this.walls.push({ x: 0, y: 0, width: 40, height: this.height }) // Left
    this.walls.push({ x: this.width - 40, y: 0, width: 40, height: this.height }) // Right

    // Starting room - Entry area with basic supplies
    this.walls.push({ x: 900, y: 900, width: 600, height: 30 }) // Top
    this.walls.push({ x: 900, y: 900, width: 30, height: 220 }) // Left top section (to door)
    this.walls.push({ x: 900, y: 1280, width: 30, height: 350 }) // Left bottom section (after door)
    this.walls.push({ x: 1470, y: 900, width: 30, height: 220 }) // Right top section (to door)
    this.walls.push({ x: 1470, y: 1280, width: 30, height: 350 }) // Right bottom section (after door)
    this.walls.push({ x: 900, y: 1470, width: 600, height: 30 }) // Bottom

    // Building 1: Office/Admin Wing (Northwest) - "Missing Files" Quest
    this.walls.push({ x: 300, y: 300, width: 500, height: 30 }) // Top
    this.walls.push({ x: 300, y: 300, width: 30, height: 400 }) // Left
    this.walls.push({ x: 770, y: 300, width: 30, height: 400 }) // Right
    this.walls.push({ x: 300, y: 670, width: 500, height: 30 }) // Bottom

    // Building 2: Armory/Storage (Northeast) - "Locked & Loaded" Quest
    this.walls.push({ x: 1600, y: 300, width: 500, height: 30 }) // Top
    this.walls.push({ x: 1600, y: 300, width: 30, height: 400 }) // Left
    this.walls.push({ x: 2070, y: 300, width: 30, height: 400 }) // Right
    this.walls.push({ x: 1600, y: 670, width: 500, height: 30 }) // Bottom

    // Building 3: Lab/Chemical Room (Southwest) - "Biohazard Burst" Quest
    this.walls.push({ x: 300, y: 1600, width: 500, height: 30 }) // Top
    this.walls.push({ x: 300, y: 1600, width: 30, height: 400 }) // Left
    this.walls.push({ x: 770, y: 1600, width: 30, height: 400 }) // Right
    this.walls.push({ x: 300, y: 1970, width: 500, height: 30 }) // Bottom

    // Building 4: Control/Comms/Server Room (Southeast) - "Last Call" Quest
    this.walls.push({ x: 1600, y: 1600, width: 500, height: 30 }) // Top
    this.walls.push({ x: 1600, y: 1600, width: 30, height: 400 }) // Left
    this.walls.push({ x: 2070, y: 1600, width: 30, height: 400 }) // Right
    this.walls.push({ x: 1600, y: 1970, width: 500, height: 30 }) // Bottom

    // Connecting paths between buildings
    // Path from start to Office (NW)
    this.walls.push({ x: 900, y: 670, width: 60, height: 230 }) // Vertical down from start to path
    this.walls.push({ x: 300, y: 800, width: 660, height: 30 }) // Horizontal to Office
    this.walls.push({ x: 770, y: 670, width: 30, height: 130 }) // Connect to Office

    // Path from start to Armory (NE)
    this.walls.push({ x: 1470, y: 670, width: 60, height: 230 }) // Vertical down from start to path
    this.walls.push({ x: 1530, y: 800, width: 140, height: 30 }) // Small connector
    this.walls.push({ x: 1670, y: 800, width: 400, height: 30 }) // Horizontal to Armory
    this.walls.push({ x: 2040, y: 800, width: 30, height: 200 }) // Connect to Armory

    // Path from start down to lower area
    this.walls.push({ x: 900, y: 1470, width: 600, height: 30 }) // Horizontal path
    this.walls.push({ x: 900, y: 1500, width: 30, height: 100 }) // Path to Lab
    this.walls.push({ x: 1470, y: 1500, width: 30, height: 100 }) // Path to Control

    // Path from Lab to Control
    this.walls.push({ x: 800, y: 1970, width: 800, height: 30 }) // Horizontal
    this.walls.push({ x: 1570, y: 1970, width: 30, height: 30 }) // Connect to Control

    // Create doors for each building - all doors in same building have same cost
    this.doors = [
      // Office/Admin Wing doors (Building 1) - "Missing Files" Quest
      { id: "door-office-1", x: 500, y: 300, width: 100, height: 30, cost: 500, isOpen: false, roomId: "office", buildingId: "office" },
      { id: "door-office-2", x: 300, y: 450, width: 30, height: 100, cost: 600, isOpen: false, roomId: "office", buildingId: "office" },

      // Armory/Storage doors (Building 2) - "Locked & Loaded" Quest
      { id: "door-armory-1", x: 1800, y: 300, width: 100, height: 30, cost: 800, isOpen: false, roomId: "armory", buildingId: "armory" },
      { id: "door-armory-2", x: 2070, y: 450, width: 30, height: 100, cost: 900, isOpen: false, roomId: "armory", buildingId: "armory" },

      // Lab/Chemical Room doors (Building 3) - "Biohazard Burst" Quest
      { id: "door-lab-1", x: 500, y: 1600, width: 100, height: 30, cost: 1000, isOpen: false, roomId: "lab", buildingId: "lab" },
      { id: "door-lab-2", x: 300, y: 1750, width: 30, height: 100, cost: 1100, isOpen: false, roomId: "lab", buildingId: "lab" },

      // Control/Comms/Server Room doors (Building 4) - "Last Call" Quest
      { id: "door-control-1", x: 1800, y: 1600, width: 100, height: 30, cost: 1200, isOpen: false, roomId: "control", buildingId: "control" },
      { id: "door-control-2", x: 2070, y: 1750, width: 30, height: 100, cost: 1200, isOpen: false, roomId: "control", buildingId: "control" },

      // Entry doors to the compound (from start area)
      { id: "door-start-to-office", x: 770, y: 750, width: 30, height: 50, cost: 300, isOpen: false, roomId: "path1", buildingId: "compound-entry" },
      { id: "door-start-to-armory", x: 1500, y: 750, width: 30, height: 50, cost: 300, isOpen: false, roomId: "path2", buildingId: "compound-entry" },

      // Exit doors from starting building to outside (left and right sides)
      { id: "door-start-left-exit", x: 870, y: 1150, width: 30, height: 100, cost: 200, isOpen: false, roomId: "exit-left", buildingId: "compound-exit" },
      { id: "door-start-right-exit", x: 1470, y: 1150, width: 30, height: 100, cost: 200, isOpen: false, roomId: "exit-right", buildingId: "compound-exit" },
    ]

    // Spawn points for each building and pathway
    this.spawnPoints = [
      // Start room spawns
      { x: 1100, y: 1000, roomId: "start" },
      { x: 1300, y: 1000, roomId: "start" },
      { x: 1100, y: 1400, roomId: "start" },
      { x: 1300, y: 1400, roomId: "start" },

      // Exit area spawns (for new doors)
      { x: 800, y: 1150, roomId: "exit-left" },
      { x: 1540, y: 1150, roomId: "exit-right" },

      // Office/Admin Wing spawns
      { x: 450, y: 400, roomId: "office" },
      { x: 600, y: 400, roomId: "office" },
      { x: 450, y: 550, roomId: "office" },
      { x: 600, y: 550, roomId: "office" },

      // Armory/Storage spawns
      { x: 1750, y: 400, roomId: "armory" },
      { x: 1900, y: 400, roomId: "armory" },
      { x: 1750, y: 550, roomId: "armory" },
      { x: 1900, y: 550, roomId: "armory" },

      // Lab/Chemical Room spawns
      { x: 450, y: 1700, roomId: "lab" },
      { x: 600, y: 1700, roomId: "lab" },
      { x: 450, y: 1850, roomId: "lab" },
      { x: 600, y: 1850, roomId: "lab" },

      // Control/Comms/Server Room spawns
      { x: 1750, y: 1700, roomId: "control" },
      { x: 1900, y: 1700, roomId: "control" },
      { x: 1750, y: 1850, roomId: "control" },
      { x: 1900, y: 1850, roomId: "control" },

      // Pathway spawns
      { x: 600, y: 850, roomId: "path1" },
      { x: 1800, y: 850, roomId: "path2" },
      { x: 1200, y: 1550, roomId: "path3" },
    ]

    // Power switches for each building (for vending machines)
    this.powerSwitches = [
      { x: 600, y: 450, buildingId: "office", isOn: false }, // Office/Admin Wing
      { x: 1900, y: 450, buildingId: "armory", isOn: false }, // Armory/Storage
      { x: 600, y: 1750, buildingId: "lab", isOn: false }, // Lab/Chemical Room
      { x: 1900, y: 1750, buildingId: "control", isOn: false }, // Control/Comms/Server Room
    ]

    // Vending machines for each building (require power to use)
    this.vendingMachines = [
      // Office/Admin Wing - lower tier perks (juggernog, speed-cola)
      { x: 400, y: 500, perkType: "juggernog", cost: 2500, buildingId: "office", powered: false },
      { x: 650, y: 500, perkType: "speed-cola", cost: 3000, buildingId: "office", powered: false },

      // Armory/Storage - mid tier perks (double-tap, stamin-up)
      { x: 1750, y: 500, perkType: "double-tap", cost: 2000, buildingId: "armory", powered: false },
      { x: 1950, y: 500, perkType: "stamin-up", cost: 2000, buildingId: "armory", powered: false },

      // Lab/Chemical Room - specialty perks (quick-revive, PhD-flu)
      { x: 400, y: 1800, perkType: "quick-revive", cost: 1500, buildingId: "lab", powered: false },
      { x: 650, y: 1800, perkType: "phd-flu", cost: 4000, buildingId: "lab", powered: false },

      // Control/Comms/Server Room - high tier perks (everything)
      { x: 1750, y: 1800, perkType: "juggernog", cost: 2500, buildingId: "control", powered: false },
      { x: 1950, y: 1800, perkType: "double-tap", cost: 2000, buildingId: "control", powered: false },
    ]
  }

  private setupMysteryBoxPositions() {
    // Define possible mystery box positions across different buildings in the compound
    this.mysteryBoxPositions = [
      { x: 600, y: 450, buildingId: "office" }, // Office/Admin Wing
      { x: 1900, y: 450, buildingId: "armory" }, // Armory/Storage
      { x: 600, y: 1750, buildingId: "lab" }, // Lab/Chemical Room
      { x: 1900, y: 1750, buildingId: "control" }, // Control/Comms/Server Room
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

    // Draw grass areas between buildings - representing the compound compound
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
    // Draw grass areas between buildings - representing the compound compound
    ctx.fillStyle = "#4a7c59"; // Green for grass

    // Grass in pathways between buildings
    ctx.fillRect(330, 700, 440, 100); // Pathway to Office
    ctx.fillRect(1630, 700, 440, 100); // Pathway to Armory
    ctx.fillRect(930, 1500, 540, 100); // Central pathway
    ctx.fillRect(330, 1900, 440, 70); // Pathway to Lab
    ctx.fillRect(1630, 1900, 440, 70); // Pathway to Control

    // Central compound area
    ctx.fillRect(930, 900, 540, 600); // Central compound

    // Small grass patches near buildings
    ctx.fillRect(330, 330, 100, 100); // NW grass patch
    ctx.fillRect(1970, 330, 100, 100); // NE grass patch
    ctx.fillRect(330, 1630, 100, 100); // SW grass patch
    ctx.fillRect(1970, 1630, 100, 100); // SE grass patch
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
      ctx.beginPath()
      ctx.roundRect(this.mysteryBox.x - 60, this.mysteryBox.y - 45, 120, 50, 8)
      ctx.fill()

      ctx.fillStyle = "#ff00ff"; // Magenta for mystery box
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("$950", this.mysteryBox.x, this.mysteryBox.y - 25)

      ctx.fillStyle = "#fff"
      ctx.font = "12px sans-serif"
      ctx.fillText("[E] Mystery Box", this.mysteryBox.x, this.mysteryBox.y - 8)
      ctx.restore()
    }
  }
}
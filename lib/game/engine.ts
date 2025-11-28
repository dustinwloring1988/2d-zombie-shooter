import { Player } from "./entities/player"
import { Zombie } from "./entities/zombie"
import type { Bullet } from "./entities/bullet"
import { Grenade, type GrenadeType } from "./entities/grenade"
import { GameMap } from "./map"
import { GameMapLevel2 } from "./map-level2"
import { GameMapLevel3 } from "./map-level3"
import { WallBuy, MysteryBox, VendingMachine, MaxAmmoBox } from "./interactables"
import { PowerUp, type PowerUpType } from "./entities/power-up"
import { WEAPONS, type WeaponData } from "./weapons"
import { AudioManager, type SoundType } from "./audio"
import { GamepadManager } from "./gamepad"
import { ParticleSystem } from "./particles"
import { FloatingTextSystem } from "./floating-text"
import { KillFeedSystem } from "./kill-feed"

export class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private player: Player
  private zombies: Zombie[] = []
  private bullets: Bullet[] = []
  private grenades: Grenade[] = []
  private explosions: { x: number; y: number; type: GrenadeType; timer: number; maxTime: number }[] = []
  private powerUps: PowerUp[] = []
  private gameMap: GameMap
  private wallBuys: WallBuy[] = []
  private mysteryBoxes: MysteryBox[] = []
  private mysteryBoxUses: number = 0
  private maxMysteryBoxUses: number = 0
  private vendingMachines: VendingMachine[] = []
  private maxAmmoBoxes: MaxAmmoBox[] = []
  private burnDamageTimers: Map<Zombie, number> = new Map()

  private round = 1
  private zombiesSpawned = 0
  private zombiesToSpawn = 6
  private zombiesKilled = 0
  private points = 500
  private isRunning = false
  private animationFrameId: number | null = null
  private lastTime = 0
  private spawnTimer = 0
  private roundTransition = false
  private roundTransitionTimer = 0

  private particleSystem: ParticleSystem
  private floatingTextSystem: FloatingTextSystem
  private killFeedSystem: KillFeedSystem

  private keys: Set<string> = new Set()
  private mouse = { x: 0, y: 0, down: false, rightDown: false }
  private camera = { x: 0, y: 0 }
  private smoothCamera = { x: 0, y: 0 }
  private static CAMERA_SMOOTHING = 0.08

  private baseZoom = 1.0
  private currentZoom = 1.0
  private targetZoom = 1.0
  private static MIN_ZOOM = 0.7
  private static ZOOM_SMOOTHING = 0.05

  // Countdown properties for game start
  private startCountdown = 0
  private isCountdownActive = false

  private activePowerUp: PowerUpType | null = null
  private powerUpTimer = 0

  private updateHUD: (data: any) => void
  private showWeaponSwap: (weapon: any, cost: number) => void
  private triggerHit: (direction: { x: number; y: number }) => void
  private triggerScreenShake: (intensity: number) => void
  private onGameOver: () => void
  private onPauseToggle: () => void = () => {}

  private audio: AudioManager

  private pendingWeaponPurchase: { weapon: WeaponData; cost: number } | null = null

  private gamepad: GamepadManager

  constructor(
    canvas: HTMLCanvasElement,
    updateHUD: (data: any) => void,
    showWeaponSwap: (weapon: any, cost: number) => void,
    triggerHit: (direction: { x: number; y: number }) => void,
    triggerScreenShake: (intensity: number) => void,
    onGameOver: () => void,
    onPauseToggle: () => void = () => {},
    mapType: "level1" | "level2" | "level3" = "level1",
    characterType: "default" | "magician" = "default",
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d")!
    this.updateHUD = updateHUD
    this.showWeaponSwap = showWeaponSwap
    this.triggerHit = triggerHit
    this.triggerScreenShake = triggerScreenShake
    this.onGameOver = onGameOver
    this.onPauseToggle = onPauseToggle

    if (mapType === "level2") {
      this.gameMap = new GameMapLevel2(2400, 2400);
    } else if (mapType === "level3") {
      this.gameMap = new GameMapLevel3(2400, 2400);
    } else {
      this.gameMap = new GameMap(2400, 2400);
    }
    this.player = new Player(this.gameMap.width / 2, this.gameMap.height / 2, characterType)
    this.audio = new AudioManager()

    this.gamepad = new GamepadManager()
    this.particleSystem = new ParticleSystem()
    this.floatingTextSystem = new FloatingTextSystem()
    this.killFeedSystem = new KillFeedSystem(8, 5000) // 8 entries, 5 seconds lifetime

    // Set up muzzle flash callback
    this.player.onMuzzleFlash = (x, y, angle) => {
      // Add muzzle flash particles
      this.particleSystem.addParticles(8, x, y, {
        velocity: { min: 50, max: 200 },
        angle: { min: angle - Math.PI/4, max: angle + Math.PI/4 }, // Forward direction with spread
        life: { min: 100, max: 300 },
        size: { min: 1, max: 4 },
        color: "#ffff00", // Yellow/Orange muzzle flash
      })
    }

    this.setupInteractables()
    this.setupEventListeners()
  }

  private setupInteractables() {
    if (this.gameMap instanceof GameMapLevel3) {
      // Level 3 (Buildings with Power System) - now matches the new structure
      // The layout is handled in the map class itself
      // We still need to initialize weapons in starting room and other static elements
      this.wallBuys = [new WallBuy(1200, 1000, WEAPONS.shotgun, 500)] // In the starting room
      this.mysteryBoxes = [new MysteryBox(1100, 1100)] // Initial position
      this.maxAmmoBoxes = [new MaxAmmoBox(1200, 1300, 250)] // In the starting room
    } else if (this.gameMap instanceof GameMapLevel2) {
      // Level 2 (Buildings with Power System) - now matches the new structure
      // The layout is handled in the map class itself
      // We still need to initialize weapons in starting room and other static elements
      this.wallBuys = [new WallBuy(1200, 1000, WEAPONS.shotgun, 500)] // In the starting room
      this.mysteryBoxes = [new MysteryBox(1100, 1100)] // Initial position
      this.maxAmmoBoxes = [new MaxAmmoBox(1200, 1300, 250)] // In the starting room
    } else {
      // Level 1 (original) positions
      this.wallBuys = [
        new WallBuy(400, 400, WEAPONS.shotgun, 500),
        new WallBuy(800, 200, WEAPONS.smg, 750),
        new WallBuy(1600, 400, WEAPONS.rifle, 1000),
        new WallBuy(2000, 800, WEAPONS.ak47, 1200),
        new WallBuy(400, 1600, WEAPONS.sniper, 1500),
        new WallBuy(2000, 1600, WEAPONS.lmg, 1750),
      ]

      this.mysteryBoxes = [new MysteryBox(600, 1200), new MysteryBox(1800, 1200)]

      this.vendingMachines = [
        new VendingMachine(950, 950, "juggernog", 2500),
        new VendingMachine(1450, 950, "speed-cola", 3000),
        new VendingMachine(950, 1350, "double-tap", 2000),
        new VendingMachine(1450, 1350, "stamin-up", 2000),
        new VendingMachine(1200, 600, "quick-revive", 1500),
      ]

      this.maxAmmoBoxes = [new MaxAmmoBox(1200, 1200, 250)]
    }
  }

  private setupEventListeners() {
    window.addEventListener("keydown", this.handleKeyDown)
    window.addEventListener("keyup", this.handleKeyUp)
    this.canvas.addEventListener("mousemove", this.handleMouseMove)
    this.canvas.addEventListener("mousedown", this.handleMouseDown)
    this.canvas.addEventListener("mouseup", this.handleMouseUp)
    this.canvas.addEventListener("wheel", this.handleWheel)
    this.canvas.addEventListener("contextmenu", (e) => e.preventDefault())
  }

  private startNewRoundCountdown() {
    // Only start countdown for round 1
    if (this.round === 1) {
      this.startCountdown = 3000 // 3 seconds in milliseconds
      this.isCountdownActive = true
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.key.toLowerCase())

    if (e.key === "1") {
      this.player.switchWeapon(0)
      this.audio.play("switchWeapons")
    }
    if (e.key === "2" && this.player.weapons.length > 1) {
      this.player.switchWeapon(1)
      this.audio.play("switchWeapons")
    }

    if (e.key.toLowerCase() === "r") this.player.reload()

    if (e.key.toLowerCase() === "e") this.handleInteraction()

    if (e.key === "Escape") this.onPauseToggle()

    // G key throws the available standard grenade (frag or molotov)
    if (e.key.toLowerCase() === "g") {
      if (this.player.hasGrenade("molotov")) {
        this.throwGrenade("molotov");
      } else {
        this.throwGrenade("frag");
      }
    }

    // F key throws the available special grenade (stun or disco)
    if (e.key.toLowerCase() === "f") {
      if (this.player.hasGrenade("disco")) {
        this.throwGrenade("disco");
      } else {
        this.throwGrenade("stun");
      }
    }

    // Roll with Shift key
    if (e.key === "Shift") {
      // Use current movement direction for roll
      let dx = 0, dy = 0
      if (this.keys.has("w") || this.keys.has("arrowup")) dy -= 1
      if (this.keys.has("s") || this.keys.has("arrowdown")) dy += 1
      if (this.keys.has("a") || this.keys.has("arrowleft")) dx -= 1
      if (this.keys.has("d") || this.keys.has("arrowright")) dx += 1

      this.player.roll(dx, dy)
    }
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase())
  }

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect()
    this.mouse.x = e.clientX - rect.left
    this.mouse.y = e.clientY - rect.top
  }

  private handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) this.mouse.down = true
    if (e.button === 2) {
      this.mouse.rightDown = true
      this.handleKnifeAttack()
    }
  }

  private handleMouseUp = (e: MouseEvent) => {
    if (e.button === 0) this.mouse.down = false
    if (e.button === 2) this.mouse.rightDown = false
  }

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (this.player.weapons.length <= 1) return

    if (e.deltaY > 0) {
      const nextIndex = (this.player.currentWeaponIndex + 1) % this.player.weapons.length
      this.player.switchWeapon(nextIndex)
      this.audio.play("switchWeapons")
    } else {
      const prevIndex = (this.player.currentWeaponIndex - 1 + this.player.weapons.length) % this.player.weapons.length
      this.player.switchWeapon(prevIndex)
      this.audio.play("switchWeapons")
    }
  }

  private handleKnifeAttack() {
    const knifeDamage = 150
    const knifeRange = 60

    // Play knife attack sound
    this.audio.play("knifeAttack")

    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const zombie = this.zombies[i]
      const dist = Math.hypot(zombie.x - this.player.x, zombie.y - this.player.y)

      const angleToZombie = Math.atan2(zombie.y - this.player.y, zombie.x - this.player.x)
      const angleDiff = Math.abs(angleToZombie - this.player.angle)
      const normalizedAngle = angleDiff > Math.PI ? Math.PI * 2 - angleDiff : angleDiff

      if (dist < knifeRange && normalizedAngle < Math.PI / 2) {
        zombie.takeDamage(knifeDamage)
        this.audio.play("zombieHit")
        this.triggerScreenShake(5)

        if (zombie.health <= 0) {
          this.handleZombieDeath(zombie)
          this.zombies.splice(i, 1)
          this.zombiesKilled++
        }
        break
      }
    }
    this.player.activateKnife()
  }

  private handleInteraction() {
    const nearbyDoor = this.gameMap.getDoorNear(this.player.x, this.player.y)
    if (nearbyDoor && !nearbyDoor.isOpen) {
      if (this.points >= nearbyDoor.cost) {
        this.points -= nearbyDoor.cost
        this.gameMap.purchaseDoor(nearbyDoor.id)
        this.audio.play("doorSound") // Using the new door sound
        this.triggerScreenShake(3)
        return
      } else {
        // Player doesn't have enough money for the door
        this.audio.play("doorLocked")
        return
      }
    }

    // Handle power switches for level 2 and 3 (the new building levels)
    if (this.gameMap instanceof GameMapLevel2 || this.gameMap instanceof GameMapLevel3) {
      // Check for power switch interaction
      const mapWithPower = this.gameMap as any; // Using 'any' to access power-related methods

      // Check all power switches to see if any are nearby
      for (const powerSwitch of mapWithPower.powerSwitches) {
        const dist = Math.hypot(this.player.x - powerSwitch.x, this.player.y - powerSwitch.y);
        if (dist < 100 && !powerSwitch.isOn) { // Only allow interaction if switch is off
          mapWithPower.togglePower(powerSwitch.buildingId);
          this.audio.play("switchWeapons");
          return;
        }
      }
    }

    for (const wallBuy of this.wallBuys) {
      if (wallBuy.isNear(this.player.x, this.player.y)) {
        if (this.points >= wallBuy.cost) {
          this.tryBuyWeapon(wallBuy.weapon, wallBuy.cost)
        } else {
          // Player doesn't have enough money for the weapon
          this.audio.play("cantBuy")
        }
        return
      }
    }

    // Handle mystery box for redesigned maps
    if (this.gameMap instanceof GameMapLevel2 || this.gameMap instanceof GameMapLevel3) {
      const mapWithMysteryBox = this.gameMap as any; // Using 'any' to access mystery-box methods
      const mysteryBox = mapWithMysteryBox.getMysteryBoxNear(this.player.x, this.player.y);
      if (mysteryBox) {
        if (this.points >= 950) { // Mystery box cost
          this.points -= 950;
          // Get a random weapon from the available weapons
          const randomWeapon = this.getRandomWeapon();
          // Play a random mystery box sound
          const mysterySounds = ["mysteryBox", "mysteryBox1", "mysteryBox2", "mysteryBox3"];
          const randomMysterySound = mysterySounds[Math.floor(Math.random() * mysterySounds.length)];
          this.audio.play(randomMysterySound);
          this.tryBuyWeapon(randomWeapon, 0);

          // Use the mystery box and potentially move it
          const success = mapWithMysteryBox.useMysteryBox();
          if (success) {
            this.audio.play("mysteryBox");
          }
        } else {
          // Player doesn't have enough money for the mystery box
          this.audio.play("cantBuy");
        }
        return;
      }
    } else {
      // Original mystery box handling for level 1
      for (const box of this.mysteryBoxes) {
        if (box.isNear(this.player.x, this.player.y) && !box.isOpen) {
          if (this.points >= box.cost) {
            this.points -= box.cost
            const weapon = box.open()
            // Play a random mystery box sound
            const mysterySounds = ["mysteryBox", "mysteryBox1", "mysteryBox2", "mysteryBox3"];
            const randomMysterySound = mysterySounds[Math.floor(Math.random() * mysterySounds.length)];
            this.audio.play(randomMysterySound)
            this.tryBuyWeapon(weapon, 0)

            // For fortress map, handle mystery box moving after use
            if (this.gameMap instanceof GameMapLevel2) {
              this.mysteryBoxUses++;
              if (this.maxMysteryBoxUses === 0) {
                // Set the max uses to a random value between 3-6 for this game session
                this.maxMysteryBoxUses = Math.floor(Math.random() * 4) + 3; // 3-6
              }

              if (this.mysteryBoxUses >= this.maxMysteryBoxUses) {
                // Move the mystery box to a new random room
                this.mysteryBoxes[0] = this.createRandomMysteryBoxPosition();
                this.mysteryBoxUses = 0;
                this.maxMysteryBoxUses = Math.floor(Math.random() * 4) + 3; // Set new random value
                this.audio.play("doorSound"); // Play a sound to indicate the move
              }
            } else if (this.gameMap instanceof GameMapLevel3) {
              // For the building map, mystery box functionality could be different if needed
              // Currently, it functions like the original maps
              this.audio.play("mysteryBox");
            }
          } else {
            // Player doesn't have enough money for the mystery box
            this.audio.play("cantBuy")
          }
          return
        }
      }
    }

    // Handle vending machines for redesigned maps
    if (this.gameMap instanceof GameMapLevel2 || this.gameMap instanceof GameMapLevel3) {
      const mapWithVending = this.gameMap as any; // Using 'any' to access vending-machine methods
      const vendingMachine = mapWithVending.getVendingMachineNear(this.player.x, this.player.y);
      if (vendingMachine) {
        // Check if the vending machine is powered
        if (vendingMachine.powered) {
          if (this.points >= vendingMachine.cost && !this.player.perks.includes(vendingMachine.perkType)) {
            this.points -= vendingMachine.cost;
            this.player.addPerk(vendingMachine.perkType);
            // Play a random vending machine sound
            const vendingSounds = ["vendingMachine", "vending1", "vending2"];
            const randomVendingSound = vendingSounds[Math.floor(Math.random() * vendingSounds.length)];
            this.audio.play(randomVendingSound);
          } else if (this.points < vendingMachine.cost) {
            // Player doesn't have enough money for the vending machine perk
            this.audio.play("cantBuy");
          } else if (this.player.perks.includes(vendingMachine.perkType)) {
            // Player already has this perk
            this.audio.play("cantBuy");
          }
        } else {
          // Machine not powered
          this.audio.play("cantBuy");
        }
        return;
      }
    } else {
      // Original vending machine handling for level 1
      for (const machine of this.vendingMachines) {
        if (machine.isNear(this.player.x, this.player.y)) {
          if (this.points >= machine.cost && !this.player.perks.includes(machine.perkType)) {
            this.points -= machine.cost
            this.player.addPerk(machine.perkType)
            // Play a random vending machine sound
            const vendingSounds = ["vendingMachine", "vending1", "vending2"];
            const randomVendingSound = vendingSounds[Math.floor(Math.random() * vendingSounds.length)];
            this.audio.play(randomVendingSound)
          } else if (this.points < machine.cost) {
            // Player doesn't have enough money for the vending machine perk
            this.audio.play("cantBuy")
          }
          return
        }
      }
    }

    for (const ammoBox of this.maxAmmoBoxes) {
      if (ammoBox.isNear(this.player.x, this.player.y)) {
        if (this.points >= ammoBox.cost) {
          this.points -= ammoBox.cost
          this.player.maxAmmo()
          this.audio.play("powerUp")
        } else {
          // Player doesn't have enough money for the max ammo
          this.audio.play("cantBuy")
        }
        return
      }
    }
  }

  private getRandomWeapon() {
    // Return a random weapon from the available weapons
    const weapons = Object.values(WEAPONS);
    return weapons[Math.floor(Math.random() * weapons.length)];
  }

  start() {
    this.isRunning = true
    this.lastTime = performance.now()

    // Initialize start countdown for round 1 if not already active
    if (this.round === 1 && !this.isCountdownActive) {
      this.startNewRoundCountdown()
    }

    this.gameLoop()
  }

  stop() {
    this.isRunning = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
    window.removeEventListener("keydown", this.handleKeyDown)
    window.removeEventListener("keyup", this.handleKeyUp)
    this.canvas.removeEventListener("mousemove", this.handleMouseMove)
    this.canvas.removeEventListener("mousedown", this.handleMouseDown)
    this.canvas.removeEventListener("mouseup", this.handleMouseUp)
    this.canvas.removeEventListener("wheel", this.handleWheel)
    this.gamepad.destroy()
  }

  restart() {
    this.restartWithMap("level1");
  }

  restartWithMap(mapType: "level1" | "level2" | "level3" = "level1", characterType: "default" | "magician" = "default") {
    if (mapType === "level2") {
      this.gameMap = new GameMapLevel2(2400, 2400);
    } else if (mapType === "level3") {
      this.gameMap = new GameMapLevel3(2400, 2400);
    } else {
      this.gameMap = new GameMap(2400, 2400);
    }

    this.player = new Player(this.gameMap.width / 2, this.gameMap.height / 2, characterType)
    this.zombies = []
    this.bullets = []
    this.grenades = []
    this.explosions = []
    this.powerUps = []
    this.round = 1
    this.zombiesSpawned = 0
    this.zombiesToSpawn = 6
    this.zombiesKilled = 0
    this.points = 500
    this.activePowerUp = null
    this.powerUpTimer = 0
    this.roundTransition = false
    this.pendingWeaponPurchase = null

    // Reset mystery box tracking
    this.mysteryBoxUses = 0;
    this.maxMysteryBoxUses = 0; // Will be set based on random value between 3-6 when needed

    // Clear burn damage timers
    this.burnDamageTimers.clear();

    this.particleSystem.clear()
    this.floatingTextSystem.clear()
    this.killFeedSystem.clear()

    // Reset countdown state
    this.startCountdown = 0
    this.isCountdownActive = false

    // Reset mystery boxes
    if (mapType === "level2") {
      // For fortress map, create mystery box at a random room
      // The new GameMapLevel2 handles mystery box internally
      this.mysteryBoxes = [new MysteryBox(1100, 1100)]; // This will be replaced by map's internal logic
    } else if (mapType === "level3") {
      // For the building map, the new GameMapLevel3 handles mystery box internally
      this.mysteryBoxes = [new MysteryBox(1200, 1200)]; // This will be replaced by map's internal logic
    } else {
      this.mysteryBoxes = [new MysteryBox(600, 1200), new MysteryBox(1800, 1200)];
      for (const box of this.mysteryBoxes) {
        box.reset()
      }
    }

    this.start()
  }

  private createRandomMysteryBoxPosition(): MysteryBox {
    // Different positions based on the map type
    if (this.gameMap instanceof GameMapLevel3) {
      // For the building map, use building positions
      const possiblePositions = [
        { x: 400, y: 400 },   // Building 1
        { x: 1800, y: 400 },  // Building 2
        { x: 400, y: 1800 },  // Building 3
        { x: 1800, y: 1800 }, // Building 4
        { x: 1200, y: 1100 }, // Building 5 (center)
        { x: 200, y: 1200 },  // Building 6 (west)
        { x: 2200, y: 1200 }, // Building 7 (east)
        { x: 1200, y: 200 },  // Building 8 (north)
        { x: 1200, y: 2200 }, // Building 9 (south)
      ];

      // Choose a random position from the available buildings
      const randomPosition = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];

      return new MysteryBox(randomPosition.x, randomPosition.y);
    } else {
      // For fortress map, use room positions
      const possiblePositions = [
        { x: 1200, y: 400 },   // Room 1 (North)
        { x: 1700, y: 400 },   // Room 2 (Northeast)
        { x: 1200, y: 1700 },  // Room 3 (South)
        { x: 500, y: 1700 },   // Room 4 (Southwest)
        { x: 200, y: 1200 },   // Room 5 (West)
        { x: 2200, y: 1200 },  // Room 6 (East)
      ];

      // Choose a random position from the available rooms
      const randomPosition = possiblePositions[Math.floor(Math.random() * possiblePositions.length)];

      return new MysteryBox(randomPosition.x, randomPosition.y);
    }
  }

  private gameLoop = () => {
    if (!this.isRunning) return

    const currentTime = performance.now()
    const deltaTime = Math.min(currentTime - this.lastTime, 50)
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()
    this.updateHUDData()

    this.animationFrameId = requestAnimationFrame(this.gameLoop)
  }

  private update(dt: number) {
    const gpState = this.gamepad.update()

    if (gpState.buttons.pause) {
      this.onPauseToggle()
    }

    // Handle start countdown
    if (this.isCountdownActive) {
      this.startCountdown -= dt;
      // Play start sound only once when countdown begins for round 1
      if (this.startCountdown >= 2999 && this.round === 1) { // Approximately at the start
        const startSounds = [
          "start1",
          "start2",
          "start3"
        ];
        const randomStartSound = startSounds[Math.floor(Math.random() * startSounds.length)];
        this.audio.play(randomStartSound);
      }

      if (this.startCountdown <= 0) {
        this.startCountdown = 0;
        this.isCountdownActive = false;
      }
      this.updateCameraAndZoom(dt);
      return;
    }

    if (this.roundTransition) {
      this.roundTransitionTimer -= dt
      if (this.roundTransitionTimer <= 0) {
        this.roundTransition = false
        this.round++
        this.zombiesToSpawn = 6 + this.round * 3
        this.zombiesSpawned = 0
        this.zombiesKilled = 0
        this.player.fullHeal()
      }
      this.updateCameraAndZoom(dt)
      return
    }

    this.updatePlayer(dt, gpState)

    this.spawnTimer -= dt
    if (this.spawnTimer <= 0 && this.zombiesSpawned < this.zombiesToSpawn) {
      this.spawnZombie()
      this.spawnTimer = Math.max(500, 2000 - this.round * 100)
    }

    this.updateZombies(dt)

    this.updateBullets(dt)

    this.updatePowerUps(dt)

    this.updateGrenades(dt)

    if (this.zombiesSpawned >= this.zombiesToSpawn && this.zombies.length === 0 && !this.roundTransition) {
      this.roundTransition = true
      this.roundTransitionTimer = 3000
      // Play a random won-round sound
      const roundSounds = [
        "wonRound1", "wonRound2", "wonRound3", "wonRound4", "wonRound5",
        "wonRound6", "wonRound7", "wonRound8", "wonRound9", "wonRound10",
        "wonRound11", "wonRound12", "wonRound13", "wonRound14", "wonRound15"
      ];
      const randomRoundSound = roundSounds[Math.floor(Math.random() * roundSounds.length)];
      this.audio.play(randomRoundSound)
    }

    if (this.activePowerUp) {
      this.powerUpTimer -= dt
      if (this.powerUpTimer <= 0) {
        this.activePowerUp = null
      }
    }

    this.particleSystem.update(dt)
    this.floatingTextSystem.update(dt)
    this.killFeedSystem.update()
    this.updateCameraAndZoom(dt)
  }

  private updateZombies(dt: number) {
    for (let i = this.zombies.length - 1; i >= 0; i--) {
      const zombie = this.zombies[i]
      zombie.moveToward(this.player.x, this.player.y, dt, this.gameMap, this.zombies)

      // Apply burn damage if the zombie is burning
      if (zombie.isBurning()) {
        // Apply burn damage every 500ms
        if (this.burnDamageTimers?.get(zombie) || 0 <= 0) {
          zombie.takeDamage(5); // Tick damage for burning
          this.burnDamageTimers.set(zombie, 500); // Reset timer for next damage tick

          // Add floating text for burn damage
          this.floatingTextSystem.addText(
            zombie.x,
            zombie.y - 30, // Above the zombie
            "5",
            {
              color: "#ff4500", // Orange-red for burn damage
              size: 14,
            }
          );

          // Check if zombie died from burn damage
          if (zombie.health <= 0) {
            this.handleZombieDeath(zombie)
            this.zombies.splice(i, 1)
            this.zombiesKilled++
            continue; // Skip the rest of the loop for this zombie
          }
        } else {
          // Update the timer
          const currentTimer = this.burnDamageTimers.get(zombie) || 0;
          this.burnDamageTimers.set(zombie, currentTimer - dt);
        }
      }

      const dist = Math.hypot(zombie.x - this.player.x, zombie.y - this.player.y)
      if (dist < zombie.radius + this.player.radius) {
        if (zombie.canAttack()) {
          const damage = zombie.attack()
          // Play a random zombie attack sound
          const zombieAttackSounds = ["zombieAttack1", "zombieAttack2", "zombieAttack3"];
          const randomZombieAttackSound = zombieAttackSounds[Math.floor(Math.random() * zombieAttackSounds.length)];
          this.audio.play(randomZombieAttackSound)
          this.player.takeDamage(damage)
          this.audio.play("playerHit")

          // Add floating text for damage taken
          this.floatingTextSystem.addText(
            this.player.x,
            this.player.y - 30, // Above the player
            Math.floor(damage).toString(),
            {
              color: "#ff0000", // Red for damage taken
              size: 20,
            }
          )

          const hitDir = {
            x: zombie.x - this.player.x,
            y: zombie.y - this.player.y,
          }
          this.triggerHit(hitDir)
          this.triggerScreenShake(8)

          if (this.player.health <= 0) {
            this.isRunning = false
            // Play a random game over sound
            const gameOverSound = Math.random() < 0.5 ? "gameOver1" : "gameOver2"
            this.audio.play(gameOverSound)
            this.onGameOver()
          }
        }
      }
    }
  }

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i]
      bullet.update(dt)

      if (bullet.x < 0 || bullet.x > this.gameMap.width || bullet.y < 0 || bullet.y > this.gameMap.height) {
        this.bullets.splice(i, 1)
        continue
      }

      if (this.gameMap.isWall(bullet.x, bullet.y)) {
        this.bullets.splice(i, 1)
        continue
      }

      for (let j = this.zombies.length - 1; j >= 0; j--) {
        const zombie = this.zombies[j]
        const dist = Math.hypot(bullet.x - zombie.x, bullet.y - zombie.y)

        if (dist < zombie.radius) {
          let damage = bullet.damage
          if (this.activePowerUp === "insta-kill") {
            damage = 9999
          }
          if (this.player.perks.includes("double-tap")) {
            damage *= 1.5
          }

          // Add impact particles
          this.particleSystem.addParticles(3, bullet.x, bullet.y, {
            velocity: { min: 20, max: 80 },
            angle: { min: 0, max: Math.PI * 2 },
            life: { min: 200, max: 500 },
            size: { min: 1, max: 3 },
            color: zombie.isBoss ? "#8b0000" : "#3a5f00", // Darker red for boss, green for normal
          })

          // Add floating text for damage
          this.floatingTextSystem.addText(
            zombie.x,
            zombie.y - 30, // Above the zombie
            Math.floor(damage).toString(),
            {
              color: this.activePowerUp === "insta-kill" ? "#ff00ff" : "#ffffff", // Magenta for insta-kill
              size: this.activePowerUp === "insta-kill" ? 24 : 18,
            }
          )

          zombie.takeDamage(damage)
          this.audio.play("zombieHit")

          if (zombie.health <= 0) {
            this.handleZombieDeath(zombie)
            this.zombies.splice(j, 1)
            this.zombiesKilled++
          }

          this.bullets.splice(i, 1)
          break
        }
      }
    }
  }

  private handleZombieDeath(zombie: Zombie) {
    this.audio.play("zombieDeath")
    this.triggerScreenShake(2)

    // Add blood particles when zombie dies
    this.particleSystem.addParticles(15, zombie.x, zombie.y, {
      velocity: { min: 30, max: 150 },
      angle: { min: 0, max: Math.PI * 2 },
      life: { min: 300, max: 1000 },
      size: { min: 2, max: 5 },
      color: zombie.isBoss ? "#8b0000" : "#3a5f00", // Darker red for boss, green for normal
    })

    let pointsEarned = zombie.isBoss ? 500 : 100
    if (this.activePowerUp === "double-points") {
      pointsEarned *= 2
    }
    this.points += pointsEarned

    // Add floating text for points earned above the player
    this.floatingTextSystem.addText(
      this.player.x,
      this.player.y - 50, // Above player
      `+${pointsEarned} pts`,
      {
        color: "#ffff00", // Yellow for points
        size: 18,
        velocityY: -120, // Move upward
      }
    )

    // Add kill to the kill feed
    let zombieType = "Zombie"
    if (zombie.isBoss) {
      zombieType = "Boss Zombie"
    } else if (zombie.isExploder) {
      zombieType = "Exploder Zombie"
    } else if (zombie.isToxic) {
      zombieType = "Toxic Zombie"
    }
    const weaponUsed = this.player.getCurrentWeapon()?.name || "Unknown"
    this.killFeedSystem.addKill("You", zombieType, weaponUsed)

    if (zombie.isExploder) {
      const dist = Math.hypot(zombie.x - this.player.x, zombie.y - this.player.y)
      if (dist < 100) {
        this.player.takeDamage(30)
        this.triggerHit({ x: zombie.x - this.player.x, y: zombie.y - this.player.y })
        this.triggerScreenShake(15)
      }
    }

    if (Math.random() < 0.05) {
      const types: PowerUpType[] = ["insta-kill", "double-points", "max-ammo", "nuke"]
      const type = types[Math.floor(Math.random() * types.length)]
      this.powerUps.push(new PowerUp(zombie.x, zombie.y, type))
    }
  }

  private updatePowerUps(dt: number) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i]
      powerUp.update(dt)

      if (powerUp.expired) {
        this.powerUps.splice(i, 1)
        continue
      }

      const dist = Math.hypot(powerUp.x - this.player.x, powerUp.y - this.player.y)
      if (dist < 40) {
        this.collectPowerUp(powerUp)
        this.powerUps.splice(i, 1)
      }
    }
  }

  private collectPowerUp(powerUp: PowerUp) {
    this.triggerScreenShake(5)

    switch (powerUp.type) {
      case "insta-kill":
        this.audio.play("instaKill")
        this.activePowerUp = powerUp.type
        this.powerUpTimer = 30000
        break
      case "double-points":
        this.audio.play("doublePoints")
        this.activePowerUp = powerUp.type
        this.powerUpTimer = 30000
        break
      case "max-ammo":
        this.audio.play("maxAmmo")
        this.player.maxAmmo()
        break
      case "nuke":
        this.audio.play("nukeExplosion")
        for (const zombie of this.zombies) {
          zombie.takeDamage(9999)
          this.points += 50
        }
        this.zombies = []
        this.triggerScreenShake(20)
        break
    }
  }

  swapWeapon(slotIndex: number, newWeapon: WeaponData) {
    if (this.pendingWeaponPurchase) {
      this.points -= this.pendingWeaponPurchase.cost
      this.player.swapWeapon(slotIndex, newWeapon)
      this.pendingWeaponPurchase = null
      this.audio.play("purchase")
    }
  }

  private updateGrenades(dt: number) {
    for (let i = this.grenades.length - 1; i >= 0; i--) {
      const grenade = this.grenades[i]
      const exploded = grenade.update(dt)

      if (exploded) {
        // Create explosion effect
        this.explosions.push({
          x: grenade.targetX,
          y: grenade.targetY,
          type: grenade.type,
          timer: 500,
          maxTime: 500,
        })

        // Add explosion particles
        if (grenade.type === "frag") {
          this.particleSystem.addParticles(30, grenade.targetX, grenade.targetY, {
            velocity: { min: 50, max: 300 },
            angle: { min: 0, max: Math.PI * 2 },
            life: { min: 300, max: 800 },
            size: { min: 2, max: 8 },
            color: "#ff4500",
          })
        } else {
          // Stun grenade particles
          this.particleSystem.addParticles(20, grenade.targetX, grenade.targetY, {
            velocity: { min: 50, max: 200 },
            angle: { min: 0, max: Math.PI * 2 },
            life: { min: 500, max: 1200 },
            size: { min: 3, max: 6 },
            color: "#7cfc00",
          })
        }

        // Apply explosion effects to zombies
        const explosionRadius = grenade.getExplosionRadius()
        const damage = grenade.getDamage()
        const stunDuration = grenade.getStunDuration()

        for (let j = this.zombies.length - 1; j >= 0; j--) {
          const zombie = this.zombies[j]
          const dist = Math.hypot(zombie.x - grenade.targetX, zombie.y - grenade.targetY)

          if (dist < explosionRadius) {
            if (grenade.type === "frag") {
              // Damage falloff based on distance
              const damageMultiplier = 1 - dist / explosionRadius
              const explosionDamage = damage * damageMultiplier
              zombie.takeDamage(explosionDamage)

              // Add floating text for damage
              this.floatingTextSystem.addText(
                zombie.x,
                zombie.y - 30, // Above the zombie
                Math.floor(explosionDamage).toString(),
                {
                  color: "#ff6600", // Orange for explosion damage
                  size: 16,
                }
              )

              if (zombie.health <= 0) {
                this.handleZombieDeath(zombie)
                this.zombies.splice(j, 1)
                this.zombiesKilled++
              }
            } else if (grenade.type === "molotov") {
              // Molotov causes burning damage over time
              const damageMultiplier = 1 - dist / explosionRadius
              const explosionDamage = damage * damageMultiplier
              zombie.takeDamage(explosionDamage)

              // Add visual burn effect
              zombie.burn(2000) // Burn for 2 seconds

              // Add floating text for damage
              this.floatingTextSystem.addText(
                zombie.x,
                zombie.y - 30, // Above the zombie
                Math.floor(explosionDamage).toString(),
                {
                  color: "#ff4500", // Orange-red for molotov damage
                  size: 16,
                }
              )

              if (zombie.health <= 0) {
                this.handleZombieDeath(zombie)
                this.zombies.splice(j, 1)
                this.zombiesKilled++
              }
            } else {
              // Stun effects (for both "stun" and "disco" types)
              zombie.stun(stunDuration)
            }
          }
        }

        this.triggerScreenShake(grenade.type === "frag" ? 15 : (grenade.type === "molotov" ? 12 : 8))
        switch (grenade.type) {
          case "frag":
            this.audio.play("fragExplosion")
            break
          case "stun":
            this.audio.play("stunExplosion")
            break
          case "molotov":
            this.audio.play("molotovExplosion")
            break
          case "disco":
            this.audio.play("discoExplosion")
            break
        }
        this.grenades.splice(i, 1)
      }
    }

    // Update explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      this.explosions[i].timer -= dt
      if (this.explosions[i].timer <= 0) {
        this.explosions.splice(i, 1)
      }
    }
  }

  private throwGrenade(type: GrenadeType) {
    const throwDistance = 300 // Fixed throw distance
    const targetX = this.player.x + Math.cos(this.player.angle) * throwDistance
    const targetY = this.player.y + Math.sin(this.player.angle) * throwDistance

    const grenade = this.player.throwGrenade(targetX, targetY, type)
    if (grenade) {
      this.grenades.push(grenade)
      this.audio.play("throwGrenade")
    }
  }

  private render() {
    this.ctx.fillStyle = "#1a1a1a"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.save()

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    this.ctx.translate(centerX, centerY)
    this.ctx.scale(this.currentZoom, this.currentZoom)
    this.ctx.translate(-centerX, -centerY)

    this.ctx.translate(-this.smoothCamera.x, -this.smoothCamera.y)

    this.gameMap.render(this.ctx)

    this.gameMap.renderDoorPrompts(this.ctx, this.player.x, this.player.y)

    // Render additional prompts based on map type
    if (this.gameMap instanceof GameMapLevel2 || this.gameMap instanceof GameMapLevel3) {
      // For redesigned maps, render power switch and other prompts from map class
      const mapWithPrompts = this.gameMap as any; // Using 'any' to access prompt methods
      mapWithPrompts.renderPowerSwitchPrompt(this.ctx, this.player.x, this.player.y);
      mapWithPrompts.renderVendingMachinePrompts(this.ctx, this.player.x, this.player.y);
      mapWithPrompts.renderMysteryBoxPrompt(this.ctx, this.player.x, this.player.y);
    }

    this.renderInteractables()

    for (const powerUp of this.powerUps) {
      powerUp.render(this.ctx)
    }

    for (const zombie of this.zombies) {
      zombie.render(this.ctx)
    }

    for (const bullet of this.bullets) {
      bullet.render(this.ctx)
    }

    for (const grenade of this.grenades) {
      grenade.render(this.ctx)
    }

    for (const explosion of this.explosions) {
      const progress = 1 - explosion.timer / explosion.maxTime
      const tempGrenade = new Grenade(0, 0, explosion.x, explosion.y, explosion.type)
      tempGrenade.renderExplosion(this.ctx, progress)
    }

    this.player.render(this.ctx)

    // Render particles
    this.particleSystem.render(this.ctx)

    this.ctx.restore()

    // Render floating text
    this.floatingTextSystem.render(this.ctx, this.smoothCamera.x, this.smoothCamera.y, this.currentZoom)

    this.renderHealthVignette()

    // Render kill feed
    this.renderKillFeed()

    // Render start countdown if active
    if (this.isCountdownActive) {
      const secondsLeft = Math.ceil(this.startCountdown / 1000);
      let displayText = "";
      let color = "";

      if (secondsLeft > 0) {
        displayText = secondsLeft.toString();
        color = "#ffffff"; // White
      } else {
        displayText = "GO!";
        color = "#00ff00"; // Green
      }

      this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)"; // Semi-transparent black background
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = color;
      this.ctx.font = "bold 120px sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(displayText, this.canvas.width / 2, this.canvas.height / 2);
    }

    if (this.roundTransition) {
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      this.ctx.fillStyle = "#ff3333"
      this.ctx.font = "bold 72px sans-serif"
      this.ctx.textAlign = "center"
      this.ctx.fillText(`ROUND ${this.round + 1}`, this.canvas.width / 2, this.canvas.height / 2)
    }
  }

  private renderKillFeed() {
    const killEntries = this.killFeedSystem.getKillEntries()

    if (killEntries.length === 0) return

    const startY = 40 // Start from the top
    const spacing = 25
    const maxWidth = 350
    const centerX = this.canvas.width / 2
    const offsetX = maxWidth / 2 // To center the background

    // Draw a semi-transparent background for the kill feed
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
    this.ctx.fillRect(centerX - offsetX, startY - 10, maxWidth, killEntries.length * spacing + 20)

    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "14px 'Geist', sans-serif"
    this.ctx.textAlign = "left"

    // Render each kill entry
    killEntries.forEach((entry, index) => {
      const y = startY + index * spacing
      const textOffsetX = centerX - offsetX // Align text to the left of the centered background

      // Draw the kill message
      this.ctx.fillStyle = "#ffcc00" // Yellow for player
      this.ctx.fillText("You", textOffsetX + 10, y)

      this.ctx.fillStyle = "#aaaaaa" // Gray for weapon
      this.ctx.fillText("killed", textOffsetX + 60, y)

      this.ctx.fillStyle = "#ff6666" // Red for zombie
      this.ctx.fillText(entry.victim, textOffsetX + 120, y)

      this.ctx.fillStyle = "#44aaff" // Blue for weapon
      this.ctx.fillText(`with ${entry.weapon}`, textOffsetX + 180, y)
    })
  }

  private renderInteractables() {
    for (const wallBuy of this.wallBuys) {
      wallBuy.render(this.ctx, this.player.x, this.player.y)
    }
    for (const box of this.mysteryBoxes) {
      box.render(this.ctx, this.player.x, this.player.y)
    }

    // Render vending machines based on the map type
    if (this.gameMap instanceof GameMapLevel2 || this.gameMap instanceof GameMapLevel3) {
      // For redesigned maps, use the methods from the map class
      const mapWithVending = this.gameMap as any; // Using 'any' to access vending-machine methods
      for (const vm of mapWithVending.vendingMachines) {
        // Since the map class handles vending machine rendering, we just call it
        // The map class renders them in its render function
      }
    } else {
      // Original vending machine rendering for level 1
      for (const machine of this.vendingMachines) {
        machine.render(this.ctx, this.player.x, this.player.y)
      }
    }

    for (const ammoBox of this.maxAmmoBoxes) {
      ammoBox.render(this.ctx, this.player.x, this.player.y)
    }
  }

  private renderHealthVignette() {
    const healthRatio = this.player.getHealthRatio()
    if (healthRatio >= 1) return

    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      this.canvas.width * 0.2,
      this.canvas.width / 2,
      this.canvas.height / 2,
      this.canvas.width * 0.7,
    )

    const intensity = Math.pow(1 - healthRatio, 1.5) * 0.6

    gradient.addColorStop(0, "rgba(0, 0, 0, 0)")
    gradient.addColorStop(0.5, `rgba(20, 0, 0, ${intensity * 0.3})`)
    gradient.addColorStop(1, `rgba(40, 0, 0, ${intensity})`)

    this.ctx.fillStyle = gradient
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    if (healthRatio < 0.3) {
      const pulseIntensity = ((Math.sin(Date.now() / 200) + 1) / 2) * 0.3 + 0.2
      const borderGradient = this.ctx.createRadialGradient(
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.canvas.width * 0.4,
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.canvas.width * 0.8,
      )
      borderGradient.addColorStop(0, "rgba(255, 0, 0, 0)")
      borderGradient.addColorStop(1, `rgba(255, 0, 0, ${pulseIntensity * (1 - healthRatio / 0.3)})`)

      this.ctx.fillStyle = borderGradient
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  private updateHUDData() {
    const currentWeapon = this.player.getCurrentWeapon()
    this.updateHUD({
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      points: this.points,
      round: this.round,
      zombiesLeft: this.zombiesToSpawn - this.zombiesKilled + this.zombies.length,
      currentWeapon: currentWeapon
        ? {
            name: currentWeapon.name,
            ammo: currentWeapon.ammo,
            maxAmmo: currentWeapon.maxAmmo,
            reserveAmmo: currentWeapon.reserveAmmo,
          }
        : { name: "None", ammo: 0, maxAmmo: 0, reserveAmmo: 0 },
      weapons: this.player.weapons.map((w) => ({
        name: w.name,
        ammo: w.ammo,
        maxAmmo: w.maxAmmo,
        reserveAmmo: w.reserveAmmo,
      })),
      currentWeaponIndex: this.player.currentWeaponIndex,
      perks: this.player.perks,
      powerUp: this.activePowerUp,
      powerUpTimer: this.powerUpTimer,
      fragGrenade: this.player.fragGrenade,
      stunGrenade: this.player.stunGrenade,
      molotovGrenade: this.player.molotovGrenade,
      discoGrenade: this.player.discoGrenade,
      rollCooldown: this.player.getRollCooldown(),
      rollCooldownPercent: this.player.getRollCooldownPercent(),
      isRollReady: this.player.isRollReady(),
    })
  }

  private updatePlayer(dt: number, gpState: ReturnType<GamepadManager["update"]>) {
    let dx = 0
    let dy = 0
    if (this.keys.has("w") || this.keys.has("arrowup")) dy -= 1
    if (this.keys.has("s") || this.keys.has("arrowdown")) dy += 1
    if (this.keys.has("a") || this.keys.has("arrowleft")) dx -= 1
    if (this.keys.has("d") || this.keys.has("arrowright")) dx += 1

    if (gpState.connected) {
      dx += gpState.leftStick.x
      dy += gpState.leftStick.y
    }

    this.player.move(dx, dy, dt, this.gameMap)

    if (gpState.connected && (Math.abs(gpState.rightStick.x) > 0.1 || Math.abs(gpState.rightStick.y) > 0.1)) {
      const angle = Math.atan2(gpState.rightStick.y, gpState.rightStick.x)
      this.player.aimAtAngle(angle)
    } else {
      const worldMouseX = this.mouse.x / this.currentZoom + this.smoothCamera.x
      const worldMouseY = this.mouse.y / this.currentZoom + this.smoothCamera.y
      this.player.aimAt(worldMouseX, worldMouseY)
    }

    if (gpState.connected) {
      if (gpState.buttons.reload) this.player.reload()
      if (gpState.buttons.interact) this.handleInteraction()
      if (gpState.buttons.knife) this.handleKnifeAttack()
      if (gpState.buttons.weaponNext) {
        const nextIndex = (this.player.currentWeaponIndex + 1) % this.player.weapons.length
        this.player.switchWeapon(nextIndex)
        this.audio.play("switchWeapons")
      }
      if (gpState.buttons.weaponPrev) {
        const prevIndex = (this.player.currentWeaponIndex - 1 + this.player.weapons.length) % this.player.weapons.length
        this.player.switchWeapon(prevIndex)
        this.audio.play("switchWeapons")
      }
      // Gamepad controls use the same logic as keyboard (G and F)
      if (gpState.buttons.prevWeapon) {
        if (this.player.hasGrenade("disco")) {
          this.throwGrenade("disco");
        } else {
          this.throwGrenade("stun");
        }
      }
      if (gpState.buttons.nextWeapon) {
        if (this.player.hasGrenade("molotov")) {
          this.throwGrenade("molotov");
        } else {
          this.throwGrenade("frag");
        }
      }
      if (gpState.buttons.roll) this.player.roll(gpState.leftStick.x, gpState.leftStick.y)
    }

    if (this.mouse.down) {
      const bullet = this.player.shoot(dt)
      if (bullet) {
        this.bullets.push(bullet)
        // Play weapon-specific shooting sound
        const currentWeapon = this.player.getCurrentWeapon()
        if (currentWeapon) {
          if (currentWeapon.name.includes("Pistol")) {
            this.audio.play("pistolShoot")
          } else if (currentWeapon.name.includes("Rifle") || currentWeapon.name.includes("AK47") || currentWeapon.name.includes("LMG")) {
            this.audio.play("rifleShoot")
          } else if (currentWeapon.name.includes("Shotgun")) {
            this.audio.play("shotgunShoot")
          } else {
            this.audio.play("shoot") // fallback to generic shoot
          }
        } else {
          this.audio.play("shoot")
        }
        this.triggerScreenShake(3)
      }
    }

    this.player.update(dt)
  }

  private spawnZombie() {
    const activeSpawns = this.gameMap.getActiveSpawnPoints()
    if (activeSpawns.length === 0) return

    const spawn = activeSpawns[Math.floor(Math.random() * activeSpawns.length)]

    const isBoss = this.round % 5 === 0 && this.zombiesSpawned === 0
    const isExploder = Math.random() < 0.1 && this.round > 3
    const isToxic = Math.random() < 0.1 && this.round > 5

    const zombie = new Zombie(spawn.x, spawn.y, this.round, isBoss, isExploder, isToxic)
    this.zombies.push(zombie)
    this.zombiesSpawned++
  }

  private updateCameraAndZoom(dt: number) {
    const targetCameraX = this.player.x - this.canvas.width / 2 / this.currentZoom
    const targetCameraY = this.player.y - this.canvas.height / 2 / this.currentZoom

    const maxCameraX = this.gameMap.width - this.canvas.width / this.currentZoom
    const maxCameraY = this.gameMap.height - this.canvas.height / this.currentZoom
    this.camera.x = Math.max(0, Math.min(targetCameraX, maxCameraX))
    this.camera.y = Math.max(0, Math.min(targetCameraY, maxCameraY))

    this.smoothCamera.x += (this.camera.x - this.smoothCamera.x) * GameEngine.CAMERA_SMOOTHING
    this.smoothCamera.y += (this.camera.y - this.smoothCamera.y) * GameEngine.CAMERA_SMOOTHING

    const healthRatio = this.player.getHealthRatio()
    const zoomFactor = 1 - Math.pow(1 - healthRatio, 2) * (1 - GameEngine.MIN_ZOOM)
    this.targetZoom = this.baseZoom / zoomFactor

    this.currentZoom += (this.targetZoom - this.currentZoom) * GameEngine.ZOOM_SMOOTHING
  }

  private tryBuyWeapon(weapon: WeaponData, cost: number) {
    if (this.points < cost) {
      // Player doesn't have enough money for the weapon
      this.audio.play("cantBuy")
      return
    }

    if (this.player.weapons.length >= 2) {
      this.pendingWeaponPurchase = { weapon, cost }
      this.showWeaponSwap(weapon, cost)
    } else {
      this.points -= cost
      this.player.addWeapon(weapon)
      this.audio.play("purchase")
    }
  }

  playTrailer() {
    this.audio.playTrailer();
  }

  stopTrailer() {
    this.audio.stopTrailer();
  }

  updateVolumes(masterVolume: number, musicVolume: number, soundVolume: number) {
    // Scale music and sound volumes by master volume
    this.audio.updateVolumes(soundVolume * masterVolume, musicVolume * masterVolume);
  }

  toggleSound(enabled: boolean) {
    this.audio.toggleSound(enabled);
  }

  toggleMusic(enabled: boolean) {
    this.audio.toggleMusic(enabled);
  }

  playSound(sound: SoundType) {
    this.audio.play(sound);
  }
}

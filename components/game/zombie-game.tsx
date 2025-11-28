"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { GameEngine } from "@/lib/game/engine"
import { GameHUD } from "./game-hud"
import { StartScreen } from "./start-screen"
import { GameOverScreen } from "./game-over-screen"
import { WeaponSwapModal } from "./weapon-swap-modal"
import { HitOverlay } from "./hit-overlay"
import { PauseMenu } from "./pause-menu"
import { MapSelector } from "./map-selector"

export default function ZombieGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const [gameState, setGameState] = useState<"menu" | "mapselect" | "playing" | "paused" | "gameover">("menu")
  const [showPauseMenu, setShowPauseMenu] = useState(false)
  const [selectedMap, setSelectedMap] = useState<"level1" | "level2" | "level3">("level1")
  const [hudData, setHudData] = useState({
    health: 100,
    maxHealth: 100,
    points: 500,
    round: 1,
    zombiesLeft: 0,
    currentWeapon: { name: "M1911", ammo: 8, maxAmmo: 8, reserveAmmo: 32 },
    weapons: [{ name: "M1911", ammo: 8, maxAmmo: 8, reserveAmmo: 32 }],
    currentWeaponIndex: 0,
    perks: [] as string[],
    powerUp: null as string | null,
    powerUpTimer: 0,
  })
  const [weaponSwapData, setWeaponSwapData] = useState<{
    show: boolean
    newWeapon: { name: string; damage: number; fireRate: number } | null
    cost: number
  }>({ show: false, newWeapon: null, cost: 0 })
  const [hitDirection, setHitDirection] = useState<{ x: number; y: number } | null>(null)
  const [screenShake, setScreenShake] = useState({ x: 0, y: 0 })
  const shakeRef = useRef<number | null>(null)
  const [settings, setSettings] = useState({
    masterVolume: 0.7,
    musicVolume: 0.5,
    soundVolume: 0.7,
    screenShakeEnabled: true,
    fpsOverlayEnabled: false,
  });

  const updateHUD = useCallback((data: typeof hudData) => {
    setHudData(data)
  }, [])

  const showWeaponSwap = useCallback((weapon: any, cost: number) => {
    setWeaponSwapData({ show: true, newWeapon: weapon, cost })
  }, [])

  const triggerHit = useCallback((direction: { x: number; y: number }) => {
    setHitDirection(direction)
    setTimeout(() => setHitDirection(null), 300)
  }, [])

  const triggerScreenShake = useCallback((intensity: number) => {
    // Only apply screen shake if it's enabled in settings
    if (!settings.screenShakeEnabled) {
      return;
    }

    if (shakeRef.current) {
      cancelAnimationFrame(shakeRef.current)
    }

    let currentIntensity = intensity
    const decay = 0.9
    const minIntensity = 0.5

    const shake = () => {
      if (currentIntensity < minIntensity) {
        setScreenShake({ x: 0, y: 0 })
        shakeRef.current = null
        return
      }

      setScreenShake({
        x: (Math.random() - 0.5) * currentIntensity * 2,
        y: (Math.random() - 0.5) * currentIntensity * 2,
      })

      currentIntensity *= decay
      shakeRef.current = requestAnimationFrame(shake)
    }

    shake()
  }, [settings.screenShakeEnabled])

  const togglePauseMenu = useCallback(() => {
    if (gameState === "playing") {
      // Play a random pause sound
      if (gameEngineRef.current) {
        const pauseSounds: ("pause1" | "pause2")[] = ["pause1", "pause2"];
        const randomPauseSound = pauseSounds[Math.floor(Math.random() * pauseSounds.length)];
        gameEngineRef.current.playSound(randomPauseSound);
      }

      setShowPauseMenu((prev) => !prev)
    }
  }, [gameState])

  const updateSettings = useCallback((newSettings: typeof settings) => {
    setSettings(newSettings);

    // Update game engine volumes if it exists
    if (gameEngineRef.current) {
      gameEngineRef.current.updateVolumes(
        newSettings.masterVolume,
        newSettings.musicVolume,
        newSettings.soundVolume
      );
    }
  }, []);

  const startGame = useCallback((newSettings?: typeof settings) => {
    // First, show the map selector
    setGameState("mapselect")

    // Update settings if provided
    if (newSettings) {
      setSettings(newSettings);
    }
  }, [])

  const selectAndStartGame = useCallback((mapId: "level1" | "level2" | "level3", currentSettings?: typeof settings) => {
    setSelectedMap(mapId);
    setGameState("playing")
    setShowPauseMenu(false)
    if (canvasRef.current && !gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(
        canvasRef.current,
        updateHUD,
        showWeaponSwap,
        triggerHit,
        triggerScreenShake,
        () => setGameState("gameover"),
        togglePauseMenu,
        mapId // Pass the selected map to the game engine
      )
      gameEngineRef.current.start()
    } else if (gameEngineRef.current) {
      gameEngineRef.current.restartWithMap(mapId) // Use the new method to restart with new map
    }

    // Stop trailer if it's playing
    if (gameEngineRef.current) {
      gameEngineRef.current.stopTrailer();
    }

    // Update settings if provided
    if (currentSettings) {
      setSettings(currentSettings);
    }

    // Update volumes based on settings
    if (gameEngineRef.current) {
      gameEngineRef.current.updateVolumes(
        currentSettings?.masterVolume ?? settings.masterVolume,
        currentSettings?.musicVolume ?? settings.musicVolume,
        currentSettings?.soundVolume ?? settings.soundVolume
      );
    }
  }, [updateHUD, showWeaponSwap, triggerHit, triggerScreenShake, togglePauseMenu, settings])

  // FPS counter state
  const [fps, setFps] = useState(0);

  // FPS calculation
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let fpsUpdateHandle: number;

    const calculateFps = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime >= lastTime + 1000) { // Update every second
        const currentFps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setFps(currentFps);

        frameCount = 0;
        lastTime = currentTime;
      }

      fpsUpdateHandle = requestAnimationFrame(calculateFps);
    };

    if (gameState === "playing") {
      fpsUpdateHandle = requestAnimationFrame(calculateFps);
    }

    return () => {
      if (fpsUpdateHandle) {
        cancelAnimationFrame(fpsUpdateHandle);
      }
    };
  }, [gameState]);

  const handlePlayTrailer = useCallback(() => {
    if (canvasRef.current && !gameEngineRef.current) {
      // If game engine is not initialized yet, initialize it just to access audio
      const tempEngine = new GameEngine(
        canvasRef.current,
        updateHUD,
        showWeaponSwap,
        triggerHit,
        triggerScreenShake,
        () => setGameState("gameover"),
        togglePauseMenu,
      );
      tempEngine.playTrailer(); // This will play the trailer audio
    } else if (gameEngineRef.current) {
      gameEngineRef.current.playTrailer();
    }
  }, [updateHUD, showWeaponSwap, triggerHit, triggerScreenShake, togglePauseMenu]);

  const handleWeaponSwap = useCallback(
    (slotIndex: number) => {
      if (gameEngineRef.current && weaponSwapData.newWeapon) {
        gameEngineRef.current.swapWeapon(slotIndex, weaponSwapData.newWeapon)
        setWeaponSwapData({ show: false, newWeapon: null, cost: 0 })
      }
    },
    [weaponSwapData.newWeapon],
  )

  const cancelWeaponSwap = useCallback(() => {
    setWeaponSwapData({ show: false, newWeapon: null, cost: 0 })
  }, [])

  const handleResume = useCallback(() => {
    setShowPauseMenu(false)
  }, [])

  const handleSettings = useCallback(() => {
    // Settings functionality placeholder - this would open the settings modal in the pause menu
    // For now, we'll just log it
    console.log("Settings clicked - to be implemented")
  }, [])

  const handleExit = useCallback(() => {
    setShowPauseMenu(false)
    setGameState("menu")
    if (gameEngineRef.current) {
      gameEngineRef.current.stop()
      gameEngineRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    return () => {
      if (shakeRef.current) {
        cancelAnimationFrame(shakeRef.current)
      }
      if (gameEngineRef.current) {
        gameEngineRef.current.stop()
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      <div
        style={{
          transform: `translate3d(${screenShake.x}px, ${screenShake.y}px, 0)`,
          willChange: "transform",
        }}
        className="w-full h-full"
      >
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{
            imageRendering: "pixelated",
            transform: "translateZ(0)",
          }}
        />

        {/* FPS Overlay - only show when enabled in settings and in playing state */}
        {gameState === "playing" && settings.fpsOverlayEnabled && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-green-400 font-mono text-lg px-3 py-1 rounded">
            FPS: {fps}
          </div>
        )}
      </div>

      {gameState === "menu" && <StartScreen onStart={startGame} onPlayTrailer={handlePlayTrailer} />}
      {gameState === "mapselect" && <MapSelector onSelectMap={(mapId) => selectAndStartGame(mapId, settings)} />}
      {gameState === "gameover" && (
        <GameOverScreen round={hudData.round} points={hudData.points} onRestart={() => startGame()} />
      )}
      {gameState === "playing" && (
        <>
          <GameHUD data={hudData} />
          <HitOverlay direction={hitDirection} />
          {weaponSwapData.show && weaponSwapData.newWeapon && (
            <WeaponSwapModal
              newWeapon={weaponSwapData.newWeapon}
              currentWeapons={hudData.weapons}
              onSwap={handleWeaponSwap}
              onCancel={cancelWeaponSwap}
            />
          )}
          {showPauseMenu && <PauseMenu onResume={handleResume} onSettings={handleSettings} onExit={handleExit} />}
        </>
      )}
    </div>
  )
}

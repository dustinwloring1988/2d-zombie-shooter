"use client"

import { Button } from "@/components/ui/button"
import { Pause, Play, Settings, LogOut } from "lucide-react"

interface PauseMenuProps {
  onResume: () => void
  onSettings: () => void
  onExit: () => void
}

export function PauseMenu({ onResume, onSettings, onExit }: PauseMenuProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 border-2 border-zinc-600 mb-4">
            <Pause className="w-8 h-8 text-zinc-300" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-wider">PAUSED</h2>
          <p className="text-zinc-400 mt-2 text-sm">Game is still running in background</p>
        </div>

        {/* Menu Options */}
        <div className="space-y-3">
          <Button
            onClick={onResume}
            className="w-full h-14 text-lg font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200 hover:scale-[1.02]"
          >
            <Play className="w-5 h-5 mr-3" />
            Resume Game
          </Button>

          <Button
            onClick={onSettings}
            variant="outline"
            className="w-full h-14 text-lg font-semibold border-zinc-600 bg-zinc-800/50 hover:bg-zinc-700 text-white transition-all duration-200 hover:scale-[1.02]"
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Button>

          <Button
            onClick={onExit}
            variant="outline"
            className="w-full h-14 text-lg font-semibold border-red-900/50 bg-red-950/30 hover:bg-red-900/50 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-[1.02]"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Exit to Menu
          </Button>
        </div>

        {/* Controls Reminder */}
        <div className="mt-8 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
          <h3 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wide">Controls</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-500">Move</span>
              <span>WASD / Left Stick</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-500">Aim</span>
              <span>Mouse / Right Stick</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-500">Shoot</span>
              <span>LMB / RT</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-500">Knife</span>
              <span>RMB / LT</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-500">Reload</span>
              <span>R / X</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-500">Interact</span>
              <span>E / A</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-500">Switch</span>
              <span>Scroll / LB/RB</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span className="text-zinc-500">Pause</span>
              <span>ESC / Start</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

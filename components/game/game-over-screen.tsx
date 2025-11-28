"use client"

import { Skull, RotateCcw } from "lucide-react"

interface GameOverScreenProps {
  round: number
  points: number
  onRestart: () => void
}

export function GameOverScreen({ round, points, onRestart }: GameOverScreenProps) {
  return (
    <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center">
      <div className="text-center">
        <Skull className="w-24 h-24 text-red-600 mx-auto mb-6 animate-pulse" />

        <h1 className="text-6xl font-black text-red-600 mb-2">YOU DIED</h1>
        <p className="text-zinc-400 text-xl mb-8">The horde was too strong...</p>

        <div className="flex gap-8 justify-center mb-10">
          <div className="text-center">
            <div className="text-zinc-500 text-sm uppercase tracking-wider">Round Reached</div>
            <div className="text-4xl font-black text-white">{round}</div>
          </div>
          <div className="text-center">
            <div className="text-zinc-500 text-sm uppercase tracking-wider">Final Score</div>
            <div className="text-4xl font-black text-yellow-400">{points.toLocaleString()}</div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="group relative bg-red-600 hover:bg-red-500 text-white font-black text-xl px-10 py-4 rounded-lg transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="flex items-center gap-3">
            <RotateCcw className="w-6 h-6" />
            <span>TRY AGAIN</span>
          </div>
        </button>
      </div>
    </div>
  )
}

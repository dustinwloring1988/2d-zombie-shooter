"use client"

import type React from "react"

import { Heart, Zap, Target, Skull, Shield, Footprints, RefreshCw, Bomb, Sparkles } from "lucide-react"

interface HUDData {
  health: number
  maxHealth: number
  points: number
  round: number
  zombiesLeft: number
  currentWeapon: { name: string; ammo: number; maxAmmo: number; reserveAmmo: number }
  weapons: { name: string; ammo: number; maxAmmo: number; reserveAmmo: number }[]
  currentWeaponIndex: number
  perks: string[]
  powerUp: string | null
  powerUpTimer: number
  fragGrenade: number
  stunGrenade: number
  molotovGrenade: number
  discoGrenade: number
  rollCooldown: number
  rollCooldownPercent: number
  isRollReady: boolean
}

const PERK_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  juggernog: { icon: <Shield className="w-5 h-5" />, color: "text-red-500" },
  "speed-cola": { icon: <Zap className="w-5 h-5" />, color: "text-lime-400" },
  "double-tap": { icon: <Target className="w-5 h-5" />, color: "text-yellow-400" },
  "quick-revive": { icon: <RefreshCw className="w-5 h-5" />, color: "text-cyan-400" },
  "stamin-up": { icon: <Footprints className="w-5 h-5" />, color: "text-orange-400" },
}

export function GameHUD({ data }: { data: HUDData }) {
  const healthPercent = (data.health / data.maxHealth) * 100
  const healthColor = healthPercent > 60 ? "bg-emerald-500" : healthPercent > 30 ? "bg-yellow-500" : "bg-red-500"

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top Left - Round Info */}
      <div className="absolute top-4 left-4">
        <div className="bg-black/70 backdrop-blur-sm border border-red-900/50 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <Skull className="w-8 h-8 text-red-500" />
            <div>
              <div className="text-red-500 text-xs font-bold uppercase tracking-wider">Round</div>
              <div className="text-white text-3xl font-black">{data.round}</div>
            </div>
          </div>
          <div className="mt-2 text-zinc-400 text-sm">
            <span className="text-red-400">{data.zombiesLeft}</span> zombies remaining
          </div>
        </div>
      </div>

      {/* Top Right - Points */}
      <div className="absolute top-4 right-4">
        <div className="bg-black/70 backdrop-blur-sm border border-yellow-900/50 rounded-lg px-4 py-3">
          <div className="text-yellow-500 text-xs font-bold uppercase tracking-wider">Points</div>
          <div className="text-yellow-400 text-3xl font-black tabular-nums">{data.points.toLocaleString()}</div>
        </div>
      </div>

      {/* Bottom Left - Health & Perks */}
      <div className="absolute bottom-4 left-4">
        <div className="bg-black/70 backdrop-blur-sm border border-zinc-800 rounded-lg p-4 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-white font-bold">{Math.ceil(data.health)}</span>
            <span className="text-zinc-500">/ {data.maxHealth}</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${healthColor} transition-all duration-200`}
              style={{ width: `${healthPercent}%` }}
            />
          </div>

          {/* Perks */}
          {data.perks.length > 0 && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-700">
              {data.perks.map((perk) => {
                const perkInfo = PERK_ICONS[perk]
                return (
                  <div
                    key={perk}
                    className={`p-1.5 bg-zinc-800 rounded ${perkInfo?.color || "text-white"}`}
                    title={perk}
                  >
                    {perkInfo?.icon || <Zap className="w-5 h-5" />}
                  </div>
                )
              })}
            </div>
          )}

          <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-700">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${data.fragGrenade > 0 ? "bg-green-900/50" : "bg-zinc-800/50"}`}>
                <Bomb className={`w-4 h-4 ${data.fragGrenade > 0 ? "text-green-500" : "text-zinc-600"}`} />
              </div>
              <span className={`text-sm font-bold ${data.fragGrenade > 0 ? "text-green-400" : "text-zinc-600"}`}>
                {data.fragGrenade}
              </span>
              <span className="text-zinc-600 text-xs">G</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${data.stunGrenade > 0 ? "bg-blue-900/50" : "bg-zinc-800/50"}`}>
                <Sparkles className={`w-4 h-4 ${data.stunGrenade > 0 ? "text-blue-400" : "text-zinc-600"}`} />
              </div>
              <span className={`text-sm font-bold ${data.stunGrenade > 0 ? "text-blue-400" : "text-zinc-600"}`}>
                {data.stunGrenade}
              </span>
              <span className="text-zinc-600 text-xs">F</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${data.molotovGrenade > 0 ? "bg-orange-900/50" : "bg-zinc-800/50"}`}>
                <Bomb className={`w-4 h-4 ${data.molotovGrenade > 0 ? "text-orange-500" : "text-zinc-600"}`} />
              </div>
              <span className={`text-sm font-bold ${data.molotovGrenade > 0 ? "text-orange-400" : "text-zinc-600"}`}>
                {data.molotovGrenade}
              </span>
              <span className="text-zinc-600 text-xs">G</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${data.discoGrenade > 0 ? "bg-purple-900/50" : "bg-zinc-800/50"}`}>
                <Sparkles className={`w-4 h-4 ${data.discoGrenade > 0 ? "text-purple-400" : "text-zinc-600"}`} />
              </div>
              <span className={`text-sm font-bold ${data.discoGrenade > 0 ? "text-purple-400" : "text-zinc-600"}`}>
                {data.discoGrenade}
              </span>
              <span className="text-zinc-600 text-xs">F</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded ${data.isRollReady ? "bg-purple-600" : "bg-zinc-800/50"}`}>
                <Footprints className={`w-4 h-4 ${data.isRollReady ? "text-purple-200" : "text-zinc-600"}`} />
              </div>
              <span className={`text-sm font-bold ${data.isRollReady ? "text-purple-400" : "text-zinc-600"}`}>
                {data.isRollReady ? "0" : Math.ceil(data.rollCooldown / 1000)}
              </span>
              <span className="text-zinc-600 text-xs">Shift</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right - Weapons */}
      <div className="absolute bottom-4 right-4">
        <div className="bg-black/70 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-zinc-500 text-sm">
              <span className="w-8 text-center text-xs bg-zinc-800 rounded px-1">RMB</span>
              <span>Knife</span>
            </div>

            {/* Weapons */}
            {data.weapons.map((weapon, index) => {
              const isActive = index === data.currentWeaponIndex
              return (
                <div key={index} className={`flex items-center gap-3 ${isActive ? "text-white" : "text-zinc-500"}`}>
                  <span className={`w-8 text-center text-xs rounded px-1 ${isActive ? "bg-red-600" : "bg-zinc-800"}`}>
                    {index + 1}
                  </span>
                  <span className="font-bold">{weapon.name}</span>
                  {isActive && (
                    <span className="ml-auto tabular-nums">
                      <span className={weapon.ammo === 0 ? "text-red-500" : "text-white"}>{weapon.ammo}</span>
                      <span className="text-zinc-500"> / {weapon.reserveAmmo}</span>
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Center - Power-up Active */}
      {data.powerUp && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2">
          <div className="bg-black/80 border-2 border-yellow-500 rounded-lg px-6 py-3 animate-pulse">
            <div className="text-yellow-400 text-xl font-black uppercase text-center">
              {data.powerUp.replace("-", " ")}
            </div>
            <div className="text-yellow-500 text-center text-sm mt-1">
              {Math.ceil(data.powerUpTimer / 1000)}s remaining
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="bg-black/50 rounded px-3 py-1 text-zinc-500 text-xs">
          WASD Move | Mouse Aim | LMB Shoot | RMB Knife | Scroll Swap | R Reload | E Interact | G Grenade | F Stun/Disco
        </div>
      </div>
    </div>
  )
}

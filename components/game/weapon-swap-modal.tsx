"use client"

import { X } from "lucide-react"

interface Weapon {
  name: string
  ammo?: number
  maxAmmo?: number
  reserveAmmo?: number
  damage?: number
  fireRate?: number
}

interface WeaponSwapModalProps {
  newWeapon: Weapon
  currentWeapons: Weapon[]
  onSwap: (slotIndex: number) => void
  onCancel: () => void
}

export function WeaponSwapModal({ newWeapon, currentWeapons, onSwap, onCancel }: WeaponSwapModalProps) {
  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center pointer-events-auto">
      <div className="bg-zinc-900 border border-red-900/50 rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Weapon Slots Full</h2>
          <button onClick={onCancel} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-zinc-400 mb-4">
          Choose a weapon to replace with <span className="text-red-400 font-bold">{newWeapon.name}</span>
        </p>

        <div className="space-y-3">
          {currentWeapons.map((weapon, index) => (
            <button
              key={index}
              onClick={() => onSwap(index)}
              className="w-full bg-zinc-800 hover:bg-red-900/30 border border-zinc-700 hover:border-red-600 rounded-lg p-4 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-bold group-hover:text-red-400 transition-colors">{weapon.name}</div>
                  <div className="text-zinc-500 text-sm">
                    Ammo: {weapon.ammo} / {weapon.reserveAmmo}
                  </div>
                </div>
                <div className="text-zinc-500 group-hover:text-red-400 text-sm">Click to replace</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

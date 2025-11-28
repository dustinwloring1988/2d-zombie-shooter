export interface WeaponData {
  name: string
  damage: number
  fireRate: number
  maxAmmo: number
  reserveAmmo: number
  reloadTime: number
}

export const WEAPONS: Record<string, WeaponData> = {
  pistol: {
    name: "M1911",
    damage: 25,
    fireRate: 250,
    maxAmmo: 8,
    reserveAmmo: 32,
    reloadTime: 1500,
  },
  shotgun: {
    name: "Olympia",
    damage: 80,
    fireRate: 800,
    maxAmmo: 2,
    reserveAmmo: 28,
    reloadTime: 2500,
  },
  smg: {
    name: "MP5",
    damage: 18,
    fireRate: 80,
    maxAmmo: 30,
    reserveAmmo: 120,
    reloadTime: 2000,
  },
  rifle: {
    name: "M16",
    damage: 35,
    fireRate: 150,
    maxAmmo: 30,
    reserveAmmo: 120,
    reloadTime: 2500,
  },
  ak47: {
    name: "AK-47",
    damage: 40,
    fireRate: 120,
    maxAmmo: 30,
    reserveAmmo: 90,
    reloadTime: 2800,
  },
  sniper: {
    name: "L96A1",
    damage: 150,
    fireRate: 1500,
    maxAmmo: 5,
    reserveAmmo: 30,
    reloadTime: 3500,
  },
  lmg: {
    name: "RPD",
    damage: 30,
    fireRate: 100,
    maxAmmo: 100,
    reserveAmmo: 300,
    reloadTime: 5000,
  },
  raygun: {
    name: "Ray Gun",
    damage: 200,
    fireRate: 300,
    maxAmmo: 20,
    reserveAmmo: 160,
    reloadTime: 3000,
  },
  thundergun: {
    name: "Thunder Gun",
    damage: 500,
    fireRate: 2000,
    maxAmmo: 2,
    reserveAmmo: 12,
    reloadTime: 4000,
  },
}

export const MYSTERY_BOX_WEAPONS = [
  WEAPONS.shotgun,
  WEAPONS.smg,
  WEAPONS.rifle,
  WEAPONS.ak47,
  WEAPONS.sniper,
  WEAPONS.lmg,
  WEAPONS.raygun,
  WEAPONS.thundergun,
]

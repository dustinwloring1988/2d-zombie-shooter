interface KillEntry {
  id: string
  player: string
  victim: string
  timestamp: number
  weapon: string
}

export class KillFeedSystem {
  private killEntries: KillEntry[] = []
  private maxEntries: number
  private lifetime: number // milliseconds

  constructor(maxEntries: number = 8, lifetime: number = 5000) {
    this.maxEntries = maxEntries
    this.lifetime = lifetime
  }

  addKill(killer: string, victim: string, weapon: string = "Unknown") {
    const newEntry: KillEntry = {
      id: Math.random().toString(36).substring(2, 15),
      player: killer,
      victim,
      timestamp: Date.now(),
      weapon,
    }

    this.killEntries.push(newEntry)

    // Keep only the max number of entries
    if (this.killEntries.length > this.maxEntries) {
      this.killEntries.shift()
    }
  }

  update() {
    const now = Date.now()
    this.killEntries = this.killEntries.filter(entry => now - entry.timestamp < this.lifetime)
  }

  getKillEntries(): KillEntry[] {
    return this.killEntries
  }

  clear() {
    this.killEntries = []
  }

  setLifetime(lifetime: number) {
    this.lifetime = lifetime
  }

  setMaxEntries(max: number) {
    this.maxEntries = max
    if (this.killEntries.length > max) {
      this.killEntries = this.killEntries.slice(-max)
    }
  }
}
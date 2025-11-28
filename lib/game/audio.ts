export type SoundType =
  | "shoot"
  | "reload"
  | "pistolShoot"
  | "rifleShoot"
  | "shotgunShoot"
  | "knifeAttack"
  | "switchWeapons"
  | "zombieHit"
  | "zombieDeath"
  | "zombieAttack1"
  | "zombieAttack2"
  | "zombieAttack3"
  | "playerHit"
  | "purchase"
  | "perk"
  | "powerUp"
  | "mysteryBox"
  | "mysteryBox1"
  | "mysteryBox2"
  | "mysteryBox3"
  | "roundEnd"
  | "wonRound1"
  | "wonRound2"
  | "wonRound3"
  | "wonRound4"
  | "wonRound5"
  | "wonRound6"
  | "wonRound7"
  | "wonRound8"
  | "wonRound9"
  | "wonRound10"
  | "wonRound11"
  | "wonRound12"
  | "wonRound13"
  | "wonRound14"
  | "wonRound15"
  | "doorOpen"
  | "doorSound"
  | "vendingMachine"
  | "vending1"
  | "vending2"
  | "mysteryBoxRotate1"
  | "mysteryBoxRotate2"
  | "wallBuy1"
  | "wallBuy2"
  | "wallBuySwitch1"
  | "wallBuySwitch2"
  | "gameOver1"
  | "gameOver2"
  | "fragExplosion"
  | "stunExplosion"
  | "molotovExplosion"
  | "discoExplosion"
  | "nukeExplosion"
  | "kaboom"
  | "doublePoints"
  | "instaKill"
  | "maxAmmo"
  | "throwGrenade"
  | "pause1"
  | "pause2"
  | "start1"
  | "start2"
  | "start3"
  | "doorLocked"
  | "cantBuy"
  | "characterSelection"
  | "magicianSelection"
  | "menuButton1"
  | "menuButton2"
  | "menuButton3"
  | "startButton1"
  | "startButton2"
  | "startButton3"
  | "turnPage1"
  | "turnPage2"
  | "levelSelection"
  | "levelComplex"
  | "levelCompound"
  | "levelFortress"

type AudioType = "sound" | "music";

export class AudioManager {
  private audioContext: AudioContext | null = null
  private initialized = false
  private soundVolume = 0.3
  private musicVolume = 0.5
  private soundEnabled = true
  private musicEnabled = true
  private activeMusic: HTMLAudioElement | null = null
  private activeTrailer: HTMLAudioElement | null = null
  private soundCache: Map<string, HTMLAudioElement> = new Map()

  private initialize() {
    if (this.initialized) return
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.initialized = true
    } catch (e) {
      console.warn("Web Audio API not supported")
    }
  }

  private createAudioElement(src: string): HTMLAudioElement {
    const audio = new Audio(src);
    return audio;
  }

  private loadSound(soundType: SoundType): HTMLAudioElement | null {
    if (!this.soundEnabled) return null;

    const soundMap: Record<SoundType, string> = {
      shoot: "/audio/sounds/shoot.mp3",
      reload: "/audio/sounds/reload.mp3",
      pistolShoot: "/audio/sounds/generic-pistol.mp3",
      rifleShoot: "/audio/sounds/generic-rifle.mp3",
      shotgunShoot: "/audio/sounds/generic-shotgun.mp3",
      knifeAttack: "/audio/sounds/generic-knife.mp3",
      switchWeapons: "/audio/sounds/switch-weapons.mp3",
      zombieHit: "/audio/sounds/zombie-hit.mp3",
      zombieDeath: "/audio/sounds/zombie-death.mp3",
      playerHit: "/audio/sounds/player-hit.mp3",
      zombieAttack1: "/audio/sounds/zombie-attacking-1.mp3",
      zombieAttack2: "/audio/sounds/zombie-attacking-2.mp3",
      zombieAttack3: "/audio/sounds/zombie-attacking-3.mp3",
      purchase: "/audio/sounds/purchase.mp3",
      perk: "/audio/sounds/perk.mp3",
      powerUp: "/audio/sounds/powerup-spoken.mp3",
      mysteryBox: "/audio/sounds/mystery-box-open.mp3",
      mysteryBox1: "/audio/sounds/mystery-1.mp3",
      mysteryBox2: "/audio/sounds/mystery-2.mp3",
      mysteryBox3: "/audio/sounds/rtfm-1.mp3",
      roundEnd: "/audio/sounds/round-end.mp3",
      wonRound1: "/audio/sounds/won-round-1.mp3",
      wonRound2: "/audio/sounds/won-round-2.mp3",
      wonRound3: "/audio/sounds/won-round-3.mp3",
      wonRound4: "/audio/sounds/won-round-4.mp3",
      wonRound5: "/audio/sounds/won-round-5.mp3",
      wonRound6: "/audio/sounds/won-round-6.mp3",
      wonRound7: "/audio/sounds/won-round-7.mp3",
      wonRound8: "/audio/sounds/won-round-8.mp3",
      wonRound9: "/audio/sounds/won-round-9.mp3",
      wonRound10: "/audio/sounds/won-round-10.mp3",
      wonRound11: "/audio/sounds/won-round-11.mp3",
      wonRound12: "/audio/sounds/won-round-12.mp3",
      wonRound13: "/audio/sounds/won-round-13.mp3",
      wonRound14: "/audio/sounds/won-round-14.mp3",
      wonRound15: "/audio/sounds/won-round-15.mp3",
      doorOpen: "/audio/sounds/door-open.mp3",
      doorSound: "/audio/sounds/door.mp3",
      vendingMachine: "/audio/sounds/vending-machine.mp3",
      vending1: "/audio/sounds/vending-1.mp3",
      vending2: "/audio/sounds/vending-2.mp3",
      mysteryBoxRotate1: "/audio/sounds/mystery-box-rotate1.mp3",
      mysteryBoxRotate2: "/audio/sounds/mystery-box-rotate2.mp3",
      wallBuy1: "/audio/sounds/wall-buy-1.mp3",
      wallBuy2: "/audio/sounds/wall-buy-2.mp3",
      wallBuySwitch1: "/audio/sounds/wall-buy-1.mp3",
      wallBuySwitch2: "/audio/sounds/wall-buy-2.mp3",
      gameOver1: "/audio/sounds/game-over-1.mp3",
      gameOver2: "/audio/sounds/game-over-2.mp3",
      fragExplosion: "/audio/sounds/generic-gernade-explode.mp3",
      stunExplosion: "/audio/sounds/generic-stun-explode.mp3",
      molotovExplosion: "/audio/sounds/molotov-explode.mp3",
      discoExplosion: "/audio/sounds/disco-1.mp3",
      nukeExplosion: "/audio/sounds/kaboom.mp3",
      kaboom: "/audio/sounds/kaboom.mp3",
      doublePoints: "/audio/sounds/double-points.mp3",
      instaKill: "/audio/sounds/insta-kill.mp3",
      maxAmmo: "/audio/sounds/max-ammo.mp3",
      throwGrenade: "/audio/sounds/throw.mp3",
      pause1: "/audio/sounds/pause-1.mp3",
      pause2: "/audio/sounds/pause-2.mp3",
      start1: "/audio/sounds/start-1.mp3",
      start2: "/audio/sounds/start-2.mp3",
      start3: "/audio/sounds/start-3.mp3",
      doorLocked: "/audio/sounds/door-locked.mp3",
      cantBuy: "/audio/sounds/cant-buy.mp3",
      characterSelection: "/audio/sounds/character-selection.mp3",
      magicianSelection: "/audio/sounds/magician-selection.mp3",
      menuButton1: "/audio/sounds/menu-button-1.mp3",
      menuButton2: "/audio/sounds/menu-button-2.mp3",
      menuButton3: "/audio/sounds/menu-button-3.mp3",
      startButton1: "/audio/sounds/start-button-1.mp3",
      startButton2: "/audio/sounds/start-button-2.mp3",
      startButton3: "/audio/sounds/start-button-3.mp3",
      turnPage1: "/audio/sounds/turn-page-1.mp3",
      turnPage2: "/audio/sounds/turn-page-2.mp3",
      levelSelection: "/audio/sounds/level-complex.mp3",
      levelComplex: "/audio/sounds/level-complex.mp3",
      levelCompound: "/audio/sounds/level-compound.mp3",
      levelFortress: "/audio/sounds/level-fortress.mp3",
    };

    const src = soundMap[soundType];

    // Check if we've already created and cached this audio element
    if (this.soundCache.has(src)) {
      const cachedAudio = this.soundCache.get(src)!.cloneNode() as HTMLAudioElement;
      cachedAudio.volume = this.soundVolume;
      return cachedAudio;
    }

    // If audio file doesn't exist, fall back to procedural sound
    if (!this.audioFileExists(src)) {
      return null;
    }

    const audio = this.createAudioElement(src);
    audio.volume = this.soundVolume;

    // Cache the original audio element for cloning
    this.soundCache.set(src, audio.cloneNode() as HTMLAudioElement);

    return audio;
  }

  private audioFileExists(src: string): boolean {
    // This is a simple check - in a real implementation you might want to verify if the file exists
    // For now, we'll assume it exists and handle errors when playback fails
    return true;
  }

  private loadMusic(src: string): HTMLAudioElement | null {
    if (!this.musicEnabled) return null;

    const audio = new Audio(src);
    audio.volume = this.musicVolume;
    audio.loop = true;

    return audio;
  }

  async playMusic(src: string): Promise<void> {
    // Stop any currently playing music
    if (this.activeMusic) {
      this.activeMusic.pause();
      this.activeMusic = null;
    }

    // If trailer is playing, fade it out before playing new music
    if (this.activeTrailer) {
      this.activeTrailer.pause();
      this.activeTrailer = null;
    }

    if (!this.musicEnabled) return;

    const music = this.loadMusic(src);
    if (music) {
      try {
        await music.play();
        this.activeMusic = music;
        // Set volume to the target level immediately for new music
        if (this.activeMusic) {
          this.activeMusic.volume = this.musicVolume;
        }
      } catch (e) {
        console.warn("Could not play music:", e);
      }
    }
  }

  async playMusicWithFade(src: string): Promise<void> {
    // Stop any currently playing music
    if (this.activeMusic) {
      this.activeMusic.pause();
      this.activeMusic = null;
    }

    // If trailer is playing, fade it out before playing new music
    if (this.activeTrailer) {
      this.activeTrailer.pause();
      this.activeTrailer = null;
    }

    if (!this.musicEnabled) return;

    const music = this.loadMusic(src);
    if (music) {
      try {
        // Start at 0 volume
        music.volume = 0;
        await music.play();
        this.activeMusic = music;

        // Fade in the new music
        await this.fadeInMusic(1000);
      } catch (e) {
        console.warn("Could not play music:", e);
      }
    }
  }

  stopMusic(): void {
    if (this.activeMusic) {
      this.activeMusic.pause();
      this.activeMusic.currentTime = 0;
      this.activeMusic = null;
    }
  }

  async playTrailer(): Promise<void> {
    // Stop any currently playing trailer
    if (this.activeTrailer) {
      this.activeTrailer.pause();
      this.activeTrailer = null;
    }

    if (!this.musicEnabled) return;

    // Fade out current music over 1 second
    if (this.activeMusic) {
      await this.fadeOutMusic(1000);
    }

    // Load and play trailer
    const trailer = new Audio("/audio/background-tracks/trailer.mp3");
    trailer.volume = this.musicVolume;
    trailer.loop = false; // Trailer shouldn't loop

    // Handle trailer finish
    trailer.onended = () => {
      // When trailer ends, fade back in the music
      this.fadeInMusic(1000);
    };

    this.activeTrailer = trailer;

    try {
      await trailer.play();
    } catch (e) {
      console.warn("Could not play trailer:", e);
    }
  }

  async stopTrailer(): Promise<void> {
    if (!this.activeTrailer) return;

    // Stop the trailer immediately
    this.activeTrailer.pause();
    this.activeTrailer = null;

    // Fade in the background music over 1 second
    await this.fadeInMusic(1000);
  }

  private async fadeOutMusic(duration: number): Promise<void> {
    if (!this.activeMusic) return;

    const startVolume = this.activeMusic.volume;
    const fadeInterval = 50; // update every 50ms
    const steps = duration / fadeInterval;
    const decrement = startVolume / steps;

    return new Promise((resolve) => {
      const fade = () => {
        if (this.activeMusic && this.activeMusic.volume > decrement) {
          this.activeMusic.volume -= decrement;
          setTimeout(fade, fadeInterval);
        } else {
          if (this.activeMusic) {
            this.activeMusic.volume = 0;
          }
          resolve();
        }
      };
      fade();
    });
  }

  private async fadeInMusic(duration: number): Promise<void> {
    if (!this.activeMusic) return;

    // Start from 0 volume
    this.activeMusic.volume = 0;
    const targetVolume = this.musicVolume;
    const fadeInterval = 50; // update every 50ms
    const steps = duration / fadeInterval;
    const increment = targetVolume / steps;

    return new Promise((resolve) => {
      const fade = () => {
        if (this.activeMusic && this.activeMusic.volume < targetVolume - increment) {
          this.activeMusic.volume += increment;
          setTimeout(fade, fadeInterval);
        } else {
          if (this.activeMusic) {
            this.activeMusic.volume = targetVolume;
          }
          resolve();
        }
      };
      fade();
    });
  }

  play(sound: SoundType) {
    this.initialize();

    if (!this.soundEnabled) return;

    // Try to play the actual audio file first
    const audio = this.loadSound(sound);
    if (audio) {
      audio.play().catch(e => console.warn("Could not play sound:", e));
    } else {
      // Fallback to procedural sound
      this.playProceduralSound(sound);
    }
  }

  updateVolumes(soundVolume: number, musicVolume: number): void {
    this.soundVolume = soundVolume;
    this.musicVolume = musicVolume;

    // Update the volume of any currently playing music
    if (this.activeMusic) {
      this.activeMusic.volume = musicVolume;
    }
  }

  toggleMusic(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled && this.activeMusic) {
      this.activeMusic.pause();
      this.activeMusic = null;
    }
  }

  toggleSound(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  private playProceduralSound(sound: SoundType) {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (sound) {
      case "shoot":
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        break;

      case "zombieHit":
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        break;

      case "zombieDeath":
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case "playerHit":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(100, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        break;

      case "purchase":
      case "perk":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.setValueAtTime(600, now + 0.1);
        oscillator.frequency.setValueAtTime(800, now + 0.2);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;

      case "powerUp":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(1200, now + 0.5);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;

      case "mysteryBox":
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.setValueAtTime(400, now + 0.1);
        oscillator.frequency.setValueAtTime(600, now + 0.2);
        oscillator.frequency.setValueAtTime(800, now + 0.3);
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        oscillator.start(now);
        oscillator.stop(now + 0.4);
        break;

      case "roundEnd":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(600, now);
        oscillator.frequency.setValueAtTime(800, now + 0.15);
        oscillator.frequency.setValueAtTime(1000, now + 0.3);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        oscillator.start(now);
        oscillator.stop(now + 0.5);
        break;
    }
  }
}

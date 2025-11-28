"use client"

import { useState, useEffect } from "react";
import { Skull, Play, BookOpen, Settings, Sparkles, Sword } from "lucide-react"
import { GuideGallery } from "./guide-gallery";
import { SettingsModal } from "./settings-modal";
import { CharacterSelector } from "./character-selector";

interface StartScreenProps {
  onStart: (settings: {
    masterVolume: number;
    musicVolume: number;
    soundVolume: number;
    screenShakeEnabled: boolean;
    fpsOverlayEnabled: boolean;
  }, characterType?: "default" | "magician") => void
  onPlayTrailer?: () => void
}

export function StartScreen({ onStart, onPlayTrailer }: StartScreenProps) {
  const [skullClicks, setSkullClicks] = useState<number[]>([]);
  const [trailerPlaying, setTrailerPlaying] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCharacterSelector, setShowCharacterSelector] = useState(false);

  // Initialize settings with default values
  const [settings, setSettings] = useState({
    masterVolume: 0.7,
    musicVolume: 0.5,
    soundVolume: 0.7,
    screenShakeEnabled: true,
    fpsOverlayEnabled: false,
  });

  // Reset clicks after a delay
  useEffect(() => {
    if (skullClicks.length > 0) {
      const timer = setTimeout(() => {
        setSkullClicks([]);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [skullClicks]);

  const handleSkullClick = (skullIndex: number) => {
    // Add the clicked skull index to the sequence
    const newSequence = [...skullClicks, skullIndex];
    setSkullClicks(newSequence);

    // Check if the sequence matches right(2), middle(1), left(0) - from right to left
    if (newSequence.length >= 3) {
      const recentClicks = newSequence.slice(-3);
      if (recentClicks[0] === 2 && recentClicks[1] === 1 && recentClicks[2] === 0) { // Right to left order
        // Trigger trailer only if not already playing
        if (onPlayTrailer && !trailerPlaying) {
          onPlayTrailer();
          setTrailerPlaying(true);
        }
        setSkullClicks([]); // Reset sequence after successful trigger
      }
    }
  };

  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
      {/* Background effects */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ff0000' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Skull
            className="w-16 h-16 text-red-600 animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleSkullClick(0)} // Left skull = index 0
          />
          <Skull
            className="w-24 h-24 text-red-500 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleSkullClick(1)} // Middle skull = index 1
          />
          <Skull
            className="w-16 h-16 text-red-600 animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleSkullClick(2)} // Right skull = index 2
          />
        </div>

        <h1 className="text-6xl md:text-8xl font-black text-red-600 tracking-tighter mb-2">UNDEAD</h1>
        <h2 className="text-3xl md:text-5xl font-bold text-red-500 tracking-wider mb-8">SURVIVAL</h2>

        <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
          Survive endless waves of the undead. Buy weapons, collect power-ups, and fight for your life.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={() => setShowGuide(true)}
            className="group relative bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xl px-6 py-4 rounded-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6" />
              <span>HOW TO PLAY</span>
            </div>
            <div className="absolute inset-0 bg-zinc-600 rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="group relative bg-zinc-800 hover:bg-zinc-700 text-white font-black text-xl px-6 py-4 rounded-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <span>SETTINGS</span>
            </div>
            <div className="absolute inset-0 bg-zinc-600 rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
          </button>

          <button
            onClick={() => {
              // Show character selector instead of starting the game directly
              setShowCharacterSelector(true);
            }}
            className="group relative bg-red-600 hover:bg-red-500 text-white font-black text-xl px-6 py-4 rounded-lg transition-all transform hover:scale-105 active:scale-95"
          >
            <div className="flex items-center gap-3">
              <Play className="w-6 h-6" />
              <span>START GAME</span>
            </div>
            <div className="absolute inset-0 bg-red-400 rounded-lg blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
          </button>
        </div>

        <div className="mt-12 text-zinc-600 text-sm">
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto text-left">
            <div>
              <span className="text-zinc-400">WASD</span> - Move
            </div>
            <div>
              <span className="text-zinc-400">Mouse</span> - Aim
            </div>
            <div>
              <span className="text-zinc-400">Click</span> - Shoot
            </div>
            <div>
              <span className="text-zinc-400">R</span> - Reload
            </div>
            <div>
              <span className="text-zinc-400">1-3</span> - Switch Weapons
            </div>
            <div>
              <span className="text-zinc-400">E</span> - Interact
            </div>
          </div>
        </div>
      </div>
      <GuideGallery isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={setSettings}
      />
      {showCharacterSelector && (
        <CharacterSelector
          onSelect={(characterType) => {
            // Stop trailer if playing before starting game
            if (trailerPlaying && onPlayTrailer) {
              onPlayTrailer(); // This will handle stopping the trailer
            }
            // Reset trailer playing state
            setTrailerPlaying(false);
            setSkullClicks([]); // Also reset clicks
            // Pass current settings and selected character to the game
            onStart(settings, characterType);
            setShowCharacterSelector(false);
          }}
          onCancel={() => setShowCharacterSelector(false)}
        />
      )}
    </div>
  )
}

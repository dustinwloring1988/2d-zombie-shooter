import { useState, useEffect } from "react";
import { X, Volume2, VolumeX } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    masterVolume: number;
    musicVolume: number;
    soundVolume: number;
    screenShakeEnabled: boolean;
    fpsOverlayEnabled: boolean;
  };
  onSave: (settings: {
    masterVolume: number;
    musicVolume: number;
    soundVolume: number;
    screenShakeEnabled: boolean;
    fpsOverlayEnabled: boolean;
  }) => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSave 
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6 relative shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-500">Settings</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Close settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Master Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Master Volume
              </label>
              <span className="text-zinc-400">{Math.round(localSettings.masterVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localSettings.masterVolume}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                masterVolume: parseFloat(e.target.value)
              }))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Music Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Background Volume
              </label>
              <span className="text-zinc-400">{Math.round(localSettings.musicVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localSettings.musicVolume}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                musicVolume: parseFloat(e.target.value)
              }))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Sound Volume */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-zinc-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                Sound Volume
              </label>
              <span className="text-zinc-400">{Math.round(localSettings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localSettings.soundVolume}
              onChange={(e) => setLocalSettings(prev => ({
                ...prev,
                soundVolume: parseFloat(e.target.value)
              }))}
              className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
          </div>

          {/* Screen Shake Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-zinc-300">Screen Shake</label>
            <button
              onClick={() => setLocalSettings(prev => ({
                ...prev,
                screenShakeEnabled: !prev.screenShakeEnabled
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.screenShakeEnabled ? "bg-red-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.screenShakeEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* FPS Overlay Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-zinc-300">FPS Overlay</label>
            <button
              onClick={() => setLocalSettings(prev => ({
                ...prev,
                fpsOverlayEnabled: !prev.fpsOverlayEnabled
              }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.fpsOverlayEnabled ? "bg-red-500" : "bg-zinc-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.fpsOverlayEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleCancel}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
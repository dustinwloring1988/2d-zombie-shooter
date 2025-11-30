import { useState, useEffect } from "react";
import { MapPin, Zap, Shield, Skull } from "lucide-react";

interface MapSelectorProps {
  onSelectMap: (mapId: "level1" | "level2", characterType?: "default" | "magician") => void;
  characterType?: "default" | "magician";
}

export function MapSelector({ onSelectMap, characterType = "default" }: MapSelectorProps) {
  const [selectedMap, setSelectedMap] = useState<"level1" | "level2" | null>(null);

  const maps = [
    {
      id: "level1",
      name: "Compound",
      description: "A fortified compound with multiple wings and secret rooms",
      icon: <Shield className="w-8 h-8" />,
      color: "from-red-700 to-red-900"
    },
    {
      id: "level2",
      name: "Lockdown: Night Shift",
      description: "A compound outside town overrun with zombies. Retrieve security logs, weapons, neutralize biohazards and reach the control room to trigger lockdown.",
      icon: <Zap className="w-8 h-8" />,
      color: "from-blue-700 to-blue-900"
    }
  ];

  const handleSelect = (mapId: "level1" | "level2") => {
    setSelectedMap(mapId);
  };

  const handleConfirm = () => {
    if (selectedMap) {
      onSelectMap(selectedMap, characterType);
    }
  };

  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-50">
      {/* Background effects */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ff0000' fillOpacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-8">
          <MapPin className="w-12 h-12 text-red-500" />
          <h1 className="text-5xl font-black text-red-500 tracking-tighter">SELECT MAP</h1>
          <MapPin className="w-12 h-12 text-red-500" />
        </div>

        <p className="text-zinc-400 text-lg mb-10 max-w-md mx-auto">
          Choose your battlefield. Each map offers unique challenges and strategies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto px-4">
          {maps.map((map) => (
            <div
              key={map.id}
              onClick={() => handleSelect(map.id as "level1" | "level2")}
              className={`p-6 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                selectedMap === map.id
                  ? `bg-gradient-to-br ${map.color} border-2 border-red-500 shadow-lg shadow-red-500/20`
                  : "bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`${selectedMap === map.id ? "text-white" : "text-red-500"}`}>
                  {map.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">{map.name}</h3>
              </div>

              <p className="text-zinc-300 mb-4">{map.description}</p>

              <div className="flex items-center justify-center gap-2">
                {map.id === "level1" ? (
                  <div className="flex gap-1">
                    <Skull className="w-4 h-4 text-red-500" />
                    <Skull className="w-4 h-4 text-zinc-700" />
                    <Skull className="w-4 h-4 text-zinc-700" />
                    <Skull className="w-4 h-4 text-zinc-700" />
                    <Skull className="w-4 h-4 text-zinc-700" />
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Skull className="w-4 h-4 text-red-500" />
                    <Skull className="w-4 h-4 text-red-500" />
                    <Skull className="w-4 h-4 text-red-500" />
                    <Skull className="w-4 h-4 text-red-500" />
                    <Skull className="w-4 h-4 text-zinc-700" />
                  </div>
                )}
                <span className="text-zinc-400 text-sm">
                  {map.id === "level1" ? "Easy" : "Medium"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <button
            onClick={handleConfirm}
            disabled={!selectedMap}
            className={`${
              selectedMap
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
            } font-black text-xl px-12 py-4 rounded-lg transition-all transform hover:scale-105 active:scale-95`}
          >
            CONFIRM SELECTED MAP
          </button>
        </div>
      </div>
    </div>
  );
}
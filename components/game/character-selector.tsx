"use client";

import { useState, useEffect } from "react";
import { User, Sparkles, Sword, Flame } from "lucide-react";

interface CharacterSelectorProps {
  onSelect: (characterType: "default" | "magician") => void;
  onCancel?: () => void;
}

interface Character {
  id: "default" | "magician";
  name: string;
  description: string;
  weapons: string[];
  grenades: string[];
  icon: JSX.Element;
  color: string;
}

const characters: Character[] = [
  {
    id: "default",
    name: "Soldier",
    description: "Classic combat specialist with standard equipment",
    weapons: ["Pistol", "Knife"],
    grenades: ["Frag Grenade", "Stun Grenade"],
    icon: <Sword className="w-12 h-12" />,
    color: "from-blue-600 to-blue-800"
  },
  {
    id: "magician",
    name: "Magician",
    description: "Mystical warrior with powerful magical items",
    weapons: ["Pistol", "Knife"],
    grenades: ["Molotov Cocktail", "Disco Ball"],
    icon: <Sparkles className="w-12 h-12" />,
    color: "from-purple-600 to-purple-800"
  }
];

export function CharacterSelector({ onSelect, onCancel }: CharacterSelectorProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<"default" | "magician">("default");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (characterId: "default" | "magician") => {
    setIsAnimating(true);
    setSelectedCharacter(characterId);
    
    // Delay the selection to allow for animation
    setTimeout(() => {
      onSelect(characterId);
    }, 300);
  };

  const selectedChar = characters.find(c => c.id === selectedCharacter);

  return (
    <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-red-900/50 rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-8">CHOOSE YOUR CHARACTER</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {characters.map((character) => (
            <div
              key={character.id}
              className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 transform ${
                selectedCharacter === character.id
                  ? "border-red-500 scale-105 shadow-lg shadow-red-500/20"
                  : "border-zinc-700 hover:border-zinc-500"
              } bg-gradient-to-br ${character.color} ${
                isAnimating && selectedCharacter === character.id ? "animate-pulse" : ""
              }`}
              onClick={() => handleSelect(character.id)}
            >
              {selectedCharacter === character.id && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              )}
              
              <div className="flex items-center gap-4 mb-4">
                <div className="text-red-400">
                  {character.icon}
                </div>
                <h3 className="text-2xl font-bold text-white">{character.name}</h3>
              </div>
              
              <p className="text-zinc-300 mb-4">{character.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-white font-semibold">Starting Weapons:</h4>
                <div className="flex flex-wrap gap-2">
                  {character.weapons.map((weapon, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-black/30 text-zinc-300 rounded-full text-sm"
                    >
                      {weapon}
                    </span>
                  ))}
                </div>
                
                <h4 className="text-white font-semibold mt-3">Grenades:</h4>
                <div className="flex flex-wrap gap-2">
                  {character.grenades.map((grenade, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-black/30 text-zinc-300 rounded-full text-sm"
                    >
                      {grenade}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center gap-4">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-colors"
            >
              Back
            </button>
          )}
          <button
            onClick={() => handleSelect(selectedCharacter)}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold rounded-lg transition-all transform hover:scale-105"
          >
            SELECT {selectedChar?.name.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
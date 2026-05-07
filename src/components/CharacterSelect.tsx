"use client";

interface Props {
  characters: { id: string; name: string }[];
  activeCharacterId: string | null;
  onSelect: (id: string | null) => void;
  trustLevels?: Record<string, number>;
}

export default function CharacterSelect({ characters, activeCharacterId, onSelect, trustLevels }: Props) {
  const renderTrustBar = (level: number = 0) => {
    const max = 3;
    return (
      <span className="inline-flex gap-0.5 mt-1">
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              i < level ? "bg-yellow-400" : "bg-gray-600"
            }`}
          />
        ))}
      </span>
    );
  };

  return (
    <div className="flex gap-2 p-4 border-t border-gray-800">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded text-sm transition-colors ${
          activeCharacterId === null
            ? "bg-emerald-600 text-white"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        }`}
      >
        GM
      </button>
      {characters.map((char) => (
        <button
          key={char.id}
          onClick={() => onSelect(char.id)}
          className={`flex flex-col items-center px-3 py-1.5 rounded text-sm transition-colors ${
            activeCharacterId === char.id
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {char.name}
          {trustLevels && renderTrustBar(trustLevels[char.id])}
        </button>
      ))}
    </div>
  );
}

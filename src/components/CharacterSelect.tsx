"use client";

interface Props {
  characters: { id: string; name: string }[];
  activeCharacterId: string | null;
  onSelect: (id: string | null) => void;
}

export default function CharacterSelect({ characters, activeCharacterId, onSelect }: Props) {
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
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            activeCharacterId === char.id
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {char.name}
        </button>
      ))}
    </div>
  );
}

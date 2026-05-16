"use client";

import { useState } from "react";
import { Character } from "@/game/types";

interface Props {
  onAccuse: (statement: string) => void;
  loading: boolean;
  characters: Character[];
}

export default function AccusationPanel({ onAccuse, loading, characters }: Props) {
  const [culprit, setCulprit] = useState("");
  const [weapon, setWeapon] = useState("");
  const [motive, setMotive] = useState("");

  const canSubmit = culprit.trim() && weapon.trim() && motive.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAccuse(`犯人は${culprit}、凶器は${weapon}、動機は${motive}`);
  };

  return (
    <div className="border-t-2 border-red-800 bg-red-950/20 p-4">
      <div className="text-center mb-3">
        <span className="text-sm font-bold text-red-400 tracking-widest">
           ⚖ 摘発フェーズ ⚖
        </span>
        <p className="text-xs text-gray-400 mt-1">
          以下の3点を埋めて告発してください
        </p>
      </div>
      <div className="space-y-2 max-w-md mx-auto">
        <label className="block">
          <span className="text-xs text-red-300 mb-1 block">犯人</span>
          <select
            value={culprit}
            onChange={(e) => setCulprit(e.target.value)}
            className="w-full bg-gray-900 border border-red-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
          >
            <option value="">— 選択 —</option>
            {characters.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-red-300 mb-1 block">凶器</span>
          <input
            type="text"
            value={weapon}
            onChange={(e) => setWeapon(e.target.value)}
            placeholder="例：毒の矢"
            className="w-full bg-gray-900 border border-red-800 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
          />
        </label>
        <label className="block">
          <span className="text-xs text-red-300 mb-1 block">動機</span>
          <input
            type="text"
            value={motive}
            onChange={(e) => setMotive(e.target.value)}
            placeholder="例：誰かを守るため"
            className="w-full bg-gray-900 border border-red-800 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
          />
        </label>
      </div>
      <div className="flex justify-center mt-4">
        <button
          onClick={handleSubmit}
          disabled={loading || !canSubmit}
          className="px-8 py-2 bg-red-700 hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded text-sm font-bold tracking-wider transition-colors"
        >
          {loading ? "判定中..." : "真相を告発する"}
        </button>
      </div>
    </div>
  );
}

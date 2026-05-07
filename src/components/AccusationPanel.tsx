"use client";

import { useState } from "react";

interface Props {
  onAccuse: (statement: string) => void;
  loading: boolean;
}

export default function AccusationPanel({ onAccuse, loading }: Props) {
  const [statement, setStatement] = useState("");

  return (
    <div className="border-t-2 border-red-800 bg-red-950/20 p-4">
      <div className="text-center mb-3">
        <span className="text-sm font-bold text-red-400 tracking-widest">
           ⚖ 摘発フェーズ ⚖
        </span>
        <p className="text-xs text-gray-400 mt-1">
          犯人・凶器・動機を宣言してください
        </p>
      </div>
      <textarea
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        placeholder="例：「犯人はエレナ、凶器は毒の矢、動機は妹を守るため…！」"
        rows={3}
        className="w-full bg-gray-900 border border-red-800 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 resize-none"
      />
      <div className="flex justify-center mt-3">
        <button
          onClick={() => onAccuse(statement)}
          disabled={loading || !statement.trim()}
          className="px-8 py-2 bg-red-700 hover:bg-red-600 disabled:bg-gray-700 rounded text-sm font-bold tracking-wider transition-colors"
        >
          {loading ? "判定中..." : "真相を告発する"}
        </button>
      </div>
    </div>
  );
}

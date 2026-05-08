"use client";

import { ScenarioEnding } from "@/game/types";

interface Props {
  correct: boolean;
  feedback: string;
  ending: ScenarioEnding | null;
  onRestart: () => void;
}

export default function ResolutionScreen({ correct, feedback, ending, onRestart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center overflow-y-auto">
      {correct ? (
        <>
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">真相解明</h2>
        </>
      ) : (
        <>
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">真実は闇の中</h2>
        </>
      )}
      <p className="text-sm text-gray-300 whitespace-pre-wrap max-w-md mb-6">{feedback}</p>

      {ending && (
        <div className="border-t border-gray-700 pt-6 mt-2 max-w-md w-full">
          <div className="text-xs text-amber-400 tracking-widest mb-1">— {ending.id} —</div>
          <h3 className="text-lg font-bold text-white mb-3">{ending.title}</h3>
          <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
            {ending.description}
          </p>
        </div>
      )}

      <button
        onClick={onRestart}
        className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
      >
        最初からやり直す
      </button>
    </div>
  );
}

"use client";

interface Props {
  correct: boolean;
  feedback: string;
  onRestart: () => void;
}

export default function ResolutionScreen({ correct, feedback, onRestart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
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
      <p className="text-sm text-gray-300 whitespace-pre-wrap max-w-md">{feedback}</p>
      <button
        onClick={onRestart}
        className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
      >
        最初からやり直す
      </button>
    </div>
  );
}

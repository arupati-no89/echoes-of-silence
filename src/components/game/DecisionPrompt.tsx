"use client";

import { PlayerChoices } from "@/game/types";

interface Decision {
  key: keyof PlayerChoices;
  label: string;
  description: string;
  choices: { value: string; label: string; hint?: string }[];
}

const DECISIONS: Decision[] = [
  {
    key: "oxygenFixed",
    label: "酸素濃度管理システム",
    description: "調査の結果、酸素濃度管理システムが異常に設定されていることが判明した。どうする？",
    choices: [
      { value: "true", label: "修正する", hint: "酸素濃度を正常に戻させる" },
      { value: "false", label: "そのままにする", hint: "証拠として残しておく" },
    ],
  },
  {
    key: "boxDecision",
    label: "箱の取り扱い",
    description: "運ばれてきた箱にはAサルコが潜んでいる可能性がある。どうする？",
    choices: [
      { value: "knowingly_open", label: "警戒して開ける", hint: "Aサルコの存在を認識した上で開封" },
      { value: "unknowingly_open", label: "何も知らずに開ける", hint: "Aサルコに気づかず、無警戒で開ける" },
      { value: "not_open", label: "開けない", hint: "箱に触れず、開封を拒否する" },
      { value: "sacrifice", label: "副船長に託す", hint: "副船長（Aサルコ）が自ら犠牲になることを許す" },
    ],
  },
];

interface Props {
  decisionKey: keyof PlayerChoices;
  onDecision: (key: keyof PlayerChoices, value: string) => void;
}

export default function DecisionPrompt({ decisionKey, onDecision }: Props) {
  const def = DECISIONS.find((d) => d.key === decisionKey);
  if (!def) return null;

  return (
    <div className="border-t-2 border-amber-700 bg-amber-950/20 p-4">
      <div className="text-center mb-3">
        <span className="text-sm font-bold text-amber-400 tracking-widest">
          ⚡ 決断ポイント ⚡
        </span>
        <p className="text-xs text-amber-300/70 mt-1">{def.label}</p>
      </div>
      <p className="text-sm text-gray-200 text-center mb-4">{def.description}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {def.choices.map((c) => (
          <button
            key={c.value}
            onClick={() => onDecision(decisionKey, c.value)}
            className="px-4 py-2 bg-amber-800/50 hover:bg-amber-700/60 border border-amber-700 rounded text-sm text-amber-200 transition-colors"
            title={c.hint}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

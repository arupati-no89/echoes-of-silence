"use client";

import { Scenario } from "@/game/types";

interface Props {
  scenario: Scenario;
  onStart: () => void;
  onBack: () => void;
}

export default function BriefingScreen({ scenario, onStart, onBack }: Props) {
  const { briefing, characters, intro, title } = scenario;

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-white overflow-y-auto">
      <header className="px-4 py-3 border-b border-gray-800 flex items-center justify-between gap-3 shrink-0">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← シナリオ選択へ
        </button>
        <span className="text-xs uppercase tracking-widest text-gray-500">ブリーフィング</span>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 max-w-3xl w-full mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">{title}</h1>

        <section className="my-6 p-5 bg-gray-900/60 border-l-4 border-emerald-700 rounded-r">
          <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{intro}</p>
        </section>

        {briefing && (
          <section className="space-y-4 mb-8">
            <h2 className="text-xs uppercase tracking-widest text-gray-500">事件ブリーフィング</h2>

            <div className="grid sm:grid-cols-2 gap-3">
              <BriefingCard icon="🌍" label="舞台" body={briefing.setting} />
              <BriefingCard icon="🩸" label="被害者" body={briefing.victim} />
              <BriefingCard icon="🔍" label="現場の状況" body={briefing.crimeScene} />
              <BriefingCard icon="⚖" label="あなたの役割" body={briefing.yourRole} />
            </div>

            <div className="bg-amber-950/20 border border-amber-900/50 rounded p-4">
              <h3 className="text-xs uppercase tracking-widest text-amber-400 mb-3">調査の目標</h3>
              <ol className="space-y-2">
                {briefing.objectives.map((obj, i) => (
                  <li key={i} className="flex gap-3 text-sm text-amber-100">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-amber-700 text-white text-xs flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3">登場人物</h2>
          <div className="space-y-3">
            <div className="p-4 bg-gray-900/60 border border-gray-800 rounded">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-emerald-400 font-bold">GM</span>
                <span className="text-xs text-gray-500">ゲームマスター</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                物語を進行し、調査の状況を描写します。誰に何を聞けばいいか迷ったら、GMに直接ヒントを求めてください。
              </p>
            </div>

            {characters.map((c) => (
              <div key={c.id} className="p-4 bg-gray-900/60 border border-gray-800 rounded">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-purple-400 font-bold">{c.name}</span>
                  <span className="text-xs text-gray-500">容疑者・関係者</span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed mb-2">{c.publicProfile}</p>
                {c.relationToVictim && (
                  <p className="text-xs text-gray-400 leading-relaxed">
                    <span className="text-gray-500">関係: </span>
                    {c.relationToVictim}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-center pb-8">
          <button
            onClick={onStart}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-base font-semibold transition-colors shadow-lg shadow-blue-900/40"
          >
            調査を開始する
          </button>
        </div>
      </main>
    </div>
  );
}

function BriefingCard({ icon, label, body }: { icon: string; label: string; body: string }) {
  return (
    <div className="p-3 bg-gray-900/60 border border-gray-800 rounded">
      <div className="flex items-center gap-2 mb-1">
        <span aria-hidden>{icon}</span>
        <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
      </div>
      <p className="text-sm text-gray-200 leading-relaxed">{body}</p>
    </div>
  );
}

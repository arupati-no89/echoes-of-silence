"use client";

import { useState, useCallback } from "react";
import { GameState, PlayerChoices, Scenario } from "@/game/types";
import { scenarios, scenarioList } from "@/game/scenarios";
import { createInitialState } from "@/game/state";
import ConversationLog from "./ConversationLog";
import CharacterSelect from "./CharacterSelect";
import RecordButton from "@/components/voice/RecordButton";
import AccusationPanel from "./AccusationPanel";
import ResolutionScreen from "./ResolutionScreen";
import DecisionPrompt from "./DecisionPrompt";
import BriefingScreen from "./BriefingScreen";

function findEnding(scenario: Scenario, choices: PlayerChoices, correct: boolean) {
  if (!scenario.endings) return null;
  for (const e of scenario.endings) {
    if (e.condition(choices, correct)) return e;
  }
  return scenario.endings[scenario.endings.length - 1] ?? null;
}

export default function GameUI() {
  const [scenarioId, setScenarioId] = useState<string>("vampire");
  const [gameState, setGameState] = useState<GameState>(() => createInitialState("vampire"));
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scenarioSelected, setScenarioSelected] = useState(false);
  const [briefingShown, setBriefingShown] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<keyof PlayerChoices | null>(null);
  const [evidencePanelOpen, setEvidencePanelOpen] = useState(false);

  const scenario = scenarios[scenarioId] || scenarios.vampire;

  const sendMessage = useCallback(async (message: string, mode?: "normal" | "accusation") => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), characterId, gameState, mode, scenarioId }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const err = await res.json();
          detail = typeof err?.error === "string" ? err.error : "";
        } catch {
          // ignore
        }
        throw new Error(detail || `API エラー: ${res.status}`);
      }

      const data = await res.json();
      setGameState(data.gameState);

      if (mode !== "accusation" && characterId) {
        const char = scenario.characters.find((c) => c.id === characterId);
        if (char) {
          const ttsRes = await fetch("/api/speak", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: data.response, voice: char.voiceType }),
          });
          if (ttsRes.ok) {
            const audio = new Audio(URL.createObjectURL(await ttsRes.blob()));
            audio.play();
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }, [characterId, gameState, loading, scenarioId, scenario]);

  const handleTranscribed = useCallback((text: string) => {
    setTextInput(text);
    sendMessage(text);
  }, [sendMessage]);

  const handleAccuse = useCallback((statement: string) => {
    sendMessage(statement, "accusation");
  }, [sendMessage]);

  const handleDecision = useCallback((key: keyof PlayerChoices, value: string) => {
    setGameState((prev) => {
      const parsed = key === "oxygenFixed" ? value === "true" : value;
      const newState = {
        ...prev,
        choices: { ...prev.choices, [key]: parsed },
      };
      const msg =
        key === "oxygenFixed"
          ? parsed ? "酸素濃度管理システムを修正するよう指示した。" : "酸素濃度管理システムはそのままにした。"
          : `箱の取り扱いについて: "${value}"`;
      newState.dialogHistory = [
        ...prev.dialogHistory,
        { role: "gm", speaker: "GM", content: `【決断】${msg}`, timestamp: Date.now() },
      ];
      return newState;
    });
    setPendingDecision(null);
  }, []);

  const handleRestart = useCallback(() => {
    setGameState(createInitialState(scenarioId));
    setCharacterId(null);
    setTextInput("");
    setError("");
    setPendingDecision(null);
    setBriefingShown(false);
  }, [scenarioId]);

  const handleSelectScenario = useCallback((id: string) => {
    setScenarioId(id);
    setGameState(createInitialState(id));
    setCharacterId(null);
    setTextInput("");
    setError("");
    setPendingDecision(null);
    setScenarioSelected(true);
    setBriefingShown(false);
  }, []);

  const handleStartInvestigation = useCallback(() => {
    setBriefingShown(true);
    setGameState((s) => (s.phase === "intro" ? { ...s, phase: "investigation" } : s));
  }, []);

  const handleBackToScenarioSelect = useCallback(() => {
    setScenarioSelected(false);
    setBriefingShown(false);
  }, []);

  const inResolution = gameState.phase === "resolution";

  const renderTrustBar = (level: number) => {
    const max = 3;
    return (
      <span className="inline-flex gap-0.5">
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`inline-block w-2 h-2 rounded-full ${
              i < level ? "bg-yellow-400" : "bg-gray-600"
            }`}
          />
        ))}
      </span>
    );
  };

  if (scenarioSelected && !briefingShown) {
    return (
      <BriefingScreen
        scenario={scenario}
        onStart={handleStartInvestigation}
        onBack={handleBackToScenarioSelect}
      />
    );
  }

  if (!scenarioSelected && gameState.phase === "intro") {
    return (
      <div className="flex flex-col min-h-screen bg-gray-950 text-white items-center justify-center p-6 sm:p-8 overflow-y-auto">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold mb-1 text-center">Echoes of Silence</h1>
          <p className="text-gray-400 text-sm text-center mb-8">
            沈黙の真実 — 音声対話型AIマーダーミステリー
          </p>

          <section className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 mb-6">
            <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3">遊び方</h2>
            <ol className="space-y-2 text-sm text-gray-300">
              <li className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-purple-700 text-white text-xs flex items-center justify-center font-bold">1</span>
                <span><span className="text-purple-300">NPCに質問</span>して証言や反応を集める</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-emerald-700 text-white text-xs flex items-center justify-center font-bold">2</span>
                <span>気になる単語を質問に入れて<span className="text-emerald-300">証拠</span>をアンロック</span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-red-700 text-white text-xs flex items-center justify-center font-bold">3</span>
                <span><span className="text-red-300">犯人・凶器・動機</span>を宣言して告発する</span>
              </li>
            </ol>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-800">
              テキスト入力でも、マイクで話しかけてもOKです。困ったらGMにヒントを聞きましょう。
            </p>
          </section>

          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-3 text-center">シナリオを選ぶ</h2>
          <div className="space-y-3">
            {scenarioList.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectScenario(s.id)}
                className="w-full px-6 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-left transition-colors"
              >
                <span className="text-sm text-gray-300">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <header className="px-4 py-3 border-b border-gray-800 flex items-center justify-between gap-3 shrink-0 flex-wrap">
        <div className="min-w-0">
          <button
            onClick={() => setScenarioSelected(false)}
            className="text-lg font-bold hover:text-gray-300 transition-colors"
            title="シナリオ選択に戻る"
          >
            Echoes of Silence
          </button>
          <p className="text-xs text-gray-500 truncate">{scenario.title}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {gameState.phase === "investigation" && characterId && (
            <span
              className="text-xs text-gray-400 cursor-help"
              title="質問を重ねるほど上がります。信頼度が高いほど深い秘密を話してくれます (最大3)"
            >
              信頼度 {renderTrustBar(gameState.trustLevels[characterId] ?? 0)}
            </span>
          )}
          {gameState.phase === "investigation" && gameState.unlockedEvidence.length > 0 && (
            <button
              onClick={() => setEvidencePanelOpen((v) => !v)}
              className="text-xs text-amber-400 hover:text-amber-300 underline-offset-2 hover:underline"
              title="アンロックした証拠の一覧を表示"
            >
              📁 証拠 {gameState.unlockedEvidence.length}個
            </button>
          )}
          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
            gameState.phase === "intro" ? "bg-blue-900 text-blue-300" :
            gameState.phase === "investigation" ? "bg-green-900 text-green-300" :
            gameState.phase === "accusation" ? "bg-red-900 text-red-300" :
            "bg-purple-900 text-purple-300"
          }`}>
            {gameState.phase === "intro" && "● 導入"}
            {gameState.phase === "investigation" && "● 調査フェーズ"}
            {gameState.phase === "accusation" && "● 摘発フェーズ"}
            {gameState.phase === "resolution" && "● 解決"}
          </span>
        </div>
      </header>

      {evidencePanelOpen && gameState.unlockedEvidence.length > 0 && (
        <div className="border-b border-amber-900/50 bg-amber-950/20 px-4 py-3 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-400 font-semibold tracking-wider">📁 集めた証拠</span>
            <button
              onClick={() => setEvidencePanelOpen(false)}
              className="text-gray-500 hover:text-gray-300 text-base leading-none"
              aria-label="証拠パネルを閉じる"
            >
              ×
            </button>
          </div>
          <ul className="space-y-1.5">
            {gameState.unlockedEvidence.map((kw) => {
              const reactor = scenario.characters.find((c) =>
                c.evidenceResponses.some((e) => e.keyword === kw)
              );
              return (
                <li key={kw} className="flex gap-2 text-gray-300">
                  <span className="text-amber-300 font-mono shrink-0">「{kw}」</span>
                  {reactor && (
                    <span className="text-gray-500">
                      → {reactor.name}が反応した
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {inResolution && gameState.accusationResult ? (
        <ResolutionScreen
          correct={gameState.accusationResult.correct}
          feedback={gameState.accusationResult.feedback}
          ending={findEnding(scenario, gameState.choices, gameState.accusationResult.correct)}
          onRestart={handleRestart}
        />
      ) : (
        <>
          {error && (
            <div className="px-4 py-2 bg-red-900/50 border-b border-red-800 text-red-300 text-xs text-center">
              {error}
            </div>
          )}
          <ConversationLog entries={gameState.dialogHistory} loading={loading} />

          <div className="border-t border-gray-800 shrink-0">
            {gameState.phase === "investigation" && (() => {
              const required = scenario.requiredDecisions ?? [];
              const needsOxygen =
                required.includes("oxygenFixed") &&
                gameState.unlockedEvidence.includes("酸素") &&
                gameState.choices.oxygenFixed === null;
              const needsBox =
                required.includes("boxDecision") && gameState.choices.boxDecision === null;
              const allDecided = !needsOxygen && !needsBox;
              return (
                <div className="flex flex-col gap-2 p-2">
                  {needsOxygen && (
                    <button
                      onClick={() => setPendingDecision("oxygenFixed")}
                      className="px-4 py-1.5 bg-amber-900/50 hover:bg-amber-800 border border-amber-700 rounded text-xs text-amber-300 transition-colors"
                    >
                      酸素システムの処遇を決める
                    </button>
                  )}
                  {needsBox && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => setPendingDecision("boxDecision")}
                        className="px-4 py-1.5 bg-amber-900/50 hover:bg-amber-800 border border-amber-700 rounded text-xs text-amber-300 transition-colors"
                      >
                        箱の処遇を決める
                      </button>
                    </div>
                  )}
                  {allDecided && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => setGameState((s) => ({ ...s, phase: "accusation" }))}
                        className="px-4 py-1.5 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded text-xs text-red-300 transition-colors"
                      >
                        摘発に進む
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            {gameState.phase === "accusation" ? (
              <AccusationPanel onAccuse={handleAccuse} loading={loading} characters={scenario.characters} />
            ) : (
              <>
                {pendingDecision && (
                  <DecisionPrompt
                    decisionKey={pendingDecision}
                    onDecision={handleDecision}
                  />
                )}
                {gameState.phase === "investigation" &&
                  Object.values(gameState.trustLevels).every((v) => v === 0) && (
                    <div className="mx-4 mt-3 p-3 bg-blue-950/30 border border-blue-800/50 rounded text-xs text-blue-200">
                      <span className="font-bold">💡 まずは下のキャラクターを選んで質問してみましょう。</span>
                      <span className="text-blue-300/70"> GMに「ヒントをください」と聞くのもアリです。</span>
                    </div>
                  )}
                <CharacterSelect
                  characters={scenario.characters}
                  activeCharacterId={characterId}
                  onSelect={setCharacterId}
                  trustLevels={gameState.trustLevels}
                />

                {(() => {
                  const active = characterId
                    ? scenario.characters.find((c) => c.id === characterId)
                    : null;
                  const suggestions = active?.suggestedQuestions ?? (characterId === null
                    ? ["ヒントをください", "今の状況を整理してください", "誰に話を聞くべきですか？"]
                    : []);
                  return (
                    <>
                      {active && (
                        <div className="mx-3 sm:mx-4 mb-2 p-3 bg-purple-950/20 border border-purple-900/40 rounded text-xs">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-purple-300 font-bold text-sm">{active.name}</span>
                            <span className="text-gray-500">に話しかけています</span>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{active.publicProfile}</p>
                          {active.relationToVictim && (
                            <p className="text-gray-400 mt-1">
                              <span className="text-gray-500">関係: </span>
                              {active.relationToVictim}
                            </p>
                          )}
                        </div>
                      )}
                      {!active && characterId === null && (
                        <div className="mx-3 sm:mx-4 mb-2 p-3 bg-emerald-950/20 border border-emerald-900/40 rounded text-xs">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-emerald-300 font-bold text-sm">GM</span>
                            <span className="text-gray-500">に話しかけています</span>
                          </div>
                          <p className="text-gray-300 leading-relaxed">
                            ゲームマスター。状況の整理やヒント、進め方の相談に答えます。
                          </p>
                        </div>
                      )}
                      {suggestions.length > 0 && (
                        <div className="px-3 sm:px-4 pb-2 flex flex-wrap gap-1.5">
                          {suggestions.map((q) => (
                            <button
                              key={q}
                              onClick={() => setTextInput(q)}
                              disabled={loading}
                              className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 border border-gray-700 rounded-full text-xs text-gray-300 transition-colors"
                              title="クリックで入力欄に挿入"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}

                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(textInput)}
                    placeholder={characterId ? "気になる単語を含めて質問..." : "GMにヒントを聞く..."}
                    disabled={loading}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => sendMessage(textInput)}
                    disabled={loading || !textInput.trim()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 rounded text-sm transition-colors"
                  >
                    送信
                  </button>
                  <RecordButton onTranscribed={handleTranscribed} onError={setError} disabled={loading} />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

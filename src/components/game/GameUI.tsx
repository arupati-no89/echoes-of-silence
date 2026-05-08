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
  const [pendingDecision, setPendingDecision] = useState<keyof PlayerChoices | null>(null);

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
        throw new Error(`API エラー: ${res.status}`);
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
  }, [scenarioId]);

  const handleSelectScenario = useCallback((id: string) => {
    setScenarioId(id);
    setGameState(createInitialState(id));
    setCharacterId(null);
    setTextInput("");
    setError("");
    setPendingDecision(null);
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

  if (gameState.phase === "intro" && gameState.dialogHistory.length <= 1) {
    return (
      <div className="flex flex-col h-screen bg-gray-950 text-white items-center justify-center p-8">
        <h1 className="text-2xl font-bold mb-2">Echoes of Silence</h1>
        <p className="text-gray-400 mb-8">沈黙の真実 — 音声対話型AIマーダーミステリー</p>
        <div className="space-y-3 w-full max-w-xs">
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
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <header className="px-4 py-3 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold">Echoes of Silence</h1>
          <p className="text-xs text-gray-500">{scenario.title}</p>
        </div>
        <div className="flex items-center gap-3">
          {gameState.phase === "investigation" && characterId && (
            <span className="text-xs text-gray-400">
              信頼度 {renderTrustBar(gameState.trustLevels[characterId] ?? 0)}
            </span>
          )}
          {gameState.phase === "investigation" && gameState.unlockedEvidence.length > 0 && (
            <span className="text-xs text-amber-400">
              証拠 {gameState.unlockedEvidence.length}個
            </span>
          )}
          <span className="text-xs text-gray-500">
            {gameState.phase === "intro" && "導入"}
            {gameState.phase === "investigation" && "調査フェーズ"}
            {gameState.phase === "accusation" && "摘発フェーズ"}
            {gameState.phase === "resolution" && "解決"}
          </span>
        </div>
      </header>

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
            {gameState.phase === "investigation" && (
              <div className="flex flex-col gap-2 p-2">
                {scenarioId === "unknown" && gameState.unlockedEvidence.includes("酸素") && gameState.choices.oxygenFixed === null && (
                  <button
                    onClick={() => setPendingDecision("oxygenFixed")}
                    className="px-4 py-1.5 bg-amber-900/50 hover:bg-amber-800 border border-amber-700 rounded text-xs text-amber-300 transition-colors"
                  >
                    酸素システムの処遇を決める
                  </button>
                )}
                <div className="flex justify-center">
                  {gameState.choices.boxDecision === null ? (
                    <button
                      onClick={() => setPendingDecision("boxDecision")}
                      className="px-4 py-1.5 bg-amber-900/50 hover:bg-amber-800 border border-amber-700 rounded text-xs text-amber-300 transition-colors"
                    >
                      箱の処遇を決める
                    </button>
                  ) : (
                    <button
                      onClick={() => setGameState((s) => ({ ...s, phase: "accusation" }))}
                      className="px-4 py-1.5 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded text-xs text-red-300 transition-colors"
                    >
                      摘発に進む
                    </button>
                  )}
                </div>
              </div>
            )}

            {gameState.phase === "accusation" ? (
              <AccusationPanel onAccuse={handleAccuse} loading={loading} />
            ) : (
              <>
                {pendingDecision && (
                  <DecisionPrompt
                    decisionKey={pendingDecision}
                    onDecision={handleDecision}
                  />
                )}
                <CharacterSelect
                  characters={scenario.characters}
                  activeCharacterId={characterId}
                  onSelect={setCharacterId}
                  trustLevels={gameState.trustLevels}
                />

                <div className="flex items-center gap-3 p-4">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage(textInput)}
                    placeholder="テキストで話しかける..."
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

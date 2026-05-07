"use client";

import { useState, useCallback } from "react";
import { GameState } from "@/lib/game/types";
import { vampireScenario } from "@/lib/game/scenario";
import ConversationLog from "./ConversationLog";
import CharacterSelect from "./CharacterSelect";
import RecordButton from "./RecordButton";
import AccusationPanel from "./AccusationPanel";
import ResolutionScreen from "./ResolutionScreen";

const initialGameState: GameState = {
  phase: "intro",
  unlockedEvidence: [],
  trustLevels: { elena: 0, victor: 0 },
  dialogHistory: [
    { role: "gm", speaker: "GM", content: vampireScenario.intro, timestamp: Date.now() },
  ],
};

export default function GameUI() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [characterId, setCharacterId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (message: string, mode?: "normal" | "accusation") => {
    if (!message.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim(), characterId, gameState, mode }),
      });

      const data = await res.json();
      setGameState(data.gameState);

      if (mode !== "accusation" && characterId) {
        const char = vampireScenario.characters.find((c) => c.id === characterId);
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
    } finally {
      setLoading(false);
    }
  }, [characterId, gameState, loading]);

  const handleTranscribed = useCallback((text: string) => {
    setTextInput(text);
    sendMessage(text);
  }, [sendMessage]);

  const handleAccuse = useCallback((statement: string) => {
    sendMessage(statement, "accusation");
  }, [sendMessage]);

  const handleRestart = useCallback(() => {
    setGameState(initialGameState);
    setCharacterId(null);
    setTextInput("");
  }, []);

  const inResolution = gameState.phase === "resolution";

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      <header className="px-4 py-3 border-b border-gray-800 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold">Echoes of Silence</h1>
          <p className="text-xs text-gray-500">沈黙の真実</p>
        </div>
        <span className="text-xs text-gray-500">
          {gameState.phase === "intro" && "導入"}
          {gameState.phase === "investigation" && "調査フェーズ"}
          {gameState.phase === "accusation" && "摘発フェーズ"}
          {gameState.phase === "resolution" && "解決"}
        </span>
      </header>

      {inResolution && gameState.accusationResult ? (
        <ResolutionScreen
          correct={gameState.accusationResult.correct}
          feedback={gameState.accusationResult.feedback}
          onRestart={handleRestart}
        />
      ) : (
        <>
          <ConversationLog entries={gameState.dialogHistory} />

          <div className="border-t border-gray-800 shrink-0">
            {gameState.phase === "investigation" && (
              <div className="flex justify-center p-2">
                <button
                  onClick={() => setGameState((s) => ({ ...s, phase: "accusation" }))}
                  className="px-4 py-1.5 bg-red-900/50 hover:bg-red-800 border border-red-700 rounded text-xs text-red-300 transition-colors"
                >
                  摘発に進む
                </button>
              </div>
            )}

            {gameState.phase === "accusation" ? (
              <AccusationPanel onAccuse={handleAccuse} loading={loading} />
            ) : (
              <>
                <CharacterSelect
                  characters={vampireScenario.characters}
                  activeCharacterId={characterId}
                  onSelect={setCharacterId}
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
                  <RecordButton onTranscribed={handleTranscribed} disabled={loading} />
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

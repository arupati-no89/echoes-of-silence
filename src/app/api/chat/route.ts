import { NextRequest, NextResponse } from "next/server";
import { generateNPCResponse } from "@/server/agents/npc";
import { generateGMResponse, judgeAccusation } from "@/server/agents/gm";
import { scenarios } from "@/game/scenarios";
import { Scenario, GameState, DialogEntry } from "@/game/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, characterId, gameState, mode, scenarioId }:
      { message: string; characterId: string | null; gameState: GameState; mode?: "normal" | "accusation"; scenarioId?: string } = body;

    const scenario: Scenario = (scenarioId && scenarios[scenarioId]) || scenarios.vampire;

    const state: GameState = gameState ?? {
      phase: "intro",
      unlockedEvidence: [],
      trustLevels: Object.fromEntries(scenario.characters.map((c) => [c.id, 0])),
      choices: { oxygenFixed: null, boxDecision: null },
      dialogHistory: [],
    };

    const playerEntry: DialogEntry = {
      role: "player",
      speaker: "プレイヤー",
      content: message,
      timestamp: Date.now(),
    };
    state.dialogHistory.push(playerEntry);

    let response: string;
    let newPhase = state.phase;

    if (mode === "accusation") {
      const result = await judgeAccusation(message, scenario);
      state.accusationResult = result;
      newPhase = "resolution";
      response = result.feedback;
      state.dialogHistory.push({ role: "gm", speaker: "GM", content: result.feedback, timestamp: Date.now() });
    } else if (characterId) {
      const char = scenario.characters.find((c) => c.id === characterId);
      if (!char) {
        return NextResponse.json({ error: "Character not found" }, { status: 404 });
      }

      state.trustLevels[characterId] = Math.min((state.trustLevels[characterId] ?? 0) + 0.5, 3);

      response = await generateNPCResponse(char, state, message);
      state.dialogHistory.push({ role: "npc", speaker: char.name, content: response, timestamp: Date.now() });
    } else {
      if (state.phase === "intro") {
        newPhase = "investigation";
      }

      const keyword = scenario.characters
        .flatMap((c) => c.evidenceResponses)
        .find((er) => message.includes(er.keyword));

      if (keyword && !state.unlockedEvidence.includes(keyword.keyword)) {
        state.unlockedEvidence.push(keyword.keyword);
      }

      response = await generateGMResponse(state, scenario, message);
      state.dialogHistory.push({ role: "gm", speaker: "GM", content: response, timestamp: Date.now() });
    }

    state.phase = newPhase;

    return NextResponse.json({
      response,
      gameState: state,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status =
      typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
        ? error.status
        : 500;
    console.error("[api/chat] error:", message);
    return NextResponse.json({ error: message }, { status });
  }
}

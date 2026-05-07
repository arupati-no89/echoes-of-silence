import { NextRequest, NextResponse } from "next/server";
import { generateNPCResponse } from "@/agents/npc_agents";
import { generateGMResponse, judgeAccusation } from "@/agents/gm_agent";
import { vampireScenario } from "@/lib/game/scenario";
import { GameState, DialogEntry } from "@/lib/game/types";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, characterId, gameState, mode }:
    { message: string; characterId: string | null; gameState: GameState; mode?: "normal" | "accusation" } = body;

  const state: GameState = gameState ?? {
    phase: "intro",
    unlockedEvidence: [],
    trustLevels: { elena: 0, victor: 0 },
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
    const result = await judgeAccusation(message, vampireScenario);
    state.accusationResult = result;
    newPhase = "resolution";
    response = result.feedback;
    state.dialogHistory.push({ role: "gm", speaker: "GM", content: result.feedback, timestamp: Date.now() });
  } else if (characterId) {
    const char = vampireScenario.characters.find((c) => c.id === characterId);
    if (!char) {
      return NextResponse.json({ error: "Character not found" }, { status: 404 });
    }
    response = await generateNPCResponse(char, state, message);
    state.dialogHistory.push({ role: "npc", speaker: char.name, content: response, timestamp: Date.now() });
  } else {
    if (state.phase === "intro") {
      newPhase = "investigation";
    }

    const keyword = vampireScenario.characters
      .flatMap((c) => c.evidenceResponses)
      .find((er) => message.includes(er.keyword));

    if (keyword && !state.unlockedEvidence.includes(keyword.keyword)) {
      state.unlockedEvidence.push(keyword.keyword);
    }

    response = await generateGMResponse(state, vampireScenario, message);
    state.dialogHistory.push({ role: "gm", speaker: "GM", content: response, timestamp: Date.now() });
  }

  state.phase = newPhase;

  return NextResponse.json({
    response,
    gameState: state,
  });
}

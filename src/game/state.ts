import { GameState, Scenario } from "./types";
import { scenarios } from "./scenarios";

export function createInitialState(scenarioId: string): GameState {
  const scenario: Scenario = scenarios[scenarioId] ?? scenarios.vampire;
  return {
    phase: "intro",
    unlockedEvidence: [],
    trustLevels: Object.fromEntries(scenario.characters.map((c) => [c.id, 0])),
    choices: { oxygenFixed: null, boxDecision: null },
    dialogHistory: [
      { role: "gm", speaker: "GM", content: scenario.intro, timestamp: Date.now() },
    ],
  };
}

import { GameState, GamePhase } from "./types";

export function createInitialState(): GameState {
  return {
    phase: "intro",
    unlockedEvidence: [],
    trustLevels: { elena: 0, victor: 0 },
    dialogHistory: [],
  };
}

export function detectKeywords(input: string, unlockedEvidence: string[]): string[] {
  const keywords = ["毒", "妹", "手袋", "友人", "毒の手袋"];
  return keywords.filter((kw) => input.includes(kw) && !unlockedEvidence.includes(kw));
}

export function transitionPhase(current: GamePhase, input: string): GamePhase {
  if (current === "intro") return "investigation";
  return current;
}

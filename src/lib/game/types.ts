export interface Character {
  id: string;
  name: string;
  publicProfile: string;
  hiddenTruths: HiddenTruth[];
  evidenceResponses: EvidenceResponse[];
  speechStyle: string;
  voiceType: string;
}

export interface HiddenTruth {
  level: number;
  content: string;
}

export interface EvidenceResponse {
  keyword: string;
  reaction: string;
}

export interface Evidence {
  id: string;
  label: string;
  description: string;
}

export interface GameState {
  phase: GamePhase;
  unlockedEvidence: string[];
  trustLevels: Record<string, number>;
  dialogHistory: DialogEntry[];
  accusationResult?: {
    correct: boolean;
    feedback: string;
  };
}

export type GamePhase = "intro" | "investigation" | "accusation" | "resolution";

export interface DialogEntry {
  role: "player" | "gm" | "npc";
  speaker: string;
  content: string;
  timestamp: number;
}

export interface Scenario {
  title: string;
  intro: string;
  characters: Character[];
  solution: {
    culprit: string;
    weapon: string;
    motive: string;
  };
}

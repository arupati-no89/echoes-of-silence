export interface Character {
  id: string;
  name: string;
  publicProfile: string;
  hiddenTruths: HiddenTruth[];
  evidenceResponses: EvidenceResponse[];
  speechStyle: string;
  voiceType: string;
  /** 被害者・事件との関係（プレイヤーに公開） */
  relationToVictim?: string;
  /** プレイヤーに提示する「話しかけてみよう」の例 */
  suggestedQuestions?: string[];
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
  choices: PlayerChoices;
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

export interface PlayerChoices {
  oxygenFixed: boolean | null;
  boxDecision: "knowingly_open" | "unknowingly_open" | "not_open" | "sacrifice" | null;
}

export interface ScenarioEnding {
  id: string;
  title: string;
  description: string;
  condition: (choices: PlayerChoices, accusationCorrect: boolean) => boolean;
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
  endings?: ScenarioEnding[];
  requiredDecisions?: (keyof PlayerChoices)[];
  /** プレイヤー向けのブリーフィング情報。事件の概要・舞台・調査目標などを構造化して提示する */
  briefing?: ScenarioBriefing;
}

export interface ScenarioBriefing {
  /** 世界観・舞台設定（1–3文） */
  setting: string;
  /** 被害者の素性と関係 */
  victim: string;
  /** 現場の状況 */
  crimeScene: string;
  /** プレイヤーの立場・役割 */
  yourRole: string;
  /** 調べるべき項目のリスト（道筋ヒント） */
  objectives: string[];
}

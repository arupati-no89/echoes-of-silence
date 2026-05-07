import OpenAI from "openai";
import { GameState, Scenario } from "@/lib/game/types";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });
}

const SYSTEM_PROMPT = `あなたはマーダーミステリー「Echoes of Silence」のゲームマスター（GM）です。
役割：
- 物語の導入と情景描写を行う
- プレイヤーの調査に応じて情報を提供する
- 証拠が発見された時は劇的に演出する
- 最終的な真相判定を行う

口調：
- 第三人称のナレーション形式
- 簡潔で雰囲気のある日本語
- 謎めいた、かつ親切な語り口`;

export async function generateGMResponse(
  state: GameState,
  scenario: Scenario,
  playerMessage: string
): Promise<string> {
  const dialogContext = state.dialogHistory
    .slice(-10)
    .map((d) => `${d.speaker}: ${d.content}`)
    .join("\n");

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `【シナリオ】${scenario.title}
【現状のフェーズ】${state.phase}
【解放済み証拠】${state.unlockedEvidence.join(", ") || "なし"}
【会話履歴】
${dialogContext}

【プレイヤーの行動】
${playerMessage}

上記に基づき、GMとして適切な応答を生成してください。`,
      },
    ],
    temperature: 0.8,
    max_tokens: 300,
  });

  return response.choices[0]?.message?.content ?? "（GMは沈黙している…）";
}

export async function judgeAccusation(
  playerMessage: string,
  scenario: Scenario
): Promise<{ correct: boolean; feedback: string }> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `あなたは謎解きの判定者です。
正解は以下：
- 犯人: ${scenario.solution.culprit}
- 凶器: ${scenario.solution.weapon}
- 動機: ${scenario.solution.motive}

プレイヤーの発言がこれらの正解に合致するか判定し、結果とフィードバックをJSONで返してください。`,
      },
      {
        role: "user",
        content: playerMessage,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0,
  });

  const result = JSON.parse(response.choices[0]?.message?.content ?? "{}");
  return {
    correct: result.correct ?? false,
    feedback: result.feedback ?? "判定できませんでした",
  };
}

import OpenAI from "openai";
import { Character, GameState } from "@/lib/game/types";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });
}

export async function generateNPCResponse(
  character: Character,
  state: GameState,
  playerMessage: string
): Promise<string> {
  const trustLevel = state.trustLevels[character.id] ?? 0;
  const revealedSecrets = character.hiddenTruths
    .filter((t) => t.level <= trustLevel)
    .map((t) => t.content);

  const systemPrompt = `あなたはマーダーミステリーの登場人物「${character.name}」です。
【人物設定】
${character.publicProfile}

【口調】
${character.speechStyle}

【秘密（解放レベルに応じて仄めかして良い）】
${revealedSecrets.join("\n") || "（なし）"}

重要なルール：
- 直接的な自白はしない
- 質問に対しては回避・否定・話題変更でかわす
- 解放された秘密は完全には隠さず、匂わせる程度に
- プレイヤーの追及が鋭いほど動揺した態度を見せる`;

  const dialogContext = state.dialogHistory
    .slice(-6)
    .map((d) => `${d.speaker}: ${d.content}`)
    .join("\n");

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `【これまでの会話】
${dialogContext}

【プレイヤーの質問】
${playerMessage}

${character.name}として返答してください。`,
      },
    ],
    temperature: 0.9,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content ?? "（…無言）";
}

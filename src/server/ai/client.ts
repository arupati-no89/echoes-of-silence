import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  const key = process.env.OPENAI_API_KEY;
  if (!key || key === "sk-your-api-key-here" || key.trim() === "") {
    throw new Error(
      "OPENAI_API_KEY が設定されていません。.env.local に有効なOpenAI APIキーを設定してください。"
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

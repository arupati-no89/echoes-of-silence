import OpenAI from "openai";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });
}

export async function synthesizeSpeech(
  text: string,
  voice: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer" = "shimmer"
): Promise<ArrayBuffer> {
  const response = await getOpenAI().audio.speech.create({
    model: "tts-1",
    voice,
    input: text,
    speed: 1.0,
  });
  return response.arrayBuffer();
}

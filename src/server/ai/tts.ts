import { getOpenAI } from "./client";

export type VoiceType = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export async function synthesizeSpeech(
  text: string,
  voice: VoiceType = "shimmer"
): Promise<ArrayBuffer> {
  const response = await getOpenAI().audio.speech.create({
    model: "tts-1",
    voice,
    input: text,
    speed: 1.0,
  });
  return response.arrayBuffer();
}

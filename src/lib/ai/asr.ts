import OpenAI from "openai";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY ?? "" });
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const file = new File([audioBlob], "recording.webm", { type: "audio/webm" });
  const transcription = await getOpenAI().audio.transcriptions.create({
    model: "whisper-1",
    file,
    language: "ja",
  });
  return transcription.text;
}

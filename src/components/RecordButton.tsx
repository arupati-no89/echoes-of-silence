"use client";

import { useRef, useState, useCallback } from "react";

interface Props {
  onTranscribed: (text: string) => void;
  disabled?: boolean;
}

export default function RecordButton({ onTranscribed, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks.current, { type: "audio/webm" });
        setSending(true);

        try {
          const form = new FormData();
          form.append("audio", blob, "recording.webm");
          const res = await fetch("/api/transcribe", { method: "POST", body: form });
          const data = await res.json();
          if (data.text) onTranscribed(data.text);
        } finally {
          setSending(false);
        }
      };

      recorder.start();
      mediaRecorder.current = recorder;
      setRecording(true);
    } catch {
      alert("マイクへのアクセスを許可してください");
    }
  }, [onTranscribed]);

  const stopRecording = useCallback(() => {
    mediaRecorder.current?.stop();
    setRecording(false);
  }, []);

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      disabled={disabled || sending}
      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
        recording
          ? "bg-red-600 animate-pulse shadow-lg shadow-red-600/50"
          : sending
            ? "bg-gray-600"
            : "bg-gray-700 hover:bg-gray-600"
      }`}
    >
      {recording ? (
        <span className="w-5 h-5 bg-white rounded-sm" />
      ) : sending ? (
        <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
      ) : (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3z" />
          <path d="M17 11a1 1 0 0 0-2 0 3 3 0 0 1-6 0 1 1 0 0 0-2 0 5 5 0 0 0 4 4.9V18H8a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2h-3v-2.1a5 5 0 0 0 4-4.9z" />
        </svg>
      )}
    </button>
  );
}

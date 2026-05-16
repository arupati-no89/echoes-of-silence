"use client";

import { DialogEntry } from "@/game/types";
import { useEffect, useRef } from "react";

interface Props {
  entries: DialogEntry[];
  loading?: boolean;
}

const roleColors: Record<string, string> = {
  gm: "border-l-emerald-500 bg-emerald-950/30",
  npc: "border-l-purple-500 bg-purple-950/30",
  player: "border-l-blue-500 bg-blue-950/30",
};

const roleLabels: Record<string, string> = {
  gm: "GM",
  npc: "NPC",
  player: "あなた",
};

export default function ConversationLog({ entries, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (nearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [entries]);

  return (
    <div ref={scrollerRef} className="flex-1 overflow-y-auto space-y-3 p-4">
      {entries.map((entry, i) => (
        <div
          key={i}
          className={`border-l-2 pl-3 py-2 ${roleColors[entry.role] ?? "border-l-gray-500"}`}
        >
          <span className="text-xs text-gray-400">
            {roleLabels[entry.role] ?? entry.role} / {entry.speaker}
          </span>
          <p className="text-sm mt-0.5 text-gray-100">{entry.content}</p>
        </div>
      ))}
      {loading && (
        <div className="border-l-2 border-l-gray-500 pl-3 py-2">
          <span className="text-xs text-gray-400">GM / システム</span>
          <p className="text-sm mt-0.5 text-gray-500">
            <span className="inline-flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          </p>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

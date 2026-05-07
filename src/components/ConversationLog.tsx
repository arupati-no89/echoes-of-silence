"use client";

import { DialogEntry } from "@/lib/game/types";
import { useEffect, useRef } from "react";

interface Props {
  entries: DialogEntry[];
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

export default function ConversationLog({ entries }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  return (
    <div className="flex-1 overflow-y-auto space-y-3 p-4">
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
      <div ref={bottomRef} />
    </div>
  );
}

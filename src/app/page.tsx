"use client";

import { useState } from "react";
import Link from "next/link";
import { usePresets } from "@/lib/presetStore";
import { StatusBadge } from "@/components/StatusBadge";

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const presets = usePresets(query);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">AmpSelector</h1>
        <p className="text-neutral-400 mb-6 text-sm">
          Biblioteca de presets do Cuvave Cube Baby
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por música, artista ou tag..."
          className="w-full mb-6 rounded-lg bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
        />

        <div className="grid gap-3">
          {presets.map((p) => (
            <Link
              key={p.id}
              href={`/presets/${p.id}`}
              className="rounded-lg bg-neutral-900 border border-neutral-800 px-4 py-3 hover:border-neutral-600 transition-colors flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="font-semibold truncate">{p.song}</div>
                <div className="text-sm text-neutral-400 truncate">{p.artist}</div>
              </div>
              <StatusBadge status={p.status} />
            </Link>
          ))}
          {presets.length === 0 && (
            <p className="text-neutral-500 text-sm text-center py-10">Nenhum preset encontrado.</p>
          )}
        </div>
      </div>
    </main>
  );
}

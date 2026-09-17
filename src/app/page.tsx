"use client";

import { useState } from "react";
import Link from "next/link";
import { usePresets } from "@/lib/presetStore";
import { StatusBadge } from "@/components/StatusBadge";
import { AMP_TYPES } from "@/data/pedal-spec";
import type { PresetStatus } from "@/types/preset";

const FILTERS: { value: PresetStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "rascunho-ia", label: "Rascunhos" },
  { value: "testado-aprovado", label: "Aprovados" },
  { value: "precisa-ajuste", label: "Precisam ajuste" },
];

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<PresetStatus | "todos">("todos");
  const presets = usePresets(query);
  const visible = filter === "todos" ? presets : presets.filter((p) => p.status === filter);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">AmpSelector</h1>
        <p className="mt-1.5 text-sm text-muted">
          Seus presets do Cuvave Cube Baby, música por música ·{" "}
          {presets.length === 1 ? "1 preset" : `${presets.length} presets`}
        </p>
      </header>

      <div className="mb-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por música, artista ou tag…"
          className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent/60"
        />
      </div>

      <div className="mb-7 flex flex-wrap gap-2">
        {FILTERS.map((option) => {
          const isActive = filter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-accent text-white"
                  : "bg-surface text-muted ring-1 ring-line hover:text-white/85"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((preset) => (
          <Link
            key={preset.id}
            href={`/presets/${preset.id}`}
            className="group flex flex-col rounded-2xl border border-line bg-surface p-4 transition-colors hover:border-accent/50 hover:bg-surface-2"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate font-semibold leading-snug">{preset.song}</h2>
                <p className="truncate text-sm text-muted">
                  {preset.artist}
                  {preset.section && <span className="text-muted/70"> · {preset.section}</span>}
                </p>
              </div>
              <StatusBadge status={preset.status} />
            </div>

            <div className="mb-4 flex flex-wrap gap-1.5">
              {preset.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-muted ring-1 ring-line"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
              <span className="truncate text-[11px] text-muted">{AMP_TYPES[preset.knobs.type]}</span>
              <span className="shrink-0 text-xs font-medium text-accent transition-transform group-hover:translate-x-0.5">
                Ver →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line py-16 text-center">
          <p className="text-sm text-muted">Nenhum preset encontrado.</p>
        </div>
      )}
    </main>
  );
}

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePreset, saveOverride, resetOverride } from "@/lib/presetStore";
import { Pedal } from "@/components/Pedal";
import { PedalSummary } from "@/components/PedalSummary";
import { GuitarPanel } from "@/components/GuitarPanel";
import { StatusBadge, STATUS_LABELS } from "@/components/StatusBadge";
import { FEEDBACK_TAGS } from "@/types/preset";
import type {
  FeedbackTag,
  FootswitchKey,
  GuitarInfo,
  Preset,
  PresetKnobs,
  PresetStatus,
} from "@/types/preset";

export default function PresetDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  const { preset, overridden } = usePreset(id);
  const [selectedTags, setSelectedTags] = useState<FeedbackTag[]>([]);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  if (!preset) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-12">
        <p className="mb-4 text-muted">Preset não encontrado.</p>
        <Link href="/" className="text-accent hover:underline">
          ← Voltar para a biblioteca
        </Link>
      </main>
    );
  }

  function persist(patch: Partial<Preset>) {
    saveOverride(id, patch);
  }

  function toggleTag(tag: FeedbackTag) {
    setSelectedTags((previous) =>
      previous.includes(tag) ? previous.filter((item) => item !== tag) : [...previous, tag]
    );
  }

  function submitFeedback() {
    if (!preset || (selectedTags.length === 0 && !note.trim())) return;
    persist({
      feedback: [
        ...preset.feedback,
        { date: new Date().toISOString(), tags: selectedTags, note: note.trim() || undefined },
      ],
    });
    setSelectedTags([]);
    setNote("");
  }

  async function copyChanges() {
    if (!preset) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(preset, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white/85"
      >
        ← Biblioteca
      </Link>

      <header className="mb-7 mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
            {preset.song}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <p className="text-muted">{preset.artist}</p>
            {preset.section && (
              <span className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-white/70 ring-1 ring-line">
                {preset.section}
              </span>
            )}
          </div>
        </div>
        <StatusBadge status={preset.status} />
      </header>

      <Pedal
        knobs={preset.knobs}
        footswitches={preset.footswitches}
        onKnobChange={(key: keyof PresetKnobs, value: number) =>
          persist({ knobs: { ...preset.knobs, [key]: value } })
        }
        onFootswitchToggle={(key: FootswitchKey) =>
          persist({ footswitches: { ...preset.footswitches, [key]: !preset.footswitches[key] } })
        }
      />
      <p className="mt-3 text-center text-[11px] text-muted">
        Arraste os knobs para cima/baixo (ou use o scroll) para ajustar.
        <span className="sm:hidden"> Deslize o pedal para o lado para ver todos.</span>
      </p>

      <div className="mt-4 flex justify-center">
        <Link
          href={`/tocar?preset=${preset.id}`}
          className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm transition-colors hover:border-accent/50"
        >
          Ouvir no braço virtual →
        </Link>
      </div>

      <div className="mt-5 grid gap-4">
        <PedalSummary knobs={preset.knobs} />
        <GuitarPanel
          guitar={preset.guitar}
          onChange={(patch: Partial<GuitarInfo>) =>
            persist({ guitar: { ...preset.guitar, ...patch } })
          }
        />

        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
            Por que esses valores
          </h2>
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-white/80">
            {preset.reasoning}
          </p>
        </section>

        <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-muted">
            Depois de testar
          </h2>
          <p className="mb-4 text-sm text-muted">
            Marque o que ficou fora do lugar — eu uso isso para calibrar os próximos presets.
          </p>

          <div className="mb-3 flex flex-wrap gap-2">
            {FEEDBACK_TAGS.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-white"
                      : "bg-surface-2 text-muted ring-1 ring-line hover:text-white/85"
                  }`}
                >
                  {tag.replace(/-/g, " ")}
                </button>
              );
            })}
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Algum detalhe específico? (opcional)"
            rows={2}
            className="mb-3 w-full resize-none rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-accent/60"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={submitFeedback}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Registrar feedback
            </button>
            <select
              value={preset.status}
              onChange={(event) => persist({ status: event.target.value as PresetStatus })}
              className="rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm outline-none focus:border-accent/60"
            >
              {(Object.keys(STATUS_LABELS) as PresetStatus[]).map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          {preset.feedback.length > 0 && (
            <ul className="mt-5 space-y-2 border-t border-line pt-4">
              {preset.feedback.map((entry, index) => (
                <li key={index} className="text-xs text-muted">
                  <span className="text-white/60">
                    {new Date(entry.date).toLocaleDateString("pt-BR")}
                  </span>
                  {entry.tags.length > 0 && ` · ${entry.tags.join(", ").replace(/-/g, " ")}`}
                  {entry.note && ` · “${entry.note}”`}
                </li>
              ))}
            </ul>
          )}
        </section>

        {overridden && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyChanges}
              className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm transition-colors hover:border-accent/50"
            >
              {copied ? "Copiado ✓" : "Copiar alterações pro Claude"}
            </button>
            <button
              type="button"
              onClick={() => resetOverride(id)}
              className="rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-rose-300 transition-colors hover:border-rose-500/50"
            >
              Desfazer meus ajustes
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

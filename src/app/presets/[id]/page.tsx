"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePreset, saveOverride, resetOverride } from "@/lib/presetStore";
import { Pedal } from "@/components/Pedal";
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
  const [openFeedback, setOpenFeedback] = useState(false);
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
    <main className="mx-auto min-h-screen w-full max-w-3xl px-5 py-9">
      <Link
        href="/"
        className="text-sm text-muted transition-colors hover:text-white/85"
      >
        ← Biblioteca
      </Link>

      <header className="mb-6 mt-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold leading-tight tracking-tight">{preset.song}</h1>
          <p className="mt-1 text-sm text-muted">
            {preset.artist}
            {preset.section && <span> · {preset.section}</span>}
          </p>
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

      <div className="mb-6 mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-muted">
          Arraste os knobs para cima e para baixo para ajustar.
        </p>
        <Link
          href={`/tocar?preset=${preset.id}`}
          className="rounded-md border border-line bg-surface-2 px-3.5 py-2 text-sm font-medium text-white/90 transition-colors hover:border-white/25"
        >
          Ouvir no braço virtual
        </Link>
      </div>

      <div className="grid gap-3">
        <GuitarPanel
          guitar={preset.guitar}
          onChange={(patch: Partial<GuitarInfo>) =>
            persist({ guitar: { ...preset.guitar, ...patch } })
          }
        />

        <section className="rounded-lg border border-line bg-surface p-5">
          <h2 className="mb-2.5 text-sm font-semibold uppercase tracking-wider text-muted">
            Por que esses valores
          </h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-white/80">
            {preset.reasoning}
          </p>
        </section>

        <section className="rounded-lg border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Depois de testar
              </h2>
              {preset.feedback.length > 0 && (
                <p className="mt-1 text-xs text-muted">
                  {preset.feedback.length === 1
                    ? "1 anotação registrada"
                    : `${preset.feedback.length} anotações registradas`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={preset.status}
                onChange={(event) => persist({ status: event.target.value as PresetStatus })}
                className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-white/90 outline-none focus:border-accent/60"
              >
                {(Object.keys(STATUS_LABELS) as PresetStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setOpenFeedback((open) => !open)}
                className="rounded-md border border-line bg-surface-2 px-3.5 py-2 text-sm font-medium text-white/90 transition-colors hover:border-white/25"
              >
                {openFeedback ? "Fechar" : "Anotar"}
              </button>
            </div>
          </div>

          {openFeedback && (
            <div className="mt-4 border-t border-line pt-4">
              <div className="mb-3 flex flex-wrap gap-1.5">
                {FEEDBACK_TAGS.map((tag) => {
                  const isActive = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded border px-2.5 py-1.5 text-xs transition-colors ${
                        isActive
                          ? "border-accent bg-accent text-white"
                          : "border-line bg-surface-2 text-white/70 hover:border-white/25 hover:text-white"
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
                className="mb-3 w-full resize-none rounded-md border border-line bg-surface-2 px-3 py-2 text-sm outline-none placeholder:text-muted/70 focus:border-accent/60"
              />

              <button
                type="button"
                onClick={submitFeedback}
                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                Registrar
              </button>

              {preset.feedback.length > 0 && (
                <ul className="mt-4 space-y-1.5 border-t border-line pt-3">
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
            </div>
          )}
        </section>

        {overridden && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyChanges}
              className="rounded-md border border-line bg-surface-2 px-3.5 py-2 text-sm font-medium text-white/90 transition-colors hover:border-white/25"
            >
              {copied ? "Copiado" : "Copiar alterações pro Claude"}
            </button>
            <button
              type="button"
              onClick={() => resetOverride(id)}
              className="rounded-md border border-line bg-surface-2 px-3.5 py-2 text-sm font-medium text-rose-300 transition-colors hover:border-rose-500/50"
            >
              Desfazer meus ajustes
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

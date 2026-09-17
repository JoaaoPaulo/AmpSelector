"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { usePreset, saveOverride, resetOverride } from "@/lib/presetStore";
import { Pedal } from "@/components/Pedal";
import { StatusBadge } from "@/components/StatusBadge";
import { FEEDBACK_TAGS } from "@/types/preset";
import type { Preset, PresetStatus, FeedbackTag, FootswitchKey, PresetKnobs } from "@/types/preset";

export default function PresetDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? "";

  const { preset, overridden } = usePreset(id);
  const [selectedTags, setSelectedTags] = useState<FeedbackTag[]>([]);
  const [note, setNote] = useState("");

  if (!preset) {
    return (
      <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <p className="mb-4">Preset não encontrado.</p>
          <Link href="/" className="text-blue-400 underline">
            Voltar
          </Link>
        </div>
      </main>
    );
  }

  function persist(patch: Partial<Preset>) {
    saveOverride(id, patch);
  }

  function toggleTag(tag: FeedbackTag) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function submitFeedback() {
    if (!preset || (selectedTags.length === 0 && !note.trim())) return;
    const entry = { date: new Date().toISOString(), tags: selectedTags, note: note.trim() || undefined };
    persist({ feedback: [...preset.feedback, entry] });
    setSelectedTags([]);
    setNote("");
  }

  function handleReset() {
    resetOverride(id);
  }

  async function handleCopyChanges() {
    if (!preset) return;
    const text = JSON.stringify(preset, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      alert("Alterações copiadas! Cole aqui no chat pra eu tornar isso oficial no repositório.");
    } catch {
      alert("Não consegui copiar automaticamente. Copie manualmente:\n\n" + text);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-sm text-neutral-400 hover:text-neutral-200">
          ← Voltar
        </Link>

        <div className="flex items-start justify-between mt-2 mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold">{preset.song}</h1>
            <p className="text-neutral-400">{preset.artist}</p>
          </div>
          <StatusBadge status={preset.status} />
        </div>

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

        <section className="mt-6 rounded-lg bg-neutral-900 border border-neutral-800 p-4">
          <h2 className="font-semibold mb-2">Guitarra</h2>
          <dl className="text-sm text-neutral-300 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="text-neutral-500">Tom</dt>
            <dd>{preset.guitar.key ?? "—"}</dd>
            <dt className="text-neutral-500">Capotraste</dt>
            <dd>{preset.guitar.capo ? `${preset.guitar.capo}ª casa` : "sem capotraste"}</dd>
            <dt className="text-neutral-500">Captador</dt>
            <dd className="capitalize">{preset.guitar.pickup ?? "—"}</dd>
            <dt className="text-neutral-500">Dicas</dt>
            <dd>{preset.guitar.notes ?? "—"}</dd>
          </dl>
        </section>

        <section className="mt-4 rounded-lg bg-neutral-900 border border-neutral-800 p-4">
          <h2 className="font-semibold mb-2">Por que esses valores</h2>
          <p className="text-sm text-neutral-300 whitespace-pre-line">{preset.reasoning}</p>
        </section>

        <section className="mt-4 rounded-lg bg-neutral-900 border border-neutral-800 p-4">
          <h2 className="font-semibold mb-3">Feedback depois de testar</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {FEEDBACK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  selectedTags.includes(tag)
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-neutral-800 border-neutral-700 text-neutral-300"
                }`}
              >
                {tag.replace(/-/g, " ")}
              </button>
            ))}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Algum detalhe específico? (opcional)"
            rows={2}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm mb-3 placeholder:text-neutral-500"
          />
          <div className="flex gap-2 flex-wrap items-center">
            <button
              type="button"
              onClick={submitFeedback}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium"
            >
              Registrar feedback
            </button>
            <select
              value={preset.status}
              onChange={(e) => persist({ status: e.target.value as PresetStatus })}
              className="rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm"
            >
              <option value="rascunho-ia">Rascunho (IA)</option>
              <option value="testado-aprovado">Testado e aprovado</option>
              <option value="precisa-ajuste">Precisa ajuste</option>
            </select>
          </div>

          {preset.feedback.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-neutral-400">
              {preset.feedback.map((f, i) => (
                <li key={i}>
                  {new Date(f.date).toLocaleDateString("pt-BR")}
                  {f.tags.length > 0 ? ` — ${f.tags.join(", ").replace(/-/g, " ")}` : ""}
                  {f.note ? ` — "${f.note}"` : ""}
                </li>
              ))}
            </ul>
          )}
        </section>

        {overridden && (
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyChanges}
              className="px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm hover:border-neutral-600"
            >
              Copiar alterações pra mandar pro Claude
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-red-300 hover:border-red-700"
            >
              Desfazer meus ajustes
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

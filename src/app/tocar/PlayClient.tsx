"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePresets } from "@/lib/presetStore";
import { GuitarEngine } from "@/lib/audioEngine";
import { Fretboard } from "@/components/Fretboard";
import { PedalSummary } from "@/components/PedalSummary";
import { StatusBadge } from "@/components/StatusBadge";

export function PlayClient() {
  const searchParams = useSearchParams();
  const presets = usePresets();
  const [presetId, setPresetId] = useState(() => searchParams.get("preset") ?? "");
  const [audioOn, setAudioOn] = useState(false);
  const [level, setLevel] = useState(0);
  const engineRef = useRef<GuitarEngine | null>(null);

  const preset = useMemo(
    () => presets.find((item) => item.id === presetId) ?? presets[0],
    [presets, presetId]
  );

  useEffect(() => {
    const engine = new GuitarEngine();
    engineRef.current = engine;
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (preset) engineRef.current?.setPreset(preset);
  }, [preset]);

  useEffect(() => {
    if (!audioOn) return;
    let frame = 0;
    const tick = () => {
      setLevel(engineRef.current?.getLevel() ?? 0);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [audioOn]);

  async function enableAudio() {
    await engineRef.current?.start();
    setAudioOn(true);
  }

  if (!preset) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-12">
        <p className="text-muted">Nenhum preset na biblioteca ainda.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white/85"
      >
        ← Biblioteca
      </Link>

      <header className="mb-6 mt-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Braço virtual</h1>
        <p className="mt-1.5 text-sm text-muted">
          Toque com o mouse ou o teclado para ouvir como um preset soa, por cima.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={preset.id}
          onChange={(event) => setPresetId(event.target.value)}
          className="min-w-[260px] flex-1 rounded-md border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-accent/60"
        >
          {presets.map((item) => (
            <option key={item.id} value={item.id}>
              {item.song}
              {item.section ? ` — ${item.section}` : ""} · {item.artist}
            </option>
          ))}
        </select>
        <StatusBadge status={preset.status} />
        <Link
          href={`/presets/${preset.id}`}
          className="rounded-md border border-line bg-surface-2 px-4 py-3 text-sm font-medium text-white/90 transition-colors hover:border-white/25"
        >
          Ver knobs
        </Link>
      </div>

      <div className="mb-5">
        <PedalSummary knobs={preset.knobs} />
      </div>

      <section className="rounded-lg border border-line bg-surface p-4 sm:p-5">
        {!audioOn ? (
          <div className="flex flex-col items-center gap-3 py-10">
            <p className="text-center text-sm text-muted">
              O navegador só libera o som depois de um clique.
            </p>
            <button
              type="button"
              onClick={enableAudio}
              className="rounded-md bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Ligar o som
            </button>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-wider text-muted">Saída</span>
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"
                role="meter"
                aria-label="Nível de saída"
                aria-valuenow={Math.round(Math.min(1, level * 4) * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-emerald-400 transition-[width] duration-75"
                  style={{ width: `${Math.min(100, level * 400)}%` }}
                />
              </div>
            </div>

            <Fretboard
              capo={preset.guitar.capo}
              onPlay={(midi) => engineRef.current?.pluck(midi)}
            />
            <div className="mt-4 grid gap-2 border-t border-line pt-4 text-[11px] leading-relaxed text-muted sm:grid-cols-2">
              <p>
                <span className="text-white/70">Teclado:</span> cada fileira é uma corda —{" "}
                <span className="font-mono text-white/60">1234…</span> Mi agudo,{" "}
                <span className="font-mono text-white/60">QWER…</span> Si,{" "}
                <span className="font-mono text-white/60">ASDF…</span> Sol,{" "}
                <span className="font-mono text-white/60">ZXCV…</span> Ré. Cada tecla da fileira é
                uma casa.
              </p>
              <p>
                <span className="text-white/70">Segurando Shift</span>, as mesmas fileiras tocam as
                cordas graves (Sol, Ré, Lá, Mi grave). No mouse, clique em qualquer ponto do braço.
              </p>
            </div>
          </>
        )}
      </section>

      <p className="mt-4 rounded-lg border border-line bg-surface p-4 text-[13px] leading-relaxed text-muted">
        <span className="text-white/75">Sobre o som:</span> a corda é sintetizada e os efeitos são
        uma aproximação feita a partir dos valores do preset — o processamento interno do Cube Baby
        é fechado, então isso não reproduz o pedal fielmente. Serve para sentir a direção do preset
        (limpo ou sujo, quanto delay, quão abafado) e comparar dois presets. O teste que vale é o da
        sua guitarra.
      </p>
    </main>
  );
}

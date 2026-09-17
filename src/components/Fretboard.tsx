"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DOUBLE_MARKER_FRETS,
  FRET_COUNT,
  MARKER_FRETS,
  STRINGS,
  keyToPosition,
  midiToName,
} from "@/lib/guitar";

const NUT_WIDTH = 40;
const STRING_GAP = 27;
const TOP_PADDING = 30;
const BOTTOM_PADDING = 18;
const LABEL_WIDTH = 34;

/** Casas ficam progressivamente mais estreitas, como num braço de verdade. */
function fretWidth(fret: number) {
  return Math.round(58 - (fret - 1) * 1.15);
}

const FRET_OFFSETS: number[] = (() => {
  const offsets = [0, NUT_WIDTH];
  for (let fret = 1; fret <= FRET_COUNT; fret++) {
    offsets.push(offsets[offsets.length - 1] + fretWidth(fret));
  }
  return offsets;
})();

const BOARD_WIDTH = FRET_OFFSETS[FRET_OFFSETS.length - 1];
const BOARD_HEIGHT = TOP_PADDING + STRING_GAP * (STRINGS.length - 1) + BOTTOM_PADDING;

function fretCenter(fret: number) {
  return (FRET_OFFSETS[fret] + FRET_OFFSETS[fret + 1]) / 2;
}

function stringY(index: number) {
  return TOP_PADDING + index * STRING_GAP;
}

interface FretboardProps {
  capo: number;
  onPlay: (midi: number) => void;
}

export function Fretboard({ capo, onPlay }: FretboardProps) {
  const [active, setActive] = useState<string | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const play = useCallback(
    (stringIndex: number, fret: number) => {
      if (fret > 0 && fret < capo) return;
      const midi = STRINGS[stringIndex].midi + (fret === 0 && capo > 0 ? capo : fret);
      onPlay(midi);
      setActive(`${stringIndex}-${fret}`);
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setActive(null), 260);
    },
    [capo, onPlay]
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const position = keyToPosition(event.code, event.shiftKey);
      if (!position || position.string >= STRINGS.length) return;
      event.preventDefault();
      play(position.string, position.fret);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [play]);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
  }, []);

  return (
    <div className="rail overflow-x-auto pb-1">
      <svg
        width={LABEL_WIDTH + BOARD_WIDTH}
        height={BOARD_HEIGHT}
        viewBox={`0 0 ${LABEL_WIDTH + BOARD_WIDTH} ${BOARD_HEIGHT}`}
        className="block select-none"
        role="group"
        aria-label="Braço da guitarra"
      >
        <defs>
          <linearGradient id="fretboard-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a2418" />
            <stop offset="45%" stopColor="#2a1a12" />
            <stop offset="100%" stopColor="#1d120c" />
          </linearGradient>
          <linearGradient id="fret-wire" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d6dce6" />
            <stop offset="50%" stopColor="#8b93a1" />
            <stop offset="100%" stopColor="#5d646f" />
          </linearGradient>
        </defs>

        <g transform={`translate(${LABEL_WIDTH},0)`}>
          <rect
            x={0}
            y={TOP_PADDING - 14}
            width={BOARD_WIDTH}
            height={STRING_GAP * (STRINGS.length - 1) + 28}
            rx={4}
            fill="url(#fretboard-wood)"
          />

          {/* Pestana */}
          <rect
            x={NUT_WIDTH - 6}
            y={TOP_PADDING - 14}
            width={6}
            height={STRING_GAP * (STRINGS.length - 1) + 28}
            fill="#e8dfc8"
          />

          {/* Marcações do braço */}
          {MARKER_FRETS.filter((fret) => fret <= FRET_COUNT).map((fret) => (
            <circle
              key={fret}
              cx={fretCenter(fret)}
              cy={TOP_PADDING + (STRING_GAP * (STRINGS.length - 1)) / 2}
              r={6}
              fill="#5d5142"
            />
          ))}
          {DOUBLE_MARKER_FRETS.filter((fret) => fret <= FRET_COUNT).map((fret) => (
            <g key={fret}>
              <circle cx={fretCenter(fret)} cy={TOP_PADDING + STRING_GAP * 1.2} r={6} fill="#5d5142" />
              <circle cx={fretCenter(fret)} cy={TOP_PADDING + STRING_GAP * 3.8} r={6} fill="#5d5142" />
            </g>
          ))}

          {/* Trastes */}
          {Array.from({ length: FRET_COUNT }, (_, index) => index + 1).map((fret) => (
            <rect
              key={fret}
              x={FRET_OFFSETS[fret + 1] - 2}
              y={TOP_PADDING - 14}
              width={2.5}
              height={STRING_GAP * (STRINGS.length - 1) + 28}
              fill="url(#fret-wire)"
            />
          ))}

          {/* Capotraste */}
          {capo > 0 && capo <= FRET_COUNT && (
            <rect
              x={FRET_OFFSETS[capo] + 3}
              y={TOP_PADDING - 17}
              width={9}
              height={STRING_GAP * (STRINGS.length - 1) + 34}
              rx={4}
              fill="#111827"
              stroke="#f59e0b"
              strokeWidth={1.5}
            />
          )}

          {/* Cordas */}
          {STRINGS.map((string, index) => (
            <line
              key={index}
              x1={0}
              y1={stringY(index)}
              x2={BOARD_WIDTH}
              y2={stringY(index)}
              stroke="#cbd5e1"
              strokeOpacity={0.75}
              strokeWidth={string.thickness}
            />
          ))}

          {/* Áreas clicáveis */}
          {STRINGS.map((string, stringIndex) =>
            Array.from({ length: FRET_COUNT + 1 }, (_, fret) => {
              const disabled = fret > 0 && fret < capo;
              const key = `${stringIndex}-${fret}`;
              const isActive = active === key;
              const midi = string.midi + (fret === 0 && capo > 0 ? capo : fret);
              return (
                <g key={key}>
                  <rect
                    x={FRET_OFFSETS[fret]}
                    y={stringY(stringIndex) - STRING_GAP / 2}
                    width={FRET_OFFSETS[fret + 1] - FRET_OFFSETS[fret]}
                    height={STRING_GAP}
                    fill="transparent"
                    className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
                    onPointerDown={() => !disabled && play(stringIndex, fret)}
                  >
                    <title>{`${midiToName(midi)} — corda ${stringIndex + 1}, casa ${fret}`}</title>
                  </rect>
                  {isActive && (
                    <circle
                      cx={fretCenter(fret)}
                      cy={stringY(stringIndex)}
                      r={9}
                      fill="#3b82f6"
                      fillOpacity={0.9}
                    />
                  )}
                </g>
              );
            })
          )}

          {/* Números das casas */}
          {Array.from({ length: FRET_COUNT }, (_, index) => index + 1).map((fret) => (
            <text
              key={fret}
              x={fretCenter(fret)}
              y={BOARD_HEIGHT - 4}
              textAnchor="middle"
              className="fill-white/30"
              fontSize={9}
            >
              {fret}
            </text>
          ))}
        </g>

        {/* Nomes das cordas soltas */}
        {STRINGS.map((string, index) => (
          <text
            key={index}
            x={LABEL_WIDTH - 8}
            y={stringY(index) + 4}
            textAnchor="end"
            className="fill-white/60"
            fontSize={11}
          >
            {string.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

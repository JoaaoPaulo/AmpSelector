"use client";

import { useCallback, useId, useRef } from "react";

const START_ANGLE = -135;
const END_ANGLE = 135;

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function pointOnArc(center: number, radius: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: round(center + radius * Math.cos(rad)),
    y: round(center + radius * Math.sin(rad)),
  };
}

function arcPath(center: number, radius: number, from: number, to: number) {
  const start = pointOnArc(center, radius, from);
  const end = pointOnArc(center, radius, to);
  const largeArc = Math.abs(to - from) > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

interface KnobProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  color?: string;
  /** Texto mostrado no lugar do número (nome da opção selecionada). */
  displayValue?: string;
  size?: number;
  /** Knob de posições fixas: anda de 1 em 1 e marca cada posição. */
  discrete?: boolean;
  /** Serigrafia acima do knob. */
  mark?: string;
  cap?: "metal" | "cream";
}

export function Knob({
  label,
  value,
  max,
  onChange,
  color = "#3b82f6",
  displayValue,
  size = 58,
  discrete = false,
  mark,
  cap = "metal",
}: KnobProps) {
  const gradientId = useId();
  const drag = useRef<{ y: number; value: number } | null>(null);
  const step = discrete ? 1 : 0.5;

  const clamp = useCallback(
    (v: number) => Math.max(0, Math.min(max, Math.round(v / step) * step)),
    [max, step]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, value };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    const delta = drag.current.y - e.clientY;
    onChange(clamp(drag.current.value + delta * (max / 120)));
  };

  const handlePointerUp = () => {
    drag.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    onChange(clamp(value + (e.deltaY > 0 ? -step : step)));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(clamp(value + step));
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(clamp(value - step));
    }
  };

  const center = size / 2;
  const tickOuter = center - 1;
  const tickInner = center - 4.5;
  const ringRadius = center - 7.5;
  const capRadius = center - 13;
  const angle = START_ANGLE + (value / max) * (END_ANGLE - START_ANGLE);
  const tickCount = discrete ? max + 1 : 11;
  const pointerStart = pointOnArc(center, capRadius * 0.3, angle);
  const pointerEnd = pointOnArc(center, capRadius * 0.82, angle);
  const isCream = cap === "cream";

  return (
    <div className="flex w-[74px] flex-col items-center gap-1">
      <span className="h-[11px] text-[9px] font-medium leading-none text-white/35">{mark}</span>

      <div
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={displayValue}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        className="cursor-ns-resize touch-none rounded-full outline-none ring-offset-2 ring-offset-transparent focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
          <defs>
            <radialGradient id={`${gradientId}-cap`} cx="50%" cy="26%" r="78%">
              <stop offset="0%" stopColor={isCream ? "#fbf1d8" : "#5a6679"} />
              <stop offset="55%" stopColor={isCream ? "#e6cd97" : "#2c3545"} />
              <stop offset="100%" stopColor={isCream ? "#a9873f" : "#141a24"} />
            </radialGradient>
            <linearGradient id={`${gradientId}-bezel`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a6b1c2" />
              <stop offset="100%" stopColor="#333c4b" />
            </linearGradient>
          </defs>

          {Array.from({ length: tickCount }, (_, i) => {
            const tickAngle = START_ANGLE + (i / (tickCount - 1)) * (END_ANGLE - START_ANGLE);
            const active = tickAngle <= angle + 0.01;
            const from = pointOnArc(center, tickOuter, tickAngle);
            const to = pointOnArc(center, tickInner, tickAngle);
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={active ? color : "#39465c"}
                strokeOpacity={active ? 0.85 : 1}
                strokeWidth={1}
                strokeLinecap="round"
              />
            );
          })}

          <path
            d={arcPath(center, ringRadius, START_ANGLE, END_ANGLE)}
            fill="none"
            stroke="#2b3648"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <path
            d={arcPath(center, ringRadius, START_ANGLE, angle)}
            fill="none"
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
          />

          <circle cx={center} cy={center} r={capRadius + 1.5} fill={`url(#${gradientId}-bezel)`} />
          <circle cx={center} cy={center} r={capRadius} fill={`url(#${gradientId}-cap)`} />
          <line
            x1={pointerStart.x}
            y1={pointerStart.y}
            x2={pointerEnd.x}
            y2={pointerEnd.y}
            stroke={isCream ? "#4a3712" : "#f1f5fb"}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      </div>

      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
        {label}
      </span>
      <span className="h-7 text-center text-[10px] leading-tight text-white/45">
        {displayValue ?? value}
      </span>
    </div>
  );
}

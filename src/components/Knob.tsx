"use client";

import { useCallback, useRef } from "react";

interface KnobProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  ringColorClass: string;
  displayValue?: string;
  size?: number;
}

const MIN_ANGLE = -135;
const MAX_ANGLE = 135;

export function Knob({ label, value, max, onChange, ringColorClass, displayValue, size = 56 }: KnobProps) {
  const dragState = useRef<{ startY: number; startValue: number } | null>(null);

  const clamp = useCallback((v: number) => Math.max(0, Math.min(max, v)), [max]);
  const step = max > 10 ? 1 : 0.5;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragState.current = { startY: e.clientY, startValue: value };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    const deltaY = dragState.current.startY - e.clientY;
    const sensitivity = max / 120;
    const raw = dragState.current.startValue + deltaY * sensitivity;
    const rounded = Math.round(raw / step) * step;
    onChange(clamp(rounded));
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? -1 : 1;
    onChange(clamp(value + direction * step));
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

  const rotation = MIN_ANGLE + (value / max) * (MAX_ANGLE - MIN_ANGLE);

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div
        className={`relative rounded-full bg-neutral-800 border-4 ${ringColorClass} shadow-inner cursor-ns-resize touch-none focus:outline-none focus:ring-2 focus:ring-white/40`}
        style={{ width: size, height: size }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
      >
        <div className="absolute inset-1 rounded-full bg-neutral-900" />
        <div
          className="absolute left-1/2 top-1/2 w-[2px] rounded-full bg-neutral-100"
          style={{
            height: "38%",
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: "top center",
          }}
        />
      </div>
      <span className="text-[10px] font-bold tracking-wide text-neutral-200">{label}</span>
      <span className="text-[10px] text-neutral-400 max-w-[80px] text-center leading-tight">
        {displayValue ?? value}
      </span>
    </div>
  );
}

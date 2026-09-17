"use client";

import type { PickupPosition } from "@/types/preset";

const POSITIONS: { value: PickupPosition; label: string; hint: string; angle: number }[] = [
  { value: "braço", label: "Braço", hint: "mais grave e redondo", angle: -32 },
  { value: "central", label: "Centro", hint: "equilibrado", angle: 0 },
  { value: "ponte", label: "Ponte", hint: "mais agudo e cortante", angle: 32 },
];

const PLATE_HEIGHT = 84;
const PIVOT_X = 84;
const PIVOT_Y = 78;
const DETENT_RADIUS = 52;

interface PickupSwitchProps {
  value: PickupPosition;
  onChange: (value: PickupPosition) => void;
}

export function PickupSwitch({ value, onChange }: PickupSwitchProps) {
  const current = POSITIONS.find((position) => position.value === value) ?? POSITIONS[1];

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-[168px] overflow-hidden rounded-xl border border-line"
        style={{
          height: PLATE_HEIGHT,
          background: "linear-gradient(180deg,#1b2231 0%,#10151f 100%)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.06)",
        }}
      >
        {POSITIONS.map((position) => {
          const rad = ((position.angle - 90) * Math.PI) / 180;
          const x = Math.round(PIVOT_X + DETENT_RADIUS * Math.cos(rad));
          const y = Math.round(PIVOT_Y + DETENT_RADIUS * Math.sin(rad));
          const isActive = position.value === current.value;
          return (
            <span
              key={position.value}
              className="absolute h-2 w-2 rounded-full transition-colors duration-200"
              style={{
                left: x - 4,
                top: y - 4,
                background: isActive ? "#f59e0b" : "#2f3a4d",
                boxShadow: isActive ? "0 0 8px #f59e0b" : "none",
              }}
            />
          );
        })}

        <div
          className="absolute flex origin-bottom flex-col items-center transition-transform duration-300 ease-out"
          style={{
            left: PIVOT_X,
            bottom: PLATE_HEIGHT - PIVOT_Y,
            transform: `translateX(-50%) rotate(${current.angle}deg)`,
          }}
        >
          <span
            className="h-[15px] w-[15px] rounded-full"
            style={{
              background: "radial-gradient(circle at 34% 28%, #ffffff, #cfd8e6 45%, #78849a 100%)",
              boxShadow: "0 2px 6px rgba(0,0,0,.6)",
            }}
          />
          <span
            className="h-[38px] w-[5px]"
            style={{ background: "linear-gradient(90deg,#5b6678,#dde4ef 45%,#69748a)" }}
          />
        </div>

        <span
          className="absolute h-[18px] w-[18px] rounded-full"
          style={{
            left: PIVOT_X - 9,
            top: PIVOT_Y - 9,
            background: "radial-gradient(circle at 40% 30%, #6a7384, #39424f)",
            boxShadow: "inset 0 1px 2px rgba(255,255,255,.15), 0 2px 4px rgba(0,0,0,.5)",
          }}
        />
      </div>

      <div className="flex gap-1">
        {POSITIONS.map((position) => {
          const isActive = position.value === current.value;
          return (
            <button
              key={position.value}
              type="button"
              onClick={() => onChange(position.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40"
                  : "text-muted hover:bg-white/5 hover:text-white/80"
              }`}
            >
              {position.label}
            </button>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-muted">{current.hint}</p>
    </div>
  );
}

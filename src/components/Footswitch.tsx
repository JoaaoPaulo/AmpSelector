"use client";

interface FootswitchProps {
  label: string;
  blocks: string;
  active: boolean;
  color: string;
  onToggle: () => void;
}

export function Footswitch({ label, blocks, active, color, onToggle }: FootswitchProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={`${blocks} — ${active ? "ligado" : "desligado"}`}
      className="group flex w-[112px] flex-col items-center gap-2"
    >
      <span
        className="h-2 w-2 rounded-full transition-all duration-200"
        style={{
          background: active ? color : "#2a3344",
          boxShadow: active ? `0 0 8px ${color}, 0 0 16px ${color}80` : "none",
        }}
      />

      <span
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full transition-transform duration-150 group-active:translate-y-[2px]"
        style={{
          background: "linear-gradient(180deg,#2f3541 0%,#171c25 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.12), 0 4px 10px rgba(0,0,0,.55)",
        }}
      >
        <span
          className="h-[34px] w-[34px] rounded-full"
          style={{
            background: "radial-gradient(circle at 34% 26%, #ffffff 0%, #d2dae6 38%, #8d97a8 72%, #5d6675 100%)",
            boxShadow: "inset 0 -2px 4px rgba(0,0,0,.35)",
          }}
        />
      </span>

      <span className="text-[11px] font-bold tracking-widest text-white/70">{label}</span>
      <span
        className="text-center text-[9px] leading-tight transition-colors"
        style={{ color: active ? color : "rgba(255,255,255,.35)" }}
      >
        {blocks}
      </span>
    </button>
  );
}

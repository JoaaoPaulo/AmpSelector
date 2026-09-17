"use client";

interface FootswitchProps {
  label: string;
  active: boolean;
  onToggle: () => void;
  ledColorClass: string;
}

export function Footswitch({ label, active, onToggle, ledColorClass }: FootswitchProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className="flex flex-col items-center gap-2 group"
    >
      <span
        className={`h-2 w-2 rounded-full transition-colors ${active ? ledColorClass : "bg-neutral-700"}`}
        aria-hidden
      />
      <div
        className={`w-14 h-14 rounded-full border-4 border-neutral-600 flex items-center justify-center bg-neutral-800 transition-transform group-active:scale-95`}
      >
        <div className="w-9 h-9 rounded-full bg-neutral-300" />
      </div>
      <span className="text-[10px] text-neutral-400 text-center max-w-[90px] leading-tight">{label}</span>
    </button>
  );
}

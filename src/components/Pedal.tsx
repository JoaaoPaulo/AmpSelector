"use client";

import { Knob } from "./Knob";
import { Footswitch } from "./Footswitch";
import { FOOTSWITCHES, KNOB_DEFS } from "@/data/pedal-spec";
import type { FootswitchKey, PresetFootswitches, PresetKnobs } from "@/types/preset";

interface PedalProps {
  knobs: PresetKnobs;
  footswitches: PresetFootswitches;
  onKnobChange: (key: keyof PresetKnobs, value: number) => void;
  onFootswitchToggle: (key: FootswitchKey) => void;
}

function Screw({ className }: { className: string }) {
  return (
    <span
      className={`absolute h-[7px] w-[7px] rounded-full ${className}`}
      style={{
        background: "radial-gradient(circle at 35% 30%, #6b7384, #2a3038 70%)",
        boxShadow: "inset 0 0 2px rgba(0,0,0,.8)",
      }}
    />
  );
}

export function Pedal({ knobs, footswitches, onKnobChange, onFootswitchToggle }: PedalProps) {
  return (
    <div className="rail overflow-x-auto pb-1">
      <div
        className="relative mx-auto min-w-[720px] rounded-[22px] px-7 pb-6 pt-5"
        style={{
          background: "linear-gradient(180deg,#262a31 0%,#16191f 42%,#0d0f13 100%)",
          border: "1px solid #2f343d",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.14), inset 0 -1px 0 rgba(0,0,0,.7), 0 22px 50px -18px rgba(0,0,0,.9)",
        }}
      >
        <Screw className="left-3 top-3" />
        <Screw className="right-3 top-3" />
        <Screw className="bottom-3 left-3" />
        <Screw className="bottom-3 right-3" />

        <div className="mb-5 flex items-center justify-between px-3">
          <span className="text-[15px] font-black italic tracking-tight text-white/90">CUVAVE</span>
          <div className="flex items-center gap-2">
            <span
              className="h-[7px] w-[7px] rounded-full"
              style={{ background: "#3b82f6", boxShadow: "0 0 8px #3b82f6, 0 0 16px #3b82f680" }}
            />
            <span className="text-[9px] font-medium tracking-[0.2em] text-white/35">CUBE BABY</span>
          </div>
        </div>

        <div className="mb-7 flex justify-center gap-1">
          {KNOB_DEFS.map((def) => {
            const value = knobs[def.key];
            return (
              <Knob
                key={def.key}
                label={def.label}
                mark={def.mark}
                value={value}
                max={def.max}
                color={def.color}
                discrete={Boolean(def.options)}
                displayValue={(def.shortOptions ?? def.options)?.[value]}
                onChange={(next) => onKnobChange(def.key, next)}
              />
            );
          })}
        </div>

        <div className="flex items-end justify-center gap-6">
          {FOOTSWITCHES.map((fs, index) => (
            <div key={fs.key} className="flex items-end gap-6">
              {index > 0 && (
                <div className="mb-7 flex flex-col items-center gap-1 text-[8px] tracking-wide text-white/25">
                  <span>{index === 1 ? "EDIT / PRESET" : "LIVE / PRESET"}</span>
                  <span className="text-white/15">{index === 1 ? "HOLD BT" : "HOLD TUNER"}</span>
                </div>
              )}
              <Footswitch
                label={fs.label}
                blocks={fs.blocks}
                color={fs.color}
                active={footswitches[fs.key]}
                onToggle={() => onFootswitchToggle(fs.key)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

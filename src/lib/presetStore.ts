"use client";

import { useSyncExternalStore } from "react";
import { PRESETS } from "@/data/presets";
import type { Preset } from "@/types/preset";

const STORAGE_KEY = "ampselector:overrides";

type Overrides = Record<string, Partial<Preset>>;

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readRawOverrides(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function parseOverrides(raw: string | null): Overrides {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Overrides;
  } catch {
    return {};
  }
}

function writeOverrides(overrides: Overrides) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  emitChange();
}

// Cache the derived array so useSyncExternalStore gets a stable reference
// when the underlying localStorage value hasn't actually changed.
let cachedRaw: string | null | undefined;
let cachedPresets: Preset[] = PRESETS;

function getPresetsSnapshot(): Preset[] {
  const raw = readRawOverrides();
  if (raw === cachedRaw) return cachedPresets;
  cachedRaw = raw;
  const overrides = parseOverrides(raw);
  cachedPresets = PRESETS.map((p) => (overrides[p.id] ? { ...p, ...overrides[p.id] } : p));
  return cachedPresets;
}

function getServerPresetsSnapshot(): Preset[] {
  return PRESETS;
}

export function saveOverride(id: string, patch: Partial<Preset>) {
  const overrides = parseOverrides(readRawOverrides());
  overrides[id] = {
    ...overrides[id],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeOverrides(overrides);
}

export function resetOverride(id: string) {
  const overrides = parseOverrides(readRawOverrides());
  delete overrides[id];
  writeOverrides(overrides);
}

export function exportOverrides(): string {
  return JSON.stringify(parseOverrides(readRawOverrides()), null, 2);
}

function filterPresets(presets: Preset[], query: string): Preset[] {
  const q = query.trim().toLowerCase();
  if (!q) return presets;
  return presets.filter(
    (p) =>
      p.song.toLowerCase().includes(q) ||
      p.artist.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
  );
}

export function usePresets(query = ""): Preset[] {
  const presets = useSyncExternalStore(subscribe, getPresetsSnapshot, getServerPresetsSnapshot);
  return filterPresets(presets, query);
}

export function usePreset(id: string): { preset: Preset | undefined; overridden: boolean } {
  const presets = useSyncExternalStore(subscribe, getPresetsSnapshot, getServerPresetsSnapshot);
  const overridden = useSyncExternalStore(
    subscribe,
    () => Boolean(parseOverrides(readRawOverrides())[id]),
    () => false
  );
  return { preset: presets.find((p) => p.id === id), overridden };
}

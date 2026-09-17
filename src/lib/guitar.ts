/** Afinação padrão, da corda 1 (Mi agudo) para a 6 (Mi grave), em notas MIDI. */
export const STRINGS = [
  { label: "Mi", midi: 64, thickness: 1 },
  { label: "Si", midi: 59, thickness: 1.4 },
  { label: "Sol", midi: 55, thickness: 1.8 },
  { label: "Ré", midi: 50, thickness: 2.2 },
  { label: "Lá", midi: 45, thickness: 2.7 },
  { label: "Mi", midi: 40, thickness: 3.2 },
] as const;

export const FRET_COUNT = 15;

export const NOTE_NAMES = [
  "Dó",
  "Dó#",
  "Ré",
  "Ré#",
  "Mi",
  "Fá",
  "Fá#",
  "Sol",
  "Sol#",
  "Lá",
  "Lá#",
  "Si",
] as const;

export const MARKER_FRETS = [3, 5, 7, 9, 15];
export const DOUBLE_MARKER_FRETS = [12];

export function midiToFrequency(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function midiToName(midi: number) {
  return NOTE_NAMES[midi % 12];
}

/**
 * Teclado: cada fileira é uma corda, cada tecla da fileira é uma casa.
 * Sem Shift toca as cordas 1-4 (agudas); com Shift, as cordas 3-6 (graves).
 */
const KEY_ROWS = [
  ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0"],
  ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP"],
  ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon"],
  ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"],
];

export function keyToPosition(code: string, shift: boolean) {
  for (let row = 0; row < KEY_ROWS.length; row++) {
    const fret = KEY_ROWS[row].indexOf(code);
    if (fret >= 0) return { string: shift ? row + 2 : row, fret };
  }
  return null;
}

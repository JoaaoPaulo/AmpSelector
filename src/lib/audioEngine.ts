"use client";

import { midiToFrequency } from "./guitar";
import { MOD_CENTER } from "@/data/pedal-spec";
import type { PickupPosition, Preset } from "@/types/preset";

/**
 * Simulação aproximada do Cube Baby em Web Audio. NÃO é o DSP real do pedal
 * (que é fechado) — é uma tradução dos valores do preset para uma cadeia de
 * efeitos equivalente, boa o bastante para ouvir a direção do som e comparar
 * presets entre si.
 */

interface AmpProfile {
  drive: number;
  preHighpass: number;
  midFreq: number;
  midGain: number;
  postLowpass: number;
}

/**
 * As 9 posições do TYPE, na ordem do pedal: limpo cristalino → high gain.
 * Índices batem com AMP_TYPES em src/data/pedal-spec.ts.
 */
const AMP_PROFILES: AmpProfile[] = [
  { drive: 0.06, preHighpass: 60, midFreq: 900, midGain: 0, postLowpass: 7600 },
  { drive: 0.12, preHighpass: 70, midFreq: 1000, midGain: 2, postLowpass: 7200 },
  { drive: 0.2, preHighpass: 80, midFreq: 1100, midGain: 3, postLowpass: 6800 },
  { drive: 0.3, preHighpass: 85, midFreq: 900, midGain: 3, postLowpass: 6500 },
  { drive: 0.4, preHighpass: 95, midFreq: 1400, midGain: 4, postLowpass: 6100 },
  { drive: 0.5, preHighpass: 100, midFreq: 1300, midGain: 4, postLowpass: 5900 },
  { drive: 0.6, preHighpass: 105, midFreq: 1700, midGain: 5, postLowpass: 5800 },
  { drive: 0.72, preHighpass: 120, midFreq: 1000, midGain: -1, postLowpass: 5400 },
  { drive: 0.85, preHighpass: 135, midFreq: 850, midGain: -3, postLowpass: 5100 },
];

interface CabProfile {
  highpass: number;
  lowpass: number;
  presenceFreq: number;
  presenceGain: number;
}

/**
 * Os 8 cabinets do pedal (posições 2 a 9 do knob; a posição 1 desliga a
 * simulação e é tratada antes de chegar aqui). Sem nome no aparelho, então
 * variam do menor/mais brilhante ao maior/mais grave.
 */
const CAB_PROFILES: CabProfile[] = [
  { highpass: 110, lowpass: 6000, presenceFreq: 3000, presenceGain: 4 },
  { highpass: 100, lowpass: 5600, presenceFreq: 2700, presenceGain: 3 },
  { highpass: 95, lowpass: 5200, presenceFreq: 2400, presenceGain: 3 },
  { highpass: 90, lowpass: 5000, presenceFreq: 2200, presenceGain: 3 },
  { highpass: 85, lowpass: 4800, presenceFreq: 2100, presenceGain: 2 },
  { highpass: 80, lowpass: 4600, presenceFreq: 2000, presenceGain: 2 },
  { highpass: 75, lowpass: 4400, presenceFreq: 2600, presenceGain: 4 },
  { highpass: 70, lowpass: 4200, presenceFreq: 1900, presenceGain: 2 },
];

/** As 5 posições da chave da Stratocaster. */
const PICKUP_PROFILES: Record<PickupPosition, { freq: number; gain: number; highpass: number }> = {
  ponte: { freq: 2200, gain: 4, highpass: 120 },
  "ponte+centro": { freq: 1700, gain: 2, highpass: 100 },
  centro: { freq: 800, gain: 1, highpass: 80 },
  "centro+braço": { freq: 650, gain: 2, highpass: 70 },
  braço: { freq: 350, gain: 4, highpass: 60 },
};

function clampIndex<T>(list: T[], index: number): T {
  return list[Math.max(0, Math.min(list.length - 1, Math.round(index)))];
}

/** Corda pulsada por Karplus-Strong: ruído num delay curto com realimentação. */
function createPluckBuffer(ctx: BaseAudioContext, frequency: number, seconds = 2.6) {
  const sampleRate = ctx.sampleRate;
  const period = Math.max(2, Math.round(sampleRate / frequency));
  const length = Math.floor(sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const output = buffer.getChannelData(0);
  const line = new Float32Array(period);

  // Ruído inicial suavizado — a palhetada real não tem tanto agudo solto.
  let smooth = 0;
  for (let i = 0; i < period; i++) {
    const noise = Math.random() * 2 - 1;
    smooth = smooth * 0.45 + noise * 0.55;
    line[i] = smooth;
  }

  // Cordas graves sustentam mais que as agudas, como numa guitarra de verdade.
  const damping = frequency < 150 ? 0.9975 : frequency < 350 ? 0.9968 : 0.996;
  let index = 0;
  let previous = 0;

  for (let i = 0; i < length; i++) {
    const current = line[index];
    line[index] = (current + previous) * 0.5 * damping;
    previous = current;
    output[i] = current;
    index = (index + 1) % period;
  }

  return buffer;
}

function createDistortionCurve(amount: number) {
  const samples = 2048;
  const curve = new Float32Array(samples);
  const k = amount * 120;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + k) * x * 0.35) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function createReverbImpulse(ctx: BaseAudioContext, seconds = 2.4, decay = 2.6) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = impulse.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

export interface Rig {
  input: GainNode;
  nodes: AudioNode[];
  stop: () => void;
}

/** Monta a cadeia de efeitos inteira a partir dos valores do preset. */
export function buildRig(ctx: BaseAudioContext, preset: Preset, destination: AudioNode): Rig {
  const { knobs, footswitches, guitar } = preset;
  const ampOn = footswitches.c;
  // A primeira posição do knob IR CAB desliga a simulação de gabinete.
  const cabOn = footswitches.a && Math.round(knobs.irCab) > 0;
  const reverbOn = footswitches.a;
  const timeBlockOn = footswitches.b;

  const nodes: AudioNode[] = [];
  const oscillators: OscillatorNode[] = [];

  const input = ctx.createGain();
  input.gain.value = 1;
  nodes.push(input);

  // --- Guitarra: knob de tone e posição da chave de captação ---
  const guitarTone = ctx.createBiquadFilter();
  guitarTone.type = "lowpass";
  guitarTone.frequency.value = 500 * Math.pow(24, guitar.toneKnob / 10);
  guitarTone.Q.value = 0.7;

  const pickupProfile = PICKUP_PROFILES[guitar.pickup];
  const pickupBody = ctx.createBiquadFilter();
  pickupBody.type = "peaking";
  pickupBody.frequency.value = pickupProfile.freq;
  pickupBody.gain.value = pickupProfile.gain;
  pickupBody.Q.value = 0.9;

  const pickupHighpass = ctx.createBiquadFilter();
  pickupHighpass.type = "highpass";
  pickupHighpass.frequency.value = pickupProfile.highpass;

  input.connect(guitarTone);
  guitarTone.connect(pickupBody);
  pickupBody.connect(pickupHighpass);
  nodes.push(guitarTone, pickupBody, pickupHighpass);

  // --- Amp: TYPE + GAIN + TONE ---
  const amp = clampIndex(AMP_PROFILES, knobs.type);
  let chain: AudioNode = pickupHighpass;

  if (ampOn) {
    const preHighpass = ctx.createBiquadFilter();
    preHighpass.type = "highpass";
    preHighpass.frequency.value = amp.preHighpass;

    const preGain = ctx.createGain();
    preGain.gain.value = 1 + (knobs.gain / 10) * 9 * (0.3 + amp.drive);

    const shaper = ctx.createWaveShaper();
    shaper.curve = createDistortionCurve(amp.drive * (0.35 + (knobs.gain / 10) * 1.1));
    shaper.oversample = "4x";

    const midEq = ctx.createBiquadFilter();
    midEq.type = "peaking";
    midEq.frequency.value = amp.midFreq;
    midEq.gain.value = amp.midGain;
    midEq.Q.value = 0.8;

    // Knob TONE do pedal: escurece ou abre o topo depois da distorção.
    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = "lowpass";
    toneFilter.frequency.value = 1400 * Math.pow(6, knobs.tone / 10);
    toneFilter.Q.value = 0.6;

    const postGain = ctx.createGain();
    postGain.gain.value = 0.32 / (1 + knobs.gain / 14);

    chain.connect(preHighpass);
    preHighpass.connect(preGain);
    preGain.connect(shaper);
    shaper.connect(midEq);
    midEq.connect(toneFilter);
    toneFilter.connect(postGain);
    chain = postGain;
    nodes.push(preHighpass, preGain, shaper, midEq, toneFilter, postGain);
  } else {
    // Sem o amp, o sinal seco passaria muito mais alto que o distorcido — a
    // distorção é compensada por postGain. Iguala os dois caminhos.
    const cleanGain = ctx.createGain();
    cleanGain.gain.value = 0.35;
    chain.connect(cleanGain);
    chain = cleanGain;
    nodes.push(cleanGain);
  }

  // --- Cabinet / IR ---
  if (cabOn) {
    const cab = clampIndex(CAB_PROFILES, Math.round(knobs.irCab) - 1);

    const cabHighpass = ctx.createBiquadFilter();
    cabHighpass.type = "highpass";
    cabHighpass.frequency.value = cab.highpass;

    const presence = ctx.createBiquadFilter();
    presence.type = "peaking";
    presence.frequency.value = cab.presenceFreq;
    presence.gain.value = cab.presenceGain;
    presence.Q.value = 1.1;

    // Dois lowpass em série para imitar a queda abrupta do alto-falante.
    const speakerA = ctx.createBiquadFilter();
    speakerA.type = "lowpass";
    speakerA.frequency.value = cab.lowpass;
    speakerA.Q.value = 0.7;

    const speakerB = ctx.createBiquadFilter();
    speakerB.type = "lowpass";
    speakerB.frequency.value = cab.lowpass * 1.15;
    speakerB.Q.value = 0.5;

    chain.connect(cabHighpass);
    cabHighpass.connect(presence);
    presence.connect(speakerA);
    speakerA.connect(speakerB);
    chain = speakerB;
    nodes.push(cabHighpass, presence, speakerA, speakerB);
  }

  // --- Bloco de tempo: modulação + delay ---
  const timeBus = ctx.createGain();
  chain.connect(timeBus);
  chain = timeBus;
  nodes.push(timeBus);

  if (timeBlockOn) {
    // MOD é um knob contínuo: centro desliga, esquerda é Chorus, direita é
    // Phaser, e a intensidade cresce conforme se afasta do centro.
    const modOffset = knobs.mod - MOD_CENTER;
    const modDepth = Math.min(1, Math.abs(modOffset) / MOD_CENTER);

    if (modDepth > 0.05) {
      const isPhaser = modOffset > 0;
      const modWet = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      if (isPhaser) {
        lfo.frequency.value = 0.4;
        lfoGain.gain.value = 900 * modDepth;
        let stage: AudioNode = timeBus;
        for (let i = 0; i < 4; i++) {
          const allpass = ctx.createBiquadFilter();
          allpass.type = "allpass";
          allpass.frequency.value = 500 + i * 400;
          allpass.Q.value = 0.6;
          lfoGain.connect(allpass.frequency);
          stage.connect(allpass);
          stage = allpass;
          nodes.push(allpass);
        }
        modWet.gain.value = 0.6 * modDepth;
        stage.connect(modWet);
      } else {
        const chorusDelay = ctx.createDelay(0.05);
        chorusDelay.delayTime.value = 0.018;
        lfo.frequency.value = 0.8;
        lfoGain.gain.value = 0.005 * modDepth;
        lfoGain.connect(chorusDelay.delayTime);
        timeBus.connect(chorusDelay);
        modWet.gain.value = 0.5 * modDepth;
        chorusDelay.connect(modWet);
        nodes.push(chorusDelay);
      }

      lfo.connect(lfoGain);
      lfo.start();
      oscillators.push(lfo);
      nodes.push(lfo, lfoGain, modWet);

      const modOut = ctx.createGain();
      timeBus.connect(modOut);
      modWet.connect(modOut);
      chain = modOut;
      nodes.push(modOut);
    }

    // Delay: TIME, FB e MIX
    const delay = ctx.createDelay(1.2);
    delay.delayTime.value = 0.06 + (knobs.time / 10) * 0.64;

    const feedback = ctx.createGain();
    feedback.gain.value = (knobs.fb / 10) * 0.68;

    const delayWet = ctx.createGain();
    delayWet.gain.value = (knobs.mix / 10) * 0.5;

    const delayOut = ctx.createGain();

    chain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(delayWet);
    chain.connect(delayOut);
    delayWet.connect(delayOut);
    chain = delayOut;
    nodes.push(delay, feedback, delayWet, delayOut);
  }

  // --- Reverb (faz parte do bloco do footswitch A) ---
  if (reverbOn && knobs.reverb > 0) {
    const convolver = ctx.createConvolver();
    convolver.buffer = createReverbImpulse(ctx);

    const reverbWet = ctx.createGain();
    reverbWet.gain.value = (knobs.reverb / 10) * 0.45;

    const reverbOut = ctx.createGain();

    chain.connect(convolver);
    convolver.connect(reverbWet);
    chain.connect(reverbOut);
    reverbWet.connect(reverbOut);
    chain = reverbOut;
    nodes.push(convolver, reverbWet, reverbOut);
  }

  // --- Volume e proteção de saída ---
  const master = ctx.createGain();
  master.gain.value = 0.15 + (knobs.volume / 10) * 0.75;

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -8;
  limiter.knee.value = 6;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.2;

  chain.connect(master);
  master.connect(limiter);
  limiter.connect(destination);
  nodes.push(master, limiter);

  return {
    input,
    nodes,
    stop: () => {
      oscillators.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // já parado
        }
      });
      nodes.forEach((node) => node.disconnect());
    },
  };
}

export class GuitarEngine {
  private ctx: AudioContext | null = null;
  private rig: Rig | null = null;
  private preset: Preset | null = null;
  private analyser: AnalyserNode | null = null;
  private levelBuffer: Float32Array<ArrayBuffer> | null = null;
  private buffers = new Map<number, AudioBuffer>();

  get ready() {
    return this.ctx !== null && this.ctx.state === "running";
  }

  async start() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.connect(this.ctx.destination);
      this.levelBuffer = new Float32Array(new ArrayBuffer(this.analyser.fftSize * 4));
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();
    if (this.preset) this.rebuild();
  }

  /** Nível RMS atual da saída, de 0 a 1 — alimenta o medidor da interface. */
  getLevel() {
    if (!this.analyser || !this.levelBuffer) return 0;
    this.analyser.getFloatTimeDomainData(this.levelBuffer);
    let sum = 0;
    for (let i = 0; i < this.levelBuffer.length; i++) {
      sum += this.levelBuffer[i] * this.levelBuffer[i];
    }
    return Math.sqrt(sum / this.levelBuffer.length);
  }

  setPreset(preset: Preset) {
    this.preset = preset;
    this.buffers.clear();
    if (this.ctx) this.rebuild();
  }

  private rebuild() {
    if (!this.ctx || !this.preset || !this.analyser) return;
    this.rig?.stop();
    this.rig = buildRig(this.ctx, this.preset, this.analyser);
  }

  pluck(midi: number) {
    if (!this.ctx || !this.rig) return;
    let buffer = this.buffers.get(midi);
    if (!buffer) {
      buffer = createPluckBuffer(this.ctx, midiToFrequency(midi));
      this.buffers.set(midi, buffer);
    }
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.rig.input);
    source.start();
    source.onended = () => source.disconnect();
  }

  dispose() {
    this.rig?.stop();
    this.rig = null;
    this.analyser?.disconnect();
    this.analyser = null;
    this.buffers.clear();
    void this.ctx?.close();
    this.ctx = null;
  }
}

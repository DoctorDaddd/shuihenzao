import { createScore, effectScore, type MusicScene, type Note, type SoundEffect, type Voice } from './adventure-score.ts';
import { recordedTrack } from './adventure-tracks.ts';

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();
const patches: Partial<Record<Voice, number[]>> = {
  flute: [1, .14, .07], bell: [1, .36, .12], harp: [1, .28, .1], pad: [1, .18],
  brass: [1, .35, .18, .07], organ: [1, .5, .25], bass: [1, .15],
};

// Shared by the live scheduler and offline audio verification; no remote samples.
export function scheduleNote(context: BaseAudioContext, destination: AudioNode, note: Note, time: number, secondsPerBeat = 1): AudioScheduledSourceNode[] {
  const duration = note.duration * secondsPerBeat;
  const envelope = context.createGain(), pan = context.createStereoPanner();
  const filter = context.createBiquadFilter();
  const percussion = ['kick', 'snare', 'hat'].includes(note.voice);
  const release = note.voice === 'pad' ? .45 : note.voice === 'bell' ? .42 : .08;
  const attack = note.voice === 'pad' ? .18 : note.voice === 'flute' ? .035 : .008;
  const end = time + duration + release;
  envelope.gain.setValueAtTime(0, time);
  envelope.gain.linearRampToValueAtTime(note.volume, time + Math.min(attack, duration / 3));
  envelope.gain.exponentialRampToValueAtTime(Math.max(.0001, note.volume * (percussion ? .015 : .45)), time + duration);
  envelope.gain.linearRampToValueAtTime(0, end);
  pan.pan.value = note.pan;
  filter.type = note.voice === 'hat' ? 'highpass' : note.voice === 'snare' ? 'bandpass' : 'lowpass';
  filter.frequency.value = note.voice === 'hat' ? 6500 : note.voice === 'snare' ? 1700 : note.voice === 'pad' ? 1100 : 4800;
  filter.Q.value = .6;
  filter.connect(envelope); envelope.connect(pan); pan.connect(destination);
  const sources: AudioScheduledSourceNode[] = [];
  if (note.voice === 'snare' || note.voice === 'hat') {
    let buffer = noiseBuffers.get(context);
    if (!buffer) {
      buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
      const samples = buffer.getChannelData(0);
      let seed = 731;
      for (let i = 0; i < samples.length; i++) { seed = (seed * 1664525 + 1013904223) >>> 0; samples[i] = seed / 2147483648 - 1; }
      noiseBuffers.set(context, buffer);
    }
    const source = context.createBufferSource(); source.buffer = buffer;
    source.connect(filter); sources.push(source);
  } else {
    const frequency = 440 * 2 ** ((note.pitch - 69) / 12);
    for (const [i, weight] of (patches[note.voice] ?? [1]).entries()) {
      const oscillator = context.createOscillator(), partial = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(note.voice === 'kick' ? 125 : frequency * (i + 1), time);
      if (note.voice === 'kick') oscillator.frequency.exponentialRampToValueAtTime(42, time + .16);
      if (note.voice === 'bell' && i === 1) oscillator.frequency.setValueAtTime(frequency * 2.01, time);
      partial.gain.value = weight;
      oscillator.connect(partial); partial.connect(filter); sources.push(oscillator);
      oscillator.addEventListener('ended', () => partial.disconnect(), { once: true });
    }
  }
  let remaining = sources.length;
  for (const source of sources) {
    source.addEventListener('ended', () => {
      source.disconnect();
      if (--remaining === 0) { filter.disconnect(); envelope.disconnect(); pan.disconnect(); }
    }, { once: true });
    source.start(time); source.stop(end);
  }
  return sources;
}

type AudioStatus = 'off' | 'ready' | 'loading' | 'playing' | 'paused' | 'error';
type AudioSnapshot = { enabled: boolean; musicVolume: number; effectsVolume: number; status: AudioStatus; message: string; scene: MusicScene };
type TrackBase = { gain: GainNode; cleanup?: ReturnType<typeof setTimeout> };
type SynthTrack = TrackBase & { kind: 'score'; score: ReturnType<typeof createScore>; start: number; index: number; cycle: number; sources: Set<AudioScheduledSourceNode> };
type FileTrack = TrackBase & { kind: 'file'; src: string; media: HTMLAudioElement; source: MediaElementAudioSourceNode; onError: () => void };
type Track = SynthTrack | FileTrack;
export class AdventureAudio {
  private context: AudioContext | null = null;
  private music: GainNode | null = null;
  private effects: GainNode | null = null;
  private current: Track | null = null;
  private tracks = new Set<Track>();
  private effectSources = new Set<AudioScheduledSourceNode>();
  private timer: ReturnType<typeof setInterval> | null = null;
  private hidden = false;
  private pausing: Promise<void> | null = null;
  private pausedFile: { src: string; time: number } | null = null;
  private listeners = new Set<() => void>();
  private snapshot: AudioSnapshot = { enabled: false, musicVolume: 35, effectsVolume: 60, status: 'off', message: '', scene: { chapter: 0, intense: false } };
  private createContext: () => AudioContext;
  private createMedia: () => HTMLAudioElement;
  constructor(createContext: () => AudioContext = () => new AudioContext(), createMedia: () => HTMLAudioElement = () => new Audio()) {
    this.createContext = createContext; this.createMedia = createMedia;
  }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  getSnapshot = () => this.snapshot;
  private update(values: Partial<AudioSnapshot>) { this.snapshot = { ...this.snapshot, ...values }; this.listeners.forEach(listener => listener()); }
  preferenceError(error: unknown) {
    console.warn('audio_preferences_unavailable', error);
    this.update({ message: '当前浏览器无法保存声音偏好，本次仍可调整声音。' });
  }
  private fail = (error: unknown) => {
    console.error('adventure_audio_failed', error);
    this.stopMusic();
    this.update({ status: 'error', message: '声音暂时无法播放，请点击声音按钮重试。' });
  };
  configure(enabled: boolean, musicVolume: number, effectsVolume: number) {
    this.update({ enabled, status: enabled ? 'ready' : 'off' });
    this.setVolume('musicVolume', musicVolume); this.setVolume('effectsVolume', effectsVolume);
  }
  setVolume(kind: 'musicVolume' | 'effectsVolume', value: number) {
    const volume = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
    this.update({ [kind]: volume });
    const gain = kind === 'musicVolume' ? this.music : this.effects;
    if (gain && this.context) {
      gain.gain.cancelScheduledValues(this.context.currentTime);
      gain.gain.setTargetAtTime(volume / 100, this.context.currentTime, .04);
    }
  }
  setEnabled = (enabled: boolean) => {
    this.update({ enabled, status: enabled ? 'ready' : 'off', message: '' });
    if (enabled) void this.unlock(); else this.pause();
  };
  // Called synchronously from a real click/key gesture, before any API awaits.
  unlock = async () => {
    if (!this.snapshot.enabled || this.hidden) return;
    try {
      if (!this.context) {
        const context = this.createContext();
        this.context = context;
        this.music = context.createGain(); this.effects = context.createGain();
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -12; compressor.knee.value = 12; compressor.ratio.value = 4;
        this.music.gain.value = this.snapshot.musicVolume / 100;
        this.effects.gain.value = this.snapshot.effectsVolume / 100;
        this.music.connect(compressor); this.effects.connect(compressor); compressor.connect(context.destination);
        context.addEventListener('statechange', () => {
          if (context !== this.context) return;
          if (context.state !== 'running') { this.stopMusic(); this.update({ status: this.snapshot.enabled ? 'paused' : 'off' }); }
          else if (this.snapshot.enabled && !this.hidden) this.startMusic();
        });
      }
      const context = this.context;
      if (this.pausing) await this.pausing;
      if (context !== this.context || !this.snapshot.enabled || this.hidden) return;
      if (context.state !== 'running') await context.resume();
      if (this.context === context && this.snapshot.enabled && !this.hidden && context.state === 'running') this.startMusic();
    } catch (error) { this.fail(error); }
  };
  setScene = (scene: MusicScene) => {
    if (scene.chapter === this.snapshot.scene.chapter && scene.intense === this.snapshot.scene.intense) return;
    this.update({ scene });
    this.pausedFile = null;
    if (this.current) this.retire(this.current, .8);
    this.current = null;
    if (this.context?.state === 'running' && this.snapshot.enabled && !this.hidden) this.startMusic();
  };
  setHidden(hidden: boolean) { this.hidden = hidden; if (hidden) this.pause(); else if (this.context && this.snapshot.enabled) void this.unlock(); }
  private pause() {
    if (this.current?.kind === 'file') this.pausedFile = { src: this.current.src, time: this.current.media.currentTime };
    this.stopMusic();
    for (const source of this.effectSources) source.stop();
    this.effectSources.clear();
    this.update({ status: this.snapshot.enabled ? 'paused' : 'off' });
    if (this.context?.state === 'running') {
      this.pausing = this.context.suspend().catch(this.fail).finally(() => { this.pausing = null; });
    }
  }
  private startMusic() {
    if (!this.context || !this.music || this.current) return;
    const recording = recordedTrack(this.snapshot.scene);
    if (recording) {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      const gain = this.context.createGain(), media = this.createMedia();
      gain.gain.value = 0; gain.connect(this.music);
      media.preload = 'none'; media.loop = true; media.src = recording.src;
      if (this.pausedFile?.src === recording.src) media.currentTime = this.pausedFile.time;
      const source = this.context.createMediaElementSource(media);
      source.connect(gain);
      const track: FileTrack = { kind: 'file', src: recording.src, media, source, gain, onError: () => {
        if (this.current === track) this.fail(new Error(`BGM load failed (${media.error?.code ?? 'unknown'}): ${recording.src}`));
      } };
      media.addEventListener('error', track.onError);
      this.current = track; this.tracks.add(track);
      this.update({ status: 'loading', message: '' });
      void media.play().then(() => {
        if (this.current !== track || !this.context || !this.snapshot.enabled || this.hidden) return;
        const now = this.context.currentTime;
        gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(1, now + 1.2);
        this.update({ status: 'playing', message: '' });
      }).catch(error => { if (this.current === track) this.fail(error); });
      return;
    }
    const gain = this.context.createGain(), start = this.context.currentTime + .035;
    gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(1, start + 1.2); gain.connect(this.music);
    this.current = { kind: 'score', gain, score: createScore(this.snapshot.scene), start, index: 0, cycle: 0, sources: new Set() };
    this.tracks.add(this.current);
    this.update({ status: 'playing', message: '' });
    this.tick();
    if (!this.timer) this.timer = setInterval(this.tick, 100);
  }
  private tick = () => {
    const context = this.context, track = this.current;
    if (!context || context.state !== 'running' || !track || track.kind !== 'score') return;
    const seconds = 60 / track.score.bpm;
    // If the main thread stalled, restart a phrase instead of playing a backlog.
    if (track.start + (track.cycle * track.score.beats + track.score.notes[track.index].beat) * seconds < context.currentTime - .25) {
      track.start = context.currentTime + .035; track.index = 0; track.cycle = 0;
    }
    while (true) {
      const note = track.score.notes[track.index];
      const time = track.start + (track.cycle * track.score.beats + note.beat) * seconds;
      if (time > context.currentTime + .25) break;
      this.watch(scheduleNote(context, track.gain, note, Math.max(time, context.currentTime), seconds), track.sources);
      if (++track.index === track.score.notes.length) { track.index = 0; track.cycle++; }
    }
  };
  private watch(sources: AudioScheduledSourceNode[], set: Set<AudioScheduledSourceNode>) {
    for (const source of sources) { set.add(source); source.addEventListener('ended', () => set.delete(source), { once: true }); }
  }
  private retire(track: Track, fade: number) {
    if (track.cleanup) clearTimeout(track.cleanup);
    const now = this.context?.currentTime ?? 0;
    if (fade) {
      // Only the current track fades out; rapid navigation cannot pile up tails.
      for (const other of this.tracks) if (other !== track) this.retire(other, 0);
      const level = track.gain.gain.value;
      track.gain.gain.cancelScheduledValues(now);
      track.gain.gain.setValueAtTime(level, now);
      track.gain.gain.setTargetAtTime(0, now, fade / 4);
      track.cleanup = setTimeout(() => this.retire(track, 0), fade * 1000);
    } else {
      if (track.kind === 'file') {
        track.media.removeEventListener('error', track.onError);
        track.media.pause(); track.media.removeAttribute('src'); track.media.load();
        track.source.disconnect();
      } else {
        for (const source of track.sources) source.stop();
        track.sources.clear();
      }
      track.gain.disconnect(); this.tracks.delete(track);
    }
  }
  private stopMusic() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null; this.current = null;
    for (const track of this.tracks) this.retire(track, 0);
  }
  play = (effect: SoundEffect) => {
    if (!this.snapshot.enabled || this.hidden || this.context?.state !== 'running' || !this.effects) return;
    const now = this.context.currentTime;
    if (effect !== 'select' && this.music) {
      this.music.gain.cancelScheduledValues(now);
      this.music.gain.setTargetAtTime(this.snapshot.musicVolume / 100 * .4, now, .035);
      this.music.gain.setTargetAtTime(this.snapshot.musicVolume / 100, now + (effect === 'victory' ? 2 : 1), .3);
    }
    const sources = effectScore(effect).flatMap(note => scheduleNote(this.context!, this.effects!, note, now + note.beat));
    this.watch(sources, this.effectSources);
    return () => {
      for (const source of sources) if (this.effectSources.has(source)) { source.stop(); this.effectSources.delete(source); }
      if (effect !== 'select' && this.music && this.context) {
        const time = this.context.currentTime;
        this.music.gain.cancelScheduledValues(time);
        this.music.gain.setTargetAtTime(this.snapshot.musicVolume / 100, time, .15);
      }
    };
  };
  dispose() {
    this.stopMusic(); this.effectSources.clear();
    const context = this.context;
    this.context = null; this.music = null; this.effects = null;
    if (context && context.state !== 'closed') void context.close().catch(this.fail);
  }
}

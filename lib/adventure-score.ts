// Original 16-bar themes. Pitches are MIDI notes; timing is in quarter-note beats.
export type Voice = 'flute' | 'bell' | 'harp' | 'pad' | 'brass' | 'organ' | 'bass' | 'kick' | 'snare' | 'hat';
export type SoundEffect = 'select' | 'save' | 'chest' | 'letter' | 'victory' | 'guardian-rise' | 'guardian-reveal';
export type PlaySound = (effect: SoundEffect) => void | (() => void);
export type MusicScene = { chapter: number; intense: boolean };
export type Note = { beat: number; pitch: number; duration: number; voice: Voice; volume: number; pan: number };
export const THEMES = [
  { name: '风起的画笺', mood: '草原 · 木笛与拨弦', root: 62, scale: [0, 2, 4, 5, 7, 9, 11], chords: [0, 3, 5, 4, 0, 5, 3, 4], calm: 84, intense: 132, lead: 'flute', counter: 'harp',
    melody: [[2, 4, 5, 4, 2, 1], [0, 2, 3, 5, 4, 2], [5, 7, 6, 5, 4, 2], [1, 4, 3, 2, 1, -1], [4, 5, 7, 6, 4, 2], [5, 4, 2, 0, 2, 4], [3, 5, 4, 2, 1, 0], [1, 2, 4, 3, 1, 0]] },
  { name: '雾间萤火', mood: '森林 · 空灵钟音', root: 57, scale: [0, 2, 3, 5, 7, 9, 10], chords: [0, 3, 6, 0, 5, 3, 1, 4], calm: 72, intense: 124, lead: 'bell', counter: 'flute',
    melody: [[4, 2, 0, 1, 2, 4], [5, 3, 2, 1, 0, -1], [6, 4, 3, 2, 1, 3], [4, 7, 6, 4, 2, 0], [5, 7, 4, 5, 3, 2], [3, 5, 2, 3, 1, 0], [1, 3, 4, 6, 5, 3], [4, 3, 1, 2, 1, 0]] },
  { name: '砂中的星盘', mood: '遗迹 · 竖琴与低鸣', root: 64, scale: [0, 2, 3, 5, 7, 8, 11], chords: [0, 5, 3, 4, 0, 2, 5, 4], calm: 76, intense: 138, lead: 'harp', counter: 'bell',
    melody: [[0, 4, 3, 2, 1, 0], [5, 4, 2, 1, 0, -1], [3, 2, 5, 4, 3, 1], [4, 6, 7, 6, 4, 1], [7, 6, 4, 3, 2, 0], [2, 4, 6, 5, 4, 2], [5, 3, 2, 1, 0, -1], [1, 4, 6, 4, 1, 0]] },
  { name: '雪光与远行', mood: '雪山 · 钢片琴与长音', root: 58, scale: [0, 2, 4, 5, 7, 9, 11], chords: [0, 4, 5, 3, 0, 2, 3, 4], calm: 66, intense: 118, lead: 'bell', counter: 'harp',
    melody: [[7, 4, 5, 4, 2, 0], [6, 4, 3, 2, 1, -1], [5, 7, 4, 2, 0, 2], [3, 5, 7, 5, 4, 2], [7, 9, 8, 7, 5, 4], [6, 4, 2, 4, 3, 1], [5, 3, 2, 0, 1, 3], [4, 6, 4, 3, 1, 0]] },
  { name: '终章的誓约', mood: '城堡 · 管风琴与铜管', root: 60, scale: [0, 2, 3, 5, 7, 8, 10], chords: [0, 5, 3, 4, 0, 6, 5, 4], calm: 88, intense: 148, lead: 'organ', counter: 'brass',
    melody: [[0, 4, 7, 6, 4, 3], [5, 7, 6, 5, 4, 2], [3, 5, 7, 8, 7, 5], [4, 6, 7, 6, 4, 1], [7, 9, 7, 6, 4, 3], [6, 8, 7, 6, 5, 3], [5, 7, 5, 3, 2, 0], [1, 4, 6, 7, 4, 0]] },
] as const;

export function musicScene(chapter: number, node: number): MusicScene {
  const bounded = Math.max(0, Math.min(4, Math.trunc(chapter)));
  return { chapter: bounded, intense: node - bounded * 5 >= 4 };
}

export function createScore(scene: MusicScene) {
  const theme = THEMES[scene.chapter];
  const notes: Note[] = [];
  const pitch = (degree: number) => theme.root + theme.scale[((degree % 7) + 7) % 7] + Math.floor(degree / 7) * 12;
  const add = (beat: number, midi: number, duration: number, voice: Voice, volume: number, pan = 0) => notes.push({ beat, pitch: midi, duration, voice, volume, pan });
  for (let bar = 0; bar < 16; bar++) {
    const start = bar * 4, chord = theme.chords[bar % 8], strong = scene.intense;
    // The second eight bars answer the first phrase with a higher countermelody.
    const melody = theme.melody[bar % 8];
    const timing = scene.chapter === 3 && !strong ? [0, 1, 1.5, 2, 3, 3.5] : [0, .5, 1.5, 2, 2.5, 3];
    melody.forEach((degree, i) => {
      const duration = (timing[i + 1] ?? 4) - timing[i];
      add(start + timing[i], pitch(degree) + 12, duration * .85, strong ? (scene.chapter === 4 ? 'brass' : theme.lead) : theme.lead, strong ? .105 : .09, -.12);
    });
    for (const degree of [chord, chord + 2, chord + 4]) add(start, pitch(degree) - 12, 3.8, 'pad', .021, (degree - chord - 2) * .22);
    const steps = strong ? 8 : 4;
    for (let i = 0; i < steps; i++) {
      add(start + i * 4 / steps, pitch(chord + [0, 2, 4, 2, 7, 4, 2, 4][i]), strong ? .3 : .6, 'harp', strong ? .042 : .029, .4);
      if (strong || i % 2 === 0) add(start + i * 4 / steps, pitch(chord) - 24 + (i % 4 === 2 ? 7 : 0), strong ? .28 : 1.5, 'bass', strong ? .115 : .075);
    }
    if (bar >= 8) for (const beat of [1, 3]) add(start + beat, pitch(melody[beat === 1 ? 1 : 4]) + 19, .55, theme.counter, .025, .5);
    if (strong) {
      for (const beat of [0, 1.5, 2, 3.5]) add(start + beat, 36, .25, 'kick', .22);
      for (const beat of [1, 3]) add(start + beat, 48, .16, 'snare', .07, -.1);
      for (let i = 0; i < 8; i++) add(start + i / 2, 80, .055, 'hat', i % 2 ? .035 : .024, .3);
      if (bar % 4 === 3) for (const beat of [3.25, 3.75]) add(start + beat, 48, .12, 'snare', .045, -.1);
    } else if (scene.chapter !== 3) {
      for (const beat of [0, 2]) add(start + beat, 36, .2, 'kick', .055);
      for (const beat of [1, 3]) add(start + beat, 80, .04, 'hat', .012, .3);
    }
  }
  return { notes: notes.sort((a, b) => a.beat - b.beat), beats: 64, bpm: scene.intense ? theme.intense : theme.calm };
}

export function effectScore(effect: SoundEffect): Note[] {
  if (effect === 'guardian-rise') return [
    { beat: 0, pitch: 29, duration: 1.6, voice: 'bass', volume: .12, pan: 0 },
    { beat: .3, pitch: 41, duration: 1.4, voice: 'pad', volume: .055, pan: -.25 },
    { beat: .9, pitch: 48, duration: 1.2, voice: 'pad', volume: .05, pan: .25 },
    { beat: .5, pitch: 80, duration: .5, voice: 'hat', volume: .016, pan: -.4 },
    { beat: 1.1, pitch: 80, duration: .6, voice: 'hat', volume: .022, pan: .4 },
  ];
  if (effect === 'guardian-reveal') return [
    { beat: 0, pitch: 36, duration: .3, voice: 'kick', volume: .18, pan: 0 },
    ...[38, 45, 50].map(pitch => ({ beat: .06, pitch, duration: .9, voice: 'brass' as const, volume: .065, pan: 0 })),
    { beat: .2, pitch: 74, duration: .65, voice: 'bell', volume: .04, pan: .2 },
  ];
  const phrases = {
    select: [76, 81], save: [62, 66, 69, 74], chest: [74, 78, 81, 86, 81, 86],
    letter: [81, 78, 74], victory: [62, 62, 69, 74, 73, 74, 78, 81, 86],
  };
  const interval = effect === 'select' ? .045 : effect === 'victory' ? .16 : .1;
  return phrases[effect].map((pitch, i) => ({ beat: i * interval, pitch, duration: effect === 'select' ? .08 : i === phrases[effect].length - 1 ? .75 : .22,
    voice: effect === 'victory' ? 'brass' : 'bell', volume: effect === 'select' ? .07 : .11, pan: 0 }));
}

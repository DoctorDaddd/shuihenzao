import { THEMES, type MusicScene } from './adventure-score.ts';

export type RecordedTrack = { name: string; src: string };

// Same-origin files are loaded only when their scene starts after a user gesture.
// Unspecified scenes retain their original synthesized score.
export const RECORDED_TRACKS: readonly { calm: RecordedTrack | null; intense: RecordedTrack | null }[] = [
  { calm: { name: '堕天せし者 — THE PRIMALS', src: '/audio/garuda.6824b64cb5c7.mp3' }, intense: { name: 'Orchestral：究極幻想 — 祖堅正慶', src: '/audio/ultima.7fcd44c4e7f7.mp3' } },
  { calm: null, intense: { name: 'Answers — Susan Calloway', src: '/audio/answers.3a54a6166a64.mp3' } },
  { calm: { name: 'ローカス — THE PRIMALS', src: '/audio/locus.0cb385c04bf3.mp3' }, intense: { name: 'ライズ — THE PRIMALS', src: '/audio/rise.ee6e598b8733.mp3' } },
  { calm: { name: '闘争 — 祖堅正慶', src: '/audio/struggle.388397f73e8c.mp3' }, intense: { name: 'Orchestral：逆襲の咆哮 — 祖堅正慶', src: '/audio/thordan.c5b3d9bf24b0.mp3' } },
  { calm: null, intense: null },
];

export function recordedTrack(scene: MusicScene) {
  return RECORDED_TRACKS[scene.chapter][scene.intense ? 'intense' : 'calm'];
}

export function musicName(scene: MusicScene) {
  return recordedTrack(scene)?.name ?? THEMES[scene.chapter].name;
}

import { type CSSProperties } from 'react';
import { GUARDIAN_ART } from '../lib/guardian-art';

export default function GuardianPortrait({ chapter }: { chapter: number }) {
  const art = GUARDIAN_ART[chapter];
  return <div className={'guardian-portrait guardian-art-' + chapter} style={{
    '--art-ratio': art.width / art.height,
  } as CSSProperties}>
    <img src={'/bosses/' + art.file + '-battle.webp'} width={art.width} height={art.height}
      alt={art.alt} draggable={false} />
  </div>;
}

"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import { HeroParty } from "./PixelWorld";
import GuardianPortrait from "./GuardianPortrait";
import { GUARDIAN_INTROS } from "../lib/guardian-intro";
import { GUARDIAN_ART } from "../lib/guardian-art";
import { GUARDIANS, type HeroCosmetics } from "../lib/quest";
import type { PlaySound } from "../lib/adventure-score";

export default function GuardianIntro({ chapter, reduced, onClose, onSoundEffect, preview = false, cosmetics }: {
  chapter: number; reduced: boolean; onClose: () => void; onSoundEffect: PlaySound; preview?: boolean; cosmetics?: HeroCosmetics;
}) {
  const scene = GUARDIAN_INTROS[chapter];
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current!;
    const focusBefore = document.activeElement;
    element.showModal();
    const stopRise = onSoundEffect(reduced ? 'guardian-reveal' : 'guardian-rise');
    let stopReveal: ReturnType<PlaySound>;
    const reveal = reduced ? null : setTimeout(() => { stopReveal = onSoundEffect('guardian-reveal'); }, scene.reveal);
    return () => {
      if (reveal) clearTimeout(reveal);
      if (typeof stopRise === 'function') stopRise();
      if (typeof stopReveal === 'function') stopReveal();
      element.close();
      if (focusBefore instanceof HTMLElement && focusBefore.isConnected) focusBefore.focus();
    };
  }, [chapter, reduced, onSoundEffect, scene.reveal]);
  return <dialog ref={dialog} className={`guardian-intro intro-${scene.theme} ${reduced ? 'intro-reduced' : ''}`} style={{ '--intro-duration': `${scene.duration}ms`, '--art-ratio': GUARDIAN_ART[chapter].width / GUARDIAN_ART[chapter].height } as CSSProperties} aria-labelledby="guardian-intro-title" aria-describedby="guardian-intro-dismiss"
    onClick={onClose}
    onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="intro-frame">
      <div className="intro-backdrop" aria-hidden="true">
        {chapter === 0 && <div className="intro-distant-fort"><i /><i /><i /><i /><i /></div>}
        {chapter === 1 && <><div className="intro-moon" /><div className="intro-flare" />{Array.from({ length: 9 }, (_, i) => <i className="intro-meteor" key={i} style={{ left: `${8 + i * 11}%`, '--effect-delay': `${i * .12}s` } as CSSProperties} />)}</>}
        {chapter === 2 && <div className="intro-clock"><div className="intro-clock-hand" /><div className="intro-clock-hand short" />{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ transform: `rotate(${i * 30}deg)` }} />)}</div>}
        {chapter === 3 && <div className="intro-cathedral" />}
        {chapter === 4 && <><div className="intro-rift" /><div className="intro-scan" /><div className="intro-orbit" /></>}
      </div>
      <div className="intro-camera" aria-hidden="true">
        <GuardianPortrait chapter={chapter} />
        <div className="intro-scale-hero"><HeroParty level={chapter} cosmetics={cosmetics} /></div>
        <div className="intro-ground" />
      </div>
      {chapter === 0 && <><div className="intro-reactor" aria-hidden="true" /><div className="intro-impact" aria-hidden="true"><i /><i /></div></>}
      {chapter === 1 && <div className="intro-roar" aria-hidden="true"><i /><i /></div>}
      {chapter === 2 && <div className="intro-time-seal" aria-hidden="true" />}
      {chapter === 3 && <div className="intro-sword-light" aria-hidden="true"><i className="intro-slash slash-left" /><i className="intro-slash slash-right" /></div>}
      {chapter === 4 && <div className="intro-rift-gate" aria-hidden="true" />}
      <div className="intro-cut-flash" aria-hidden="true" />
      <div className="intro-cue" aria-hidden="true">{scene.cue}</div>
      <div className="intro-clouds intro-clouds-far" aria-hidden="true"><i /><i /><i /></div>
      <div className="intro-clouds intro-clouds-near" aria-hidden="true"><i /><i /><i /></div>
      <div className="intro-embers" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ left: `${8 + (i * 29) % 85}%`, '--effect-delay': `${i * .09}s` } as CSSProperties} />)}</div>
      <div className="intro-letterbox top" aria-hidden="true" /><div className="intro-letterbox bottom" aria-hidden="true" />
      <span className="intro-location">{scene.location}{preview ? ' · 预览' : ''}</span>
      <button autoFocus className="intro-skip">关闭演出 <span aria-hidden="true">›</span></button>
      <p className="intro-dismiss" id="guardian-intro-dismiss">点击任意位置关闭 · Esc 返回</p>
      <div className="intro-title">
        <span>{scene.english}</span>
        <h2 id="guardian-intro-title">{GUARDIANS[chapter].name}</h2>
        <p>{scene.line}</p>
      </div>
      <span className="intro-progress" aria-hidden="true" />
    </div>
  </dialog>;
}

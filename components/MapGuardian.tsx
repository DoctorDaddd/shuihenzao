"use client";
import { GUARDIANS } from "../lib/quest";
import GuardianPortrait from "./GuardianPortrait";

export default function MapGuardian({ chapter, onReplay }: { chapter: number; onReplay?: () => void }) {
  return <div className={`map-guardian guardian-${chapter} guardian-colossus`}>
    <GuardianPortrait chapter={chapter} />
    <span className="guardian-name"><i style={{ background: GUARDIANS[chapter].color }} />{GUARDIANS[chapter].name}</span>
    {onReplay && <button className="guardian-replay" onClick={onReplay} aria-label={`重看${GUARDIANS[chapter].name}登场`}>重看登场 <span aria-hidden="true">›</span></button>}
  </div>;
}

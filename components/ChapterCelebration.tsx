"use client";
import type { CSSProperties } from "react";
import { CHAPTERS, CHAPTER_TITLES, CHAPTER_PRIZES, GUARDIANS, earnedCosmetics, type HeroCosmetics } from "../lib/quest";
import { HeroParty } from "./PixelWorld";
import HeroTitles from "./HeroTitles";
import { VictoryFireworks } from "./HeroRewards";

export default function ChapterCelebration({ chapter, preview = false, titles = CHAPTER_TITLES.slice(0, chapter + 1), cosmetics }: { chapter: number; preview?: boolean; titles?: readonly string[]; cosmetics?: HeroCosmetics }) {
  const appearance = preview ? earnedCosmetics(CHAPTER_PRIZES.slice(0, chapter + 1).map(p => ({ node: p.node, unlocked_at: "preview" }))) : cosmetics;
  return (
    <div className={`chapter-victory ${chapter === 4 ? "chapter-victory-final" : ""}`} style={{ "--victory-color": GUARDIANS[chapter].color } as CSSProperties}>
      {preview && <span className="victory-preview">管理员特效预览 · 不计入进度</span>}
      <div className="victory-stage">
        {chapter === 4 && <VictoryFireworks />}
        <div className="victory-ring" aria-hidden="true" />
        <div className="victory-ring second" aria-hidden="true" />
        <div className="victory-particles" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <i key={i} style={{ "--angle": `${i * 15}deg`, "--delay": `${i % 6 * .12}s`, "--distance": `${82 + i % 4 * 17}px` } as CSSProperties} />
          ))}
        </div>
        <div className="victory-hero"><HeroTitles titles={titles} /><HeroParty level={chapter} cosmetics={appearance} /></div>
      </div>
      <span className="victory-heading">CHAPTER CLEAR</span>
      <h2>{CHAPTERS[chapter].name} · 通关</h2>
      <p className="victory-boss">突破了{GUARDIANS[chapter].name}的镇守</p>
      <p className="victory-title">{preview ? "称号预览" : "踏破称号"} · 《{CHAPTER_TITLES[chapter]}》</p>
      <p className="victory-prize">{CHAPTER_PRIZES[chapter].message}</p>
      <strong>{preview ? "五章风景，随心预览" : chapter === 4 ? "25 / 25 · 冒险圆满" : `${(chapter + 1) * 5} / 25 · 足迹已珍藏`}</strong>
      <p>{preview ? "角色移动和庆祝仅在本次预览中生效。" : chapter === 4 ? "二十五次落笔，让这个世界完整。谢谢你走到这里。" : "这一章的五幅作品，都成为了照亮下一段旅程的光。"}</p>
    </div>
  );
}

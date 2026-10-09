"use client";
import { useEffect, useRef, useState } from "react";
import { CHAPTERS, CHAPTER_TITLES, GUARDIANS, REWARD_STAGES, chapterFor, completedChapter } from "../lib/quest";
import PixelWorld from "./PixelWorld";
import ChapterCelebration from "./ChapterCelebration";
import Modal from "./Modal";

export default function AdminMapPreview({ count }: { count: number }) {
  const [node, setNode] = useState(Math.max(1, Math.min(25, count)));
  const [celebration, setCelebration] = useState<number | null>(null);
  const [moving, setMoving] = useState(false);
  const motionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (motionTimer.current) clearTimeout(motionTimer.current); }, []);
  const chapter = chapterFor(node);
  function moveTo(next: number) {
    setNode(next);
    setMoving(true);
    if (motionTimer.current) clearTimeout(motionTimer.current);
    motionTimer.current = setTimeout(() => setMoving(false), 850);
    setCelebration(completedChapter(next));
  }
  return (
    <section className="paper-panel admin-wide admin-map-preview">
      <div className="section-heading"><h2>勇者动效预览</h2><span className="pill">仅管理员可见</span></div>
      <p className="muted">点击任意节点移动绘灵法师，按所在节点预览累计称号，抵达各章最后一格时播放通关庆祝。这里的移动不改变作品、奖励或共享进度。</p>
      <div className="preview-controls">
        <label>预览地图<select value={chapter} onChange={e => moveTo(Number(e.target.value) * 5 + 1)}>
          {CHAPTERS.map((c, i) => <option key={c.name} value={i}>{c.name}</option>)}
        </select></label>
        <button className="secondary" disabled={node === 1} onClick={() => moveTo(node - 1)}>上一步</button>
        <button className="secondary" disabled={node === 25} onClick={() => moveTo(node + 1)}>下一步</button>
        <button className="primary" onClick={() => setCelebration(chapter)}>播放本章通关特效</button>
        <button className="text-button" onClick={() => { setNode(Math.max(1, Math.min(25, count))); setCelebration(null); }}>回到实际位置</button>
      </div>
      <p className="preview-position" role="status">预览位置：第 {node} 格 · {GUARDIANS[chapter].name}镇守　/　实际进度：{count}/25</p>
      <PixelWorld key={node} chapter={chapter} count={count} artworks={[]} rewardNodes={REWARD_STAGES.map(r => r.node)}
        previewNode={node} titles={CHAPTER_TITLES.slice(0, Math.floor(node / 5))} moving={moving} onNode={moveTo} onHover={() => {}} onLeave={() => {}} />
      {celebration !== null && <Modal title="章节通关特效预览" onClose={() => setCelebration(null)}>
        <ChapterCelebration chapter={celebration} preview />
        <div className="modal-actions"><button className="primary" onClick={() => setCelebration(null)}>返回预览地图</button></div>
      </Modal>}
    </section>
  );
}

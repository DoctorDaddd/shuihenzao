"use client";
import { useEffect, useState } from "react";
import { Hourglass } from "lucide-react";
import { QUEST_ENDS_AT, questCountdown } from "../lib/quest";

export default function QuestCountdown({ count }: { count: number | null }) {
  const [now, setNow] = useState<number | null>(null);
  const complete = count !== null && count >= 25;
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (!complete && current < QUEST_ENDS_AT) timer = setTimeout(tick, 1000);
    };
    tick();
    return () => clearTimeout(timer);
  }, [complete]);

  const clock = now === null ? null : questCountdown(now, count);
  const phase = clock?.phase ?? "loading";
  const remaining = count === null ? null : Math.max(0, 25 - count);
  const message = phase === "complete" ? "25 幅作品已集齐，终章因你而闪耀。"
    : phase === "expired" ? "约定时间已到，冒险仍可继续。"
    : phase === "urgent" ? "最后 24 小时！向终章发起冲刺。"
    : phase === "soon" ? "最后 7 天，终章冲刺开始！"
    : "每落下一笔，就离终章更近一步。";

  return (
    <section className={`quest-countdown countdown-${phase}`} aria-label="终章之约">
      <div className="deadline-copy">
        <h2><Hourglass size={18} aria-hidden="true" />终章之约</h2>
        <time dateTime="2026-11-07T23:59:59+08:00">2026.11.07 截止 · 北京时间 23:59</time>
      </div>
      {phase === "complete" ? <strong className="deadline-complete">终章已达成</strong> : (
        <div className="deadline-clock" role="timer" aria-live="off" aria-label="距终章约定剩余时间">
          {(["天", "时", "分", "秒"] as const).map((unit, i) => (
            <span key={unit}>
              <b>{clock ? String([clock.days, clock.hours, clock.minutes, clock.seconds][i]).padStart(2, "0") : "--"}</b>
              <small>{unit}</small>
            </span>
          ))}
        </div>
      )}
      <p className="deadline-message" role="status">
        {remaining !== null && remaining > 0 && <strong>还差 {remaining} 幅作品</strong>}
        <span>{message}</span>
      </p>
    </section>
  );
}

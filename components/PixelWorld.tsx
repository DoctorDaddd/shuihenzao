"use client";
import type { CSSProperties } from "react";
import type { Artwork } from "../lib/quest";
import { CHAPTERS } from "../lib/quest";
import ChapterScenery, { WORLD_LAYOUTS } from "./ChapterScenery";
import MapGuardian from "./MapGuardian";
import HeroTitles from "./HeroTitles";

export function Girl({
  className = "",
  level = 0,
}: {
  className?: string;
  level?: number;
}) {
  return (
    <svg
      viewBox="0 0 32 40"
      className={`pixel-girl ${className}`}
      aria-label="手持画笔与调色盘的绘灵法师女勇者"
      role="img"
      shapeRendering="crispEdges"
    >
      <ellipse cx="16" cy="38" rx="10" ry="2" fill="#263b3930" />
      <g className="girl-body">
        <path
          d="M9 20H22V23H25V31H22V34H8V29H5V23H9Z"
          fill="#537f8d"
        />
        <path d="M10 4H22V7H25V20H22V22H20V18H11V21H8V18H6V8H10Z" fill="#634936" />
        <path d="M11 7H21V11H23V13H24V17H23V19H21V20H19V21H13V20H10V17H8V12H11Z" fill="#efc3a0" />
        <path d="M9 10H14V12H13V13H12V15H11V17H9V15H8V12H9Z" fill="#77523b" />
        <path d="M8 15H11V24H8V28H5V22H7Z" fill="#77523b" />
        <path d="M23 12H25V22H23V25H21V24H20V22H22V19H23Z" fill="#77523b" />
        <path d="M13 14H15V17H13ZM20 14H22V17H20Z" fill="#313c33" />
        <path d="M16 18H18V19H16Z" fill="#bd7770" />
        <path d="M10 17H12V19H10ZM21 17H23V19H21Z" fill="#e69b8d" />
        <path d="M8 2H18V3H22V5H24V9H22V11H7V10H5V5H8Z" fill="#b9c5bd" />
        <path d="M8 3H17V4H21V6H22V8H7V6H6V5H8Z" fill="#f5efdb" />
        <path d="M7 8H22V10H7Z" fill="#537f8d" />
        <path d="M9 8H16V9H9Z" fill="#a9d4cc" />
        <path d="M17 7V3H19V1H22V4H20V6H19V8Z" fill="#c97d72" />
        <path d="M19 6V3H21V1H23V4H21V6Z" fill="#81b9bb" />
        <path d="M18 5H19V8H18Z" fill="#d3ab62" />
        <path d="M5 9H8V12H5Z" fill="#d3ab62" />
        <path
          d="M10 22H22V26H24V30H21V33H10V30H8V26H10Z"
          fill="#f5efdb"
        />
        <path d="M14 20H19V22H18V23H15V22H14Z" fill="#efc3a0" />
        <path d="M11 20H21V21H22V22H11Z" fill="#537f8d" />
        <path d="M11 22H14V23H16V25H14V24H12ZM19 22H22V24H19V25H17V23H19Z" fill="#ffffff" />
        <path d="M12 23H14V25H18V23H20V29H12Z" fill="#354c54" />
        <path d="M13 23H15V24H17V23H19V26H16V28H15V26H13Z" fill="#537f8d" />
        <path d="M15 23H17V25H15Z" fill="#d3ab62" />
        <path d="M9 29H22V31H9Z" fill="#8c6546" />
        <path d="M15 29H18V31H15Z" fill="#e9bf67" />
        <path d="M10 32H22V34H10Z" fill={level > 3 ? "#d3ab62" : "#537f8d"} />
        <path d="M11 31H14V33H11ZM19 27H21V29H19Z" fill="#c97d72" />
        <path d="M18 31H21V33H18ZM10 25H12V27H10Z" fill="#81b9bb" />
        <path d="M6 23H10V28H6Z" fill="#f5efdb" />
        <path d="M6 26H9V29H6Z" fill="#efc3a0" />
        <g>
          <path d="M3 23H7V24H10V28H9V31H4V30H2V28H1V25H3Z" fill="#8c6546" />
          <path d="M3 24H7V25H9V28H8V30H4V29H3V27H2V25H3Z" fill="#e3c895" />
          <path d="M3 25H5V27H3Z" fill="#c96861" />
          <path d="M5 28H7V30H5Z" fill="#d3ab62" />
          <path d="M7 26H9V28H7Z" fill="#67aeba" />
          <path d="M3 28H5V29H3Z" fill="#6d9654" />
          <path d="M6 24H7V26H6Z" fill="#634936" />
        </g>
        <g className="girl-arm">
          <path d="M21 22H25V24H26V27H22Z" fill="#f5efdb" />
          <path d="M23 24H26V27H23Z" fill={level > 0 ? "#c97d72" : "#81b9bb"} />
          <path d="M26 14H28V34H26Z" fill="#354c54" />
          <path d="M27 17H28V30H27Z" fill="#81b9bb" />
          <path d="M25 14H29V17H25ZM26 31H28V33H26Z" fill="#d3ab62" />
          <path d="M24 26H28V28H24Z" fill="#efc3a0" />
          <path d="M24 12H30V15H24Z" fill="#8c6546" />
          <path d="M25 12H29V14H25Z" fill="#e9bf67" />
          <path
            d="M27 3H29V5H30V10H29V12H25V10H24V7H26V5H27Z"
            fill="#f5efdb"
          />
          <path d="M27 3H29V5H30V7H27V8H25V7H26V5H27Z" fill={level > 1 ? "#81d4cf" : "#c97d72"} />
          <path d="M26 9H27V12H26Z" fill="#b9c5bd" />
        </g>
        <path
          className="girl-leg left"
          d="M11 33H15V36H16V38H10V35H11Z"
          fill="#594637"
        />
        <path
          className="girl-leg right"
          d="M18 33H22V36H24V38H18Z"
          fill="#594637"
        />
      </g>
    </svg>
  );
}
export function Chest({
  opened = false,
  className = "",
}: {
  opened?: boolean;
  className?: string;
}) {
  return (
    <svg
      className={`pixel-chest ${opened ? "opened" : ""} ${className}`}
      viewBox="0 0 40 32"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <ellipse cx="20" cy="29" rx="18" ry="3" fill="#49442e25" />
      <g className="chest-lid">
        <path d="M5 8H10V4H30V8H35V18H5Z" fill="#735137" />
        <path d="M8 9H12V7H28V10H32V15H8Z" fill="#b8793d" />
        <path d="M11 7H14V17H11ZM27 7H30V17H27Z" fill="#f2c66d" />
      </g>
      <path d="M5 17H35V27H31V29H9V27H5Z" fill="#765037" />
      <path d="M8 18H32V26H8Z" fill="#bd8845" />
      <path d="M10 18H13V27H10ZM27 18H30V27H27Z" fill="#eac272" />
      <path d="M17 15H23V22H17Z" fill="#f6d78a" />
      <rect x="19" y="17" width="2" height="3" fill="#705235" />
    </svg>
  );
}
export default function PixelWorld({
  chapter,
  count,
  artworks,
  rewardNodes,
  onNode,
  onHover,
  onLeave,
  moving,
  previewNode,
  titles = [],
}: {
  chapter: number;
  count: number;
  artworks: Artwork[];
  rewardNodes: number[];
  onNode: (node: number) => void;
  onHover: (art: Artwork, rect: DOMRect) => void;
  onLeave: () => void;
  moving: boolean;
  previewNode?: number;
  titles?: readonly string[];
}) {
  const layout = WORLD_LAYOUTS[chapter];
  const localProgress = Math.max(0, Math.min(5, count - chapter * 5));
  return (
    <div className={`world world-${chapter} ${moving ? "moving" : ""}`} style={{ "--title-lines": titles.length } as CSSProperties}>
      <div className="world-scene">
      <svg
        className="landscape"
        viewBox="0 0 1000 520"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <ChapterScenery chapter={chapter} progress={localProgress} artworks={artworks} />
        {localProgress === 5 && (
          <g fill="#e8c97d">
            {Array.from({ length: 24 }, (_, i) => (
              <rect
                key={i}
                x={(i * 43) % 1000}
                y={(i * 73) % 510}
                width="4"
                height="7"
                className="world-spark"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </g>
        )}
        </svg>
      <div className="map-caption">
        <span className="tiny-diamond" /> CHAPTER{" "}
        {String(chapter + 1).padStart(2, "0")}{" "}
        <span className="caption-divider" /> {CHAPTERS[chapter].name}
      </div>
      <span
        className="world-place village"
        style={{
          left: `${layout.labels[0][0]}%`,
          top: `${layout.labels[0][1]}%`,
        }}
      >
        {layout.places[0]}
      </span>
      <span
        className="world-place lake"
        style={{
          left: `${layout.labels[1][0]}%`,
          top: `${layout.labels[1][1]}%`,
        }}
      >
        {layout.places[1]}
      </span>
      {layout.points.map(([x, y], i) => {
        const node = chapter * 5 + i + 1;
        const art = artworks.find((a) => a.node === node);
        const done = node <= count;
        const current = previewNode !== undefined ? node === previewNode : node === count || (count === 0 && node === 1);
        const next = node === count + 1;
        const chest = rewardNodes.includes(node);
        return (
          <div
            key={node}
            className={`map-stop ${done ? "done" : ""} ${next ? "next" : ""} ${current ? "current" : ""}`}
            style={{ left: `${x / 10}%`, top: `${y / 5.2}%` }}
          >
            {current && (
              <div className="hero-marker">
                <div className="hero-overhead">
                  <HeroTitles titles={titles} />
                  <div className="you-tag">{previewNode !== undefined ? "预览位置" : "你在这里"}</div>
                </div>
                <Girl level={chapter} />
              </div>
            )}
            {chest && !current && <Chest className="map-chest" />}
            <button
              aria-label={previewNode !== undefined ? `预览第${node}次冒险` : `第${node}次冒险${done ? "，查看作品" : next ? "，上传作品" : "，未解锁"}`}
              onClick={() => onNode(node)}
              onMouseEnter={(e) =>
                art && onHover(art, e.currentTarget.getBoundingClientRect())
              }
              onMouseLeave={onLeave}
              onFocus={(e) =>
                art && onHover(art, e.currentTarget.getBoundingClientRect())
              }
              onBlur={onLeave}
              className="node-button"
            >
              {done ? (
                <span>✓</span>
              ) : next ? (
                <span className="node-star">✦</span>
              ) : (
                <span className="lock-dot" />
              )}
            </button>
            <span className="node-number">
              {String(node).padStart(2, "0")}
              {next && <b>下一次冒险</b>}
            </span>
          </div>
        );
      })}
      <MapGuardian chapter={chapter} endpoint={layout.points[4]} />
      <div className="map-legend">
        <span>
          <i className="legend-done" /> 已留下的足迹
        </span>
        <span>
          <i className="legend-next" /> 即将开启
        </span>
        <span>
          <i /> 未探索
        </span>
      </div>
      <span className="map-compass">
        N<br />
        <b>✥</b>
      </span>
      </div>
    </div>
  );
}

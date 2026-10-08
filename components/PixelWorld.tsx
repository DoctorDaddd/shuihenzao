"use client";
import type { Artwork } from "../lib/quest";
import { CHAPTERS } from "../lib/quest";
import ChapterScenery, { WORLD_LAYOUTS } from "./ChapterScenery";

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
      aria-label="持魔法画笔的女勇者"
      role="img"
      shapeRendering="crispEdges"
    >
      <ellipse cx="16" cy="38" rx="10" ry="2" fill="#263b3930" />
      <g className="girl-body">
        <path
          d="M9 19H22V23H25V33H8V27H5V22H9Z"
          fill={level > 0 ? "#b17785" : "#406b57"}
        />
        <path d="M10 4H22V7H25V20H21V23H9V18H6V8H10Z" fill="#634936" />
        <path d="M11 7H21V11H23V20H10V17H8V12H11Z" fill="#efc3a0" />
        <path d="M9 7H22V11H18V9H14V13H9Z" fill="#77523b" />
        <path d="M8 15H11V24H8V28H5V22H7Z" fill="#77523b" />
        <path d="M21 15H24V27H21V30H18V26H21Z" fill="#77523b" />
        <path d="M13 14H15V17H13ZM20 14H22V17H20Z" fill="#313c33" />
        <path d="M15 19H19V20H15Z" fill="#bd7770" />
        <path d="M10 17H12V19H10ZM21 17H23V19H21Z" fill="#e69b8d" />
        <path d="M7 7V3H12V5H17V3H21V6H25V9H8Z" fill="#647e48" />
        <path d="M9 4H13V7H9ZM12 3H15V5H12Z" fill="#f1d999" />
        <path
          d="M12 23H21V28H23V33H9V29H11Z"
          fill={level > 3 ? "#d3ab62" : "#94a56e"}
        />
        <path d="M12 22H15V25H20V23H22V26H12Z" fill="#f5e9c7" />
        <path d="M10 29H22V31H10Z" fill="#8b6041" />
        <rect x="16" y="29" width="3" height="2" fill="#e9bf67" />
        <g className="girl-arm">
          <path d="M22 23H25V28H22Z" fill="#f1c5a5" />
          <path d="M26 13H28V30H26Z" fill="#8c5f3f" />
          <path d="M25 10H29V16H25Z" fill="#d9a75b" />
          <path
            d="M26 5H28V7H30V12H25V8H26Z"
            fill={level > 1 ? "#85d6d0" : "#efebce"}
          />
        </g>
        <path
          className="girl-leg left"
          d="M11 33H15V36H16V38H10V35H11Z"
          fill="#65503c"
        />
        <path
          className="girl-leg right"
          d="M18 33H22V36H24V38H18Z"
          fill="#65503c"
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
function Tree({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="15" rx="17" ry="5" fill="#375c4530" />
      <path d="M-4 0H4V16H-4Z" fill="#795937" />
      <path
        d="M-8-37H8V-31H16V-24H22V-10H17V-2H8V4H-10V0H-19V-8H-24V-22H-17V-30H-8Z"
        fill="#4b7643"
      />
      <path
        d="M-8-37H8V-31H15V-24H19V-15H9V-9H-3V-13H-15V-19H-20V-24H-14V-30H-8Z"
        fill="#6d9654"
      />
      <path d="M-6-33H5V-27H12V-21H1V-17H-7V-23H-14V-27H-6Z" fill="#88ab61" />
      <path d="M-15-8H-7V-4H-15ZM6-20H12V-16H6Z" fill="#87a95d" />
    </g>
  );
}
function House({
  x,
  y,
  scale = 1,
  lit = true,
}: {
  x: number;
  y: number;
  scale?: number;
  lit?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-45 27H49V36H-45Z" fill="#58714540" />
      <path d="M-35-10H35V31H-35Z" fill="#ead0a0" />
      <path d="M-35 15H35V31H-35Z" fill="#ceb183" />
      <path
        d="M-44-10V-17H-36V-25H-28V-32H-20V-39H20V-32H28V-25H36V-17H44V-10Z"
        fill="#855c43"
      />
      <path
        d="M-36-19H36V-14H-36ZM-28-28H28V-24H-28ZM-18-36H18V-32H-18Z"
        fill="#b5774b"
      />
      <path d="M-5 7H12V31H-5Z" fill="#71583d" />
      <rect
        x="-26"
        y="0"
        width="13"
        height="13"
        fill={lit ? "#eebf67" : "#7f8c72"}
      />
      <rect
        x="19"
        y="0"
        width="11"
        height="13"
        fill={lit ? "#eebf67" : "#7f8c72"}
      />
      <path
        d="M-21 0V13M-26 6H-13M24 0V13M19 6H30"
        stroke="#8d6e43"
        strokeWidth="2"
      />
      <path d="M23-43H32V-25H23Z" fill="#977954" />
      <path
        className="smoke"
        d="M25-47H31V-53H27V-57H33"
        stroke="#faf4dc"
        strokeWidth="4"
        fill="none"
      />
    </g>
  );
}
export default function PixelWorld({
  chapter,
  count,
  artworks,
  onNode,
  onHover,
  onLeave,
  moving,
}: {
  chapter: number;
  count: number;
  artworks: Artwork[];
  onNode: (node: number) => void;
  onHover: (art: Artwork, rect: DOMRect) => void;
  onLeave: () => void;
  moving: boolean;
}) {
  const colors = ["#cbdcaf", "#b9d096", "#98bb78", "#719862"];
  const layout = WORLD_LAYOUTS[chapter];
  const localProgress = Math.max(0, Math.min(5, count - chapter * 5));
  return (
    <div className={`world world-${chapter} ${moving ? "moving" : ""}`}>
      <svg
        className="landscape"
        viewBox="0 0 1000 520"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        {chapter === 0 ? (
          <>
            <defs>
              <pattern
                id="ground"
                width="43"
                height="41"
                patternUnits="userSpaceOnUse"
              >
                <rect width="43" height="41" fill={colors[0]} />
                <path d="M5 9H8V12H5ZM25 29H29V32H25" fill={colors[1]} />
              </pattern>
            </defs>
            <rect width="1000" height="520" fill="url(#ground)" />
            <path
              d="M0 87H92V67H180V88H271V60H380V89H510V69H630V79H713V53H823V86H924V59H1000V0H0Z"
              fill={colors[3]}
              opacity=".27"
            />
            <path
              d="M0 119H58V101H158V115H243V89H336V123H400V96H540V109H621V89H765V114H870V92H1000V0H0Z"
              fill={colors[2]}
              opacity=".42"
            />
            <path
              d="M0 415H92V392H170V415H245V403H304V429H402V447H502V458H638V428H735V445H820V410H937V386H1000V520H0Z"
              fill={colors[1]}
            />
            <path
              d="M0 378H108V366H150V348H208V325H251V310H325V326H364V354H406V372H511V360H559V324H604V288H642V257H703V239H738V215H783V203H930V172H1000"
              stroke="#b4ad7a"
              strokeWidth="43"
              fill="none"
            />
            <path
              d="M0 378H108V366H150V348H208V325H251V310H325V326H364V354H406V372H511V360H559V324H604V288H642V257H703V239H738V215H783V203H930V172H1000"
              stroke="#e7d9a8"
              strokeWidth="33"
              fill="none"
            />
            <path
              d="M0 378H108V366H150V348H208V325H251V310H300"
              stroke="#f6e9b8"
              strokeWidth="16"
              fill="none"
              opacity={localProgress > 1 ? ".65" : ".1"}
            />
            {Array.from({ length: 180 }, (_, i) => {
              const x = (i * 157 + 38) % 1000,
                y = (i * 83 + 74) % 520;
              return (
                <path
                  key={i}
                  d={`M${x} ${y}v-5h3v5h4v-3h3v5h-10`}
                  fill={colors[3]}
                  opacity=".23"
                />
              );
            })}
            <path
              d="M677 386H746V370H814V385H855V405H880V443H865V459H833V476H731V460H690V441H668V409H677Z"
              fill="#94bfb4"
            />
            <path
              d="M693 394H743V383H804V396H845V412H864V438H842V452H743V442H709V424H693Z"
              fill="#acd3c4"
            />
            <path
              d="M723 405H775M791 431H837M736 444H762"
              stroke="#dfecce"
              strokeWidth="4"
            />
            <path
              d="M867 440H878V444H895V451H884V455H862V451H857V445H867Z"
              fill="#eeebce"
            />
            <rect x="884" y="444" width="3" height="2" fill="#505c4b" />
            <rect x="895" y="448" width="5" height="3" fill="#c39752" />
            {Array.from({ length: 26 }, (_, i) => (
              <Tree
                key={`back${i}`}
                x={(i * 83 + 9) % 1020}
                y={95 + ((i * 41) % 80)}
                scale={0.8 + (i % 3) * 0.12}
              />
            ))}
            <House x={145} y={243} scale={1.18} lit={localProgress >= 1} />
            <House x={233} y={185} scale={0.68} lit={localProgress >= 2} />
            <g transform="translate(507 172)">
              <path d="M-20 4L-13-65H12L24 4Z" fill="#e5d6b3" />
              <path d="M-19-61H19L0-91Z" fill="#94784c" />
              <rect x="-5" y="-10" width="12" height="14" fill="#857250" />
              <g className="windmill">
                <path
                  d="M0-45V-103H9V-45H0H58V-36H0V13H-9V-36H-58V-45Z"
                  fill="#785f42"
                />
                <path
                  d="M3-52V-95H17V-52ZM10-42H51V-28H10ZM-3-30V8H-17V-30ZM-12-39H-51V-53H-12Z"
                  fill="#eee4bc"
                />
              </g>
              <rect x="-4" y="-47" width="8" height="8" fill="#826344" />
            </g>
            {[
              [35, 255],
              [52, 180],
              [362, 236],
              [620, 179],
              [944, 294],
              [917, 351],
              [61, 471],
              [265, 460],
              [332, 476],
              [388, 484],
              [573, 489],
              [983, 462],
              [846, 114],
            ].map(([x, y], i) => (
              <Tree key={i} x={x} y={y} scale={1.05 + (i % 3) * 0.18} />
            ))}
            {[
              [353, 168],
              [377, 175],
              [348, 190],
              [809, 302],
              [823, 312],
              [188, 403],
              [207, 412],
              [224, 400],
              [619, 420],
              [598, 409],
              [564, 224],
              [584, 229],
            ].map(([x, y], i) => (
              <g key={i} opacity={localProgress >= 1 ? 1 : 0.22}>
                <rect x={x} y={y} width="3" height="8" fill="#75985b" />
                <path
                  d={`M${x - 3} ${y - 3}h3v-3h3v3h3v3h-3v3h-3v-3h-3Z`}
                  fill={i % 2 ? "#faf1cc" : "#db9b89"}
                />
                <rect x={x} y={y - 2} width="3" height="3" fill="#d9b25f" />
              </g>
            ))}
            <g transform="translate(333 283)">
              <rect x="-2" y="-35" width="4" height="35" fill="#7e7250" />
              <path d="M-8-41H8V-28H-8Z" fill="#716546" />
              <rect
                x="-5"
                y="-38"
                width="10"
                height="8"
                fill={localProgress >= 2 ? "#f8d589" : "#9eaa87"}
              />
              {localProgress >= 2 && (
                <circle cy="-34" r="20" fill="#fce9a2" opacity=".19" />
              )}
            </g>
            <g transform="translate(630 225)">
              <path d="M0 0V-23H4V0ZM-10-24H14V-13H-10Z" fill="#977346" />
              <path d="M-7-21H9V-18H-7Z" fill="#e4cda0" />
            </g>
            <g
              opacity={localProgress >= 4 ? 1 : 0}
              transform="translate(404 410)"
            >
              <path
                d="M0 0H13V-10H10V-19H6V-10H2V-18H-2V-9H-6V-1H0Z"
                fill="#f7ebcd"
              />
              <rect x="6" y="-7" width="2" height="2" fill="#6f7456" />
            </g>
            <g className="cloud" fill="#fffbed" opacity=".38">
              <path d="M57 42H76V29H109V36H134V47H57ZM717 50H737V35H769V40H791V55H717Z" />
            </g>
          </>
        ) : (
          <ChapterScenery
            chapter={chapter}
            progress={localProgress}
            artworks={artworks}
          />
        )}
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
        <g className="world-foreground" aria-hidden="true">
          {chapter === 0 && <>
            <Tree x={-8} y={532} scale={2.4} />
            <Tree x={1012} y={534} scale={2.8} />
            <path d="M0 514H70V502H102V520H0ZM917 520V503H946V490H974V506H1000V520Z" fill="#426342" />
          </>}
          {chapter === 1 && <g fill="#183b35">
            <path d="M0 0H26V76H44V130H31V226H13V316H0ZM1000 0H974V92H957V168H972V281H1000Z" />
            <path d="M0 0H178V17H120V33H77V56H30V72H0ZM1000 0H864V20H918V45H956V68H1000Z" />
          </g>}
          {chapter === 2 && <g fill="#675a46">
            <path d="M0 520V482H21V436H48V461H62V492H81V520ZM1000 520V470H973V420H947V478H925V520Z" />
            <path d="M0 477H24V467H48V478H62V488H0ZM940 437H977V447H940Z" fill="#c4a875" />
          </g>}
          {chapter === 3 && <g fill="#617b8c">
            <path d="M0 520V461H22V440H40V410H57V451H79V482H103V520ZM1000 520V462H971V417H949V454H930V484H900V520Z" />
            <path d="M22 440H40V410H57V451H79V467H47V449H22ZM930 454H949V417H971V462H985V476H957V455H930Z" fill="#e3eee7" />
          </g>}
          {chapter === 4 && <g fill="#253b46">
            <path d="M0 520V470H21V450H42V470H62V496H92V520ZM1000 520V470H977V450H956V470H933V497H906V520Z" />
            <path d="M0 490H63V497H0ZM935 490H1000V497H935Z" fill="#9d916f" />
          </g>}
        </g>
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
        const current = node === count || (count === 0 && node === 1);
        const next = node === count + 1;
        const chest = [3, 5, 10, 15, 20, 25].includes(node);
        return (
          <div
            key={node}
            className={`map-stop ${done ? "done" : ""} ${next ? "next" : ""} ${current ? "current" : ""}`}
            style={{ left: `${x / 10}%`, top: `${y / 5.2}%` }}
          >
            {current && (
              <div className="hero-marker">
                <div className="you-tag">你在这里</div>
                <Girl level={chapter} />
              </div>
            )}
            {chest && !current && <Chest className="map-chest" />}
            <button
              aria-label={`第${node}次冒险${done ? "，查看作品" : next ? "，上传作品" : "，未解锁"}`}
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
  );
}

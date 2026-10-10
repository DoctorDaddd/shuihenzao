import type { CSSProperties } from "react";
import type { Companion } from "../lib/quest";

const COMPANION_NAMES = { ruby: "红宝石兽", topaz: "黄宝石兽", sapphire: "蓝宝石兽" };

// Original pixel silhouette inspired by FFXIV Carbuncles: long ears, forehead gem and a split tail.
export function Carbuncle({ kind }: { kind: Companion }) {
  return <svg className={`carbuncle carbuncle-${kind}`} viewBox="0 0 48 36" role="img"
    aria-label={`跟随勇者的${COMPANION_NAMES[kind]}`} shapeRendering="crispEdges">
    <path d="M7 32H40V34H7Z" fill="var(--familiar-shadow)" />
    <g className="carbuncle-tail">
      <path d="M26 25H32V21H34V16H38V10H41V6H45V16H43V22H39V27H33V29H26Z" fill="var(--fur-shade)" />
      <path d="M29 25H35V23H39V18H43V12H46V20H44V25H39V29H32V30H27Z" fill="var(--fur)" />
      <path d="M33 24H38V19H40V15H42V19H40V24H37V27H32Z" fill="var(--fur-light)" />
      <path d="M38 12H40V8H42V5H44V11H42V16H40V20H38Z" fill="var(--fur)" />
    </g>
    <g className="carbuncle-body">
      <path d="M9 17H24V20H31V23H34V29H31V33H25V30H18V33H12V30H8V25H5V21H9Z" fill="var(--fur-shade)" />
      <path d="M13 18H23V21H29V23H31V29H24V28H18V30H12V27H9V22H13Z" fill="var(--fur)" />
      <path d="M11 20H18V23H21V27H19V30H14V29H12V26H10V23H8V21Z" fill="var(--familiar-cream)" />
      <path d="M5 2H8V4H11V7H13V13H18V8H21V4H24V2H27V9H25V14H23V18H22V22H18V24H10V22H6V19H3V16H5V13H7V10H5Z" fill="var(--fur-shade)" />
      <path d="M6 3H8V6H10V9H12V14H19V10H21V7H24V4H25V9H23V14H21V19H19V22H10V20H7V18H5V16H9V12H8V8H6Z" fill="var(--fur)" />
      <path d="M8 6H9V9H11V13H10V11H9V9H8ZM23 7H24V10H22V14H20V13H21V10H23Z" fill="var(--fur-light)" />
      <path d="M8 17H11V20H9V19H7V18H5V17ZM12 21H18V23H12Z" fill="var(--familiar-cream)" />
      <path d="M9 15H11V18H9ZM18 15H20V18H18ZM5 18H7V19H5Z" fill="var(--familiar-eye)" />
      <path d="M9 15H10V16H9ZM18 15H19V16H18Z" fill="var(--familiar-cream)" />
      <path d="M14 11H16V12H17V15H16V17H14V15H13V12H14Z" fill="var(--familiar-gem-edge)" />
      <path d="M14 12H16V15H14Z" fill="var(--familiar-gem)" />
      <path d="M14 12H15V13H14Z" fill="var(--familiar-cream)" />
      <path d="M12 29H16V32H11V31H12ZM26 29H30V32H25V31H26Z" fill="var(--fur-light)" />
    </g>
  </svg>;
}

function PixelGear({ small = false }: { small?: boolean }) {
  return <g className={`weapon-gear ${small ? "weapon-gear-small" : ""}`}>
    <path fillRule="evenodd" d="M-2-7H2V-5H4V-4H5V-2H7V2H5V4H4V5H2V7H-2V5H-4V4H-5V2H-7V-2H-5V-4H-4V-5H-2ZM-2-3H2V-2H3V2H2V3H-2V2H-3V-2H-2Z" />
    <path d="M-1-5H1V-4H-1ZM4-1H5V1H4ZM-1 4H1V5H-1ZM-5-1H-4V1H-5Z" fill="var(--weapon-white)" />
  </g>;
}

export function GlowingPainterWeapon() {
  return <g className="glowing-painter-weapon">
    <path d="M26 13H29V34H26Z" fill="var(--weapon-edge)" />
    <path d="M27 14H28V33H27Z" fill="var(--weapon-white)" />
    <path d="M25 16H30V18H25ZM26 30H29V32H26Z" fill="var(--weapon-gold)" />
    <path className="weapon-light" d="M27 0H29V3H31V6H32V9H30V13H25V10H23V7H25V4H26V2H27Z" fill="var(--weapon-white)" />
    <path d="M27 2H29V5H30V8H28V11H26V8H25V6H27Z" fill="var(--weapon-ice)" />
    <path d="M24 12H31V14H24ZM25 14H30V16H25Z" fill="var(--weapon-gold)" />
    <g transform="translate(28 9) scale(.78)"><PixelGear /></g>
    <g transform="translate(29 22) scale(.42)"><PixelGear small /></g>
    <path className="weapon-glints" d="M34 2H35V4H37V5H35V7H34V5H32V4H34ZM22 18H23V20H25V21H23V23H22V21H20V20H22Z" fill="var(--weapon-white)" />
  </g>;
}

// Fixed geometry keeps replay deterministic and avoids timers or an animation dependency.
const FIREWORKS = [
  { x: 19, y: 29, delay: 0, size: 66 }, { x: 79, y: 18, delay: .55, size: 73 },
  { x: 47, y: 13, delay: 1.1, size: 55 }, { x: 83, y: 64, delay: 1.7, size: 62 },
  { x: 16, y: 70, delay: 2.2, size: 58 }, { x: 55, y: 49, delay: 2.8, size: 85 },
];
export function VictoryFireworks() {
  return <div className="victory-fireworks" aria-hidden="true">
    {FIREWORKS.map((burst, i) => <div key={i} className={`firework firework-${i % 3}`} style={{
      left: `${burst.x}%`, top: `${burst.y}%`, "--burst-delay": `${burst.delay}s`,
      "--burst-size": `${burst.size}px`,
    } as CSSProperties}>
      <span className="firework-trail" />
      {Array.from({ length: 16 }, (_, ray) => <i key={ray} style={{ "--ray-angle": `${ray * 22.5}deg`, "--ray-length": ray % 2 ? .72 : 1 } as CSSProperties}><b /></i>)}
    </div>)}
  </div>;
}

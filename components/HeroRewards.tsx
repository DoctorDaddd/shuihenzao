import type { CSSProperties } from "react";
import type { Companion } from "../lib/quest";

const COMPANION_NAMES = { ruby: "红宝石兽", topaz: "黄宝石兽", sapphire: "蓝宝石兽" };

// Original 48x36 pixel interpretation: three separate plumes, long ears, a red forehead gem and four paws.
export function Carbuncle({ kind }: { kind: Companion }) {
  return <svg className={`carbuncle carbuncle-${kind}`} viewBox="0 0 48 36" role="img"
    aria-label={`跟随勇者的${COMPANION_NAMES[kind]}`} shapeRendering="crispEdges">
    <path d="M7 32H40V34H7Z" fill="var(--familiar-shadow)" />
    <g className="carbuncle-body">
      {/* Keep gaps between all three tips, including at the smallest map size. */}
      <g className="carbuncle-tail carbuncle-tail-high">
        <path d="M27 28V21H29V16H30V12H29V6H31V3H34V2H36V6H37V12H35V18H33V23H31V28Z" fill="var(--fur-shade)" />
        <path d="M29 25V21H31V16H32V11H31V7H32V4H34V7H35V12H33V18H31V23H30V25Z" fill="var(--fur)" />
        <path d="M31 7V5H33V10H34V12H32V16H31V12H32V9H31Z" fill="var(--fur-light)" />
      </g>
      <g className="carbuncle-tail carbuncle-tail-middle">
        <path d="M28 28V25H32V21H35V17H38V13H41V10H45V12H47V16H45V19H41V22H37V25H33V29Z" fill="var(--fur-shade)" />
        <path d="M31 26V24H34V21H37V17H40V14H42V12H44V14H45V16H43V18H40V21H36V24H33V27Z" fill="var(--fur)" />
        <path d="M37 20V18H39V15H42V13H44V15H42V17H40V19H38V20Z" fill="var(--fur-light)" />
      </g>
      <g className="carbuncle-tail carbuncle-tail-low">
        <path d="M28 28H34V27H38V25H41V24H45V25H47V28H45V30H41V32H35V31H29Z" fill="var(--fur-shade)" />
        <path d="M30 29H35V28H39V27H42V26H44V27H45V28H42V30H36V29H32V30H30Z" fill="var(--fur)" />
        <path d="M36 28H39V27H42V26H44V27H42V28H39V29H36Z" fill="var(--fur-light)" />
      </g>
      {/* Far paws sit behind the torso; near paws have their own toe clusters. */}
      <path d="M16 25H20V30H19V32H15V30H16ZM28 25H32V29H34V31H29V29H28Z" fill="var(--fur-shade)" />
      <path d="M10 19H20V21H29V23H32V29H29V31H23V29H17V30H12V28H9V24H8V21H10Z" fill="var(--fur-shade)" />
      <path d="M12 20H19V22H28V24H30V27H27V29H23V27H17V28H12V25H10V22H12Z" fill="var(--fur)" />
      <path d="M18 22H25V23H28V25H24V24H19Z" fill="var(--fur-light)" />
      <path d="M10 20H15V22H18V25H21V27H16V28H13V26H11V24H9V22H10Z" fill="var(--familiar-cream)" />
      <path d="M11 26H15V30H14V33H9V31H11ZM25 27H29V31H28V33H23V31H25Z" fill="var(--fur-shade)" />
      <path d="M12 27H14V31H11V32H10V31H12ZM26 28H28V31H25V32H24V31H26Z" fill="var(--fur-light)" />
      {/* Long leaf-shaped ears, a short muzzle, and cheek tufts avoid a generic cat silhouette. */}
      <path d="M4 2H7V4H10V7H12V12H17V9H19V6H22V3H26V8H24V12H22V16H23V19H21V22H16V24H10V22H6V20H3V17H5V14H7V12H6V9H4Z" fill="var(--fur-shade)" />
      <path d="M5 3H7V6H10V9H11V13H18V10H20V8H23V5H24V8H22V12H20V16H21V19H19V21H16V22H11V20H7V18H5V16H8V13H9V11H7V8H5Z" fill="var(--fur)" />
      <path d="M6 5H7V8H9V11H10V13H8V10H7V8H6ZM22 7H23V9H21V12H19V14H18V12H20V9H22Z" fill="var(--fur-light)" />
      <path d="M6 18H10V20H15V19H18V21H16V22H10V21H7V20H5V19H6Z" fill="var(--familiar-cream)" />
      <path d="M8 15H11V18H9V17H8ZM17 15H20V17H18V18H17ZM5 17H7V18H5Z" fill="var(--familiar-eye)" />
      <path d="M9 15H10V16H9ZM18 15H19V16H18Z" fill="var(--familiar-cream)" />
      <path className="carbuncle-gem" d="M13 10H15V11H16V14H15V16H13V14H12V11H13Z" fill="var(--familiar-gem-edge)" />
      <path d="M13 11H15V14H13Z" fill="var(--familiar-gem)" />
      <path d="M13 11H14V12H13Z" fill="var(--familiar-cream)" />
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

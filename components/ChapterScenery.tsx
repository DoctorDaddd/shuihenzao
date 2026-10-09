import type { Artwork } from "../lib/quest";

// Terrain and interactive nodes share the same 1000 × 520 coordinate system.
export const WORLD_LAYOUTS = [
  {
    points: [[115, 354], [300, 306], [492, 368], [684, 254], [868, 204]],
    route: "M-20 380H64V354H175V330H238V306H336V337H395V368H534V326H588V287H632V254H735V231H793V204H930V180H1020",
    places: ["魔导装甲库", "青磷引擎"],
    labels: [[14, 42], [54, 88]],
  },
  {
    points: [[110, 380], [285, 312], [468, 347], [669, 260], [856, 198]],
    route: "M-20 408H70V380H145V351H210V312H310V347H493V321H548V288H614V260H711V232H780V198H890V174H1020",
    places: ["拘束装置", "陨月残骸"],
    labels: [[20, 41], [60, 87]],
  },
  {
    points: [[105, 360], [304, 390], [478, 298], [671, 340], [867, 249]],
    route: "M-20 360H190V390H334V353H392V298H530V319H600V340H733V294H802V249H905V218H1020",
    places: ["机神中枢", "时间齿轮"],
    labels: [[42, 43], [73, 83]],
  },
  {
    points: [[106, 385], [292, 340], [490, 263], [684, 304], [868, 217]],
    route: "M-20 410H68V385H167V364H234V340H336V310H397V283H450V263H548V280H600V304H734V270H795V245H830V217H918V185H1020",
    places: ["浮空圣域", "苍穹王座"],
    labels: [[16, 40], [53, 88]],
  },
  {
    points: [[120, 400], [310, 350], [510, 395], [696, 310], [865, 230]],
    route: "M-20 400H195V375H250V350H350V370H414V395H546V363H600V335H650V310H737V284H800V255H865V230H935V188H1020",
    places: ["次元观测窗", "欧米茄验证区"],
    labels: [[21, 42], [59, 90]],
  },
] as const;

function Trail({ chapter, edge, fill, light, progress }: { chapter: number; edge: string; fill: string; light: string; progress: number }) {
  return <g fill="none" strokeLinejoin="miter">
    <path d={WORLD_LAYOUTS[chapter].route} stroke="#050d17" strokeWidth="52" transform="translate(0 8)" />
    <path d={WORLD_LAYOUTS[chapter].route} stroke={edge} strokeWidth="44" />
    <path d={WORLD_LAYOUTS[chapter].route} stroke={fill} strokeWidth="32" />
    <path d={WORLD_LAYOUTS[chapter].route} stroke={light} strokeWidth="2" strokeDasharray="5 15" opacity=".65" />
    {WORLD_LAYOUTS[chapter].points.map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}>
      <path d="M-30-14H-20V-20H20V-14H30V16H20V22H-20V16H-30Z" fill={fill} stroke={edge} strokeWidth="4" />
      <path d="M-25-10V-15H-16M16-15H25V-10M-25 12V17H-16M16 17H25V12" stroke={progress > i ? light : edge} strokeWidth="3" />
    </g>)}
  </g>;
}

function Gear({ x, y, size = 1, reverse = false }: { x: number; y: number; size?: number; reverse?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`}>
    <g className={`scenery-gear ${reverse ? "reverse" : ""}`}>
      <path d="M-13-48H13V-38H28L36-46L47-35L38-26V-13H49V13H38V27L46 36L35 47L26 38H13V49H-13V38H-27L-36 46L-47 35L-38 26V13H-49V-13H-38V-27L-46-36L-35-47L-26-38H-13Z" fill="#705a43" stroke="#c9a46c" strokeWidth="4" />
      <path d="M-22-26H22V-18H29V18H22V26H-22V18H-29V-18H-22Z" fill="#283b40" stroke="#a8895c" strokeWidth="7" />
      <path d="M-7-30H7V30H-7ZM-30-7H30V7H-30Z" fill="#af8e5b" />
      <path d="M-9-9H9V9H-9Z" fill="#e5d4a4" />
    </g>
  </g>;
}

function Crystal({ x, y, size = 1 }: { x: number; y: number; size?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${size})`}>
    <path d="M-29 0L-40-41L-24-63L-10-36L1-102L23-78L28-26L46-48L42-10L23 10H-12Z" fill="#305868" />
    <path d="M1-102L8-70L8 2L-10-7L-10-36ZM23-78L28-26L16 5L8 2L8-70Z" fill="#75b8c5" />
    <path d="M-24-63L-14-35L-10-7L-23-15ZM46-48L31-15L23 10L16 5L28-26Z" fill="#95dce0" />
    <path d="M1-102L8-70L15-77ZM-24-63L-29-41L-21-34Z" fill="#d4f4ec" />
  </g>;
}

function Castrum({ progress }: { progress: number }) {
  return <g>
    <rect width="1000" height="520" fill="#27333b" />
    <path d="M0 174H80V156H180V184H295V143H430V177H552V146H689V176H797V134H912V164H1000V520H0Z" fill="#46504d" />
    <path d="M0 420H169V442H293V424H422V466H601V438H791V415H1000V520H0Z" fill="#323d3d" />
    {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${i * 83 - 110} 520L${i * 61 + 30} 145M0 ${190 + i * 36}H1000`} stroke="#718079" strokeWidth="2" opacity=".18" />)}
    <path d="M0 90H96V68H138V107H238V79H325V103H470V57H529V103H618V63H669V101H774V72H839V107H918V68H969V87H1000V158H0Z" fill="#17262f" />
    <path d="M0 126H1000V142H0ZM0 160H1000V168H0Z" fill="#627171" />
    {[60, 255, 890].map(x => <g key={x} transform={`translate(${x} 125)`}>
      <path d="M-30 37V-73H-17V-102H17V-73H30V37Z" fill="#202e36" stroke="#59666a" strokeWidth="4" />
      <path d="M-19-70H19V-32H-19Z" fill="#151d27" />
      <path d="M-17-59H17V-52H-17Z" fill="#dc7465" className="scenery-pulse" />
      <path d="M-22 4H22M-22 17H22" stroke="#77877f" strokeWidth="4" />
    </g>)}
    <g transform="translate(555 123)">
      <path d="M-153 57V-29H-125V-56H-91V-76H-55V-93H55V-76H91V-56H125V-29H153V57Z" fill="#17262f" stroke="#758081" strokeWidth="6" />
      <path d="M-108 54V-22H-80V-52H-45V-65H45V-52H80V-22H108V54Z" fill="#414e53" />
      <path d="M-58 57V-26H-41V-46H41V-26H58V57Z" fill="#0e1923" stroke="#8b9490" strokeWidth="5" />
      <path d="M-45 50V-23H-31V-35H31V-23H45V50" fill="none" stroke={progress > 2 ? "#86ded2" : "#a65551"} strokeWidth="5" className="scenery-pulse" />
      <path d="M-6-36H6V55H-6ZM-111-12H-76V-5H-111ZM77-12H111V-5H77Z" fill="#7f9290" />
      <path d="M-13-91H13V-82H23V-68H13V-57H-13V-68H-23V-82H-13Z" fill="#bf6157" />
    </g>
    <g transform="translate(158 211)">
      <path d="M-68 37V-37H-42V-52H33V-39H61V37Z" fill="#263740" stroke="#6a7a7a" strokeWidth="5" />
      <path d="M-48-22H41V24H-48Z" fill="#131f29" />
      <path d="M-29 22V-4H-20V-19H9V-5H29V22Z" fill="#6a7978" />
      <path d="M-37 14H-20V33H-44ZM17 14H34L44 33H23Z" fill="#97a399" />
      <path d="M-19-18H10V-10H-19Z" fill="#ba6559" />
    </g>
    <g transform="translate(578 432)">
      <path d="M-48-35H48V25H-48Z" fill="#192932" stroke="#788b83" strokeWidth="5" />
      <path d="M-37-25H37V14H-37Z" fill="#275558" />
      <path d="M-27-20H-13V9H-27ZM-5-20H9V9H-5ZM17-20H31V9H17Z" fill="#83d5c7" className="scenery-pulse" />
      <path d="M-61-8H-48M48-8H76V-41H104" fill="none" stroke="#9b9b83" strokeWidth="8" />
    </g>
    <Trail chapter={0} edge="#83918e" fill="#4b5c60" light="#e4a27a" progress={progress} />
    {[48, 352, 741, 960].map((x, i) => <g key={x} transform={`translate(${x} ${i % 2 ? 465 : 273})`}>
      <path d="M-17-19H20V11H-17Z" fill="#26343b" stroke="#879284" strokeWidth="3" />
      <path d="M-9-14L5 6M3-14L17 6" stroke="#c5a567" strokeWidth="5" />
    </g>)}
    <path d="M0 520V462H22V440H45V482H72V520ZM1000 520V424H974V449H949V489H917V520Z" fill="#15252d" />
    <g className="scenery-drift" fill="#a6b5af" opacity=".15"><path d="M15 208H240V220H331V227H70ZM612 387H831V398H988V407H731Z" /></g>
  </g>;
}

function Coil({ progress }: { progress: number }) {
  return <g>
    <rect width="1000" height="520" fill="#101f2c" />
    <path d="M0 0H1000V110H964V159H926V130H866V93H786V124H709V69H596V97H465V59H330V99H241V54H136V136H72V176H0Z" fill="#33424c" />
    <path d="M0 520V432H99V451H182V423H332V465H529V421H683V466H804V418H912V382H1000V520Z" fill="#293743" />
    <path d="M0 449H141V473H279V459H406V502H595V468H780V489H922V449H1000" fill="none" stroke="#a86443" strokeWidth="12" opacity=".65" />
    <g transform="translate(507 170)">
      <path d="M-158-73H-112V-112H112V-73H158V55H112V98H-112V55H-158Z" fill="#182633" stroke="#61767b" strokeWidth="12" />
      <path d="M-133-62H-94V-91H94V-62H133V44H94V76H-94V44H-133Z" fill="#271f29" stroke="#76b8c3" strokeWidth="4" />
      <path d="M-108-45H-77V-72H77V-45H108V29H77V56H-77V29H-108Z" fill="#5b3438" />
      <path d="M-39-63H34V-36H59V18H27V50H-22V22H-57V-26H-39Z" fill="#d08c62" className="scenery-pulse" />
      <path d="M-22-42H15V-21H36V6H12V27H-10V7H-34V-14H-22Z" fill="#f2c78a" />
      {[-122, -76, 76, 122].map(x => <path key={x} d={`M${x}-79V65`} stroke="#91cfce" strokeWidth="6" />)}
      <path d="M-170-90H-120M120-90H170M-170 70H-120M120 70H170" stroke="#ceab6e" strokeWidth="10" />
    </g>
    {[65, 254, 737, 955].map((x, i) => <g key={x} transform={`translate(${x} ${i % 2 ? 154 : 246})`}>
      <path d="M-16 27V-81H-8V-103H9V-81H18V27Z" fill="#506977" />
      <path d="M-5-83H5V17H-5Z" fill="#94deda" className="scenery-pulse" />
      <path d="M-27 27H28V39H-27ZM-27-81H28V-67H-27Z" fill="#8fa1a0" />
    </g>)}
    <Trail chapter={1} edge="#698e9d" fill="#293f51" light="#85e6e4" progress={progress} />
    <Crystal x={53} y={278} size={1.05} /><Crystal x={199} y={199} size={.85} />
    <Crystal x={342} y={488} size={1.1} /><Crystal x={803} y={449} size={1.2} />
    <Crystal x={971} y={325} size={1.1} />
    <path d="M0 0H33V176H18V303H0ZM1000 0H970V112H985V353H1000ZM0 520V479H39V460H68V520ZM912 520V492H944V461H979V478H1000V520Z" fill="#101a26" />
    {Array.from({ length: 18 }, (_, i) => <rect key={i} x={(i * 137 + 95) % 970} y={110 + (i * 71) % 365} width="3" height="5" fill="#8edbdd" className="scenery-pulse" style={{ animationDelay: `-${i * .3}s` }} />)}
  </g>;
}

function Alexander({ progress }: { progress: number }) {
  return <g>
    <rect width="1000" height="520" fill="#32484b" />
    <path d="M0 147H91V113H164V147H239V108H320V157H720V112H794V144H905V97H1000V520H0Z" fill="#56706b" />
    <path d="M0 292H1000V520H0Z" fill="#323f42" />
    {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${i * 105 - 90} 520L${i * 85 + 20} 216M0 ${241 + i * 39}H1000`} stroke="#8e835f" strokeWidth="3" opacity=".35" />)}
    <g transform="translate(498 147)">
      <path d="M-235 58V-13H-203V-54H-155V-17H-117V-61H-84V-97H-48V-125H48V-97H84V-61H117V-17H155V-54H203V-13H235V58H194V83H-194V58Z" fill="#293e43" stroke="#ae966a" strokeWidth="6" />
      <path d="M-161 59V-4H-119V26H-86V-29H-53V-75H53V-29H86V26H119V-4H161V59Z" fill="#a58a5c" />
      <path d="M-67-31V-61H-42V-90H42V-61H67V-31H48V-3H-48V-31Z" fill="#d5bd84" />
      <path d="M-45-54H-12V-43H-45ZM12-54H45V-43H12Z" fill="#83ded0" className="scenery-pulse" />
      <path d="M-18-36H18V-20H-18ZM-64 35H64V70H-64Z" fill="#344a4c" />
      <path d="M-36 38H36V62H-36Z" fill={progress >= 3 ? "#9af1d1" : "#639c8d"} className="scenery-pulse" />
      <path d="M-204-54V-101H-183V-130H-172V-101H-153V-54ZM153-54V-101H172V-130H183V-101H204V-54Z" fill="#c3aa78" />
      <path d="M-219 6H-182V17H-219ZM182 6H219V17H182Z" fill="#e1bf7a" />
      <path d="M-148 70V109H-78V85M148 70V109H78V85" fill="none" stroke="#a2885c" strokeWidth="20" />
    </g>
    <Gear x={176} y={217} size={1.25} /><Gear x={791} y={431} size={1.2} reverse />
    <Gear x={873} y={397} size={.65} />
    <g fill="none" stroke="#9a845d" strokeWidth="12">
      <path d="M0 275H74V206H126M681 159H799V127H1000M52 520V467H212V440" />
    </g>
    <g fill="#d2b17a">
      <path d="M62 244H85V253H62ZM794 148H809V166H794ZM136 456H145V478H136Z" />
    </g>
    <Trail chapter={2} edge="#c9ad76" fill="#675c48" light="#a5e6c9" progress={progress} />
    {[60, 943].map(x => <g key={x} transform={`translate(${x} 424)`}>
      <path d="M-28-39H28V32H-28Z" fill="#354c4c" stroke="#b39667" strokeWidth="5" />
      <path d="M-19-24H19V-10H-19ZM-19 1H19V15H-19Z" fill="#84a99a" />
      <path d="M-8-40V-62H8V-40Z" fill="#cfb67f" />
    </g>)}
    <g className="scenery-drift" fill="#d6e0c8" opacity=".2"><path d="M17 321H128V308H218V321H337V333H80ZM713 232H801V218H937V230H1000V246H766Z" /></g>
    <path d="M0 520V464H24V484H53V509H80V520ZM1000 520V465H977V480H944V508H916V520Z" fill="#1c3034" />
  </g>;
}

function Singularity({ progress }: { progress: number }) {
  return <g>
    <rect width="1000" height="520" fill="#162d44" />
    <path d="M0 115H76V99H195V126H317V93H426V119H580V90H725V112H846V78H1000V137H0Z" fill="#63868f" opacity=".45" />
    <g fill="#d1e9df" opacity=".38" className="scenery-drift"><path d="M0 184H162V171H286V181H404V196H164V204H0ZM571 99H765V84H917V94H1000V111H676ZM0 467H228V454H397V468H585V479H173Z" /></g>
    <path d="M88 286L236 195H741L939 276L969 405L838 489H230L60 412Z" fill="#132a39" stroke="#819eaa" strokeWidth="10" />
    <path d="M105 286L244 211H737L920 284L942 400L829 469H234L87 405Z" fill="#426875" stroke="#b6d7d5" strokeWidth="5" />
    <path d="M208 299L302 246H680L824 299L842 387L758 437H312L191 382Z" fill="#325260" stroke="#82cfda" strokeWidth="5" />
    <path d="M327 301L395 277H609L719 311L730 367L663 400H403L305 365Z" fill="#263f56" stroke="#a2e4e1" strokeWidth="4" className="scenery-pulse" />
    {Array.from({ length: 12 }, (_, i) => {
      const angle = i * Math.PI / 6;
      const x = 511 + Math.cos(angle) * 331, y = 345 + Math.sin(angle) * 102;
      return <path key={i} d={`M${x - 6} ${y - 7}h12v14h-12ZM${x - 10} ${y}h20`} fill="none" stroke="#b2e9de" strokeWidth="2" />;
    })}
    {[99, 261, 738, 938].map((x, i) => <g key={x} transform={`translate(${x} ${i % 2 ? 159 : 228})`}>
      <path d="M-20 30V-48H-11V-79H-5V-103H5V-79H11V-48H20V30Z" fill="#7396a8" stroke="#b3d3d8" strokeWidth="3" />
      <path d="M-4-70H4V19H-4Z" fill="#b3f1e5" className="scenery-pulse" />
      <path d="M-31 30H31V43H-31Z" fill="#b8d0cd" />
      <path d="M-20 44L0 70L20 44Z" fill="#2b4559" />
    </g>)}
    <g transform="translate(510 126)">
      <path d="M-55 54V-36H-29V-70H-11V-103H11V-70H29V-36H55V54Z" fill="#344f6b" stroke="#bacfd6" strokeWidth="5" />
      <path d="M-26 50V-28H-10V-53H10V-28H26V50Z" fill="#79bdcf" className="scenery-pulse" />
      <path d="M-77 56H77V68H-77ZM-65 72H65V82H-65Z" fill="#a5c7ce" />
      <path d="M-64-19H64M-34-48H34" stroke="#d1cda3" strokeWidth="4" />
    </g>
    <Trail chapter={3} edge="#b8d9dc" fill="#5c8597" light="#d4f7e8" progress={progress} />
    <path d="M0 520V464H31V453H60V476H99V504H138V520ZM1000 520V459H973V448H943V479H913V504H878V520Z" fill="#17304a" />
    {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M${(i * 137 + 49) % 960} ${54 + i * 83 % 402}h3v8h-3Z`} fill="#d8f1ec" className="scenery-float" style={{ animationDelay: `-${i * .4}s` }} />)}
  </g>;
}

function Rift({ progress, artworks }: { progress: number; artworks: Artwork[] }) {
  return <g>
    <rect width="1000" height="520" fill="#081521" />
    {Array.from({ length: 68 }, (_, i) => <rect key={i} x={(i * 173 + 35) % 1000} y={(i * 79 + 18) % 520} width={i % 5 ? 2 : 4} height={i % 5 ? 2 : 4} fill={i % 3 ? "#72979f" : "#b4e6dc"} opacity=".65" />)}
    <path d="M0 126L171 186L226 97L408 163L465 69L621 142L787 58L1000 132M0 478L149 431L300 506L508 447L689 491L854 391L1000 449" fill="none" stroke="#2d626c" strokeWidth="3" />
    <g transform="translate(538 204)" className="scenery-pulse">
      <path d="M-106-32L-30-102L63-91L121-25L107 55L33 104L-60 74L-106 16Z" fill="#16363e" stroke="#5fa7ae" strokeWidth="4" />
      <path d="M-73-21L-23-71L43-60L83-16L72 35L22 71L-39 49L-72 10Z" fill="#071722" stroke="#a4e5dc" strokeWidth="3" />
      <path d="M-23-52L6-30L-12-9L21 9L-2 29L20 52" fill="none" stroke="#b8fbeb" strokeWidth="5" />
      <path d="M-133-55L-118-98L-90-78ZM100 69L142 48L128 102ZM25-122L64-132L47-109Z" fill="#548b93" />
    </g>
    {Array.from({ length: 5 }, (_, row) => <g key={row} opacity=".3">
      {Array.from({ length: 10 }, (_, col) => <path key={col} d={`M${col * 116 + row % 2 * 58 - 58} ${284 + row * 45}l29-15h58l29 15-29 15h-58Z`} fill="none" stroke="#5aabb1" strokeWidth="2" />)}
    </g>)}
    <path d="M60 375L191 329L357 326L420 364L574 367L678 277L854 197L934 218L960 260L752 350L556 437L407 427L279 390L120 437Z" fill="#1b3442" stroke="#5b8d9c" strokeWidth="5" />
    <Trail chapter={4} edge="#72a9b5" fill="#264652" light="#b7f3e1" progress={progress} />
    {[168, 310, 470, 689, 902].map((x, i) => {
      const art = artworks.find(a => a.node === 21 + i);
      return <g key={i} transform={`translate(${x} ${i % 2 ? 115 : 88})`}>
        <g className="scenery-float" style={{ animationDelay: `-${i * .7}s` }}>
          <path d="M-29-20H29V53H-29Z" fill="#112a39" stroke="#87bfc3" strokeWidth="3" />
          <path d="M-35-25H-17M17-25H35M-35 58H-17M17 58H35" stroke="#b7f3e1" strokeWidth="3" />
          {art ? <image href={art.thumbnailUrl || art.imageUrl} x="-23" y="-14" width="46" height="61" preserveAspectRatio="xMidYMid meet" />
            : <path d="M0-6L16 10L0 27L-16 10ZM-12 37H12" fill="none" stroke="#68acb3" strokeWidth="3" />}
        </g>
      </g>;
    })}
    <path d="M0 0H39L12 119H0ZM1000 0H976L950 82L979 165H1000ZM0 520V483L52 447L81 489L142 520ZM1000 520V434L950 466L935 510L878 520Z" fill="#030d18" />
    <path d="M40 71L54 116L24 139M943 355L970 378L947 418M99 474L128 491L116 512" fill="none" stroke="#77c8ce" strokeWidth="3" className="scenery-pulse" />
  </g>;
}

export default function ChapterScenery({ chapter, progress, artworks }: { chapter: number; progress: number; artworks: Artwork[] }) {
  if (chapter === 0) return <Castrum progress={progress} />;
  if (chapter === 1) return <Coil progress={progress} />;
  if (chapter === 2) return <Alexander progress={progress} />;
  if (chapter === 3) return <Singularity progress={progress} />;
  return <Rift progress={progress} artworks={artworks} />;
}

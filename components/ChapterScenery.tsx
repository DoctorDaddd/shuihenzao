import type { Artwork } from "../lib/quest";

// Terrain and interactive nodes share the same 1000 × 520 coordinate system.
export const WORLD_LAYOUTS = [
  {
    points: [
      [115, 354],
      [300, 306],
      [492, 368],
      [684, 254],
      [868, 204],
    ],
    route: "",
    places: ["微风村", "小小心愿湖"],
    labels: [
      [12, 54],
      [74, 93],
    ],
  },
  {
    points: [
      [110, 380],
      [285, 312],
      [468, 347],
      [669, 260],
      [856, 198],
    ],
    route:
      "M-20 408H70V380H145V351H210V312H310V347H493V321H548V288H614V260H711V232H780V198H890V174H1020",
    places: ["低语树屋", "萤火溪谷"],
    labels: [
      [10, 46],
      [66, 87],
    ],
  },
  {
    points: [
      [105, 360],
      [304, 390],
      [478, 298],
      [671, 340],
      [867, 249],
    ],
    route:
      "M-20 360H190V390H334V353H392V298H530V319H600V340H733V294H802V249H905V218H1020",
    places: ["沉睡的星盘", "回声之门"],
    labels: [
      [32, 45],
      [75, 38],
    ],
  },
  {
    points: [
      [106, 385],
      [292, 340],
      [490, 263],
      [684, 304],
      [868, 217],
    ],
    route:
      "M-20 410H68V385H167V364H234V340H336V310H397V283H450V263H548V280H600V304H734V270H795V245H830V217H918V185H1020",
    places: ["暖炉营地", "星光灯塔"],
    labels: [
      [11, 53],
      [79, 28],
    ],
  },
  {
    points: [
      [120, 400],
      [310, 350],
      [510, 395],
      [696, 310],
      [865, 230],
    ],
    route:
      "M-20 400H195V375H250V350H350V370H414V395H546V363H600V335H650V310H737V284H800V255H865V230H935V188H1020",
    places: ["时光画廊", "创造者的殿堂"],
    labels: [
      [25, 48],
      [74, 32],
    ],
  },
] as const;

function Trail({
  chapter,
  edge,
  fill,
}: {
  chapter: number;
  edge: string;
  fill: string;
}) {
  return (
    <g fill="none" strokeLinejoin="miter">
      <path d={WORLD_LAYOUTS[chapter].route} stroke={edge} strokeWidth="44" />
      <path d={WORLD_LAYOUTS[chapter].route} stroke={fill} strokeWidth="32" />
      {chapter === 4 && (
        <path
          d={WORLD_LAYOUTS[chapter].route}
          stroke="#e0b875"
          strokeWidth="21"
          strokeDasharray="2 17"
          opacity=".42"
        />
      )}
    </g>
  );
}

function Fir({
  x,
  y,
  scale = 1,
  snow = false,
}: {
  x: number;
  y: number;
  scale?: number;
  snow?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-6-20H6V18H-6Z" fill={snow ? "#64687a" : "#453f38"} />
      <path
        d="M0-105H8V-88H17V-70H27V-51H37V-30H48V-10H-48V-30H-37V-51H-27V-70H-17V-88H-8V-105Z"
        fill={snow ? "#648398" : "#204c45"}
      />
      <path
        d="M0-105H8V-89H18V-71H-18V-89H-8V-105ZM-25-62H25V-49H36V-37H-36V-49H-25ZM-37-28H37V-16H46V-9H-46V-16H-37Z"
        fill={snow ? "#edf5f1" : "#32675a"}
      />
      <path
        d="M0-86H8V-72H0ZM-28-52H-12V-39H-28ZM10-28H34V-16H10Z"
        fill={snow ? "#bed9e0" : "#487d61"}
      />
    </g>
  );
}

function Mushroom({ x, y, lit }: { x: number; y: number; lit: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {lit && (
        <rect
          x="-20"
          y="-28"
          width="40"
          height="36"
          fill="#8ed3b0"
          opacity=".12"
        />
      )}
      <path d="M-3-8H3V7H-3Z" fill="#c4d6ba" />
      <path
        d="M-15-8V-15H-10V-21H8V-17H14V-8Z"
        fill={lit ? "#9bd4b5" : "#547e76"}
      />
      <path d="M-8-17H-4V-13H-8ZM5-14H9V-10H5Z" fill="#e2eabc" />
    </g>
  );
}

function Forest({ progress }: { progress: number }) {
  return (
    <g>
      <rect width="1000" height="520" fill="#315e53" />
      <path
        d="M0 175H117V154H266V177H386V131H557V151H737V126H872V162H1000V520H0Z"
        fill="#417565"
      />
      <path
        d="M0 427H146V403H293V439H453V405H663V428H810V385H1000V520H0Z"
        fill="#244e49"
      />
      {Array.from({ length: 13 }, (_, i) => (
        <g key={i} transform={`translate(${i * 89 - 20} 0)`}>
          <rect
            x="12"
            y="0"
            width="23"
            height={142 + (i % 3) * 25}
            fill="#203f3b"
          />
          <path
            d="M-23 0H77V37H65V60H48V82H-12V59H-30Z"
            fill={i % 2 ? "#1d443d" : "#275348"}
          />
        </g>
      ))}
      <path
        d="M992 82H927V160H894V213H780V260H718V332H645V377H665V426H597V520"
        fill="none"
        stroke="#244c4b"
        strokeWidth="65"
      />
      <path
        d="M992 82H927V160H894V213H780V260H718V332H645V377H665V426H597V520"
        fill="none"
        stroke="#609b91"
        strokeWidth="44"
      />
      <path
        d="M913 157H936M657 362H674M607 493H636M691 316H719"
        stroke="#a8cbb0"
        strokeWidth="4"
        className="stream-glimmer"
      />
      <g transform="translate(788 111)">
        <path d="M-35 9H35V77H57V91H-67V79H-36Z" fill="#705c43" />
        <path d="M-15 2H3V81H-15ZM22 4H32V63H22Z" fill="#907755" />
        <path
          d="M-128-14V-45H-103V-76H-75V-103H-34V-124H34V-112H80V-87H118V-56H145V-17H123V12H79V34H-65V18H-107V-14Z"
          fill="#183f3b"
        />
        <path
          d="M-112-24V-50H-86V-80H-42V-99H25V-87H72V-65H106V-38H123V-16H71V3H-47V-8H-84V-24Z"
          fill="#316851"
        />
        <path
          d="M-71-51H-23V-72H28V-58H60V-39H29V-24H-26V-31H-71Z"
          fill="#568563"
        />
        <path
          d="M-69 7V61H-55V82M80 5V46H64V69M-105-1V37"
          stroke="#7ca37b"
          strokeWidth="4"
          fill="none"
        />
        <path
          d="M-4 53H12V67H-4Z"
          fill={progress === 5 ? "#e6e0a4" : "#274f47"}
          className={progress === 5 ? "forest-light" : ""}
        />
      </g>
      <g transform="translate(165 188)">
        <path d="M-18-65H2V30H-18ZM-46 27H26V34H-46Z" fill="#544936" />
        <path d="M-64-27H37V17H-64Z" fill="#a88a58" />
        <path
          d="M-73-28V-42H-57V-55H-39V-69H13V-57H31V-42H45V-28Z"
          fill="#719577"
        />
        <path d="M-68-34H40V-26H-68ZM-51 20H43V27H-51Z" fill="#d1bf87" />
        <rect
          x="-43"
          y="-14"
          width="18"
          height="19"
          fill={progress > 0 ? "#f4d893" : "#3b5a4d"}
        />
        <path d="M1-6H20V18H1Z" fill="#4d503b" />
        <path
          d="M-19 31V77M3 31V77M-19 39H3M-19 51H3M-19 63H3"
          stroke="#b49d70"
          strokeWidth="4"
        />
      </g>
      <Trail chapter={1} edge="#365148" fill="#859979" />
      <g stroke="#c0a371" strokeWidth="6">
        <path d="M703 245V275M716 235V265M729 225V255M742 222V251" />
        <path
          d="M697 235L750 212M697 283L750 260"
          stroke="#6f6650"
          strokeWidth="3"
        />
      </g>
      {[
        [24, 254, 1.25],
        [52, 492, 1.2],
        [336, 198, 1.35],
        [411, 510, 1.1],
        [567, 168, 0.8],
        [969, 364, 1.2],
        [907, 487, 1.4],
      ].map(([x, y, s], i) => (
        <Fir key={i} x={x} y={y} scale={s} />
      ))}
      {[
        [219, 269],
        [361, 432],
        [544, 385],
        [800, 341],
        [865, 445],
        [446, 236],
        [78, 320],
      ].map(([x, y], i) => (
        <Mushroom key={i} x={x} y={y} lit={progress >= (i % 5) + 1} />
      ))}
      {Array.from({ length: 22 }, (_, i) => (
        <rect
          key={i}
          x={(i * 137 + 80) % 980}
          y={105 + ((i * 61) % 355)}
          width="3"
          height="4"
          fill="#dee9a5"
          opacity={0.25 + progress * 0.12}
          className="forest-light"
          style={{ animationDelay: `${i * 0.3}s` }}
        />
      ))}
      <g
        className="forest-mist"
        fill="#a6c8b7"
        opacity={0.14 - progress * 0.018}
      >
        <path d="M-30 206H273V217H411V228H113V220H-30ZM559 370H944V383H1030V394H790V383H559Z" />
      </g>
    </g>
  );
}

function Ruins({ progress }: { progress: number }) {
  return (
    <g>
      <rect width="1000" height="520" fill="#dcc093" />
      <path
        d="M0 73H72V31H157V70H233V43H293V94H392V69H466V105H561V30H637V68H713V13H819V57H911V25H1000V177H0Z"
        fill="#b18c6c"
      />
      <path
        d="M0 124H121V97H214V126H334V102H445V150H576V112H698V91H796V131H884V86H1000V211H0Z"
        fill="#cda679"
      />
      <path
        d="M0 431H109V446H251V424H384V466H518V451H676V438H820V408H1000V520H0Z"
        fill="#b79468"
      />
      <path
        d="M0 449H121V471H262V448H365V492H528V473H673V462H834V434H1000"
        fill="none"
        stroke="#987454"
        strokeWidth="9"
      />
      {Array.from({ length: 48 }, (_, i) => (
        <path
          key={i}
          d={`M${(i * 137 + 29) % 1000} ${110 + ((i * 71) % 400)}h${12 + (i % 4) * 6}v4h-8v4h-11`}
          fill="#bc996b"
          opacity=".45"
        />
      ))}
      <g transform="translate(775 182)">
        <path
          d="M-113 10V-111H-89V-147H-29V-169H29V-148H81V-116H105V10H66V-89H39V-113H-35V-91H-72V10Z"
          fill="#8c8067"
        />
        <path
          d="M-100-10V-104H-76V-133H-22V-151H20V-132H68V-107H92V-11H80V-99H57V-120H-50V-99H-85V-10Z"
          fill="#eee0b2"
        />
        <path d="M-75 11V-86H-41V-110H42V-83H67V11Z" fill="#756d5b" />
        <path
          d="M-46 9V-74H-26V-88H25V-73H44V9Z"
          fill={progress === 5 ? "#95d1bf" : "#405e5c"}
        />
        <path d="M-126 14H122V26H-126ZM-136 29H132V40H-136Z" fill="#a99a7b" />
        {[-96, 79].map((x, i) => (
          <path
            key={x}
            d={`M${x} -75h9v14h-9v12h9`}
            fill="none"
            stroke={progress >= i + 3 ? "#a0e1c8" : "#c1b38d"}
            strokeWidth="3"
          />
        ))}
      </g>
      <g transform="translate(370 195)">
        <path
          d="M-86-33H-56V-54H56V-32H86V29H54V49H-54V29H-86Z"
          fill="#aa9670"
        />
        <path
          d="M-65-23H-42V-39H42V-22H64V19H39V34H-40V19H-65Z"
          fill="#516f69"
        />
        <path
          d="M-49-13H-28V-28H28V-12H48V10H28V23H-28V9H-49Z"
          fill="#79aa95"
        />
        <path
          d="M0-48V42M-73-1H72M-37-27L40 26M-39 26L39-28"
          stroke="#d7bf81"
          strokeWidth="4"
        />
        <path
          d="M-11-10H11V11H-11Z"
          fill={progress > 1 ? "#ecdc92" : "#80947b"}
          className={progress > 1 ? "rune-glow" : ""}
        />
      </g>
      {[100, 215, 524, 921].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i % 2 ? 251 : 209})`}>
          <path d="M-21 0V-86H-13V-105H10V-93H23V0Z" fill="#a39a7a" />
          <path d="M-14-81H-5V-5H-14ZM8-81H13V-5H8Z" fill="#d8c79d" />
          <path d="M-31 0H32V12H-31ZM-29-93H29V-82H-29Z" fill="#beb08b" />
          <path
            d="M-19-67L9-51L-4-27"
            stroke="#817f65"
            strokeWidth="3"
            fill="none"
          />
        </g>
      ))}
      <Trail chapter={2} edge="#a99775" fill="#ece0b4" />
      {WORLD_LAYOUTS[2].points.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y + 9})`}>
          <path
            d="M-26-15H26V15H-26Z"
            fill="none"
            stroke={progress > i ? "#85bca6" : "#c7b586"}
            strokeWidth="3"
          />
        </g>
      ))}
      {[
        [57, 458],
        [443, 447],
        [778, 423],
        [882, 359],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M-19-35H13V-25H25V0H-26V-16H-19Z" fill="#ad9e7b" />
          <path d="M-19-35H13V-27H-14V-15H-26V-23H-19Z" fill="#dbc59b" />
          <path
            d="M1-19V-9H11"
            stroke={progress > i ? "#80c6b0" : "#837c60"}
            strokeWidth="4"
            fill="none"
          />
        </g>
      ))}
      <g fill="#75866c">
        <path d="M40 333V303H46V315H55V290H62V323H47V333ZM564 460V429H570V442H581V421H588V449H571V460ZM965 420V392H973V404H984V384H990V411H973V420Z" />
      </g>
      <g className="ruin-dust" fill="#f5deb0" opacity=".65">
        <path d="M134 275h20v3h-20ZM579 158h22v3h-22ZM819 397h27v3h-27ZM258 446h17v3h-17Z" />
      </g>
    </g>
  );
}

function Snow({ progress }: { progress: number }) {
  return (
    <g>
      <rect width="1000" height="520" fill="#b7d3e0" />
      <rect width="1000" height="158" fill="#627f9b" />
      <g
        className="aurora"
        fill="none"
        strokeWidth="19"
        opacity={0.18 + progress * 0.055}
      >
        <path
          d="M-30 69L114 31L288 59L427 16L623 38L781 4L1030 30"
          stroke="#9cdbc5"
        />
        <path
          d="M-30 86L114 48L288 76L427 33L623 55L781 21L1030 47"
          stroke="#abb5df"
        />
      </g>
      <path
        d="M-40 221L98 60L164 130L266 25L411 220L571 44L704 217L802 65L1040 219Z"
        fill="#8da9bc"
      />
      <path
        d="M190 123L266 25L342 127L306 114L276 141L249 99L223 128ZM489 144L571 44L650 141L610 123L579 153L547 116L521 143ZM43 121L98 60L151 122L126 111L102 133L80 113Z"
        fill="#eef4ec"
      />
      <path
        d="M0 221H171V201H320V228H426V208H577V231H723V198H862V179H1000V520H0Z"
        fill="#dce9e7"
      />
      <path
        d="M0 464H125V439H264V460H376V432H479V445H639V420H749V435H882V413H1000V520H0Z"
        fill="#a8c9d6"
      />
      <path
        d="M535 162H518V215H468V296H512V355H563V409H609V520"
        fill="none"
        stroke="#789bb4"
        strokeWidth="42"
      />
      <path
        d="M535 162H518V215H468V296H512V355H563V409H609V520"
        fill="none"
        stroke="#4d728d"
        strokeWidth="18"
      />
      <Trail chapter={3} edge="#aac4cf" fill="#f3f1de" />
      <g transform="translate(489 263)">
        <path d="M-41-16H41V18H-41Z" fill="#a99172" />
        {[-35, -23, -11, 1, 13, 25, 37].map((x) => (
          <path key={x} d={`M${x}-15V18`} stroke="#735f53" strokeWidth="3" />
        ))}
        <path
          d="M-44-27V21M44-27V21M-44-23H44"
          stroke="#6b6770"
          strokeWidth="4"
        />
      </g>
      <g transform="translate(174 236)">
        <path d="M-54-35H55V21H-54Z" fill="#847264" />
        <path
          d="M-69-32V-46H-49V-62H-29V-79H24V-63H46V-48H68V-33Z"
          fill="#6b7381"
        />
        <path
          d="M-69-41H-49V-58H-29V-75H24V-59H46V-45H68V-33H-69Z"
          fill="#f3f5e9"
        />
        <path
          d="M-51-18H51M-51-6H51M-51 8H51"
          stroke="#685d58"
          strokeWidth="3"
        />
        <rect
          x="-39"
          y="-19"
          width="19"
          height="23"
          fill={progress > 0 ? "#f7d183" : "#697d8a"}
        />
        <rect
          x="22"
          y="-19"
          width="19"
          height="23"
          fill={progress > 0 ? "#f7d183" : "#697d8a"}
        />
        <path d="M-7-12H10V22H-7ZM35-78H46V-47H35Z" fill="#665b57" />
        <path
          className="smoke"
          d="M39-83V-94H49V-105"
          stroke="#e7eee3"
          strokeWidth="5"
          fill="none"
        />
      </g>
      <g transform="translate(873 151)">
        <path d="M-30 8L-18-85H20L31 8Z" fill="#8194a3" />
        <path d="M-37-84H37V-111H-37Z" fill="#485c76" />
        <path d="M-40-113H-23V-131H25V-114H41V-105H-40Z" fill="#e4eeec" />
        <rect
          x="-24"
          y="-102"
          width="48"
          height="16"
          fill={progress === 5 ? "#ffe3a0" : "#9fb8c4"}
        />
        {progress === 5 && (
          <path
            d="M-29-104L-186-146V-54L-29-87ZM30-104L126-145V-56L30-87Z"
            fill="#ffe9aa"
            opacity=".19"
            className="forest-light"
          />
        )}
        <path d="M-37 8H39V18H-37Z" fill="#eaf2eb" />
      </g>
      {[
        [42, 270, 1],
        [76, 512, 1.25],
        [335, 227, 0.8],
        [372, 428, 0.85],
        [729, 455, 1.3],
        [971, 321, 1.15],
        [945, 481, 1],
      ].map(([x, y, s], i) => (
        <Fir key={i} x={x} y={y} scale={s} snow />
      ))}
      <g transform="translate(222 279)">
        <path d="M-12 6H13M-8 10L8 2" stroke="#806554" strokeWidth="5" />
        <path
          d="M-9 0V-11H-3V-23H3V-13H10V0Z"
          fill={progress > 0 ? "#e9a461" : "#91acb7"}
        />
        {progress > 0 && (
          <path
            d="M-3 0V-10H3V-16H6V0Z"
            fill="#ffe2a2"
            className="forest-light"
          />
        )}
      </g>
      {Array.from({ length: 27 }, (_, i) => (
        <rect
          key={i}
          x={(i * 139 + 33) % 1000}
          y={(i * 83 + 19) % 500}
          width={i % 2 ? 3 : 5}
          height="4"
          fill="#f9fcf5"
          className="snow-flake"
          style={{ animationDelay: `-${i * 0.23}s` }}
        />
      ))}
    </g>
  );
}

function Castle({
  progress,
  artworks,
}: {
  progress: number;
  artworks: Artwork[];
}) {
  return (
    <g>
      <rect width="1000" height="520" fill="#716b88" />
      <path d="M0 195H1000V520H0Z" fill="#aaa0b5" />
      {Array.from({ length: 10 }, (_, i) => (
        <path
          key={i}
          d={`M${i * 125 - 170} 520L${i * 88 + 30} 194M0 ${215 + i * 37}H1000`}
          stroke="#8f839f"
          strokeWidth="2"
          fill="none"
        />
      ))}
      <path d="M0 188H1000V207H0ZM0 44H1000V55H0Z" fill="#b6a98f" />
      <path d="M0 207H1000V217H0Z" fill="#584f6d" />
      {[80, 500, 894].map((x, i) => (
        <g key={x} transform={`translate(${x} 73)`}>
          <path
            d="M-38 82V-15H-26V-37H-11V-52H11V-37H26V-15H38V82Z"
            fill="#c6b894"
          />
          <path
            d="M-29 74V-12H-20V-31H-7V-42H7V-31H20V-12H29V74Z"
            fill="#617c94"
          />
          <path
            d="M-25 12H25V70H-25Z"
            fill={progress >= i + 1 ? "#dcb381" : "#9b92b6"}
          />
          <path
            d="M-24 16L0-30L24 16L0 47ZM-26 68L0 42L26 68Z"
            fill={progress >= i + 1 ? "#f0d69d" : "#b1bccc"}
          />
          <path
            d="M0-39V73M-28 16H28M-27 49H27"
            stroke="#c4b489"
            strokeWidth="4"
          />
          {progress >= i + 1 && (
            <path d="M-25 90H25L96 197H-96Z" fill="#f0d2a3" opacity=".13" />
          )}
        </g>
      ))}
      {[173, 748].map((x) => (
        <g key={x}>
          <path d={`M${x} 64h47v109l-24 19-23-19Z`} fill="#895975" />
          <path
            d={`M${x + 21} 93h6v13h13v6h-13v14h-6v-14h-13v-6h13Z`}
            fill="#dfbd79"
          />
          <path d={`M${x - 6} 61h59`} stroke="#d2b67a" strokeWidth="5" />
        </g>
      ))}
      <Trail chapter={4} edge="#d5b986" fill="#945e78" />
      <g transform="translate(865 230)">
        <path d="M-63-14H65V17H-63Z" fill="#c0ad9d" />
        <path d="M-55-20H57V8H-55Z" fill="#d4c4ae" />
        <path d="M-45-23H47V0H-45Z" fill="#8e5c74" />
      </g>
      {[247, 335, 580, 668, 940].map((x, i) => {
        const art = artworks.find((a) => a.node === 21 + i);
        return (
          <g key={i} transform={`translate(${x} ${i === 4 ? 310 : 113})`}>
            <path d="M-32-12H33V68H-32Z" fill="#51475e" />
            <path d="M-30-14H30V63H-30Z" fill="#d0ae76" />
            <path d="M-24-8H24V57H-24Z" fill="#8f829a" />
            {art ? (
              <image
                href={art.imageUrl}
                x="-22"
                y="-6"
                width="44"
                height="61"
                preserveAspectRatio="xMidYMid meet"
              />
            ) : (
              <path
                d="M-3 15H3V23H11V29H3V37H-3V29H-11V23H-3Z"
                fill="#b7a8b8"
                opacity=".6"
              />
            )}
            <path d="M-10 73H10V78H-10Z" fill="#d5bb88" />
          </g>
        );
      })}
      {[27, 408, 786, 986].map((x) => (
        <g key={x} transform={`translate(${x} 200)`}>
          <path d="M-16-160H17V25H-16Z" fill="#b4a9b5" />
          <path d="M-9-149H0V18H-9Z" fill="#d2c7c7" />
          <path d="M-25-161H26V-148H-25ZM-26 20H27V35H-26Z" fill="#d7c7ac" />
          <path d="M-21-147H22V-137H-21Z" fill="#8f859c" />
        </g>
      ))}
      <g transform="translate(503 64)">
        <path
          d="M0-64V-11M-52 4H52M-35-13V4M0-22V4M35-13V4"
          stroke="#c2a16b"
          strokeWidth="4"
        />
        {[-35, 0, 35].map((x, i) => (
          <g key={x}>
            <rect
              x={x - 4}
              y={i === 1 ? -31 : -23}
              width="8"
              height="13"
              fill="#eeddb8"
            />
            <rect
              x={x - 2}
              y={i === 1 ? -36 : -28}
              width="4"
              height="7"
              fill={progress > 0 ? "#ffdf91" : "#aea3af"}
            />
          </g>
        ))}
      </g>
      <g fill="#d4bb81" opacity=".55">
        <path d="M140 467h9v9h-9ZM372 291h8v8h-8ZM576 474h9v9h-9ZM845 410h9v9h-9Z" />
      </g>
    </g>
  );
}

export default function ChapterScenery({
  chapter,
  progress,
  artworks,
}: {
  chapter: number;
  progress: number;
  artworks: Artwork[];
}) {
  if (chapter === 1) return <Forest progress={progress} />;
  if (chapter === 2) return <Ruins progress={progress} />;
  if (chapter === 3) return <Snow progress={progress} />;
  return <Castle progress={progress} artworks={artworks} />;
}

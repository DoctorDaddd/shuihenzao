export const REWARD_STAGES = [
  { node: 3, name: "启程的礼物" },
  { node: 5, name: "究极宝箱" },
  { node: 10, name: "传说宝箱" },
  { node: 15, name: "完美宝箱" },
  { node: 20, name: "苍穹宝箱" },
  { node: 25, name: "元始宝箱" },
] as const;
// November 7 is inclusive: the countdown ends at midnight in Beijing.
export const QUEST_ENDS_AT = Date.parse("2026-11-08T00:00:00+08:00");
export function questCountdown(now: number, count: number | null) {
  const total = Math.max(0, Math.ceil((QUEST_ENDS_AT - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    phase: count === null ? "loading"
      : count >= 25 ? "complete"
      : total === 0 ? "expired"
      : total <= 86400 ? "urgent"
      : total <= 7 * 86400 ? "soon" : "active",
  };
}
export const CHAPTERS = [
  {
    name: "帝国南方堡",
    label: "穿过钢铁的防线",
    subtitle: "用第一抹色彩，点亮魔导要塞的长夜。",
    color: "#dc7465",
    icon: "shield",
  },
  {
    name: "巴哈姆特大迷宫",
    label: "深入陨落的月影",
    subtitle: "循着以太的微光，画下沉睡深处的回响。",
    color: "#79cfda",
    icon: "gem",
  },
  {
    name: "亚历山大机神城",
    label: "让时光再次转动",
    subtitle: "在齿轮与蒸汽之间，留下只属于你的这一刻。",
    color: "#c9a46c",
    icon: "cog",
  },
  {
    name: "苍穹之禁城",
    label: "抵达苍穹的彼端",
    subtitle: "越过浮空圣域，让画笔与群星一同闪耀。",
    color: "#badde7",
    icon: "landmark",
  },
  {
    name: "时空裂缝",
    label: "在无垠之间落笔",
    subtitle: "跨过最后的边界，二十五幅色彩连成新的世界。",
    color: "#96ddd5",
    icon: "orbit",
  },
] as const;
export interface Artwork {
  id: string;
  node: number;
  image_key?: string;
  title: string;
  created_date: string;
  mood: string;
  note: string;
  uploaded_at: string;
  imageUrl: string;
  thumbnailUrl?: string;
  version?: number;
}
export interface Reward {
  node: number;
  amount: number | null;
  name: string;
  unlocked_at: string | null;
  opened_at: string | null;
  paid_at: string | null;
  payment_note: string;
}
export interface Letter {
  id: string;
  node: number;
  title: string;
  body?: string;
  published: number;
  read_at: string | null;
  unlocked?: boolean;
}
export interface QuestState {
  role: "admin" | "hero" | "visitor";
  uid?: string;
  revision?: number;
  artworks: Artwork[];
  rewards: Reward[];
  letters: Letter[];
}
export function chapterFor(count: number) {
  return Math.min(4, Math.floor(Math.max(0, count - 1) / 5));
}
export const GUARDIANS = [
  { name: "究极神兵", color: "#e67862" },
  { name: "至尊巴哈姆特", color: "#e8bf62" },
  { name: "完美亚历山大", color: "#e8dcc1" },
  { name: "龙威骑神托尔丹·伪典", color: "#a9dce8" },
  { name: "阿尔法欧米茄", color: "#96ddd5" },
] as const;
export function completedChapter(count: number): number | null {
  return Number.isInteger(count) && count >= 5 && count <= 25 && count % 5 === 0
    ? count / 5 - 1 : null;
}
export const CHAPTER_TITLES = ["究极", "传奇", "完美", "苍穹", "元始"] as const;
export function earnedTitles(rewards: readonly Pick<Reward, "node" | "unlocked_at">[]) {
  return CHAPTER_TITLES.filter((_, i) => rewards.some(r => r.node === (i + 1) * 5 && !!r.unlocked_at));
}
export type Companion = "ruby" | "topaz" | "sapphire";
export interface HeroCosmetics {
  companions: readonly Companion[];
  glowingWeapon: boolean;
}
export const CHAPTER_PRIZES: readonly {
  node: number; message: string; companion?: Companion; glowingWeapon?: boolean;
}[] = [
  { node: 5, companion: "ruby", message: "咦？神奇的红宝石兽冒了出来非要跟随勇者！" },
  { node: 10, companion: "topaz", message: "咦？神奇的黄宝石兽冒了出来非要跟随勇者！" },
  { node: 15, glowingWeapon: true, message: "哇，是游戏里还没有实装的绝亚发光画家武器！" },
  { node: 20, companion: "sapphire", message: "咦？神奇的蓝宝石兽冒了出来非要跟随勇者！" },
  { node: 25, message: "恭喜勇者五绝通关！成为五绝高手！" },
];
// Like titles, appearances follow persisted unlocks, not the viewed map or current artwork count.
export function earnedCosmetics(rewards: readonly Pick<Reward, "node" | "unlocked_at">[]): HeroCosmetics {
  const prizes = CHAPTER_PRIZES.filter(p => rewards.some(r => r.node === p.node && !!r.unlocked_at));
  return {
    companions: prizes.flatMap(p => p.companion ? [p.companion] : []),
    glowingWeapon: prizes.some(p => p.glowingWeapon),
  };
}
export function rewardState(r: Reward) {
  return r.paid_at
    ? "已发放"
    : r.opened_at
      ? "已开启 · 待发放"
      : r.unlocked_at
        ? "可开启"
        : "未解锁";
}
export function localDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const parsed = new Date(value + "T00:00:00Z");
  return (
    !isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value
  );
}
export function imageType(bytes: Uint8Array) {
  if (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n)
  )
    return "image/png";
  if (
    bytes.length >= 3 &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255
  )
    return "image/jpeg";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "image/webp";
  return null;
}
export function artworkFields(
  data: { get: (key: string) => unknown },
  node: number,
) {
  const read = (key: string, max: number) => {
    const value = data.get(key);
    if (value !== null && value !== undefined && typeof value !== "string")
      throw new Error("作品信息格式不正确。");
    if (String(value ?? "").length > max)
      throw new Error("文字太长了，请稍微缩短一些。");
    return String(value ?? "").trim();
  };
  const createdDate = read("created_date", 10) || localDate();
  if (!validDate(createdDate)) throw new Error("请填写有效的创作日期。");
  return {
    title: read("title", 100) || `第 ${node} 次冒险`,
    createdDate,
    mood: read("mood", 40),
    note: read("note", 2000),
  };
}

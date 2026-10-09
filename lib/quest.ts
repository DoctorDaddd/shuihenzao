export const REWARD_STAGES = [
  { node: 3, name: "启程的礼物" },
  { node: 5, name: "草原宝箱" },
  { node: 10, name: "森林宝箱" },
  { node: 15, name: "遗迹宝箱" },
  { node: 20, name: "雪山宝箱" },
  { node: 25, name: "传说宝箱" },
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
    name: "初始草原",
    label: "风起的地方",
    subtitle: "每一笔，都让这个世界更明亮一点。",
    color: "#507645",
    icon: "sprout",
  },
  {
    name: "迷雾森林",
    label: "循着微光前行",
    subtitle: "雾气慢慢散开，新的故事正在生长。",
    color: "#356662",
    icon: "tree",
  },
  {
    name: "古代遗迹",
    label: "唤醒沉睡的灵感",
    subtitle: "你的创造力，是打开古老大门的钥匙。",
    color: "#a07b50",
    icon: "landmark",
  },
  {
    name: "雪山试炼",
    label: "雪色里的暖意",
    subtitle: "那些留下的色彩，会为你点亮远方。",
    color: "#718faa",
    icon: "mountain",
  },
  {
    name: "最终城堡",
    label: "献给创造者的城堡",
    subtitle: "这里收藏的，都是独一无二的你。",
    color: "#8b729e",
    icon: "castle",
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
  { name: "龙神巴哈姆特", color: "#e8bf62" },
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

export const GUARDIAN_INTROS = [
  { english: 'THE ULTIMA WEAPON', location: '帝国南方堡 · 最后的防线', line: '钢铁之躯，于长夜中苏醒。', theme: 'ultima', duration: 5400, reveal: 3888, cue: '魔导核心 · 启动', beats: ['足部', '胸甲', '红光', '全身'] },
  { english: 'GOLDEN BAHAMUT', location: '巴哈姆特大迷宫 · 陨月之下', line: '黄金双翼，遮蔽陨落的月影。', theme: 'bahamut', duration: 6000, reveal: 4320, cue: '天地震颤 · 龙吟', beats: ['陨月', '巨翼', '龙吟', '全身'] },
  { english: 'PERFECT ALEXANDER', location: '亚历山大机神城 · 时间尽头', line: '指针停摆，机神立于时间尽头。', theme: 'alexander', duration: 5800, reveal: 4176, cue: '时间停止', beats: ['时轮', '巨掌', '停时', '全身'] },
  { english: 'DRAGON-KING THORDAN', location: '苍穹之禁城 · 龙诗终末', line: '双剑交错，龙威自苍穹降临。', theme: 'thordan', duration: 5400, reveal: 3888, cue: '龙诗终末', beats: ['剑锋', '龙眼', '双斩', '全身'] },
  { english: 'ALPHA OMEGA', location: '时空裂缝 · 终极验证', line: '六臂临空，超越终点的答案。', theme: 'omega', duration: 5600, reveal: 4032, cue: 'α · Ω', beats: ['面孔', '核心', '六臂', '全身'] },
] as const;

export function guardianAtGate(count: number) {
  return Number.isInteger(count) && count >= 4 && count <= 24 && count % 5 === 4 ? Math.floor(count / 5) : null;
}

export function shouldIntroduceGuardian(previousCount: number, nextCount: number, seen: boolean) {
  return !seen && nextCount === previousCount + 1 && guardianAtGate(nextCount) !== null;
}

import test from "node:test";
import assert from "node:assert/strict";
import {
  REWARD_STAGES,
  chapterFor,
  completedChapter,
  CHAPTER_TITLES,
  earnedTitles,
  validDate,
  imageType,
  artworkFields,
  rewardState,
  QUEST_ENDS_AT,
  questCountdown,
} from "../lib/quest.ts";

test("终章倒计时包含北京时间 11 月 7 日全天，临界点与完成状态正确", () => {
  assert.equal(QUEST_ENDS_AT, Date.parse("2026-11-07T16:00:00Z"));
  assert.deepEqual(questCountdown(Date.parse("2026-11-06T20:55:54+08:00"), 2), {
    days: 1, hours: 3, minutes: 4, seconds: 6, phase: "soon",
  });
  assert.equal(questCountdown(QUEST_ENDS_AT - 7 * 86400000 - 1, 2).phase, "active");
  assert.equal(questCountdown(QUEST_ENDS_AT - 7 * 86400000, 2).phase, "soon");
  assert.equal(questCountdown(QUEST_ENDS_AT - 86400000, 2).phase, "urgent");
  assert.equal(questCountdown(QUEST_ENDS_AT - 1, 2).seconds, 1);
  for (const now of [QUEST_ENDS_AT, QUEST_ENDS_AT + 86400000]) {
    assert.deepEqual(questCountdown(now, 2), {
      days: 0, hours: 0, minutes: 0, seconds: 0, phase: "expired",
    });
    assert.equal(questCountdown(now, 25).phase, "complete");
  }
  assert.equal(questCountdown(QUEST_ENDS_AT - 86400000, 25).phase, "complete");
  assert.equal(questCountdown(QUEST_ENDS_AT, null).phase, "loading");
});

test("公开奖励配置只包含节点和名称，不包含金额", () => {
  assert.deepEqual(REWARD_STAGES.map(r => r.node), [3,5,10,15,20,25]);
  assert.ok(REWARD_STAGES.every(r => Object.keys(r).sort().join(',') === 'name,node'));
});
test("章节边界和通关保持在第五章", () => {
  assert.deepEqual(
    [0, 1, 5, 6, 10, 11, 15, 16, 20, 21, 25].map(chapterFor),
    [0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4],
  );
});
test("只有五章终点触发章节庆祝，奖励节点 3 与普通上传不触发", () => {
  assert.deepEqual([5, 10, 15, 20, 25].map(completedChapter), [0, 1, 2, 3, 4]);
  for (const count of [-5, 0, 1, 3, 4, 6, 9, 11, 14, 16, 19, 21, 24, 26, 30, 5.5, NaN]) {
    assert.equal(completedChapter(count), null);
  }
});
test("踏破称号随五章里程碑累积，不依赖开箱或当前作品数量", () => {
  assert.deepEqual(CHAPTER_TITLES, ["究极", "传奇", "完美", "苍穹", "元始"]);
  for (const count of [0, 3, 4, 5, 9, 10, 14, 15, 19, 20, 24, 25]) {
    const rewards = REWARD_STAGES.map(r => ({ node: r.node, unlocked_at: r.node <= count ? "2026-10-09" : null }));
    assert.deepEqual(earnedTitles(rewards), CHAPTER_TITLES.slice(0, Math.floor(count / 5)));
  }
  const retained = [{ node: 10, unlocked_at: "earlier" }, { node: 5, unlocked_at: "earlier" }, { node: 3, unlocked_at: "earlier" }];
  assert.deepEqual(earnedTitles(retained), ["究极", "传奇"]);
  assert.deepEqual(earnedTitles([]), []);
});
test("实际日期校验包括闰年和不存在的日期", () => {
  assert.ok(validDate("2024-02-29"));
  assert.ok(validDate("2026-09-21"));
  for (const value of [
    "2026-02-29",
    "2026-04-31",
    "bad",
    "",
    "2026-1-01",
    null,
  ])
    assert.equal(validDate(value), false);
});
test("仅接受三种图片文件签名", () => {
  assert.equal(
    imageType(Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10])),
    "image/png",
  );
  assert.equal(imageType(Uint8Array.from([255, 216, 255])), "image/jpeg");
  assert.equal(
    imageType(new TextEncoder().encode("RIFFxxxxWEBP")),
    "image/webp",
  );
  assert.equal(
    imageType(new TextEncoder().encode("<svg onload=alert(1)>")),
    null,
  );
});
test("可跳过文字字段，历史日期保留且限制超长输入", () => {
  const values = new Map([["created_date", "2025-01-03"]]);
  assert.equal(artworkFields(values, 2).createdDate, "2025-01-03");
  assert.equal(artworkFields(values, 2).title, "第 2 次冒险");
  values.set("title", "x".repeat(101));
  assert.throws(() => artworkFields(values, 2));
});
test("开启与发放属于不同状态", () => {
  const base = {
    node: 3,
    amount: 100,
    name: "启程",
    unlocked_at: null,
    opened_at: null,
    paid_at: null,
    payment_note: "",
  };
  assert.equal(rewardState(base), "未解锁");
  assert.equal(rewardState({ ...base, unlocked_at: "now" }), "可开启");
  assert.equal(
    rewardState({ ...base, unlocked_at: "now", opened_at: "now" }),
    "已开启 · 待发放",
  );
  assert.equal(
    rewardState({
      ...base,
      unlocked_at: "now",
      opened_at: "now",
      paid_at: "now",
    }),
    "已发放",
  );
});

test("管理密码和签名会话独立于 ChatGPT", async () => {
  const { adminConfigured, passwordMatches, adminSessionCookie, isAdmin, clearAdminCookie } = await import('../lib/admin-auth.ts');
  const password = 'local-unit-test-only-password';
  const url = 'https://example.test/api/quest/state';
  const now = Date.now();
  assert.equal(adminConfigured(undefined), false);
  assert.equal(adminConfigured('short'), false);
  assert.equal(adminConfigured('x'.repeat(257)), false);
  assert.equal(await passwordMatches(password, password), true);
  assert.equal(await passwordMatches('wrong', password), false);
  const cookie = await adminSessionCookie(url, password, now);
  assert.match(cookie, /HttpOnly; SameSite=Strict; Max-Age=28800; Secure/);
  const request = new Request(url, {headers:{cookie:cookie.split(';')[0]}});
  assert.equal(await isAdmin(request, password, now), true);
  assert.equal(await isAdmin(request, password, now + 28800000), false);
  assert.equal(await isAdmin(request, password + 'rotated', now), false);
  assert.equal(await isAdmin(request, undefined, now), false);
  assert.equal(await isAdmin(new Request('https://other.test/',{headers:request.headers}), password, now), false);
  const changed = cookie.split(';')[0].replace(/.$/, cookie.split(';')[0].endsWith('a') ? 'b' : 'a');
  assert.equal(await isAdmin(new Request(url,{headers:{cookie:changed}}), password, now), false);
  assert.equal(await isAdmin(new Request(url,{headers:{cookie:'__Host-brush_admin=admin'}}), password, now), false);
  assert.equal(await isAdmin(new Request(url,{headers:{'oai-authenticated-user-id':'local_seedy','oai-authenticated-user-email':'seedy@sites.test'}}), password, now), false);
  assert.match(clearAdminCookie(url), /Max-Age=0; Secure/);
});

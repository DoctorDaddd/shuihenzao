// Run only against a freshly migrated, isolated local Worker database.
import assert from "node:assert/strict";
const origin = process.env.QUEST_TEST_ORIGIN || "http://127.0.0.1:5174";
if (!["127.0.0.1", "localhost"].includes(new URL(origin).hostname))
  throw new Error("Integration tests may only run against loopback.");
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j9AAAAABJRU5ErkJggg==",
  "base64",
);
let checks = 0;
let adminCookie = "";
function equal(actual, expected, message) {
  assert.deepEqual(actual, expected, message);
  checks++;
  console.log("PASS", message);
}
async function request(
  path,
  { role = "admin", method = "GET", body, raw = false } = {},
) {
  if (method === "POST" && body === undefined) body = {};
  const headers = {};
  if (role === "admin" && adminCookie) headers.cookie = adminCookie;
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }
  const response = await fetch(origin + "/api/quest/" + path, {
    method,
    headers,
    body,
  });
  return {
    status: response.status,
    headers: response.headers,
    body: raw ? await response.arrayBuffer() : await response.json(),
  };
}
async function state(role = "admin") {
  return (await request("state", { role })).body;
}
function form(node, id = crypto.randomUUID(), image = png) {
  const f = new FormData();
  f.set("request_id", id);
  f.set("title", "测试作品 " + node);
  f.set("created_date", node === 1 ? "2025-01-12" : "2025-03-15");
  f.set("note", "测试记录");
  f.set("image", new Blob([image], { type: "image/png" }), "test.png");
  if (node <= 2) f.set("historical", "true");
  return f;
}
equal((await state()).role, "hero", "无账号、无 cookie 可直接进入真实冒险");
equal((await state()).artworks.length, 0, "新冒险从零开始，不显示示例进度");
equal((await state()).rewards.map(r=>r.amount), Array(6).fill(null), "所有未开启宝箱均不返回金额");
equal((await request('open/25',{method:'POST'})).status,409,'尚未解锁不能提前开启宝箱');
equal((await request('read/'+(await state()).letters[0].id,{method:'POST'})).status,403,'尚未解锁不能标记来信已读');
equal((await request('setup',{method:'POST'})).status, 404, "旧管理员抢占入口已移除");
equal((await request('member',{method:'POST'})).status, 404, "旧账号授权入口已移除");
const forged = await fetch(origin + '/api/quest/letter-save', {method:'POST',headers:{'Content-Type':'application/json','oai-authenticated-user-id':'test-admin','oai-authenticated-user-email':'admin@example.test'},body:'{}'});
equal(forged.status,403,"伪造旧账号身份头不能获取管理权限");
equal((await request('admin-login',{method:'POST',body:{password:'wrong'}})).status,401,"错误管理密码被拒绝");
const invalidLogin = await fetch(origin + '/api/quest/admin-login', {method:'POST',headers:{'Content-Type':'application/json'},body:'null'});
equal(invalidLogin.status,400,'无效登录输入返回明确错误');
const brokenLogin = await fetch(origin + '/api/quest/admin-login', {method:'POST',headers:{'Content-Type':'application/json'},body:'{'});
equal(brokenLogin.status,400,'损坏的登录请求不会导致服务端异常');
const login=await request('admin-login',{method:'POST',body:{password:'isolated-test-password-ONLY-2026'}});
equal(login.status,200,"独立管理密码可登录");
assert.match(login.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
adminCookie=login.headers.get('set-cookie').split(';')[0];
equal((await state()).role,'admin','签名 cookie 取得管理身份');
equal((await state()).rewards.map(r=>r.amount), Array(6).fill(null), "管理页面也不提前公布宝箱金额");
equal((await request('artworks',{role:'hero',method:'POST',body:form(1)})).status,403,'历史导入仍仅限管理员');
equal(
  (await request("backup", { role: "hero" })).status,
  403,
  "勇者无法导出管理员私信备份",
);
equal(
  (await request("letter-save", { role: "hero", method: "POST", body: {} }))
    .status,
  403,
  "勇者无法编辑信件",
);
equal(
  (
    await request("artworks", {
      method: "POST",
      body: form(1, crypto.randomUUID(), Buffer.from("<svg>fake</svg>")),
    })
  ).status,
  400,
  "无效图片不会保存",
);
equal((await state()).artworks.length, 0, "上传失败不增加进度");
equal(
  (await request("artworks", { method: "POST", body: form(1) })).status,
  200,
  "历史作品 1 保存",
);
equal(
  (await request("artworks", { method: "POST", body: form(2) })).status,
  200,
  "历史作品 2 保存",
);
let s = await state();
equal(s.artworks.length, 2, "初始真实进度 2/25");
equal(s.artworks[0].created_date, "2025-01-12", "历史创作日期未被导入日期覆盖");
equal(
  (await request("image/" + s.artworks[0].id, { role: "stranger", raw: true }))
    .status,
  200,
  "未登录访客可以读取作品图片",
);
equal(
  (await request("image/" + s.artworks[0].id, { role: "hero", raw: true }))
    .status,
  200,
  "无需登录即可读取原图",
);
equal(
  (await state("hero")).letters.every((l) => l.body === null),
  true,
  "未解锁信件正文不返回给勇者",
);
const sameId = crypto.randomUUID();
function imageOnlyForm(id) {
  const data = new FormData();
  data.set("request_id", id);
  data.set("image", new Blob([png], { type: "image/png" }), "test.png");
  return data;
}
const concurrent = await Promise.all([
  request("artworks", { role: "hero", method: "POST", body: imageOnlyForm(sameId) }),
  request("artworks", { role: "hero", method: "POST", body: imageOnlyForm(sameId) }),
]);
equal(
  concurrent.map((r) => r.status),
  [200, 200],
  "并发重试返回相同上传成功结果",
);
s = await state();
equal(s.artworks.length, 3, "并发重复点击只增加一个节点");
equal(
  [s.artworks[2].title, s.artworks[2].mood, s.artworks[2].note],
  ["第 3 次冒险", "", ""],
  "只上传图片即可完成冒险，无需填写名称、心情或记录",
);
equal(
  s.artworks[2].created_date,
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
  "没有填写日期时自动记录中国时区的当天日期",
);
equal(s.rewards[0].amount, null, "已解锁但未开启的宝箱仍不返回金额");
assert.ok(s.rewards[0].unlocked_at);
checks++;
equal(
  (await state("hero")).letters.filter((l) => l.body).length,
  1,
  "第三张仅解锁对应信件",
);
equal(
  (
    await request("payment/3", {
      role: "hero",
      method: "POST",
      body: { date: "2026-01-01", note: "" },
    })
  ).status,
  403,
  "勇者不可修改发放记录",
);
equal(
  (
    await request("payment/3", {
      method: "POST",
      body: { date: "2026-01-01", note: "" },
    })
  ).status,
  409,
  "未开启宝箱不能标记发放",
);
equal(
  (await request("open/3", { role: "hero", method: "POST" })).status,
  200,
  "勇者开启宝箱",
);
equal((await state()).rewards[0].amount,100,"开启后才返回对应宝箱的金额");
equal((await state()).rewards.slice(1).every(r=>r.amount===null),true,"打开一个宝箱不泄漏其他金额");
equal((await state()).rewards[0].paid_at, null, "开启宝箱不代表实际发放");
const openedAt=(await state()).rewards[0].opened_at;
await request('open/3',{role:'hero',method:'POST'});
equal((await state()).rewards[0].opened_at,openedAt,"重复开启保留首次开启时间");
equal(
  (
    await request("payment/3", {
      method: "POST",
      body: { date: "2026-01-01", note: "测试环境，无真实转账" },
    })
  ).status,
  200,
  "管理员记录测试发放",
);
const third = s.artworks[2],
  edit = form(3);
edit.delete("historical");
equal(
  (
    await request("artworks/" + third.id, {
      role: "hero",
      method: "POST",
      body: edit,
    })
  ).status,
  200,
  "替换图片和编辑作品成功",
);
equal((await state()).artworks.length, 3, "替换不增加进度");
equal(
  (await request("artworks/" + s.artworks[0].id, { method: "DELETE" })).status,
  409,
  "不能删除中间节点",
);
equal(
  (await request("artworks/" + third.id, { role: "hero", method: "DELETE" }))
    .status,
  200,
  "可以删除最后一张",
);
s = await state();
equal(s.artworks.length, 2, "删除最后一张使进度回退");
equal(s.rewards[0].paid_at, "2026-01-01", "回退不撤销已发放历史");
await request("artworks", { role: "hero", method: "POST", body: form(3) });
equal(
  (await state()).rewards[0].paid_at,
  "2026-01-01",
  "删除再上传不重新生成现金奖励",
);
const expected = new Map([
  [5, 250],
  [10, 450],
  [15, 700],
  [20, 1050],
  [25, 1500],
]);
for (let node = 4; node <= 25; node++) {
  const r = await request("artworks", {
    role: "hero",
    method: "POST",
    body: form(node),
  });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  if (expected.has(node)) {
    s = await state();
    equal(s.rewards.find(r=>r.node===node).amount,null,'第 '+node+' 张解锁时金额仍保密');
    equal((await request('open/'+node,{role:'hero',method:'POST'})).status,200,'第 '+node+' 个节点宝箱可开启');
    s = await state();
    equal(
      s.rewards
        .filter((r) => r.unlocked_at)
        .reduce((sum, r) => sum + r.amount, 0),
      expected.get(node),
      "第 " + node + " 张累计金额正确",
    );
  }
}
equal((await state()).artworks.length, 25, "最终通关 25/25");
equal(
  (await request("artworks", { role: "hero", method: "POST", body: form(26) }))
    .status,
  409,
  "拒绝第 26 张作品",
);
equal((await state()).rewards.length, 6, "始终只有六条奖励记录");
equal(
  (await request("open/25", { role: "hero", method: "POST" })).status,
  200,
  "最终宝箱正常开启",
);
equal(
  (await state("hero")).letters.filter((l) => l.body).length,
  6,
  "最终六封信全部解锁",
);
const csrf = await fetch(origin + "/api/quest/open/25", {
  method: "POST",
  headers: {
    origin: "https://wrong.example",
    "oai-authenticated-user-id": "test-hero",
    "oai-authenticated-user-email": "hero@example.test",
  },
});
equal(csrf.status, 403, "跨站写请求被拒绝");

// Exercise the full letter editing lifecycle through the protected API.
equal((await request('letter-save',{method:'POST',body:{node:1,title:'本地草稿',body:'仅管理员可见',published:false}})).status,200,'管理员可保存新草稿');
let draft=(await state()).letters.find(l=>l.title==='本地草稿');
equal(draft.body,'仅管理员可见','管理员可读取完整草稿');
equal((await state('hero')).letters.some(l=>l.id===draft.id),false,'草稿不返回公开信箱');
equal((await request('letter-save/'+draft.id,{method:'POST',body:{node:25,title:'修改后的信',body:'给勇者的正文',published:true}})).status,200,'管理员可编辑标题、正文、节点并发布');
equal((await state('hero')).letters.find(l=>l.id===draft.id).body,'给勇者的正文','发布后正文在已达成节点可见');
equal((await request('read/'+draft.id,{role:'hero',method:'POST'})).status,200,'无需登录可阅读解锁信件');
const readAt=(await state('hero')).letters.find(l=>l.id===draft.id).read_at;
equal((await request('letter-save/'+draft.id,{method:'POST',body:{node:25,title:'重新编辑',body:'更新的正文',published:false}})).status,200,'已发布信件可改为草稿');
equal((await state('hero')).letters.some(l=>l.id===draft.id),false,'取消发布后公开接口不再返回信件');
equal((await state()).letters.find(l=>l.id===draft.id).read_at,readAt,'编辑信件保留原阅读状态');
equal((await request('letter-save',{method:'POST',body:{node:26,title:'无效',body:'无效',published:true}})).status,400,'信件节点必须在 1–25 范围');
const logout=await request('admin-logout',{method:'POST'});
assert.match(logout.headers.get('set-cookie'),/Max-Age=0/);
adminCookie='';
equal((await state()).role,'hero','退出管理后继续免登录冒险');
equal((await request('letter-save/'+draft.id,{method:'POST',body:{}})).status,403,'退出后不能修改信件');
for(let i=0;i<8;i++) equal((await request('admin-login',{method:'POST',body:{password:'wrong'}})).status,401,'错误管理密码尝试 '+(i+1));
equal((await request('admin-login',{method:'POST',body:{password:'wrong'}})).status,429,'连续失败触发持久化频率限制');
console.log(
  `\n${checks} integration checks passed. Test data is isolated from the preview and production databases.`,
);

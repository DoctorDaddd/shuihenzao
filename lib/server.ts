import { env } from "cloudflare:workers";
import { artworkFields, imageType, validDate } from "./quest";
import {
  adminConfigured,
  adminSessionCookie,
  clearAdminCookie,
  isAdmin,
  passwordMatches,
} from "./admin-auth";

class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}
function database() {
  if (!env.DB) throw new HttpError("数据库尚未连接，请联系冒险发起人。", 503);
  return env.DB;
}
function bucket() {
  if (!env.BUCKET)
    throw new HttpError("图片存储尚未连接，请联系冒险发起人。", 503);
  return env.BUCKET;
}
function json(value: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    },
  });
}
function textField(value: unknown, max: number, required = false) {
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new HttpError("请检查填写内容。");
  return value.trim();
}

export async function handle(request: Request, path: string[]) {
  try {
    if (request.method !== "GET") {
      const origin = request.headers.get("origin");
      if (origin && origin !== new URL(request.url).origin)
        throw new HttpError("请求来源不匹配，请刷新页面后重试。", 403);
      if (Number(request.headers.get("content-length") || 0) > 11 * 1024 * 1024)
        throw new HttpError("图片请控制在 10 MB 以内。", 413);
    }
    const [action, id] = path;
    const db = database();
    const admin = await isAdmin(request, env.QUEST_ADMIN_PASSWORD);
    if (action === "admin-login" && request.method === "POST") {
      const password = env.QUEST_ADMIN_PASSWORD;
      if (!adminConfigured(password))
        throw new HttpError("管理密码尚未配置，请由冒险发起人在服务端设置。", 503);
      let body: { password?: unknown } | null;
      try {
        body = (await request.json()) as { password?: unknown } | null;
      } catch (error) {
        if (error instanceof SyntaxError)
          throw new HttpError("请填写有效的管理密码。");
        throw error;
      }
      if (
        !body ||
        typeof body.password !== "string" ||
        body.password.length > 256
      )
        throw new HttpError("请填写管理密码。");
      // ponytail: one shared administrator; use per-account limits if accounts are added.
      const now = Date.now();
      const attempt = await db
        .prepare(`INSERT INTO admin_login_limit(id,attempts,reset_at) VALUES('admin',1,?)
        ON CONFLICT(id) DO UPDATE SET
          attempts=CASE WHEN reset_at<=? THEN 1 ELSE attempts+1 END,
          reset_at=CASE WHEN reset_at<=? THEN excluded.reset_at ELSE reset_at END
        RETURNING attempts,reset_at`)
        .bind(now + 15 * 60 * 1000, now, now)
        .first<{ attempts: number; reset_at: number }>();
      if (!attempt) throw new Error("Could not record admin login attempt");
      if (attempt.attempts > 8)
        return json(
          { error: "尝试次数较多，请在 15 分钟后重试。" },
          429,
          { "Retry-After": String(Math.max(1, Math.ceil((attempt.reset_at - now) / 1000))) },
        );
      if (!(await passwordMatches(body.password, password)))
        throw new HttpError("管理密码不正确。", 401);
      await db.prepare("DELETE FROM admin_login_limit WHERE id='admin'").run();
      return json({ ok: true }, 200, {
        "Set-Cookie": await adminSessionCookie(request.url, password),
      });
    }
    if (action === "admin-logout" && request.method === "POST")
      return json({ ok: true }, 200, {
        "Set-Cookie": clearAdminCookie(request.url),
      });
    if (action === "state" && request.method === "GET") {
      const [artworks, rewards, letters] = await Promise.all([
        db
          .prepare(
            "SELECT id,node,title,created_date,mood,note,uploaded_at FROM artworks ORDER BY node",
          )
          .all(),
        db.prepare(
          "SELECT node,name,CASE WHEN opened_at IS NOT NULL THEN amount ELSE NULL END AS amount,unlocked_at,opened_at,paid_at,payment_note FROM rewards ORDER BY node",
        ).all(),
        admin
          ? db.prepare("SELECT * FROM letters ORDER BY node").all()
          : db
              .prepare(
                `SELECT id,node,title,published,read_at, CASE WHEN node <= (SELECT COUNT(*) FROM artworks) OR EXISTS (SELECT 1 FROM rewards WHERE rewards.node=letters.node AND unlocked_at IS NOT NULL) OR read_at IS NOT NULL THEN body ELSE NULL END AS body FROM letters WHERE published=1 ORDER BY node`,
              )
              .all(),
      ]);
      return json({
        role: admin ? "admin" : "hero",
        artworks: artworks.results.map((a) => ({
          ...a,
          imageUrl: `/api/quest/image/${a.id}`,
        })),
        rewards: rewards.results,
        letters: letters.results,
      });
    }
    if (["payment", "letter-save", "backup"].includes(action) && !admin)
      throw new HttpError("请先输入管理密码进入管理界面。", 403);
    if (action === "image" && request.method === "GET") {
      const row = await db
        .prepare("SELECT image_key FROM artworks WHERE id=?")
        .bind(id)
        .first<{ image_key: string }>();
      if (!row) throw new HttpError("这张作品不存在。", 404);
      const object = await bucket().get(row.image_key);
      if (!object)
        throw new HttpError("暂时无法读取图片，请联系发起人恢复备份。", 404);
      return new Response(object.body, {
        headers: {
          "Content-Type":
            object.httpMetadata?.contentType || "application/octet-stream",
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (action === "artworks" && request.method === "POST") {
      const form = await request.formData();
      const existing = id
        ? await db
            .prepare("SELECT * FROM artworks WHERE id=?")
            .bind(id)
            .first<{ id: string; node: number; image_key: string }>()
        : null;
      if (id && !existing) throw new HttpError("这张作品不存在。", 404);
      const requestId = textField(form.get("request_id"), 80, true);
      if (!/^[\w-]{16,80}$/.test(requestId))
        throw new HttpError("上传标识无效，请重新选择图片。");
      const duplicate = await db
        .prepare("SELECT id FROM artworks WHERE request_id=?")
        .bind(requestId)
        .first();
      if (!id && duplicate)
        return json({ ok: true, id: duplicate.id, duplicate: true });
      const count = (await db
        .prepare("SELECT COUNT(*) AS n FROM artworks")
        .first<{ n: number }>())!.n;
      if (!id && count >= 25)
        throw new HttpError("25 次冒险已完成，可以继续欣赏和编辑作品。", 409);
      if (
        form.get("historical") === "true" &&
        (!admin || !form.get("created_date") || count >= 2)
      )
        throw new HttpError(
          "历史导入仅限管理员补录前两张作品，并填写原始创作日期。",
          403,
        );
      let fields;
      try {
        fields = artworkFields(form, existing?.node || count + 1);
      } catch (error) {
        throw new HttpError((error as Error).message);
      }
      const file = form.get("image");
      let newKey: string | null = null;
      if (file instanceof File && file.size) {
        if (file.size > 10 * 1024 * 1024)
          throw new HttpError("图片请控制在 10 MB 以内。", 413);
        const bytes = new Uint8Array(await file.arrayBuffer());
        const type = imageType(bytes);
        if (!type) throw new HttpError("请选择 JPG、PNG 或 WebP 图片。");
        newKey = `artworks/${crypto.randomUUID()}`;
        await bucket().put(newKey, bytes, {
          httpMetadata: { contentType: type },
        });
      } else if (!existing) throw new HttpError("先选择一张作品，再出发吧。");
      const artworkId = existing?.id || crypto.randomUUID();
      try {
        if (existing) {
          const result = await db
            .prepare(
              "UPDATE artworks SET image_key=?,title=?,created_date=?,mood=?,note=? WHERE id=?",
            )
            .bind(
              newKey || existing.image_key,
              fields.title,
              fields.createdDate,
              fields.mood,
              fields.note,
              id,
            )
            .run();
          if (!result.meta.changes)
            throw new HttpError("作品已被删除，请刷新后重试。", 409);
        } else {
          const result = await db.batch([
            db
              .prepare(
                "INSERT INTO artworks(id,node,image_key,title,created_date,mood,note,uploaded_at,request_id) SELECT ?,COALESCE(MAX(node),0)+1,?,?,?,?,?,?,? FROM artworks HAVING COUNT(*)<25",
              )
              .bind(
                artworkId,
                newKey,
                fields.title,
                fields.createdDate,
                fields.mood,
                fields.note,
                new Date().toISOString(),
                requestId,
              ),
            db
              .prepare(
                "UPDATE rewards SET unlocked_at=? WHERE unlocked_at IS NULL AND node <= (SELECT COUNT(*) FROM artworks)",
              )
              .bind(new Date().toISOString()),
          ]);
          if (!result[0].meta.changes)
            throw new HttpError(
              "冒险已经完成，或进度已更新，请刷新后查看。",
              409,
            );
        }
      } catch (error) {
        if (newKey) await bucket().delete(newKey);
        const saved =
          !id &&
          (await db
            .prepare("SELECT id FROM artworks WHERE request_id=?")
            .bind(requestId)
            .first());
        if (saved) return json({ ok: true, id: saved.id, duplicate: true });
        throw error;
      }
      if (existing && newKey) {
        try {
          await bucket().delete(existing.image_key);
        } catch (error) {
          console.error("Old image cleanup failed", error);
        }
      }
      return json({ ok: true, id: artworkId });
    }
    if (action === "artworks" && request.method === "DELETE") {
      const result = await db
        .prepare(
          "DELETE FROM artworks WHERE id=? AND node=(SELECT MAX(node) FROM artworks) RETURNING image_key",
        )
        .bind(id)
        .all<{ image_key: string }>();
      if (!result.results.length)
        throw new HttpError("只能删除最后一张作品。", 409);
      try {
        await bucket().delete(result.results[0].image_key);
      } catch (error) {
        console.error("Deleted image cleanup failed", error);
      }
      return json({ ok: true });
    }
    if (action === "open" && request.method === "POST") {
      const result = await db
        .prepare(
          "UPDATE rewards SET opened_at=COALESCE(opened_at,?) WHERE node=? AND unlocked_at IS NOT NULL",
        )
        .bind(new Date().toISOString(), Number(id))
        .run();
      if (!result.meta.changes)
        throw new HttpError("这个宝箱还在等待你的下一次冒险。", 409);
      return json({ ok: true });
    }
    if (action === "read" && request.method === "POST") {
      const result = await db
        .prepare(
          "UPDATE letters SET read_at=COALESCE(read_at,?) WHERE id=? AND published=1 AND (node <= (SELECT COUNT(*) FROM artworks) OR read_at IS NOT NULL OR EXISTS (SELECT 1 FROM rewards WHERE rewards.node=letters.node AND unlocked_at IS NOT NULL))",
        )
        .bind(new Date().toISOString(), id)
        .run();
      if (!result.meta.changes) throw new HttpError("这封信还没有解锁。", 403);
      return json({ ok: true });
    }
    if (action === "payment" && request.method === "POST") {
      const body = (await request.json()) as Record<string, unknown>;
      if (!validDate(body.date)) throw new HttpError("请填写实际发放日期。");
      const note = textField(body.note ?? "", 500);
      const result = await db
        .prepare(
          "UPDATE rewards SET paid_at=?,payment_note=? WHERE node=? AND opened_at IS NOT NULL AND paid_at IS NULL",
        )
        .bind(body.date, note, Number(id))
        .run();
      if (!result.meta.changes)
        throw new HttpError("宝箱尚未开启，或已记录发放。", 409);
      return json({ ok: true });
    }
    if (action === "letter-save" && request.method === "POST") {
      const body = (await request.json()) as Record<string, unknown>;
      const node = Number(body.node);
      if (!Number.isInteger(node) || node < 1 || node > 25)
        throw new HttpError("节点应为 1 到 25。");
      const title = textField(body.title, 100, true),
        content = textField(body.body, 10000, true);
      await db
        .prepare(
          "INSERT INTO letters(id,node,title,body,published) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET node=excluded.node,title=excluded.title,body=excluded.body,published=excluded.published",
        )
        .bind(
          id || crypto.randomUUID(),
          node,
          title,
          content,
          body.published === true ? 1 : 0,
        )
        .run();
      return json({ ok: true });
    }
    if (action === "backup" && request.method === "GET") {
      const [artworks, rewards, letters] = await Promise.all(
        ["artworks", "rewards", "letters"].map((table) =>
          db.prepare(`SELECT * FROM ${table}`).all(),
        ),
      );
      return json({
        version: 1,
        exportedAt: new Date().toISOString(),
        artworks: artworks.results,
        rewards: rewards.results,
        letters: letters.results,
        note: "此文件为元数据备份。图片请在图鉴中单独下载保存。",
      });
    }
    throw new HttpError("没有找到这个入口。", 404);
  } catch (error) {
    if (error instanceof HttpError)
      return json({ error: error.message }, error.status);
    console.error("Quest request failed", error);
    return json(
      { error: "保存没有完成，请稍后重试。你的进度以已保存作品为准。" },
      500,
    );
  }
}

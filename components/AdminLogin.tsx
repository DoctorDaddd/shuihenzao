"use client";
import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { login, localPreview } from "../src/api";

export default function AdminLogin({ onLogin, admin = true }: { onLogin: () => Promise<void>; admin?: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form className="admin-login paper-panel" onSubmit={async (event) => {
      event.preventDefault();
      if (busy) return;
      const form = event.currentTarget;
      setBusy(true);
      setError("");
      try {
        const data = new FormData(form);
        await login(String(data.get("username")), String(data.get("password")));
        form.reset();
        await onLogin();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setBusy(false);
      }
    }}>
      <ShieldCheck size={32} />
      <span className="eyebrow">THE KEEPER'S DESK</span>
      <h1>{admin ? "冒险信箱管理" : "回到你的冒险"}</h1>
      <p>{admin ? "使用冒险发起人的账号，为她写信、调整解锁节点。" : "登录勇者账号，跨设备珍藏画作，继续同一段旅程。"}</p>
      <label>账号<input name="username" required maxLength={128} autoComplete="username" /></label>
      <label>密码<input name="password" type="password" required maxLength={256} autoComplete="current-password" /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary full-width" disabled={busy}><KeyRound size={16} />{busy ? "正在进入…" : "登录并继续"}</button>
      <p className="small-print">{localPreview ? "本地测试环境 · 测试账号见项目 README。" : "浏览无需登录；上传和管理需要发起人授权的账号。"}</p>
    </form>
  );
}

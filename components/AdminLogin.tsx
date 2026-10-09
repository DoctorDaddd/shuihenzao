"use client";
import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";
import { login, localPreview } from "../src/api";

export default function AdminLogin({ onLogin }: { onLogin: () => Promise<void> }) {
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
      <h1>冒险信箱管理</h1>
      <p>使用冒险发起人的账号，为她写信、调整解锁节点。</p>
      <label>账号<input name="username" required maxLength={128} autoComplete="username" /></label>
      <label>密码<input name="password" type="password" required maxLength={256} autoComplete="current-password" /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary full-width" disabled={busy}><KeyRound size={16} />{busy ? "正在进入…" : "登录并继续"}</button>
      <p className="small-print">{localPreview ? "本地管理员账号见项目 README。" : "只有管理功能需要登录，普通冒险打开即可使用。"}</p>
      {!localPreview && <details className="small-print">
        <summary>管理员：首次部署设置</summary>
        <p>在 CloudBase 控制台启用匿名登录，普通冒险会自动连接；用户名和密码仅供管理员使用。将网站域名加入安全来源，部署 quest-api 云函数及项目中的数据库、云存储规则，再按 README 初始化空环境并绑定管理员 UID。</p>
        <p>这些设置只需由管理员完成一次。已有冒险数据请保留，不要重新初始化。</p>
      </details>}
    </form>
  );
}

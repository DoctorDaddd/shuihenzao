"use client";
import { useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

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
        const response = await fetch("/api/quest/admin-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: new FormData(form).get("password") }),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error || "暂时无法进入管理界面。");
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
      <p>用管理密码进入，为她写信、调整解锁节点，保存草稿或发布来信。</p>
      <label>管理密码<input name="password" type="password" required maxLength={256} autoComplete="current-password" /></label>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary full-width" disabled={busy}><KeyRound size={16} />{busy ? "正在进入…" : "进入管理界面"}</button>
      <p className="small-print">日常冒险无需登录。管理身份在此设备上保留 8 小时。</p>
    </form>
  );
}

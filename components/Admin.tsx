"use client";
import { useState } from "react";
import { Upload, Mail, ShieldCheck, Download, Plus } from "lucide-react";
import type { QuestState, Letter, Reward } from "../lib/quest";
import { localDate, rewardState } from "../lib/quest";
import Modal from "./Modal";
import AdminMapPreview from "./AdminMapPreview";
import { downloadBackup } from "../src/api";
import type { MusicScene, PlaySound } from "../lib/adventure-score";
type Api = (path: string, body?: unknown) => Promise<unknown>;
export default function Admin({
  state,
  api,
  onImport,
  refresh,
  onLogout,
  onSoundScene,
  onSoundEffect,
  reduced,
}: {
  state: QuestState;
  api: Api;
  onImport: () => void;
  refresh: () => Promise<void>;
  onLogout: () => Promise<void>;
  onSoundScene: (scene: MusicScene) => void;
  onSoundEffect: PlaySound;
  reduced: boolean;
}) {
  const [letter, setLetter] = useState<Letter | null>(null),
    [payment, setPayment] = useState<Reward | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(
    e: React.FormEvent<HTMLFormElement>,
    path: string,
    kind: "letter" | "payment",
  ) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData(e.currentTarget),
        data = Object.fromEntries(form);
      if (kind === "letter") {
        await api(path, {
          ...data,
          node: Number(data.node),
          published: form.get("published") === "on",
        });
      } else await api(path, data);
      await refresh();
      setLetter(null);
      setPayment(null);
      setNotice("已保存。");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">THE KEEPER'S DESK</span>
          <h1>冒险信箱管理</h1>
          <p>准备一封信、珍藏一幅画，为她的下一步悄悄喝彩。</p>
        </div>
        <button className="secondary" onClick={() => void onLogout()}>
          <ShieldCheck size={14} />退出管理
        </button>
      </div>
      {error && !letter && !payment && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="success-message">
          {notice}
        </p>
      )}
      {state.role === "admin" && <AdminMapPreview count={state.artworks.length} reduced={reduced} onSoundScene={onSoundScene} onSoundEffect={onSoundEffect} />}
      <section className="paper-panel admin-wide">
        <div className="section-heading">
          <h2>
            <Mail size={18} />
            写给勇者的信
          </h2>
          <button
            className="secondary"
            onClick={() => {
              setError("");
              setLetter({
                id: "",
                node: 3,
                title: "",
                body: "",
                published: 0,
                read_at: null,
              });
            }}
          >
            <Plus size={15} />
            写一封新信
          </button>
        </div>
        <p className="muted">
          点击信件即可编辑标题、正文和解锁节点。草稿仅自己可见；已发布的信会在对应冒险节点展开。
        </p>
        {state.letters.length === 0 && (
          <p className="muted">信箱还是空的，写下第一封陪伴她的信吧。</p>
        )}
        {state.letters.map((l) => (
          <button
            className="admin-letter"
            key={l.id}
            onClick={() => {
              setError("");
              setLetter(l);
            }}
          >
            <span>第 {l.node} 次冒险</span>
            <b>{l.title}</b>
            <span className="pill">{l.published ? "已发布" : "草稿"}</span>
            <span>编辑 →</span>
          </button>
        ))}
      </section>
      <div className="admin-grid admin-import">
        <section className="paper-panel">
          <h2>
            <Upload size={18} />
            历史作品导入
          </h2>
          <p>
            前两张作品请按创作顺序导入，并填写实际创作日期。正式进度会在成功保存后变成
            2/25。
          </p>
          <strong className="admin-count">
            {state.artworks.length} <span>/ 25 幅已珍藏</span>
          </strong>
          <button
            className="primary"
            disabled={state.artworks.length >= 2}
            onClick={onImport}
          >
            {state.artworks.length >= 2
              ? "历史作品已就位"
              : `导入第 ${state.artworks.length + 1} 张历史作品`}
          </button>
        </section>
      </div>
      <section className="paper-panel admin-wide">
        <div className="section-heading">
          <h2>真实奖励发放记录</h2>
          <span className="muted">仅在实际转账完成后确认</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>宝箱</th>
                <th>金额</th>
                <th>当前状态</th>
                <th>实际发放日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {state.rewards.map((r) => (
                <tr key={r.node}>
                  <td>
                    第 {r.node} 张 · {r.name}
                  </td>
                  <td>{r.opened_at ? `¥${r.amount}` : "开启后揭晓"}</td>
                  <td>{rewardState(r)}</td>
                  <td>{r.paid_at || "—"}</td>
                  <td>
                    <button
                      className="text-button"
                      disabled={!r.opened_at || !!r.paid_at}
                      onClick={() => {
                        setError("");
                        setPayment(r);
                      }}
                    >
                      记录发放
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="paper-panel admin-wide">
        <h2>
          <Download size={18} />
          保存冒险记录
        </h2>
        <p>
          导出作品信息、奖励历史和信件。此导出不含原图；包含原图和缩略图的完整备份请按项目 README 操作。
        </p>
        <button
          onClick={() => { void downloadBackup().catch(e => setError(e.message)); }}
          className="secondary"
        >
          导出元数据备份
        </button>
      </section>
      {letter && (
        <Modal
          title={letter.id ? "编辑冒险来信" : "写一封新的冒险来信"}
          onClose={() => {
            if (!busy) setLetter(null);
          }}
        >
          <form
            onSubmit={(e) =>
              submit(
                e,
                `letter-save${letter.id ? "/" + letter.id : ""}`,
                "letter",
              )
            }
          >
            <div className="form-grid">
              <label>
                解锁节点
                <input
                  name="node"
                  type="number"
                  required
                  min="1"
                  max="25"
                  defaultValue={letter.node}
                />
              </label>
              <label>
                信件标题
                <input
                  name="title"
                  required
                  maxLength={100}
                  defaultValue={letter.title}
                />
              </label>
            </div>
            <label>
              信件正文
              <textarea
                name="body"
                required
                rows={12}
                maxLength={10000}
                defaultValue={letter.body}
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                name="published"
                defaultChecked={!!letter.published}
              />
              发布这封信（达到条件后才向勇者显示正文）
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button className="primary" disabled={busy}>
                {busy ? "保存中…" : "保存信件"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {payment && (
        <Modal
          title={`记录 ${payment.name} · ¥${payment.amount}`}
          onClose={() => {
            if (!busy) setPayment(null);
          }}
        >
          <p>
            请确认你已经在网站外完成转账。此操作会记录真实发放，勇者开启宝箱不会自动触发此操作。
          </p>
          <form
            onSubmit={(e) => submit(e, `payment/${payment.node}`, "payment")}
          >
            <label>
              实际发放日期
              <input
                name="date"
                type="date"
                required
                defaultValue={localDate()}
              />
            </label>
            <label>
              发放备注 <small>选填</small>
              <textarea name="note" maxLength={500} rows={3} />
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className="modal-actions">
              <button className="primary" disabled={busy}>
                确认已实际发放 ¥{payment.amount}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

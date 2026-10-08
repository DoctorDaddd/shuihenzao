"use client";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Upload, Sparkles } from "lucide-react";
import Modal from "./Modal";
import type { Artwork } from "../lib/quest";
import { localDate } from "../lib/quest";
export default function ArtworkForm({
  artwork,
  historical,
  node,
  onClose,
  onSaved,
}: {
  artwork?: Artwork;
  historical?: boolean;
  node: number;
  onClose: () => void;
  onSaved: (isNew: boolean) => Promise<void>;
}) {
  const simple = !artwork && !historical;
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(artwork?.imageUrl || ""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement>(null),
    requestId = useRef(crypto.randomUUID()),
    saving = useRef(false);
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  function choose(selected?: File) {
    if (!selected) return;
    setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(selected.type)) {
      setError("请选择 JPG、PNG 或 WebP 图片。");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError("图片请控制在 10 MB 以内。");
      return;
    }
    setFile(selected);
    requestId.current = crypto.randomUUID();
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (saving.current) return;
    if (!file && !artwork) {
      setError("先选择一张作品，再出发吧。");
      return;
    }
    saving.current = true;
    setBusy(true);
    setError("");
    try {
      const data = new FormData(e.currentTarget);
      if (file) data.set("image", file);
      data.set("request_id", requestId.current);
      if (historical) data.set("historical", "true");
      const res = await fetch(
        `/api/quest/artworks${artwork ? "/" + artwork.id : ""}`,
        { method: "POST", body: data },
      );
      const body = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(body.error);
      await onSaved(!artwork);
    } catch (err) {
      setError((err as Error).message || "保存失败，请稍后重试。");
    } finally {
      setBusy(false);
      saving.current = false;
    }
  }
  return (
    <Modal
      title={
        artwork
          ? "珍藏这一刻"
          : historical
            ? `补录第 ${node} 张历史作品`
            : `开启第 ${node} 次冒险`
      }
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      {!simple && (
        <p className="muted">
          {historical
            ? "请保留这幅作品真正完成的日期。"
            : "修改和替换不会改变冒险进度，也不会重复领取奖励。"}
        </p>
      )}
      <form onSubmit={submit} className={simple ? "simple-upload" : undefined}>
        <button
          type="button"
          className={`dropzone ${dragging ? "dragging" : ""} ${preview ? "with-preview" : ""}`}
          onClick={() => input.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            choose(e.dataTransfer.files[0]);
          }}
        >
          {preview ? (
            <>
              <img src={preview} alt="所选作品预览" />
              <span className="replace-label">点击替换图片</span>
            </>
          ) : (
            <>
              <ImagePlus size={35} />
              <strong>上传你的画作</strong>
              <span>点击选择，或拖拽到这里</span>
              <small>JPG / PNG / WebP · 最大 10 MB</small>
            </>
          )}
        </button>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => choose(e.target.files?.[0])}
          hidden
          aria-label="选择作品图片"
        />
        {simple && (
          <p className="upload-tip">
            小贴士：只上传画作就很好，想说的话可以现在写，也可以以后补。
          </p>
        )}
        {!simple && (
          <>
            <div className="form-grid">
              <label>
                作品名称 <small>选填</small>
                <input
                  name="title"
                  maxLength={100}
                  defaultValue={artwork?.title || ""}
                  placeholder="给这次冒险起个名字"
                />
              </label>
              <label>
                创作日期 {historical && <small>必填</small>}
                <input
                  name="created_date"
                  type="date"
                  required={historical}
                  defaultValue={
                    artwork?.created_date || (historical ? "" : localDate())
                  }
                />
              </label>
            </div>
            <label>
              创作时的心情 <small>选填</small>
              <select name="mood" defaultValue={artwork?.mood || ""}>
                <option value="">让作品替我说话</option>
                <option>开心</option>
                <option>平静</option>
                <option>好奇</option>
                <option>有一点挑战</option>
                <option>充满灵感</option>
              </select>
            </label>
          </>
        )}
        <details className="optional-record" open={!simple}>
          <summary>
            留下一点记录 <span>选填</span>
          </summary>
          <label>
            这一刻的小记录
            <textarea
              name="note"
              maxLength={2000}
              rows={3}
              defaultValue={artwork?.note || ""}
              placeholder="想记下什么都可以，不写也没关系。"
            />
          </label>
        </details>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          {!simple && (
            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={onClose}
            >
              下次再来
            </button>
          )}
          <button className="primary" disabled={busy}>
            {busy ? (
              <span className="spinner" />
            ) : artwork ? (
              <Upload size={17} />
            ) : (
              <Sparkles size={17} />
            )}{" "}
            {busy
              ? "正在珍藏…"
              : artwork
                ? "保存修改"
                : historical
                  ? "保存历史作品"
                  : "上传并出发"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

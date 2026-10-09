"use client";
import { useState } from "react";
import {
  ArrowLeftRight,
  LockKeyhole,
  Plus,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Download,
  Trash2,
} from "lucide-react";
import type { Artwork } from "../lib/quest";
import Modal from "./Modal";
export function Gallery({
  artworks,
  onOpen,
  onUpload,
  onHover,
  onLeave,
  onCompare,
}: {
  artworks: Artwork[];
  onOpen: (a: Artwork) => void;
  onUpload: () => void;
  onHover: (a: Artwork, rect: DOMRect) => void;
  onLeave: () => void;
  onCompare: (ids: string[]) => void;
}) {
  const [selecting, setSelecting] = useState(false),
    [selected, setSelected] = useState<string[]>([]);
  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">THE ADVENTURE COLLECTION</span>
          <h1>
            冒险图鉴<span className="title-count">{artworks.length} / 25</span>
          </h1>
          <p>那些认真画下的瞬间，都在这里闪闪发光。</p>
        </div>
        <button
          className="secondary"
          onClick={() => {
            if (selecting && selected.length === 2) onCompare(selected);
            else {
              setSelecting(!selecting);
              setSelected([]);
            }
          }}
        >
          <ArrowLeftRight size={16} />
          {selecting
            ? selected.length === 2
              ? "对比这两张"
              : `已选择 ${selected.length} / 2 · 取消`
            : "选择两张，看看成长"}
        </button>
      </div>
      <div className="gallery-grid">
        {Array.from({ length: 25 }, (_, i) => {
          const art = artworks[i],
            next = i === artworks.length;
          return (
            <button
              key={i}
              className={`art-slot ${art ? "filled" : ""} ${next ? "empty-next" : ""} ${art && selected.includes(art.id) ? "selected" : ""}`}
              onClick={() => {
                if (art) {
                  if (selecting) {
                    setSelected((ids) =>
                      ids.includes(art.id)
                        ? ids.filter((x) => x !== art.id)
                        : ids.length < 2
                          ? [...ids, art.id]
                          : [ids[1], art.id],
                    );
                  } else onOpen(art);
                } else if (next) onUpload();
              }}
              disabled={!art && !next}
              onMouseEnter={(e) => {
                if (art && !selecting)
                  onHover(art, e.currentTarget.getBoundingClientRect());
              }}
              onMouseLeave={onLeave}
              onFocus={(e) => {
                if (art && !selecting)
                  onHover(art, e.currentTarget.getBoundingClientRect());
              }}
              onBlur={onLeave}
            >
              <span className="slot-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              {art ? (
                <>
                  <div className="art-image">
                    <img src={art.thumbnailUrl || art.imageUrl} alt={art.title} loading="lazy" decoding="async" />
                  </div>
                  <div className="art-label">
                    <strong>{art.title}</strong>
                    <small>{art.created_date}</small>
                  </div>
                  {selecting && (
                    <span className="selection-check">
                      {selected.includes(art.id) ? "✓" : ""}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="blank-art">
                    {next ? <Plus size={25} /> : <LockKeyhole size={16} />}
                  </div>
                  <strong>
                    {next ? "你的下一次冒险" : "等待一份新的色彩"}
                  </strong>
                  <small>第 {i + 1} 次冒险</small>
                </>
              )}
            </button>
          );
        })}
      </div>
      <p className="page-footnote">
        25 个位置，25 段属于你的故事。按照自己的节奏，慢慢填满就好。
      </p>
    </>
  );
}
export function ArtworkViewer({
  artwork,
  artworks,
  onClose,
  onSelect,
  onEdit,
  onDelete,
  canEdit = true,
}: {
  artwork: Artwork;
  artworks: Artwork[];
  onClose: () => void;
  onSelect: (a: Artwork) => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit?: boolean;
}) {
  const [zoom, setZoom] = useState(1);
  const index = artworks.findIndex((a) => a.id === artwork.id);
  return (
    <Modal title={artwork.title} onClose={onClose} wide>
      <div className="viewer">
        <div className="viewer-image">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            style={{
              width: `${zoom * 100}%`,
              height: `${zoom * 100}%`,
              maxWidth: "none",
            }}
          />
        </div>
        <div className="viewer-toolbar">
          <button
            className="icon-button"
            aria-label="上一张"
            disabled={!index}
            onClick={() => {
              onSelect(artworks[index - 1]);
              setZoom(1);
            }}
          >
            <ChevronLeft />
          </button>
          <span>
            第 {artwork.node} 次冒险 · {artwork.created_date}
          </span>
          <button
            className="icon-button"
            aria-label="下一张"
            disabled={index === artworks.length - 1}
            onClick={() => {
              onSelect(artworks[index + 1]);
              setZoom(1);
            }}
          >
            <ChevronRight />
          </button>
          <span className="toolbar-spacer" />
          <button
            className="icon-button"
            aria-label="缩小"
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
          >
            <ZoomOut size={18} />
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            className="icon-button"
            aria-label="放大"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>
      <p className="artwork-note">
        {artwork.mood && <span className="pill">{artwork.mood}</span>}
        {artwork.note || "这一次，让画面替你保管回忆。"}
      </p>
      <div className="modal-actions">
        <a
          className="secondary"
          href={artwork.imageUrl}
          download={`${artwork.title}.png`}
        >
          <Download size={16} />
          保存图片
        </a>
        {canEdit && <button className="secondary" onClick={onEdit}>
          <Pencil size={15} />
          编辑作品
        </button>}
        {canEdit && index === artworks.length - 1 && (
          <button className="danger-button" onClick={onDelete}>
            <Trash2 size={15} />
            删除最后一张
          </button>
        )}
      </div>
    </Modal>
  );
}
export function Compare({
  artworks,
  initialIds,
}: {
  artworks: Artwork[];
  initialIds: string[];
}) {
  const [ids, setIds] = useState(
    initialIds.length === 2
      ? initialIds
      : [artworks[0]?.id || "", artworks.at(-1)?.id || ""],
  );
  const [zoom, setZoom] = useState(1);
  const chosen = ids.map((id) => artworks.find((a) => a.id === id));
  return (
    <>
      <div className="page-title">
        <div>
          <span className="eyebrow">EVERY CHAPTER IS YOU</span>
          <h1>看见一路走来的自己</h1>
          <p>这里没有评分，只有不同阶段的你，和独一无二的画面。</p>
        </div>
        <button className="secondary" onClick={() => setIds([ids[1], ids[0]])}>
          <ArrowLeftRight size={16} />
          交换作品
        </button>
      </div>
      {artworks.length < 2 ? (
        <div className="empty-state">
          珍藏两张作品后，就可以一起看看这段成长啦。
        </div>
      ) : (
        <>
          <div className="compare-grid">
            {chosen.map((art, i) => (
              <div className="compare-frame" key={i}>
                <div className="compare-select">
                  <span>{i ? "后来的风景" : "故事的开始"}</span>
                  <select
                    aria-label={i ? "第二张对比作品" : "第一张对比作品"}
                    value={ids[i]}
                    onChange={(e) =>
                      setIds(
                        ids.map((id, j) => (j === i ? e.target.value : id)),
                      )
                    }
                  >
                    {artworks.map((a) => (
                      <option key={a.id} value={a.id}>
                        {String(a.node).padStart(2, "0")} · {a.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="compare-picture">
                  {art && (
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      style={{
                        width: `${zoom * 100}%`,
                        height: `${zoom * 100}%`,
                        maxWidth: "none",
                      }}
                    />
                  )}
                </div>
                <div className="compare-caption">
                  <b>{art?.title}</b>
                  <span>
                    第 {art?.node} 次冒险 · {art?.created_date}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="compare-zoom">
            <ZoomOut size={17} />
            <input
              aria-label="同步缩放两张作品"
              type="range"
              min="1"
              max="3"
              step=".05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
            <ZoomIn size={17} />
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <div className="gentle-note">
            “每一个阶段的你，都创造了独一无二的画面。”
          </div>
        </>
      )}
    </>
  );
}

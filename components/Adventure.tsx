"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Map,
  BookOpen,
  ArrowLeftRight,
  Mail,
  Settings,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  LockKeyhole,
  Heart,
  Sprout,
  Trees,
  Landmark,
  MountainSnow,
  Castle,
  Flag,
  Volume2,
  VolumeX,
  Check,
  X,
  Expand,
  Feather,
} from "lucide-react";
import PixelWorld, { Girl, Chest } from "./PixelWorld";
import Modal from "./Modal";
import ArtworkForm from "./ArtworkForm";
import { Gallery, ArtworkViewer, Compare } from "./Collection";
import Admin from "./Admin";
import AdminLogin from "./AdminLogin";
import QuestCountdown from "./QuestCountdown";
import { getState, questApi, logout as signOut, localPreview } from "../src/api";
import {
  CHAPTERS,
  REWARD_STAGES,
  chapterFor,
  rewardState,
  type Artwork,
  type QuestState,
  type Reward,
  type Letter,
} from "../lib/quest";

const emptyState: QuestState = {
  role: "visitor",
  artworks: [],
  rewards: REWARD_STAGES.map((reward) => ({
    ...reward,
    amount: null,
    unlocked_at: null,
    opened_at: null,
    paid_at: null,
    payment_note: "",
  })),
  letters: [],
};
const icons = [Sprout, Trees, Landmark, MountainSnow, Castle];
type Tab = "map" | "gallery" | "compare" | "mail" | "rewards" | "admin";
export default function Adventure() {
  const [state, setState] = useState<QuestState | null>(null),
    [tab, setTab] = useState<Tab>("map"),
    [chapter, setChapter] = useState(0),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [upload, setUpload] = useState<{
      artwork?: Artwork;
      historical?: boolean;
    } | null>(null),
    [view, setView] = useState<Artwork | null>(null),
    [preview, setPreview] = useState<{
      art: Artwork;
      x: number;
      y: number;
    } | null>(null),
    [compareIds, setCompareIds] = useState<string[]>([]);
  const [settings, setSettings] = useState(false),
    [overview, setOverview] = useState(false),
    [letter, setLetter] = useState<Letter | null>(null),
    [reward, setReward] = useState<Reward | null>(null),
    [confirmDelete, setConfirmDelete] = useState(false);
  const [celebration, setCelebration] = useState<number | null>(null),
    [busy, setBusy] = useState(false),
    [moving, setMoving] = useState(false),
    [reduced, setReduced] = useState(false),
    [sound, setSound] = useState(false),
    [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    mounted = useRef(false),
    refreshVersion = useRef(0);
  const data = state ?? emptyState,
    count = data.artworks.length,
    currentChapter = chapterFor(count),
    nextReward = data.rewards.find((r) => !r.unlocked_at),
    revealed = data.rewards
      .filter((r) => r.opened_at)
      .reduce((n, r) => n + (r.amount ?? 0), 0),
    paid = data.rewards
      .filter((r) => r.paid_at)
      .reduce((n, r) => n + (r.amount ?? 0), 0);
  const refresh = useCallback(async () => {
    const version = ++refreshVersion.current;
    const body = await getState();
    if (version === refreshVersion.current && mounted.current) {
      setState(body);
      setError("");
      setView(current => current ? body.artworks.find(a => a.id === current.id) ?? null : null);
    }
    return body;
  }, []);
  useEffect(() => {
    mounted.current = true;
    if (location.pathname === "/admin") setTab("admin");
    setReduced(
      localStorage.getItem("brush-reduced") === "true" ||
        matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    setSound(localStorage.getItem("brush-sound") === "true");
    refresh()
      .then((s) => {
        setChapter(chapterFor(s.artworks.length));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    return () => {
      mounted.current = false;
      if (toastTimer.current) clearTimeout(toastTimer.current);
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [refresh]);
  useEffect(() => {
    const sync = () => { if (document.visibilityState === "visible") void refresh().catch(e => setError(e.message)); };
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    const timer = setInterval(sync, 60000);
    return () => { window.removeEventListener("focus", sync); window.removeEventListener("storage", sync); clearInterval(timer); };
  }, [refresh]);
  useEffect(() => {
    document.documentElement.dataset.reduced = String(reduced);
  }, [reduced]);
  function notify(text: string) {
    setToast(text);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4200);
  }
  function chime() {
    if (!sound) return;
    const context = new AudioContext();
    [523, 659, 784].forEach((f, i) => {
      const osc = context.createOscillator(),
        gain = context.createGain();
      osc.type = "triangle";
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.setValueAtTime(0.045, context.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        context.currentTime + i * 0.09 + 0.3,
      );
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start(context.currentTime + i * 0.09);
      osc.stop(context.currentTime + i * 0.09 + 0.35);
    });
    setTimeout(() => void context.close(), 800);
  }
  async function api(path: string, body?: unknown) {
    return questApi(path, body);
  }
  async function logout() {
    setBusy(true);
    try {
      await signOut();
      refreshVersion.current++;
      // Discard privileged letters immediately, even if the following refresh fails.
      setState(null);
      setUpload(null); setLetter(null); setView(null); setReward(null);
      setSettings(false);
      navigate("map");
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function navigate(value: Tab) {
    setPreview(null);
    setTab(value);
    history.replaceState(null, "", value === "admin" ? "/admin" : "/");
    setError("");
    window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
  }
  function beginUpload() {
    if (!state) {
      notify("冒险记录尚未加载，请稍后重试。");
      return;
    }
    if (count >= 25) {
      setCelebration(25);
      return;
    }
    setUpload({});
  }
  function hover(art: Artwork, rect: DOMRect) {
    if (!matchMedia("(hover: hover)").matches) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(
      () =>
        setPreview({
          art,
          x: Math.min(
            Math.max(12, rect.left + rect.width / 2 - 160),
            window.innerWidth - 332,
          ),
          y: Math.max(12, Math.min(rect.top - 260, window.innerHeight - 280)),
        }),
      280,
    );
  }
  function leave() {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    setPreview(null);
  }
  async function saved(isNew: boolean) {
    const updated = await refresh();
    setUpload(null);
    setView(null);
    if (isNew) {
      setTab("map");
      setChapter(chapterFor(updated.artworks.length));
      setMoving(true);
      chime();
      setTimeout(
        () => {
          if (mounted.current) {
            setMoving(false);
            setCelebration(updated.artworks.length);
          }
        },
        reduced ? 0 : 850,
      );
    } else notify("作品已更新，冒险进度保持不变。");
  }
  async function openChest(r: Reward) {
    if (!state) {
      notify("冒险记录尚未加载，请稍后重试。");
      return;
    }
    if (!r.unlocked_at) {
      notify(`第 ${r.node} 张作品完成后，这个宝箱就会为你打开。`);
      return;
    }
    setReward(r);
  }
  async function revealChest() {
    if (!reward || busy) return;
    setBusy(true);
    try {
      await api(`open/${reward.node}`);
      const updated = await refresh();
      setReward(updated.rewards.find((item) => item.node === reward.node) ?? null);
      chime();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function readLetter(l: Letter) {
    if (!l.body) {
      notify(`这封信在第 ${l.node} 次冒险后与你相见。`);
      return;
    }
    setLetter(l);
    try {
      await api(`read/${l.id}`);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function remove() {
    if (!view || busy) return;
    setBusy(true);
    try {
      await questApi("artworks/" + view.id, {}, "DELETE");
      await refresh();
      setConfirmDelete(false);
      setView(null);
      notify("最后一张作品已删除，历史奖励仍然保留。");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const nav = [
    { id: "map" as Tab, label: "冒险地图", icon: Map },
    { id: "gallery" as Tab, label: "冒险图鉴", icon: BookOpen },
    { id: "compare" as Tab, label: "成长对比", icon: ArrowLeftRight },
    { id: "mail" as Tab, label: "冒险信箱", icon: Mail },
    { id: "rewards" as Tab, label: "宝藏记录", icon: Chest },
  ];
  return (
    <div className={`app-shell jrpg-shell screen-${tab}`}>
      <header className="topbar">
        <button
          className="brand"
          onClick={() => navigate("map")}
          aria-label="画笔勇者首页"
        >
          <span className="brand-mark">
            <Feather size={23} />
            <span>✦</span>
          </span>
          <span>
            <strong>画笔勇者</strong>
            <small>二十五次冒险 · 成长之书</small>
          </span>
        </button>
        <span className="world-status">
          {CHAPTERS[currentChapter].name} <b>·</b> LV. {String(currentChapter + 1).padStart(2, "0")}
        </span>
        <div className="header-actions">
          <button
            className="icon-button settings-button"
            aria-label="偏好设置"
            onClick={() => setSettings(true)}
          >
            <Settings size={19} />
          </button>
          <button
            className="avatar-button"
            title="画笔女勇者 · 偏好设置"
            onClick={() => setSettings(true)}
          >
            <Girl />
          </button>
        </div>
      </header>
      <nav className="command-menu" aria-label="主导航">
        <span className="command-title">冒险指令</span>
        {nav.map((n) => (
          <button
            key={n.id}
            className={`nav-item ${tab === n.id ? "active" : ""}`}
            aria-current={tab === n.id ? "page" : undefined}
            onClick={() => navigate(n.id)}
          >
            <n.icon />
            <span>{n.label}</span>
            {n.id === "mail" &&
              data.letters.some((l) => l.body && !l.read_at) && (
                <i className="unread-dot" />
              )}
          </button>
        ))}
      </nav>
      <main className="main-content">
        {localPreview && <p className="small-print" role="status">本地预览 · 测试记录仅保存在这台电脑，不会写入正式环境。</p>}
        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button
              className="text-button"
              onClick={() => {
                setError("");
                void refresh().catch((e) => setError(e.message));
              }}
            >
              重试
            </button>
            <button
              className="icon-button"
              aria-label="关闭提示"
              onClick={() => setError("")}
            >
              <X size={15} />
            </button>
          </div>
        )}
        {loading && <p className="loading-message" role="status">正在读取冒险记录…</p>}
        {state?.role === "admin" && count < 2 && (
          <div className="demo-banner setup-banner">
            <span>冒险等待启程 · 请先导入两张历史作品及原始创作日期。</span>
            <button onClick={() => navigate("admin")}>
              前往导入
              <ArrowUpRight size={13} />
            </button>
          </div>
        )}
        {tab === "map" && (
          <>
            <div className="welcome-row">
              <div>
                <h1>
                  欢迎回来，<span>勇者睡很早大人！(✧◡✧)</span>
                </h1>
                <p>不用赶路，世界会等你。今天，也为喜欢的事留一点时间吧。</p>
              </div>
              <div className="journey-counter">
                <span>旅程记录</span>
                <div>
                  <strong>{String(count).padStart(2, "0")}</strong>
                  <span>/ 25</span>
                </div>
              </div>
            </div>
            <QuestCountdown count={state ? count : null} />
            <div className="adventure-layout">
              <section className="map-panel">
                <div className="chapter-tabs" aria-label="冒险章节">
                  {CHAPTERS.map((c, i) => {
                    const Icon = icons[i];
                    return (
                      <button
                        key={c.name}
                        className={chapter === i ? "selected" : ""}
                        aria-pressed={chapter === i}
                        onClick={() => setChapter(i)}
                      >
                        <Icon size={17} />
                        <span>{c.name}</span>
                        {i > currentChapter && (
                          <LockKeyhole className="chapter-lock" size={11} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <PixelWorld
                  chapter={chapter}
                  count={count}
                  artworks={data.artworks}
                  rewardNodes={data.rewards.map(r => r.node)}
                  moving={moving}
                  onHover={hover}
                  onLeave={leave}
                  onNode={(node) => {
                    leave();
                    const art = data.artworks.find((a) => a.node === node);
                    if (art) setView(art);
                    else if (node === count + 1) beginUpload();
                    else notify(`这段风景等待第 ${node} 次冒险。慢慢来就好。`);
                  }}
                />
                <div className="map-bottom">
                  <span>
                    <Flag size={15} />
                    <b>{CHAPTERS[chapter].label}</b>
                    <span className="desktop-only">
                      {" "}
                      · {CHAPTERS[chapter].subtitle}
                    </span>
                  </span>
                  <button
                    className="text-button"
                    onClick={() => setOverview(true)}
                  >
                    <Expand size={14} />
                    完整路线
                  </button>
                </div>
                <div className="journey-action">
                  <div className="action-copy">
                    <div className="dialogue-avatar"><Girl level={currentChapter} /></div>
                    <div>
                      <h2>
                        {count === 25
                          ? "25 次冒险，都是你的光芒。"
                          : `第 ${String(count + 1).padStart(2, "0")} 次冒险，准备出发。`}
                      </h2>
                      <p>
                        {count === 25
                          ? "作品和回忆会一直留在这里，欢迎随时回来。"
                          : "带上一幅新作品，让女勇者再向前走一步。"}
                      </p>
                    </div>
                  </div>
                  <button
                    className="primary adventure-button"
                    onClick={beginUpload}
                  >
                    <Sparkles size={18} />
                    {count === 25 ? "重温通关时刻" : "继续冒险"}
                    <span>{count === 25 ? "25 / 25" : "+100 EXP"}</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </section>
              <aside className="adventure-sidebar">
                <section className="hero-profile">
                  <div className="section-mini">
                    勇者档案<span>LV. {String(currentChapter + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="hero-portrait">
                    <div className="portrait-sun" />
                    <Girl level={currentChapter} />
                    <span className="portrait-caption">画笔使 · 睡很早</span>
                  </div>
                  <h2>
                    {
                      [
                        "见习画笔勇者",
                        "森林的绘梦者",
                        "符文绘画师",
                        "雪原的点灯人",
                        "传说画笔勇者",
                      ][currentChapter]
                    }
                  </h2>
                  <span className="hero-level">
                    {count === 25 ? "冒险已完成" : "故事还在继续"}
                  </span>
                  <div className="exp-label">
                    <span>创造力经验</span>
                    <b>
                      {count * 100} <small>EXP</small>
                    </b>
                  </div>
                  <div className="exp-bar" role="progressbar" aria-label="本章冒险进度" aria-valuemin={0} aria-valuemax={5} aria-valuenow={Math.max(0, Math.min(5, count - currentChapter * 5))}>
                    <span
                      style={{ width: `${(((count - 1) % 5) + 1) * 20 || 0}%` }}
                    />
                  </div>
                  <p>每一幅作品，都是 100 份勇气。</p>
                </section>
                <section className="next-treasure">
                  <div className="section-mini">
                    {nextReward ? "支线 · 寻找宝藏" : "所有宝藏已点亮"}
                  </div>
                  <div className="treasure-heading">
                    <Chest opened={!nextReward} />
                    <div>
                      <h3>{nextReward?.name || "传说宝箱"}</h3>
                      <span>
                        {nextReward
                          ? `第 ${nextReward.node} 幅作品后开启`
                          : "25 次冒险的珍贵回忆"}
                      </span>
                    </div>
                  </div>
                  <div className="treasure-progress">
                    <span
                      style={{
                        width: `${Math.min(100, (count / (nextReward?.node || 25)) * 100)}%`,
                      }}
                    />
                  </div>
                  <p>
                    {nextReward ? (
                      <>
                        再画{" "}
                        <strong>{Math.max(0, nextReward.node - count)}</strong>{" "}
                        幅，就会有一份礼物等着你。
                      </>
                    ) : (
                      "谢谢你，把这个世界画得如此完整。"
                    )}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => navigate("rewards")}
                  >
                    看看旅途中的宝藏
                    <ChevronRight size={14} />
                  </button>
                </section>
              </aside>
            </div>
            <div className="lower-layout">
              <section className="recent-section">
                <div className="section-heading">
                  <h2>
                    <BookOpen size={18} />
                    刚刚珍藏的回忆
                  </h2>
                  <button
                    className="text-button"
                    onClick={() => navigate("gallery")}
                  >
                    打开冒险图鉴
                    <ArrowUpRight size={15} />
                  </button>
                </div>
                <div className="recent-grid">
                  {data.artworks.slice(-2).map((art) => (
                    <button
                      className="recent-art"
                      key={art.id}
                      onClick={() => {
                        leave();
                        setView(art);
                      }}
                      onMouseEnter={(e) =>
                        hover(art, e.currentTarget.getBoundingClientRect())
                      }
                      onMouseLeave={leave}
                    >
                      <img src={art.thumbnailUrl || art.imageUrl} alt={art.title} loading="lazy" decoding="async" />
                      <div>
                        <span>
                          ADVENTURE {String(art.node).padStart(2, "0")}
                        </span>
                        <strong>{art.title}</strong>
                        <small>{art.created_date}</small>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  ))}
                  {count < 25 && (
                    <button className="recent-empty" onClick={beginUpload}>
                      <span>+</span>
                      <p>
                        下一个故事
                        <br />
                        <small>由你来画下</small>
                      </p>
                    </button>
                  )}
                </div>
              </section>
              <section className="little-note">
                <h2>旅途寄语</h2>
                <blockquote>
                  “每一张画都值得被珍惜。
                  <br />
                  你正在创造的，远不止画面。”
                </blockquote>
                <span>— 写给正在冒险的你</span>
              </section>
            </div>
          </>
        )}
        {tab === "gallery" && (
          <Gallery
            artworks={data.artworks}
            onOpen={(a) => {
              leave();
              setView(a);
            }}
            onUpload={beginUpload}
            onHover={hover}
            onLeave={leave}
            onCompare={(ids) => {
              setCompareIds(ids);
              navigate("compare");
            }}
          />
        )}
        {tab === "compare" && (
          <Compare
            key={compareIds.join(",")}
            artworks={data.artworks}
            initialIds={compareIds}
          />
        )}
        {tab === "rewards" && (
          <>
            <div className="page-title">
              <div>
                <h1>旅途中的宝藏</h1>
                <p>每份小惊喜，留到亲手开启时再揭晓。</p>
              </div>
              <div className="reward-total">
                <small>已开启宝箱</small>
                <strong>{data.rewards.filter((r) => r.opened_at).length} / {data.rewards.length}</strong>
              </div>
            </div>
            <div className="reward-summary">
              <span>
                已揭晓 <b>¥{revealed}</b>
              </span>
              <span>
                已实际发放 <b>¥{paid}</b>
              </span>
              <span>宝箱开启前，礼物金额保密</span>
            </div>
            <div className="rewards-grid">
              {data.rewards.map((r) => (
                <button
                  className={`reward-card ${r.unlocked_at ? "unlocked" : ""}`}
                  key={r.node}
                  onClick={() => void openChest(r)}
                >
                  <span className="reward-node">
                    第 {String(r.node).padStart(2, "0")} 次冒险
                  </span>
                  <Chest opened={!!r.opened_at} />
                  <h2>{r.name}</h2>
                  <strong className={r.opened_at ? "" : "reward-mystery"}>
                    {r.opened_at ? `¥ ${r.amount}` : "开启后揭晓"}
                  </strong>
                  <span className="pill">
                    {r.unlocked_at ? (
                      <Check size={12} />
                    ) : (
                      <LockKeyhole size={12} />
                    )}{" "}
                    {rewardState(r)}
                  </span>
                  <small>
                    {r.paid_at
                      ? `实际发放：${r.paid_at.slice(0, 10)}`
                      : `完成 ${r.node} 幅作品解锁`}
                  </small>
                </button>
              ))}
            </div>
            <div className="gentle-note">
              开启宝箱后，礼物会由冒险发起人在网站外转账。这里会分别记录「解锁」「开启」与「已发放」。
            </div>
          </>
        )}
        {tab === "mail" && (
          <>
            <div className="page-title">
              <div>
                <h1>写给你的冒险来信</h1>
                <p>有些话，想在你走到这里的时候，亲口说给你听。</p>
              </div>
              <Mail className="page-decoration" size={48} />
            </div>
            <div className="letters-grid">
              {data.letters
                .filter((l) => l.published)
                .map((l) => {
                  const available =
                    !!l.body &&
                    (count >= l.node ||
                      data.rewards.some(
                        (r) => r.node === l.node && r.unlocked_at,
                      ) ||
                      !!l.read_at);
                  return (
                    <button
                      className={`letter-card ${available ? "available" : ""}`}
                      key={l.id}
                      onClick={() =>
                        available
                          ? void readLetter(l)
                          : notify(`第 ${l.node} 次冒险后，这封信会为你展开。`)
                      }
                    >
                      <div className="envelope">
                        <span className="wax-seal">
                          {available ? (
                            <Heart size={16} />
                          ) : (
                            <LockKeyhole size={15} />
                          )}
                        </span>
                      </div>
                      <small>第 {String(l.node).padStart(2, "0")} 次冒险的来信</small>
                      <h2>{l.title}</h2>
                      <span>
                        {available
                          ? l.read_at
                            ? "已读 · 再读一遍"
                            : "新的来信，等你打开"
                          : `在第 ${l.node} 次冒险相见`}
                      </span>
                    </button>
                  );
                })}
            </div>
          </>
        )}
        {tab === "admin" &&
          (state?.role === "admin" ? (
            <Admin
              state={state}
              onLogout={logout}
              api={api}
              onImport={() => setUpload({ historical: true })}
              refresh={async () => {
                await refresh();
              }}
            />
          ) : (
            <AdminLogin onLogin={async () => {
              const next = await refresh();
              if (next.role !== "admin") {
                await signOut();
                await refresh();
                throw new Error("这个账号没有管理权限，已返回免登录冒险。");
              }
            }} />
          ))}
      </main>
      <footer>
        <span className="footer-brand">
          <Feather size={14} /> 一支画笔，二十五次冒险。
        </span>
        <span>
          不必每天抵达，只要随时愿意出发。
          <Heart size={12} />
        </span>
        <button onClick={() => navigate("admin")}>
          {state?.role === "admin" ? "管理冒险" : "冒险发起人入口"}
        </button>
      </footer>
      {preview && (
        <div className="art-hover" style={{ left: preview.x, top: preview.y }}>
          <img src={preview.art.thumbnailUrl || preview.art.imageUrl} alt={preview.art.title} decoding="async" />
          <div>
            <b>{preview.art.title}</b>
            <span>{preview.art.created_date}</span>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Sparkles size={17} />
          {toast}
        </div>
      )}
      {upload && (
        <ArtworkForm
          artwork={upload.artwork}
          historical={upload.historical}
          node={upload.artwork?.node || count + 1}
          onClose={() => setUpload(null)}
          onSaved={saved}
        />
      )}
      {view && !upload && (
        <ArtworkViewer
          artwork={view}
          artworks={data.artworks}
          canEdit={state?.role === "admin" || state?.role === "hero"}
          onClose={() => setView(null)}
          onSelect={setView}
          onEdit={() => setUpload({ artwork: view })}
          onDelete={() => setConfirmDelete(true)}
        />
      )}
      {confirmDelete && (
        <Modal
          title="收起最后一张作品？"
          onClose={() => setConfirmDelete(false)}
        >
          <p>
            仅会删除「{view?.title}
            」，冒险退回上一个节点。已解锁和已发放的奖励历史会保留。删除前请先保存原图。
          </p>
          {error && <p className="error">{error}</p>}
          <div className="modal-actions">
            <button
              className="secondary"
              onClick={() => setConfirmDelete(false)}
            >
              保留作品
            </button>
            <button
              className="danger-button"
              disabled={busy}
              onClick={() => void remove()}
            >
              确认删除最后一张
            </button>
          </div>
        </Modal>
      )}
      {settings && (
        <Modal title="按你的节奏冒险" onClose={() => setSettings(false)}>
          <div className="preference-row">
            <div>
              <h3>
                {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
                轻轻的游戏音效
              </h3>
              <p>仅在你操作后播放简短音效。</p>
            </div>
            <input
              type="checkbox"
              aria-label="开启音效"
              checked={sound}
              onChange={(e) => {
                setSound(e.target.checked);
                localStorage.setItem("brush-sound", String(e.target.checked));
              }}
            />
          </div>
          <div className="preference-row">
            <div>
              <h3>
                <Sparkles size={18} />
                减少动态效果
              </h3>
              <p>让风景安静下来，保留所有功能。</p>
            </div>
            <input
              type="checkbox"
              aria-label="减少动态效果"
              checked={reduced}
              onChange={(e) => {
                setReduced(e.target.checked);
                localStorage.setItem("brush-reduced", String(e.target.checked));
              }}
            />
          </div>
          <div className="account-info">
            <p>{state?.role === "admin" ? "当前身份：冒险发起人" : "共享冒险 · 打开就能继续，画作自动同步"}</p>
            {state?.role === "admin" && <button className="text-button" disabled={busy} onClick={() => void logout()}>退出管理</button>}
          </div>
          <p className="small-print">
            偏好只记录在当前设备。正式作品、宝箱和信件的状态保存在云端。
          </p>
        </Modal>
      )}
      {overview && (
        <Modal
          title="25 次冒险的完整路线"
          onClose={() => setOverview(false)}
          wide
        >
          <p className="muted">
            五段风景，慢慢走。每个节点都是一幅值得珍藏的画。
          </p>
          <div className="route-overview">
            {CHAPTERS.map((c, i) => {
              const Icon = icons[i];
              return (
                <div key={c.name}>
                  <h3>
                    <Icon size={18} />
                    {c.name}
                  </h3>
                  <div>
                    {Array.from({ length: 5 }, (_, j) => {
                      const n = i * 5 + j + 1;
                      return (
                        <button
                          key={n}
                          className={n <= count ? "done" : ""}
                          onClick={() => {
                            setChapter(i);
                            setTab("map");
                            setOverview(false);
                          }}
                        >
                          <span>{n <= count ? "✓" : n}</span>
                          {data.rewards.some((r) => r.node === n) && <Chest />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
      {reward && (
        <Modal
          title={
            reward.opened_at ? "一份送给你的礼物" : "有一份礼物，在这里等你"
          }
          onClose={() => setReward(null)}
        >
          <div className={`reward-reveal ${reward.opened_at ? "is-open" : ""}`}>
            <div className="reward-rays" />
            <Chest opened={!!reward.opened_at} />
            {reward.opened_at ? (
              <>
                <span className="eyebrow">{reward.name}</span>
                <strong>¥ {reward.amount}</strong>
                <p>
                  {reward.paid_at
                    ? "冒险发起人已记录实际发放。"
                    : "宝箱已开启 · 等待冒险发起人发放"}
                </p>
              </>
            ) : (
              <p>第 {reward.node} 次冒险，值得好好庆祝。</p>
            )}
          </div>
          {error && <p className="error">{error}</p>}
          {!reward.opened_at ? (
            <button
              className="primary full-width"
              disabled={busy}
              onClick={() => void revealChest()}
            >
              {busy ? "正在打开…" : "打开属于我的宝箱"}
            </button>
          ) : (
            <div className="modal-actions">
              <button className="secondary" onClick={() => setReward(null)}>
                把这份心意收好
              </button>
              {data.letters.find((l) => l.node === reward.node && l.body) && (
                <button
                  className="primary"
                  onClick={() => {
                    const l = data.letters.find(
                      (l) => l.node === reward.node && l.body,
                    )!;
                    setReward(null);
                    void readLetter(l);
                  }}
                >
                  <Mail size={16} />
                  读一读随礼物而来的信
                </button>
              )}
            </div>
          )}
        </Modal>
      )}
      {letter && (
        <Modal title={letter.title} onClose={() => setLetter(null)}>
          <div className="letter-reading">
            <span className="letter-salute">
              ADVENTURE {String(letter.node).padStart(2, "0")} · A LETTER FOR
              YOU
            </span>
            <div>{letter.body}</div>
            <Heart size={20} />
          </div>
        </Modal>
      )}
      {celebration !== null && (
        <Modal
          title={
            celebration === 25
              ? "你把这个世界，画完整了。"
              : "世界因为你，又明亮了一点。"
          }
          onClose={() => setCelebration(null)}
        >
          <div className="celebration">
            <Girl level={chapterFor(celebration)} />
            <span className="celebration-stars">✦　✧　✦</span>
            <h2>
              {celebration === 25
                ? "传说画笔勇者"
                : "第 " + celebration + " 次冒险 · 已珍藏"}
            </h2>
            <strong>
              {celebration === 25 ? "2,500 EXP · 旅程总经验" : "+ 100 EXP"}
            </strong>
            <p>
              {celebration === 25
                ? "25 幅作品，25 个独一无二的瞬间。谢谢你走到这里。"
                : "你留下的每一种颜色，都有自己的意义。"}
            </p>
          </div>
          <div className="modal-actions">
            <button
              className="secondary"
              onClick={() => {
                setCelebration(null);
                navigate("gallery");
              }}
            >
              看看我的作品
            </button>
            {data.rewards.find(
              (r) => r.node === celebration && !r.opened_at,
            ) ? (
              <button
                className="primary"
                onClick={() => {
                  setReward(data.rewards.find((r) => r.node === celebration)!);
                  setCelebration(null);
                }}
              >
                <Chest />
                发现了一只宝箱
              </button>
            ) : (
              <button className="primary" onClick={() => setCelebration(null)}>
                回到冒险地图
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

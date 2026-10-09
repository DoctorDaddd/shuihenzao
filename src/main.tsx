import React, { Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import Adventure from "../components/Adventure";
import "../app/globals.css";

class AppBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { console.error("quest_ui_render_failed"); }
  render() {
    if (this.state.failed) return <main className="paper-panel" role="alert">
      <h1>冒险画面暂时未能展开</h1><p>已保存的作品仍留在云端，请刷新页面重试。</p>
      <button className="primary" onClick={() => location.reload()}>重新打开冒险</button>
    </main>;
    return this.props.children;
  }
}
createRoot(document.getElementById("root")!).render(<React.StrictMode><AppBoundary><Adventure /></AppBoundary></React.StrictMode>);

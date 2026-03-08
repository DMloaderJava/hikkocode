import { ProjectSidebar } from "@/components/builder/ProjectSidebar";
import { ChatPanel } from "@/components/builder/ChatPanel";
import { FileExplorer } from "@/components/builder/FileExplorer";
import { CodeViewer } from "@/components/builder/CodeViewer";
import { LivePreview } from "@/components/builder/LivePreview";
import { BuildLogs } from "@/components/builder/BuildLogs";
import { VersionHistory } from "@/components/builder/VersionHistory";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { Eye, Code, Terminal, History, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft } from "lucide-react";

type RightView = "preview" | "code";
type BottomTab = "logs" | "history";

export default function Builder() {
  const { activeFile, activeProject } = useApp();
  const [rightView, setRightView] = useState<RightView>("preview");
  const [bottomTab, setBottomTab] = useState<BottomTab>("logs");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showBottom, setShowBottom] = useState(true);

  const effectiveView = activeFile ? "code" : rightView;

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Left sidebar */}
      {showSidebar && <ProjectSidebar onCollapse={() => setShowSidebar(false)} />}

      {/* Center */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-11 flex items-center border-b border-border bg-card px-3 gap-2">
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded gradient-lovable" />
            <span className="text-sm font-medium text-foreground">
              {activeProject?.name || "Laughable"}
            </span>
          </div>
          <div className="ml-auto flex items-center">
            {/* Right panel tabs */}
            <div className="flex items-center bg-secondary rounded-lg p-0.5">
              <button
                onClick={() => setRightView("preview")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  effectiveView === "preview"
                    ? "bg-card text-foreground shadow-lovable"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Preview
              </button>
              <button
                onClick={() => setRightView("code")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  effectiveView === "code"
                    ? "bg-card text-foreground shadow-lovable"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                Code
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex min-h-0">
          {/* Chat panel */}
          <div className="w-[420px] flex flex-col min-w-0 border-r border-border bg-card">
            <ChatPanel />
          </div>

          {/* Right: Preview / Code with optional File Explorer */}
          <div className="flex-1 flex min-w-0">
            {effectiveView === "code" && (
              <div className="w-48 border-r border-border overflow-y-auto scrollbar-thin bg-card">
                <FileExplorer />
              </div>
            )}
            <div className="flex-1 min-w-0">
              {effectiveView === "preview" ? <LivePreview /> : <CodeViewer />}
            </div>
          </div>
        </div>

        {/* Bottom panel */}
        {showBottom && (
          <div className="h-36 border-t border-border flex flex-col bg-card">
            <div className="flex items-center gap-1 px-2 py-1 border-b border-border">
              <button
                onClick={() => setBottomTab("logs")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  bottomTab === "logs"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Terminal className="w-3 h-3" />
                Build Logs
              </button>
              <button
                onClick={() => setBottomTab("history")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  bottomTab === "history"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <History className="w-3 h-3" />
                Versions
              </button>
              <button
                onClick={() => setShowBottom(false)}
                className="ml-auto p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="w-3 h-3 rotate-90" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {bottomTab === "logs" ? <BuildLogs /> : <VersionHistory />}
            </div>
          </div>
        )}

        {!showBottom && (
          <button
            onClick={() => setShowBottom(true)}
            className="flex items-center gap-1 px-3 py-1 border-t border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Terminal className="w-3 h-3" />
            Show panel
            <ChevronLeft className="w-3 h-3 -rotate-90" />
          </button>
        )}
      </div>
    </div>
  );
}

import { ProjectSidebar } from "@/components/builder/ProjectSidebar";
import { ChatPanel } from "@/components/builder/ChatPanel";
import { FileExplorer } from "@/components/builder/FileExplorer";
import { CodeViewer } from "@/components/builder/CodeViewer";
import { LivePreview } from "@/components/builder/LivePreview";
import { VersionHistory } from "@/components/builder/VersionHistory";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import {
  Eye,
  Code,
  Cloud,
  Palette,
  Shield,
  Zap,
  Share2,
  ChevronDown,
  PanelLeft,
  Globe,
  MoreHorizontal,
  Plus,
} from "lucide-react";

type RightView = "preview" | "code" | "cloud";

export default function Builder() {
  const { activeFile, activeProject, setActiveFile } = useApp();
  const [rightView, setRightView] = useState<RightView>("preview");
  const [showSidebar, setShowSidebar] = useState(false);

  const effectiveView = activeFile ? "code" : rightView;

  const rightTabs = [
    { id: "preview" as const, label: "Preview", icon: Eye },
    { id: "code" as const, label: "Code", icon: Code },
    { id: "cloud" as const, label: "Cloud", icon: Cloud },
  ];

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Narrow icon sidebar (like Lovable's left strip) */}
      {showSidebar && <ProjectSidebar onCollapse={() => setShowSidebar(false)} />}

      {/* Main layout: Chat left, Preview right */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navigation bar */}
        <div className="h-12 flex items-center border-b border-border bg-card px-3 gap-3">
          {/* Left: sidebar toggle + project name */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded gradient-lovable flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate max-w-[160px]">
                {activeProject?.name || "Laughable"}
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            </div>
          </div>

          {/* Center: View tabs (Preview, Code, Cloud, etc.) */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center bg-secondary/60 rounded-lg p-0.5 gap-0.5">
              {rightTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setRightView(tab.id);
                    if (tab.id !== "code") setActiveFile(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    effectiveView === tab.id
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Right: Share, Publish */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:opacity-90 transition-opacity">
              <Globe className="w-3.5 h-3.5" />
              Publish
            </button>
          </div>
        </div>

        {/* Content area: Chat | Preview/Code */}
        <div className="flex-1 flex min-h-0">
          {/* Left: Chat panel */}
          <div className="w-[380px] min-w-[320px] flex flex-col border-r border-border bg-card">
            <ChatPanel />
          </div>

          {/* Right: Preview / Code / Cloud */}
          <div className="flex-1 flex min-w-0">
            {effectiveView === "code" && (
              <div className="w-52 border-r border-border overflow-y-auto scrollbar-thin bg-card">
                <FileExplorer />
              </div>
            )}
            <div className="flex-1 min-w-0 bg-secondary/20">
              {effectiveView === "preview" && <LivePreview />}
              {effectiveView === "code" && <CodeViewer />}
              {effectiveView === "cloud" && (
                <div className="flex-1 flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Cloud className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium text-foreground/60">Cloud</p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Database, auth, and functions
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

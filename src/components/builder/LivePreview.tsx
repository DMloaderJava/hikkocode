import { useApp } from "@/context/AppContext";
import { RefreshCw, ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { useMemo, useState } from "react";

export function LivePreview() {
  const { activeProject, isGenerating } = useApp();
  const [key, setKey] = useState(0);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const previewHtml = useMemo(() => {
    if (!activeProject || activeProject.files.length === 0) return null;

    const htmlFile = activeProject.files.find((f) => f.language === "html");
    const cssFile = activeProject.files.find((f) => f.language === "css");
    const jsFile = activeProject.files.find((f) => f.language === "javascript");

    if (!htmlFile) return null;

    let html = htmlFile.content;

    if (cssFile) {
      html = html.replace(
        /<link[^>]*href=["']styles\.css["'][^>]*\/?>/i,
        `<style>${cssFile.content}</style>`
      );
    }

    if (jsFile) {
      html = html.replace(
        /<script[^>]*src=["'](?:app|auth)\.js["'][^>]*><\/script>/i,
        `<script>${jsFile.content}<\/script>`
      );
    }

    return html;
  }, [activeProject]);

  const deviceWidth = device === "mobile" ? "375px" : device === "tablet" ? "768px" : "100%";

  if (!activeProject || activeProject.files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
            <Monitor className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <p className="text-sm font-medium text-foreground/60">Preview</p>
          <p className="text-xs mt-1 text-muted-foreground">
            Your app will appear here after generation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Browser-like URL bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5 mr-2">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent/40" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/20" />
        </div>

        {/* URL bar */}
        <div className="flex-1 flex items-center bg-secondary rounded-lg px-3 py-1.5">
          <span className="text-xs text-muted-foreground truncate">
            {activeProject.name.toLowerCase().replace(/\s+/g, "-")}.laughable.app
          </span>
          {isGenerating && (
            <span className="ml-auto text-[10px] text-accent animate-pulse">loading...</span>
          )}
        </div>

        {/* Device toggles */}
        <div className="flex items-center gap-0.5 bg-secondary rounded-lg p-0.5">
          {([
            { id: "desktop" as const, icon: Monitor },
            { id: "tablet" as const, icon: Tablet },
            { id: "mobile" as const, icon: Smartphone },
          ]).map(d => (
            <button
              key={d.id}
              onClick={() => setDevice(d.id)}
              className={`p-1 rounded-md transition-colors ${
                device === d.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <d.icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        <button
          onClick={() => setKey((k) => k + 1)}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Open in new tab"
          onClick={() => {
            if (previewHtml) {
              const win = window.open();
              if (win) { win.document.write(previewHtml); win.document.close(); }
            }
          }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 flex items-start justify-center bg-secondary/30 overflow-auto p-0">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: deviceWidth, maxWidth: "100%" }}
        >
          {previewHtml && (
            <iframe
              key={key}
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="App Preview"
              sandbox="allow-scripts allow-modals"
            />
          )}
        </div>
      </div>
    </div>
  );
}

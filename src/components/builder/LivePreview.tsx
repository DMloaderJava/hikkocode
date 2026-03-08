import { useApp } from "@/context/AppContext";
import { Eye, ExternalLink, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";

export function LivePreview() {
  const { activeProject, isGenerating } = useApp();
  const [key, setKey] = useState(0);

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

  if (!activeProject || activeProject.files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground bg-secondary/30">
        <div className="text-center">
          <Eye className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium text-foreground/60">Preview</p>
          <p className="text-xs mt-1 text-muted-foreground">
            Your app will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* URL bar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card">
        <div className="flex-1 flex items-center gap-2 bg-secondary rounded-lg px-3 py-1">
          <div className="w-2 h-2 rounded-full bg-accent/60" />
          <span className="text-xs text-muted-foreground truncate">
            localhost:3000 — {activeProject.name}
          </span>
          {isGenerating && (
            <span className="text-[10px] text-accent animate-pulse ml-auto">updating</span>
          )}
        </div>
        <button
          onClick={() => setKey((k) => k + 1)}
          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
        <button
          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
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
      <div className="flex-1 bg-white">
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
  );
}

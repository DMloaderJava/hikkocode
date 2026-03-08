import { useApp } from "@/context/AppContext";
import { Monitor } from "lucide-react";
import { useMemo, useState } from "react";

interface LivePreviewProps {
  device?: "desktop" | "tablet" | "mobile";
  refreshKey?: number;
}

export function LivePreview({ device = "desktop", refreshKey = 0 }: LivePreviewProps) {
  const { activeProject, isGenerating } = useApp();

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

  const deviceWidth =
    device === "mobile" ? "375px" : device === "tablet" ? "768px" : "100%";

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
      {/* Preview iframe — clean, no internal toolbar */}
      <div className="flex-1 flex items-start justify-center bg-secondary/20 overflow-auto">
        <div
          className="h-full bg-white transition-all duration-300"
          style={{ width: deviceWidth, maxWidth: "100%" }}
        >
          {previewHtml && (
            <iframe
              key={refreshKey}
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

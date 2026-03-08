import { useApp } from "@/context/AppContext";
import { Code, Copy, Check, X } from "lucide-react";
import { useState } from "react";

export function CodeViewer() {
  const { activeFile, setActiveFile } = useApp();
  const [copied, setCopied] = useState(false);

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Code className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-medium text-foreground/60">Code Viewer</p>
          <p className="text-xs mt-1">Select a file from the explorer</p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* File tab bar */}
      <div className="flex items-center border-b border-border bg-card px-1">
        <div className="flex items-center gap-0 overflow-x-auto">
          <div className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-foreground bg-secondary/50 border-b-2 border-accent">
            <Code className="w-3 h-3 text-muted-foreground" />
            {activeFile.name}
            <button
              onClick={() => setActiveFile(null)}
              className="ml-1 p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
        <div className="ml-auto pr-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground rounded transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="flex-1 overflow-auto scrollbar-thin bg-card">
        <pre className="text-xs font-mono leading-5 py-3">
          <code>
            {activeFile.content.split("\n").map((line, i) => (
              <div key={i} className="flex hover:bg-secondary/40 transition-colors px-2">
                <span className="inline-block w-12 text-right pr-4 text-muted-foreground/30 select-none flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-foreground whitespace-pre">{line || " "}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

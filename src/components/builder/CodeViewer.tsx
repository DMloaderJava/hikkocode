import { useApp } from "@/context/AppContext";
import { Code, Copy, Check } from "lucide-react";
import { useState } from "react";

export function CodeViewer() {
  const { activeFile } = useApp();
  const [copied, setCopied] = useState(false);

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground bg-secondary/20">
        <div className="text-center">
          <Code className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Select a file to view code</p>
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
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2 text-xs">
          <Code className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-foreground font-medium">{activeFile.name}</span>
          <span className="text-muted-foreground px-1.5 py-0.5 bg-secondary rounded text-[10px]">{activeFile.language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-0 scrollbar-thin bg-card">
        <pre className="text-xs font-mono leading-5 p-4">
          <code>
            {activeFile.content.split("\n").map((line, i) => (
              <div key={i} className="flex hover:bg-secondary/50 transition-colors">
                <span className="inline-block w-10 text-right pr-4 text-muted-foreground/40 select-none">
                  {i + 1}
                </span>
                <span className="text-foreground">{line || " "}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

import { useApp } from "@/context/AppContext";
import { History, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function VersionHistory() {
  const { activeProject, restoreVersion } = useApp();

  if (!activeProject || activeProject.history.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-xs">
        <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p>No version history yet</p>
        <p className="mt-1 text-muted-foreground/50">Generate code to create versions</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-secondary/50">
        <History className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Version History</span>
        <span className="ml-auto text-xs text-muted-foreground">
          Current: v{activeProject.version}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {[...activeProject.history].reverse().map((snapshot) => (
            <motion.div
              key={snapshot.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/80 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-primary">v{snapshot.version}</span>
                  <span className="text-xs text-muted-foreground">
                    {snapshot.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {snapshot.prompt}
                </p>
                <p className="text-xs text-muted-foreground/50">
                  {snapshot.files.length} files
                </p>
              </div>
              <button
                onClick={() => restoreVersion(activeProject.id, snapshot.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-all"
                title="Restore this version"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

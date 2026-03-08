import { useApp } from "@/context/AppContext";
import { History, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function VersionHistory() {
  const { activeProject, restoreVersion } = useApp();

  if (!activeProject || activeProject.history.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-xs">
        <History className="w-6 h-6 mx-auto mb-2 opacity-20" />
        <p>No versions yet</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-2 space-y-0.5 scrollbar-thin">
      <AnimatePresence mode="popLayout">
        {[...activeProject.history].reverse().map((snapshot) => (
          <motion.div
            key={snapshot.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-accent font-medium">v{snapshot.version}</span>
                <span className="text-[10px] text-muted-foreground">
                  {snapshot.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {snapshot.prompt}
              </p>
            </div>
            <button
              onClick={() => restoreVersion(activeProject.id, snapshot.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md bg-secondary text-muted-foreground hover:text-foreground transition-all"
              title="Restore"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

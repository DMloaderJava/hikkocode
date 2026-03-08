import { useState, forwardRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Loader2,
  Circle,
  ChevronRight,
  Eye,
  FileText,
  Brain,
  BookOpen,
  ListChecks,
  Pencil,
  ShieldCheck,
  Clock,
  ChevronDown,
} from "lucide-react";

export interface TaskStep {
  id: string;
  label: string;
  status: "pending" | "in_progress" | "done";
  type?: "think" | "read" | "plan" | "edit" | "verify" | "default";
  detail?: string;
  duration?: number;
}

interface TaskCardProps {
  title: string;
  steps: TaskStep[];
  toolCount?: number;
  timestamp?: string;
  filesChanged?: string[];
  thinkingTime?: number;
  onPreviewClick?: () => void;
}

const stepIcons: Record<string, typeof Brain> = {
  think: Brain,
  read: BookOpen,
  plan: ListChecks,
  edit: Pencil,
  verify: ShieldCheck,
  default: Circle,
};

const stepColors: Record<string, string> = {
  think: "text-violet-400",
  read: "text-blue-400",
  plan: "text-amber-400",
  edit: "text-emerald-400",
  verify: "text-cyan-400",
  default: "text-muted-foreground",
};

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const s = (ms / 1000).toFixed(1);
  return `${s}s`;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(function TaskCard({
  title,
  steps,
  toolCount,
  timestamp,
  filesChanged,
  thinkingTime,
  onPreviewClick,
}, ref) {
  const [expanded, setExpanded] = useState(false);
  const [filesExpanded, setFilesExpanded] = useState(false);

  const doneCount = steps.filter((s) => s.status === "done").length;
  const isComplete = doneCount === steps.length && steps.length > 0;
  const isWorking = steps.some((s) => s.status === "in_progress");
  const currentStep = steps.find((s) => s.status === "in_progress");

  // Auto-expand when working
  useEffect(() => {
    if (isWorking && !expanded) setExpanded(true);
  }, [isWorking]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
    >
      {/* Compact header - collapsible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/30 transition-colors"
      >
        {/* Status indicator */}
        {isComplete ? (
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Check className="w-3 h-3 text-emerald-500" />
          </div>
        ) : isWorking ? (
          <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <Loader2 className="w-4 h-4 text-accent animate-spin" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full border border-muted-foreground/30 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0 text-left">
          {/* Title + current action */}
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {isComplete ? "Finished" : isWorking ? (currentStep?.label || "Working...") : title}
            </h3>
            {thinkingTime && isComplete && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground flex-shrink-0">
                <Clock className="w-2.5 h-2.5" />
                {formatDuration(thinkingTime)}
              </span>
            )}
          </div>
          {/* Subtitle with detail */}
          {currentStep?.detail && isWorking && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{currentStep.detail}</p>
          )}
          {isComplete && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {filesChanged && filesChanged.length > 0
                ? `${filesChanged.length} file${filesChanged.length > 1 ? "s" : ""} changed`
                : title}
            </p>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded: detailed steps */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="steps"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 space-y-1 border-t border-border pt-2">
              {steps.map((step, idx) => {
                const IconComponent = stepIcons[step.type || "default"] || Circle;
                const colorClass = step.status === "done"
                  ? "text-foreground/70"
                  : step.status === "in_progress"
                  ? stepColors[step.type || "default"]
                  : "text-muted-foreground/30";

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="flex items-start gap-2.5 py-0.5"
                  >
                    {/* Step icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {step.status === "done" ? (
                        <div className="w-4 h-4 rounded-full bg-foreground/80 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-background" />
                        </div>
                      ) : step.status === "in_progress" ? (
                        <Loader2 className={`w-4 h-4 animate-spin ${colorClass}`} />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground/20" />
                      )}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`w-3 h-3 flex-shrink-0 ${colorClass}`} />
                        <span
                          className={`text-xs ${
                            step.status === "done"
                              ? "text-foreground/70"
                              : step.status === "in_progress"
                              ? "text-foreground font-medium"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {step.label}
                        </span>
                        {step.duration && step.status === "done" && (
                          <span className="text-[10px] text-muted-foreground/50">
                            {formatDuration(step.duration)}
                          </span>
                        )}
                      </div>
                      {step.detail && (
                        <p className={`text-[11px] mt-0.5 ml-5 font-mono ${
                          step.status === "in_progress" ? "text-muted-foreground" : "text-muted-foreground/50"
                        }`}>
                          {step.detail}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Files changed section */}
            {filesChanged && filesChanged.length > 0 && (
              <div className="border-t border-border">
                <button
                  onClick={(e) => { e.stopPropagation(); setFilesExpanded(!filesExpanded); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  <span>{filesChanged.length} file{filesChanged.length > 1 ? "s" : ""} changed</span>
                  <ChevronRight
                    className={`w-3 h-3 ml-auto transition-transform ${filesExpanded ? "rotate-90" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {filesExpanded && (
                    <motion.div
                      key="files"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-2 space-y-1">
                        {filesChanged.map((file, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Pencil className="w-2.5 h-2.5 text-emerald-400/60" />
                            <span className="font-mono text-[11px]">{file}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

import { useApp } from "@/context/AppContext";
import { Plus, FolderOpen, Settings, PanelLeftClose } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export function ProjectSidebar({ onCollapse }: { onCollapse?: () => void }) {
  const { projects, activeProject, setActiveProject, createProject } = useApp();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const navigate = useNavigate();

  const handleCreate = () => {
    if (!newName.trim()) return;
    createProject(newName.trim(), "");
    setNewName("");
    setShowNew(false);
  };

  return (
    <div className="w-60 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <button onClick={() => navigate("/")} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md gradient-lovable" />
          <span className="font-semibold text-sm text-foreground">Laughable</span>
        </button>
        <button
          onClick={onCollapse}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* New project */}
      <div className="p-3 border-b border-border">
        <button
          onClick={() => setShowNew(!showNew)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </div>

      {showNew && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="p-3 border-b border-border"
        >
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Project name..."
            className="w-full bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring mb-2"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
          <button
            onClick={handleCreate}
            className="w-full px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
          >
            Create
          </button>
        </motion.div>
      )}

      {/* Project list */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <div className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Projects
        </div>
        {projects.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-xs">
            No projects yet
          </div>
        ) : (
          projects.map((project) => (
            <button
              key={project.id}
              onClick={() => setActiveProject(project)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors mb-0.5 ${
                activeProject?.id === project.id
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{project.name}</span>
              {project.version > 0 && (
                <span className="ml-auto text-[10px] text-muted-foreground bg-secondary rounded px-1">
                  v{project.version}
                </span>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
          <span className="text-xs">🤖</span>
        </div>
        <span className="text-xs text-muted-foreground truncate flex-1">Laughable AI</span>
        <button className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { ArrowUp, Plus, MessageCircle, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, FormEvent } from "react";
import { useApp } from "@/context/AppContext";

export default function Landing() {
  const navigate = useNavigate();
  const { createProject } = useApp();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const project = createProject(prompt.trim().slice(0, 40), prompt.trim());
    navigate("/builder", { state: { initialPrompt: prompt.trim() } });
  };

  const suggestions = [
    "Build a task management app",
    "Create a portfolio website",
    "Make a weather dashboard",
    "Design a recipe sharing app",
  ];

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-lovable" />
          <span className="font-semibold text-lg text-foreground">Laughable</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/builder")}
            className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/builder")}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-semibold mb-3 text-foreground leading-tight">
            Build something<br />
            <span className="gradient-lovable-text">Laughable</span>
          </h1>
          <p className="text-muted-foreground text-base mb-10">
            Create apps and websites by chatting with AI
          </p>
        </motion.div>

        {/* Prompt Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-xl mx-auto"
        >
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl shadow-lovable-md border border-border p-4"
          >
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Laughable to build your app..."
              className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm resize-none outline-none min-h-[80px] mb-3"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-30"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(s)}
                className="px-3 py-1.5 rounded-full text-xs text-muted-foreground bg-card border border-border hover:border-foreground/20 hover:text-foreground transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        🤖 Laughable AI — A parody for educational purposes
      </footer>
    </div>
  );
}

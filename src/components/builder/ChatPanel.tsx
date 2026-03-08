import { useState, FormEvent, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Bot, User, Loader2 } from "lucide-react";
import { useApp, ChatMessage } from "@/context/AppContext";
import { generateProject } from "@/lib/generator";
import { useLocation } from "react-router-dom";

export function ChatPanel() {
  const { activeProject, addMessage, setFiles, isGenerating, setIsGenerating, setLoadingMessage, loadingMessage, updateLastAssistantMessage } = useApp();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const initialPromptHandled = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeProject?.messages, isGenerating, loadingMessage]);

  // Handle initial prompt from landing page
  useEffect(() => {
    if (location.state?.initialPrompt && activeProject && !initialPromptHandled.current && activeProject.messages.length === 0) {
      initialPromptHandled.current = true;
      const prompt = location.state.initialPrompt;
      submitPrompt(prompt);
    }
  }, [activeProject, location.state]);

  if (!activeProject) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground p-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl gradient-lovable mx-auto mb-4 opacity-40" />
          <p className="text-sm font-medium text-foreground mb-1">No project selected</p>
          <p className="text-xs text-muted-foreground">Create or select a project to start building</p>
        </div>
      </div>
    );
  }

  const submitPrompt = async (prompt: string) => {
    if (!prompt.trim() || isGenerating || !activeProject) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt.trim(),
      timestamp: new Date(),
    };

    addMessage(activeProject.id, userMsg);
    setIsGenerating(true);
    setLoadingMessage("Starting generation...");

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "⏳ Generating your app...",
      timestamp: new Date(),
    };
    addMessage(activeProject.id, assistantMsg);

    try {
      const files = await generateProject(
        prompt.trim(),
        activeProject.files,
        setLoadingMessage,
        (streamedText: string) => {
          const preview = streamedText.length > 200
            ? `Writing code... (${streamedText.length} chars)`
            : "AI is writing code...";
          updateLastAssistantMessage(activeProject.id, preview);
        }
      );
      setFiles(activeProject.id, files, prompt.trim());

      updateLastAssistantMessage(
        activeProject.id,
        `I've generated ${files.length} files for your project. Check the preview to see it live!\n\nFiles:\n${files.map(f => `• ${f.path}`).join("\n")}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      updateLastAssistantMessage(
        activeProject.id,
        `Something went wrong: ${errorMessage}\n\nPlease try again.`
      );
    } finally {
      setIsGenerating(false);
      setLoadingMessage("");
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    const prompt = input.trim();
    setInput("");
    submitPrompt(prompt);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {activeProject.messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 rounded-xl gradient-lovable mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Describe the app you want to build
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {activeProject.messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg gradient-lovable flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isGenerating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-2.5 items-start"
          >
            <div className="w-7 h-7 rounded-lg gradient-lovable flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            </div>
            <div className="bg-secondary rounded-2xl px-3.5 py-2.5 text-sm text-muted-foreground">
              {loadingMessage}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe changes or ask for features..."
            className="w-full bg-secondary border border-border rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring resize-none transition-colors"
            disabled={isGenerating}
            rows={2}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className="absolute right-2.5 bottom-2.5 w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-20"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

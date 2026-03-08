import { useState, FormEvent, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Bot, User, Loader2, Plus, Paperclip, MessageCircle } from "lucide-react";
import { useApp, ChatMessage } from "@/context/AppContext";
import { generateProject } from "@/lib/generator";
import { useLocation } from "react-router-dom";

export function ChatPanel() {
  const { activeProject, addMessage, setFiles, isGenerating, setIsGenerating, setLoadingMessage, loadingMessage, updateLastAssistantMessage } = useApp();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
      submitPrompt(location.state.initialPrompt);
    }
  }, [activeProject, location.state]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  if (!activeProject) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <div className="w-10 h-10 rounded-xl gradient-lovable mx-auto mb-4 opacity-50" />
            <p className="text-sm font-medium text-foreground mb-1">Welcome to Laughable</p>
            <p className="text-xs text-muted-foreground">Create a new project or select one from the sidebar to get started</p>
          </div>
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
      content: "Generating your app...",
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
            ? `Writing code... (${streamedText.length} chars received)`
            : "AI is writing code...";
          updateLastAssistantMessage(activeProject.id, preview);
        }
      );
      setFiles(activeProject.id, files, prompt.trim());

      updateLastAssistantMessage(
        activeProject.id,
        `I've created ${files.length} files for your project:\n\n${files.map(f => `• \`${f.path}\``).join("\n")}\n\nCheck the Preview tab to see your app live.`
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
      {/* Chat header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Chat</span>
          {isGenerating && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-accent">
              <Loader2 className="w-3 h-3 animate-spin" />
              Building
            </span>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
        {activeProject.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="w-8 h-8 rounded-lg gradient-lovable mb-3 opacity-40" />
            <p className="text-sm text-foreground font-medium mb-1">Start building</p>
            <p className="text-xs text-muted-foreground max-w-[240px]">
              Describe the app you want to create and Laughable will build it for you
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <AnimatePresence mode="popLayout">
              {activeProject.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.role === "user" ? (
                    <div className="flex gap-2.5 justify-end">
                      <div className="max-w-[85%] rounded-2xl rounded-br-md px-3.5 py-2.5 text-sm bg-primary text-primary-foreground leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-md gradient-lovable flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="max-w-[85%] text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
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
                <div className="w-6 h-6 rounded-md gradient-lovable flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                </div>
                <div className="text-sm text-muted-foreground italic">
                  {loadingMessage}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input area — Lovable style */}
      <div className="p-3 border-t border-border">
        <form onSubmit={handleSubmit}>
          <div className="bg-secondary/80 border border-border rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-ring transition-shadow">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Laughable to build something..."
              className="w-full bg-transparent px-3.5 pt-3 pb-1 text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none min-h-[40px] max-h-[200px]"
              disabled={isGenerating}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title="More options"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                type="submit"
                disabled={isGenerating || !input.trim()}
                className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-20"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

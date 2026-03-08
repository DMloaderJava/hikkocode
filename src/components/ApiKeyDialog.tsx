import { useState, useEffect } from "react";
import { Key, Eye, EyeOff, Check, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const STORAGE_KEY = "hikko_gemini_api_key";

export function getStoredApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function ApiKeyDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [key, setKey] = useState("");
  const [show, setShow] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    if (open) {
      const stored = getStoredApiKey();
      setHasKey(!!stored);
      setKey(stored || "");
      setShow(false);
    }
  }, [open]);

  const handleSave = () => {
    const trimmed = key.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    toast.success("API ключ сохранён");
    onClose();
  };

  const handleRemove = () => {
    localStorage.removeItem(STORAGE_KEY);
    setKey("");
    setHasKey(false);
    toast.success("API ключ удалён");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            Gemini API Key
          </DialogTitle>
          <DialogDescription>
            Введите свой API ключ от Google Gemini для генерации. Ключ хранится только в вашем браузере.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-secondary/40 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Получить ключ: <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aistudio.google.com/apikey</a>
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={!key.trim()}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Check className="w-3.5 h-3.5" />
              Сохранить
            </button>
            {hasKey && (
              <button
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

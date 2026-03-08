import { GeneratedFile } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";

export async function generateProject(
  prompt: string,
  existingFiles: GeneratedFile[],
  onLoadingMessage: (msg: string) => void
): Promise<GeneratedFile[]> {
  const { funnyLoadingMessages } = await import("@/context/AppContext");

  // Cycle through funny loading messages
  let msgIndex = 0;
  const interval = setInterval(() => {
    onLoadingMessage(funnyLoadingMessages[msgIndex % funnyLoadingMessages.length]);
    msgIndex++;
  }, 2200);

  try {
    onLoadingMessage("🧠 Sending prompt to Gemini AI...");

    const { data, error } = await supabase.functions.invoke("generate", {
      body: { prompt, existingFiles },
    });

    clearInterval(interval);

    if (error) {
      console.error("Edge function error:", error);
      throw new Error(error.message || "Generation failed");
    }

    if (data?.error) {
      console.error("AI error:", data.error);
      throw new Error(data.error);
    }

    const files: GeneratedFile[] = data?.files;
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new Error("No files were generated");
    }

    return files;
  } catch (err) {
    clearInterval(interval);
    throw err;
  }
}

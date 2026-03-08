import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PLANNING_PROMPT = `You are hikkocode AI Agent — an expert full-stack developer that plans before coding.

Analyze the user's request and create a structured action plan. Consider:
- What files need to be created or modified
- What technologies/approaches to use
- What the implementation order should be
- Potential challenges

You MUST call the "create_plan" tool with your plan.`;

function getGeminiKeys(): string[] {
  const raw = Deno.env.get("GEMINI_API_KEYS") || "";
  return raw.split(",").map((k) => k.trim()).filter(Boolean);
}

async function callWithGateway(messages: Array<{ role: string; content: string }>, tools: unknown[]) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  
  if (LOVABLE_API_KEY) {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools,
        tool_choice: { type: "function", function: { name: "create_plan" } },
        max_tokens: 4096,
        temperature: 0.4,
      }),
    });

    if (res.ok) return res;
    if (res.status !== 402 && res.status !== 429) {
      console.error("Gateway error:", res.status);
    }
  }

  // Gemini fallback
  const keys = getGeminiKeys();
  for (const key of keys) {
    try {
      const systemInstruction = messages.find((m) => m.role === "system")?.content || "";
      const contents = messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents,
            generationConfig: { temperature: 0.4, maxOutputTokens: 4096 },
            tools: [{
              functionDeclarations: [{
                name: "create_plan",
                description: "Create a structured action plan for the development task",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    analysis: { type: "STRING", description: "Brief analysis of what needs to be done" },
                    approach: { type: "STRING", description: "The technical approach to take" },
                    steps: {
                      type: "ARRAY",
                      items: {
                        type: "OBJECT",
                        properties: {
                          action: { type: "STRING", enum: ["create_file", "edit_file", "add_styles", "add_logic", "add_component", "configure", "verify"] },
                          file: { type: "STRING", description: "File path" },
                          description: { type: "STRING", description: "What to do" },
                        },
                        required: ["action", "description"],
                      },
                    },
                    technologies: {
                      type: "ARRAY",
                      items: { type: "STRING" },
                      description: "Technologies/libraries to use",
                    },
                  },
                  required: ["analysis", "approach", "steps"],
                },
              }],
            }],
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const funcCall = data.candidates?.[0]?.content?.parts?.find((p: any) => p.functionCall);
        if (funcCall) {
          return new Response(JSON.stringify(funcCall.functionCall.args), {
            headers: { "Content-Type": "application/json" },
          });
        }
        // Fallback: try to parse text
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const match = text.match(/\{[\s\S]*\}/);
          if (match) {
            return new Response(match[0], { headers: { "Content-Type": "application/json" } });
          }
        }
      }
      console.error(`Gemini key failed (${res.status})`);
    } catch (e) {
      console.error("Gemini error:", e);
    }
  }
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, existingFiles } = await req.json();

    let userContent = prompt;
    if (existingFiles && existingFiles.length > 0) {
      const fileList = existingFiles.map((f: any) => `- ${f.path} (${f.language})`).join("\n");
      userContent = `Existing project files:\n${fileList}\n\nUser request: ${prompt}`;
    }

    const messages = [
      { role: "system", content: PLANNING_PROMPT },
      { role: "user", content: userContent },
    ];

    const tools = [
      {
        type: "function",
        function: {
          name: "create_plan",
          description: "Create a structured action plan for the development task",
          parameters: {
            type: "object",
            properties: {
              analysis: { type: "string", description: "Brief analysis of what needs to be done" },
              approach: { type: "string", description: "The technical approach to take" },
              steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    action: { type: "string", enum: ["create_file", "edit_file", "add_styles", "add_logic", "add_component", "configure", "verify"] },
                    file: { type: "string", description: "File path" },
                    description: { type: "string", description: "What to do" },
                  },
                  required: ["action", "description"],
                },
              },
              technologies: {
                type: "array",
                items: { type: "string" },
                description: "Technologies/libraries to use",
              },
            },
            required: ["analysis", "approach", "steps"],
            additionalProperties: false,
          },
        },
      },
    ];

    const response = await callWithGateway(messages, tools);
    if (!response) {
      return new Response(
        JSON.stringify({ error: "Failed to create plan" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle Gateway (OpenAI-compatible) response
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      // Could be raw plan data (from Gemini fallback) or OpenAI format
      if (data.choices) {
        const toolCall = data.choices[0]?.message?.tool_calls?.[0];
        if (toolCall) {
          const plan = JSON.parse(toolCall.function.arguments);
          return new Response(JSON.stringify(plan), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Fallback: parse content
        const content = data.choices[0]?.message?.content;
        if (content) {
          const match = content.match(/\{[\s\S]*\}/);
          if (match) {
            return new Response(match[0], {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }
      // Already parsed plan data
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pass through
    const text = await response.text();
    return new Response(text, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Plan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

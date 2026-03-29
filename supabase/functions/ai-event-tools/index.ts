import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { action, ...params } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";
    let tools: any[] | undefined;
    let tool_choice: any | undefined;

    switch (action) {
      case "generate_description": {
        const { title, category, location, date, isOnline } = params;
        systemPrompt = `You are a world-class event copywriter specializing in African events. Write compelling, engaging event descriptions that drive ticket sales. Keep it 2-3 paragraphs, include emojis sparingly, and highlight what makes the event special. Write in an energetic but professional tone.`;
        userPrompt = `Write a compelling event description for:
Title: ${title}
Category: ${category || "General"}
Location: ${location || "TBD"}
Date: ${date || "TBD"}
Format: ${isOnline ? "Online/Virtual" : "In-person"}

Make it exciting and tailored for an African audience.`;
        break;
      }

      case "suggest_categories": {
        const { title, description } = params;
        systemPrompt = `You are an event categorization expert for an African event platform. Analyze event details and suggest the best category and relevant tags.`;
        userPrompt = `Based on this event, suggest a category and tags:
Title: ${title}
Description: ${description || "No description yet"}

Available categories: Music, Business, Food & Drink, Performing & Visual Arts, Nightlife, Hobbies, Festivals, Culture`;
        tools = [
          {
            type: "function",
            function: {
              name: "suggest_category_tags",
              description: "Return category and tag suggestions",
              parameters: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: ["Music", "Business", "Food & Drink", "Performing & Visual Arts", "Nightlife", "Hobbies", "Festivals", "Culture"],
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "5-8 relevant tags for the event",
                  },
                  confidence: {
                    type: "number",
                    description: "Confidence score 0-1",
                  },
                },
                required: ["category", "tags", "confidence"],
                additionalProperties: false,
              },
            },
          },
        ];
        tool_choice = { type: "function", function: { name: "suggest_category_tags" } };
        break;
      }

      case "smart_search": {
        const { query, events } = params;
        systemPrompt = `You are a smart event search engine for Afritickets, Africa's leading event platform. Given a natural language query and a list of events, return the IDs of matching events ranked by relevance. Understand intent: "this weekend" means the next Saturday/Sunday, "near me" means prioritize the user's context, "cheap" means low-priced tickets, etc. Today's date is ${new Date().toISOString().split("T")[0]}.`;
        userPrompt = `User query: "${query}"

Events (JSON):
${JSON.stringify(events.map((e: any) => ({ id: e.id, title: e.title, category: e.category, location: e.location, date: e.date, tags: e.tags })))}

Return matching event IDs ranked by relevance.`;
        tools = [
          {
            type: "function",
            function: {
              name: "return_search_results",
              description: "Return ranked event IDs matching the query",
              parameters: {
                type: "object",
                properties: {
                  event_ids: {
                    type: "array",
                    items: { type: "string" },
                    description: "Event IDs ranked by relevance",
                  },
                  interpretation: {
                    type: "string",
                    description: "Brief explanation of how the query was interpreted",
                  },
                },
                required: ["event_ids", "interpretation"],
                additionalProperties: false,
              },
            },
          },
        ];
        tool_choice = { type: "function", function: { name: "return_search_results" } };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    };
    if (tools) body.tools = tools;
    if (tool_choice) body.tool_choice = tool_choice;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit reached. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", status, text);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0]?.message;

    let result: any;
    if (choice?.tool_calls?.[0]) {
      result = JSON.parse(choice.tool_calls[0].function.arguments);
    } else {
      result = { content: choice?.content || "" };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-event-tools error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

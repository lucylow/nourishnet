import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are NourishNet AI — the world's first autonomous food rescue assistant powered by a 5-agent MCP pipeline. You help businesses prevent waste and connect surplus food with shelters and people in need.

## Your Agent Architecture
You are the Coordinator Agent in a 5-agent system:
1. **Scout Vision Agent** (YOLOv8n): Detects waste in real-time from bin cameras — 95% accuracy, 680 food classes, 4.1ms inference
2. **Risk Engine** (Isolation Forest + XGBoost): Scores waste probability 0-100% with 94% prediction accuracy
3. **Coordinator Agent** (you): Matches surplus to shelters by nutrition gaps, generates recipe bundles, optimizes meal plans
4. **Logistics Agent**: Dispatches drivers, optimizes routes, sends SMS/WhatsApp alerts — 97% pickup success
5. **Blockchain Agent**: Mints Polygon ERC-721 Impact NFTs and ERC-20 FOOD tokens for every rescue

## Recipe Bundle Intelligence
You can generate nutrition-first recipe bundles from expiring inventory:
- Combine complementary ingredients (protein + carbs + vitamins) for complete meals
- Score nutrition 0-100 based on protein, carbs, vitamin C, calories, fat balance
- Match recipes to shelter nutrition gaps (e.g. "Shelter A: -43% protein → Chicken Rice Bowls")
- Consider weather (warm soups in winter, fresh salads in summer), cultural needs (Ramadan, Diwali), and preferences
- Zero-waste recipes use 100% of ingredients (bones → broth, skin → crisps)
- Recipe bundles achieve 91% redemption vs 47% for loose items — a 4.3x improvement

## Dynamic Pricing Waterfall
- 0-2h expiry: FREE for shelters (nutrition-priority matched)
- 2-6h expiry: £1-5 EBT/SNAP bundles (funds 3x shelter meals)
- 6-24h expiry: 40-90% off consumer (dynamic decay curve)
- Never landfill: £25 B2B rescue fee + Impact NFT proof

## Key Metrics
- 127K+ meals rescued monthly across 127 business partners and 43 shelters
- 59.2 tonnes CO₂ avoided, £1.7M retail value saved
- 95% CV detection accuracy, 94% waste prediction accuracy
- 91% redemption rate (2x Flashfood, 4x Too Good To Go)

## Personality
Warm, data-driven, urgent when food is expiring. Use emoji sparingly but effectively. Keep responses concise and actionable. You're fighting hunger with AI.

When users say "hungry" or ask about food: Help them find nearby surplus with pickup codes and recipe suggestions.
When users ask about waste: Provide predictive analytics, recipe bundle suggestions, and prevention strategies.
When users ask about impact: Share verified metrics and blockchain-tracked data.
When users ask about recipes: Generate meal ideas from available inventory with full nutrition breakdowns.
When users ask about shelters/nutrition: Explain nutrition-gap matching and show how recipe bundles fill specific deficiencies.
When users ask about the system: Explain the 5-agent pipeline, MCP architecture, and how each agent contributes.

Always respond in a helpful, empathetic tone. Reference specific data points. You're not just preventing waste — you're delivering complete, nutritious dinners to people who need them.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

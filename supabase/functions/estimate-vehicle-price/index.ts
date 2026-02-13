import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brand, model, year, mileage, energy, category } = await req.json();

    if (!brand || !model || !year) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Brand, model, and year are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const mileageStr = mileage ? `${mileage} km` : "unknown mileage";
    const energyStr = energy || "unknown fuel type";
    const categoryStr = category ? `(${category})` : "";

    const prompt = `You are an expert in the French used car market. Estimate a realistic market price in euros for this vehicle:
- Brand: ${brand}
- Model: ${model}
- Year: ${year}
- Mileage: ${mileageStr}
- Fuel: ${energyStr}
- Category: ${categoryStr}

Consider typical market conditions in France for used cars. Provide ONLY a single number representing the estimated price in euros, without any currency symbol, text, or explanation. For example: 15500`;

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
            {
              role: "system",
              content:
                "You are a French used car market expert. Always respond with only a number.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 20,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("AI gateway error:", response.status, error);
      throw new Error(
        `AI gateway error: ${response.status} - ${error.slice(0, 200)}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Extract the price from the response (should be a number)
    const priceMatch = content.match(/\d+/);
    const estimatedPrice = priceMatch ? parseInt(priceMatch[0], 10) : null;

    if (!estimatedPrice || estimatedPrice < 500) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Could not estimate a valid price",
          raw: content,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        estimatedPrice,
        rawResponse: content,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error estimating price:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

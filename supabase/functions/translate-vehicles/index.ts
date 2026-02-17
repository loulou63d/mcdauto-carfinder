import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3';

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
    const { batch_size = 5 } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find vehicles needing translation
    const { data: vehicles, error: queryError } = await supabase
      .from("vehicles")
      .select("id, brand, model, year, price, description, description_translations")
      .or("description_translations.is.null,description_translations.eq.{}")
      .not("description", "is", null)
      .limit(batch_size);

    if (queryError) throw queryError;

    if (!vehicles || vehicles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, translated: 0, remaining: 0, results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Count remaining
    const { count } = await supabase
      .from("vehicles")
      .select("id", { count: "exact", head: true })
      .or("description_translations.is.null,description_translations.eq.{}");

    const results: { id: string; success: boolean; error?: string }[] = [];

    const systemPrompt = `Tu es un rédacteur automobile professionnel pour le concessionnaire MCD Auto.
MISSION : À partir de la description italienne d'un véhicule, rédige une NOUVELLE description professionnelle et commerciale dans 5 langues : DE, FR, EN, ES, PT.
RÈGLES IMPÉRATIVES :
- NE JAMAIS mentionner Ariel Car, ArielCar, Arval, AutoSelect ou tout autre revendeur tiers
- Le concessionnaire est UNIQUEMENT MCD Auto
- Supprime toute référence à des garanties ou services d'autres concessionnaires
- 80-150 mots par description, ton professionnel mais engageant
- Mets en avant : performances, confort, fiabilité, rapport qualité-prix
Retourne UNIQUEMENT un JSON valide : { "description_fr": "...", "description_de": "...", "description_en": "...", "description_es": "...", "description_pt": "..." }`;

    for (const vehicle of vehicles) {
      try {
        const userPrompt = `Véhicule : ${vehicle.brand} ${vehicle.model} ${vehicle.year}, prix ${vehicle.price}€
Description originale (possiblement en italien) :
${vehicle.description || "Aucune description disponible"}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!response.ok) {
          const status = response.status;
          if (status === 429) {
            results.push({ id: vehicle.id, success: false, error: "Rate limit" });
            break; // Stop batch on rate limit
          }
          if (status === 402) {
            results.push({ id: vehicle.id, success: false, error: "Credits exhausted" });
            break;
          }
          results.push({ id: vehicle.id, success: false, error: `AI error ${status}` });
          continue;
        }

        const aiData = await response.json();
        const content = aiData.choices?.[0]?.message?.content || "";

        let parsed;
        try {
          const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          parsed = JSON.parse(jsonStr);
        } catch {
          console.error("Failed to parse AI response for vehicle", vehicle.id, content.slice(0, 200));
          results.push({ id: vehicle.id, success: false, error: "Parse error" });
          continue;
        }

        // Update vehicle
        const { error: updateError } = await supabase
          .from("vehicles")
          .update({
            description: parsed.description_fr || vehicle.description,
            description_translations: {
              fr: parsed.description_fr || "",
              de: parsed.description_de || "",
              en: parsed.description_en || "",
              es: parsed.description_es || "",
              pt: parsed.description_pt || "",
            },
          })
          .eq("id", vehicle.id);

        if (updateError) {
          results.push({ id: vehicle.id, success: false, error: updateError.message });
        } else {
          results.push({ id: vehicle.id, success: true });
        }
      } catch (e) {
        results.push({ id: vehicle.id, success: false, error: e instanceof Error ? e.message : "Unknown" });
      }
    }

    const translated = results.filter(r => r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        translated,
        remaining: (count || 0) - translated,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("translate-vehicles error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

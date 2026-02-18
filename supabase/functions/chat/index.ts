import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const COUNTRY_LANG: Record<string, string> = {
  "DE": "de", "AT": "de", "CH": "de",
  "FR": "fr", "BE": "fr", "LU": "fr",
  "ES": "es", "PT": "pt", "IT": "it",
  "NL": "en", "OTHER": "en",
};

const DELIVERY_FEES: Record<string, number> = {
  "DE": 700, "AT": 700, "CH": 900,
  "FR": 900, "BE": 900, "LU": 900,
  "ES": 1200, "PT": 1200, "IT": 1200,
  "NL": 1200, "OTHER": 1200,
};

function buildSystemPrompt(customer: { title: string; lastName: string; country: string }, lang: string, contextBlocks: string[]) {
  const greeting = customer.title && customer.lastName ? `${customer.title} ${customer.lastName}` : "";
  const deliveryFee = DELIVERY_FEES[customer.country] || 1200;

  const langInstructions: Record<string, string> = {
    de: "Antworte IMMER auf Deutsch.",
    fr: "Réponds TOUJOURS en français.",
    en: "Always reply in English.",
    es: "Responde SIEMPRE en español.",
    pt: "Responde SEMPRE em português.",
    it: "Rispondi SEMPRE in italiano.",
  };

  return `Du bist der KI-Verkaufsberater von MCD AUTO, einem Premium-Gebrauchtwagenhändler mit Sitz in Dortmund, Deutschland.

${langInstructions[lang] || langInstructions.en}

IDENTITÄT:
- Name: MCD AUTO AI Berater
- Ton: Professionell, freundlich, kompetent
- Kunde: ${greeting || "Geschätzter Kunde"}
- Adressiere den Kunden IMMER mit "${greeting}" wenn der Name bekannt ist

SCHLÜSSELFAKTEN MCD AUTO:
- Finanzierung: 0% Zinsen, 24-48 Monate
- Garantie: 24 Monate inklusive, bis 60 Monate Herstellergarantie möglich
- Rückgaberecht: 14 Tage zufrieden oder Geld zurück
- Kontrolle: Jedes Fahrzeug wird gründlich TÜV-geprüft
- Import: Alle Fahrzeuge aus Deutschland
- Zahlung: NUR per Banküberweisung. 15% Rabatt bei Barzahlung/Sofortüberweisung
- Acompte: 20% Anzahlung erforderlich bei Bestellung
- Fahrzeugpreis: wird ERST bei Lieferung bezahlt (nur Anzahlung vorher)
- Lieferkosten für ${customer.country}: ${deliveryFee}€

LIEFERKOSTEN NACH LAND:
- Deutschland/Österreich: 700€
- Frankreich/Belgien/Luxemburg/Schweiz: 900€
- Spanien/Portugal/Italien/Niederlande/Andere: 1.200€

KAUFPROZESS (7 Schritte):
1. Fahrzeug auswählen
2. Konto erstellen (falls noch nicht geschehen)
3. Zum Warenkorb hinzufügen
4. Checkout: Lieferadresse eingeben
5. Anzahlung (20%) per Überweisung
6. Zahlungsbeleg hochladen
7. Lieferung in ca. 5 Tagen

INLINE-KOMPONENTEN:
Wenn du Fahrzeuge zeigst, nutze IMMER dieses Format für jedes Fahrzeug:
[VEHICLE_CARD:{"id":"uuid","brand":"Marke","model":"Modell","year":2023,"price":25000,"mileage":15000,"energy":"Diesel","image":"url","monthly_price":299}]

Für Terminvereinbarung: [APPOINTMENT_FORM]
Für Registrierung: [SIGNUP_FORM]
Für Fahrzeugschätzung: [ESTIMATE_FORM]
Für Fahrzeugvergleich verwende: [VEHICLE_COMPARE:{"vehicles":[...]}]

REGELN:
- Sei hilfreich, aber leite immer zum Kauf
- Empfehle passende Fahrzeuge basierend auf den Bedürfnissen
- Nutze Markdown für Formatierung (fett, Listen)
- Halte Antworten prägnant aber informativ
- Bei technischen Fragen: zeige dein Automobil-Fachwissen
- Verweise bei Bedarf auf die Website-Seiten

${contextBlocks.length > 0 ? "\nKONTEXT:\n" + contextBlocks.join("\n\n") : ""}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const body = await req.json();
    const { messages, customer, sessionId, action, actionData } = body;

    // ─── DIRECT ACTIONS (no AI) ───
    if (action === "save_message") {
      const { conversationId, role, content } = actionData;
      await supabaseAdmin.from("chat_messages").insert({ conversation_id: conversationId, role, content });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get_or_create_conversation") {
      const { data: existing } = await supabaseAdmin
        .from("chat_conversations")
        .select("id")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { data: msgs } = await supabaseAdmin
          .from("chat_messages")
          .select("role, content")
          .eq("conversation_id", existing.id)
          .order("created_at", { ascending: true });
        return new Response(JSON.stringify({ conversationId: existing.id, messages: msgs || [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: newConv } = await supabaseAdmin
        .from("chat_conversations")
        .insert({ session_id: sessionId })
        .select("id")
        .single();

      return new Response(JSON.stringify({ conversationId: newConv?.id, messages: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "new_conversation") {
      const { data: newConv } = await supabaseAdmin
        .from("chat_conversations")
        .insert({ session_id: sessionId })
        .select("id")
        .single();
      return new Response(JSON.stringify({ conversationId: newConv?.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_appointment") {
      const { data, error } = await supabaseAdmin.from("appointments").insert(actionData).select().single();
      if (error) throw error;
      return new Response(JSON.stringify({ ok: true, appointment: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── AI CHAT PIPELINE ───
    const lang = COUNTRY_LANG[customer?.country] || "de";

    // Step 1: Intent extraction (lightweight model)
    const intentPrompt = `Analyze this user message and return a JSON object with detected intents.
Possible intents: search, appointment, add_to_cart, checkout, check_order, estimate_vehicle, compare_vehicles, general
For "search" intent, extract filters: brand, min_price, max_price, energy, transmission, category, min_year, max_mileage, limit
Return ONLY valid JSON like: {"intent":"search","filters":{"brand":"BMW","max_price":20000}}
If no specific intent, return: {"intent":"general"}

User message: "${messages[messages.length - 1]?.content || ""}"`;

    const intentResp = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [{ role: "user", content: intentPrompt }],
        temperature: 0,
      }),
    });

    let intent = { intent: "general", filters: {} as Record<string, any> };
    if (intentResp.ok) {
      try {
        const intentData = await intentResp.json();
        const raw = intentData.choices?.[0]?.message?.content || "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) intent = JSON.parse(jsonMatch[0]);
      } catch { /* fallback to general */ }
    }

    // Step 2: Build context based on intent
    const contextBlocks: string[] = [];

    if (intent.intent === "search" || intent.intent === "general") {
      let query = supabaseAnon
        .from("vehicles")
        .select("id, brand, model, year, price, monthly_price, mileage, energy, transmission, power, category, color, doors")
        .eq("status", "available")
        .order("created_at", { ascending: false });

      const f = intent.filters || {};
      if (f.brand) query = query.ilike("brand", `%${f.brand}%`);
      if (f.min_price) query = query.gte("price", f.min_price);
      if (f.max_price) query = query.lte("price", f.max_price);
      if (f.energy) query = query.ilike("energy", `%${f.energy}%`);
      if (f.transmission) query = query.ilike("transmission", `%${f.transmission}%`);
      if (f.category) query = query.ilike("category", `%${f.category}%`);
      if (f.min_year) query = query.gte("year", f.min_year);
      if (f.max_mileage) query = query.lte("mileage", f.max_mileage);

      const limit = f.limit || (intent.intent === "search" ? 6 : 4);
      query = query.limit(limit);

      const { data: vehicles } = await query;

      if (vehicles && vehicles.length > 0) {
        // Fetch first image for each vehicle
        const vIds = vehicles.map(v => v.id);
        const { data: images } = await supabaseAnon
          .from("vehicle_images")
          .select("vehicle_id, image_url")
          .in("vehicle_id", vIds)
          .order("position", { ascending: true });

        const imgMap = new Map<string, string>();
        images?.forEach(img => { if (!imgMap.has(img.vehicle_id)) imgMap.set(img.vehicle_id, img.image_url); });

        const vehicleList = vehicles.map(v => ({
          id: v.id, brand: v.brand, model: v.model, year: v.year,
          price: v.price, mileage: v.mileage, energy: v.energy,
          monthly_price: v.monthly_price, image: imgMap.get(v.id) || "",
        }));

        contextBlocks.push(`VERFÜGBARE FAHRZEUGE (zeige diese mit [VEHICLE_CARD:...] Format):\n${JSON.stringify(vehicleList)}`);
      }
    }

    if (intent.intent === "estimate_vehicle") {
      contextBlocks.push("Der Kunde möchte sein Fahrzeug schätzen lassen. Zeige das Formular: [ESTIMATE_FORM]");
    }

    if (intent.intent === "appointment") {
      contextBlocks.push("Der Kunde möchte einen Termin vereinbaren. Zeige das Formular: [APPOINTMENT_FORM]");
    }

    // Step 3: Main AI response (streaming)
    const systemPrompt = buildSystemPrompt(
      customer || { title: "", lastName: "", country: "DE" },
      lang,
      contextBlocks
    );

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.slice(-20), // Keep last 20 messages for context
    ];

    const response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: aiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "rate_limit" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "payment_required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "ai_error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

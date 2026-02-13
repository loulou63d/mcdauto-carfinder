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
    const { url, limit = 100 } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Mapping category:", formattedUrl, "limit:", limit);

    // Use Firecrawl Map API to discover product URLs
    const response = await fetch("https://api.firecrawl.dev/v1/map", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        limit: Math.min(limit, 500),
        includeSubdomains: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl map error:", data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Map failed (${response.status})` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allLinks = data.links || [];
    
    // Filter for likely product URLs (not category pages, not admin, not checkout)
    const productUrls = allLinks.filter((link: string) => {
      const lower = link.toLowerCase();
      return (
        !lower.includes("/cart") &&
        !lower.includes("/checkout") &&
        !lower.includes("/my-account") &&
        !lower.includes("/wp-admin") &&
        !lower.includes("/wp-login") &&
        !lower.includes("/tag/") &&
        !lower.includes("page/") &&
        !lower.includes("#") &&
        link !== formattedUrl &&
        link !== formattedUrl + "/"
      );
    }).slice(0, limit);

    console.log(`Found ${productUrls.length} potential product URLs out of ${allLinks.length} total`);

    return new Response(
      JSON.stringify({ success: true, data: { urls: productUrls, total: allLinks.length } }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("scrape-category error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

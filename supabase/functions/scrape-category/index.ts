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

    const isAutosphere = formattedUrl.includes("autosphere.fr");

    console.log("Scanning category:", formattedUrl, "limit:", limit);

    // Strategy 1: scrape the listing page to extract product links from markdown
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown", "links"],
        onlyMainContent: false,
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResponse.json();
    let productUrls: string[] = [];

    if (scrapeResponse.ok) {
      const links = scrapeData.data?.links || scrapeData.links || [];
      const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";

      // Extract links from markdown too
      const mdLinkPattern = /\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
      let match;
      while ((match = mdLinkPattern.exec(markdown)) !== null) {
        if (!links.includes(match[1])) {
          links.push(match[1]);
        }
      }

      // Filter for product URLs based on site
      if (isAutosphere) {
        productUrls = links.filter((link: string) =>
          link.includes("/fiche-mixte/") || link.includes("/occasion/id-")
        );
      } else {
        productUrls = links.filter((link: string) => {
          const lower = link.toLowerCase();
          return (
            !lower.includes("/cart") &&
            !lower.includes("/checkout") &&
            !lower.includes("/my-account") &&
            !lower.includes("/wp-admin") &&
            !lower.includes("/wp-login") &&
            !lower.includes("/tag/") &&
            !lower.includes("page/") &&
            !lower.includes("/category/") &&
            !lower.includes("/recherche") &&
            !lower.includes("#") &&
            link !== formattedUrl &&
            link !== formattedUrl + "/"
          );
        });
      }
    }

    // Strategy 2: also try Firecrawl Map API for additional URLs
    if (productUrls.length < limit) {
      try {
        const mapResponse = await fetch("https://api.firecrawl.dev/v1/map", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: formattedUrl,
            limit: Math.min(limit * 2, 500),
            includeSubdomains: false,
          }),
        });

        if (mapResponse.ok) {
          const mapData = await mapResponse.json();
          const mapLinks = mapData.links || [];
          
          const additionalUrls = mapLinks.filter((link: string) => {
            if (productUrls.includes(link)) return false;
            if (isAutosphere) {
              return link.includes("/fiche-mixte/") || link.includes("/occasion/id-");
            }
            const lower = link.toLowerCase();
            return !lower.includes("/cart") && !lower.includes("/checkout") && !lower.includes("/category/");
          });

          productUrls = [...productUrls, ...additionalUrls];
        }
      } catch (e) {
        console.warn("Map API fallback failed:", e);
      }
    }

    // Deduplicate
    productUrls = [...new Set(productUrls)].slice(0, limit);

    console.log(`Found ${productUrls.length} product URLs`);

    return new Response(
      JSON.stringify({ success: true, data: { urls: productUrls, total: productUrls.length } }),
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

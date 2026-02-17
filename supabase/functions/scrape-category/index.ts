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
    const { url, limit = 50 } = await req.json();

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

    const isArielCar = formattedUrl.includes("arielcar.it");

    console.log("Scanning category:", formattedUrl, "limit:", limit);

    // ArielCar.it pagination: /marca/{brand-slug}/, /marca/{brand-slug}/page/2/, etc.
    // ~10 vehicles per page
    const pagesToScrape: string[] = [formattedUrl];
    if (isArielCar) {
      const maxPages = Math.min(Math.ceil(limit / 10) + 1, 15);
      const baseUrl = formattedUrl.replace(/\/page\/\d+\/?$/, "").replace(/\/$/, "");
      for (let i = 2; i <= maxPages; i++) {
        pagesToScrape.push(`${baseUrl}/page/${i}/`);
      }
    }

    let productUrls: string[] = [];

    for (const pageUrl of pagesToScrape) {
      if (productUrls.length >= limit) break;

      console.log("Scraping page:", pageUrl);

      const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: pageUrl,
          formats: ["markdown", "links"],
          onlyMainContent: false,
          waitFor: 3000,
        }),
      });

      const scrapeData = await scrapeResponse.json();

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

        let pageProductUrls: string[] = [];

        if (isArielCar) {
          // ArielCar product URLs: /offerte-auto/SLUG-NUMBER/
          pageProductUrls = links.filter((link: string) => {
            return /\/offerte-auto\/[\w-]+-\d+\/?$/.test(link) && !productUrls.includes(link);
          });
        } else {
          // Generic fallback
          pageProductUrls = links.filter((link: string) => {
            const lower = link.toLowerCase();
            return (
              !lower.includes("/cart") &&
              !lower.includes("/checkout") &&
              !lower.includes("/wp-admin") &&
              !lower.includes("/tag/") &&
              !lower.includes("page/") &&
              !lower.includes("/category/") &&
              !lower.includes("#") &&
              link !== pageUrl &&
              link !== pageUrl + "/"
            );
          });
        }

        productUrls = [...productUrls, ...pageProductUrls];
      } else {
        console.warn("Page scrape failed:", pageUrl, scrapeData.error);
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

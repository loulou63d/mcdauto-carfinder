import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRANDS = [
  "John Deere","Case IH","New Holland","Massey Ferguson","Fendt","Claas","Kubota",
  "Deutz-Fahr","Valtra","Same","Lamborghini","McCormick","Landini","Zetor","JCB",
  "Manitou","Merlo","Komatsu","Caterpillar","Volvo","Liebherr","Bobcat","Takeuchi",
  "Hitachi","Doosan","Yanmar","Iseki","Kioti","LS Tractor","Solis","Antonio Carraro",
  "Steyr","Hürlimann","Challenger","Versatile","AGCO","Amazone","Kuhn","Kverneland",
  "Lemken","Horsch","Väderstad","Grimme","Pöttinger","Rauch","Krone","Joskin",
  "Fliegl","Berthoud","Hardi","Bogballe","Sulky","Monosem","Breviglieri",
  "Bomford","McHale","Lely","Kongskilde","Maschio","Gaspardo","Alpego",
  "Agrisem","Agram","Bucher","Weidemann","Schäffer","Dieci","Faresin",
  "Giant","Avant","MultiOne","Gehl","Kramer","Atlas","Terex","Hyundai",
  "Samsung","Sany","XCMG","Zoomlion","LiuGong","SDLG","Shantui"
];

function detectBrand(title: string): string | null {
  const titleLower = title.toLowerCase();
  for (const brand of BRANDS) {
    if (titleLower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function parsePrice(text: string): number | null {
  // European format: 1.234,56 € or 1 234,56 €
  const match = text.match(/(\d[\d\s.]*)[,.](\d{2})\s*€/);
  if (match) {
    const intPart = match[1].replace(/[\s.]/g, "");
    return parseFloat(`${intPart}.${match[2]}`);
  }
  // Simple format: 12345 € or 12345€
  const simpleMatch = text.match(/(\d[\d\s.]*)\s*€/);
  if (simpleMatch) {
    return parseFloat(simpleMatch[1].replace(/[\s.]/g, ""));
  }
  return null;
}

function extractImages(markdown: string, html: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  // From HTML: WooCommerce gallery images
  const htmlPatterns = [
    /data-large_image="([^"]+)"/g,
    /data-src="([^"]+)"/g,
    /src="([^"]+(?:wp-content\/uploads)[^"]+)"/g,
    /<img[^>]+src="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/gi,
  ];

  for (const pattern of htmlPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const url = match[1];
      if (!seen.has(url) && !url.includes("placeholder") && !url.includes("icon") && !url.includes("-150x") && !url.includes("-100x")) {
        seen.add(url);
        images.push(url);
      }
    }
  }

  // From markdown
  const mdPattern = /!\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|webp)[^\s)]*)\)/gi;
  let mdMatch;
  while ((mdMatch = mdPattern.exec(markdown)) !== null) {
    if (!seen.has(mdMatch[1])) {
      seen.add(mdMatch[1]);
      images.push(mdMatch[1]);
    }
  }

  return images.slice(0, 20);
}

function extractTitle(markdown: string): string {
  // Try H1
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();
  // First non-empty line
  const lines = markdown.split("\n").filter((l) => l.trim());
  return lines[0]?.replace(/^#+\s*/, "").trim() || "Sans titre";
}

function extractDescription(markdown: string): string {
  // Try to find description section
  const descPatterns = [
    /(?:Produktbeschreibung|Description|Beschreibung)\s*\n([\s\S]*?)(?=\n#{1,3}\s|\n\*\*|$)/i,
    /(?:tab-description|product-description)\s*\n([\s\S]*?)(?=\n#{1,3}\s|$)/i,
  ];

  for (const pattern of descPatterns) {
    const match = markdown.match(pattern);
    if (match && match[1].trim().length > 50) {
      return match[1].trim().slice(0, 2000);
    }
  }

  // Fallback: take content after title, skip images
  const lines = markdown.split("\n");
  const textLines = lines
    .filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("!") && !l.startsWith("|"))
    .slice(0, 20);
  return textLines.join("\n").trim().slice(0, 2000) || "";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

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

    console.log("Scraping product:", formattedUrl);

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown", "html"],
        onlyMainContent: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Firecrawl error:", data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Scrape failed (${response.status})` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const markdown = data.data?.markdown || data.markdown || "";
    const html = data.data?.html || data.html || "";
    const fullText = markdown + " " + html;

    const title = extractTitle(markdown);
    const price = parsePrice(fullText);
    const images = extractImages(markdown, html);
    const brand = detectBrand(title);
    const description = extractDescription(markdown);

    const product = {
      title,
      price,
      images,
      brand,
      description,
      source_url: formattedUrl,
      raw_markdown: markdown.slice(0, 5000),
    };

    console.log("Scraped product:", title, "price:", price, "images:", images.length);

    return new Response(
      JSON.stringify({ success: true, data: product }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("scrape-product error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

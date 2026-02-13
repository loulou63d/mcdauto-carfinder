import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BRANDS = [
  // Auto
  "Alfa Romeo","Audi","BMW","Citroën","Citroen","Dacia","DS","Fiat","Ford","Honda",
  "Hyundai","Infiniti","Jaguar","Jeep","Kia","Land Rover","Lexus","Maserati","Mazda",
  "Mercedes","Mini","Mitsubishi","Nissan","Opel","Peugeot","Porsche","Renault","Seat",
  "Skoda","Škoda","Suzuki","Tesla","Toyota","Volkswagen","Volvo","Abarth","Alpine",
  "Bentley","Bugatti","Cadillac","Chevrolet","Chrysler","Cupra","Dodge","Ferrari",
  "Genesis","Lamborghini","Lancia","Lincoln","Lotus","McLaren","MG","Rolls-Royce",
  "Saab","Smart","SsangYong","Subaru",
  // Agricole / Industriel
  "John Deere","Case IH","New Holland","Massey Ferguson","Fendt","Claas","Kubota",
  "Deutz-Fahr","Valtra","Same","McCormick","Landini","Zetor","JCB",
  "Manitou","Merlo","Komatsu","Caterpillar","Liebherr","Bobcat","Takeuchi",
  "Hitachi","Doosan","Yanmar","Iseki","Kioti","LS Tractor","Solis","Antonio Carraro",
  "Steyr","Hürlimann","Challenger","Versatile","AGCO","Amazone","Kuhn","Kverneland",
  "Lemken","Horsch","Väderstad","Grimme","Pöttinger","Rauch","Krone","Joskin",
  "Fliegl","Berthoud","Hardi","Bogballe","Sulky","Monosem","Breviglieri",
  "Bomford","McHale","Lely","Kongskilde","Maschio","Gaspardo","Alpego",
  "Agrisem","Agram","Bucher","Weidemann","Schäffer","Dieci","Faresin",
  "Giant","Avant","MultiOne","Gehl","Kramer","Atlas","Terex",
  "Samsung","Sany","XCMG","Zoomlion","LiuGong","SDLG","Shantui"
];

function detectBrand(title: string): string | null {
  const titleLower = title.toLowerCase();
  // Sort by length desc to match "Land Rover" before "Rover"
  const sorted = [...BRANDS].sort((a, b) => b.length - a.length);
  for (const brand of sorted) {
    if (titleLower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function parsePrice(text: string): number | null {
  // European format: 18 699 € or 18.699 € or 18 699€
  const patterns = [
    /(\d[\d\s.]*)\s*€/g,
    /prix[^€]*?(\d[\d\s.]*)\s*€/gi,
    /(\d[\d\s.]*),(\d{2})\s*€/g,
  ];

  let bestPrice: number | null = null;

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const raw = match[1].replace(/[\s.]/g, "");
      const decimal = match[2] ? `.${match[2]}` : "";
      const val = parseFloat(raw + decimal);
      // Prefer prices in typical vehicle range (500 - 500000)
      if (val >= 500 && val <= 500000) {
        if (!bestPrice || val > bestPrice) {
          bestPrice = val;
        }
      }
    }
  }

  return bestPrice;
}

function extractImages(markdown: string, html: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  // Autosphere: extract media.autosphere.fr URLs
  const mediaPattern = /https?:\/\/media\.autosphere\.fr\/[^\s)"'\]&]+/g;
  const allText = markdown + " " + html;
  let match;
  while ((match = mediaPattern.exec(allText)) !== null) {
    let url = match[0].replace(/&amp;/g, "&");
    // Clean up URL-encoded versions
    if (url.includes("%2F")) {
      try { url = decodeURIComponent(url); } catch {}
    }
    if (!seen.has(url) && !url.includes("-thumb")) {
      seen.add(url);
      images.push(url);
    }
  }

  // Generic: WooCommerce and standard gallery images
  const htmlPatterns = [
    /data-large_image="([^"]+)"/g,
    /data-src="([^"]+(?:wp-content\/uploads)[^"]+)"/g,
    /<img[^>]+src="([^"]+(?:wp-content\/uploads)[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/gi,
  ];

  for (const pattern of htmlPatterns) {
    while ((match = pattern.exec(html)) !== null) {
      const url = match[1];
      if (!seen.has(url) && !url.includes("placeholder") && !url.includes("icon") && !url.includes("-150x") && !url.includes("-100x")) {
        seen.add(url);
        images.push(url);
      }
    }
  }

  // From markdown images
  const mdPattern = /!\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|webp)[^\s)]*)\)/gi;
  while ((match = mdPattern.exec(markdown)) !== null) {
    const url = match[1];
    if (!seen.has(url) && !url.includes("logo") && !url.includes("icon") && !url.includes("404")) {
      seen.add(url);
      images.push(url);
    }
  }

  return images.slice(0, 20);
}

function extractTitle(markdown: string, url: string): string {
  // Autosphere: extract from breadcrumb (e.g., "3. [Ford]... 4. [Puma]... 5. 1.0 Flexifuel...")
  const breadcrumbMatch = markdown.match(/\d+\.\s*\[([^\]]+)\].*?\d+\.\s*\[([^\]]+)\].*?\d+\.\s*(.+?)(?:\n|$)/);
  if (breadcrumbMatch) {
    const brand = breadcrumbMatch[1].trim();
    const model = breadcrumbMatch[2].trim();
    const variant = breadcrumbMatch[3].trim();
    return `${brand} ${model} ${variant}`;
  }

  // Extract from URL slug (autosphere format)
  const urlSlugMatch = url.match(/auto-occasion-(.+?)(?:-\d{5})/);
  if (urlSlugMatch) {
    return urlSlugMatch[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }

  // Try H1
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) return h1Match[1].trim();

  // Try H2 with brand name
  const h2Match = markdown.match(/^##\s+(.+)$/m);
  if (h2Match) return h2Match[1].trim();

  // First meaningful line
  const lines = markdown.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("!"));
  return lines[0]?.replace(/^#+\s*/, "").trim() || "Sans titre";
}

function extractSpecs(markdown: string): Record<string, string> {
  const specs: Record<string, string> = {};
  // Pattern: "- Key :Value" or "- Key:Value"
  const specPattern = /[-•]\s*([^:]+?)\s*:\s*(.+)/g;
  let match;
  while ((match = specPattern.exec(markdown)) !== null) {
    const key = match[1].trim();
    const val = match[2].trim();
    if (key.length > 2 && key.length < 40 && val.length > 0 && val.length < 100) {
      specs[key] = val;
    }
  }
  return specs;
}

function extractDescription(markdown: string): string {
  // Try "Présentation" or "À propos" section
  const presentPatterns = [
    /(?:Présentation|À propos|About|Beschreibung|Description)\s*\n+(?:###?\s*.+\n+)?([\s\S]*?)(?=\n##\s|\n\*\*\*|$)/i,
    /(?:Produktbeschreibung|tab-description|product-description)\s*\n([\s\S]*?)(?=\n#{1,3}\s|$)/i,
  ];

  for (const pattern of presentPatterns) {
    const match = markdown.match(pattern);
    if (match && match[1].trim().length > 50) {
      return match[1].trim().slice(0, 2000);
    }
  }

  // Try characteristics section
  const charMatch = markdown.match(/Caractéristiques[\s\S]*?(?=\n##\s|$)/i);
  if (charMatch && charMatch[0].length > 50) {
    return charMatch[0].trim().slice(0, 2000);
  }

  // Fallback: text after title, excluding navigation
  const lines = markdown.split("\n");
  const startIdx = lines.findIndex((l) => l.startsWith("##") && !l.includes("Acheter") && !l.includes("Nos services"));
  if (startIdx > -1) {
    const textLines = lines.slice(startIdx)
      .filter((l) => l.trim() && !l.startsWith("![") && !l.startsWith("[!["))
      .slice(0, 30);
    return textLines.join("\n").trim().slice(0, 2000);
  }

  return "";
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
        waitFor: 3000,
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

    const title = extractTitle(markdown, formattedUrl);
    const price = parsePrice(fullText);
    const images = extractImages(markdown, html);
    const brand = detectBrand(title);
    const description = extractDescription(markdown);
    const specs = extractSpecs(markdown);

    const product = {
      title,
      price,
      images,
      brand,
      description,
      specs,
      source_url: formattedUrl,
      raw_markdown: markdown.slice(0, 5000),
    };

    console.log("Scraped:", title, "| price:", price, "| images:", images.length, "| brand:", brand);

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

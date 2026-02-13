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
  const sorted = [...BRANDS].sort((a, b) => b.length - a.length);
  for (const brand of sorted) {
    if (titleLower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function parsePrice(text: string): number | null {
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
      if (val >= 500 && val <= 500000) {
        if (!bestPrice || val > bestPrice) {
          bestPrice = val;
        }
      }
    }
  }

  return bestPrice;
}

function extractImages(markdown: string, html: string, url: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();
  const isCpmAuto = url.includes("cpmauto.fr");
  const allText = markdown + " " + html;

  if (isCpmAuto) {
    // CPM Auto: extract big images from cpmauto.fr/public/img/big/
    const cpmPattern = /https?:\/\/www\.cpmauto\.fr\/public\/img\/big\/[^\s)"'\]&]+/g;
    let match;
    while ((match = cpmPattern.exec(allText)) !== null) {
      let imgUrl = match[0].replace(/&amp;/g, "&");
      if (!seen.has(imgUrl)) {
        seen.add(imgUrl);
        images.push(imgUrl);
      }
    }
    // If no big images, try medium
    if (images.length === 0) {
      const cpmMediumPattern = /https?:\/\/www\.cpmauto\.fr\/public\/img\/medium\/[^\s)"'\]&]+/g;
      while ((match = cpmMediumPattern.exec(allText)) !== null) {
        let imgUrl = match[0].replace(/&amp;/g, "&");
        if (!seen.has(imgUrl)) {
          seen.add(imgUrl);
          images.push(imgUrl);
        }
      }
    }
  } else {
    // Autosphere: extract media.autosphere.fr URLs
    const mediaPattern = /https?:\/\/media\.autosphere\.fr\/[^\s)"'\]&]+/g;
    let match;
    while ((match = mediaPattern.exec(allText)) !== null) {
      let imgUrl = match[0].replace(/&amp;/g, "&");
      if (imgUrl.includes("%2F")) {
        try { imgUrl = decodeURIComponent(imgUrl); } catch {}
      }
      if (!seen.has(imgUrl) && !imgUrl.includes("-thumb")) {
        seen.add(imgUrl);
        images.push(imgUrl);
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
        const imgUrl = match[1];
        if (!seen.has(imgUrl) && !imgUrl.includes("placeholder") && !imgUrl.includes("icon") && !imgUrl.includes("-150x") && !imgUrl.includes("-100x")) {
          seen.add(imgUrl);
          images.push(imgUrl);
        }
      }
    }
  }

  // From markdown images (generic fallback)
  if (images.length === 0) {
    const mdPattern = /!\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|webp)[^\s)]*)\)/gi;
    let match;
    while ((match = mdPattern.exec(markdown)) !== null) {
      const imgUrl = match[1];
      if (!seen.has(imgUrl) && !imgUrl.includes("logo") && !imgUrl.includes("icon") && !imgUrl.includes("404") && !imgUrl.includes("fav.png")) {
        seen.add(imgUrl);
        images.push(imgUrl);
      }
    }
  }

  return images.slice(0, 20);
}

function extractTitleCpmAuto(markdown: string): string {
  // CPM Auto: title is in H1 or H2 starting with "Voiture d'occasion"
  const h1Match = markdown.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const title = h1Match[1].trim();
    // Clean up: remove "Voiture d'occasion " prefix if present
    return title.replace(/^Voiture d'occasion\s+/i, "").trim();
  }
  return "";
}

function extractSpecsCpmAuto(markdown: string): Record<string, string> {
  const specs: Record<string, string> = {};
  
  // CPM Auto uses a markdown table format: | Key | Value |
  const tableRowPattern = /\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/g;
  let match;
  while ((match = tableRowPattern.exec(markdown)) !== null) {
    const key = match[1].trim();
    const val = match[2].trim();
    if (key && val && key !== "---" && val !== "---" && key.length > 1 && key.length < 40) {
      specs[key] = val;
    }
  }

  // Also try "Key : Value" format
  const specPattern = /[-•]\s*([^:]+?)\s*:\s*(.+)/g;
  while ((match = specPattern.exec(markdown)) !== null) {
    const key = match[1].trim();
    const val = match[2].trim();
    if (key.length > 2 && key.length < 40 && val.length > 0 && val.length < 100) {
      specs[key] = val;
    }
  }

  return specs;
}

function extractTitle(markdown: string, url: string): string {
  const isCpmAuto = url.includes("cpmauto.fr");
  
  if (isCpmAuto) {
    const title = extractTitleCpmAuto(markdown);
    if (title) return title;
  }

  // Autosphere: extract from breadcrumb
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

  // Try H2
  const h2Match = markdown.match(/^##\s+(.+)$/m);
  if (h2Match) return h2Match[1].trim();

  const lines = markdown.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("!"));
  return lines[0]?.replace(/^#+\s*/, "").trim() || "Sans titre";
}

function extractSpecs(markdown: string, url: string): Record<string, string> {
  if (url.includes("cpmauto.fr")) {
    return extractSpecsCpmAuto(markdown);
  }

  const specs: Record<string, string> = {};
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

  // CPM Auto: description is after H1 title
  const cpmMatch = markdown.match(/^#\s+.+\n\n([\s\S]*?)(?=\n##\s|Options & équipement|$)/m);
  if (cpmMatch && cpmMatch[1].trim().length > 50) {
    return cpmMatch[1].trim().slice(0, 2000);
  }

  const charMatch = markdown.match(/Caractéristiques[\s\S]*?(?=\n##\s|$)/i);
  if (charMatch && charMatch[0].length > 50) {
    return charMatch[0].trim().slice(0, 2000);
  }

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

function extractVehicleDataFromSpecs(specs: Record<string, string>): {
  year?: number;
  mileage?: number;
  transmission?: string;
  energy?: string;
  color?: string;
  power?: string;
} {
  const result: any = {};

  // Year
  const yearVal = specs["Année"] || specs["Annee"] || specs["Year"];
  if (yearVal) {
    const y = parseInt(yearVal);
    if (y >= 1990 && y <= 2030) result.year = y;
  }

  // Mileage
  const mileageVal = specs["Kilométrage"] || specs["Kilometrage"] || specs["Mileage"];
  if (mileageVal) {
    const m = parseInt(mileageVal.replace(/[\s.km]/gi, ""));
    if (m > 0) result.mileage = m;
  }

  // Transmission
  const transVal = specs["Boite de vitesse"] || specs["Boîte de vitesse"] || specs["Transmission"];
  if (transVal) {
    const lower = transVal.toLowerCase();
    if (lower.includes("auto")) result.transmission = "Automatique";
    else if (lower.includes("manu")) result.transmission = "Manuelle";
    else result.transmission = transVal;
  }

  // Energy / Fuel
  const energyVal = specs["Énergie"] || specs["Energie"] || specs["Carburant"] || specs["Moteur"];
  if (energyVal) {
    const lower = energyVal.toLowerCase();
    if (lower.includes("diesel") || lower.includes("hdi") || lower.includes("dci") || lower.includes("tdi") || lower.includes("blue hdi") || lower.includes("bluehdi")) {
      result.energy = "Diesel";
    } else if (lower.includes("electri") || lower.includes("ev")) {
      result.energy = "Électrique";
    } else if (lower.includes("hybride")) {
      result.energy = lower.includes("rechargeable") ? "Hybride rechargeable" : "Hybride";
    } else if (lower.includes("essence") || lower.includes("tsi") || lower.includes("tce") || lower.includes("puretech") || lower.includes("flexifuel")) {
      result.energy = "Essence";
    } else if (lower.includes("gpl")) {
      result.energy = "GPL";
    }
  }

  // Color
  const colorVal = specs["Couleur"] || specs["Color"];
  if (colorVal) result.color = colorVal;

  // Power
  const powerVal = specs["Puissance"] || specs["Puissance fiscale"];
  if (powerVal) result.power = powerVal;

  return result;
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
    const images = extractImages(markdown, html, formattedUrl);
    const brand = detectBrand(title);
    const description = extractDescription(markdown);
    const specs = extractSpecs(markdown, formattedUrl);
    const vehicleData = extractVehicleDataFromSpecs(specs);

    const product = {
      title,
      price,
      images,
      brand,
      description,
      specs,
      vehicleData,
      source_url: formattedUrl,
      raw_markdown: markdown.slice(0, 5000),
    };

    console.log("Scraped:", title, "| price:", price, "| images:", images.length, "| brand:", brand, "| specs:", JSON.stringify(vehicleData));

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
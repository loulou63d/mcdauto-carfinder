import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Sorted by length descending for correct matching ("Land Rover" before "Rover")
const BRANDS = [
  "Alfa Romeo","Land Rover","Rolls-Royce","Aston Martin","Mercedes-Benz","Mercedes",
  "Lamborghini","Volkswagen","Mitsubishi","SsangYong","Maserati","Chevrolet",
  "Chrysler","Peugeot","Citroën","Citroen","Renault","Porsche","Lincoln",
  "Ferrari","Genesis","Bentley","Bugatti","McLaren","Infiniti","Cadillac",
  "Hyundai","Nissan","Subaru","Suzuki","Toyota","Jaguar","Lexus",
  "Volvo","Skoda","Škoda","Smart","Tesla","Mazda","Honda","Dodge",
  "Dacia","Cupra","Lancia","Lotus","Saab","Seat","Audi","Mini",
  "Opel","Ford","Fiat","Jeep","BMW","MG","Kia","DS","GWM","RAM",
  "Abarth","Alpine",
].sort((a, b) => b.length - a.length);

function detectBrand(title: string): string | null {
  const titleLower = title.toLowerCase();
  for (const brand of BRANDS) {
    if (titleLower.includes(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

function parseArielCarPrice(text: string): number | null {
  // Pattern: XX.XXX€ or XX.XXX € (iva inclusa)
  const patterns = [
    /(\d[\d.]*)\s*€/g,
    /prezzo[^€]*?(\d[\d.]*)\s*€/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const raw = match[1].replace(/\./g, "");
      const val = parseInt(raw);
      if (val >= 1000 && val <= 500000) {
        return val;
      }
    }
  }
  return null;
}

function extractYear(text: string): number | null {
  // Priority 1: "immatricolata nel MM/YYYY"
  const immatMatch = text.match(/immatricol\w+\s+(?:nel|il)?\s*\d{1,2}\/(\d{4})/i);
  if (immatMatch) {
    const y = parseInt(immatMatch[1]);
    if (y >= 1990 && y <= 2030) return y;
  }

  // Priority 2: generic MM/YYYY
  const mmyyyyMatch = text.match(/\b(\d{1,2})\/(\d{4})\b/);
  if (mmyyyyMatch) {
    const y = parseInt(mmyyyyMatch[2]);
    if (y >= 1990 && y <= 2030) return y;
  }

  // Priority 3: "Anno: YYYY" or "anno YYYY"
  const annoMatch = text.match(/anno[:\s]+(\d{4})/i);
  if (annoMatch) {
    const y = parseInt(annoMatch[1]);
    if (y >= 1990 && y <= 2030) return y;
  }

  // Priority 4: any 4-digit year in description
  const yearMatch = text.match(/\b(20[012]\d)\b/);
  if (yearMatch) {
    return parseInt(yearMatch[1]);
  }

  return null;
}

function extractMileage(text: string): number | null {
  // Pattern: XXX.XXX km
  const kmMatch = text.match(/(\d[\d.]*)\s*km/i);
  if (kmMatch) {
    const raw = kmMatch[1].replace(/\./g, "");
    const val = parseInt(raw);
    if (val > 0 && val < 1000000) return val;
  }
  return null;
}

function translateEnergy(text: string): string {
  const lower = text.toLowerCase().trim();
  if (lower.includes("ibrida plug-in") || lower.includes("plug-in hybrid")) return "Hybride rechargeable";
  if (lower.includes("ibrida") || lower.includes("hybrid")) return "Hybride";
  if (lower.includes("benzina") || lower.includes("petrol")) return "Essence";
  if (lower.includes("elettrica") || lower.includes("electric")) return "Électrique";
  if (lower.includes("diesel")) return "Diesel";
  if (lower.includes("gpl") || lower.includes("metano") || lower.includes("gas")) return "GPL";
  return "Diesel";
}

function translateTransmission(text: string): string {
  const lower = text.toLowerCase().trim();
  // Keep the original value if it's already in French
  if (lower === "automatique" || lower === "manuelle") return text.trim();
  // Detect automatic variants
  if (lower.includes("automatic") || lower.includes("automatico") || lower.includes("automatica") || lower.includes("automatik") || lower.includes("dsg") || lower.includes("dct") || lower.includes("cvt") || lower.includes("s tronic") || lower.includes("tiptronic") || lower.includes("steptronic") || lower.includes("powershift") || lower.includes("edc") || lower.includes("eat") || lower.includes("robotizzato") || lower.includes("sequenziale")) return "Automatique";
  if (lower.includes("manual") || lower.includes("manuale") || lower.includes("manuell")) return "Manuelle";
  return "Manuelle";
}

function mapCategory(text: string): string | null {
  const lower = text.toLowerCase().trim();
  if (lower.includes("suv")) return "SUV";
  if (lower.includes("berlina") || lower.includes("sedan")) return "Berline";
  if (lower.includes("station wagon") || lower.includes("sw") || lower === "sw") return "Break";
  if (lower.includes("coupé") || lower.includes("coupe")) return "Coupé";
  if (lower.includes("cabrio") || lower.includes("spider") || lower.includes("roadster")) return "Cabriolet";
  if (lower.includes("monovolume") || lower.includes("mpv")) return "Monospace";
  if (lower.includes("furgone") || lower.includes("commerciale") || lower.includes("van")) return "Utilitaire";
  if (lower.includes("fuoristrada") || lower.includes("4x4") || lower.includes("off-road")) return "4x4";
  return null;
}

function extractArielCarImages(markdown: string, html: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();
  const allText = markdown + " " + html;

  // ArielCar images: imgservice.arielcar.it/rest/v1/gateway/image/...
  const imgPattern = /https?:\/\/imgservice\.arielcar\.it\/rest\/v1\/gateway\/image\/[^\s)"'\]&]+/g;
  let match;
  while ((match = imgPattern.exec(allText)) !== null) {
    let imgUrl = match[0].replace(/&amp;/g, "&");
    if (!seen.has(imgUrl)) {
      seen.add(imgUrl);
      images.push(imgUrl);
    }
  }

  // Fallback: any jpg/jpeg/png/webp from markdown
  if (images.length === 0) {
    const mdPattern = /!\[.*?\]\((https?:\/\/[^\s)]+\.(jpg|jpeg|png|webp)[^\s)]*)\)/gi;
    while ((match = mdPattern.exec(markdown)) !== null) {
      const imgUrl = match[1];
      if (!seen.has(imgUrl) && !imgUrl.includes("logo") && !imgUrl.includes("icon") && !imgUrl.includes("wp-content")) {
        seen.add(imgUrl);
        images.push(imgUrl);
      }
    }
  }

  return images.slice(0, 20);
}

function cleanDescription(text: string): string {
  if (!text) return "";
  // Remove markdown links, bold, references to third parties
  let cleaned = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) -> text
    .replace(/\*\*([^*]+)\*\*/g, "$1") // **bold** -> bold
    .replace(/\*([^*]+)\*/g, "$1") // *italic* -> italic
    .replace(/ariel\s*car/gi, "")
    .replace(/arval/gi, "")
    .replace(/autoselect/gi, "")
    .replace(/usata?/gi, "")
    .trim();
  return cleaned.slice(0, 2000);
}

function cleanModel(title: string, brand: string): string {
  // Remove brand name from model, case insensitive
  let model = title;
  const brandLower = brand.toLowerCase();
  const titleLower = title.toLowerCase();
  const brandIdx = titleLower.indexOf(brandLower);
  if (brandIdx !== -1) {
    model = (title.slice(0, brandIdx) + title.slice(brandIdx + brand.length)).trim();
  }
  // Remove "Usata" suffix
  model = model.replace(/\s*usata?\s*$/i, "").trim();
  // Remove Italian energy/fuel type suffixes (already stored in energy field)
  model = model.replace(/\s+(Diesel|Benzina|Elettrica|Ibrida|GPL|Metano|Ibrida Plug-In)\s*$/i, "").trim();
  return model || title;
}

async function estimatePrice(
  brand: string | null, model: string, year: number, mileage: number,
  energy: string | null, category: string | null
): Promise<number | null> {
  try {
    const baseUrl = Deno.env.get("SUPABASE_URL");
    if (!baseUrl) return null;

    const response = await fetch(`${baseUrl}/functions/v1/estimate-vehicle-price`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({
        brand: brand || "Unknown", model, year, mileage,
        energy: energy || "Diesel", category,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.success && data.estimatedPrice ? Math.round(data.estimatedPrice) : null;
  } catch {
    return null;
  }
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
        waitFor: 5000,
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

    // === TITLE ===
    // H1 format: # **Brand Model Fuel** Usata
    let rawTitle = "";
    const h1BoldMatch = markdown.match(/^#\s+\*\*(.+?)\*\*/m);
    if (h1BoldMatch) {
      rawTitle = h1BoldMatch[1].trim();
    } else {
      const h1Match = markdown.match(/^#\s+(.+)$/m);
      if (h1Match) rawTitle = h1Match[1].trim();
    }
    rawTitle = rawTitle.replace(/\s*usata?\s*$/i, "").trim();

    // H2 subtitle with trim details
    const h2Match = markdown.match(/^##\s+(.+)$/m);
    const subtitle = h2Match ? h2Match[1].trim() : "";

    const title = rawTitle || subtitle || "Sans titre";

    // === BRAND ===
    const brand = detectBrand(title);

    // === MODEL ===
    const model = brand ? cleanModel(title, brand) : title;

    // === PRICE ===
    let price = parseArielCarPrice(fullText);

    // === MILEAGE ===
    const mileage = extractMileage(fullText) || 0;

    // === YEAR ===
    const year = extractYear(fullText) || 2023; // Fallback 2023

    // === IMAGES ===
    const images = extractArielCarImages(markdown, html);

    // === SPECS from "Specifiche tecniche" section ===
    let energy = "Diesel";
    let transmission = "Manuelle";
    let category: string | null = null;
    let color: string | null = null;
    let power: string | null = null;
    let euroNorm: string | null = null;
    let doors: number | null = null;

    // Extract from specs section
    const specsSection = fullText.match(/specifiche\s+tecniche([\s\S]*?)(?=cosa\s+sapere|descrizione|equipaggiamento|optional|$)/i);
    const specsText = specsSection ? specsSection[1] : fullText;

    // Energy: look for fuel type keywords
    const fuelPatterns = [
      /(?:alimentazione|carburante|combustibile)[:\s]*([^\n,]+)/i,
      /\b(diesel|benzina|elettrica|ibrida\s*plug-in|ibrida|gpl|metano)\b/i,
    ];
    for (const pattern of fuelPatterns) {
      const fuelMatch = specsText.match(pattern);
      if (fuelMatch) {
        energy = translateEnergy(fuelMatch[1] || fuelMatch[0]);
        break;
      }
    }

    // Also check title for fuel hint
    if (energy === "Diesel") {
      const titleLower = title.toLowerCase();
      if (titleLower.includes("benzina")) energy = "Essence";
      else if (titleLower.includes("elettrica")) energy = "Électrique";
      else if (titleLower.includes("ibrida plug-in")) energy = "Hybride rechargeable";
      else if (titleLower.includes("ibrida")) energy = "Hybride";
      else if (titleLower.includes("gpl")) energy = "GPL";
    }

    // Transmission - expanded patterns
    const transPatterns = [
      /(?:cambio|trasmissione|getriebe|transmission)[:\s]*([^\n,|]+)/i,
      /(?:marce|gang|speed)[:\s]*([^\n,|]+)/i,
    ];
    for (const pattern of transPatterns) {
      const transMatch = specsText.match(pattern);
      if (transMatch) {
        transmission = translateTransmission(transMatch[1]);
        break;
      }
    }
    // Fallback: check title AND source URL for automatic keywords
    if (transmission === "Manuelle") {
      const autoKeywords = ["automatico", "automatica", "automatic", "dsg", "s-tronic", "s tronic", "tiptronic", "steptronic", "cvt", "e-cvt", "eat", "eat8", "eat6", "edc", "dct", "ddct", "twinamic", "at8", "at6", "at9", "powershift", "autom", "robotizzato", "sequenziale"];
      const titleLower = title.toLowerCase();
      const urlLower = (formattedUrl || "").toLowerCase();
      const combinedText = titleLower + " " + urlLower;
      if (autoKeywords.some(kw => combinedText.includes(kw))) {
        transmission = "Automatique";
      }
    }

    // Fallback: Tesla / electric vehicles are always automatic
    if (transmission === "Manuelle" && (brand === "Tesla" || energy === "Électrique")) {
      transmission = "Automatique";
    }

    // Euro Norm
    const euroMatch = specsText.match(/(?:euro|classe\s+emissioni)[:\s]*(\d)/i);
    if (euroMatch) euroNorm = `Euro ${euroMatch[1]}`;

    // Category: "Tipo:" in specs
    const typeMatch = specsText.match(/tipo[:\s]*([^\n,]+)/i);
    if (typeMatch) {
      category = mapCategory(typeMatch[1]);
    }
    if (!category) {
      // Try detecting from title/description
      const textForCat = (title + " " + subtitle).toLowerCase();
      if (textForCat.includes("suv")) category = "SUV";
      else if (textForCat.includes("station wagon") || textForCat.includes("sw ")) category = "Break";
      else if (textForCat.includes("coupé") || textForCat.includes("coupe")) category = "Coupé";
      else if (textForCat.includes("cabrio")) category = "Cabriolet";
    }
    if (!category) category = "Berline"; // Fallback

    // Color: "Verniciatura:"
    const colorMatch = specsText.match(/(?:verniciatura|colore)[:\s]*([^\n,]+)/i);
    if (colorMatch) color = colorMatch[1].trim();

    // Power: "Potenza:"
    const powerMatch = specsText.match(/(?:potenza)[:\s]*([^\n,]+)/i);
    if (powerMatch) power = powerMatch[1].trim();

    // Doors
    const doorsMatch = specsText.match(/(?:porte|portiere)[:\s]*(\d)/i);
    if (doorsMatch) doors = parseInt(doorsMatch[1]);

    // === DESCRIPTION ===
    let description = "";
    const descMatch = fullText.match(/cosa\s+sapere\s+su\s+quest[ao]?([\s\S]*?)(?=equipaggiamento|optional|specifiche|contatt|$)/i);
    if (descMatch) {
      description = cleanDescription(descMatch[1]);
    }

    // === EQUIPMENT ===
    const equipment: string[] = [];
    const equipMatch = fullText.match(/(?:equipaggiamento|optional|dotazioni)([\s\S]*?)(?=specifiche|contatt|cosa\s+sapere|$)/i);
    if (equipMatch) {
      const lines = equipMatch[1].split("\n").map(l => l.replace(/^[-•*]\s*/, "").trim()).filter(l => l.length > 2 && l.length < 80);
      equipment.push(...lines.slice(0, 30));
    }

    // === PRICE ESTIMATION if not found ===
    if (!price) {
      price = await estimatePrice(brand, model, year, mileage, energy, category);
      if (price) console.log("Price estimated:", price);
    }

    const product = {
      title,
      price,
      images,
      brand,
      description,
      vehicleData: {
        year,
        mileage,
        transmission,
        energy,
        color,
        power,
        doors,
      },
      equipment,
      category,
      euroNorm,
      source_url: formattedUrl,
    };

    console.log("Scraped:", title, "| price:", price, "| images:", images.length, "| brand:", brand, "| category:", category);

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

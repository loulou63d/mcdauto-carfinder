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
  "Genesis","GWM","Lamborghini","Lancia","Lincoln","Lotus","McLaren","MG","RAM","Rolls-Royce",
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
  // EUR patterns
  const eurPatterns = [
    /(\d[\d\s.]*)\s*€/g,
    /prix[^€]*?(\d[\d\s.]*)\s*€/gi,
    /(\d[\d\s.]*),(\d{2})\s*€/g,
  ];

  let bestPrice: number | null = null;

  for (const pattern of eurPatterns) {
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

  // BRL patterns: R$ 201.900,00 — take the FIRST match (most prominent price on page)
  if (!bestPrice) {
    const brlPattern = /R\$\s*([\d.]+),?\d*/g;
    let match;
    while ((match = brlPattern.exec(text)) !== null) {
      const raw = match[1].replace(/\./g, "");
      const val = parseFloat(raw);
      if (val >= 500 && val <= 5000000) {
        bestPrice = val;
        break; // Take first valid BRL price
      }
    }
  }

  return bestPrice;
}

async function estimatePrice(
  brand: string | null,
  model: string,
  year: number,
  mileage: number,
  energy: string | null,
  category: string | null
): Promise<number | null> {
  try {
    const baseUrl = Deno.env.get("SUPABASE_URL");
    if (!baseUrl) {
      console.warn("SUPABASE_URL not configured");
      return null;
    }

    const response = await fetch(
      `${baseUrl}/functions/v1/estimate-vehicle-price`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          brand: brand || "Unknown",
          model,
          year,
          mileage,
          energy: energy || "Diesel",
          category,
        }),
      }
    );

    if (!response.ok) {
      console.warn(
        "Price estimation failed:",
        response.status,
        await response.text()
      );
      return null;
    }

    const data = await response.json();
    return data.success && data.estimatedPrice
      ? Math.round(data.estimatedPrice)
      : null;
  } catch (e) {
    console.warn("Error calling price estimation:", e);
    return null;
  }
}

function extractImages(markdown: string, html: string, url: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();
  const isCpmAuto = url.includes("cpmauto.fr");
  const isAutoFrancis = url.includes("autofrancis.com");
  const isMultimarcas = url.includes("multimarcaspremiumpe.com.br");
  const allText = markdown + " " + html;

  if (isMultimarcas) {
    // Multimarcas: images from lua4auto/public/uploads/seminovos/
    const mmPattern = /https?:\/\/www\.multimarcaspremiumpe\.com\.br\/lua4auto\/public\/uploads\/seminovos\/veiculo_[^\s)"'\]&]+/g;
    let match;
    while ((match = mmPattern.exec(allText)) !== null) {
      let imgUrl = match[0].replace(/&amp;/g, "&");
      // Skip thumbnails (generate_thumb.php URLs) - prefer direct uploads
      if (imgUrl.includes("generate_thumb.php")) continue;
      if (!seen.has(imgUrl)) {
        seen.add(imgUrl);
        images.push(imgUrl);
      }
    }
    // If no direct images, also try thumbnail URLs but extract the original
    if (images.length === 0) {
      const thumbPattern = /generate_thumb\.php\?img=([^\s&"']+)/g;
      while ((match = thumbPattern.exec(allText)) !== null) {
        const imgPath = match[1];
        const imgUrl = `https://www.multimarcaspremiumpe.com.br${imgPath}`;
        if (!seen.has(imgUrl) && imgPath.includes("seminovos/veiculo")) {
          seen.add(imgUrl);
          images.push(imgUrl);
        }
      }
    }
  } else if (isCpmAuto) {
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
  } else if (isAutoFrancis) {
    // AutoFrancis: extract images from base44.app CDN
    const base44Pattern = /https?:\/\/base44\.app\/api\/apps\/[^\s)"'\]&]+\.jpg/gi;
    let match;
    while ((match = base44Pattern.exec(allText)) !== null) {
      let imgUrl = match[0].replace(/&amp;/g, "&");
      if (!seen.has(imgUrl)) {
        seen.add(imgUrl);
        images.push(imgUrl);
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

function extractAutoFrancisData(markdown: string): {
  brand: string;
  model: string;
  title: string;
  year?: number;
  mileage?: number;
  color?: string;
  description: string;
  equipment: string[];
} {
  const lines = markdown.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  // Structure: Brand (text before H1), # Model (H1), Year (text after H1)
  let brand = "";
  let model = "";
  let year: number | undefined;
  
  const h1Idx = lines.findIndex(l => l.startsWith("# ") && !l.startsWith("## "));
  if (h1Idx >= 0) {
    model = lines[h1Idx].replace(/^#\s+/, "").trim();
    // Brand is the line before H1 (skip navigation items)
    for (let i = h1Idx - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.startsWith("[") || line.startsWith("!") || line.startsWith("#") || line.length < 2) continue;
      brand = line;
      break;
    }
    // Year is the line after H1
    if (h1Idx + 1 < lines.length) {
      const nextLine = lines[h1Idx + 1];
      const yearMatch = nextLine.match(/^(19|20)\d{2}$/);
      if (yearMatch) year = parseInt(yearMatch[0]);
    }
  }
  
  const title = brand && model ? `${brand} ${model}` : model || brand || "Sans titre";
  
  // Specs: alternating key/value lines under "## Specifications"
  let mileage: number | undefined;
  let color: string | undefined;
  const specsIdx = lines.findIndex(l => l.toLowerCase().includes("specifications"));
  if (specsIdx >= 0) {
    const aboutIdx = lines.findIndex((l, i) => i > specsIdx && (l.startsWith("###") || l.startsWith("## ")));
    const specsEnd = aboutIdx > 0 ? aboutIdx : lines.length;
    const specLines = lines.slice(specsIdx + 1, specsEnd);
    
    for (let i = 0; i < specLines.length - 1; i++) {
      const key = specLines[i].toLowerCase();
      const val = specLines[i + 1];
      
      if (key === "year" && !year) {
        const y = parseInt(val);
        if (y >= 1990 && y <= 2030) year = y;
        i++;
      } else if (key === "mileage" || key === "kilométrage") {
        const m = parseInt(val.replace(/[,.\s]/g, ""));
        if (m > 0) mileage = m;
        i++;
      } else if (key === "exterior" || key === "couleur") {
        color = val;
        i++;
      } else if (key === "interior") {
        i++; // skip interior value
      }
    }
  }
  
  // Description: under "### About This Vehicle"
  let description = "";
  const aboutIdx = lines.findIndex(l => l.toLowerCase().includes("about this vehicle"));
  if (aboutIdx >= 0) {
    const featIdx = lines.findIndex((l, i) => i > aboutIdx && l.startsWith("###"));
    const descEnd = featIdx > 0 ? featIdx : lines.length;
    description = lines.slice(aboutIdx + 1, descEnd).join(" ").trim().slice(0, 2000);
  }
  
  // Equipment: under "### Features"
  const equipment: string[] = [];
  const featIdx = lines.findIndex(l => l.toLowerCase().includes("features") && l.startsWith("###"));
  if (featIdx >= 0) {
    for (let i = featIdx + 1; i < lines.length; i++) {
      const l = lines[i];
      if (l.startsWith("#") || l.startsWith("[") || l.startsWith("!")) break;
      if (l.length > 1 && l.length < 60) equipment.push(l);
    }
  }
  
  return { brand, model, title, year, mileage, color, description, equipment };
}

function extractMultimarcasData(markdown: string): {
  brand: string;
  model: string;
  title: string;
  year?: number;
  mileage?: number;
  color?: string;
  transmission?: string;
  energy?: string;
  doors?: number;
  description: string;
  equipment: string[];
} {
  const lines = markdown.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  
  // Title from H1: # **BMW 320i**  2.0 16V TURBO GASOLINA GP AUTOMÁTICO
  let brand = "";
  let model = "";
  let title = "";
  const h1Match = markdown.match(/^#\s+\*\*(.+?)\*\*\s*(.*?)$/m);
  if (h1Match) {
    const brandModel = h1Match[1].trim(); // "BMW 320i"
    const variant = h1Match[2].trim(); // "2.0 16V TURBO GASOLINA GP AUTOMÁTICO"
    title = `${brandModel} ${variant}`.trim();
    // Split brand and model
    const parts = brandModel.split(/\s+/);
    brand = parts[0] || "";
    model = parts.slice(1).join(" ") || "";
  }
  
  // If no bold H1, try breadcrumb: Início > Estoque > BMW > 320i
  if (!title) {
    const bcMatch = markdown.match(/\[Estoque\].*?\[(\w+)\].*?\d+\.\s*(\w+)/);
    if (bcMatch) {
      brand = bcMatch[1];
      model = bcMatch[2];
      title = `${brand} ${model}`;
    }
  }
  
  // Specs: **Key** Value pattern
  let year: number | undefined;
  let mileage: number | undefined;
  let transmission: string | undefined;
  let energy: string | undefined;
  let doors: number | undefined;
  let color: string | undefined;
  
  // **Ano** 2020/2021
  const yearMatch = markdown.match(/\*\*Ano\*\*\s*(\d{4})\/(\d{4})/);
  if (yearMatch) year = parseInt(yearMatch[2]); // Use newer year
  
  // **Quilometragem** 66.150
  const kmMatch = markdown.match(/\*\*Quilometragem\*\*\s*([\d.]+)/);
  if (kmMatch) mileage = parseInt(kmMatch[1].replace(/\./g, ""));
  
  // **Câmbio** Automático
  const transMatch = markdown.match(/\*\*Câmbio\*\*\s*(\S+)/);
  if (transMatch) {
    const val = transMatch[1].toLowerCase();
    if (val.includes("automático") || val.includes("automatico") || val.includes("cvt")) transmission = "Automatique";
    else if (val.includes("manual")) transmission = "Manuelle";
    else transmission = transMatch[1];
  }
  
  // **Combustível** Gasolina
  const fuelMatch = markdown.match(/\*\*Combustível\*\*\s*(.+?)(?:\n|$)/);
  if (fuelMatch) {
    const val = fuelMatch[1].toLowerCase().trim();
    if (val.includes("diesel")) energy = "Diesel";
    else if (val.includes("elétrico") || val.includes("eletrico")) energy = "Électrique";
    else if (val.includes("gasolina e elétrico") || val.includes("híbrido") || val.includes("hibrido") || val.includes("phev")) energy = "Hybride rechargeable";
    else if (val.includes("flex")) energy = "Essence"; // Flex is gasoline+ethanol, map to Essence
    else if (val.includes("gasolina")) energy = "Essence";
    else if (val.includes("gnv") || val.includes("gás")) energy = "GPL";
    else energy = "Essence";
  }
  
  // **Portas** 4
  const doorsMatch = markdown.match(/\*\*Portas\*\*\s*(\d+)/);
  if (doorsMatch) doors = parseInt(doorsMatch[1]);
  
  // **Cor** (if present)
  const colorMatch = markdown.match(/\*\*Cor\*\*\s*(.+?)(?:\n|$)/);
  if (colorMatch) color = colorMatch[1].trim();
  
  // Description: "Caracteristicas:" section or "Opcionais:" or "Detalhes:"
  let description = "";
  const equipment: string[] = [];
  
  // Caracteristicas (features)
  const charIdx = lines.findIndex(l => l.toLowerCase().startsWith("caracteristicas"));
  if (charIdx >= 0) {
    for (let i = charIdx + 1; i < lines.length; i++) {
      const l = lines[i];
      if (l.toLowerCase().startsWith("opcionais") || l.toLowerCase().startsWith("detalhes") || l.startsWith("[") || l.startsWith("!") || l.startsWith("#")) break;
      if (l.length > 1 && l.length < 100) equipment.push(l);
    }
  }
  
  // Opcionais (options)
  const optIdx = lines.findIndex(l => l.toLowerCase().startsWith("opcionais"));
  if (optIdx >= 0) {
    for (let i = optIdx + 1; i < lines.length; i++) {
      const l = lines[i];
      if (l.toLowerCase().startsWith("detalhes") || l.startsWith("[") || l.startsWith("!") || l.startsWith("#")) break;
      if (l.length > 1 && l.length < 100 && !equipment.includes(l)) equipment.push(l);
    }
  }
  
  return { brand, model, title: title || "Sans titre", year, mileage, color, transmission, energy, doors, description, equipment };
}

function extractTitle(markdown: string, url: string): string {
  const isCpmAuto = url.includes("cpmauto.fr");
  const isAutoFrancis = url.includes("autofrancis.com");
  const isMultimarcas = url.includes("multimarcaspremiumpe.com.br");
  
  if (isMultimarcas) {
    const mm = extractMultimarcasData(markdown);
    return mm.title;
  }

  if (isCpmAuto) {
    const title = extractTitleCpmAuto(markdown);
    if (title) return title;
  }

  if (isAutoFrancis) {
    const af = extractAutoFrancisData(markdown);
    return af.title;
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

  if (url.includes("autofrancis.com")) {
    // AutoFrancis: alternating key/value lines under "## Specifications"
    const specs: Record<string, string> = {};
    const lines = markdown.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const specsIdx = lines.findIndex(l => l.toLowerCase().includes("specifications"));
    if (specsIdx >= 0) {
      const endIdx = lines.findIndex((l, i) => i > specsIdx && (l.startsWith("###") || l.startsWith("## ")));
      const specsEnd = endIdx > 0 ? endIdx : lines.length;
      const specLines = lines.slice(specsIdx + 1, specsEnd);
      for (let i = 0; i < specLines.length - 1; i += 2) {
        const key = specLines[i];
        const val = specLines[i + 1];
        if (key && val) specs[key] = val;
      }
    }
    return specs;
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

function detectCategory(title: string, description: string): string | null {
  const text = (title + " " + description).toLowerCase();
  const categoryMap: [string, string[]][] = [
    ["SUV", ["suv", "crossover", "captiva", "tucson", "sportage", "rav4", "cr-v", "x-trail", "qashqai", "tiguan", "id.4", "glc", "gle", "gla", "x1", "x3", "x5", "q3", "q5", "q7", "asx", "outlander", "cherokee", "compass", "renegade", "forester"]],
    ["4x4", ["4x4", "4wd", "land rover", "range rover", "discovery", "defender", "wrangler", "g-class", "g63", "g500", "patrol", "land cruiser", "pajero"]],
    ["Berline", ["berline", "sedan", "c-class", "e-class", "s-class", "serie 3", "serie 5", "a4", "a6", "a8", "c180", "c200", "c300", "e200", "e300", "passat", "camry", "accord", "civic sedan"]],
    ["Coupé", ["coupé", "coupe", "cayman", "mustang", "camaro", "corvette", "rc"]],
    ["Cabriolet", ["cabriolet", "convertible", "roadster", "spider", "spyder"]],
    ["Break", ["break", "wagon", "touring", "estate", "avant", "sw", "sportswagon"]],
    ["Pick-up", ["pick-up", "pickup", "hilux", "navara", "ranger", "l200", "amarok"]],
    ["Monospace", ["monospace", "mpv", "van", "sharan", "touran", "scenic", "c4 picasso"]],
    ["Utilitaire", ["utilitaire", "commercial", "fourgon", "partner", "berlingo", "kangoo", "transit", "sprinter"]],
    ["Sportive", ["sport", "amg", "rs ", "gti", " st ", "type r", "nismo", "svr", "m sport"]],
    ["Électrique", ["electric", "électrique", "ev ", "id.", "model 3", "model y", "model s", "model x", "leaf", "zoe", "e-tron"]],
    ["Compacte", ["compacte", "compact", "golf", "focus", "astra", "civic", "corolla", "308", "megane", "leon"]],
  ];

  for (const [cat, keywords] of categoryMap) {
    for (const kw of keywords) {
      if (text.includes(kw)) return cat;
    }
  }
  return null;
}

function detectTransmission(title: string, brand: string | null, model: string): string | null {
  const text = (title + " " + (brand || "") + " " + model).toLowerCase();
  
  // Keywords that strongly indicate automatic transmission
  const autoKeywords = [
    "4matic", "4motion", "xdrive", "quattro", "awd", "4wd",
    "automatique", "automatic", "automático", "automatico", "auto ", "bva", "dsg", "dct", "cvt",
    "tiptronic", "s tronic", "s-tronic", "steptronic", "speedshift", "multitronic",
    "powershift", "edc", "eat", "at ", "a/t",
    // Luxury/sport models almost always automatic
    "amg", "g63", "g500", "escalade", "platinum", "svr", "hse",
    "cayenne", "macan", "panamera", "tesla",
    "range rover", "land rover", "velar",
    "id.4", "id.3", "crozz",
    "grand cherokee", "wrangler",
  ];
  
  // Keywords that indicate manual
  const manualKeywords = ["manuelle", "manual", "bvm"];
  
  for (const kw of manualKeywords) {
    if (text.includes(kw)) return "Manuelle";
  }
  
  for (const kw of autoKeywords) {
    if (text.includes(kw)) return "Automatique";
  }
  
  return null; // unknown - will be determined later
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

  // Year (FR + EN)
  const yearVal = specs["Année"] || specs["Annee"] || specs["Year"];
  if (yearVal) {
    const y = parseInt(yearVal);
    if (y >= 1990 && y <= 2030) result.year = y;
  }

  // Mileage (FR + EN)
  const mileageVal = specs["Kilométrage"] || specs["Kilometrage"] || specs["Mileage"];
  if (mileageVal) {
    const m = parseInt(mileageVal.replace(/[,.\s]/g, "").replace(/km|m$/gi, ""));
    if (m > 0) result.mileage = m;
  }

  // Transmission
  const transVal = specs["Boite de vitesse"] || specs["Boîte de vitesse"] || specs["Transmission"] || specs["Gearbox"];
  if (transVal) {
    const lower = transVal.toLowerCase();
    if (lower.includes("auto") || lower.includes("dsg") || lower.includes("dct") || lower.includes("cvt") || lower.includes("tiptronic") || lower.includes("s tronic") || lower.includes("steptronic") || lower.includes("speedshift")) result.transmission = "Automatique";
    else if (lower.includes("manu")) result.transmission = "Manuelle";
    else result.transmission = transVal;
  }

  // Energy / Fuel
  const energyVal = specs["Énergie"] || specs["Energie"] || specs["Carburant"] || specs["Moteur"] || specs["Fuel"] || specs["Engine"];
  if (energyVal) {
    const lower = energyVal.toLowerCase();
    if (lower.includes("diesel") || lower.includes("hdi") || lower.includes("dci") || lower.includes("tdi") || lower.includes("blue hdi") || lower.includes("bluehdi")) {
      result.energy = "Diesel";
    } else if (lower.includes("electri") || lower.includes("ev")) {
      result.energy = "Électrique";
    } else if (lower.includes("hybride") || lower.includes("hybrid")) {
      result.energy = lower.includes("rechargeable") || lower.includes("plug") ? "Hybride rechargeable" : "Hybride";
    } else if (lower.includes("essence") || lower.includes("gasoline") || lower.includes("petrol") || lower.includes("tsi") || lower.includes("tce") || lower.includes("puretech") || lower.includes("flexifuel")) {
      result.energy = "Essence";
    } else if (lower.includes("gpl") || lower.includes("lpg")) {
      result.energy = "GPL";
    }
  }

  // Color (FR + EN)
  const colorVal = specs["Couleur"] || specs["Color"] || specs["Exterior"];
  if (colorVal) result.color = colorVal;

  // Power
  const powerVal = specs["Puissance"] || specs["Puissance fiscale"] || specs["Power"] || specs["Horsepower"];
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
    const isAutoFrancis = formattedUrl.includes("autofrancis.com");
    const isMultimarcas = formattedUrl.includes("multimarcaspremiumpe.com.br");

    let title: string;
    let price: number | null;
    let images: string[];
    let brand: string | null;
    let description: string;
    let specs: Record<string, string>;
    let vehicleData: any;
    let equipment: string[] = [];
    let category: string | null = null;

    if (isMultimarcas) {
      const mm = extractMultimarcasData(markdown);
      title = mm.title;
      brand = mm.brand || detectBrand(mm.title);
      description = mm.description;
      equipment = mm.equipment;
      images = extractImages(markdown, html, formattedUrl);
      price = parsePrice(fullText);
      specs = {};
      vehicleData = {
        year: mm.year,
        mileage: mm.mileage,
        color: mm.color,
        transmission: mm.transmission,
        energy: mm.energy,
      };
      if (mm.doors) vehicleData.doors = mm.doors;
      category = detectCategory(title, description);
    } else if (isAutoFrancis) {
      // Use dedicated AutoFrancis parser
      const af = extractAutoFrancisData(markdown);
      title = af.title;
      brand = af.brand || detectBrand(af.title);
      description = af.description;
      equipment = af.equipment;
      images = extractImages(markdown, html, formattedUrl);
      price = parsePrice(fullText);
      specs = extractSpecs(markdown, formattedUrl);
      vehicleData = {
        year: af.year,
        mileage: af.mileage,
        color: af.color,
        ...extractVehicleDataFromSpecs(specs),
      };
      if (af.year) vehicleData.year = af.year;
      if (af.mileage) vehicleData.mileage = af.mileage;
      if (af.color) vehicleData.color = af.color;
      category = detectCategory(title, description);
    } else {
      title = extractTitle(markdown, formattedUrl);
      price = parsePrice(fullText);
      images = extractImages(markdown, html, formattedUrl);
      brand = detectBrand(title);
      description = extractDescription(markdown);
      specs = extractSpecs(markdown, formattedUrl);
      vehicleData = extractVehicleDataFromSpecs(specs);
      category = detectCategory(title, description);
    }

    // Smart transmission detection if not found in specs
    if (!vehicleData.transmission) {
      const detectedTrans = detectTransmission(title, brand, title);
      if (detectedTrans) vehicleData.transmission = detectedTrans;
    }

    // Always estimate price for proper EUR 8000-25000 range
    {
      const estBrand = brand || "Unknown";
      const estYear = vehicleData.year || new Date().getFullYear() - 5;
      const estMileage = vehicleData.mileage || 80000;
      const estEnergy = vehicleData.energy || "Essence";
      const estimated = await estimatePrice(estBrand, title.replace(estBrand, "").trim().split(/[\s,]/)[0] || title, estYear, estMileage, estEnergy, category);
      if (estimated) {
        price = estimated;
        console.log("Price estimated (EUR):", estimated);
      }
    }

    // Ensure category is always set - fallback to "Berline" if nothing detected
    if (!category) {
      category = "Berline";
      console.log("Category defaulted to Berline");
    }

    const product = {
      title,
      price,
      images,
      brand,
      description,
      specs,
      vehicleData,
      equipment,
      category,
      source_url: formattedUrl,
      raw_markdown: markdown.slice(0, 5000),
    };

    console.log("Scraped:", title, "| price:", price, "| images:", images.length, "| brand:", brand, "| category:", category, "| transmission:", vehicleData.transmission, "| specs:", JSON.stringify(vehicleData));

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
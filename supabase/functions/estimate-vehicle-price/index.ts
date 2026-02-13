import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Brand tiers: premium brands get higher prices
const PREMIUM_BRANDS = [
  "porsche", "maserati", "jaguar", "lexus", "infiniti", "tesla",
  "land rover", "range rover", "alfa romeo", "volvo",
];
const UPPER_BRANDS = [
  "bmw", "mercedes", "audi", "mini", "ds", "jeep", "cupra",
];
const MID_BRANDS = [
  "volkswagen", "toyota", "honda", "mazda", "hyundai", "kia",
  "skoda", "ford", "nissan", "suzuki", "mitsubishi", "subaru",
];
// Everything else = budget tier

function getBrandMultiplier(brand: string): number {
  const b = brand.toLowerCase().trim();
  if (PREMIUM_BRANDS.some(p => b.includes(p))) return 1.35;
  if (UPPER_BRANDS.some(p => b.includes(p))) return 1.15;
  if (MID_BRANDS.some(p => b.includes(p))) return 1.0;
  return 0.85; // budget brands: dacia, fiat, opel, seat, citroen, peugeot, renault, etc.
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { brand, model, year, mileage, energy, category } = await req.json();

    if (!brand || !model || !year) {
      return new Response(
        JSON.stringify({ success: false, error: "Brand, model, and year are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentYear = new Date().getFullYear();
    const vehicleYear = parseInt(year) || currentYear - 5;
    const vehicleMileage = parseInt(mileage) || 80000;

    // === DETERMINISTIC PRICE FORMULA ===
    // Base range: 8000 - 25000 €
    // 1) Year factor: newer = more expensive (linear from 0.0 to 1.0)
    //    Oldest relevant ~2008, newest ~currentYear
    const minYear = 2008;
    const yearRange = currentYear - minYear;
    const yearFactor = Math.max(0, Math.min(1, (vehicleYear - minYear) / yearRange));

    // 2) Mileage factor: higher km = cheaper (0 km => 1.0, 300000 km => 0.0)
    const mileageFactor = Math.max(0, Math.min(1, 1 - vehicleMileage / 300000));

    // 3) Brand multiplier
    const brandMult = getBrandMultiplier(brand);

    // 4) Energy bonus
    let energyBonus = 0;
    const en = (energy || "").toLowerCase();
    if (en.includes("hybride") || en.includes("hybrid")) energyBonus = 1500;
    else if (en.includes("lectrique") || en.includes("electric")) energyBonus = 2000;

    // Combine: base price from year (60% weight) and mileage (40% weight)
    const MIN_PRICE = 8000;
    const MAX_PRICE = 25000;
    const range = MAX_PRICE - MIN_PRICE;

    const rawScore = yearFactor * 0.6 + mileageFactor * 0.4; // 0..1
    let estimatedPrice = MIN_PRICE + rawScore * range; // 8000..25000

    // Apply brand multiplier (centered around 1.0)
    estimatedPrice *= brandMult;

    // Add energy bonus
    estimatedPrice += energyBonus;

    // Clamp to 8000-25000
    estimatedPrice = Math.max(MIN_PRICE, Math.min(MAX_PRICE, estimatedPrice));

    // Round to nearest 100
    estimatedPrice = Math.round(estimatedPrice / 100) * 100;

    console.log(`Price estimate: ${brand} ${model} ${vehicleYear}, ${vehicleMileage}km, brand×${brandMult} => ${estimatedPrice}€`);

    return new Response(
      JSON.stringify({
        success: true,
        estimatedPrice,
        rawResponse: `${estimatedPrice}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error estimating price:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

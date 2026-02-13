import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface VehicleDetail {
  brand: string;
  model: string;
  year: number;
  price: number;
}

function generateInvoiceHTML(order: {
  id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  vehicle_details: VehicleDetail[];
  total_price: number;
  deposit_amount: number;
}): string {
  const date = new Date(order.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const invoiceNumber = `MCD-${order.id.substring(0, 8).toUpperCase()}`;

  const vehicleRows = order.vehicle_details
    .map(
      (v) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${v.brand} ${v.model} (${v.year})</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${Number(v.price).toLocaleString("de-DE")} €</td>
      </tr>`
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8" /></head>
  <body style="font-family:Arial,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px;">
    <div style="text-align:center;margin-bottom:30px;">
      <h1 style="color:#c8102e;margin:0;font-size:28px;">MCD AUTO</h1>
      <p style="color:#666;margin:4px 0;">Salon-de-Provence</p>
    </div>
    
    <div style="background:#f8f8f8;border-radius:8px;padding:20px;margin-bottom:20px;">
      <h2 style="margin:0 0 10px;font-size:20px;">FACTURE</h2>
      <p style="margin:2px 0;color:#666;font-size:14px;">N° ${invoiceNumber}</p>
      <p style="margin:2px 0;color:#666;font-size:14px;">Date : ${date}</p>
    </div>

    <div style="margin-bottom:20px;">
      <h3 style="font-size:14px;color:#666;margin:0 0 8px;">CLIENT</h3>
      <p style="margin:2px 0;font-weight:bold;">${order.customer_name}</p>
      <p style="margin:2px 0;">${order.customer_email}</p>
      ${order.customer_phone ? `<p style="margin:2px 0;">${order.customer_phone}</p>` : ""}
    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <thead>
        <tr style="background:#c8102e;color:white;">
          <th style="padding:10px 12px;text-align:left;">Véhicule</th>
          <th style="padding:10px 12px;text-align:right;">Prix</th>
        </tr>
      </thead>
      <tbody>
        ${vehicleRows}
      </tbody>
    </table>

    <div style="background:#f8f8f8;border-radius:8px;padding:16px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span>Total TTC</span>
        <strong>${Number(order.total_price).toLocaleString("de-DE")} €</strong>
      </div>
      <div style="display:flex;justify-content:space-between;color:#c8102e;font-weight:bold;">
        <span>Acompte versé (20%)</span>
        <span>${Number(order.deposit_amount).toLocaleString("de-DE")} €</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid #ddd;">
        <span>Solde restant</span>
        <strong>${(Number(order.total_price) - Number(order.deposit_amount)).toLocaleString("de-DE")} €</strong>
      </div>
    </div>

    <div style="margin-top:30px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">
      <p>MCD AUTO — Salon-de-Provence</p>
      <p>Merci pour votre confiance.</p>
    </div>
  </body>
  </html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, action } = await req.json();

    if (!orderId) {
      throw new Error("orderId is required");
    }

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found");
    }

    const invoiceHTML = generateInvoiceHTML(order as any);

    if (action === "send_email") {
      // Send email via Resend
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MCD AUTO <onboarding@resend.dev>",
          to: [order.customer_email],
          subject: `Facture MCD AUTO — Commande #${order.id.substring(0, 8).toUpperCase()}`,
          html: invoiceHTML,
        }),
      });

      const emailData = await emailRes.json();

      if (!emailRes.ok) {
        console.error("Resend error:", emailData);
        throw new Error(`Email sending failed: ${JSON.stringify(emailData)}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: "Invoice sent", emailId: emailData.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_html") {
      // Return HTML for download/display
      return new Response(
        JSON.stringify({ success: true, html: invoiceHTML }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid action. Use 'send_email' or 'get_html'");
  } catch (error) {
    console.error("Invoice error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

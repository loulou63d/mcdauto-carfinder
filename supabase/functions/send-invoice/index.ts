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

  const LOGO_URL = "https://ctcekfsvvmwcirogpipk.supabase.co/storage/v1/object/public/vehicle-images/brand%2Flogo-mcd.png";

  const vehicleRows = order.vehicle_details
    .map(
      (v) => `
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #eef1f5;font-size:14px;color:#333;">${v.brand} ${v.model} <span style="color:#888;">(${v.year})</span></td>
        <td style="padding:10px 14px;border-bottom:1px solid #eef1f5;text-align:right;font-weight:600;color:#0A1F3F;font-size:14px;">${Number(v.price).toLocaleString("de-DE")} €</td>
      </tr>`
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
  <body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr><td style="background:linear-gradient(135deg,#0A1F3F 0%,#132d54 100%);padding:28px 32px;text-align:center;border-radius:12px 12px 0 0;">
            <img src="${LOGO_URL}" alt="MCD AUTO" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto;" />
          </td></tr>
          <tr><td style="background:#E63946;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
          
          <!-- Invoice header -->
          <tr><td style="background:white;padding:28px 32px 0;">
            <h2 style="margin:0;font-size:22px;font-weight:700;color:#0A1F3F;">FACTURE</h2>
            <div style="width:48px;height:3px;background:#E63946;margin-top:12px;border-radius:2px;"></div>
          </td></tr>

          <!-- Invoice meta -->
          <tr><td style="background:white;padding:16px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;width:50%;">
                  <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">N° Facture</p>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#0A1F3F;">${invoiceNumber}</p>
                  <p style="margin:8px 0 0;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Date</p>
                  <p style="margin:0;font-size:14px;color:#333;">${date}</p>
                </td>
                <td style="vertical-align:top;width:50%;text-align:right;">
                  <p style="margin:0 0 4px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Client</p>
                  <p style="margin:0;font-size:15px;font-weight:700;color:#0A1F3F;">${order.customer_name}</p>
                  <p style="margin:4px 0 0;font-size:13px;color:#555;">${order.customer_email}</p>
                  ${order.customer_phone ? `<p style="margin:2px 0 0;font-size:13px;color:#555;">${order.customer_phone}</p>` : ""}
                </td>
              </tr>
            </table>
          </td></tr>

          <!-- Vehicle table -->
          <tr><td style="background:white;padding:8px 32px;">
            <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;">
              <thead><tr style="background:linear-gradient(135deg,#0A1F3F,#132d54);">
                <th style="padding:12px 14px;text-align:left;color:white;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Véhicule</th>
                <th style="padding:12px 14px;text-align:right;color:white;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Prix</th>
              </tr></thead>
              <tbody>${vehicleRows}</tbody>
            </table>
          </td></tr>

          <!-- Totals -->
          <tr><td style="background:white;padding:16px 32px 28px;">
            <div style="background:#f7f9fb;border-radius:10px;padding:18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#555;">Total TTC</td>
                  <td style="padding:6px 0;font-size:14px;color:#0A1F3F;font-weight:700;text-align:right;">${Number(order.total_price).toLocaleString("de-DE")} €</td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#E63946;font-weight:700;">Acompte versé (20%)</td>
                  <td style="padding:6px 0;font-size:14px;color:#E63946;font-weight:700;text-align:right;">${Number(order.deposit_amount).toLocaleString("de-DE")} €</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:0;"><div style="border-top:1px solid #dde2e8;margin:8px 0;"></div></td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:16px;color:#0A1F3F;font-weight:700;">Solde restant</td>
                  <td style="padding:6px 0;font-size:16px;color:#0A1F3F;font-weight:700;text-align:right;">${(Number(order.total_price) - Number(order.deposit_amount)).toLocaleString("de-DE")} €</td>
                </tr>
              </table>
            </div>
          </td></tr>
          
          <!-- Footer -->
          <tr><td style="background:#0A1F3F;padding:24px 32px;border-radius:0 0 12px 12px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="text-align:center;">
                <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.9);font-weight:600;">MCD AUTO — Dortmund</p>
                <p style="margin:0 0 12px;font-size:12px;color:rgba(255,255,255,0.6);">Südwall 23, 44137 Dortmund</p>
                <div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:12px;">
                  <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">Merci pour votre confiance.</p>
                </div>
              </td></tr>
            </table>
          </td></tr>
          
        </table>
      </td></tr>
    </table>
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
          from: "MCD AUTO <facturation@mcd-auto.com>",
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type NotificationType = "welcome" | "order_confirmation" | "contact_confirmation";
type Lang = "de" | "fr" | "en" | "es" | "pt";

interface NotificationPayload {
  type: NotificationType;
  lang: Lang;
  to: string;
  data?: Record<string, unknown>;
}

const translations: Record<Lang, Record<string, string>> = {
  de: {
    welcome_subject: "Willkommen bei MCD AUTO — Ihr Konto ist bestätigt!",
    welcome_title: "Willkommen bei MCD AUTO!",
    welcome_body: "Ihr Konto wurde erfolgreich erstellt und bestätigt. Sie können sich jetzt anmelden und auf Ihren persönlichen Kundenbereich zugreifen.",
    welcome_features_title: "In Ihrem Kundenbereich können Sie:",
    welcome_f1: "Ihre Bestellungen und deren Status verfolgen",
    welcome_f2: "Ihre Rechnungen herunterladen",
    welcome_f3: "Die Lieferung Ihres Fahrzeugs verfolgen",
    welcome_cta: "Jetzt anmelden",

    order_subject: "MCD AUTO — Ihre Bestellung wurde registriert",
    order_title: "Bestellung eingegangen!",
    order_body: "Ihre Bestellung wurde erfolgreich registriert. Hier ist eine Zusammenfassung der nächsten Schritte:",
    order_step1_title: "1. Überprüfung der Anzahlung",
    order_step1_body: "Unser Team überprüft Ihren Überweisungsbeleg. Sie werden per E-Mail benachrichtigt, sobald er validiert wurde.",
    order_step2_title: "2. Vorbereitung des Fahrzeugs",
    order_step2_body: "Das Fahrzeug wird vorbereitet: technische Inspektion, Reinigung und alle notwendigen Dokumente.",
    order_step3_title: "3. Lieferung",
    order_step3_body: "Sie werden kontaktiert, um einen Liefertermin zu vereinbaren oder die Abholung bei uns zu arrangieren.",
    order_deposit: "Anzahlung (20%)",
    order_total: "Gesamtpreis",
    order_tracking: "Sie können den Status Ihrer Bestellung jederzeit in Ihrem Kundenbereich verfolgen.",
    order_cta: "Meine Bestellungen ansehen",

    contact_subject: "MCD AUTO — Ihre Nachricht wurde empfangen",
    contact_title: "Nachricht empfangen!",
    contact_body: "Vielen Dank für Ihre Kontaktaufnahme. Wir haben Ihre Nachricht erhalten und werden Ihnen innerhalb von 24 bis 48 Stunden antworten.",
    contact_summary: "Zusammenfassung Ihrer Nachricht:",

    footer: "MCD AUTO — Dortmund",
    footer_thanks: "Vielen Dank für Ihr Vertrauen.",
  },
  fr: {
    welcome_subject: "Bienvenue chez MCD AUTO — Votre compte est validé !",
    welcome_title: "Bienvenue chez MCD AUTO !",
    welcome_body: "Votre compte a été créé et validé avec succès. Vous pouvez désormais vous connecter et accéder à votre espace client personnel.",
    welcome_features_title: "Depuis votre espace client, vous pouvez :",
    welcome_f1: "Suivre vos commandes et leur statut en temps réel",
    welcome_f2: "Télécharger vos factures",
    welcome_f3: "Suivre la livraison de votre véhicule",
    welcome_cta: "Se connecter",

    order_subject: "MCD AUTO — Votre commande a été enregistrée",
    order_title: "Commande enregistrée !",
    order_body: "Votre commande a bien été enregistrée. Voici un résumé des prochaines étapes :",
    order_step1_title: "1. Vérification de l'acompte",
    order_step1_body: "Notre équipe va vérifier votre justificatif de virement. Vous serez notifié par email dès sa validation.",
    order_step2_title: "2. Préparation du véhicule",
    order_step2_body: "Le véhicule sera préparé : contrôle technique, nettoyage complet et tous les documents administratifs nécessaires.",
    order_step3_title: "3. Livraison",
    order_step3_body: "Vous serez contacté pour convenir d'une date de livraison ou organiser le retrait sur place.",
    order_deposit: "Acompte versé (20%)",
    order_total: "Prix total",
    order_tracking: "Vous pouvez suivre le statut de votre commande à tout moment depuis votre espace client.",
    order_cta: "Voir mes commandes",

    contact_subject: "MCD AUTO — Votre message a bien été reçu",
    contact_title: "Message reçu !",
    contact_body: "Merci de nous avoir contactés. Nous avons bien reçu votre message et nous vous répondrons dans un délai de 24 à 48 heures.",
    contact_summary: "Résumé de votre message :",

    footer: "MCD AUTO — Dortmund",
    footer_thanks: "Merci pour votre confiance.",
  },
  en: {
    welcome_subject: "Welcome to MCD AUTO — Your account is confirmed!",
    welcome_title: "Welcome to MCD AUTO!",
    welcome_body: "Your account has been successfully created and confirmed. You can now log in and access your personal customer area.",
    welcome_features_title: "In your customer area, you can:",
    welcome_f1: "Track your orders and their status",
    welcome_f2: "Download your invoices",
    welcome_f3: "Follow the delivery of your vehicle",
    welcome_cta: "Log in now",

    order_subject: "MCD AUTO — Your order has been registered",
    order_title: "Order registered!",
    order_body: "Your order has been successfully registered. Here is a summary of the next steps:",
    order_step1_title: "1. Deposit verification",
    order_step1_body: "Our team will verify your bank transfer receipt. You will be notified by email once it has been validated.",
    order_step2_title: "2. Vehicle preparation",
    order_step2_body: "The vehicle will be prepared: technical inspection, full cleaning, and all necessary administrative documents.",
    order_step3_title: "3. Delivery",
    order_step3_body: "You will be contacted to arrange a delivery date or organize pickup at our location.",
    order_deposit: "Deposit paid (20%)",
    order_total: "Total price",
    order_tracking: "You can track the status of your order at any time from your customer area.",
    order_cta: "View my orders",

    contact_subject: "MCD AUTO — Your message has been received",
    contact_title: "Message received!",
    contact_body: "Thank you for contacting us. We have received your message and will respond within 24 to 48 hours.",
    contact_summary: "Summary of your message:",

    footer: "MCD AUTO — Dortmund",
    footer_thanks: "Thank you for your trust.",
  },
  es: {
    welcome_subject: "Bienvenido a MCD AUTO — ¡Su cuenta está confirmada!",
    welcome_title: "¡Bienvenido a MCD AUTO!",
    welcome_body: "Su cuenta ha sido creada y confirmada con éxito. Ya puede iniciar sesión y acceder a su área de cliente personal.",
    welcome_features_title: "Desde su área de cliente, puede:",
    welcome_f1: "Seguir sus pedidos y su estado",
    welcome_f2: "Descargar sus facturas",
    welcome_f3: "Seguir la entrega de su vehículo",
    welcome_cta: "Iniciar sesión",

    order_subject: "MCD AUTO — Su pedido ha sido registrado",
    order_title: "¡Pedido registrado!",
    order_body: "Su pedido ha sido registrado correctamente. Aquí tiene un resumen de los próximos pasos:",
    order_step1_title: "1. Verificación del depósito",
    order_step1_body: "Nuestro equipo verificará su comprobante de transferencia bancaria. Se le notificará por correo electrónico una vez validado.",
    order_step2_title: "2. Preparación del vehículo",
    order_step2_body: "El vehículo será preparado: inspección técnica, limpieza completa y todos los documentos administrativos necesarios.",
    order_step3_title: "3. Entrega",
    order_step3_body: "Se le contactará para acordar una fecha de entrega u organizar la recogida en nuestras instalaciones.",
    order_deposit: "Depósito abonado (20%)",
    order_total: "Precio total",
    order_tracking: "Puede seguir el estado de su pedido en cualquier momento desde su área de cliente.",
    order_cta: "Ver mis pedidos",

    contact_subject: "MCD AUTO — Su mensaje ha sido recibido",
    contact_title: "¡Mensaje recibido!",
    contact_body: "Gracias por contactarnos. Hemos recibido su mensaje y le responderemos en un plazo de 24 a 48 horas.",
    contact_summary: "Resumen de su mensaje:",

    footer: "MCD AUTO — Dortmund",
    footer_thanks: "Gracias por su confianza.",
  },
  pt: {
    welcome_subject: "Bem-vindo à MCD AUTO — A sua conta está confirmada!",
    welcome_title: "Bem-vindo à MCD AUTO!",
    welcome_body: "A sua conta foi criada e confirmada com sucesso. Agora pode iniciar sessão e aceder à sua área de cliente pessoal.",
    welcome_features_title: "Na sua área de cliente, pode:",
    welcome_f1: "Acompanhar os seus pedidos e o seu estado",
    welcome_f2: "Descarregar as suas faturas",
    welcome_f3: "Seguir a entrega do seu veículo",
    welcome_cta: "Iniciar sessão",

    order_subject: "MCD AUTO — O seu pedido foi registado",
    order_title: "Pedido registado!",
    order_body: "O seu pedido foi registado com sucesso. Aqui está um resumo dos próximos passos:",
    order_step1_title: "1. Verificação do depósito",
    order_step1_body: "A nossa equipa irá verificar o seu comprovativo de transferência bancária. Será notificado por email assim que for validado.",
    order_step2_title: "2. Preparação do veículo",
    order_step2_body: "O veículo será preparado: inspeção técnica, limpeza completa e todos os documentos administrativos necessários.",
    order_step3_title: "3. Entrega",
    order_step3_body: "Será contactado para combinar uma data de entrega ou organizar a recolha nas nossas instalações.",
    order_deposit: "Depósito pago (20%)",
    order_total: "Preço total",
    order_tracking: "Pode acompanhar o estado do seu pedido a qualquer momento na sua área de cliente.",
    order_cta: "Ver os meus pedidos",

    contact_subject: "MCD AUTO — A sua mensagem foi recebida",
    contact_title: "Mensagem recebida!",
    contact_body: "Obrigado por nos contactar. Recebemos a sua mensagem e responderemos dentro de 24 a 48 horas.",
    contact_summary: "Resumo da sua mensagem:",

    footer: "MCD AUTO — Dortmund",
    footer_thanks: "Obrigado pela sua confiança.",
  },
};

function t(lang: Lang, key: string): string {
  return translations[lang]?.[key] || translations["de"][key] || key;
}

function baseTemplate(lang: Lang, title: string, content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:20px;background:#f5f5f5;">
  <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#c8102e;padding:24px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:24px;">MCD AUTO</h1>
    </div>
    <div style="padding:24px;">
      <h2 style="color:#c8102e;margin:0 0 16px;font-size:20px;">${title}</h2>
      ${content}
    </div>
    <div style="background:#f8f8f8;padding:16px;text-align:center;font-size:12px;color:#999;">
      <p style="margin:4px 0;">${t(lang, "footer")}</p>
      <p style="margin:4px 0;">${t(lang, "footer_thanks")}</p>
    </div>
  </div>
</body></html>`;
}

function welcomeEmail(lang: Lang, data: Record<string, unknown>): { subject: string; html: string } {
  const name = (data.name as string) || "";
  const siteUrl = (data.siteUrl as string) || "https://mcdauto-carfinder.lovable.app";
  const content = `
    <p style="color:#333;line-height:1.6;">${name ? `${name}, ` : ""}${t(lang, "welcome_body")}</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="font-weight:bold;margin:0 0 8px;">${t(lang, "welcome_features_title")}</p>
      <ul style="margin:0;padding-left:20px;color:#555;line-height:2;">
        <li>${t(lang, "welcome_f1")}</li>
        <li>${t(lang, "welcome_f2")}</li>
        <li>${t(lang, "welcome_f3")}</li>
      </ul>
    </div>
    <div style="text-align:center;margin:24px 0;">
      <a href="${siteUrl}/${lang}/customer-auth" style="display:inline-block;background:#c8102e;color:white;text-decoration:none;padding:12px 32px;border-radius:6px;font-weight:bold;">${t(lang, "welcome_cta")}</a>
    </div>`;
  return { subject: t(lang, "welcome_subject"), html: baseTemplate(lang, t(lang, "welcome_title"), content) };
}

function orderEmail(lang: Lang, data: Record<string, unknown>): { subject: string; html: string } {
  const vehicles = (data.vehicles as Array<{ brand: string; model: string; year: number; price: number }>) || [];
  const totalPrice = data.totalPrice as number || 0;
  const depositAmount = data.depositAmount as number || 0;
  const siteUrl = (data.siteUrl as string) || "https://mcdauto-carfinder.lovable.app";

  const vehicleRows = vehicles.map(v => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;">${v.brand} ${v.model} (${v.year})</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${Number(v.price).toLocaleString("de-DE")} €</td>
    </tr>`).join("");

  const content = `
    <p style="color:#333;line-height:1.6;">${t(lang, "order_body")}</p>
    
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead><tr style="background:#c8102e;color:white;">
        <th style="padding:10px 12px;text-align:left;">Véhicule</th>
        <th style="padding:10px 12px;text-align:right;">Prix</th>
      </tr></thead>
      <tbody>${vehicleRows}</tbody>
    </table>

    <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0;">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span>${t(lang, "order_total")}</span>
        <strong>${Number(totalPrice).toLocaleString("de-DE")} €</strong>
      </div>
      <div style="display:flex;justify-content:space-between;color:#c8102e;font-weight:bold;">
        <span>${t(lang, "order_deposit")}</span>
        <span>${Number(depositAmount).toLocaleString("de-DE")} €</span>
      </div>
    </div>

    <div style="margin:20px 0;">
      <h3 style="color:#c8102e;font-size:15px;">${t(lang, "order_step1_title")}</h3>
      <p style="color:#555;font-size:14px;margin:4px 0 12px;">${t(lang, "order_step1_body")}</p>
      <h3 style="color:#c8102e;font-size:15px;">${t(lang, "order_step2_title")}</h3>
      <p style="color:#555;font-size:14px;margin:4px 0 12px;">${t(lang, "order_step2_body")}</p>
      <h3 style="color:#c8102e;font-size:15px;">${t(lang, "order_step3_title")}</h3>
      <p style="color:#555;font-size:14px;margin:4px 0 12px;">${t(lang, "order_step3_body")}</p>
    </div>

    <p style="color:#555;font-size:14px;font-style:italic;">${t(lang, "order_tracking")}</p>

    <div style="text-align:center;margin:24px 0;">
      <a href="${siteUrl}/${lang}/account" style="display:inline-block;background:#c8102e;color:white;text-decoration:none;padding:12px 32px;border-radius:6px;font-weight:bold;">${t(lang, "order_cta")}</a>
    </div>`;
  return { subject: t(lang, "order_subject"), html: baseTemplate(lang, t(lang, "order_title"), content) };
}

function contactEmail(lang: Lang, data: Record<string, unknown>): { subject: string; html: string } {
  const name = (data.name as string) || "";
  const message = (data.message as string) || "";
  const subject = (data.subject as string) || "";
  const content = `
    <p style="color:#333;line-height:1.6;">${name ? `${name}, ` : ""}${t(lang, "contact_body")}</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="font-weight:bold;margin:0 0 8px;">${t(lang, "contact_summary")}</p>
      ${subject ? `<p style="color:#555;margin:4px 0;"><strong>Sujet :</strong> ${subject}</p>` : ""}
      <p style="color:#555;margin:4px 0;white-space:pre-wrap;">${message}</p>
    </div>`;
  return { subject: t(lang, "contact_subject"), html: baseTemplate(lang, t(lang, "contact_title"), content) };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const payload: NotificationPayload = await req.json();
    const { type, lang = "de", to, data = {} } = payload;

    if (!to) throw new Error("'to' email is required");

    let emailContent: { subject: string; html: string };

    switch (type) {
      case "welcome":
        emailContent = welcomeEmail(lang, data);
        break;
      case "order_confirmation":
        emailContent = orderEmail(lang, data);
        break;
      case "contact_confirmation":
        emailContent = contactEmail(lang, data);
        break;
      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MCD AUTO <facturation@mcd-auto.com>",
        to: [to],
        subject: emailContent.subject,
        html: emailContent.html,
      }),
    });

    const emailData = await emailRes.json();
    if (!emailRes.ok) {
      console.error("Resend error:", emailData);
      throw new Error(`Email failed: ${JSON.stringify(emailData)}`);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Notification error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

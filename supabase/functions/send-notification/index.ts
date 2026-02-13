import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type NotificationType = "welcome" | "order_confirmation" | "order_completed" | "contact_confirmation";
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

    completed_subject: "MCD AUTO — Ihre Bestellung wurde bestätigt!",
    completed_title: "Bestellung bestätigt!",
    completed_body: "Großartige Neuigkeiten! Ihre Bestellung wurde von unserem Team validiert und abgeschlossen.",
    completed_body2: "Ihre Anzahlung wurde überprüft und Ihr Fahrzeug wird nun für die Übergabe vorbereitet.",
    completed_next_title: "Nächste Schritte:",
    completed_next1: "Unser Team bereitet Ihr Fahrzeug vor (Inspektion, Reinigung, Dokumente)",
    completed_next2: "Sie werden kontaktiert, um die Lieferung oder Abholung zu vereinbaren",
    completed_next3: "Ihre Rechnung ist in Ihrem Kundenbereich verfügbar",
    completed_cta: "Mein Kundenkonto",

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

    completed_subject: "MCD AUTO — Votre commande a été validée !",
    completed_title: "Commande validée !",
    completed_body: "Excellente nouvelle ! Votre commande a été validée et finalisée par notre équipe.",
    completed_body2: "Votre acompte a été vérifié et votre véhicule est maintenant en préparation pour la remise.",
    completed_next_title: "Prochaines étapes :",
    completed_next1: "Notre équipe prépare votre véhicule (inspection, nettoyage, documents)",
    completed_next2: "Vous serez contacté pour organiser la livraison ou le retrait",
    completed_next3: "Votre facture est disponible dans votre espace client",
    completed_cta: "Mon espace client",

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

    completed_subject: "MCD AUTO — Your order has been confirmed!",
    completed_title: "Order confirmed!",
    completed_body: "Great news! Your order has been validated and completed by our team.",
    completed_body2: "Your deposit has been verified and your vehicle is now being prepared for handover.",
    completed_next_title: "Next steps:",
    completed_next1: "Our team is preparing your vehicle (inspection, cleaning, documents)",
    completed_next2: "You will be contacted to arrange delivery or pickup",
    completed_next3: "Your invoice is available in your customer area",
    completed_cta: "My account",

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

    completed_subject: "MCD AUTO — ¡Su pedido ha sido confirmado!",
    completed_title: "¡Pedido confirmado!",
    completed_body: "¡Excelentes noticias! Su pedido ha sido validado y finalizado por nuestro equipo.",
    completed_body2: "Su depósito ha sido verificado y su vehículo está siendo preparado para la entrega.",
    completed_next_title: "Próximos pasos:",
    completed_next1: "Nuestro equipo prepara su vehículo (inspección, limpieza, documentos)",
    completed_next2: "Se le contactará para organizar la entrega o recogida",
    completed_next3: "Su factura está disponible en su área de cliente",
    completed_cta: "Mi cuenta",

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

    completed_subject: "MCD AUTO — O seu pedido foi confirmado!",
    completed_title: "Pedido confirmado!",
    completed_body: "Ótimas notícias! O seu pedido foi validado e concluído pela nossa equipa.",
    completed_body2: "O seu depósito foi verificado e o seu veículo está agora a ser preparado para a entrega.",
    completed_next_title: "Próximos passos:",
    completed_next1: "A nossa equipa está a preparar o seu veículo (inspeção, limpeza, documentos)",
    completed_next2: "Será contactado para organizar a entrega ou recolha",
    completed_next3: "A sua fatura está disponível na sua área de cliente",
    completed_cta: "A minha conta",

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

const LOGO_URL = "https://ctcekfsvvmwcirogpipk.supabase.co/storage/v1/object/public/vehicle-images/brand%2Flogo-mcd.png";

function baseTemplate(lang: Lang, title: string, content: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background-color:#f0f2f5;font-family:'Segoe UI',Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f2f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        
        <!-- Header with logo -->
        <tr><td style="background:linear-gradient(135deg,#0A1F3F 0%,#132d54 100%);padding:28px 32px;text-align:center;border-radius:12px 12px 0 0;">
          <img src="${LOGO_URL}" alt="MCD AUTO" width="160" style="display:block;margin:0 auto;max-width:160px;height:auto;" />
        </td></tr>
        
        <!-- Red accent bar -->
        <tr><td style="background:#E63946;height:4px;font-size:0;line-height:0;">&nbsp;</td></tr>
        
        <!-- Title section -->
        <tr><td style="background:white;padding:28px 32px 0;">
          <h2 style="margin:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;font-size:22px;font-weight:700;color:#0A1F3F;letter-spacing:-0.3px;">${title}</h2>
          <div style="width:48px;height:3px;background:#E63946;margin-top:12px;border-radius:2px;"></div>
        </td></tr>
        
        <!-- Content -->
        <tr><td style="background:white;padding:20px 32px 28px;">
          ${content}
        </td></tr>
        
        <!-- Footer -->
        <tr><td style="background:#0A1F3F;padding:24px 32px;border-radius:0 0 12px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="text-align:center;">
              <p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.9);font-weight:600;">${t(lang, "footer")}</p>
              <p style="margin:0 0 12px;font-size:12px;color:rgba(255,255,255,0.6);">Südwall 23, 44137 Dortmund</p>
              <div style="border-top:1px solid rgba(255,255,255,0.15);padding-top:12px;margin-top:4px;">
                <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);">${t(lang, "footer_thanks")}</p>
              </div>
            </td></tr>
          </table>
        </td></tr>
        
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function welcomeEmail(lang: Lang, data: Record<string, unknown>): { subject: string; html: string } {
  const name = (data.name as string) || "";
  const siteUrl = (data.siteUrl as string) || "https://mcdauto-carfinder.lovable.app";
  const content = `
    <p style="color:#444;line-height:1.7;font-size:15px;">${name ? `${name}, ` : ""}${t(lang, "welcome_body")}</p>
    <div style="background:#f7f9fb;border-radius:10px;padding:20px;margin:20px 0;border-left:4px solid #E63946;">
      <p style="font-weight:700;margin:0 0 10px;color:#0A1F3F;font-size:14px;">${t(lang, "welcome_features_title")}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
        <tr><td style="padding:6px 0;font-size:14px;color:#555;">
          <span style="color:#E63946;font-weight:bold;margin-right:8px;">✓</span>${t(lang, "welcome_f1")}
        </td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#555;">
          <span style="color:#E63946;font-weight:bold;margin-right:8px;">✓</span>${t(lang, "welcome_f2")}
        </td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#555;">
          <span style="color:#E63946;font-weight:bold;margin-right:8px;">✓</span>${t(lang, "welcome_f3")}
        </td></tr>
      </table>
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="${siteUrl}/${lang}/customer-auth" style="display:inline-block;background:linear-gradient(135deg,#E63946,#c62833);color:white;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(230,57,70,0.3);">${t(lang, "welcome_cta")}</a>
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
      <td style="padding:10px 14px;border-bottom:1px solid #eef1f5;font-size:14px;color:#333;">${v.brand} ${v.model} <span style="color:#888;">(${v.year})</span></td>
      <td style="padding:10px 14px;border-bottom:1px solid #eef1f5;text-align:right;font-weight:600;color:#0A1F3F;font-size:14px;">${Number(v.price).toLocaleString("de-DE")} €</td>
    </tr>`).join("");

  const content = `
    <p style="color:#444;line-height:1.7;font-size:15px;">${t(lang, "order_body")}</p>
    
    <table style="width:100%;border-collapse:collapse;margin:20px 0;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:linear-gradient(135deg,#0A1F3F,#132d54);">
        <th style="padding:12px 14px;text-align:left;color:white;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Véhicule</th>
        <th style="padding:12px 14px;text-align:right;color:white;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Prix</th>
      </tr></thead>
      <tbody>${vehicleRows}</tbody>
    </table>

    <div style="background:#f7f9fb;border-radius:10px;padding:18px;margin:20px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#555;">${t(lang, "order_total")}</td>
          <td style="padding:6px 0;font-size:14px;color:#0A1F3F;font-weight:700;text-align:right;">${Number(totalPrice).toLocaleString("de-DE")} €</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:15px;color:#E63946;font-weight:700;">${t(lang, "order_deposit")}</td>
          <td style="padding:6px 0;font-size:15px;color:#E63946;font-weight:700;text-align:right;">${Number(depositAmount).toLocaleString("de-DE")} €</td>
        </tr>
      </table>
    </div>

    <div style="margin:24px 0;">
      <div style="background:#f7f9fb;border-radius:10px;padding:16px 18px;margin-bottom:10px;border-left:4px solid #E63946;">
        <h3 style="color:#0A1F3F;font-size:14px;font-weight:700;margin:0 0 4px;">${t(lang, "order_step1_title")}</h3>
        <p style="color:#666;font-size:13px;margin:0;line-height:1.5;">${t(lang, "order_step1_body")}</p>
      </div>
      <div style="background:#f7f9fb;border-radius:10px;padding:16px 18px;margin-bottom:10px;border-left:4px solid #E6A839;">
        <h3 style="color:#0A1F3F;font-size:14px;font-weight:700;margin:0 0 4px;">${t(lang, "order_step2_title")}</h3>
        <p style="color:#666;font-size:13px;margin:0;line-height:1.5;">${t(lang, "order_step2_body")}</p>
      </div>
      <div style="background:#f7f9fb;border-radius:10px;padding:16px 18px;border-left:4px solid #39B54A;">
        <h3 style="color:#0A1F3F;font-size:14px;font-weight:700;margin:0 0 4px;">${t(lang, "order_step3_title")}</h3>
        <p style="color:#666;font-size:13px;margin:0;line-height:1.5;">${t(lang, "order_step3_body")}</p>
      </div>
    </div>

    <p style="color:#777;font-size:13px;font-style:italic;text-align:center;margin:16px 0;">${t(lang, "order_tracking")}</p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${siteUrl}/${lang}/account" style="display:inline-block;background:linear-gradient(135deg,#E63946,#c62833);color:white;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(230,57,70,0.3);">${t(lang, "order_cta")}</a>
    </div>`;
  return { subject: t(lang, "order_subject"), html: baseTemplate(lang, t(lang, "order_title"), content) };
}

function orderCompletedEmail(lang: Lang, data: Record<string, unknown>): { subject: string; html: string } {
  const name = (data.name as string) || "";
  const vehicles = (data.vehicles as Array<{ brand: string; model: string; year: number; price: number }>) || [];
  const totalPrice = data.totalPrice as number || 0;
  const depositAmount = data.depositAmount as number || 0;
  const siteUrl = (data.siteUrl as string) || "https://mcdauto-carfinder.lovable.app";

  const vehicleRows = vehicles.map(v => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #eef1f5;font-size:14px;color:#333;">${v.brand} ${v.model} <span style="color:#888;">(${v.year})</span></td>
      <td style="padding:10px 14px;border-bottom:1px solid #eef1f5;text-align:right;font-weight:600;color:#0A1F3F;font-size:14px;">${Number(v.price).toLocaleString("de-DE")} €</td>
    </tr>`).join("");

  const content = `
    <p style="color:#444;line-height:1.7;font-size:15px;">${name ? `${name}, ` : ""}${t(lang, "completed_body")}</p>
    <p style="color:#444;line-height:1.7;font-size:15px;">${t(lang, "completed_body2")}</p>

    <table style="width:100%;border-collapse:collapse;margin:20px 0;border-radius:8px;overflow:hidden;">
      <thead><tr style="background:linear-gradient(135deg,#0A1F3F,#132d54);">
        <th style="padding:12px 14px;text-align:left;color:white;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Véhicule</th>
        <th style="padding:12px 14px;text-align:right;color:white;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Prix</th>
      </tr></thead>
      <tbody>${vehicleRows}</tbody>
    </table>

    <div style="background:#f7f9fb;border-radius:10px;padding:18px;margin:20px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#555;">${t(lang, "order_total")}</td>
          <td style="padding:6px 0;font-size:14px;color:#0A1F3F;font-weight:700;text-align:right;">${Number(totalPrice).toLocaleString("de-DE")} €</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:15px;color:#E63946;font-weight:700;">${t(lang, "order_deposit")}</td>
          <td style="padding:6px 0;font-size:15px;color:#E63946;font-weight:700;text-align:right;">${Number(depositAmount).toLocaleString("de-DE")} €</td>
        </tr>
      </table>
    </div>

    <div style="background:#f7f9fb;border-radius:10px;padding:20px;margin:20px 0;border-left:4px solid #39B54A;">
      <p style="font-weight:700;margin:0 0 10px;color:#0A1F3F;font-size:14px;">${t(lang, "completed_next_title")}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;">
        <tr><td style="padding:6px 0;font-size:14px;color:#555;">
          <span style="color:#39B54A;font-weight:bold;margin-right:8px;">✓</span>${t(lang, "completed_next1")}
        </td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#555;">
          <span style="color:#39B54A;font-weight:bold;margin-right:8px;">✓</span>${t(lang, "completed_next2")}
        </td></tr>
        <tr><td style="padding:6px 0;font-size:14px;color:#555;">
          <span style="color:#39B54A;font-weight:bold;margin-right:8px;">✓</span>${t(lang, "completed_next3")}
        </td></tr>
      </table>
    </div>

    <div style="text-align:center;margin:28px 0;">
      <a href="${siteUrl}/${lang}/account" style="display:inline-block;background:linear-gradient(135deg,#E63946,#c62833);color:white;text-decoration:none;padding:14px 40px;border-radius:8px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(230,57,70,0.3);">${t(lang, "completed_cta")}</a>
    </div>`;
  return { subject: t(lang, "completed_subject"), html: baseTemplate(lang, t(lang, "completed_title"), content) };
}

function contactEmail(lang: Lang, data: Record<string, unknown>): { subject: string; html: string } {
  const name = (data.name as string) || "";
  const message = (data.message as string) || "";
  const subjectText = (data.subject as string) || "";
  const content = `
    <p style="color:#444;line-height:1.7;font-size:15px;">${name ? `${name}, ` : ""}${t(lang, "contact_body")}</p>
    <div style="background:#f7f9fb;border-radius:10px;padding:20px;margin:20px 0;border-left:4px solid #E63946;">
      <p style="font-weight:700;margin:0 0 10px;color:#0A1F3F;font-size:14px;">${t(lang, "contact_summary")}</p>
      ${subjectText ? `<p style="color:#555;margin:6px 0;font-size:14px;"><strong style="color:#0A1F3F;">Sujet :</strong> ${subjectText}</p>` : ""}
      <div style="background:white;border-radius:6px;padding:14px;margin-top:10px;">
        <p style="color:#555;margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message}</p>
      </div>
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
      case "order_completed":
        emailContent = orderCompletedEmail(lang, data);
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

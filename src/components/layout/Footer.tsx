import { useState, forwardRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, ChevronDown, Star, Handshake, HeartHandshake, MapPin, SlidersHorizontal } from 'lucide-react';
import logoMcd from '@/assets/logo-mcd.png';

interface FooterSection {
  title: string;
  links: { label: string; to: string }[];
}

const FooterAccordion = forwardRef<HTMLDivElement, FooterSection>(({ title, links }, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <div ref={ref} className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-1 text-left"
      >
        <span className="font-heading font-bold text-sm">{title}</span>
        <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul className="pb-4 px-1 space-y-2.5">
          {links.map((link, i) => (
            <li key={i}>
              <Link to={link.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

const Footer = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();

  const engagements = [
    { icon: Star, label: t('footer.engQuality', 'Qualité') },
    { icon: HeartHandshake, label: t('footer.engAccompaniment', 'Accompagnement') },
    { icon: Handshake, label: t('footer.engProximity', 'Proximité') },
    { icon: SlidersHorizontal, label: t('footer.engCustom', 'Sur-mesure') },
  ];

  const sections: FooterSection[] = [
    {
      title: t('footer.sectionBuy', 'Acheter'),
      links: [
        { label: t('footer.linkUsedCars', 'Véhicules d\'occasion'), to: `/${lang}/search` },
        { label: t('footer.linkAllBrands', 'Toutes les marques'), to: `/${lang}/search` },
        { label: t('footer.linkPromotions', 'Promotions'), to: `/${lang}/search` },
      ],
    },
    {
      title: t('footer.sectionSell', 'Estimer et vendre'),
      links: [
        { label: t('footer.linkEstimate', 'Estimer mon véhicule'), to: `/${lang}/evaluation` },
        { label: t('footer.linkSellCar', 'Vendre ma voiture'), to: `/${lang}/sell` },
      ],
    },
    {
      title: t('footer.sectionMaintain', 'Entretenir et réparer'),
      links: [
        { label: t('footer.linkMaintenance', 'Entretien'), to: `/${lang}/services/maintenance` },
        { label: t('footer.linkRepair', 'Réparation'), to: `/${lang}/repair` },
      ],
    },
    {
      title: t('footer.sectionServices', 'Nos services'),
      links: [
        { label: t('footer.linkFinancing', 'Financement'), to: `/${lang}/services/financing` },
        { label: t('footer.linkWarranty', 'Garantie'), to: `/${lang}/warranty` },
        { label: t('footer.linkDelivery', 'Livraison'), to: `/${lang}/delivery` },
      ],
    },
    {
      title: t('footer.sectionHelp', 'Besoin d\'aide'),
      links: [
        { label: t('footer.linkFaq', 'FAQ'), to: `/${lang}/faq` },
        { label: t('footer.contact', 'Contact'), to: `/${lang}/contact` },
      ],
    },
    {
      title: t('footer.sectionAbout', 'Nous connaître'),
      links: [
        { label: t('footer.about', 'À propos'), to: `/${lang}/about` },
        { label: t('footer.legal', 'Mentions légales'), to: `/${lang}/legal` },
        { label: t('footer.privacy', 'Politique de confidentialité'), to: `/${lang}/privacy` },
      ],
    },
    {
      title: t('footer.sectionConditions', 'Conditions'),
      links: [
        { label: t('footer.cgv', 'CGV'), to: `/${lang}/cgv` },
        { label: t('footer.legal', 'Mentions légales'), to: `/${lang}/legal` },
      ],
    },
  ];

  return (
    <footer>
      {/* Engagements strip */}
      <section className="bg-secondary border-t">
        <div className="container mx-auto px-4 py-10">
          <h3 className="text-xl font-heading font-bold text-center mb-8">
            {t('footer.engTitle', 'Nos engagements')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {engagements.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 text-center">
                <item.icon className="w-10 h-10 text-foreground" strokeWidth={1.5} />
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Eco message */}
        <div className="border-t py-4 text-center">
          <p className="text-sm font-bold text-foreground">
            {t('footer.ecoMessage', 'Pensez à covoiturer. #SeDéplacerMoinsPolluer')}
          </p>
        </div>
      </section>

      {/* Main footer with accordion */}
      <section className="bg-card border-t">
        <div className="container mx-auto px-4 py-8">
          {/* Logo */}
          <div className="flex items-center mb-4">
            <img src={logoMcd} alt="MCD AUTO" className="h-12 w-auto" />
          </div>

          {/* Accordion sections */}
          <div>
            {sections.map((section, i) => (
              <FooterAccordion key={i} {...section} />
            ))}
          </div>

          {/* Reviews */}
          <div className="py-6">
            <p className="text-sm text-muted-foreground">
              {t('footer.reviewsText', 'Découvrez les avis de nos clients')}
              <br />
              {t('footer.reviewsCollected', 'collectés par MCD AUTO')}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4].map(i => (
                <Star key={i} className="w-5 h-5 fill-accent text-accent" />
              ))}
              <Star className="w-5 h-5 fill-accent/50 text-accent" />
              <span className="ml-2 text-sm font-semibold">4.5/5</span>
            </div>
          </div>

          {/* Social */}
          <div className="py-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              {t('footer.socialText', 'Rejoignez-nous')}
              <br />
              {t('footer.socialSub', 'sur les réseaux sociaux')}
            </p>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/share/1Bxai2rjmq/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/mcd_auto" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://www.tiktok.com/@mcd.auto?_r=1&_t=ZS-93sIWz2UHXl" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.18z"/></svg>
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} MCD AUTO. {t('footer.rights', 'Tous droits réservés')}.
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
};

export default Footer;

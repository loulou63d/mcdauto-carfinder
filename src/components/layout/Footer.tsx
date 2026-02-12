import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Car, Facebook, Instagram, Linkedin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 font-heading font-bold text-xl mb-4">
              <Car className="w-6 h-6" />
              MCD AUTO
            </div>
            <p className="text-sm opacity-70 leading-relaxed">{t('footer.description')}</p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="opacity-70 hover:opacity-100 transition-opacity"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to={`/${lang}/about`} className="hover:opacity-100">{t('footer.about')}</Link></li>
              <li><Link to={`/${lang}/services`} className="hover:opacity-100">{t('footer.services')}</Link></li>
              <li><Link to={`/${lang}/search`} className="hover:opacity-100">{t('nav.buy')}</Link></li>
              <li><Link to={`/${lang}/contact`} className="hover:opacity-100">{t('footer.contact')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold mb-4">{t('legal.title')}</h4>
            <ul className="space-y-2 text-sm opacity-70">
              <li><Link to={`/${lang}/legal`} className="hover:opacity-100">{t('footer.legal')}</Link></li>
              <li><Link to={`/${lang}/privacy`} className="hover:opacity-100">{t('footer.privacy')}</Link></li>
              <li><Link to={`/${lang}/cgv`} className="hover:opacity-100">{t('footer.cgv')}</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-heading font-semibold mb-4">{t('footer.newsletter')}</h4>
            <div className="flex gap-2">
              <Input
                placeholder={t('footer.newsletterPlaceholder')}
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shrink-0">
                {t('footer.subscribe')}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center text-sm opacity-50">
          © {new Date().getFullYear()} MCD AUTO. {t('footer.rights')}.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

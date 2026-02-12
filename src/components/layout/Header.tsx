import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Car, ChevronDown } from 'lucide-react';
import { supportedLangs, langLabels, type Lang } from '@/i18n';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const navLinks = [
    { label: t('nav.buy'), to: `/${lang}/search` },
    { label: t('nav.sell'), to: `/${lang}/contact` },
    { label: t('nav.maintain'), to: `/${lang}/services` },
    { label: t('nav.about'), to: `/${lang}/about` },
    { label: t('nav.contact'), to: `/${lang}/contact` },
  ];

  return (
    <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to={`/${lang}`} className="flex items-center gap-2 font-heading font-bold text-xl tracking-tight">
          <Car className="w-7 h-7" />
          <span>MCD AUTO</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link key={l.to + l.label} to={l.to} className="text-sm font-medium opacity-90 hover:opacity-100 transition-opacity">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-sm font-medium opacity-90 hover:opacity-100"
            >
              {langLabels[lang as Lang] || 'DE'}
              <ChevronDown className="w-3 h-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 bg-card text-card-foreground rounded-md shadow-lg border py-1 min-w-[60px]">
                {supportedLangs.map((l) => (
                  <Link
                    key={l}
                    to={`/${l}${window.location.pathname.replace(/^\/[a-z]{2}/, '')}`}
                    onClick={() => setLangOpen(false)}
                    className={`block px-3 py-1.5 text-sm hover:bg-muted ${l === lang ? 'font-bold' : ''}`}
                  >
                    {langLabels[l]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/auth">
            <Button variant="outline" size="sm" className="hidden md:inline-flex border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              {t('nav.login')}
            </Button>
          </Link>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-primary-foreground/10 pb-4">
          {navLinks.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-medium opacity-90 hover:opacity-100 hover:bg-primary-foreground/5"
            >
              {l.label}
            </Link>
          ))}
          <div className="px-4 pt-2">
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <Button variant="outline" size="sm" className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                {t('nav.login')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

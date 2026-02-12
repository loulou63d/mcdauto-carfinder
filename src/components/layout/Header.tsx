import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Car, ChevronDown, Search, User, Phone } from 'lucide-react';
import { supportedLangs, langLabels, type Lang } from '@/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const navLinks = [
    { label: t('nav.buy'), to: `/${lang}/search` },
    { label: t('nav.sell'), to: `/${lang}/contact` },
    { label: t('nav.maintain'), to: `/${lang}/services` },
    { label: t('nav.services'), to: `/${lang}/services` },
    { label: t('nav.about'), to: `/${lang}/about` },
    { label: t('nav.contact'), to: `/${lang}/contact` },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b shadow-sm">
      {/* Top bar */}
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to={`/${lang}`} className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-xl text-foreground tracking-tight">MCD AUTO</span>
        </Link>

        {/* Search bar - desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Input
              placeholder={t('hero.searchPlaceholder')}
              className="pr-10 h-10 rounded-full border-border bg-secondary"
            />
            <button className="absolute right-1 top-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
              <Search className="w-4 h-4 text-primary-foreground" />
            </button>
          </div>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-2">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {langLabels[lang as Lang] || 'DE'}
              <ChevronDown className="w-3 h-3" />
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-1 bg-card rounded-lg shadow-lg border py-1 min-w-[80px] z-50">
                {supportedLangs.map((l) => (
                  <Link
                    key={l}
                    to={`/${l}${window.location.pathname.replace(/^\/[a-z]{2}/, '')}`}
                    onClick={() => setLangOpen(false)}
                    className={`block px-4 py-2 text-sm hover:bg-muted transition-colors ${l === lang ? 'font-bold text-primary' : 'text-foreground'}`}
                  >
                    {langLabels[l]}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/auth" className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <User className="w-5 h-5" />
          </Link>

          <a href="tel:+33490000000" className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="w-5 h-5" />
          </a>

          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Secondary nav - desktop */}
      <nav className="hidden md:block border-t bg-background">
        <div className="container mx-auto px-4 flex items-center gap-0">
          {navLinks.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              className="px-5 py-3 text-sm font-medium text-foreground hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background">
          {/* Mobile search */}
          <div className="px-4 py-3 border-b">
            <div className="relative">
              <Input placeholder={t('hero.searchPlaceholder')} className="pr-10 h-10 rounded-full bg-secondary" />
              <button className="absolute right-1 top-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Search className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </div>
          {navLinks.map((l) => (
            <Link
              key={l.to + l.label}
              to={l.to}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-sm font-medium hover:bg-muted transition-colors border-b"
            >
              {l.label}
            </Link>
          ))}
          <div className="px-4 py-3 flex gap-2">
            <Link to="/auth" onClick={() => setMobileOpen(false)} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <User className="w-4 h-4 mr-2" />
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

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Menu, X, ChevronDown, ChevronUp, Search, User, BookmarkCheck, ArrowLeft,
  ShoppingCart, LayoutGrid, Heart, Landmark, Tag, Car, Wrench, Info, Phone,
  FileText, Shield, HelpCircle, LogOut
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import logoMcd from '@/assets/logo-mcd.png';
import { supportedLangs, langLabels, type Lang } from '@/i18n';
import { Button } from '@/components/ui/button';
import type { User as SupaUser } from '@supabase/supabase-js';

/* ── Accordion section ──────────────────────────────────── */
const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-4 text-[15px] font-semibold text-foreground hover:bg-muted/50 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      {open && <div className="pb-2">{children}</div>}
    </div>
  );
};

const MenuLink = ({ icon: Icon, label, to, onClick }: { icon: React.ElementType; label: string; to: string; onClick: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3.5 px-6 py-3 text-[14px] text-foreground hover:bg-muted/60 transition-colors"
  >
    <Icon className="w-5 h-5 text-primary" />
    {label}
  </Link>
);

const Header = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { itemCount } = useCart();
  const [currentUser, setCurrentUser] = useState<SupaUser | null>(null);
  

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setCurrentUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const isHome = location.pathname === `/${lang}` || location.pathname === `/${lang}/`;
  const close = () => setMobileOpen(false);

  const textColor = 'text-foreground';
  const textHover = 'hover:text-primary';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b shadow-sm">
      {/* Top bar */}
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Left: back button / hamburger + logo */}
        <div className="flex items-center gap-2">
          {!isHome && (
            <button className={`p-1 ${textColor} ${textHover} transition-colors`} onClick={() => navigate(-1)}>
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <button className={`p-1 ${textColor} ${textHover} transition-colors`} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
          </button>
          <Link to={`/${lang}`} className="flex items-center shrink-0">
            <img src={logoMcd} alt="MCD AUTO" className="h-12 w-auto" />
          </Link>
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          {/* Language */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {(lang as string).toUpperCase()}
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

          <Link to={`/${lang}/search`} className={`p-2 ${textColor} ${textHover} transition-colors`}>
            <Search className="w-6 h-6" />
          </Link>
          <Link to={`/${lang}/cart`} className={`relative p-2 ${textColor} ${textHover} transition-colors`}>
            <ShoppingCart className="w-6 h-6" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          {currentUser ? (
            <Link to={`/${lang}/account`} className={`p-2 ${textColor} ${textHover} transition-colors`}>
              <User className="w-6 h-6" />
            </Link>
          ) : (
            <Link to={`/${lang}/login`} className={`p-2 ${textColor} ${textHover} transition-colors`}>
              <User className="w-6 h-6" />
            </Link>
          )}
          <Link to={`/${lang}/search`} className={`hidden md:flex items-center gap-1.5 px-3 py-2 text-sm ${textColor} ${textHover} transition-colors`}>
            <BookmarkCheck className="w-5 h-5" />
            <span className="text-sm">{t('nav.favorites')}</span>
          </Link>
        </div>
      </div>

      {/* ── Slide-in mobile menu (mobile.de style) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 top-0 bg-black/40 z-40"
              onClick={close}
            />

            {/* Panel */}
            <motion.div
              key="panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-[380px] bg-card shadow-2xl flex flex-col"
            >
        {/* Panel header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <span className="text-base font-semibold text-foreground">
            {t('nav.closeMenu', { defaultValue: 'Fermer le menu' })}
          </span>
          <button onClick={close} className="p-1 text-foreground hover:text-primary transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Panel content (scrollable) */}
        <div className="flex-1 overflow-y-auto">
          {/* ── My MCD AUTO section ── */}
          <MenuSection title={t('nav.myAccount', { defaultValue: 'Mon MCD AUTO' })}>
            <MenuLink icon={LayoutGrid} label={t('nav.overview', { defaultValue: 'Vue d\'ensemble' })} to={`/${lang}/account`} onClick={close} />

            <p className="px-6 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('nav.buy', { defaultValue: 'Acheter' })}
            </p>
            <MenuLink icon={Search} label={t('nav.mySearches', { defaultValue: 'Mes recherches' })} to={`/${lang}/my-searches`} onClick={close} />
            <MenuLink icon={Heart} label={t('nav.favorites', { defaultValue: 'Favoris' })} to={`/${lang}/favorites`} onClick={close} />
            <MenuLink icon={Landmark} label={t('nav.financing', { defaultValue: 'Financement' })} to={`/${lang}/services/financing`} onClick={close} />

            <p className="px-6 pt-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('nav.sell', { defaultValue: 'Vendre' })}
            </p>
            <MenuLink icon={Tag} label={t('nav.sellDirect', { defaultValue: 'Vente directe' })} to={`/${lang}/sell`} onClick={close} />
          </MenuSection>

          {/* ── Acheter ── */}
          <MenuSection title={t('nav.buy', { defaultValue: 'Acheter' })}>
            <MenuLink icon={Car} label={t('nav.allVehicles', { defaultValue: 'Tous les véhicules' })} to={`/${lang}/search`} onClick={close} />
            <MenuLink icon={Search} label={t('nav.advancedSearch', { defaultValue: 'Recherche avancée' })} to={`/${lang}/search`} onClick={close} />
          </MenuSection>

          {/* ── Vendre ── */}
          <MenuSection title={t('nav.sell', { defaultValue: 'Vendre' })}>
            <MenuLink icon={Tag} label={t('nav.sellYourCar', { defaultValue: 'Vendez votre voiture' })} to={`/${lang}/sell`} onClick={close} />
            <MenuLink icon={FileText} label={t('nav.estimate', { defaultValue: 'Estimation gratuite' })} to={`/${lang}/services/estimation`} onClick={close} />
          </MenuSection>

          {/* ── Services ── */}
          <MenuSection title={t('nav.services', { defaultValue: 'Services' })}>
            <MenuLink icon={Landmark} label={t('nav.financing', { defaultValue: 'Financement' })} to={`/${lang}/services/financing`} onClick={close} />
            <MenuLink icon={Wrench} label={t('nav.maintenance', { defaultValue: 'Entretien' })} to={`/${lang}/services/maintenance`} onClick={close} />
            <MenuLink icon={Shield} label={t('nav.warranty', { defaultValue: 'Garantie' })} to={`/${lang}/warranty`} onClick={close} />
            <MenuLink icon={FileText} label={t('nav.estimate', { defaultValue: 'Estimation' })} to={`/${lang}/services/estimation`} onClick={close} />
          </MenuSection>

          {/* ── Informations ── */}
          <MenuSection title={t('nav.info', { defaultValue: 'Informations' })}>
            <MenuLink icon={Info} label={t('nav.about', { defaultValue: 'À propos' })} to={`/${lang}/about`} onClick={close} />
            <MenuLink icon={HelpCircle} label={t('nav.faq', { defaultValue: 'FAQ' })} to={`/${lang}/faq`} onClick={close} />
            <MenuLink icon={Phone} label={t('nav.contact', { defaultValue: 'Contact' })} to={`/${lang}/contact`} onClick={close} />
          </MenuSection>
        </div>

        {/* Panel footer – CTA */}
        <div className="p-5 border-t border-border">
          {currentUser ? (
            <Link to={`/${lang}/account`} onClick={close} className="block">
              <Button className="w-full h-12 text-[15px] font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                <User className="w-5 h-5 mr-2" />
                {t('account.myAccount', { defaultValue: 'Mon compte' })}
              </Button>
            </Link>
          ) : (
            <Link to={`/${lang}/login`} onClick={close} className="block">
              <Button className="w-full h-12 text-[15px] font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground">
                <User className="w-5 h-5 mr-2" />
                {t('nav.login', { defaultValue: 'Se connecter' })}
              </Button>
            </Link>
          )}
        </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

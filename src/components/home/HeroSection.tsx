import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { Search, Sparkles, Car, Fuel, DollarSign, Settings2, ArrowRight, Truck, CarFront, Caravan } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import heroImage from '@/assets/hero-showroom.jpg';

const HeroSection = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'maintain'>('buy');
  const [searchQuery, setSearchQuery] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [showFullForm, setShowFullForm] = useState(false);
  const [plateForm, setPlateForm] = useState({ vin: '', brand: '', mileage: '' });

  useEffect(() => {
    const hash = location.hash.slice(1) as 'buy' | 'sell' | 'maintain';
    if (hash === 'sell' || hash === 'maintain') setActiveTab(hash);
    else setActiveTab('buy');
  }, [location.hash]);

  const handleSearch = () => {
    navigate(`/${lang}/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  const handlePlateSubmit = () => {
    navigate(`/${lang}/contact`);
  };

  const plateFormats: Record<string, { placeholder: string; flag: string; country: string }> = {
    fr: { placeholder: 'AA-000-AA', flag: '🇫🇷', country: 'F' },
    de: { placeholder: 'B-AB 1234', flag: '🇩🇪', country: 'D' },
    es: { placeholder: '0000 AAA', flag: '🇪🇸', country: 'E' },
    pt: { placeholder: 'AA-00-AA', flag: '🇵🇹', country: 'P' },
    en: { placeholder: 'AB12 CDE', flag: '🇬🇧', country: 'GB' },
  };
  const currentPlate = plateFormats[lang] || plateFormats.de;

  const categories = [
    { key: 'suv', Icon: Car },
    { key: 'berline', Icon: CarFront },
    { key: 'break', Icon: Caravan },
    { key: 'utilitaire', Icon: Truck },
  ];

  return (
    <section className="relative min-h-[600px] md:min-h-[640px] overflow-hidden">
      {/* Background image — right side */}
      <img
        src={heroImage}
        alt="MCD AUTO Showroom"
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      {/* Overall dim overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--primary)/0.97)] via-[hsl(var(--primary)/0.85)] to-transparent" />

      {/* Decorative blurred orbs */}
      <div className="absolute top-16 left-[30%] w-80 h-80 rounded-full bg-accent/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/30 blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-[10%] w-48 h-48 rounded-full bg-accent/10 blur-[80px] pointer-events-none" />

      {/* Curved separator between left panel & right promo */}
      <svg className="absolute top-0 bottom-0 left-[55%] md:left-[52%] h-full w-40 pointer-events-none hidden lg:block" preserveAspectRatio="none" viewBox="0 0 100 100">
        <path d="M80,0 Q20,50 80,100 L100,100 L100,0 Z" fill="hsl(var(--primary))" fillOpacity="0.15" />
      </svg>

      <div className="relative z-10 container mx-auto px-4 h-full">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[600px] md:min-h-[640px] py-12">
          {/* ══════ LEFT: Search Panel ══════ */}
          <div className="flex flex-col gap-5">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 self-start bg-accent/15 backdrop-blur-md border border-accent/25 rounded-full px-4 py-1.5"
            >
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                {t('hero.badge', { defaultValue: 'Geprüft & Garantiert' })}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-[2.75rem] font-heading font-extrabold text-primary-foreground leading-tight"
            >
              {t('hero.findTitle', { defaultValue: 'Finden Sie Ihr Traumauto!' })}
            </motion.h1>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex bg-primary-foreground/10 backdrop-blur-md rounded-full p-1 border border-primary-foreground/15 self-start"
            >
              {([
                { key: 'buy' as const, label: t('nav.buy') },
                { key: 'sell' as const, label: t('nav.sell') },
                { key: 'maintain' as const, label: t('nav.maintain') },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 md:px-8 py-2 text-sm font-semibold transition-all duration-300 rounded-full ${
                    activeTab === tab.key
                      ? 'bg-card text-foreground shadow-lg'
                      : 'text-primary-foreground/80 hover:text-primary-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </motion.div>

            {/* Search / Form area */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="w-full max-w-lg"
              >
                {activeTab === 'buy' ? (
                  <div className="space-y-4">
                    {/* Main search bar */}
                    <div className="flex w-full shadow-2xl rounded-xl overflow-hidden">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          placeholder={t('hero.searchPlaceholder')}
                          className="rounded-r-none rounded-l-xl h-14 bg-card text-foreground border-0 text-base pl-12"
                        />
                      </div>
                      <Button
                        onClick={handleSearch}
                        className="rounded-l-none rounded-r-xl h-14 px-7 bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-base"
                      >
                        {t('hero.searchButton')}
                      </Button>
                    </div>

                    {/* Quick filter pills */}
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/${lang}/search?energy=Diesel`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 text-primary-foreground text-xs font-medium hover:bg-primary-foreground/20 transition-colors"
                      >
                        <Fuel className="w-3.5 h-3.5" /> Diesel
                      </Link>
                      <Link
                        to={`/${lang}/search?energy=Essence`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 text-primary-foreground text-xs font-medium hover:bg-primary-foreground/20 transition-colors"
                      >
                        <Fuel className="w-3.5 h-3.5" /> {t('hero.petrol', { defaultValue: 'Benzin' })}
                      </Link>
                      <Link
                        to={`/${lang}/search?energy=Électrique`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 text-primary-foreground text-xs font-medium hover:bg-primary-foreground/20 transition-colors"
                      >
                        <Fuel className="w-3.5 h-3.5" /> {t('hero.electric', { defaultValue: 'Elektro / Hybrid' })}
                      </Link>
                      <Link
                        to={`/${lang}/search`}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 text-accent text-xs font-bold hover:bg-accent/30 transition-colors"
                      >
                        <Settings2 className="w-3.5 h-3.5" /> {t('hero.advancedSearch', { defaultValue: 'Erweiterte Suche' })}
                      </Link>
                    </div>

                    {/* Vehicle count badge */}
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="text-sm text-primary-foreground/70 font-medium"
                    >
                      <span className="text-accent font-bold">500+</span>{' '}
                      {t('hero.vehiclesAvailable', { defaultValue: 'Fahrzeuge sofort verfügbar!' })}
                    </motion.p>

                    {/* Category quick links */}
                    <div className="flex gap-3 pt-1">
                      {categories.map((cat) => (
                        <Link
                          key={cat.key}
                          to={`/${lang}/search?category=${cat.key}`}
                          className="group flex flex-col items-center gap-1.5 min-w-[70px]"
                        >
                          <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/15 flex items-center justify-center group-hover:bg-primary-foreground/20 group-hover:scale-110 transition-all duration-200">
                            <cat.Icon className="w-5 h-5 text-primary-foreground/70 group-hover:text-primary-foreground transition-colors" />
                          </div>
                          <span className="text-[11px] font-semibold text-primary-foreground/80 uppercase tracking-wide group-hover:text-primary-foreground transition-colors">
                            {t(`categories.${cat.key}`, { defaultValue: cat.key })}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Sell / Maintain form */
                  <div className="space-y-3">
                    <p className="text-sm text-primary-foreground/80 font-medium">
                      {activeTab === 'sell'
                        ? t('hero.sellSubtitle', { defaultValue: 'Geben Sie Ihr Kennzeichen ein für eine Sofortbewertung' })
                        : t('hero.maintainSubtitle', { defaultValue: 'Geben Sie Ihr Kennzeichen ein um einen Termin zu buchen' })}
                    </p>
                    <div className="flex items-stretch w-full shadow-2xl rounded-xl overflow-hidden">
                      <div className="flex items-center gap-1 bg-[hsl(220,60%,45%)] text-white px-3 text-sm font-bold">
                        <span className="text-xs">{currentPlate.flag}</span>
                        <span>{currentPlate.country}</span>
                      </div>
                      <Input
                        value={plateNumber}
                        onChange={(e) => setPlateNumber(e.target.value)}
                        placeholder={currentPlate.placeholder}
                        className="rounded-none h-14 bg-card text-foreground border-0 text-base flex-1 text-center font-mono tracking-widest uppercase"
                      />
                      <Button
                        onClick={handlePlateSubmit}
                        className="rounded-l-none h-14 px-6 bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
                      >
                        {activeTab === 'sell' ? t('hero.estimate') : 'OK'}
                      </Button>
                    </div>
                    <button
                      onClick={() => setShowFullForm(!showFullForm)}
                      className="text-sm text-primary-foreground/70 underline hover:text-primary-foreground transition-colors"
                    >
                      {t('hero.unknownPlate')}
                    </button>
                    {showFullForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-primary-foreground/5 backdrop-blur-md border border-primary-foreground/10 rounded-xl p-4 space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-primary-foreground/90 mb-1 block">{t('hero.vinLabel')}</label>
                            <Input value={plateForm.vin} onChange={(e) => setPlateForm({ ...plateForm, vin: e.target.value })} placeholder={t('hero.vinPlaceholder')} className="h-10 text-sm bg-card border-0 uppercase font-mono" maxLength={17} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-primary-foreground/90 mb-1 block">{t('hero.brandLabel')}</label>
                            <Input value={plateForm.brand} onChange={(e) => setPlateForm({ ...plateForm, brand: e.target.value })} placeholder={t('hero.brandPlaceholder')} className="h-10 text-sm bg-card border-0" />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-primary-foreground/90 mb-1 block">{t('hero.mileageLabel')}</label>
                            <Input type="number" value={plateForm.mileage} onChange={(e) => setPlateForm({ ...plateForm, mileage: e.target.value })} placeholder={t('hero.mileagePlaceholder')} className="h-10 text-sm bg-card border-0" />
                          </div>
                          <div className="flex items-end">
                            <Button onClick={handlePlateSubmit} className="w-full h-10 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                              {activeTab === 'sell' ? t('hero.estimate') : t('hero.bookAppointment')}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ══════ RIGHT: Promo / Visual side ══════ */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-6">
            {/* Floating glass promo card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3, type: 'spring', damping: 20 }}
              className="relative w-full max-w-md"
            >
              <div className="bg-primary-foreground/10 backdrop-blur-xl border border-primary-foreground/15 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-accent">
                    {t('hero.promoLabel', { defaultValue: 'Aktuelle Aktion' })}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-primary-foreground leading-tight mb-2">
                  {t('hero.promoTitle', { defaultValue: 'Bis zu' })}{' '}
                  <span className="text-accent">-35%</span>
                </h2>
                <p className="text-primary-foreground/70 text-sm mb-5">
                  {t('hero.promoDesc', { defaultValue: 'Auf eine Auswahl an Premium-Fahrzeugen. Angebot gültig bis Ende des Monats.' })}
                </p>
                <Link to={`/${lang}/search`}>
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6 py-2.5 font-bold text-sm shadow-lg group">
                    {t('hero.promoBtn', { defaultValue: 'Angebote entdecken' })}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Floating stats mini cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-card rounded-2xl shadow-xl px-5 py-3 border border-border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">500+</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{t('hero.carsInStock', { defaultValue: 'Fahrzeuge auf Lager' })}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="absolute -top-4 -right-4 bg-card rounded-2xl shadow-xl px-5 py-3 border border-border"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">48h</p>
                    <p className="text-[10px] text-muted-foreground font-medium">{t('hero.fastDelivery', { defaultValue: 'Schnelle Lieferung' })}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shield, RefreshCw, CheckCircle, Car as CarIcon, CreditCard, BarChart3, Wrench, ChevronRight, Star, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VehicleCard from '@/components/VehicleCard';
import { mockVehicles, popularBrands, categoryTypes } from '@/data/mockVehicles';
import heroImage from '@/assets/hero-showroom.jpg';
import promoImg1 from '@/assets/promo-slide1.jpg';
import promoImg2 from '@/assets/promo-slide2.jpg';
import promoImg3 from '@/assets/promo-slide3.jpg';
import promoImg4 from '@/assets/promo-slide4.jpg';
import catBerline from '@/assets/cat-berline.jpg';
import catBreak from '@/assets/cat-break.jpg';
import catSuv from '@/assets/cat-suv.jpg';
import catUtilitaire from '@/assets/cat-utilitaire.jpg';
import cat4x4 from '@/assets/cat-4x4.jpg';
import catCabriolet from '@/assets/cat-cabriolet.jpg';
import catMonospace from '@/assets/cat-monospace.jpg';
import catCoupe from '@/assets/cat-coupe.jpg';
import brandAudi from '@/assets/brand-audi.png';
import brandBmw from '@/assets/brand-bmw.png';
import brandCitroen from '@/assets/brand-citroen.png';
import brandDacia from '@/assets/brand-dacia.png';
import brandFiat from '@/assets/brand-fiat.png';
import brandFord from '@/assets/brand-ford.png';
import brandHonda from '@/assets/brand-honda.png';
import brandHyundai from '@/assets/brand-hyundai.png';
import brandKia from '@/assets/brand-kia.png';
import brandMercedes from '@/assets/brand-mercedes.png';
import brandPeugeot from '@/assets/brand-peugeot.png';
import brandRenault from '@/assets/brand-renault.png';
import brandToyota from '@/assets/brand-toyota.png';
import brandVolkswagen from '@/assets/brand-volkswagen.png';
import brandVolvo from '@/assets/brand-volvo.png';
import brandTesla from '@/assets/brand-tesla.png';
import brandNissan from '@/assets/brand-nissan.png';
import brandOpel from '@/assets/brand-opel.png';
import brandSeat from '@/assets/brand-seat.png';
import brandSkoda from '@/assets/brand-skoda.png';
import brandDs from '@/assets/brand-ds.png';
import brandJeep from '@/assets/brand-jeep.png';
import brandMazda from '@/assets/brand-mazda.png';
import brandMitsubishi from '@/assets/brand-mitsubishi.png';
import brandSuzuki from '@/assets/brand-suzuki.png';
import brandLandrover from '@/assets/brand-landrover.png';
import brandAlfaromeo from '@/assets/brand-alfaromeo.png';
import brandJaguar from '@/assets/brand-jaguar.png';
import brandPorsche from '@/assets/brand-porsche.png';
import brandMini from '@/assets/brand-mini.png';
import brandLexus from '@/assets/brand-lexus.png';
import brandInfiniti from '@/assets/brand-infiniti.png';
import brandMaserati from '@/assets/brand-maserati.png';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const BRAND_SCROLL_SPEED = 30; // px per second

const Index = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'maintain'>('buy');
  const [promoSlide, setPromoSlide] = useState(0);
  const [plateNumber, setPlateNumber] = useState('');
  const [showFullForm, setShowFullForm] = useState(false);
  const [plateForm, setPlateForm] = useState({ vin: '', brand: '', mileage: '' });

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPromoSlide((prev) => (prev + 1) % 4);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const currentPlate = plateFormats[lang] || plateFormats.fr;

  const categoryIcons: Record<string, string> = {
    berline: '🚗', break: '🚙', suv: '🏔️', utilitaire: '🚐', '4x4': '🏔️', cabriolet: '🏎️', monospace: '🚌', coupé: '🏎️',
  };

  const categoryImages: Record<string, string> = {
    berline: catBerline, break: catBreak, suv: catSuv, utilitaire: catUtilitaire,
    '4x4': cat4x4, cabriolet: catCabriolet, monospace: catMonospace, 'coupé': catCoupe,
  };

  const brandImages: Record<string, string> = {
    Audi: brandAudi, BMW: brandBmw, Citroën: brandCitroen, Dacia: brandDacia,
    Fiat: brandFiat, Ford: brandFord, Honda: brandHonda, Hyundai: brandHyundai,
    Kia: brandKia, Mercedes: brandMercedes, Peugeot: brandPeugeot, Renault: brandRenault,
    Toyota: brandToyota, Volkswagen: brandVolkswagen, Volvo: brandVolvo, Tesla: brandTesla,
    Nissan: brandNissan, Opel: brandOpel, Seat: brandSeat, Skoda: brandSkoda,
    DS: brandDs, Jeep: brandJeep, Mazda: brandMazda, Mitsubishi: brandMitsubishi,
    Suzuki: brandSuzuki, 'Land Rover': brandLandrover, 'Alfa Romeo': brandAlfaromeo,
    Jaguar: brandJaguar, Porsche: brandPorsche, Mini: brandMini, Lexus: brandLexus,
    Infiniti: brandInfiniti, Maserati: brandMaserati,
  };

  const promoSlides = [
    {
      image: promoImg1,
      overlay: 'bg-gradient-to-r from-[hsl(10,70%,55%)/0.75] to-transparent',
      topLabel: t('promo.slide1TopLabel'),
      bigText: '-35%',
      midText: t('promo.slide1MidText'),
      subText: t('promo.slide1SubText'),
      cta: t('promo.slide1Cta'),
      ctaLink: `/${lang}/search`,
      footnote: t('promo.legalNote'),
      badge: t('promo.goodDeals'),
    },
    {
      image: promoImg2,
      overlay: 'bg-gradient-to-r from-[hsl(170,45%,45%)/0.8] to-transparent',
      topLabel: '208 Active essence 100 ch',
      bigText: '189 €',
      midText: t('promo.slide2MidText'),
      subText: t('promo.slide2SubText'),
      cta: t('promo.slide2Cta'),
      ctaLink: `/${lang}/search?brand=Peugeot`,
      footnote: t('promo.legalNoteFull'),
      badge: t('promo.goodDeals'),
      extraBadge: t('promo.noDeposit'),
    },
    {
      image: promoImg3,
      overlay: 'bg-gradient-to-r from-[hsl(0,0%,95%)/0.85] to-[hsl(0,0%,95%)/0.3]',
      topLabel: '',
      bigText: '',
      midText: t('promo.slide3Title'),
      subText: t('promo.slide3Sub'),
      cta: t('promo.slide3Cta'),
      ctaLink: `/${lang}/services`,
      dark: true,
    },
    {
      image: promoImg4,
      overlay: 'bg-gradient-to-r from-[hsl(215,35%,25%)/0.8] to-[hsl(215,35%,25%)/0.3]',
      topLabel: '',
      bigText: '',
      midText: t('promo.slide4Title'),
      subText: '',
      cta: t('promo.slide4Cta'),
      ctaLink: `/${lang}/cgv`,
    },
  ];

  const reviews = [
    { name: 'Thomas M.', rating: 5, text: t('reviews.review1'), date: '15.12.2025' },
    { name: 'Sophie L.', rating: 5, text: t('reviews.review2'), date: '22.11.2025' },
    { name: 'Marc D.', rating: 4, text: t('reviews.review3'), date: '08.10.2025' },
  ];

  return (
    <div>
      {/* HERO — autosphere style */}
      <section className="relative h-[500px] md:h-[540px] overflow-hidden">
        <img src={heroImage} alt="MCD AUTO Showroom" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          {activeTab === 'buy' && (
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-2xl md:text-4xl lg:text-[2.6rem] font-heading font-bold text-primary-foreground max-w-4xl leading-tight"
            >
              {t('hero.title')}
            </motion.h1>
          )}

          {/* Tabs — Acheter / Vendre / Entretenir */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-6 flex"
          >
            {[
              { key: 'buy' as const, label: t('nav.buy'), to: `/${lang}/search` },
              { key: 'sell' as const, label: t('nav.sell'), to: `/${lang}/contact` },
              { key: 'maintain' as const, label: t('nav.maintain'), to: `/${lang}/services` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 md:px-10 py-2.5 text-sm font-medium border transition-colors ${
                  activeTab === tab.key
                    ? 'bg-card text-foreground border-card rounded-full'
                    : 'text-primary-foreground/80 border-transparent hover:text-primary-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Tab content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-4 w-full max-w-xl"
          >
            {activeTab === 'buy' ? (
              <>
                <div className="flex w-full">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={t('hero.searchPlaceholder')}
                    className="rounded-r-none h-12 bg-card text-foreground border-0 text-base flex-1"
                  />
                  <Button onClick={handleSearch} className="rounded-l-none h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                    <Search className="w-5 h-5 mr-2" />
                    {t('hero.searchButton')}
                  </Button>
                </div>
                <Link to={`/${lang}/search`} className="inline-block mt-3 text-sm text-primary-foreground/80 underline hover:text-primary-foreground">
                  {t('featured.seeAll')}
                </Link>
              </>
            ) : (
              <div className="space-y-3">
                {/* Plate input row */}
                <div className="flex items-stretch w-full">
                  <div className="flex items-center gap-1 bg-[hsl(220,60%,45%)] text-white px-3 rounded-l-lg text-sm font-bold">
                    <span className="text-xs">{currentPlate.flag}</span>
                    <span>{currentPlate.country}</span>
                  </div>
                  <Input
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder={currentPlate.placeholder}
                    className="rounded-none h-12 bg-card text-foreground border-0 text-base flex-1 text-center font-mono tracking-widest uppercase"
                  />
                  <Button
                    onClick={handlePlateSubmit}
                    className="rounded-l-none h-12 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-r-lg"
                  >
                    {activeTab === 'sell' ? t('hero.estimate') : 'OK'}
                  </Button>
                </div>

                {/* Links below plate */}
                <div className="flex items-center justify-center gap-2 text-sm text-primary-foreground/80">
                  <button
                    onClick={() => setShowFullForm(!showFullForm)}
                    className="underline hover:text-primary-foreground"
                  >
                    {t('hero.unknownPlate')}
                  </button>
                </div>

                {/* Expanded form */}
                {showFullForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-card/95 backdrop-blur-sm rounded-xl p-4 space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">{t('hero.vinLabel')}</label>
                        <Input
                          value={plateForm.vin}
                          onChange={(e) => setPlateForm({ ...plateForm, vin: e.target.value })}
                          placeholder={t('hero.vinPlaceholder')}
                          className="h-10 text-sm bg-secondary border-0 uppercase font-mono"
                          maxLength={17}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">{t('hero.brandLabel')}</label>
                        <Input
                          value={plateForm.brand}
                          onChange={(e) => setPlateForm({ ...plateForm, brand: e.target.value })}
                          placeholder={t('hero.brandPlaceholder')}
                          className="h-10 text-sm bg-secondary border-0"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-foreground mb-1 block">{t('hero.mileageLabel')}</label>
                        <Input
                          type="number"
                          value={plateForm.mileage}
                          onChange={(e) => setPlateForm({ ...plateForm, mileage: e.target.value })}
                          placeholder={t('hero.mileagePlaceholder')}
                          className="h-10 text-sm bg-secondary border-0"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handlePlateSubmit} className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">
                          {activeTab === 'sell' ? t('hero.estimate') : t('hero.bookAppointment')}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* PROMO CAROUSEL — autosphere style */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="relative">
            {(() => {
              const slide = promoSlides[promoSlide];
              const isDark = slide.dark;
              return (
                <div className="rounded-2xl overflow-hidden h-52 md:h-64 flex items-stretch relative">
                  <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 ${slide.overlay}`} />
                  <div className="flex-1 flex flex-col justify-center px-6 md:px-12 py-6 z-10 relative">
                    {slide.topLabel && (
                      <span className={`text-xs md:text-sm font-semibold mb-1 ${isDark ? 'text-foreground' : 'text-white/90'}`}>
                        {slide.topLabel}
                      </span>
                    )}
                    {slide.bigText && (
                      <div className={`text-5xl md:text-7xl font-heading font-extrabold leading-none ${isDark ? 'text-foreground' : 'text-white'}`}>
                        {slide.bigText}
                      </div>
                    )}
                    <div className={`text-lg md:text-2xl font-heading font-bold mt-1 ${isDark ? 'text-primary' : 'text-white'}`}>
                      {slide.midText}
                    </div>
                    {slide.subText && (
                      <p className={`text-xs md:text-sm mt-1 ${isDark ? 'text-muted-foreground' : 'text-white/80'}`}>
                        {slide.subText}
                      </p>
                    )}
                    {slide.extraBadge && (
                      <span className="mt-2 inline-block w-fit px-3 py-1 rounded-md bg-[hsl(142,60%,80%)] text-[hsl(142,50%,20%)] text-xs font-bold uppercase">
                        {slide.extraBadge}
                      </span>
                    )}
                    {slide.footnote && (
                      <span className={`text-[10px] mt-2 underline ${isDark ? 'text-muted-foreground' : 'text-white/60'}`}>
                        {slide.footnote}
                      </span>
                    )}
                  </div>
                  {slide.badge && (
                    <div className="absolute top-4 right-4 md:top-6 md:right-8 text-right">
                      <span className="text-white font-heading font-extrabold text-sm md:text-lg uppercase leading-tight block">
                        {slide.badge}
                      </span>
                      <span className="text-white/70 text-xs font-medium">MCD AUTO</span>
                    </div>
                  )}
                  <div className="absolute bottom-5 right-5 md:bottom-8 md:right-10">
                    <Link to={slide.ctaLink}>
                      <Button
                        className={`rounded-full px-6 py-2.5 font-heading font-bold text-sm shadow-lg ${
                          isDark
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-white text-foreground hover:bg-white/90'
                        }`}
                      >
                        {slide.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })()}
            <button onClick={() => setPromoSlide((promoSlide - 1 + promoSlides.length) % promoSlides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card shadow-md flex items-center justify-center hover:bg-muted z-20">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setPromoSlide((promoSlide + 1) % promoSlides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card shadow-md flex items-center justify-center hover:bg-muted z-20">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex justify-center gap-2 mt-4">
              {promoSlides.map((_, i) => (
                <button key={i} onClick={() => setPromoSlide(i)} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === promoSlide ? 'bg-primary' : 'bg-border'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP — autosphere style (horizontal) */}
      <section className="border-y">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-around py-5 gap-4">
          {[
            { icon: RefreshCw, text: t('trust.reconditioned') },
            { icon: Shield, text: t('trust.satisfaction') },
            { icon: CheckCircle, text: t('trust.inspection') },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <item.icon className="w-7 h-7 text-primary shrink-0" />
              <span className="text-sm font-semibold">{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ACTION CARDS — "Que souhaitez-vous faire ?" */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8">{t('actions.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Search, title: t('actions.searchVehicle'), desc: t('actions.searchVehicleDesc'), to: `/${lang}/search` },
              { icon: CreditCard, title: t('actions.finance'), desc: t('actions.financeDesc'), to: `/${lang}/services` },
              { icon: BarChart3, title: t('actions.estimate'), desc: t('actions.estimateDesc'), to: `/${lang}/contact` },
              { icon: Wrench, title: t('actions.maintenance'), desc: t('actions.maintenanceDesc'), to: `/${lang}/services` },
            ].map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={item.to} className="block p-5 bg-card rounded-xl border card-hover group">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3 group-hover:bg-primary/5 transition-colors">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES — horizontal scroll with images */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-8">{t('categories.title')}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-none">
            {categoryTypes.map((cat) => {
              const labelKey = cat === '4x4' ? 'offroad' : cat === 'coupé' ? 'coupe' : cat;
              return (
                <Link
                  key={cat}
                  to={`/${lang}/search?category=${cat}`}
                  className="shrink-0 flex flex-col items-center gap-3 w-32 group"
                >
                  <div className="w-28 h-28 rounded-2xl bg-card border overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={categoryImages[cat]} alt={t(`categories.${labelKey}`, cat)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <span className="text-sm font-semibold text-center capitalize">{t(`categories.${labelKey}`, cat)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold">{t('featured.title')}</h2>
            <Link to={`/${lang}/search`} className="flex items-center gap-1 link-primary font-medium text-sm hover:underline">
              {t('featured.seeAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {mockVehicles.filter(v => v.status === 'published').slice(0, 8).map((vehicle, i) => (
              <motion.div key={vehicle.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <VehicleCard vehicle={vehicle} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR BRANDS — infinite auto-scroll carousel */}
      <section className="section-padding bg-secondary overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-8">{t('brands.title')}</h2>
        </div>
        <div className="relative w-full">
          {/* Fade edges */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-secondary to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-secondary to-transparent" />
          <div
            className="flex gap-4 animate-brand-scroll hover:[animation-play-state:paused]"
            style={{ width: 'max-content' }}
          >
            {/* Duplicate list twice for seamless loop */}
            {[...popularBrands, ...popularBrands].map((brand, i) => (
              <Link
                key={`${brand}-${i}`}
                to={`/${lang}/search?brand=${brand}`}
                className="shrink-0 w-24 h-24 md:w-28 md:h-28 flex flex-col items-center justify-center bg-card rounded-xl border card-hover overflow-hidden group"
              >
                <img
                  src={brandImages[brand] || ''}
                  alt={brand}
                  className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-8">{t('reviews.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((review, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="p-6 bg-card rounded-xl border">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">"{review.text}"</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-heading font-semibold text-sm">{review.name}</span>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

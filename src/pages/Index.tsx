import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { Search, Shield, RefreshCw, CheckCircle, Car as CarIcon, CreditCard, BarChart3, Wrench, ChevronRight, Star, ArrowRight, ChevronLeft, ChevronRight as ChevronRightIcon, Quote, Sparkles, TrendingUp, Users, Award, Clock } from 'lucide-react';
import actionSearchImg from '@/assets/action-search.jpg';
import actionFinanceImg from '@/assets/action-finance.jpg';
import actionEstimateImg from '@/assets/action-estimate.jpg';
import actionMaintenanceImg from '@/assets/action-maintenance.jpg';
import reviewImg1 from '@/assets/review-1.jpeg';
import reviewImg2 from '@/assets/review-2.jpeg';
import reviewImg3 from '@/assets/review-3.jpeg';
import reviewImg4 from '@/assets/review-4.jpeg';
import reviewImg5 from '@/assets/review-5.jpeg';
import reviewImg6 from '@/assets/review-6.jpeg';
import reviewImg7 from '@/assets/review-7.jpeg';
import reviewImg8 from '@/assets/review-8.jpeg';
import reviewImg9 from '@/assets/review-9.jpeg';
import reviewImg10 from '@/assets/review-10.jpeg';
import reviewImg11 from '@/assets/review-11.jpeg';
import reviewImg12 from '@/assets/review-12.jpeg';
import reviewImg13 from '@/assets/review-13.jpeg';
import reviewImg14 from '@/assets/review-14.jpeg';
import reviewImg15 from '@/assets/review-15.jpeg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VehicleCard from '@/components/VehicleCard';
import { popularBrands, categoryTypes } from '@/data/mockVehicles';
import { useVehicles } from '@/hooks/useVehicles';
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

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── Animated Counter ── */
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count.toLocaleString('de-DE')}{suffix}</span>;
};

const FeaturedVehiclesSection = ({ lang, t }: { lang: string; t: any }) => {
  const { data: vehicles = [] } = useVehicles({ limit: 8 });

  if (vehicles.length === 0) return null;

  return (
    <section className="section-padding">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block"
            >
              {t('featured.subtitle', { defaultValue: 'Notre sélection' })}
            </motion.span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">{t('featured.title')}</h2>
          </div>
          <Link to={`/${lang}/search`} className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-sm px-5 py-2.5 rounded-full transition-colors">
            {t('featured.seeAll')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vehicles.map((vehicle, i) => (
            <motion.div key={vehicle.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <VehicleCard vehicle={vehicle} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'maintain'>('buy');
  const [promoSlide, setPromoSlide] = useState(0);
  const [plateNumber, setPlateNumber] = useState('');
  const [showFullForm, setShowFullForm] = useState(false);
  const [plateForm, setPlateForm] = useState({ vin: '', brand: '', mileage: '' });

  // Read hash and set active tab
  useEffect(() => {
    const hash = location.hash.slice(1) as 'buy' | 'sell' | 'maintain';
    if (hash === 'sell' || hash === 'maintain') {
      setActiveTab(hash);
    } else {
      setActiveTab('buy');
    }
  }, [location.hash]);

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

  const [reviewPage, setReviewPage] = useState(0);

  const reviews = [
    { name: 'Hans W.', rating: 5, text: t('reviews.review1'), date: '15.12.2025', lang: 'DE', avatar: reviewImg1 },
    { name: 'Carlos R.', rating: 5, text: '¡Increíble servicio! Compré un BMW Serie 3 y todo el proceso fue muy profesional. La entrega fue puntual y el coche estaba impecable.', date: '03.01.2026', lang: 'ES', avatar: reviewImg2 },
    { name: 'Alejandro P.', rating: 5, text: t('reviews.review2'), date: '22.11.2025', lang: 'DE', avatar: reviewImg3 },
    { name: 'María G.', rating: 5, text: 'Muy contenta con mi compra. El equipo de MCD AUTO me ayudó a encontrar el coche perfecto para mi familia. Recomiendo 100%.', date: '28.12.2025', lang: 'ES', avatar: reviewImg4 },
    { name: 'Brigitte K.', rating: 4, text: t('reviews.review3'), date: '08.10.2025', lang: 'DE', avatar: reviewImg5 },
    { name: 'Helga S.', rating: 5, text: 'Sehr zufrieden mit dem Kauf. Das Auto war genau wie beschrieben und die Lieferung war schnell. Kann MCD AUTO nur empfehlen!', date: '05.01.2026', lang: 'DE', avatar: reviewImg6 },
    { name: 'Sophie & Antoine D.', rating: 5, text: "Professionalità e trasparenza. Il team di MCD AUTO ci ha seguito in ogni fase dell'acquisto. Auto in perfette condizioni.", date: '10.12.2025', lang: 'IT', avatar: reviewImg7 },
    { name: 'Ana C.', rating: 5, text: 'Muito satisfeita com a minha compra. A equipa foi muito profissional e o carro chegou em perfeitas condições a Lisboa.', date: '25.12.2025', lang: 'PT', avatar: reviewImg8 },
    { name: 'Céline M.', rating: 5, text: 'Comprei um Renault Mégane e estou muito contente. Todo o processo foi transparente e a entrega foi feita no prazo combinado.', date: '14.09.2025', lang: 'PT', avatar: reviewImg9 },
    { name: 'Laura B.', rating: 4, text: 'Ottima esperienza di acquisto. Prezzo giusto e veicolo consegnato come descritto. Lo consiglio vivamente a tutti.', date: '05.11.2025', lang: 'IT', avatar: reviewImg10 },
    { name: 'Giovanni T.', rating: 5, text: 'Servizio eccellente! Ho acquistato una Mercedes Classe C e sono rimasto molto soddisfatto. Consegna rapida in Italia.', date: '20.01.2026', lang: 'IT', avatar: reviewImg11 },
    { name: 'João S.', rating: 5, text: 'Excelente experiência! Comprei um Volkswagen Golf e o serviço foi impecável do início ao fim. Entrega rápida em Portugal.', date: '12.01.2026', lang: 'PT', avatar: reviewImg12 },
    { name: 'Pedro F.', rating: 4, text: 'Bom serviço e preços justos. O transporte para Portugal foi rápido. Recomendo a todos os que procuram um bom carro.', date: '30.10.2025', lang: 'PT', avatar: reviewImg13 },
    { name: 'Pablo N.', rating: 5, text: 'Fantástico. Encontré el coche que buscaba a un precio excelente. El transporte a Barcelona fue perfecto y sin sorpresas.', date: '02.02.2026', lang: 'ES', avatar: reviewImg14 },
    { name: 'Luca M.', rating: 5, text: "Ho comprato un'Audi A4 da MCD AUTO. Processo semplice, documentazione completa e trasporto in Italia senza problemi.", date: '18.09.2025', lang: 'IT', avatar: reviewImg15 },
  ];

  const reviewsPerPage = 3;
  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage);
  const visibleReviews = reviews.slice(reviewPage * reviewsPerPage, (reviewPage + 1) * reviewsPerPage);

  const stats = [
    { icon: CarIcon, value: 1200, suffix: '+', label: t('stats.vehiclesAvailable', { defaultValue: 'Fahrzeuge verfügbar' }) },
    { icon: Users, value: 1200, suffix: '+', label: t('stats.happyClients', { defaultValue: 'Zufriedene Kunden' }) },
    { icon: Award, value: 15, suffix: '+', label: t('stats.yearsExperience', { defaultValue: 'Jahre Erfahrung' }) },
    { icon: Clock, value: 48, suffix: 'h', label: t('stats.deliveryTime', { defaultValue: 'Lieferzeit' }) },
  ];

  return (
    <div>
      {/* ══════════════ HERO ══════════════ */}
      <section className={`relative overflow-hidden ${activeTab === 'buy' ? 'h-[540px] md:h-[600px]' : 'min-h-[640px] md:min-h-[700px]'}`}>
        <img src={heroImage} alt="MCD AUTO Showroom" className="absolute inset-0 w-full h-full object-cover scale-105" loading="eager" />
        <div className="absolute inset-0 hero-gradient" />
        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-56 h-56 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className={`relative z-10 container mx-auto px-4 h-full flex flex-col items-center text-center ${activeTab === 'buy' ? 'justify-center' : 'justify-start pt-24 md:pt-28'}`}>
          {activeTab === 'buy' && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/20 rounded-full px-5 py-2 mb-6"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-primary-foreground">{t('hero.badge', { defaultValue: 'Geprüft & Garantiert' })}</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl md:text-5xl lg:text-[3.2rem] font-heading font-bold text-primary-foreground max-w-4xl leading-tight"
              >
                {t('hero.title')}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-4 text-base md:text-lg text-primary-foreground/70 max-w-2xl"
              >
                {t('hero.subtitle', { defaultValue: 'Finden Sie Ihr Traumfahrzeug aus über 500 geprüften Gebrauchtwagen.' })}
              </motion.p>
            </>
          )}

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-6 flex bg-primary-foreground/10 backdrop-blur-md rounded-full p-1 border border-primary-foreground/15"
          >
            {[
              { key: 'buy' as const, label: t('nav.buy') },
              { key: 'sell' as const, label: t('nav.sell') },
              { key: 'maintain' as const, label: t('nav.maintain') },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 md:px-10 py-2.5 text-sm font-semibold transition-all duration-300 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-card text-foreground shadow-lg'
                    : 'text-primary-foreground/80 hover:text-primary-foreground'
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
            className="mt-5 w-full max-w-xl"
          >
            {activeTab === 'buy' ? (
              <>
                <div className="flex w-full shadow-2xl rounded-xl overflow-hidden">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={t('hero.searchPlaceholder')}
                    className="rounded-r-none rounded-l-xl h-14 bg-card text-foreground border-0 text-base flex-1 pl-5"
                  />
                  <Button onClick={handleSearch} className="rounded-l-none rounded-r-xl h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-base">
                    <Search className="w-5 h-5 mr-2" />
                    {t('hero.searchButton')}
                  </Button>
                </div>
                <Link to={`/${lang}/search`} className="inline-block mt-4 text-sm text-primary-foreground/80 underline hover:text-primary-foreground transition-colors">
                  {t('featured.seeAll')}
                </Link>
              </>
            ) : (
              <div className="space-y-3">
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
                    className="rounded-l-none h-14 px-6 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                  >
                    {activeTab === 'sell' ? t('hero.estimate') : 'OK'}
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-primary-foreground/80">
                  <button onClick={() => setShowFullForm(!showFullForm)} className="underline hover:text-primary-foreground">
                    {t('hero.unknownPlate')}
                  </button>
                </div>
                {showFullForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="glass-card rounded-xl p-4 space-y-3"
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

      {/* ══════════════ PROMO CAROUSEL ══════════════ */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="relative">
            {(() => {
              const slide = promoSlides[promoSlide];
              const isDark = slide.dark;
              return (
                <div className="rounded-2xl overflow-hidden h-56 md:h-72 flex items-stretch relative shadow-xl">
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
                      <Button className={`rounded-full px-6 py-2.5 font-heading font-bold text-sm shadow-lg ${isDark ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-white text-foreground hover:bg-white/90'}`}>
                        {slide.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })()}
            <button onClick={() => setPromoSlide((promoSlide - 1 + promoSlides.length) % promoSlides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-card z-20 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setPromoSlide((promoSlide + 1) % promoSlides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-card z-20 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <div className="flex justify-center gap-2 mt-5">
              {promoSlides.map((_, i) => (
                <button key={i} onClick={() => setPromoSlide(i)} className={`h-2 rounded-full transition-all duration-300 ${i === promoSlide ? 'bg-primary w-8' : 'bg-border w-2.5'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* ══════════════ FEATURED VEHICLES ══════════════ */}
      <FeaturedVehiclesSection lang={lang} t={t} />

      {/* ══════════════ ACTION CARDS — Premium overlay style ══════════════ */}
      <section className="section-padding bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <motion.span
              initial={{ opacity: 0, y: -5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block"
            >
              {t('actions.subtitle', { defaultValue: 'Unsere Dienstleistungen' })}
            </motion.span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">{t('actions.title')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { img: actionSearchImg, title: t('actions.searchVehicle'), desc: t('actions.searchVehicleDesc'), to: `/${lang}/search`, icon: Search },
              { img: actionFinanceImg, title: t('actions.finance'), desc: t('actions.financeDesc'), to: `/${lang}/services/financing`, icon: CreditCard },
              { img: actionEstimateImg, title: t('actions.estimate'), desc: t('actions.estimateDesc'), to: `/${lang}/services/estimation`, icon: BarChart3 },
              { img: actionMaintenanceImg, title: t('actions.maintenance'), desc: t('actions.maintenanceDesc'), to: `/${lang}/services/maintenance`, icon: Wrench },
            ].map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={item.to} className="group block relative rounded-2xl overflow-hidden h-64 shadow-lg hover:shadow-2xl transition-all duration-300">
                  <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(215,60%,10%)/0.9] via-[hsl(215,60%,10%)/0.4] to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/90 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-heading font-bold text-white text-base">{item.title}</h3>
                    <p className="text-xs text-white/70 mt-1 line-clamp-2">{item.desc}</p>
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CATEGORIES ══════════════ */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <motion.span
              initial={{ opacity: 0, y: -5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block"
            >
              {t('categories.subtitle', { defaultValue: 'Kategorien' })}
            </motion.span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">{t('categories.title')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categoryTypes.map((cat, i) => {
              const labelKey = cat === '4x4' ? 'offroad' : cat === 'coupé' ? 'coupe' : cat;
              return (
                <motion.div key={cat} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                  <Link
                    to={`/${lang}/search?category=${cat}`}
                    className="group block relative rounded-2xl overflow-hidden h-40 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <img src={categoryImages[cat]} alt={t(`categories.${labelKey}`, cat)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(215,60%,10%)/0.8] via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <span className="text-sm font-heading font-bold text-white capitalize">{t(`categories.${labelKey}`, cat)}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ POPULAR BRANDS ══════════════ */}
      <section className="section-padding bg-secondary/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">{t('brands.title')}</h2>
        </div>
        <div className="relative w-full">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-background to-transparent" />
          <div className="flex gap-4 animate-brand-scroll hover:[animation-play-state:paused]" style={{ width: 'max-content' }}>
            {[...popularBrands, ...popularBrands].map((brand, i) => (
              <Link
                key={`${brand}-${i}`}
                to={`/${lang}/search?brand=${brand}`}
                className="shrink-0 w-24 h-24 md:w-28 md:h-28 flex flex-col items-center justify-center bg-card rounded-2xl border shadow-sm hover:shadow-lg overflow-hidden group transition-all duration-300"
              >
                <img src={brandImages[brand] || ''} alt={brand} className="w-full h-full object-contain p-2.5 group-hover:scale-110 transition-transform duration-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section className="relative overflow-hidden">
        <div className="premium-gradient py-16 md:py-20">
          <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Sparkles className="w-8 h-8 text-accent mx-auto mb-4" />
              <h2 className="text-2xl md:text-4xl font-heading font-bold text-white max-w-2xl mx-auto leading-tight">
                {t('cta.title', { defaultValue: 'Bereit, Ihr nächstes Auto zu finden?' })}
              </h2>
              <p className="mt-4 text-white/70 max-w-lg mx-auto">
                {t('cta.subtitle', { defaultValue: 'Über 500 geprüfte Fahrzeuge warten auf Sie. Alle mit Garantie und Rückgaberecht.' })}
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={`/${lang}/search`}>
                  <Button className="bg-white text-foreground hover:bg-white/90 font-bold px-8 py-6 text-base rounded-full shadow-xl">
                    <Search className="w-5 h-5 mr-2" />
                    {t('cta.searchButton', { defaultValue: 'Fahrzeuge durchsuchen' })}
                  </Button>
                </Link>
                <Link to={`/${lang}/contact`}>
                  <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 font-bold px-8 py-6 text-base rounded-full">
                    {t('cta.contactButton', { defaultValue: 'Kontakt aufnehmen' })}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ REVIEWS ══════════════ */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <motion.span
              initial={{ opacity: 0, y: -5 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block"
            >
              {t('reviews.subtitle', { defaultValue: 'Kundenstimmen' })}
            </motion.span>
            <h2 className="text-2xl md:text-3xl font-heading font-bold">{t('reviews.title')}</h2>
          </div>
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visibleReviews.map((review, i) => (
                <motion.div key={`${reviewPage}-${i}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
                  <div className="relative p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                    {/* Quote decoration */}
                    <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-0.5">
                        {Array.from({ length: review.rating }).map((_, j) => (
                          <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{review.lang}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic">"{review.text}"</p>
                    <div className="mt-5 pt-4 border-t flex items-center gap-3">
                      {review.avatar ? (
                        <img src={review.avatar} alt={review.name} className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-primary/20" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary">{review.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="font-heading font-bold text-sm block">{review.name}</span>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalReviewPages }).map((_, i) => (
                <button key={i} onClick={() => setReviewPage(i)} className={`h-2 rounded-full transition-all duration-300 ${i === reviewPage ? 'bg-primary w-8' : 'bg-border w-2.5'}`} />
              ))}
            </div>
            {reviewPage > 0 && (
              <button onClick={() => setReviewPage(reviewPage - 1)} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-muted z-20 hidden md:flex">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {reviewPage < totalReviewPages - 1 && (
              <button onClick={() => setReviewPage(reviewPage + 1)} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-muted z-20 hidden md:flex">
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════ TRUST STRIP ══════════════ */}
      <section className="border-y bg-secondary/50">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-around py-6 gap-5">
          {[
            { icon: RefreshCw, text: t('trust.reconditioned') },
            { icon: Shield, text: t('trust.satisfaction') },
            { icon: CheckCircle, text: t('trust.inspection') },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-semibold">{item.text}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════ ANIMATED STATS ══════════════ */}
      <section className="premium-gradient py-16 md:py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                className="text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-heading font-extrabold text-white">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="mt-2 text-sm text-white/70 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;

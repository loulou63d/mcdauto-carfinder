import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shield, RefreshCw, CheckCircle, Car as CarIcon, CreditCard, BarChart3, Wrench, ChevronRight, Star, ArrowRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VehicleCard from '@/components/VehicleCard';
import { mockVehicles, popularBrands, categoryTypes } from '@/data/mockVehicles';
import heroImage from '@/assets/hero-showroom.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const Index = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'maintain'>('buy');
  const [promoSlide, setPromoSlide] = useState(0);

  const handleSearch = () => {
    navigate(`/${lang}/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  const categoryIcons: Record<string, string> = {
    berline: '🚗', break: '🚙', suv: '🏔️', utilitaire: '🚐', '4x4': '🏔️', cabriolet: '🏎️', monospace: '🚌', coupé: '🏎️',
  };

  const promoSlides = [
    {
      bg: 'bg-gradient-to-br from-[hsl(10,80%,65%)] to-[hsl(10,70%,55%)]',
      topLabel: t('promo.slide1TopLabel'),
      bigText: '-35%',
      midText: t('promo.slide1MidText'),
      subText: t('promo.slide1SubText'),
      cta: t('promo.slide1Cta'),
      footnote: t('promo.legalNote'),
      badge: t('promo.goodDeals'),
    },
    {
      bg: 'bg-gradient-to-br from-[hsl(170,50%,60%)] to-[hsl(170,45%,50%)]',
      topLabel: '208 Active essence 100 ch',
      bigText: '189 €',
      midText: t('promo.slide2MidText'),
      subText: t('promo.slide2SubText'),
      cta: t('promo.slide2Cta'),
      footnote: t('promo.legalNoteFull'),
      badge: t('promo.goodDeals'),
      extraBadge: t('promo.noDeposit'),
    },
    {
      bg: 'bg-gradient-to-br from-[hsl(220,10%,92%)] to-[hsl(220,10%,85%)]',
      topLabel: '',
      bigText: '',
      midText: t('promo.slide3Title'),
      subText: t('promo.slide3Sub'),
      cta: t('promo.slide3Cta'),
      dark: true,
    },
    {
      bg: 'bg-gradient-to-br from-[hsl(215,30%,35%)] to-[hsl(215,35%,25%)]',
      topLabel: '',
      bigText: '',
      midText: t('promo.slide4Title'),
      subText: '',
      cta: t('promo.slide4Cta'),
    },
  ];

  const reviews = [
    { name: 'Thomas M.', rating: 5, text: 'Excellent service, véhicule conforme à la description. Livraison rapide et équipe très professionnelle.', date: '15.12.2025' },
    { name: 'Sophie L.', rating: 5, text: 'Très satisfaite de mon achat. La garantie 12 mois est un vrai plus. Je recommande vivement.', date: '22.11.2025' },
    { name: 'Marc D.', rating: 4, text: 'Bon rapport qualité/prix. Le processus d\'achat est simple et transparent.', date: '08.10.2025' },
  ];

  return (
    <div>
      {/* HERO — autosphere style */}
      <section className="relative h-[500px] md:h-[540px] overflow-hidden">
        <img src={heroImage} alt="MCD AUTO Showroom" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl md:text-4xl lg:text-[2.6rem] font-heading font-bold text-primary-foreground max-w-4xl leading-tight"
          >
            {t('hero.title')}
          </motion.h1>

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

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-4 flex w-full max-w-xl"
          >
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link to={`/${lang}/search`} className="inline-block mt-3 text-sm text-primary-foreground/80 underline hover:text-primary-foreground">
              {t('featured.seeAll')}
            </Link>
          </motion.div>
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
                  className="shrink-0 flex flex-col items-center gap-3 w-28 group"
                >
                  <div className="w-24 h-24 rounded-2xl bg-card border flex items-center justify-center text-4xl shadow-sm group-hover:shadow-md transition-shadow">
                    {categoryIcons[cat] || '🚗'}
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

      {/* POPULAR BRANDS */}
      <section className="section-padding bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-8">{t('brands.title')}</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {popularBrands.slice(0, 16).map((brand) => (
              <Link
                key={brand}
                to={`/${lang}/search?brand=${brand}`}
                className="flex items-center justify-center p-3 bg-card rounded-xl border card-hover aspect-square"
              >
                <span className="font-heading font-bold text-xs text-center text-foreground">{brand}</span>
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

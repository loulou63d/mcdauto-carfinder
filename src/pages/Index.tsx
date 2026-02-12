import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Shield, RefreshCw, CheckCircle, Car, CreditCard, BarChart3, Wrench, ChevronRight, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VehicleCard from '@/components/VehicleCard';
import { mockVehicles, popularBrands, categoryTypes } from '@/data/mockVehicles';
import heroImage from '@/assets/hero-showroom.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Index = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    navigate(`/${lang}/search${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`);
  };

  const categoryIcons: Record<string, string> = {
    berline: '🚗', break: '🚙', suv: '🚙', utilitaire: '🚐', '4x4': '🏔️', cabriolet: '🏎️', monospace: '🚌', coupé: '🏎️',
  };

  const reviews = [
    { name: 'Thomas M.', rating: 5, text: 'Excellent service, véhicule conforme à la description. Livraison rapide et équipe très professionnelle.', date: '2025-12-15' },
    { name: 'Sophie L.', rating: 5, text: 'Très satisfaite de mon achat. La garantie 12 mois est un vrai plus. Je recommande vivement MCD AUTO.', date: '2025-11-22' },
    { name: 'Marc D.', rating: 4, text: 'Bon rapport qualité/prix. Le processus d\'achat est simple et transparent. Merci à l\'équipe.', date: '2025-10-08' },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[550px] md:h-[600px] overflow-hidden">
        <img src={heroImage} alt="MCD AUTO Showroom" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-3xl md:text-5xl font-heading font-bold text-primary-foreground max-w-4xl leading-tight"
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-4 text-lg text-primary-foreground/80 max-w-2xl"
          >
            {t('hero.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 flex w-full max-w-lg"
          >
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('hero.searchPlaceholder')}
              className="rounded-r-none h-12 bg-background text-foreground border-0 text-base"
            />
            <Button onClick={handleSearch} className="rounded-l-none h-12 px-6 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
              <Search className="w-5 h-5 mr-2" />
              {t('hero.searchButton')}
            </Button>
          </motion.div>

          {/* Nav tabs */}
          <div className="mt-6 flex gap-4">
            {[
              { label: t('nav.buy'), to: `/${lang}/search`, icon: Car },
              { label: t('nav.sell'), to: `/${lang}/contact`, icon: BarChart3 },
              { label: t('nav.maintain'), to: `/${lang}/services`, icon: Wrench },
            ].map((item) => (
              <Link key={item.to} to={item.to} className="flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur rounded-full text-primary-foreground text-sm font-medium hover:bg-primary-foreground/20 transition-colors">
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="py-12 bg-muted">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: t('trust.reconditioned'), desc: t('trust.reconditionedDesc') },
            { icon: RefreshCw, title: t('trust.satisfaction'), desc: t('trust.satisfactionDesc') },
            { icon: CheckCircle, title: t('trust.inspection'), desc: t('trust.inspectionDesc') },
          ].map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="flex items-start gap-4 p-6 bg-card rounded-lg border"
            >
              <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <item.icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ACTION CARDS */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">{t('actions.title')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, title: t('actions.searchVehicle'), desc: t('actions.searchVehicleDesc'), to: `/${lang}/search` },
              { icon: CreditCard, title: t('actions.finance'), desc: t('actions.financeDesc'), to: `/${lang}/services` },
              { icon: BarChart3, title: t('actions.estimate'), desc: t('actions.estimateDesc'), to: `/${lang}/contact` },
              { icon: Wrench, title: t('actions.maintenance'), desc: t('actions.maintenanceDesc'), to: `/${lang}/services` },
            ].map((item, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={item.to} className="block p-6 bg-card rounded-lg border card-hover text-center group">
                  <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/10 transition-colors">
                    <item.icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="font-heading font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section-padding bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">{t('categories.title')}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {categoryTypes.map((cat) => {
              const labelKey = cat === '4x4' ? 'offroad' : cat === 'coupé' ? 'coupe' : cat;
              const catLabel = t(`categories.${labelKey}`, cat);
              return (
                <Link
                  key={cat}
                  to={`/${lang}/search?category=${cat}`}
                  className="shrink-0 flex flex-col items-center gap-2 px-6 py-4 bg-card rounded-lg border card-hover min-w-[120px]"
                >
                  <span className="text-3xl">{categoryIcons[cat] || '🚗'}</span>
                  <span className="text-sm font-medium whitespace-nowrap">{catLabel}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURED VEHICLES */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold">{t('featured.title')}</h2>
            <Link to={`/${lang}/search`} className="flex items-center gap-1 text-accent font-medium text-sm hover:underline">
              {t('featured.seeAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockVehicles.filter(v => v.status === 'published').slice(0, 8).map((vehicle, i) => (
              <motion.div key={vehicle.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <VehicleCard vehicle={vehicle} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR BRANDS */}
      <section className="section-padding bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">{t('brands.title')}</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {popularBrands.slice(0, 16).map((brand) => (
              <Link
                key={brand}
                to={`/${lang}/search?brand=${brand}`}
                className="flex items-center justify-center p-4 bg-card rounded-lg border card-hover aspect-square"
              >
                <span className="font-heading font-semibold text-xs text-center text-primary">{brand}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section-padding">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10">{t('reviews.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="p-6 bg-card rounded-lg border">
                  <div className="flex gap-1 mb-3">
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

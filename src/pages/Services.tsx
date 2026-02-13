import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, BarChart3, Wrench, Shield, Headphones, ChevronRight, RefreshCw } from 'lucide-react';

const Services = () => {
  const { t } = useTranslation();
  const { lang } = useParams();

  const services = [
    { icon: CreditCard, title: t('services.financing'), desc: t('services.financingSubtitle'), to: `/${lang}/services/financing` },
    { icon: BarChart3, title: t('estimation.title'), desc: t('estimation.heroSubtitle'), to: `/${lang}/services/estimation` },
    { icon: Wrench, title: t('maintenancePage.title'), desc: t('maintenancePage.heroSubtitle'), to: `/${lang}/services/maintenance` },
    { icon: RefreshCw, title: t('services.tradein'), desc: t('services.tradeinDesc'), to: `/${lang}/contact` },
    { icon: Shield, title: t('services.warranty'), desc: t('services.warrantyDesc'), to: `/${lang}/contact` },
    { icon: Headphones, title: t('services.afterSales'), desc: t('services.afterSalesDesc'), to: `/${lang}/contact` },
  ];

  return (
    <div>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-heading font-bold">
            {t('services.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            {t('services.heroSubtitle')}
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-4">
            {services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <Link
                  to={s.to}
                  className="flex items-center gap-5 p-5 bg-card rounded-lg border card-hover group"
                >
                  <div className="shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <s.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-base">{s.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{s.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-accent shrink-0 transition-colors" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CreditCard, RefreshCw, Wrench, Shield, Headphones } from 'lucide-react';

const Services = () => {
  const { t } = useTranslation();

  const services = [
    { icon: CreditCard, title: t('services.financing'), desc: t('services.financingDesc') },
    { icon: RefreshCw, title: t('services.tradein'), desc: t('services.tradeinDesc') },
    { icon: Wrench, title: t('services.maintenance'), desc: t('services.maintenanceDesc') },
    { icon: Shield, title: t('services.warranty'), desc: t('services.warrantyDesc') },
    { icon: Headphones, title: t('services.afterSales'), desc: t('services.afterSalesDesc') },
  ];

  return (
    <div>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-heading font-bold">
            {t('services.title')}
          </motion.h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-8">
            {services.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex gap-6 p-6 bg-card rounded-lg border"
              >
                <div className="shrink-0 w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                  <s.icon className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg">{s.title}</h3>
                  <p className="text-muted-foreground mt-2 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;

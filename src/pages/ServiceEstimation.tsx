import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Check, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ServiceEstimation = () => {
  const { t } = useTranslation();
  const { lang } = useParams();

  const steps = [t('estimation.step1'), t('estimation.step2'), t('estimation.step3'), t('estimation.step4')];
  const advantages = [t('estimation.advFree'), t('estimation.advFast'), t('estimation.advFair'), t('estimation.advImmediate'), t('estimation.advDeduction')];
  const criteria = [t('estimation.critBrand'), t('estimation.critMileage'), t('estimation.critCondition'), t('estimation.critEquipment'), t('estimation.critHistory'), t('estimation.critMarket')];

  return (
    <div>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-heading font-bold">
            {t('estimation.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            {t('estimation.heroSubtitle')}
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-5xl space-y-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-muted-foreground leading-relaxed text-lg max-w-3xl">
            {t('estimation.intro')}
          </motion.p>

          {/* Steps */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-heading font-bold mb-4">✅ {t('estimation.howItWorks')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <Card key={i}><CardContent className="p-5"><div className="text-3xl font-bold text-accent/20 mb-2">{i + 1}</div><p className="text-sm font-medium">{step}</p></CardContent></Card>
              ))}
            </div>
          </motion.div>

          {/* Advantages */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-accent" />{t('estimation.advantages')}
            </h2>
            <Card><CardContent className="p-6"><ul className="space-y-3">{advantages.map((a, i) => (<li key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-accent shrink-0 mt-0.5" /><span>{a}</span></li>))}</ul></CardContent></Card>
          </motion.div>

          {/* Criteria */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-accent" />{t('estimation.criteria')}
            </h2>
            <Card className="bg-accent/5 border-accent/20"><CardContent className="p-6"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{criteria.map((c, i) => (<div key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-accent shrink-0 mt-0.5" /><span className="text-sm">{c}</span></div>))}</div></CardContent></Card>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center py-8 space-y-3">
            <h3 className="text-xl font-heading font-bold">{t('estimation.ctaTitle')}</h3>
            <Link to={`/${lang}/contact`}>
              <Button size="lg" className="text-base px-8">{t('estimation.ctaButton')}</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServiceEstimation;

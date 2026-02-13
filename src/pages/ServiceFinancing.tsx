import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Check, Banknote, Truck, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ServiceFinancing = () => {
  const { t } = useTranslation();
  const { lang } = useParams();

  const steps = [t('services.step1'), t('services.step2'), t('services.step3'), t('services.step4')];
  const conditions = [t('services.cond0interest'), t('services.condDuration'), t('services.condFixed'), t('services.condFlexible'), t('services.condNoFees')];
  const importItems = [t('services.importOrigin'), t('services.importWarranty'), t('services.importDelivery'), t('services.importManufacturer'), t('services.importRetraction')];
  const adminItems = [t('services.adminRegistration'), t('services.adminCOC'), t('services.adminNonPledge'), t('services.adminInspection'), t('services.adminServiceBook'), t('services.adminInvoices')];

  return (
    <div>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-heading font-bold">
            {t('services.financing')}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            {t('services.financingSubtitle')}
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-5xl space-y-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-muted-foreground leading-relaxed text-lg max-w-3xl">
            {t('services.financingIntro')}
          </motion.p>

          {/* Steps */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-heading font-bold mb-4">✅ {t('services.howItWorks')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <Card key={i}><CardContent className="p-5"><div className="text-3xl font-bold text-accent/20 mb-2">{i + 1}</div><p className="text-sm font-medium">{step}</p></CardContent></Card>
              ))}
            </div>
          </motion.div>

          {/* Conditions */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-heading font-bold mb-4">💰 {t('services.conditions')}</h2>
            <Card><CardContent className="p-6"><ul className="space-y-3">{conditions.map((c, i) => (<li key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-accent shrink-0 mt-0.5" /><span>{c}</span></li>))}</ul></CardContent></Card>
          </motion.div>

          {/* Payment */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2"><Banknote className="w-5 h-5 text-accent" />{t('services.paymentTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-accent/30"><CardContent className="p-6"><div className="flex items-start gap-3"><ChevronRight className="w-5 h-5 text-accent shrink-0 mt-0.5" /><p>{t('services.paymentCash')}</p></div></CardContent></Card>
              <Card className="border-accent/30"><CardContent className="p-6"><div className="flex items-start gap-3"><ChevronRight className="w-5 h-5 text-accent shrink-0 mt-0.5" /><p>{t('services.paymentInstallments')}</p></div></CardContent></Card>
            </div>
          </motion.div>

          {/* Import & Warranty */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-accent" />{t('services.importTitle')}</h2>
            <Card><CardContent className="p-6"><ul className="space-y-3">{importItems.map((item, i) => (<li key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-accent shrink-0 mt-0.5" /><span>{item}</span></li>))}</ul></CardContent></Card>
          </motion.div>

          {/* Admin */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-accent" />{t('services.adminTitle')}</h2>
            <Card className="bg-accent/5 border-accent/20"><CardContent className="p-6"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{adminItems.map((item, i) => (<div key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-accent shrink-0 mt-0.5" /><span className="text-sm">{item}</span></div>))}</div></CardContent></Card>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center py-8">
            <Link to={`/${lang}/contact`}>
              <Button size="lg" className="text-base px-8">{t('contact.title')}</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServiceFinancing;

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CreditCard, RefreshCw, Wrench, Shield, Headphones, Check, ChevronRight, Banknote, Truck, FileText, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Services = () => {
  const { t } = useTranslation();

  const steps = [
    t('services.step1'),
    t('services.step2'),
    t('services.step3'),
    t('services.step4'),
  ];

  const conditions = [
    t('services.cond0interest'),
    t('services.condDuration'),
    t('services.condFixed'),
    t('services.condFlexible'),
    t('services.condNoFees'),
  ];

  const adminItems = [
    t('services.adminRegistration'),
    t('services.adminCOC'),
    t('services.adminNonPledge'),
    t('services.adminInspection'),
    t('services.adminServiceBook'),
    t('services.adminInvoices'),
  ];

  const otherServices = [
    { icon: RefreshCw, title: t('services.tradein'), desc: t('services.tradeinDesc') },
    { icon: Wrench, title: t('services.maintenance'), desc: t('services.maintenanceDesc') },
    { icon: Shield, title: t('services.warranty'), desc: t('services.warrantyDesc') },
    { icon: Headphones, title: t('services.afterSales'), desc: t('services.afterSalesDesc') },
  ];

  return (
    <div>
      {/* Hero */}
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
        <div className="container mx-auto px-4 max-w-5xl space-y-12">

          {/* Financing Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl font-heading font-bold">{t('services.financing')}</h2>
            </div>
            <p className="text-lg text-accent font-medium">{t('services.financingSubtitle')}</p>
            <p className="text-muted-foreground mt-3 leading-relaxed max-w-3xl">{t('services.financingIntro')}</p>
          </motion.div>

          {/* How it works - Steps */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              ✅ {t('services.howItWorks')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <Card key={i} className="relative overflow-hidden">
                  <CardContent className="p-5">
                    <div className="text-3xl font-bold text-accent/20 mb-2">{i + 1}</div>
                    <p className="text-sm font-medium">{step}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Financing Conditions */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              💰 {t('services.conditions')}
            </h3>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {conditions.map((c, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment Options */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <Banknote className="w-5 h-5 text-accent" />
              {t('services.paymentTitle')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-accent/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{t('services.paymentCash')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-accent/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <ChevronRight className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{t('services.paymentInstallments')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Import & Warranty */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-accent" />
              {t('services.importTitle')}
            </h3>
            <Card>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {[
                    t('services.importOrigin'),
                    t('services.importWarranty'),
                    t('services.importDelivery'),
                    t('services.importManufacturer'),
                    t('services.importRetraction'),
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin procedures */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              {t('services.adminTitle')}
            </h3>
            <Card className="bg-accent/5 border-accent/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {adminItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Divider */}
          <hr className="border-border" />

          {/* Other Services */}
          <div className="space-y-6">
            {otherServices.map((s, i) => (
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

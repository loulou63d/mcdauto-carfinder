import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wrench, Check, Settings, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ServiceMaintenance = () => {
  const { t } = useTranslation();
  const { lang } = useParams();

  const services = [
    t('maintenancePage.serviceOilChange'), t('maintenancePage.serviceBrakes'), t('maintenancePage.serviceTires'),
    t('maintenancePage.serviceBattery'), t('maintenancePage.serviceAC'), t('maintenancePage.serviceDiag'),
    t('maintenancePage.serviceTiming'), t('maintenancePage.serviceInspection'),
  ];

  const whyUs = [
    t('maintenancePage.whyCertified'), t('maintenancePage.whyParts'), t('maintenancePage.whyTransparent'),
    t('maintenancePage.whyWarranty'), t('maintenancePage.whySpeed'), t('maintenancePage.whyAllBrands'),
  ];

  const packages = [
    { title: t('maintenancePage.packageBasic'), desc: t('maintenancePage.packageBasicDesc'), accent: false },
    { title: t('maintenancePage.packageComplete'), desc: t('maintenancePage.packageCompleteDesc'), accent: true },
    { title: t('maintenancePage.packagePremium'), desc: t('maintenancePage.packagePremiumDesc'), accent: false },
  ];

  return (
    <div>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-heading font-bold">
            {t('maintenancePage.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
            {t('maintenancePage.heroSubtitle')}
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-5xl space-y-12">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-muted-foreground leading-relaxed text-lg max-w-3xl">
            {t('maintenancePage.intro')}
          </motion.p>

          {/* Services list */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-accent" />{t('maintenancePage.servicesTitle')}
            </h2>
            <Card><CardContent className="p-6"><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{services.map((s, i) => (<div key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-accent shrink-0 mt-0.5" /><span className="text-sm">{s}</span></div>))}</div></CardContent></Card>
          </motion.div>

          {/* Why us */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />{t('maintenancePage.whyUs')}
            </h2>
            <Card><CardContent className="p-6"><ul className="space-y-3">{whyUs.map((w, i) => (<li key={i} className="flex items-start gap-3"><Check className="w-5 h-5 text-accent shrink-0 mt-0.5" /><span>{w}</span></li>))}</ul></CardContent></Card>
          </motion.div>

          {/* Packages */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-accent" />{t('maintenancePage.packagesTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg, i) => (
                <Card key={i} className={pkg.accent ? 'border-accent ring-1 ring-accent/30' : ''}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{pkg.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pkg.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center py-8 space-y-3">
            <h3 className="text-xl font-heading font-bold">{t('maintenancePage.ctaTitle')}</h3>
            <Link to={`/${lang}/contact`}>
              <Button size="lg" className="text-base px-8">{t('maintenancePage.ctaButton')}</Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ServiceMaintenance;

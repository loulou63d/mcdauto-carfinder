import { useTranslation } from 'react-i18next';
import { Wrench, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Repair = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Wrench,
      title: t('repair.service1Title', 'Réparations générales'),
      desc: t('repair.service1Desc', 'Moteur, transmission, suspension, freinage et bien plus'),
    },
    {
      icon: CheckCircle,
      title: t('repair.service2Title', 'Diagnostic complet'),
      desc: t('repair.service2Desc', 'Identification rapide et précise de tous les problèmes'),
    },
    {
      icon: DollarSign,
      title: t('repair.service3Title', 'Prix transparent'),
      desc: t('repair.service3Desc', 'Devis gratuit et sans surprises lors de la facturation'),
    },
    {
      icon: Clock,
      title: t('repair.service4Title', 'Délais rapides'),
      desc: t('repair.service4Desc', 'Réparation effectuée dans les plus brefs délais'),
    },
  ];

  const advantages = [
    t('repair.adv1', 'Mécaniciens agréés et certifiés'),
    t('repair.adv2', 'Pièces de rechange authentiques'),
    t('repair.adv3', 'Garantie sur les réparations'),
    t('repair.adv4', 'Garantie constructeur respectée'),
    t('repair.adv5', 'Service client réactif'),
    t('repair.adv6', 'Lieu de travail moderne et équipé'),
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-16 px-4 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-heading font-bold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t('repair.title', 'Service de réparation')}
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('repair.subtitle', 'Réparations de qualité professionnelle à prix équitable')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              {t('repair.contactButton', 'Demander un devis')}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-heading font-bold mb-12 text-center">
            {t('repair.servicesTitle', 'Nos services')}
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service, i) => (
              <motion.div
                key={i}
                className="flex gap-4 p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                variants={itemVariants}
              >
                <service.icon className="w-10 h-10 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-bold mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Advantages */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">
            {t('repair.advantagesTitle', 'Nos avantages')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advantages.map((advantage, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                <p>{advantage}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">
            {t('repair.processTitle', 'Comment ça fonctionne')}
          </h2>

          <div className="space-y-4">
            {[
              { num: '1', title: t('repair.step1Title', 'Diagnostic'), desc: t('repair.step1Desc', 'Inspection complète de votre véhicule') },
              { num: '2', title: t('repair.step2Title', 'Devis'), desc: t('repair.step2Desc', 'Devis gratuit et sans engagement') },
              { num: '3', title: t('repair.step3Title', 'Réparation'), desc: t('repair.step3Desc', 'Travaux effectués avec soin') },
              { num: '4', title: t('repair.step4Title', 'Livraison'), desc: t('repair.step4Desc', 'Véhicule remis en excellent état') },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="flex gap-4 p-6 rounded-lg bg-card border border-border"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-heading font-bold shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="font-heading font-bold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            {t('repair.ctaTitle', 'Besoin d\'une réparation ?')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('repair.ctaDesc', 'Contactez nos experts dès maintenant pour un devis gratuit et sans engagement.')}
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            {t('repair.ctaButton', 'Prendre rendez-vous')}
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Repair;

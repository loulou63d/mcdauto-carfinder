import { useTranslation } from 'react-i18next';
import { Truck, MapPin, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Delivery = () => {
  const { t } = useTranslation();

  const options = [
    {
      icon: Truck,
      title: t('delivery.option1Title', 'Livraison à domicile'),
      desc: t('delivery.option1Desc', 'Nous livrons votre véhicule directement à votre adresse'),
      price: t('delivery.option1Price', 'À partir de 250€'),
    },
    {
      icon: MapPin,
      title: t('delivery.option2Title', 'Retrait en showroom'),
      desc: t('delivery.option2Desc', 'Venez chercher votre véhicule dans l\'un de nos centres'),
      price: t('delivery.option2Price', 'Gratuit'),
    },
    {
      icon: Clock,
      title: t('delivery.option3Title', 'Livraison express'),
      desc: t('delivery.option3Desc', 'Livraison urgente en 24h disponible'),
      price: t('delivery.option3Price', 'À partir de 500€'),
    },
    {
      icon: Truck,
      title: t('delivery.option4Title', 'Transport toute France'),
      desc: t('delivery.option4Desc', 'Nous livrons partout en France métropolitaine'),
      price: t('delivery.option4Price', 'Selon la région'),
    },
  ];

  const process = [
    { step: t('delivery.step1', 'Confirmation de la commande') },
    { step: t('delivery.step2', 'Préparation du véhicule') },
    { step: t('delivery.step3', 'Arrangement de la livraison') },
    { step: t('delivery.step4', 'Livraison et remise des clés') },
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
            {t('delivery.title', 'Livraison')}
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('delivery.subtitle', 'Nous mettons votre véhicule à votre disposition rapidement et en sécurité')}
          </motion.p>
        </div>
      </section>

      {/* Options */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-heading font-bold mb-12 text-center">
            {t('delivery.optionsTitle', 'Options de livraison')}
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {options.map((option, i) => (
              <motion.div
                key={i}
                className="flex flex-col gap-4 p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                variants={itemVariants}
              >
                <option.icon className="w-10 h-10 text-primary" />
                <h3 className="font-heading font-bold">{option.title}</h3>
                <p className="text-sm text-muted-foreground flex-1">{option.desc}</p>
                <p className="font-semibold text-primary">{option.price}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-heading font-bold mb-12 text-center">
            {t('delivery.processTitle', 'Notre processus de livraison')}
          </h2>
          
          <div className="space-y-4">
            {process.map((item, i) => (
              <motion.div
                key={i}
                className="flex gap-4 p-6 rounded-lg bg-card border border-border"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white font-heading font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex items-center">
                  <p className="text-lg">{item.step}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">
            {t('delivery.detailsTitle', 'Détails de la livraison')}
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('delivery.detail1Title', 'Délai standard')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('delivery.detail1Desc', 'Livraison en 5 jours ouvrables. Vous pouvez choisir votre jour de livraison.')}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('delivery.detail2Title', 'Coûts de transport')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('delivery.detail2Desc', 'Gratuit pour les retraits en showroom. À partir de 250€ pour les livraisons à domicile selon la région.')}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('delivery.detail3Title', 'État du véhicule')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('delivery.detail3Desc', 'Votre véhicule est livré avec 500km d\'autonomie, nettoyé et en parfait état de fonctionnement.')}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card flex gap-4">
              <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-heading font-bold mb-2">
                  {t('delivery.detail4Title', 'Important')}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {t('delivery.detail4Desc', 'La livraison comprend : la carte grise complétée, l\'assurance provisoire, le COC et les plaques d\'immatriculation.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            {t('delivery.ctaTitle', 'Prêt à faire livrer votre véhicule ?')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('delivery.ctaDesc', 'Sélectionnez votre véhicule et choisissez votre option de livraison préférée.')}
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            {t('delivery.ctaButton', 'Voir nos véhicules')}
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Delivery;

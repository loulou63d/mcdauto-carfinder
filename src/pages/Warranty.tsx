import { useTranslation } from 'react-i18next';
import { Shield, Clock, CheckCircle, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Warranty = () => {
  const { t } = useTranslation();

  const plans = [
    {
      name: t('warranty.plan1Name', 'Standard'),
      duration: '24 mois',
      price: t('warranty.plan1Price', 'Incluse'),
      features: [
        t('warranty.feature1', 'Défauts cachés'),
        t('warranty.feature2', 'Vices dissimulés'),
        t('warranty.feature3', 'Pannes mécaniques majeures'),
      ],
      highlighted: false,
    },
    {
      name: t('warranty.plan2Name', 'Premium'),
      duration: '48 mois',
      price: t('warranty.plan2Price', 'À partir de 499€'),
      features: [
        t('warranty.feature1', 'Défauts cachés'),
        t('warranty.feature2', 'Vices dissimulés'),
        t('warranty.feature3', 'Pannes mécaniques majeures'),
        t('warranty.feature4', 'Usure des pièces'),
        t('warranty.feature5', 'Dépannage 24/24'),
      ],
      highlighted: true,
    },
    {
      name: t('warranty.plan3Name', 'Avancé'),
      duration: '60 mois',
      price: t('warranty.plan3Price', 'À partir de 999€'),
      features: [
        t('warranty.feature1', 'Défauts cachés'),
        t('warranty.feature2', 'Vices dissimulés'),
        t('warranty.feature3', 'Pannes mécaniques majeures'),
        t('warranty.feature4', 'Usure des pièces'),
        t('warranty.feature5', 'Dépannage 24/24'),
        t('warranty.feature6', 'Protection tous risques'),
      ],
      highlighted: false,
    },
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
            {t('warranty.title', 'Garanties et protections')}
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('warranty.subtitle', 'Protégez votre investissement avec nos garanties complètes')}
          </motion.p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-heading font-bold mb-12 text-center">
            {t('warranty.benefitsTitle', 'Pourquoi une garantie MCD AUTO ?')}
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Shield,
                title: t('warranty.benefit1Title', 'Protection complète'),
                desc: t('warranty.benefit1Desc', 'Couvrez tous les défauts et vices cachés'),
              },
              {
                icon: Clock,
                title: t('warranty.benefit2Title', 'Durée flexible'),
                desc: t('warranty.benefit2Desc', 'De 24 à 60 mois selon vos besoins'),
              },
              {
                icon: CheckCircle,
                title: t('warranty.benefit3Title', 'Service rapide'),
                desc: t('warranty.benefit3Desc', 'Réparation ou remboursement en 48h'),
              },
              {
                icon: MapPin,
                title: t('warranty.benefit4Title', 'Réseau large'),
                desc: t('warranty.benefit4Desc', 'Utilisable dans tous les garages partenaires'),
              },
            ].map((benefit, i) => (
              <motion.div
                key={i}
                className="flex gap-4 p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                variants={itemVariants}
              >
                <benefit.icon className="w-10 h-10 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <h2 className="text-3xl font-heading font-bold mb-12 text-center">
            {t('warranty.plansTitle', 'Nos formules de garantie')}
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                className={`rounded-lg border p-8 transition-all ${
                  plan.highlighted 
                    ? 'border-primary bg-card shadow-lg scale-105' 
                    : 'border-border bg-card'
                }`}
                variants={itemVariants}
              >
                {plan.highlighted && (
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {t('warranty.recommended', 'Recommandé')}
                    </span>
                  </div>
                )}
                <h3 className="font-heading font-bold text-2xl mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.duration}</p>
                <p className="text-3xl font-heading font-bold mb-6 text-primary">{plan.price}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    plan.highlighted 
                      ? 'bg-primary hover:bg-primary/90' 
                      : 'bg-secondary hover:bg-secondary/90'
                  }`}
                >
                  {t('warranty.chooseButton', 'Choisir cette formule')}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Details */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">
            {t('warranty.detailsTitle', 'Détails des couvertures')}
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('warranty.detail1Title', 'Défauts cachés')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('warranty.detail1Desc', 'Nous couvrons tous les défauts non visibles au moment de l\'achat.')}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('warranty.detail2Title', 'Pannes mécaniques')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('warranty.detail2Desc', 'Moteur, transmission, suspension, freinage et autres systèmes majeurs.')}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('warranty.detail3Title', 'Conditions')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('warranty.detail3Desc', 'Révisions régulières obligatoires. Kilométrage illimité. Pas de franchises.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            {t('warranty.ctaTitle', 'Sécurisez votre achat')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('warranty.ctaDesc', 'Choisissez la formule qui vous convient et roulez l\'esprit tranquille.')}
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            {t('warranty.ctaButton', 'Ajouter une garantie')}
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Warranty;

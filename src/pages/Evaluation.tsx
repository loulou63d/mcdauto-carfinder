import { useTranslation } from 'react-i18next';
import { Zap, DollarSign, Award, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Evaluation = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Zap,
      title: t('evaluation.step1Title', 'Évaluation instantanée'),
      desc: t('evaluation.step1Desc', 'Obtenez une estimation rapide de votre véhicule en quelques clics'),
    },
    {
      icon: Award,
      title: t('evaluation.step2Title', 'Expertise professionnelle'),
      desc: t('evaluation.step2Desc', 'Nos experts analysent l\'état réel de votre véhicule'),
    },
    {
      icon: DollarSign,
      title: t('evaluation.step3Title', 'Meilleur prix garanti'),
      desc: t('evaluation.step3Desc', 'Nous vous proposons le prix le plus juste du marché'),
    },
    {
      icon: Clock,
      title: t('evaluation.step4Title', 'Processus rapide'),
      desc: t('evaluation.step4Desc', 'Évaluation et paiement en 24h seulement'),
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
            {t('evaluation.title', 'Évaluez votre véhicule')}
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('evaluation.subtitle', 'Obtenez une estimation gratuite et sans engagement en quelques minutes')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              {t('evaluation.startButton', 'Commencer l\'évaluation')}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="flex gap-4 p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                variants={itemVariants}
              >
                <step.icon className="w-10 h-10 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-heading font-bold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Details */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">
            {t('evaluation.detailsTitle', 'Comment fonctionne notre évaluation ?')}
          </h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('evaluation.detail1Title', 'Inspection complète')}
              </h3>
              <p className="text-muted-foreground">
                {t('evaluation.detail1Desc', 'Nous examinons l\'état intérieur et extérieur, le kilométrage, l\'historique d\'entretien et les éventuels dommages.')}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('evaluation.detail2Title', 'Analyse du marché')}
              </h3>
              <p className="text-muted-foreground">
                {t('evaluation.detail2Desc', 'Nous comparons votre véhicule avec les prix actuels du marché pour vous proposer une estimation équitable.')}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('evaluation.detail3Title', 'Offre personnalisée')}
              </h3>
              <p className="text-muted-foreground">
                {t('evaluation.detail3Desc', 'Vous recevez une offre d\'achat personnalisée sans engagement, valide pendant 30 jours.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            {t('evaluation.ctaTitle', 'Prêt à vendre votre véhicule ?')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('evaluation.ctaDesc', 'Obtenez une estimation gratuite maintenant et découvrez la valeur réelle de votre véhicule.')}
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            {t('evaluation.ctaButton', 'Évaluer mon véhicule')}
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Evaluation;

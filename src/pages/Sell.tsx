import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { HandshakeIcon, TrendingUp, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Sell = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const navigate = useNavigate();

  const benefits = [
    {
      icon: TrendingUp,
      title: t('sell.benefit1Title', 'Prix optimal'),
      desc: t('sell.benefit1Desc', 'Nous vous garantissons le meilleur prix du marché'),
    },
    {
      icon: Zap,
      title: t('sell.benefit2Title', 'Vente rapide'),
      desc: t('sell.benefit2Desc', 'Processus simplifié : évaluation, vente et paiement en 24h'),
    },
    {
      icon: Shield,
      title: t('sell.benefit3Title', 'Sécurité garantie'),
      desc: t('sell.benefit3Desc', 'Nous gérons tous les documents administratifs'),
    },
    {
      icon: HandshakeIcon,
      title: t('sell.benefit4Title', 'Facilité maximale'),
      desc: t('sell.benefit4Desc', 'Pas de paperasserie, pas de stress, pas de négociation'),
    },
  ];

  const processSteps = [
    t('sell.step1', 'Contactez-nous avec les détails de votre véhicule'),
    t('sell.step2', 'Nous vous proposons une estimation gratuite'),
    t('sell.step3', 'Inspectez votre voiture dans l\'un de nos centres'),
    t('sell.step4', 'Recevez votre paiement instantanément'),
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
            {t('sell.title', 'Vendez votre voiture')}
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('sell.subtitle', 'Vendre votre véhicule d\'occasion n\'a jamais été aussi simple')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate(`/${lang}/contact`)}>
              {t('sell.startButton', 'Commencer la vente')}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-heading font-bold mb-12 text-center">
            {t('sell.benefitsTitle', 'Pourquoi vendre chez MCD AUTO ?')}
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, i) => (
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

      {/* Process */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-heading font-bold mb-12 text-center">
            {t('sell.processTitle', 'Notre processus en 4 étapes')}
          </h2>
          
          <div className="space-y-4">
            {processSteps.map((step, i) => (
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
                  <p className="text-lg">{step}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-heading font-bold mb-8 text-center">
            {t('sell.faqTitle', 'Questions fréquemment posées')}
          </h2>

          <div className="space-y-4">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('sell.faq1Q', 'Mon véhicule doit-il être en parfait état ?')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('sell.faq1A', 'Non, nous achetons les véhicules dans tous les états. Nous tenons compte de l\'usure naturelle et des dommages mineurs dans notre évaluation.')}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('sell.faq2Q', 'Combien de temps prend le processus ?')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('sell.faq2A', 'De l\'évaluation initiale au paiement final, le processus prend généralement 24 heures.')}
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="font-heading font-bold mb-2">
                {t('sell.faq3Q', 'Dois-je apporter mon véhicule à un centre spécifique ?')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('sell.faq3A', 'Oui, nous avons plusieurs centres dans le pays. Nous vous aiderons à trouver le plus proche de chez vous.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            {t('sell.ctaTitle', 'Prêt à vendre ?')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('sell.ctaDesc', 'Contactez-nous dès maintenant pour une évaluation gratuite et sans engagement.')}
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate(`/${lang}/contact`)}>
            {t('sell.ctaButton', 'Démarrer la vente')}
          </Button>
        </div>
      </section>
    </main>
  );
};

export default Sell;

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: t('faq.q1', 'Quels sont vos horaires d\'ouverture ?'),
      answer: t('faq.a1', 'Nous sommes ouverts du lundi au vendredi de 9h à 18h, et le samedi de 10h à 16h. Fermé le dimanche.'),
    },
    {
      question: t('faq.q2', 'Proposez-vous un service d\'enlèvement ?'),
      answer: t('faq.a2', 'Oui, nous pouvons enlever votre véhicule gratuitement si vous le vendez chez nous.'),
    },
    {
      question: t('faq.q3', 'Quel est le délai de livraison ?'),
      answer: t('faq.a3', 'La livraison se fait généralement dans les 5 jours ouvrables. Un délai plus rapide peut être arrangé moyennant frais supplémentaires.'),
    },
    {
      question: t('faq.q4', 'Proposez-vous des services de financement ?'),
      answer: t('faq.a4', 'Oui, nous proposons du financement sans intérêt sur 24 à 48 mois avec un acompte flexible.'),
    },
    {
      question: t('faq.q5', 'Y a-t-il une garantie sur les véhicules ?'),
      answer: t('faq.a5', 'Oui, tous les véhicules incluent une garantie de 24 mois sur les défauts cachés.'),
    },
    {
      question: t('faq.q6', 'Pouvez-vous accepter des reprises ?'),
      answer: t('faq.a6', 'Absolument ! Nous pouvons reprendre votre ancien véhicule en compte pour votre achat.'),
    },
    {
      question: t('faq.q7', 'Quel est votre processus de vente ?'),
      answer: t('faq.a7', 'Vous choisissez un véhicule, nous effectuons une vérification complète, puis signez les documents et c\'est fait !'),
    },
    {
      question: t('faq.q8', 'Proposez-vous une garantie constructeur étendue ?'),
      answer: t('faq.a8', 'Oui, nous pouvons vous proposer une extension de garantie constructeur jusqu\'à 60 mois.'),
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
            {t('faq.title', 'Questions fréquemment posées')}
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('faq.subtitle', 'Trouvez les réponses à vos questions')}
          </motion.p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="rounded-lg border border-border bg-card overflow-hidden"
                variants={itemVariants}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 hover:bg-secondary/50 transition-colors text-left"
                >
                  <h3 className="font-heading font-bold pr-4">{faq.question}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-primary shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openIndex === index && (
                  <motion.div
                    className="px-6 pb-6 pt-2 border-t border-border bg-secondary/20"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">
            {t('faq.ctaTitle', 'D\'autres questions ?')}
          </h2>
          <p className="text-muted-foreground mb-8">
            {t('faq.ctaDesc', 'Notre équipe est à votre disposition pour vous aider.')}
          </p>
          <a href="/contact" className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            {t('faq.ctaButton', 'Nous contacter')}
          </a>
        </div>
      </section>
    </main>
  );
};

export default FAQ;

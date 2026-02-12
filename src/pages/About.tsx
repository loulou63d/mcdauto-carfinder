import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Clock } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  const stats = [
    { icon: Award, value: '5000+', label: t('about.stats.vehicles') },
    { icon: Clock, value: '15+', label: t('about.stats.years') },
    { icon: Users, value: '4500+', label: t('about.stats.customers') },
    { icon: Shield, value: '12', label: t('about.stats.guarantee') },
  ];

  return (
    <div>
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-heading font-bold">
            {t('about.title')}
          </motion.h1>
        </div>
      </section>

      <section className="section-padding">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl font-heading font-bold mb-4">{t('about.history')}</h2>
          <p className="text-muted-foreground leading-relaxed mb-10">{t('about.historyText')}</p>
          <h2 className="text-2xl font-heading font-bold mb-4">{t('about.mission')}</h2>
          <p className="text-muted-foreground leading-relaxed mb-10">{t('about.missionText')}</p>
          <h2 className="text-2xl font-heading font-bold mb-6">{t('about.values')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {(['valuesTransparency', 'valuesQuality', 'valuesTrust', 'valuesService'] as const).map(key => (
              <div key={key} className="p-4 bg-muted rounded-lg text-center font-heading font-semibold text-sm">
                {t(`about.${key}`)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <s.icon className="w-8 h-8 mx-auto mb-3 opacity-80" />
                <div className="text-3xl font-heading font-bold">{s.value}</div>
                <div className="text-sm opacity-70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

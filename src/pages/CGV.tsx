import { useTranslation } from 'react-i18next';

const CGV = () => {
  const { t } = useTranslation();
  return (
    <div className="section-padding">
      <div className="container mx-auto px-4 max-w-3xl prose prose-sm">
        <h1 className="font-heading font-bold text-3xl mb-8">{t('cgv.title')}</h1>
        <p className="lead">{t('cgv.intro')}</p>

        <h2>{t('cgv.section1Title')}</h2>
        <p>{t('cgv.section1')}</p>

        <h2>{t('cgv.section2Title')}</h2>
        <p>{t('cgv.section2')}</p>

        <h2>{t('cgv.section3Title')}</h2>
        <p>{t('cgv.section3')}</p>

        <h2>{t('cgv.section4Title')}</h2>
        <p>{t('cgv.section4')}</p>

        <h2>{t('cgv.section5Title')}</h2>
        <p>{t('cgv.section5')}</p>

        <h2>{t('cgv.section6Title')}</h2>
        <p>{t('cgv.section6')}</p>
      </div>
    </div>
  );
};

export default CGV;

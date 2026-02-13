import { useTranslation } from 'react-i18next';

const Privacy = () => {
  const { t } = useTranslation();
  return (
    <div className="section-padding">
      <div className="container mx-auto px-4 max-w-3xl prose prose-sm">
        <h1 className="font-heading font-bold text-3xl mb-8">{t('privacy.title')}</h1>
        <p className="lead">{t('privacy.intro')}</p>

        <h2>{t('privacy.section1Title')}</h2>
        <p>{t('privacy.section1')}</p>

        <h2>{t('privacy.section2Title')}</h2>
        <p>{t('privacy.section2')}</p>

        <h2>{t('privacy.section3Title')}</h2>
        <p>{t('privacy.section3')}</p>

        <h2>{t('privacy.section4Title')}</h2>
        <p>{t('privacy.section4')}</p>

        <h2>{t('privacy.section5Title')}</h2>
        <p>{t('privacy.section5')}</p>

        <h2>{t('privacy.section6Title')}</h2>
        <p>{t('privacy.section6')}</p>
      </div>
    </div>
  );
};

export default Privacy;

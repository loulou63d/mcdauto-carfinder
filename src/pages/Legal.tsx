import { useTranslation } from 'react-i18next';

const Legal = () => {
  const { t } = useTranslation();
  return (
    <div className="section-padding">
      <div className="container mx-auto px-4 max-w-3xl prose prose-sm">
        <h1 className="font-heading font-bold text-3xl mb-8">{t('legal.title')}</h1>
        <h2>{t('legal.company')}</h2>
        <p className="whitespace-pre-line">{t('legal.companyDetails')}</p>
        <p className="whitespace-pre-line">{t('legal.addressDetails')}</p>
        <h2>{t('legal.publisher')}</h2>
        <p>{t('legal.publisherDetails')}</p>
        <h2>{t('legal.hosting')}</h2>
        <p>{t('legal.hostingDetails')}</p>
        <h2>{t('legal.data')}</h2>
        <p>{t('legal.dataDetails1')}</p>
        <p>{t('legal.dataDetails2')}</p>
      </div>
    </div>
  );
};

export default Legal;

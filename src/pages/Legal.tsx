import { useTranslation } from 'react-i18next';

const Legal = () => {
  const { t } = useTranslation();
  return (
    <div className="section-padding">
      <div className="container mx-auto px-4 max-w-3xl prose prose-sm">
        <h1 className="font-heading font-bold text-3xl mb-8">{t('legal.title')}</h1>
        <h2>{t('legal.company')}</h2>
        <p>MCD AUTO SARL<br/>Capital social : 50 000 €<br/>SIRET : 123 456 789 00010<br/>RCS Salon-de-Provence<br/>TVA Intracommunautaire : FR12345678900</p>
        <p>123 Avenue de l'Automobile<br/>13300 Salon-de-Provence, France<br/>Téléphone : +33 4 90 00 00 00<br/>Email : contact@mcdauto.fr</p>
        <h2>{t('legal.publisher')}</h2>
        <p>Monsieur Jean Dupont, Gérant de MCD AUTO SARL</p>
        <h2>{t('legal.hosting')}</h2>
        <p>Ce site est hébergé par Lovable (Lovable Technologies Ltd).</p>
        <h2>{t('legal.data')}</h2>
        <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, veuillez nous contacter à l'adresse : dpo@mcdauto.fr</p>
        <p>Les données collectées via les formulaires de contact sont utilisées exclusivement pour répondre à vos demandes et ne sont jamais transmises à des tiers sans votre consentement explicite.</p>
      </div>
    </div>
  );
};

export default Legal;

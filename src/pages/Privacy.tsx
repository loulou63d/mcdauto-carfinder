import { useTranslation } from 'react-i18next';

const Privacy = () => {
  const { t } = useTranslation();
  return (
    <div className="section-padding">
      <div className="container mx-auto px-4 max-w-3xl prose prose-sm">
        <h1 className="font-heading font-bold text-3xl mb-8">{t('privacy.title')}</h1>
        <p className="lead">{t('privacy.intro')}</p>

        <h2>1. Données collectées</h2>
        <p>Nous collectons les données suivantes : nom, prénom, adresse email, numéro de téléphone, et toute information que vous nous transmettez via nos formulaires de contact.</p>

        <h2>2. Finalité du traitement</h2>
        <p>Les données collectées sont utilisées pour : répondre à vos demandes de contact, vous informer sur nos véhicules et services, gérer les commandes et livraisons.</p>

        <h2>3. Durée de conservation</h2>
        <p>Vos données personnelles sont conservées pendant une durée maximale de 3 ans à compter de votre dernière interaction avec nous.</p>

        <h2>4. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants : droit d'accès, droit de rectification, droit à l'effacement, droit à la limitation du traitement, droit à la portabilité des données, droit d'opposition.</p>

        <h2>5. Contact DPO</h2>
        <p>Pour exercer vos droits, contactez notre Délégué à la Protection des Données : dpo@mcdauto.fr</p>

        <h2>6. Cookies</h2>
        <p>Ce site utilise des cookies techniques nécessaires au bon fonctionnement du site. Aucun cookie publicitaire n'est utilisé sans votre consentement.</p>
      </div>
    </div>
  );
};

export default Privacy;

import { useTranslation } from 'react-i18next';

const CGV = () => {
  const { t } = useTranslation();
  return (
    <div className="section-padding">
      <div className="container mx-auto px-4 max-w-3xl prose prose-sm">
        <h1 className="font-heading font-bold text-3xl mb-8">{t('cgv.title')}</h1>
        <p className="lead">{t('cgv.intro')}</p>

        <h2>1. Objet</h2>
        <p>Les présentes conditions générales de vente régissent les relations contractuelles entre MCD AUTO SARL et ses clients pour la vente de véhicules d'occasion.</p>

        <h2>2. Prix</h2>
        <p>Les prix affichés sont en euros TTC. MCD AUTO se réserve le droit de modifier ses prix à tout moment. Le prix applicable est celui en vigueur au moment de la commande.</p>

        <h2>3. Garantie</h2>
        <p>Tous nos véhicules bénéficient d'une garantie minimale de 12 mois, extensible jusqu'à 24 mois. Cette garantie couvre les pannes mécaniques, électriques et électroniques.</p>

        <h2>4. Droit de rétractation</h2>
        <p>Conformément à notre politique "Satisfait ou remboursé", vous disposez d'un délai de 14 jours calendaires à compter de la livraison du véhicule pour exercer votre droit de rétractation, sans avoir à justifier de motif.</p>

        <h2>5. Livraison</h2>
        <p>La livraison est effectuée dans nos locaux ou à l'adresse indiquée par le client. Les délais de livraison sont donnés à titre indicatif.</p>

        <h2>6. Litiges</h2>
        <p>En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. Le tribunal compétent est celui du siège social de MCD AUTO.</p>
      </div>
    </div>
  );
};

export default CGV;

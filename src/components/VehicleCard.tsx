import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MapPin, Calendar, Gauge, Fuel, Settings2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Vehicle } from '@/data/mockVehicles';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();

  const energyLabels: Record<string, string> = {
    essence: 'Essence',
    diesel: 'Diesel',
    électrique: 'Électrique',
    hybride: 'Hybride',
    hybride_rechargeable: 'Hybride R.',
    gpl: 'GPL',
  };

  return (
    <Link to={`/${lang}/vehicle/${vehicle.id}`} className="group block">
      <div className="bg-card rounded-lg border overflow-hidden card-hover">
        {/* Image */}
        <div className="relative aspect-[16/10] bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <span className="text-4xl font-heading font-bold text-primary/20">{vehicle.brand}</span>
          </div>
          {vehicle.promoBadge && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground font-semibold">
              {vehicle.promoBadge}
            </Badge>
          )}
          <button
            onClick={(e) => { e.preventDefault(); }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-card/80 backdrop-blur flex items-center justify-center hover:bg-card transition-colors"
          >
            <Heart className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-heading font-semibold text-lg">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{vehicle.version}</p>

          {/* Price */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-heading font-bold">
              {vehicle.price.toLocaleString('de-DE')} €
            </span>
            {vehicle.monthlyPrice && (
              <span className="text-sm text-muted-foreground">
                {t('featured.from')} {vehicle.monthlyPrice} €{t('featured.perMonth')}
              </span>
            )}
          </div>

          {/* Quick info */}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{vehicle.year}</span>
            <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{vehicle.mileage.toLocaleString('de-DE')} {t('search.km')}</span>
            <span className="flex items-center gap-1"><Fuel className="w-3 h-3" />{energyLabels[vehicle.energy] || vehicle.energy}</span>
            <span className="flex items-center gap-1"><Settings2 className="w-3 h-3" />{vehicle.transmission === 'automatic' ? t('search.automatic') : t('search.manual')}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{vehicle.location}</span>
          </div>

          {/* Badges */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="secondary" className="text-[10px] font-normal">{t('search.guarantee12')}</Badge>
            <Badge variant="secondary" className="text-[10px] font-normal">{t('search.satisfactionBadge')}</Badge>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;

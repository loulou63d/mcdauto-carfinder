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
        {/* Image area */}
        <div className="relative aspect-[16/10] bg-muted overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5 flex items-center justify-center">
            <span className="text-4xl font-heading font-bold text-muted-foreground/15">{vehicle.brand}</span>
          </div>
          {/* Image dots indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-card/60'}`} />
            ))}
          </div>
          {vehicle.promoBadge && (
            <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs font-semibold rounded-sm">
              {vehicle.promoBadge} par rapport au prix du neuf
            </Badge>
          )}
          <button
            onClick={(e) => { e.preventDefault(); }}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-sm"
          >
            <Heart className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-heading font-bold text-base text-foreground">
            {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{vehicle.version}</p>

          {/* Price row - autosphere style */}
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-muted-foreground">{t('featured.from')}</p>
              <div className="flex items-baseline gap-1">
                {vehicle.monthlyPrice && (
                  <span className="text-lg font-heading font-bold text-primary">
                    {vehicle.monthlyPrice} €{t('featured.perMonth')}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              {vehicle.monthlyPrice && <p className="text-xs text-muted-foreground">ou</p>}
              <span className="text-lg font-heading font-bold">
                {vehicle.price.toLocaleString('fr-FR')} €
              </span>
            </div>
          </div>

          {/* Quick specs row - icon style like autosphere */}
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{vehicle.year}</span>
            <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />{vehicle.mileage.toLocaleString('fr-FR')} km</span>
            <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />{energyLabels[vehicle.energy] || vehicle.energy}</span>
            <span className="flex items-center gap-1"><Settings2 className="w-3.5 h-3.5" />{vehicle.transmission === 'automatic' ? t('search.automatic') : t('search.manual')}</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{vehicle.location}</span>
          </div>

          {/* Guarantee badges - autosphere style */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="text-[11px] px-2 py-0.5 rounded border text-muted-foreground">{t('search.guarantee12')}</span>
            <span className="text-[11px] px-2 py-0.5 rounded border text-muted-foreground">{t('search.satisfactionBadge')}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;

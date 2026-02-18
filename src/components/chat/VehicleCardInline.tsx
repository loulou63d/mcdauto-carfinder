import { useParams } from 'react-router-dom';
import { Car, Calendar, Gauge, Fuel } from 'lucide-react';

interface VehicleData {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  energy: string;
  image?: string;
  monthly_price?: number;
}

export function VehicleCardInline({ vehicle }: { vehicle: VehicleData }) {
  const { lang = 'de' } = useParams();

  return (
    <a
      href={`/${lang}/vehicle/${vehicle.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block my-2 rounded-xl border bg-card overflow-hidden hover:shadow-md transition-shadow"
    >
      {vehicle.image && (
        <div className="h-32 overflow-hidden">
          <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <div className="p-3">
        <h4 className="font-semibold text-sm">{vehicle.brand} {vehicle.model}</h4>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{vehicle.year}</span>
          <span className="flex items-center gap-1"><Gauge className="w-3 h-3" />{vehicle.mileage?.toLocaleString('de-DE')} km</span>
          <span className="flex items-center gap-1"><Fuel className="w-3 h-3" />{vehicle.energy}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-primary font-bold text-base">{vehicle.price?.toLocaleString('de-DE')} €</span>
          {vehicle.monthly_price && (
            <span className="text-xs text-muted-foreground">{vehicle.monthly_price} €/Mo.</span>
          )}
        </div>
      </div>
    </a>
  );
}

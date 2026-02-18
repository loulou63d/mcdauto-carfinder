import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Calendar, Gauge, Fuel, Settings2, ShoppingCart, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { Vehicle } from '@/data/mockVehicles';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { vehicleDisplayName } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  isPromo?: boolean;
  isBestDeal?: boolean;
}

const VehicleCard = ({ vehicle, isPromo = false, isBestDeal = false }: VehicleCardProps) => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const { addToCart, isInCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('mcd-favorites');
    if (stored) {
      try {
        const favs = JSON.parse(stored) as { id: string }[];
        setIsFav(favs.some(f => f.id === vehicle.id));
      } catch { /* empty */ }
    }
  }, [vehicle.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem('mcd-favorites');
    let favs: any[] = [];
    try { favs = stored ? JSON.parse(stored) : []; } catch { /* empty */ }

    if (isFav) {
      favs = favs.filter((f: any) => f.id !== vehicle.id);
      setIsFav(false);
      toast.success(t('vehicle.favoriteRemoved'));
    } else {
      favs.push({
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        price: vehicle.price,
        mileage: vehicle.mileage,
        energy: vehicle.energy,
        image: vehicle.images?.[0],
      });
      setIsFav(true);
      toast.success(t('vehicle.favoriteAdded'));
    }
    localStorage.setItem('mcd-favorites', JSON.stringify(favs));
  };

  const firstImage = vehicle.images?.[0];

  return (
    <Link to={`/${lang}/vehicle/${vehicle.id}`} className="group block">
      <div className="bg-card rounded-lg border overflow-hidden card-hover">
        {/* Image area */}
        <div className="relative aspect-[16/10] bg-muted overflow-hidden">
          {firstImage ? (
            <img src={firstImage} alt={vehicleDisplayName(vehicle.brand, vehicle.model)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-muted-foreground/10 to-muted-foreground/5 flex items-center justify-center">
              <span className="text-4xl font-heading font-bold text-muted-foreground/15">{vehicle.brand}</span>
            </div>
          )}
          {firstImage && vehicle.images && vehicle.images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {vehicle.images.slice(0, 4).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-primary' : 'bg-card/60'}`} />
              ))}
            </div>
          )}
          {isPromo && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md bg-destructive text-destructive-foreground text-[11px] font-bold uppercase tracking-wider shadow-lg shimmer animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
              🔥 PROMO
            </span>
          )}
          {isBestDeal && !isPromo && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(30,100%,50%)] text-[hsl(30,80%,10%)] text-[11px] font-bold uppercase tracking-wider shadow-lg shimmer">
              ⭐ BEST DEAL
            </span>
          )}
          <button
            onClick={toggleFavorite}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors shadow-sm ${
              isFav ? 'bg-accent text-accent-foreground' : 'bg-card/90 hover:bg-card text-muted-foreground'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-heading font-bold text-base text-foreground">
            {vehicleDisplayName(vehicle.brand, vehicle.model)}
          </h3>

          {/* Price row */}
          <div className="mt-3 flex items-end justify-between">
            <div>
              {vehicle.monthly_price && (
                <>
                  <p className="text-xs text-muted-foreground">{t('featured.from')}</p>
                  <span className="text-lg font-heading font-bold text-primary">
                    {vehicle.monthly_price} €{t('featured.perMonth')}
                  </span>
                </>
              )}
            </div>
            <div className="text-right">
              {vehicle.monthly_price && <p className="text-xs text-muted-foreground">{t('vehicle.or', { defaultValue: 'oder' })}</p>}
              <span className="text-lg font-heading font-bold">
                {Number(vehicle.price).toLocaleString('de-DE')} €
              </span>
            </div>
          </div>

          {/* Quick specs row */}
           <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
             <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{vehicle.year}</span>
             <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />{vehicle.mileage.toLocaleString('de-DE')} km</span>
             <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />{t(`energyValues.${vehicle.energy}`, { defaultValue: vehicle.energy })}</span>
             <span className="flex items-center gap-1"><Settings2 className="w-3.5 h-3.5" />{t(`transmissionValues.${vehicle.transmission}`, { defaultValue: vehicle.transmission })}</span>
           </div>

          {/* Guarantee badges + cart button */}
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border text-muted-foreground">
                <ShieldCheck className="w-3 h-3 text-green-600" />{t('vehicle.accidentFree')}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded border text-muted-foreground">{t('search.guarantee12')}</span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!user) {
                  toast.info(t('cart.loginRequired', { defaultValue: 'Connectez-vous pour ajouter au panier' }));
                  navigate(`/${lang}/login`);
                  return;
                }
                if (isInCart(vehicle.id)) {
                  toast.info(t('cart.alreadyInCart'));
                } else {
                  addToCart(vehicle);
                  toast.success(t('cart.addedToCart'));
                }
              }}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isInCart(vehicle.id)
                  ? 'bg-primary/10 text-primary'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {isInCart(vehicle.id) ? '✓' : t('cart.addToCart')}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;

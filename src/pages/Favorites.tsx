import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/contexts/CartContext';
import { vehicleDisplayName } from '@/lib/utils';

interface FavoriteVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  energy: string;
  image?: string;
}

const Favorites = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const [favorites, setFavorites] = useState<FavoriteVehicle[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('mcd-favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch { /* empty */ }
    }
  }, []);

  const removeFavorite = (id: string) => {
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    localStorage.setItem('mcd-favorites', JSON.stringify(updated));
  };

  const clearAll = () => {
    setFavorites([]);
    localStorage.removeItem('mcd-favorites');
  };

  return (
    <div className="container mx-auto px-4 py-10 min-h-[60vh]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Heart className="w-7 h-7 text-accent" />
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
            {t('favorites.title')}
          </h1>
        </div>
        {favorites.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearAll} className="text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-1.5" />
            {t('favorites.clearAll')}
          </Button>
        )}
      </div>

      {/* Empty state */}
      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">{t('favorites.empty')}</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{t('favorites.emptyDesc')}</p>
          <Link to={`/${lang}/search`}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {t('favorites.browseVehicles')}
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mb-6">
            {t('favorites.count', { count: favorites.length })}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map((vehicle) => (
              <Card key={vehicle.id} className="card-hover overflow-hidden">
                <div className="aspect-[16/10] bg-muted relative">
                  {vehicle.image ? (
                    <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingCart className="w-10 h-10" />
                    </div>
                  )}
                  <button
                    onClick={() => removeFavorite(vehicle.id)}
                    className="absolute top-2 right-2 p-2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground">{vehicleDisplayName(vehicle.brand, vehicle.model)}</h3>
                  <p className="text-sm text-muted-foreground">{vehicle.year} · {vehicle.mileage?.toLocaleString()} km · {vehicle.energy}</p>
                  <p className="text-lg font-bold text-primary mt-2">{vehicle.price?.toLocaleString()} €</p>
                  <Link to={`/${lang}/vehicle/${vehicle.id}`} className="block mt-3">
                    <Button variant="outline" size="sm" className="w-full">{t('favorites.viewDetail')}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Favorites;

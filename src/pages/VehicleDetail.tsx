import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Phone, ChevronRight, Calendar, Gauge, Fuel, Settings2, Zap, DoorOpen, Palette, Leaf, Shield, Loader2, ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import VehicleCard from '@/components/VehicleCard';
import { useVehicle, useVehicles } from '@/hooks/useVehicles';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

const VehicleDetail = () => {
  const { t } = useTranslation();
  const { lang = 'de', id } = useParams();
  const navigate = useNavigate();
  const { data: vehicle, isLoading } = useVehicle(id);
  const { data: allVehicles = [] } = useVehicles({ limit: 5 });
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.info(t('cart.loginRequired', 'Connectez-vous pour ajouter au panier'));
      navigate(`/${lang}/customer-auth`);
      return;
    }
    if (vehicle) {
      addToCart(vehicle);
      toast.success(t('cart.added', 'Véhicule ajouté au panier'));
    }
  };

  const alreadyInCart = vehicle ? isInCart(vehicle.id) : false;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.error')}</p>
      </div>
    );
  }

  const similar = allVehicles.filter(v => v.id !== vehicle.id).slice(0, 4);

  const translateValue = (key: string, value: string) => {
    const translated = t(`${key}.${value}`, { defaultValue: '' });
    return translated || value;
  };

  const specs = [
    { icon: Calendar, label: t('vehicle.year'), value: vehicle.year },
    { icon: Gauge, label: t('vehicle.mileage'), value: `${vehicle.mileage.toLocaleString('de-DE')} km` },
    { icon: Fuel, label: t('vehicle.energy'), value: translateValue('energyValues', vehicle.energy) },
    { icon: Settings2, label: t('vehicle.transmission'), value: translateValue('transmissionValues', vehicle.transmission) },
    ...(vehicle.power ? [{ icon: Zap, label: t('vehicle.power'), value: vehicle.power }] : []),
    ...(vehicle.doors ? [{ icon: DoorOpen, label: t('vehicle.doors'), value: vehicle.doors }] : []),
    ...(vehicle.color ? [{ icon: Palette, label: t('vehicle.color'), value: translateValue('colorValues', vehicle.color) }] : []),
    ...(vehicle.co2 ? [{ icon: Leaf, label: t('vehicle.co2'), value: vehicle.co2 }] : []),
    ...(vehicle.euro_norm ? [{ icon: Shield, label: t('vehicle.euroNorm'), value: vehicle.euro_norm }] : []),
  ];

  const currentImage = vehicle?.images?.[selectedImage] || vehicle?.images?.[0];

  return (
    <div className="bg-muted min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to={`/${lang}`} className="hover:text-foreground">{t('vehicle.breadcrumbHome')}</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/${lang}/search`} className="hover:text-foreground">{t('vehicle.breadcrumbSearch')}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{vehicle.brand} {vehicle.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* LEFT - Gallery */}
          <div>
            <div className="bg-card rounded-lg border overflow-hidden aspect-[16/10] flex items-center justify-center relative cursor-pointer">
              {currentImage ? (
                <img src={currentImage} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
                  <span className="text-6xl font-heading font-bold text-primary/15 relative z-10">{vehicle.brand} {vehicle.model}</span>
                </>
              )}
            </div>

            {/* Thumbnail gallery */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {vehicle.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className={`w-20 h-16 rounded object-cover border-2 flex-shrink-0 cursor-pointer transition-all ${
                      i === selectedImage ? 'border-primary ring-2 ring-primary/30' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    onClick={() => setSelectedImage(i)}
                  />
                ))}
              </div>
            )}

            {/* Specs */}
            <div className="mt-6 bg-card rounded-lg border p-6">
              <h2 className="font-heading font-bold text-lg mb-4">{t('vehicle.specs')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {specs.map((spec, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <spec.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{spec.label}</p>
                      <p className="text-sm font-medium capitalize">{String(spec.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {(vehicle.description || vehicle.description_translations?.[lang]) && (
              <div className="mt-6 bg-card rounded-lg border p-6">
                <h2 className="font-heading font-bold text-lg mb-3">{t('vehicle.description')}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {vehicle.description_translations?.[lang] || vehicle.description}
                </p>
              </div>
            )}

            {/* Equipment */}
            {(() => {
              const translatedEquipment = vehicle.equipment_translations?.[lang];
              const equipmentList = translatedEquipment
                ? translatedEquipment.split(',').map(s => s.trim()).filter(Boolean)
                : vehicle.equipment;
              return equipmentList && equipmentList.length > 0 ? (
                <div className="mt-6 bg-card rounded-lg border p-6">
                  <h2 className="font-heading font-bold text-lg mb-3">{t('vehicle.equipment')}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {equipmentList.map((eq, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                        {eq}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
          </div>

          {/* RIGHT - Info sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-card rounded-lg border p-6">
              <h1 className="font-heading font-bold text-xl">
                {vehicle.brand} {vehicle.model}
              </h1>

              <div className="mt-4">
                <span className="text-3xl font-heading font-bold">{Number(vehicle.price).toLocaleString('de-DE')} €</span>
              </div>
              {vehicle.monthly_price && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t('vehicle.from')} <span className="font-semibold text-foreground">{vehicle.monthly_price} €{t('vehicle.perMonth')}</span>
                  <span className="text-xs ml-1">*{t('vehicle.noDeposit')}</span>
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{t('search.guarantee12')}</Badge>
                <Badge variant="secondary">{t('search.satisfactionBadge')}</Badge>
              </div>

              <div className="mt-6 space-y-3">
                <Link to={`/${lang}/contact`}>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                    <Phone className="w-4 h-4 mr-2" />
                    {t('vehicle.contact')}
                  </Button>
                </Link>
                <Link to={`/${lang}/contact`}>
                  <Button variant="outline" className="w-full mt-3">
                    {t('vehicle.reserve')}
                  </Button>
                </Link>
                <Button
                  className="w-full"
                  variant={alreadyInCart ? "secondary" : "default"}
                  onClick={handleAddToCart}
                  disabled={alreadyInCart}
                >
                  {alreadyInCart ? <Check className="w-4 h-4 mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                  {alreadyInCart ? t('cart.alreadyInCart', 'Déjà dans le panier') : t('cart.addToCart', 'Ajouter au panier')}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => toast.success(t('vehicle.favoriteAdded'))}>
                  <Heart className="w-4 h-4 mr-2" />
                  {t('vehicle.addFavorite')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading font-bold text-xl mb-6">{t('vehicle.similar')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {similar.map(v => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetail;

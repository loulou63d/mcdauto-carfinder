import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { Heart, Phone, ChevronRight, Calendar, Gauge, Fuel, Settings2, Zap, DoorOpen, Palette, Leaf, Shield, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockVehicles } from '@/data/mockVehicles';
import VehicleCard from '@/components/VehicleCard';

const VehicleDetail = () => {
  const { t } = useTranslation();
  const { lang = 'de', id } = useParams();
  const vehicle = mockVehicles.find(v => v.id === id);

  if (!vehicle) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">{t('common.error')}</p>
      </div>
    );
  }

  const similar = mockVehicles.filter(v => v.id !== vehicle.id && v.status === 'published').slice(0, 4);

  const specs = [
    { icon: Calendar, label: t('vehicle.year'), value: vehicle.year },
    { icon: Gauge, label: t('vehicle.mileage'), value: `${vehicle.mileage.toLocaleString('de-DE')} km` },
    { icon: Fuel, label: t('vehicle.energy'), value: vehicle.energy },
    { icon: Settings2, label: t('vehicle.transmission'), value: vehicle.transmission === 'automatic' ? t('search.automatic') : t('search.manual') },
    ...(vehicle.power ? [{ icon: Zap, label: t('vehicle.power'), value: `${vehicle.power} CV` }] : []),
    ...(vehicle.doors ? [{ icon: DoorOpen, label: t('vehicle.doors'), value: vehicle.doors }] : []),
    ...(vehicle.color ? [{ icon: Palette, label: t('vehicle.color'), value: vehicle.color }] : []),
    ...(vehicle.co2 ? [{ icon: Leaf, label: t('vehicle.co2'), value: `${vehicle.co2} g/km` }] : []),
    ...(vehicle.euroNorm ? [{ icon: Shield, label: t('vehicle.euroNorm'), value: vehicle.euroNorm }] : []),
    { icon: MapPin, label: t('vehicle.location'), value: vehicle.location },
  ];

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
            <div className="bg-card rounded-lg border overflow-hidden aspect-[16/10] flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
              <span className="text-6xl font-heading font-bold text-primary/15 relative z-10">{vehicle.brand} {vehicle.model}</span>
              {vehicle.promoBadge && (
                <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground text-sm z-10">
                  {vehicle.promoBadge}
                </Badge>
              )}
            </div>

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
            {vehicle.description && (
              <div className="mt-6 bg-card rounded-lg border p-6">
                <h2 className="font-heading font-bold text-lg mb-3">{t('vehicle.description')}</h2>
                <p className="text-muted-foreground leading-relaxed">{vehicle.description}</p>
              </div>
            )}

            {/* Equipment */}
            {vehicle.equipment.length > 0 && (
              <div className="mt-6 bg-card rounded-lg border p-6">
                <h2 className="font-heading font-bold text-lg mb-3">{t('vehicle.equipment')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {vehicle.equipment.map((eq, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {eq}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - Info sticky */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-card rounded-lg border p-6">
              <h1 className="font-heading font-bold text-xl">
                {vehicle.brand} {vehicle.model}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">{vehicle.version}</p>

              <div className="mt-4">
                <span className="text-3xl font-heading font-bold">{vehicle.price.toLocaleString('de-DE')} €</span>
              </div>
              {vehicle.monthlyPrice && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t('vehicle.from')} <span className="font-semibold text-foreground">{vehicle.monthlyPrice} €{t('vehicle.perMonth')}</span>
                  <span className="text-xs ml-1">*{t('vehicle.noDeposit')}</span>
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="secondary">{t('search.guarantee12')}</Badge>
                <Badge variant="secondary">{t('search.satisfactionBadge')}</Badge>
              </div>

              <div className="mt-6 space-y-3">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('vehicle.contact')}
                </Button>
                <Button variant="outline" className="w-full">
                  {t('vehicle.reserve')}
                </Button>
                <Button variant="ghost" className="w-full">
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

import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface VehicleCompareData {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  energy: string;
  transmission?: string;
  power?: string;
  doors?: number;
  color?: string;
  co2?: string;
  category?: string;
  image?: string;
}

export function VehicleCompareInline({ vehicles }: { vehicles: VehicleCompareData[] }) {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();

  if (!vehicles || vehicles.length < 2) return null;

  const specs: Array<{ key: string; label: string; format: (v: VehicleCompareData) => string; best?: string }> = [
    { key: 'price', label: t('search.price', { defaultValue: 'Preis' }), format: (v) => `${v.price?.toLocaleString('de-DE')} €`, best: 'min' },
    { key: 'year', label: t('vehicle.year', { defaultValue: 'Baujahr' }), format: (v) => String(v.year), best: 'max' },
    { key: 'mileage', label: t('vehicle.mileage', { defaultValue: 'km' }), format: (v) => `${v.mileage?.toLocaleString('de-DE')} km`, best: 'min' },
    { key: 'energy', label: t('vehicle.energy', { defaultValue: 'Kraftstoff' }), format: (v) => v.energy || '-' },
    { key: 'transmission', label: t('vehicle.transmission', { defaultValue: 'Getriebe' }), format: (v) => v.transmission || '-' },
    { key: 'power', label: t('vehicle.power', { defaultValue: 'Leistung' }), format: (v) => v.power || '-' },
    { key: 'doors', label: t('vehicle.doors', { defaultValue: 'Türen' }), format: (v) => v.doors ? String(v.doors) : '-' },
    { key: 'color', label: t('vehicle.color', { defaultValue: 'Farbe' }), format: (v) => v.color || '-' },
    { key: 'co2', label: t('vehicle.co2', { defaultValue: 'CO2' }), format: (v) => v.co2 || '-' },
    { key: 'category', label: t('search.category', { defaultValue: 'Kategorie' }), format: (v) => v.category || '-' },
  ];

  const getBestIndex = (key: string, dir?: string) => {
    if (!dir) return -1;
    const vals = vehicles.map(v => Number((v as any)[key]) || 0);
    if (dir === 'min') return vals.indexOf(Math.min(...vals));
    return vals.indexOf(Math.max(...vals));
  };

  return (
    <div className="my-2 rounded-xl border bg-card overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-2 text-left font-medium text-muted-foreground"></th>
            {vehicles.map((v, i) => (
              <th key={i} className="p-2 text-center min-w-[120px]">
                {v.image && <img src={v.image} alt={`${v.brand} ${v.model}`} className="w-full h-16 object-cover rounded mb-1" />}
                <a href={`/${lang}/vehicle/${v.id}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline text-[11px]">
                  {v.brand} {v.model}
                </a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specs.map(spec => {
            const bestIdx = getBestIndex(spec.key, spec.best);
            return (
              <tr key={spec.key} className="border-b last:border-0">
                <td className="p-2 font-medium text-muted-foreground whitespace-nowrap">{spec.label}</td>
                {vehicles.map((v, i) => (
                  <td key={i} className={`p-2 text-center ${i === bestIdx ? 'text-primary font-bold' : ''}`}>
                    {spec.format(v)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

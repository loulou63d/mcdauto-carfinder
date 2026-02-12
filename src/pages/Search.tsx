import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import VehicleCard from '@/components/VehicleCard';
import { mockVehicles, popularBrands, energyTypes, categoryTypes } from '@/data/mockVehicles';

const SearchPage = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand') ? [searchParams.get('brand')!] : []
  );
  const [selectedEnergies, setSelectedEnergies] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  );
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [priceMax, setPriceMax] = useState<number>(100000);
  const [brandSearch, setBrandSearch] = useState('');

  const filtered = useMemo(() => {
    let results = mockVehicles.filter(v => v.status === 'published');
    if (selectedBrands.length > 0) results = results.filter(v => selectedBrands.includes(v.brand));
    if (selectedEnergies.length > 0) results = results.filter(v => selectedEnergies.includes(v.energy));
    if (selectedCategories.length > 0) results = results.filter(v => selectedCategories.includes(v.category));
    if (selectedTransmissions.length > 0) results = results.filter(v => selectedTransmissions.includes(v.transmission));
    if (priceMax < 100000) results = results.filter(v => v.price <= priceMax);

    const q = searchParams.get('q')?.toLowerCase();
    if (q) results = results.filter(v => `${v.brand} ${v.model} ${v.version}`.toLowerCase().includes(q));

    if (sortBy === 'priceAsc') results.sort((a, b) => a.price - b.price);
    else if (sortBy === 'priceDesc') results.sort((a, b) => b.price - a.price);
    else if (sortBy === 'year') results.sort((a, b) => b.year - a.year);
    else if (sortBy === 'mileage') results.sort((a, b) => a.mileage - b.mileage);

    return results;
  }, [selectedBrands, selectedEnergies, selectedCategories, selectedTransmissions, priceMax, sortBy, searchParams]);

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const clearAll = () => {
    setSelectedBrands([]);
    setSelectedEnergies([]);
    setSelectedCategories([]);
    setSelectedTransmissions([]);
    setPriceMax(100000);
  };

  const activeCount = selectedBrands.length + selectedEnergies.length + selectedCategories.length + selectedTransmissions.length + (priceMax < 100000 ? 1 : 0);

  const filteredBrands = popularBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="border-b pb-4 mb-4">
      <h4 className="font-heading font-semibold text-sm mb-3">{title}</h4>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-muted">
      <div className="container mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-heading font-bold text-xl">
            {filtered.length} {t('search.results')}
          </h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              {t('search.filters')} {activeCount > 0 && `(${activeCount})`}
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-card">
                <SelectValue placeholder={t('search.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">{t('search.popularity')}</SelectItem>
                <SelectItem value="priceAsc">{t('search.priceAsc')}</SelectItem>
                <SelectItem value="priceDesc">{t('search.priceDesc')}</SelectItem>
                <SelectItem value="year">{t('search.yearLabel')}</SelectItem>
                <SelectItem value="mileage">{t('search.mileageLabel')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-6">
          {/* SIDEBAR */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-card p-6 overflow-y-auto' : 'hidden'} md:block md:static md:w-72 md:shrink-0`}>
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="font-heading font-bold text-lg">{t('search.filters')}</h3>
              <div className="flex gap-2">
                {activeCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAll} className="text-accent">
                    {t('search.clearAll')}
                  </Button>
                )}
                <button className="md:hidden" onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-card md:bg-transparent rounded-lg md:border md:p-4">
              {/* Brands */}
              <FilterSection title={t('search.brand')}>
                <Input
                  placeholder="Ex: Renault"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="mb-2 h-8 text-sm"
                />
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {filteredBrands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleFilter(selectedBrands, setSelectedBrands, brand)}
                      />
                      {brand}
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Energy */}
              <FilterSection title={t('search.energy')}>
                <div className="space-y-2">
                  {energyTypes.map(energy => (
                    <label key={energy} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                      <Checkbox
                        checked={selectedEnergies.includes(energy)}
                        onCheckedChange={() => toggleFilter(selectedEnergies, setSelectedEnergies, energy)}
                      />
                      {energy.replace('_', ' ')}
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Category */}
              <FilterSection title={t('search.category')}>
                <div className="space-y-2">
                  {categoryTypes.map(cat => (
                    <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer capitalize">
                      <Checkbox
                        checked={selectedCategories.includes(cat)}
                        onCheckedChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat)}
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Transmission */}
              <FilterSection title={t('search.transmission')}>
                <div className="space-y-2">
                  {['automatic', 'manual'].map(tr => (
                    <label key={tr} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedTransmissions.includes(tr)}
                        onCheckedChange={() => toggleFilter(selectedTransmissions, setSelectedTransmissions, tr)}
                      />
                      {t(`search.${tr}`)}
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Price */}
              <FilterSection title={t('search.price')}>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">0 €</span>
                  <input
                    type="range"
                    min={5000}
                    max={100000}
                    step={1000}
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium">{priceMax >= 100000 ? '100k+' : `${(priceMax / 1000).toFixed(0)}k`} €</span>
                </div>
              </FilterSection>
            </div>
          </aside>

          {/* RESULTS GRID */}
          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg">{t('common.error')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;

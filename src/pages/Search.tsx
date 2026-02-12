import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronRight, Search } from 'lucide-react';
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true, brands: true, energy: true, transmission: true, price: true,
  });

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
    setSelectedBrands([]); setSelectedEnergies([]); setSelectedCategories([]); setSelectedTransmissions([]); setPriceMax(100000);
  };

  const activeCount = selectedBrands.length + selectedEnergies.length + selectedCategories.length + selectedTransmissions.length + (priceMax < 100000 ? 1 : 0);
  const filteredBrands = popularBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));

  const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const FilterSection = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-b pb-4 mb-4">
      <button onClick={() => toggleSection(id)} className="flex items-center justify-between w-full text-left mb-3">
        <h4 className="font-heading font-semibold text-sm">{title}</h4>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections[id] ? 'rotate-180' : ''}`} />
      </button>
      {expandedSections[id] && children}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to={`/${lang}`} className="hover:text-foreground link-primary">{t('vehicle.breadcrumbHome')}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{t('search.title')}</span>
          </nav>
        </div>
      </div>

      {/* Page title */}
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-xl md:text-2xl font-heading font-bold text-center mb-6">
          {t('search.title')}
        </h1>

        {/* Filter pills - mobile */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          <Button variant="outline" size="sm" className="shrink-0" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="w-4 h-4 mr-1" />
            {t('search.filters')} {activeCount > 0 && `(${activeCount})`}
          </Button>
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground text-lg">{filtered.length}</span> {t('search.results')}
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground hidden sm:inline">{t('search.sortBy')} :</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] h-9 text-sm border-0 font-medium link-primary">
                <SelectValue />
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
          {/* SIDEBAR — autosphere style */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-background p-5 overflow-y-auto' : 'hidden'} md:block md:static md:w-[280px] md:shrink-0`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg">
                  {t('search.filters')} {activeCount > 0 && <span className="text-primary">({activeCount})</span>}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button onClick={clearAll} className="text-sm link-primary hover:underline">{t('search.clearAll')}</button>
                )}
                <button className="md:hidden" onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search within filters */}
            <div className="relative mb-5">
              <Input placeholder="Mots-clés" className="pr-10 h-9 text-sm bg-secondary" />
              <button className="absolute right-1 top-1 w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <Search className="w-3.5 h-3.5 text-primary-foreground" />
              </button>
            </div>

            {/* Categories */}
            <FilterSection id="categories" title={t('search.category')}>
              <div className="space-y-2.5">
                {categoryTypes.map(cat => {
                  const count = mockVehicles.filter(v => v.category === cat && v.status === 'published').length;
                  return (
                    <label key={cat} className="flex items-center gap-2.5 text-sm cursor-pointer capitalize">
                      <Checkbox
                        checked={selectedCategories.includes(cat)}
                        onCheckedChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat)}
                      />
                      <span className="flex-1">{cat}</span>
                      <span className="text-muted-foreground text-xs">({count})</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* Brands */}
            <FilterSection id="brands" title={t('search.brand')}>
              <Input
                placeholder="Ex : Renault"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="mb-3 h-8 text-sm bg-secondary"
              />
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {filteredBrands.map(brand => {
                  const count = mockVehicles.filter(v => v.brand === brand && v.status === 'published').length;
                  return (
                    <label key={brand} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedBrands.includes(brand)}
                        onCheckedChange={() => toggleFilter(selectedBrands, setSelectedBrands, brand)}
                      />
                      <span className="flex-1">{brand}</span>
                      <span className="text-muted-foreground text-xs">({count})</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* Energy */}
            <FilterSection id="energy" title={t('search.energy')}>
              <div className="space-y-2.5">
                {energyTypes.map(energy => {
                  const count = mockVehicles.filter(v => v.energy === energy && v.status === 'published').length;
                  return (
                    <label key={energy} className="flex items-center gap-2.5 text-sm cursor-pointer capitalize">
                      <Checkbox
                        checked={selectedEnergies.includes(energy)}
                        onCheckedChange={() => toggleFilter(selectedEnergies, setSelectedEnergies, energy)}
                      />
                      <span className="flex-1">{energy.replace('_', ' ')}</span>
                      <span className="text-muted-foreground text-xs">({count})</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* Transmission */}
            <FilterSection id="transmission" title={t('search.transmission')}>
              <div className="space-y-2.5">
                {['automatic', 'manual'].map(tr => {
                  const count = mockVehicles.filter(v => v.transmission === tr && v.status === 'published').length;
                  return (
                    <label key={tr} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedTransmissions.includes(tr)}
                        onCheckedChange={() => toggleFilter(selectedTransmissions, setSelectedTransmissions, tr)}
                      />
                      <span className="flex-1">{t(`search.${tr}`)}</span>
                      <span className="text-muted-foreground text-xs">({count})</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* Price */}
            <FilterSection id="price" title={t('search.price')}>
              <div className="space-y-3">
                <input
                  type="range"
                  min={5000}
                  max={100000}
                  step={1000}
                  value={priceMax}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 €</span>
                  <span className="font-medium text-foreground">{priceMax >= 100000 ? '100 000+ €' : `${priceMax.toLocaleString('fr-FR')} €`}</span>
                </div>
              </div>
            </FilterSection>
          </aside>

          {/* RESULTS GRID */}
          <div className="flex-1 min-w-0">
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

import { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, ChevronRight, ChevronLeft, Search, Loader2, RotateCcw, Flame, TrendingDown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import VehicleCard from '@/components/VehicleCard';
import { useVehicles } from '@/hooks/useVehicles';

const ITEMS_PER_PAGE = 24;

const SearchPage = () => {
  const { t } = useTranslation();
  const { lang = 'de' } = useParams();
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('popularity');
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand') ? [searchParams.get('brand')!] : []
  );
  const [selectedEnergies, setSelectedEnergies] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  );
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 250000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2010, 2026]);
  const [mileageMax, setMileageMax] = useState<number>(200000);
  const [brandSearch, setBrandSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: true, brands: true, energy: true, transmission: true, price: true, year: false, mileage: false,
  });

  const resultsRef = useRef<HTMLDivElement>(null);

  const { data: vehicles = [], isLoading } = useVehicles();

  // Extract dynamic filter options from actual data
  const dynamicBrands = useMemo(() => {
    const brands = new Map<string, string>();
    vehicles.forEach(v => {
      const normalized = v.brand.trim();
      const key = normalized.toUpperCase();
      if (!brands.has(key) || normalized[0] === normalized[0].toUpperCase() && normalized[1] !== normalized[1]?.toUpperCase()) {
        brands.set(key, normalized);
      }
    });
    return Array.from(brands.values()).sort((a, b) => a.localeCompare(b));
  }, [vehicles]);

  const dynamicEnergies = useMemo(() => {
    return [...new Set(vehicles.map(v => v.energy))].sort();
  }, [vehicles]);

  const dynamicCategories = useMemo(() => {
    return [...new Set(vehicles.filter(v => v.category).map(v => v.category!))].sort();
  }, [vehicles]);

  const dynamicTransmissions = useMemo(() => {
    return [...new Set(vehicles.map(v => v.transmission))].sort();
  }, [vehicles]);

  const dynamicModels = useMemo(() => {
    if (selectedBrands.length === 0) return [];
    return [...new Set(
      vehicles
        .filter(v => selectedBrands.some(b => v.brand.toUpperCase() === b.toUpperCase()))
        .map(v => v.model)
    )].sort();
  }, [vehicles, selectedBrands]);

  const [selectedModels, setSelectedModels] = useState<string[]>([]);

  const translateFilter = (key: string, value: string) => {
    const translated = t(`${key}.${value}`, { defaultValue: '' });
    return translated || value;
  };

  // ── Top 30 Promo: cheapest vehicles with images ──
  const promoVehicles = useMemo(() => {
    return [...vehicles]
      .filter(v => v.images && v.images.length > 0)
      .sort((a, b) => Number(a.price) - Number(b.price))
      .slice(0, 30);
  }, [vehicles]);

  // ── Top 20 Best Deals: best price/year ratio ──
  const bestDeals = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [...vehicles]
      .filter(v => v.images && v.images.length > 0 && v.year >= 2018)
      .map(v => ({ ...v, score: Number(v.price) / Math.max(1, v.year - 2015) }))
      .sort((a, b) => a.score - b.score)
      .slice(0, 20);
  }, [vehicles]);

  const filtered = useMemo(() => {
    let results = [...vehicles];

    const q = keyword.toLowerCase().trim();
    if (q) results = results.filter(v =>
      `${v.brand} ${v.model} ${v.category || ''} ${v.color || ''}`.toLowerCase().includes(q)
    );

    if (selectedBrands.length > 0) results = results.filter(v =>
      selectedBrands.some(b => v.brand.toUpperCase() === b.toUpperCase())
    );
    if (selectedModels.length > 0) results = results.filter(v => selectedModels.includes(v.model));
    if (selectedEnergies.length > 0) results = results.filter(v => selectedEnergies.includes(v.energy));
    if (selectedCategories.length > 0) results = results.filter(v =>
      v.category && selectedCategories.some(c => c.toLowerCase() === v.category!.toLowerCase())
    );
    if (selectedTransmissions.length > 0) results = results.filter(v => selectedTransmissions.includes(v.transmission));

    results = results.filter(v => Number(v.price) >= priceRange[0] && Number(v.price) <= priceRange[1]);
    results = results.filter(v => v.year >= yearRange[0] && v.year <= yearRange[1]);
    if (mileageMax < 200000) results = results.filter(v => v.mileage <= mileageMax);

    if (sortBy === 'priceAsc') results.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sortBy === 'priceDesc') results.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sortBy === 'year') results.sort((a, b) => b.year - a.year);
    else if (sortBy === 'mileage') results.sort((a, b) => a.mileage - b.mileage);

    return results;
  }, [vehicles, selectedBrands, selectedModels, selectedEnergies, selectedCategories, selectedTransmissions, priceRange, yearRange, mileageMax, sortBy, keyword]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  // Reset page when filters change
  useMemo(() => { setCurrentPage(1); }, [selectedBrands, selectedModels, selectedEnergies, selectedCategories, selectedTransmissions, priceRange, yearRange, mileageMax, sortBy, keyword]);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
  };

  const clearAll = () => {
    setSelectedBrands([]); setSelectedModels([]); setSelectedEnergies([]); setSelectedCategories([]);
    setSelectedTransmissions([]); setPriceRange([0, 250000]); setYearRange([2010, 2026]); setMileageMax(200000);
    setKeyword('');
  };

  const activeCount = selectedBrands.length + selectedModels.length + selectedEnergies.length + selectedCategories.length +
    selectedTransmissions.length + (priceRange[0] > 0 || priceRange[1] < 250000 ? 1 : 0) +
    (yearRange[0] > 2010 || yearRange[1] < 2026 ? 1 : 0) + (mileageMax < 200000 ? 1 : 0) + (keyword ? 1 : 0);

  const hasActiveFilters = activeCount > 0;

  const filteredBrands = dynamicBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));

  const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  const FilterSection = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div className="border-b border-border/50 pb-4 mb-4">
      <button onClick={() => toggleSection(id)} className="flex items-center justify-between w-full text-left mb-3">
        <h4 className="font-heading font-semibold text-sm">{title}</h4>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections[id] ? 'rotate-180' : ''}`} />
      </button>
      {expandedSections[id] && children}
    </div>
  );

  const activeFilters = [
    ...selectedBrands.map(b => ({ label: b, onRemove: () => setSelectedBrands(prev => prev.filter(v => v !== b)) })),
    ...selectedModels.map(m => ({ label: m, onRemove: () => setSelectedModels(prev => prev.filter(v => v !== m)) })),
    ...selectedCategories.map(c => ({ label: translateFilter('categoryValues', c) || c, onRemove: () => setSelectedCategories(prev => prev.filter(v => v !== c)) })),
    ...selectedEnergies.map(e => ({ label: translateFilter('energyValues', e), onRemove: () => setSelectedEnergies(prev => prev.filter(v => v !== e)) })),
    ...selectedTransmissions.map(tr => ({ label: translateFilter('transmissionValues', tr), onRemove: () => setSelectedTransmissions(prev => prev.filter(v => v !== tr)) })),
  ];

  // Pagination range
  const pageRange = useMemo(() => {
    const range: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }, [currentPage, totalPages]);

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

      {/* ══════ TOP 30 PROMO CAROUSEL ══════ */}
      {!hasActiveFilters && promoVehicles.length > 0 && (
        <PromoCarousel vehicles={promoVehicles} lang={lang} t={t} />
      )}

      {/* ══════ TOP 20 BEST DEALS GRID ══════ */}
      {!hasActiveFilters && bestDeals.length > 0 && (
        <section className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold">
                {t('search.bestDeals', { defaultValue: 'Top 20 — Meilleures Affaires' })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('search.bestDealsDesc', { defaultValue: 'Le meilleur rapport qualité-prix-année' })}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {bestDeals.map(vehicle => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} isBestDeal />
            ))}
          </div>
        </section>
      )}

      <div className="container mx-auto px-4 py-6" ref={resultsRef}>
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t('hero.searchPlaceholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10 h-12 text-base rounded-full border-2 border-primary/20 focus:border-primary"
            />
            {keyword && (
              <button onClick={() => setKeyword('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* Active filter pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map((f, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {f.label}
                <button onClick={f.onRemove}><X className="w-3 h-3" /></button>
              </span>
            ))}
            <button onClick={clearAll} className="inline-flex items-center gap-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground">
              <RotateCcw className="w-3 h-3" />
              {t('search.clearAll')}
            </button>
          </div>
        )}

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="md:hidden shrink-0" onClick={() => setShowFilters(true)}>
              <SlidersHorizontal className="w-4 h-4 mr-1" />
              {t('search.filters')} {activeCount > 0 && `(${activeCount})`}
            </Button>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground text-lg">{filtered.length}</span> {t('search.results')}
              {totalPages > 1 && (
                <span className="ml-2 text-xs">
                  — {t('search.page', { defaultValue: 'Page' })} {currentPage}/{totalPages}
                </span>
              )}
            </p>
          </div>
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
          {/* SIDEBAR */}
          <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-background p-5 overflow-y-auto' : 'hidden'} md:block md:static md:w-[280px] md:shrink-0`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-lg">
                {t('search.filters')} {activeCount > 0 && <span className="text-primary">({activeCount})</span>}
              </h3>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button onClick={clearAll} className="text-sm link-primary hover:underline">{t('search.clearAll')}</button>
                )}
                <button className="md:hidden" onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Categories */}
            <FilterSection id="categories" title={t('search.category')}>
              <div className="space-y-2.5">
                {dynamicCategories.map(cat => {
                  const count = vehicles.filter(v => v.category && v.category.toLowerCase() === cat.toLowerCase()).length;
                  return (
                    <label key={cat} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <Checkbox checked={selectedCategories.some(c => c.toLowerCase() === cat.toLowerCase())} onCheckedChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat)} />
                      <span className="flex-1">{translateFilter('categoryValues', cat) || cat}</span>
                      <span className="text-muted-foreground text-xs">({count})</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* Brands */}
            <FilterSection id="brands" title={t('search.brand')}>
              <Input placeholder={`Ex : BMW`} value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)} className="mb-3 h-8 text-sm bg-secondary" />
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {filteredBrands.map(brand => {
                  const count = vehicles.filter(v => v.brand.toUpperCase() === brand.toUpperCase()).length;
                  return (
                    <label key={brand} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <Checkbox checked={selectedBrands.some(b => b.toUpperCase() === brand.toUpperCase())} onCheckedChange={() => toggleFilter(selectedBrands, setSelectedBrands, brand)} />
                      <span className="flex-1">{brand}</span>
                      <span className="text-muted-foreground text-xs">({count})</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* Models */}
            {dynamicModels.length > 0 && (
              <FilterSection id="models" title={t('search.model')}>
                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {dynamicModels.map(model => {
                    const count = vehicles.filter(v => v.model === model && selectedBrands.some(b => v.brand.toUpperCase() === b.toUpperCase())).length;
                    return (
                      <label key={model} className="flex items-center gap-2.5 text-sm cursor-pointer">
                        <Checkbox checked={selectedModels.includes(model)} onCheckedChange={() => toggleFilter(selectedModels, setSelectedModels, model)} />
                        <span className="flex-1">{model}</span>
                        <span className="text-muted-foreground text-xs">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </FilterSection>
            )}

            {/* Energy */}
            <FilterSection id="energy" title={t('search.energy')}>
              <div className="space-y-2.5">
                {dynamicEnergies.map(energy => {
                  const count = vehicles.filter(v => v.energy === energy).length;
                  return (
                    <label key={energy} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <Checkbox checked={selectedEnergies.includes(energy)} onCheckedChange={() => toggleFilter(selectedEnergies, setSelectedEnergies, energy)} />
                      <span className="flex-1">{translateFilter('energyValues', energy)}</span>
                      <span className="text-muted-foreground text-xs">({count})</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* Transmission */}
            <FilterSection id="transmission" title={t('search.transmission')}>
              <div className="space-y-2.5">
                {dynamicTransmissions.map(tr => {
                  const count = vehicles.filter(v => v.transmission === tr).length;
                  return (
                    <label key={tr} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <Checkbox checked={selectedTransmissions.includes(tr)} onCheckedChange={() => toggleFilter(selectedTransmissions, setSelectedTransmissions, tr)} />
                      <span className="flex-1">{translateFilter('transmissionValues', tr)}</span>
                      <span className="text-muted-foreground text-xs">({count})</span>
                    </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* Price range */}
            <FilterSection id="price" title={t('search.price')}>
              <div className="space-y-4">
                <Slider min={0} max={250000} step={1000} value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{priceRange[0].toLocaleString('de-DE')} €</span>
                  <span>{priceRange[1] >= 250000 ? '250 000+ €' : `${priceRange[1].toLocaleString('de-DE')} €`}</span>
                </div>
              </div>
            </FilterSection>

            {/* Year range */}
            <FilterSection id="year" title={t('search.yearLabel')}>
              <div className="space-y-4">
                <Slider min={2010} max={2026} step={1} value={yearRange} onValueChange={(v) => setYearRange(v as [number, number])} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{yearRange[0]}</span>
                  <span>{yearRange[1]}</span>
                </div>
              </div>
            </FilterSection>

            {/* Mileage */}
            <FilterSection id="mileage" title={t('search.mileageLabel')}>
              <div className="space-y-4">
                <Slider min={0} max={200000} step={5000} value={[mileageMax]} onValueChange={(v) => setMileageMax(v[0])} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0 km</span>
                  <span>{mileageMax >= 200000 ? '200 000+ km' : `${mileageMax.toLocaleString('de-DE')} km`}</span>
                </div>
              </div>
            </FilterSection>

            {/* Apply on mobile */}
            <div className="md:hidden mt-4">
              <Button className="w-full" onClick={() => setShowFilters(false)}>
                {t('search.filters')} — {filtered.length} {t('search.results')}
              </Button>
            </div>
          </aside>

          {/* RESULTS GRID + PAGINATION */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">{t('search.noResults')}</p>
                <p className="text-sm mt-2">{t('search.noResultsHint')}</p>
                {activeCount > 0 && (
                  <Button variant="outline" className="mt-4" onClick={clearAll}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {t('search.clearAll')}
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedResults.map(vehicle => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-8 mb-4">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {pageRange[0] > 1 && (
                      <>
                        <Button variant={currentPage === 1 ? 'default' : 'outline'} size="sm" className="h-9 w-9" onClick={() => goToPage(1)}>1</Button>
                        {pageRange[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
                      </>
                    )}

                    {pageRange.map(p => (
                      <Button
                        key={p}
                        variant={currentPage === p ? 'default' : 'outline'}
                        size="sm"
                        className="h-9 w-9"
                        onClick={() => goToPage(p)}
                      >
                        {p}
                      </Button>
                    ))}

                    {pageRange[pageRange.length - 1] < totalPages && (
                      <>
                        {pageRange[pageRange.length - 1] < totalPages - 1 && <span className="px-1 text-muted-foreground">…</span>}
                        <Button variant={currentPage === totalPages ? 'default' : 'outline'} size="sm" className="h-9 w-9" onClick={() => goToPage(totalPages)}>{totalPages}</Button>
                      </>
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════ PROMO CAROUSEL COMPONENT ══════ */
const PromoCarousel = ({ vehicles, lang, t }: { vehicles: any[]; lang: string; t: any }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="bg-gradient-to-r from-primary/5 to-accent/5 py-8 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Flame className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold">
                {t('search.promoTitle', { defaultValue: 'Top 30 — Promotions' })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('search.promoDesc', { defaultValue: 'Nos meilleurs prix du moment' })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => scroll('left')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => scroll('right')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {vehicles.map((vehicle, i) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className="min-w-[260px] max-w-[280px] snap-start shrink-0"
            >
              <VehicleCard vehicle={vehicle} isPromo />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SearchPage;

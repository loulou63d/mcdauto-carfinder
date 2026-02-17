import { useState, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { Loader2, Download, Sparkles, Check, AlertTriangle, Link2, FolderSearch, Zap, Square, Car } from 'lucide-react';

type VehicleData = {
  year?: number;
  mileage?: number;
  transmission?: string;
  energy?: string;
  color?: string | null;
  power?: string | null;
  doors?: number | null;
};

type ScrapedProduct = {
  title: string;
  price: number | null;
  images: string[];
  brand: string | null;
  description: string;
  source_url: string;
  vehicleData?: VehicleData;
  equipment?: string[];
  category?: string | null;
  euroNorm?: string | null;
};

type ProductImportItem = {
  scraped: ScrapedProduct;
  selected: boolean;
  status: 'pending' | 'scraping' | 'generating' | 'blurring' | 'ready' | 'importing' | 'imported' | 'duplicate' | 'error';
  error?: string;
};

type BrandConfig = {
  name: string;
  slug: string;
  target: number;
  existing: number;
  needed: number;
  imported: number;
  errors: number;
  status: 'pending' | 'scanning' | 'importing' | 'done' | 'error';
};

const BRAND_LIST: { name: string; slug: string; target: number }[] = [
  { name: "Alfa Romeo", slug: "alfa-romeo", target: 5 },
  { name: "Audi", slug: "audi", target: 8 },
  { name: "BMW", slug: "bmw", target: 8 },
  { name: "Citroën", slug: "citroen", target: 6 },
  { name: "Cupra", slug: "cupra", target: 3 },
  { name: "Dacia", slug: "dacia", target: 5 },
  { name: "DS", slug: "ds", target: 3 },
  { name: "Fiat", slug: "fiat", target: 6 },
  { name: "Ford", slug: "ford", target: 6 },
  { name: "Honda", slug: "honda", target: 4 },
  { name: "Hyundai", slug: "hyundai", target: 5 },
  { name: "Jeep", slug: "jeep", target: 5 },
  { name: "Kia", slug: "kia", target: 5 },
  { name: "Land Rover", slug: "land-rover", target: 5 },
  { name: "Lexus", slug: "lexus", target: 3 },
  { name: "Maserati", slug: "maserati", target: 3 },
  { name: "Mazda", slug: "mazda", target: 4 },
  { name: "Mercedes", slug: "mercedes-benz", target: 8 },
  { name: "Mini", slug: "mini", target: 4 },
  { name: "Nissan", slug: "nissan", target: 5 },
  { name: "Opel", slug: "opel", target: 5 },
  { name: "Peugeot", slug: "peugeot", target: 6 },
  { name: "Porsche", slug: "porsche", target: 3 },
  { name: "Renault", slug: "renault", target: 6 },
  { name: "Seat", slug: "seat", target: 4 },
  { name: "Skoda", slug: "skoda", target: 4 },
  { name: "Suzuki", slug: "suzuki", target: 4 },
  { name: "Tesla", slug: "tesla", target: 3 },
  { name: "Toyota", slug: "toyota", target: 6 },
  { name: "Volkswagen", slug: "volkswagen", target: 6 },
  { name: "Volvo", slug: "volvo", target: 5 },
];

const AdminImport = () => {
  const { toast } = useToast();

  // Single import state
  const [singleUrl, setSingleUrl] = useState('');
  const [singleProduct, setSingleProduct] = useState<ProductImportItem | null>(null);
  const [singleLoading, setSingleLoading] = useState(false);

  // Batch import state
  const [categoryUrl, setCategoryUrl] = useState('');
  const [batchLimit, setBatchLimit] = useState(20);
  const [batchUrls, setBatchUrls] = useState<string[]>([]);
  const [batchProducts, setBatchProducts] = useState<ProductImportItem[]>([]);
  const [batchScanning, setBatchScanning] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);

  // AutoFill state
  const [brands, setBrands] = useState<BrandConfig[]>([]);
  const [autoFillRunning, setAutoFillRunning] = useState(false);
  const [autoFillProgress, setAutoFillProgress] = useState(0);
  const [autoFillTotal, setAutoFillTotal] = useState(0);
  const stopRef = useRef(false);

  // ---- HELPERS ----
  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'outline', label: 'En attente' },
      scraping: { variant: 'secondary', label: 'Scraping...' },
      generating: { variant: 'secondary', label: 'IA...' },
      blurring: { variant: 'secondary', label: 'Floutage...' },
      ready: { variant: 'default', label: 'Prêt' },
      importing: { variant: 'secondary', label: 'Import...' },
      imported: { variant: 'default', label: '✓ Importé' },
      duplicate: { variant: 'destructive', label: 'Doublon' },
      error: { variant: 'destructive', label: 'Erreur' },
    };
    const s = map[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const brandStatusBadge = (status: string) => {
    const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      scanning: 'secondary',
      importing: 'secondary',
      done: 'default',
      error: 'destructive',
    };
    const labels: Record<string, string> = {
      pending: '⏳', scanning: '🔍', importing: '⬇️', done: '✓', error: '✗',
    };
    return <Badge variant={variantMap[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  // ---- SINGLE IMPORT ----
  const importVehicle = async (item: ProductImportItem): Promise<'imported' | 'duplicate' | 'error'> => {
    // Dedup
    const { data: existingList } = await (supabaseAdmin as any)
      .from('vehicles').select('id').eq('source_url', item.scraped.source_url);
    if (existingList && existingList.length > 0) return 'duplicate';

    const vd = item.scraped.vehicleData || {};
    const year = vd.year || 2023;

    const vehicleData: any = {
      brand: item.scraped.brand || 'Non détecté',
      model: item.scraped.title,
      year,
      price: item.scraped.price || 0,
      mileage: vd.mileage || 0,
      transmission: vd.transmission || 'Manuelle',
      energy: vd.energy || 'Diesel',
      color: vd.color || null,
      power: vd.power || null,
      doors: vd.doors || 5,
      description: item.scraped.description,
      description_translations: {},
      equipment: item.scraped.equipment || [],
      equipment_translations: {},
      status: 'available',
      source_url: item.scraped.source_url,
      category: item.scraped.category || 'Berline',
      euro_norm: item.scraped.euroNorm || null,
    };

    const { data: vehicleResult, error: vehicleError } = await (supabaseAdmin as any)
      .from('vehicles').insert(vehicleData).select().single();
    if (vehicleError) throw vehicleError;

    // Insert images first with external URLs
    if (item.scraped.images?.length > 0) {
      const imageData = item.scraped.images.map((url, idx) => ({
        vehicle_id: vehicleResult.id,
        image_url: url,
        position: idx,
      }));
      await supabaseAdmin.from('vehicle_images').insert(imageData);
    }

    // Download images to storage (non-blocking)
    try {
      await supabaseAdmin.functions.invoke('download-vehicle-images', {
        body: { vehicle_id: vehicleResult.id, image_urls: item.scraped.images },
      });
    } catch (e) {
      console.warn('Image download failed:', e);
    }

    return 'imported';
  };

  const handleScrape = async () => {
    if (!singleUrl.trim()) return;
    setSingleLoading(true);
    setSingleProduct({ scraped: {} as ScrapedProduct, selected: true, status: 'scraping' });

    try {
      const { data, error } = await supabaseAdmin.functions.invoke('scrape-product', {
        body: { url: singleUrl },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Scrape failed');

      const scrapedData = data.data;

      // If no price, estimate
      if (!scrapedData.price) {
        try {
          const { data: priceData } = await supabaseAdmin.functions.invoke('estimate-vehicle-price', {
            body: {
              brand: scrapedData.brand || 'Unknown',
              model: scrapedData.title,
              year: scrapedData.vehicleData?.year || 2023,
              mileage: scrapedData.vehicleData?.mileage || 80000,
              energy: scrapedData.vehicleData?.energy || 'Diesel',
              category: scrapedData.category,
            },
          });
          if (priceData?.success && priceData.estimatedPrice) {
            scrapedData.price = priceData.estimatedPrice;
            toast({ title: 'Prix estimé', description: `${priceData.estimatedPrice}€` });
          }
        } catch {}
      }

      setSingleProduct({ scraped: scrapedData, selected: true, status: 'pending' });
    } catch (e: any) {
      toast({ title: 'Erreur de scraping', description: e.message, variant: 'destructive' });
      setSingleProduct(null);
    } finally {
      setSingleLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!singleProduct) return;
    setSingleProduct({ ...singleProduct, status: 'generating' });
    try {
      const { data, error } = await supabaseAdmin.functions.invoke('generate-product-content', {
        body: {
          title: singleProduct.scraped.title,
          description: singleProduct.scraped.description,
          brand: singleProduct.scraped.brand,
          price: singleProduct.scraped.price,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Generation failed');

      setSingleProduct({ ...singleProduct, status: 'ready' });
      toast({ title: '✅ Contenu IA généré' });
    } catch (e: any) {
      toast({ title: 'Erreur IA', description: e.message, variant: 'destructive' });
      setSingleProduct({ ...singleProduct, status: 'pending', error: e.message });
    }
  };

  const handleImportSingle = async () => {
    if (!singleProduct) return;
    setSingleProduct({ ...singleProduct, status: 'importing' });
    try {
      const result = await importVehicle(singleProduct);
      setSingleProduct({ ...singleProduct, status: result });
      if (result === 'imported') {
        toast({ title: '✅ Véhicule importé !', description: `${singleProduct.scraped.brand} ${singleProduct.scraped.title}` });
      } else if (result === 'duplicate') {
        toast({ title: 'Doublon détecté', variant: 'destructive' });
      }
    } catch (e: any) {
      setSingleProduct({ ...singleProduct, status: 'error', error: e.message });
      toast({ title: 'Erreur import', description: e.message, variant: 'destructive' });
    }
  };

  // ---- BATCH IMPORT ----
  const handleScanCategory = async () => {
    if (!categoryUrl.trim()) return;
    setBatchScanning(true);
    setBatchUrls([]);
    setBatchProducts([]);

    try {
      const { data, error } = await supabaseAdmin.functions.invoke('scrape-category', {
        body: { url: categoryUrl, limit: batchLimit },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Scan failed');

      setBatchUrls(data.data.urls);
      toast({ title: `${data.data.urls.length} URLs trouvées` });
    } catch (e: any) {
      toast({ title: 'Erreur scan', description: e.message, variant: 'destructive' });
    } finally {
      setBatchScanning(false);
    }
  };

  const handleBatchScrape = async () => {
    setBatchProcessing(true);
    const items: ProductImportItem[] = [];

    for (const url of batchUrls) {
      try {
        const { data, error } = await supabaseAdmin.functions.invoke('scrape-product', { body: { url } });
        if (error || !data?.success) {
          items.push({ scraped: { title: url, price: null, images: [], brand: null, description: '', source_url: url }, selected: false, status: 'error', error: data?.error || 'Failed' });
        } else {
          items.push({ scraped: data.data, selected: true, status: 'pending' });
        }
        setBatchProducts([...items]);
      } catch {
        items.push({ scraped: { title: url, price: null, images: [], brand: null, description: '', source_url: url }, selected: false, status: 'error', error: 'Network error' });
        setBatchProducts([...items]);
      }
    }
    setBatchProcessing(false);
  };

  const handleBatchGenerateAndImport = async () => {
    setBatchProcessing(true);
    const selected = batchProducts.filter(p => p.selected && p.status === 'pending');
    let importedCount = 0;
    let dupCount = 0;
    let errorCount = 0;

    for (const item of selected) {
      const idx = batchProducts.indexOf(item);
      const updated = [...batchProducts];

      // Generate AI
      updated[idx] = { ...updated[idx], status: 'generating' };
      setBatchProducts([...updated]);

      try {
        await supabaseAdmin.functions.invoke('generate-product-content', {
          body: { title: item.scraped.title, description: item.scraped.description, brand: item.scraped.brand, price: item.scraped.price },
        });
      } catch {}

      // Import
      updated[idx] = { ...updated[idx], status: 'importing' };
      setBatchProducts([...updated]);

      try {
        const result = await importVehicle(item);
        updated[idx] = { ...updated[idx], status: result };
        if (result === 'imported') importedCount++;
        else if (result === 'duplicate') dupCount++;
        else errorCount++;
      } catch (e: any) {
        updated[idx] = { ...updated[idx], status: 'error', error: e.message };
        errorCount++;
      }
      setBatchProducts([...updated]);
    }

    setBatchProcessing(false);
    toast({
      title: '✅ Import en masse terminé !',
      description: `${importedCount} importé(s), ${dupCount} doublon(s), ${errorCount} erreur(s)`,
    });
  };

  const toggleBatchSelect = (index: number) => {
    const updated = [...batchProducts];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    setBatchProducts(updated);
  };

  const selectAll = () => {
    setBatchProducts(batchProducts.map(p => ({ ...p, selected: p.status === 'pending' })));
  };

  // ---- AUTO FILL ----
  const analyzeExisting = useCallback(async () => {
    const brandConfigs: BrandConfig[] = [];

    for (const b of BRAND_LIST) {
      const { count } = await (supabaseAdmin as any)
        .from('vehicles')
        .select('id', { count: 'exact', head: true })
        .ilike('brand', `%${b.name}%`);

      const existing = count || 0;
      brandConfigs.push({
        name: b.name,
        slug: b.slug,
        target: b.target,
        existing,
        needed: Math.max(0, b.target - existing),
        imported: 0,
        errors: 0,
        status: 'pending',
      });
    }

    setBrands(brandConfigs);
    const totalNeeded = brandConfigs.reduce((sum, b) => sum + b.needed, 0);
    setAutoFillTotal(totalNeeded);
    setAutoFillProgress(0);
    toast({ title: 'Analyse terminée', description: `${totalNeeded} véhicules à importer sur ${BRAND_LIST.reduce((s, b) => s + b.target, 0)} cible` });
  }, [toast]);

  const runAutoFill = async () => {
    stopRef.current = false;
    setAutoFillRunning(true);
    let progressCount = 0;

    // Sort brands: underrepresented first (most needed → least needed)
    const updatedBrands = [...brands].sort((a, b) => b.needed - a.needed);

    for (let bi = 0; bi < updatedBrands.length; bi++) {
      if (stopRef.current) break;
      const brand = updatedBrands[bi];
      if (brand.needed <= 0) {
        brand.status = 'done';
        setBrands([...updatedBrands]);
        continue;
      }

      // Scan category
      brand.status = 'scanning';
      setBrands([...updatedBrands]);

      try {
        const { data: catData, error: catError } = await supabaseAdmin.functions.invoke('scrape-category', {
          body: { url: `https://arielcar.it/marca/${brand.slug}/`, limit: brand.needed + 5 },
        });

        if (catError || !catData?.success) {
          brand.status = 'error';
          brand.errors++;
          setBrands([...updatedBrands]);
          continue;
        }

        const urls: string[] = catData.data.urls || [];
        brand.status = 'importing';
        setBrands([...updatedBrands]);

        let brandImported = 0;

        for (const url of urls) {
          if (stopRef.current) break;
          if (brandImported >= brand.needed) break;

          // Dedup check
          const { data: existCheck } = await (supabaseAdmin as any)
            .from('vehicles').select('id').eq('source_url', url);
          if (existCheck && existCheck.length > 0) continue;

          try {
            // Scrape
            const { data: prodData, error: prodError } = await supabaseAdmin.functions.invoke('scrape-product', {
              body: { url },
            });

            if (prodError || !prodData?.success) {
              brand.errors++;
              setBrands([...updatedBrands]);
              continue;
            }

            const scraped: ScrapedProduct = prodData.data;

            // Generate AI content
            try {
              await supabaseAdmin.functions.invoke('generate-product-content', {
                body: { title: scraped.title, description: scraped.description, brand: scraped.brand, price: scraped.price },
              });
            } catch {}

            // Import
            const item: ProductImportItem = { scraped, selected: true, status: 'pending' };
            const result = await importVehicle(item);

            if (result === 'imported') {
              brandImported++;
              brand.imported++;
              progressCount++;
              setAutoFillProgress(progressCount);
            } else if (result === 'duplicate') {
              // skip
            } else {
              brand.errors++;
            }
          } catch {
            brand.errors++;
          }

          setBrands([...updatedBrands]);
        }

        brand.status = brand.errors > 0 && brandImported === 0 ? 'error' : 'done';
      } catch {
        brand.status = 'error';
      }

      setBrands([...updatedBrands]);
    }

    setAutoFillRunning(false);
    const totalImported = updatedBrands.reduce((s, b) => s + b.imported, 0);
    const totalErrors = updatedBrands.reduce((s, b) => s + b.errors, 0);
    toast({ title: '✅ Remplissage terminé', description: `${totalImported} importés, ${totalErrors} erreurs` });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Import de véhicules</h1>
        <p className="text-muted-foreground text-sm">Importez des véhicules depuis ArielCar.it</p>
      </div>

      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single" className="gap-2"><Link2 className="w-4 h-4" />Import unitaire</TabsTrigger>
          <TabsTrigger value="batch" className="gap-2"><FolderSearch className="w-4 h-4" />Import en masse</TabsTrigger>
          <TabsTrigger value="autofill" className="gap-2"><Zap className="w-4 h-4" />Remplissage auto</TabsTrigger>
        </TabsList>

        {/* SINGLE IMPORT */}
        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Scraper une URL ArielCar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://arielcar.it/offerte-auto/..."
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleScrape} disabled={singleLoading || !singleUrl.trim()}>
                  {singleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                  Scraper
                </Button>
              </div>
            </CardContent>
          </Card>

          {singleProduct && singleProduct.status !== 'scraping' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Aperçu du véhicule</CardTitle>
                {statusBadge(singleProduct.status)}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div><p className="text-xs font-medium text-muted-foreground">Marque</p><p className="text-sm font-medium">{singleProduct.scraped.brand || '—'}</p></div>
                  <div><p className="text-xs font-medium text-muted-foreground">Prix</p><p className="text-sm font-medium">{singleProduct.scraped.price ? `${singleProduct.scraped.price.toLocaleString()} €` : '—'}</p></div>
                  <div><p className="text-xs font-medium text-muted-foreground">Année</p><p className="text-sm">{singleProduct.scraped.vehicleData?.year || '—'}</p></div>
                  <div><p className="text-xs font-medium text-muted-foreground">Km</p><p className="text-sm">{singleProduct.scraped.vehicleData?.mileage?.toLocaleString() || '—'}</p></div>
                  <div><p className="text-xs font-medium text-muted-foreground">Énergie</p><p className="text-sm">{singleProduct.scraped.vehicleData?.energy || '—'}</p></div>
                  <div><p className="text-xs font-medium text-muted-foreground">Transmission</p><p className="text-sm">{singleProduct.scraped.vehicleData?.transmission || '—'}</p></div>
                  <div><p className="text-xs font-medium text-muted-foreground">Catégorie</p><p className="text-sm">{singleProduct.scraped.category || '—'}</p></div>
                  <div><p className="text-xs font-medium text-muted-foreground">Images</p><p className="text-sm">{singleProduct.scraped.images?.length || 0}</p></div>
                </div>

                {singleProduct.scraped.images?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {singleProduct.scraped.images.slice(0, 8).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-20 h-20 rounded object-cover border flex-shrink-0" />
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-muted-foreground line-clamp-3">{singleProduct.scraped.description || '—'}</p>
                </div>

                {singleProduct.status === 'imported' && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 border border-accent">
                    <Check className="w-5 h-5 text-primary" />
                    <p className="text-sm font-medium">Véhicule importé avec succès !</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {singleProduct.status === 'pending' && (
                    <>
                      <Button onClick={handleGenerateAI} variant="secondary">
                        <Sparkles className="w-4 h-4 mr-2" />Générer contenu IA
                      </Button>
                      <Button onClick={handleImportSingle}>
                        <Check className="w-4 h-4 mr-2" />Importer
                      </Button>
                    </>
                  )}
                  {singleProduct.status === 'ready' && (
                    <Button onClick={handleImportSingle}>
                      <Check className="w-4 h-4 mr-2" />Importer
                    </Button>
                  )}
                  {(singleProduct.status === 'generating' || singleProduct.status === 'importing' || singleProduct.status === 'blurring') && (
                    <Button disabled><Loader2 className="w-4 h-4 animate-spin mr-2" />{singleProduct.status === 'generating' ? 'Génération IA...' : singleProduct.status === 'blurring' ? 'Floutage plaques...' : 'Import...'}</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* BATCH IMPORT */}
        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg">Scanner une catégorie ArielCar</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://arielcar.it/marca/bmw/"
                  value={categoryUrl}
                  onChange={(e) => setCategoryUrl(e.target.value)}
                  className="flex-1"
                />
                <Input type="number" placeholder="Limite" value={batchLimit} onChange={(e) => setBatchLimit(Number(e.target.value))} className="w-24" />
                <Button onClick={handleScanCategory} disabled={batchScanning || !categoryUrl.trim()}>
                  {batchScanning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FolderSearch className="w-4 h-4 mr-2" />}
                  Scanner
                </Button>
              </div>
            </CardContent>
          </Card>

          {batchUrls.length > 0 && batchProducts.length === 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{batchUrls.length} URLs trouvées</CardTitle>
                <Button onClick={handleBatchScrape} disabled={batchProcessing}>
                  {batchProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                  Scraper tout
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 max-h-60 overflow-y-auto text-sm">
                  {batchUrls.map((url, i) => (
                    <li key={i} className="text-muted-foreground truncate">{url}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {batchProducts.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">
                  {batchProducts.length} véhicules
                  <span className="text-sm font-normal text-muted-foreground ml-2">({batchProducts.filter(p => p.selected).length} sélectionnés)</span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>Tout sélectionner</Button>
                  <Button
                    onClick={handleBatchGenerateAndImport}
                    disabled={batchProcessing || batchProducts.filter(p => p.selected && p.status === 'pending').length === 0}
                  >
                    {batchProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Générer IA & Importer ({batchProducts.filter(p => p.selected && p.status === 'pending').length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {batchProducts.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Checkbox checked={item.selected} onCheckedChange={() => toggleBatchSelect(i)} disabled={item.status !== 'pending'} />
                      {item.scraped.images?.[0] && <img src={item.scraped.images[0]} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.scraped.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.scraped.brand || '—'} · {item.scraped.price ? `${item.scraped.price.toLocaleString()} €` : '—'}
                          {item.scraped.vehicleData?.year ? ` · ${item.scraped.vehicleData.year}` : ''}
                          {item.scraped.vehicleData?.mileage ? ` · ${item.scraped.vehicleData.mileage.toLocaleString()} km` : ''}
                        </p>
                      </div>
                      {statusBadge(item.status)}
                      {item.error && <span title={item.error}><AlertTriangle className="w-4 h-4 text-destructive" /></span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* AUTO FILL */}
        <TabsContent value="autofill" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Car className="w-5 h-5" />Remplissage automatique du catalogue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Objectif : ~{BRAND_LIST.reduce((s, b) => s + b.target, 0)} véhicules répartis sur {BRAND_LIST.length} marques depuis ArielCar.it
              </p>

              <div className="flex gap-2">
                <Button onClick={analyzeExisting} disabled={autoFillRunning} variant="outline">
                  Analyser le catalogue
                </Button>
                {brands.length > 0 && (
                  <>
                    <Button onClick={runAutoFill} disabled={autoFillRunning || brands.every(b => b.needed === 0)}>
                      {autoFillRunning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                      Lancer l'import
                    </Button>
                    {autoFillRunning && (
                      <Button variant="destructive" onClick={() => { stopRef.current = true; }}>
                        <Square className="w-4 h-4 mr-2" />Arrêter
                      </Button>
                    )}
                  </>
                )}
              </div>

              {autoFillRunning && autoFillTotal > 0 && (
                <div className="space-y-2">
                  <Progress value={(autoFillProgress / autoFillTotal) * 100} />
                  <p className="text-xs text-muted-foreground text-center">{autoFillProgress} / {autoFillTotal} véhicules importés</p>
                </div>
              )}

              {brands.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {brands.map((b) => (
                    <div key={b.slug} className="flex items-center justify-between p-2 border rounded-lg text-sm">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{b.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.existing}/{b.target}
                          {b.imported > 0 && <span className="text-primary ml-1">+{b.imported}✓</span>}
                          {b.errors > 0 && <span className="text-destructive ml-1">{b.errors}✗</span>}
                        </p>
                      </div>
                      {brandStatusBadge(b.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminImport;

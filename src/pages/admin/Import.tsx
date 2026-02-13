import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Download, Sparkles, Check, AlertTriangle, Link2, FolderSearch } from 'lucide-react';

type ScrapedProduct = {
  title: string;
  price: number | null;
  images: string[];
  brand: string | null;
  description: string;
  source_url: string;
  raw_markdown?: string;
};

type GeneratedContent = {
  title: string;
  description: string;
  title_translations: Record<string, string>;
  description_translations: Record<string, string>;
};

type ProductImportItem = {
  scraped: ScrapedProduct;
  generated?: GeneratedContent;
  selected: boolean;
  status: 'pending' | 'scraping' | 'generating' | 'ready' | 'importing' | 'imported' | 'duplicate' | 'error';
  error?: string;
};

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

  // Shared state
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      return data;
    },
  });

  // ---- SINGLE IMPORT ----
  const handleScrape = async () => {
    if (!singleUrl.trim()) return;
    setSingleLoading(true);
    setSingleProduct({ scraped: {} as ScrapedProduct, selected: true, status: 'scraping' });

    try {
      const { data, error } = await supabase.functions.invoke('scrape-product', {
        body: { url: singleUrl },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Scrape failed');

      setSingleProduct({
        scraped: data.data,
        selected: true,
        status: 'pending',
      });
    } catch (e: any) {
      toast({ title: 'Erreur de scraping', description: e.message, variant: 'destructive' });
      setSingleProduct(null);
    } finally {
      setSingleLoading(false);
    }
  };

  const handleGenerateAI = async (item: ProductImportItem, setter: (item: ProductImportItem) => void) => {
    setter({ ...item, status: 'generating' });
    try {
      const { data, error } = await supabase.functions.invoke('generate-product-content', {
        body: {
          title: item.scraped.title,
          description: item.scraped.description,
          brand: item.scraped.brand,
          price: item.scraped.price,
        },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Generation failed');

      setter({ ...item, generated: data.data, status: 'ready' });
    } catch (e: any) {
      toast({ title: 'Erreur IA', description: e.message, variant: 'destructive' });
      setter({ ...item, status: 'pending', error: e.message });
    }
  };

  const handleImportProduct = async (item: ProductImportItem, setter: (item: ProductImportItem) => void) => {
    setter({ ...item, status: 'importing' });
    try {
      // Check dedup by source_url
      const { data: existingList } = await (supabase as any)
        .from('vehicles')
        .select('id')
        .eq('source_url', item.scraped.source_url);
      const existing = existingList && existingList.length > 0 ? existingList[0] : null;

      if (existing) {
        setter({ ...item, status: 'duplicate' });
        toast({ title: 'Doublon détecté', description: 'Ce véhicule existe déjà.', variant: 'destructive' });
        return;
      }

      // Extract year from title if possible (e.g., "2020 BMW X5")
      const yearMatch = item.scraped.title.match(/\b(19|20)\d{2}\b/);
      const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

      const vehicleData: any = {
        brand: item.scraped.brand || 'Non détecté',
        model: item.scraped.title,
        year,
        price: item.scraped.price || 0,
        mileage: 0,
        transmission: 'Manuelle',
        energy: 'Essence',
        description: item.generated?.description || item.scraped.description,
        description_translations: item.generated?.description_translations || {},
        equipment_translations: item.generated?.title_translations || {},
        status: 'available',
        source_url: item.scraped.source_url,
      };

      // Insert vehicle
      const { data: vehicleResult, error: vehicleError } = await (supabase as any)
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single();

      if (vehicleError) throw vehicleError;

      // Insert images
      if (item.scraped.images?.length > 0) {
        const imageData = item.scraped.images.map((url, idx) => ({
          vehicle_id: vehicleResult.id,
          image_url: url,
          position: idx,
        }));

        const { error: imageError } = await supabase
          .from('vehicle_images')
          .insert(imageData);

        if (imageError) throw imageError;
      }

      setter({ ...item, status: 'imported' });
      toast({ title: 'Importé !', description: item.generated?.title || item.scraped.title });
    } catch (e: any) {
      setter({ ...item, status: 'error', error: e.message });
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
      const { data, error } = await supabase.functions.invoke('scrape-category', {
        body: { url: categoryUrl, limit: batchLimit },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Scan failed');

      setBatchUrls(data.data.urls);
      toast({ title: `${data.data.urls.length} URLs trouvées`, description: `Sur ${data.data.total} liens au total` });
    } catch (e: any) {
      toast({ title: 'Erreur scan', description: e.message, variant: 'destructive' });
    } finally {
      setBatchScanning(false);
    }
  };

  const handleBatchScrape = async () => {
    setBatchProcessing(true);
    const items: ProductImportItem[] = [];
    const seenUrls = new Set<string>();

    for (const url of batchUrls) {
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);

      try {
        const { data, error } = await supabase.functions.invoke('scrape-product', {
          body: { url },
        });
        if (error || !data?.success) {
          items.push({
            scraped: { title: url, price: null, images: [], brand: null, description: '', source_url: url },
            selected: false,
            status: 'error',
            error: data?.error || error?.message || 'Failed',
          });
        } else {
          items.push({ scraped: data.data, selected: true, status: 'pending' });
        }
        setBatchProducts([...items]);
      } catch {
        items.push({
          scraped: { title: url, price: null, images: [], brand: null, description: '', source_url: url },
          selected: false,
          status: 'error',
          error: 'Network error',
        });
        setBatchProducts([...items]);
      }
    }

    setBatchProcessing(false);
  };

  const handleBatchGenerateAndImport = async () => {
    setBatchProcessing(true);
    const selected = batchProducts.filter((p) => p.selected && p.status === 'pending');

    for (let i = 0; i < selected.length; i++) {
      const idx = batchProducts.indexOf(selected[i]);
      const updated = [...batchProducts];

      // Generate AI
      updated[idx] = { ...updated[idx], status: 'generating' };
      setBatchProducts([...updated]);

      try {
        const { data } = await supabase.functions.invoke('generate-product-content', {
          body: {
            title: selected[i].scraped.title,
            description: selected[i].scraped.description,
            brand: selected[i].scraped.brand,
            price: selected[i].scraped.price,
          },
        });

        if (data?.success) {
          updated[idx] = { ...updated[idx], generated: data.data, status: 'importing' };
        } else {
          updated[idx] = { ...updated[idx], status: 'importing' };
        }
        setBatchProducts([...updated]);

       // Dedup check
         const { data: batchExistingList } = await (supabase as any)
           .from('vehicles')
           .select('id')
           .eq('source_url', selected[i].scraped.source_url);
         const existing = batchExistingList && batchExistingList.length > 0 ? batchExistingList[0] : null;

         if (existing) {
           updated[idx] = { ...updated[idx], status: 'duplicate' };
           setBatchProducts([...updated]);
           continue;
         }

         // Extract year from title if possible
         const yearMatch = selected[i].scraped.title.match(/\b(19|20)\d{2}\b/);
         const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

         // Import vehicle
         const vehicleData: any = {
           brand: selected[i].scraped.brand || 'Non détecté',
           model: selected[i].scraped.title,
           year,
           price: selected[i].scraped.price || 0,
           mileage: 0,
           transmission: 'Manuelle',
           energy: 'Essence',
           description: updated[idx].generated?.description || selected[i].scraped.description,
           description_translations: updated[idx].generated?.description_translations || {},
           equipment_translations: updated[idx].generated?.title_translations || {},
           status: 'available',
           source_url: selected[i].scraped.source_url,
         };

         const { data: vehicleResult, error: vehicleError } = await (supabase as any)
           .from('vehicles')
           .insert(vehicleData)
           .select()
           .single();

         if (vehicleError) throw vehicleError;

         // Insert images
         if (selected[i].scraped.images?.length > 0) {
           const imageData = selected[i].scraped.images.map((url: string, imgIdx: number) => ({
             vehicle_id: vehicleResult.id,
             image_url: url,
             position: imgIdx,
           }));

           const { error: imageError } = await supabase
             .from('vehicle_images')
             .insert(imageData);

           if (imageError) throw imageError;
         }

         updated[idx] = { ...updated[idx], status: 'imported' };
         setBatchProducts([...updated]);
      } catch (e: any) {
        updated[idx] = { ...updated[idx], status: 'error', error: e.message };
        setBatchProducts([...updated]);
      }
    }

    setBatchProcessing(false);
    toast({ title: 'Import terminé !' });
  };

  const toggleBatchSelect = (index: number) => {
    const updated = [...batchProducts];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    setBatchProducts(updated);
  };

  const selectAll = () => {
    setBatchProducts(batchProducts.map((p) => ({ ...p, selected: p.status === 'pending' })));
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'outline', label: 'En attente' },
      scraping: { variant: 'secondary', label: 'Scraping...' },
      generating: { variant: 'secondary', label: 'IA...' },
      ready: { variant: 'default', label: 'Prêt' },
      importing: { variant: 'secondary', label: 'Import...' },
      imported: { variant: 'default', label: '✓ Importé' },
      duplicate: { variant: 'destructive', label: 'Doublon' },
      error: { variant: 'destructive', label: 'Erreur' },
    };
    const s = map[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Import de produits</h1>
        <p className="text-muted-foreground text-sm">Scrapez des fiches produits et générez du contenu IA</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Catégorie cible" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single" className="gap-2"><Link2 className="w-4 h-4" />Produit unique</TabsTrigger>
          <TabsTrigger value="batch" className="gap-2"><FolderSearch className="w-4 h-4" />Import en masse</TabsTrigger>
        </TabsList>

        {/* SINGLE IMPORT */}
        <TabsContent value="single" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scraper une URL produit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/product/..."
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
                <CardTitle className="text-lg">Aperçu du produit</CardTitle>
                {statusBadge(singleProduct.status)}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Titre</p>
                    <p className="text-sm">{singleProduct.generated?.title || singleProduct.scraped.title}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Prix</p>
                    <p className="text-sm">{singleProduct.scraped.price ? `${singleProduct.scraped.price.toLocaleString()} €` : 'N/A'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Marque</p>
                    <p className="text-sm">{singleProduct.scraped.brand || 'Non détectée'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Images</p>
                    <p className="text-sm">{singleProduct.scraped.images?.length || 0} trouvée(s)</p>
                  </div>
                </div>

                {singleProduct.scraped.images?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {singleProduct.scraped.images.slice(0, 6).map((img, i) => (
                      <img key={i} src={img} alt="" className="w-20 h-20 rounded object-cover border flex-shrink-0" />
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Description</p>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {singleProduct.generated?.description || singleProduct.scraped.description || 'N/A'}
                  </p>
                </div>

                {singleProduct.generated && (
                  <div className="space-y-2 border-t pt-4">
                    <p className="text-sm font-medium">Traductions IA</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.keys(singleProduct.generated.title_translations || {}).map((lang) => (
                        <Badge key={lang} variant="outline">{lang.toUpperCase()}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {singleProduct.status === 'pending' && (
                    <Button onClick={() => handleGenerateAI(singleProduct, setSingleProduct)} variant="secondary">
                      <Sparkles className="w-4 h-4 mr-2" />Générer contenu IA
                    </Button>
                  )}
                  {(singleProduct.status === 'pending' || singleProduct.status === 'ready') && (
                    <Button onClick={() => handleImportProduct(singleProduct, setSingleProduct)}>
                      <Check className="w-4 h-4 mr-2" />Importer
                    </Button>
                  )}
                  {singleProduct.status === 'generating' && (
                    <Button disabled><Loader2 className="w-4 h-4 animate-spin mr-2" />Génération IA...</Button>
                  )}
                  {singleProduct.status === 'importing' && (
                    <Button disabled><Loader2 className="w-4 h-4 animate-spin mr-2" />Import...</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* BATCH IMPORT */}
        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Scanner une catégorie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/category/..."
                  value={categoryUrl}
                  onChange={(e) => setCategoryUrl(e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Limite"
                  value={batchLimit}
                  onChange={(e) => setBatchLimit(Number(e.target.value))}
                  className="w-24"
                />
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
                  {batchProducts.length} produits scrapés
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({batchProducts.filter((p) => p.selected).length} sélectionnés)
                  </span>
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAll}>Tout sélectionner</Button>
                  <Button
                    onClick={handleBatchGenerateAndImport}
                    disabled={batchProcessing || batchProducts.filter((p) => p.selected && p.status === 'pending').length === 0}
                  >
                    {batchProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Générer IA & Importer ({batchProducts.filter((p) => p.selected && p.status === 'pending').length})
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {batchProducts.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={() => toggleBatchSelect(i)}
                        disabled={item.status !== 'pending'}
                      />
                      {item.scraped.images?.[0] && (
                        <img src={item.scraped.images[0]} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.scraped.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.scraped.brand || '—'} · {item.scraped.price ? `${item.scraped.price.toLocaleString()} €` : 'N/A'}
                        </p>
                      </div>
                      {statusBadge(item.status)}
                      {item.error && (
                        <span title={item.error}><AlertTriangle className="w-4 h-4 text-destructive" /></span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminImport;

import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, Download, Upload, Loader2, ImageDown } from 'lucide-react';
import { supabaseAdmin } from '@/integrations/supabase/adminClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import VehicleForm from '@/components/admin/VehicleForm';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'> & { vehicle_images: { image_url: string }[] };

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [creating, setCreating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [redownloading, setRedownloading] = useState(false);
  const [redownloadProgress, setRedownloadProgress] = useState('');
  const importRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchVehicles = async () => {
    const { data } = await supabaseAdmin
      .from('vehicles')
      .select('*, vehicle_images(image_url)')
      .order('created_at', { ascending: false });
    if (data) setVehicles(data as Vehicle[]);
  };

  useEffect(() => { fetchVehicles(); }, []);

  const deleteVehicle = async (id: string) => {
    const { error } = await supabaseAdmin.from('vehicles').delete().eq('id', id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Véhicule supprimé' });
      fetchVehicles();
    }
  };

  const filtered = vehicles.filter(v =>
    `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase())
  );

  const exportVehicles = async () => {
    setExporting(true);
    try {
      const { data: allVehicles } = await supabaseAdmin
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: allImages } = await supabaseAdmin
        .from('vehicle_images')
        .select('*')
        .order('position', { ascending: true });
      
      const exportData = {
        exported_at: new Date().toISOString(),
        vehicles: allVehicles || [],
        vehicle_images: allImages || [],
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mcd-vehicles-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: `${(allVehicles || []).length} véhicules exportés` });
    } catch (err: any) {
      toast({ title: 'Erreur export', description: err.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const importVehicles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.vehicles || !Array.isArray(data.vehicles)) {
        throw new Error('Format de fichier invalide');
      }

      let imported = 0;
      let skipped = 0;

      for (const v of data.vehicles) {
        const { id, created_at, updated_at, ...vehicleData } = v;
        
        // Check duplicate by source_url
        if (v.source_url) {
          const { data: existing } = await supabaseAdmin
            .from('vehicles')
            .select('id')
            .eq('source_url', v.source_url)
            .maybeSingle();
          if (existing) { skipped++; continue; }
        }

        const { data: inserted, error } = await supabaseAdmin
          .from('vehicles')
          .insert(vehicleData)
          .select()
          .single();
        
        if (error || !inserted) { skipped++; continue; }

        // Import images for this vehicle
        const vehicleImages = (data.vehicle_images || []).filter((img: any) => img.vehicle_id === id);
        if (vehicleImages.length > 0) {
          const imagesToInsert = vehicleImages.map((img: any) => ({
            vehicle_id: inserted.id,
            image_url: img.image_url,
            position: img.position || 0,
          }));
          await supabaseAdmin.from('vehicle_images').insert(imagesToInsert);
        }
        imported++;
      }

      toast({ title: `Import terminé`, description: `${imported} importés, ${skipped} ignorés (doublons)` });
      fetchVehicles();
    } catch (err: any) {
      toast({ title: 'Erreur import', description: err.message, variant: 'destructive' });
    } finally {
      setImporting(false);
      if (importRef.current) importRef.current.value = '';
    }
  };

  const redownloadAllImages = async () => {
    setRedownloading(true);
      setRedownloadProgress('Recherche des véhicules à retraiter...');
    try {
      const { data: sourceVehicles, error } = await supabaseAdmin
        .from('vehicles')
        .select('id')
        .not('source_url', 'is', null);

      if (error) throw error;

      const vehicleIds = (sourceVehicles || []).map((vehicle) => vehicle.id);
      
      if (vehicleIds.length === 0) {
        toast({ title: 'Toutes les images sont déjà locales !' });
        setRedownloading(false);
        setRedownloadProgress('');
        return;
      }

      let done = 0;
      let failed = 0;

      for (const vid of vehicleIds) {
        setRedownloadProgress(`${done + 1}/${vehicleIds.length} véhicules traités...`);
        try {
          const { data, error: fnError } = await supabaseAdmin.functions.invoke('download-vehicle-images', {
            body: { vehicle_id: vid },
          });
          if (fnError) {
            failed++;
          } else {
            done++;
          }
        } catch {
          failed++;
        }
      }

      toast({
        title: 'Re-téléchargement terminé',
        description: `${done} véhicules OK, ${failed} erreurs`,
      });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setRedownloading(false);
      setRedownloadProgress('');
    }
  };

  if (creating || editing) {
    return (
      <VehicleForm
        vehicle={editing}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSaved={() => { setEditing(null); setCreating(false); fetchVehicles(); }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="font-heading text-2xl font-bold">Véhicules ({vehicles.length})</h2>
        <div className="flex gap-2 flex-wrap">
          <input
            ref={importRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={importVehicles}
          />
          <Button variant="outline" onClick={exportVehicles} disabled={exporting || vehicles.length === 0}>
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Exporter JSON
          </Button>
          <Button variant="outline" onClick={() => importRef.current?.click()} disabled={importing}>
            {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            Importer JSON
          </Button>
          <Button variant="outline" onClick={redownloadAllImages} disabled={redownloading}>
            {redownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImageDown className="w-4 h-4 mr-2" />}
            {redownloading ? redownloadProgress || 'Re-téléchargement...' : 'Re-télécharger images'}
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 mr-2" /> Ajouter
          </Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map(v => (
          <Card key={v.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="w-20 h-14 rounded bg-muted overflow-hidden flex-shrink-0">
                {v.vehicle_images?.[0] && (
                  <img src={v.vehicle_images[0].image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{v.brand} {v.model}</p>
                <p className="text-sm text-muted-foreground">{v.year} · {v.mileage?.toLocaleString()} km · {v.energy}</p>
              </div>
              <Badge variant={v.status === 'available' ? 'default' : 'secondary'}>
                {v.status === 'available' ? 'Disponible' : v.status}
              </Badge>
              <p className="font-bold text-primary whitespace-nowrap">{v.price?.toLocaleString()} €</p>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setEditing(v)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {v.brand} {v.model} sera supprimé définitivement.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteVehicle(v.id)}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucun véhicule trouvé.</p>
        )}
      </div>
    </div>
  );
};

export default Vehicles;

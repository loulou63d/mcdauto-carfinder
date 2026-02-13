import { useState } from 'react';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Vehicle = Tables<'vehicles'> & { vehicle_images?: { image_url: string }[] };

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSaved: () => void;
}

const energyOptions = ['Diesel', 'Essence', 'Hybride', 'Électrique', 'GPL'];
const transmissionOptions = ['Manuelle', 'Automatique'];
const categoryOptions = ['SUV', 'Berline', 'Break', 'Coupé', 'Cabriolet', 'Monospace', '4x4', 'Utilitaire'];
const statusOptions = ['available', 'sold', 'reserved'];

const VehicleForm = ({ vehicle, onClose, onSaved }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(
    vehicle?.vehicle_images?.map(i => i.image_url) ?? []
  );

  const [form, setForm] = useState({
    brand: vehicle?.brand ?? '',
    model: vehicle?.model ?? '',
    year: vehicle?.year ?? new Date().getFullYear(),
    price: vehicle?.price ?? 0,
    monthly_price: vehicle?.monthly_price ?? null as number | null,
    mileage: vehicle?.mileage ?? 0,
    energy: vehicle?.energy ?? 'Diesel',
    transmission: vehicle?.transmission ?? 'Manuelle',
    category: vehicle?.category ?? '',
    color: vehicle?.color ?? '',
    doors: vehicle?.doors ?? 5,
    power: vehicle?.power ?? '',
    co2: vehicle?.co2 ?? '',
    euro_norm: vehicle?.euro_norm ?? '',
    description: vehicle?.description ?? '',
    equipment: vehicle?.equipment?.join(', ') ?? '',
    location: vehicle?.location ?? 'Salon-de-Provence',
    is_featured: vehicle?.is_featured ?? false,
    status: vehicle?.status ?? 'available',
  });

  const update = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vehicleData = {
        brand: form.brand,
        model: form.model,
        year: form.year,
        price: form.price,
        monthly_price: form.monthly_price,
        mileage: form.mileage,
        energy: form.energy,
        transmission: form.transmission,
        category: form.category || null,
        color: form.color || null,
        doors: form.doors,
        power: form.power || null,
        co2: form.co2 || null,
        euro_norm: form.euro_norm || null,
        description: form.description || null,
        equipment: form.equipment ? form.equipment.split(',').map(s => s.trim()) : [],
        location: form.location || null,
        is_featured: form.is_featured,
        status: form.status,
      };

      let vehicleId = vehicle?.id;

      if (vehicle) {
        const { error } = await supabase.from('vehicles').update(vehicleData).eq('id', vehicle.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('vehicles').insert(vehicleData).select('id').single();
        if (error) throw error;
        vehicleId = data.id;
      }

      // Upload new images
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const ext = file.name.split('.').pop();
        const path = `${vehicleId}/${Date.now()}_${i}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('vehicle-images').upload(path, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('vehicle-images').getPublicUrl(path);

        await supabase.from('vehicle_images').insert({
          vehicle_id: vehicleId!,
          image_url: urlData.publicUrl,
          position: existingImages.length + i,
        });
      }

      toast({ title: vehicle ? 'Véhicule mis à jour' : 'Véhicule ajouté' });
      onSaved();
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const removeExistingImage = async (url: string) => {
    await supabase.from('vehicle_images').delete().eq('image_url', url);
    setExistingImages(prev => prev.filter(i => i !== url));
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onClose}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Retour
      </Button>

      <h2 className="font-heading text-2xl font-bold">
        {vehicle ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Basic info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Marque *</Label><Input required value={form.brand} onChange={e => update('brand', e.target.value)} /></div>
          <div><Label>Modèle *</Label><Input required value={form.model} onChange={e => update('model', e.target.value)} /></div>
          <div><Label>Année *</Label><Input type="number" required value={form.year} onChange={e => update('year', +e.target.value)} /></div>
          <div><Label>Prix (€) *</Label><Input type="number" required value={form.price} onChange={e => update('price', +e.target.value)} /></div>
          <div><Label>Prix mensuel (€)</Label><Input type="number" value={form.monthly_price ?? ''} onChange={e => update('monthly_price', e.target.value ? +e.target.value : null)} /></div>
          <div><Label>Kilométrage</Label><Input type="number" value={form.mileage} onChange={e => update('mileage', +e.target.value)} /></div>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Énergie</Label>
            <Select value={form.energy} onValueChange={v => update('energy', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{energyOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Transmission</Label>
            <Select value={form.transmission} onValueChange={v => update('transmission', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{transmissionOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Catégorie</Label>
            <Select value={form.category} onValueChange={v => update('category', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{categoryOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Couleur</Label><Input value={form.color} onChange={e => update('color', e.target.value)} /></div>
          <div><Label>Portes</Label><Input type="number" value={form.doors} onChange={e => update('doors', +e.target.value)} /></div>
          <div><Label>Puissance</Label><Input value={form.power} onChange={e => update('power', e.target.value)} placeholder="ex: 150ch" /></div>
          <div><Label>CO2</Label><Input value={form.co2} onChange={e => update('co2', e.target.value)} placeholder="ex: 120g/km" /></div>
          <div><Label>Norme Euro</Label><Input value={form.euro_norm} onChange={e => update('euro_norm', e.target.value)} placeholder="ex: Euro 6" /></div>
          <div><Label>Localisation</Label><Input value={form.location} onChange={e => update('location', e.target.value)} /></div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <Label>Statut</Label>
            <Select value={form.status} onValueChange={v => update('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(o => <SelectItem key={o} value={o}>{o === 'available' ? 'Disponible' : o === 'sold' ? 'Vendu' : 'Réservé'}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_featured} onCheckedChange={v => update('is_featured', v)} />
            <Label>En vedette</Label>
          </div>
        </div>

        {/* Description & Equipment */}
        <div>
          <Label>Description</Label>
          <Textarea rows={4} value={form.description} onChange={e => update('description', e.target.value)} />
        </div>
        <div>
          <Label>Équipements (séparés par des virgules)</Label>
          <Textarea rows={2} value={form.equipment} onChange={e => update('equipment', e.target.value)} placeholder="Climatisation, GPS, Radar de recul..." />
        </div>

        {/* Images */}
        <div>
          <Label>Photos</Label>
          <div className="flex flex-wrap gap-3 mt-2">
            {existingImages.map(url => (
              <div key={url} className="relative w-24 h-16 rounded overflow-hidden border">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {imageFiles.map((f, i) => (
              <div key={i} className="relative w-24 h-16 rounded overflow-hidden border">
                <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => setImageFiles(prev => prev.filter((_, j) => j !== i))} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <label className="w-24 h-16 rounded border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors">
              <Upload className="w-5 h-5 text-muted-foreground" />
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                if (e.target.files) setImageFiles(prev => [...prev, ...Array.from(e.target.files!)]);
              }} />
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : vehicle ? 'Mettre à jour' : 'Créer'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
        </div>
      </form>
    </div>
  );
};

export default VehicleForm;

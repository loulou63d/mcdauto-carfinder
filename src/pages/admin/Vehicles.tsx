import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
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
        <h2 className="font-heading text-2xl font-bold">Véhicules</h2>
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-2" /> Ajouter
        </Button>
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

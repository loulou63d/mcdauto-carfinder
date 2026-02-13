import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Vehicle } from '@/data/mockVehicles';

async function fetchVehiclesWithImages(options?: {
  featured?: boolean;
  limit?: number;
  status?: string;
}): Promise<Vehicle[]> {
  let query = supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  } else {
    query = query.eq('status', 'available');
  }

  if (options?.featured) {
    query = query.eq('is_featured', true);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data: vehicles, error } = await query;
  if (error) throw error;

  // Fetch images for all vehicles
  const vehicleIds = vehicles.map((v) => v.id);
  const { data: images } = await supabase
    .from('vehicle_images')
    .select('*')
    .in('vehicle_id', vehicleIds)
    .order('position', { ascending: true });

  const imageMap = new Map<string, string[]>();
  images?.forEach((img) => {
    const existing = imageMap.get(img.vehicle_id) || [];
    existing.push(img.image_url);
    imageMap.set(img.vehicle_id, existing);
  });

  return vehicles.map((v) => ({
    ...v,
    images: imageMap.get(v.id) || [],
  }));
}

async function fetchVehicleById(id: string): Promise<Vehicle | null> {
  const { data: vehicle, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!vehicle) return null;

  const { data: images } = await supabase
    .from('vehicle_images')
    .select('*')
    .eq('vehicle_id', id)
    .order('position', { ascending: true });

  return {
    ...vehicle,
    images: images?.map((img) => img.image_url) || [],
  };
}

export function useVehicles(options?: { featured?: boolean; limit?: number }) {
  return useQuery({
    queryKey: ['vehicles', options],
    queryFn: () => fetchVehiclesWithImages(options),
  });
}

export function useVehicle(id: string | undefined) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => fetchVehicleById(id!),
    enabled: !!id,
  });
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  monthly_price?: number | null;
  mileage: number;
  energy: string;
  transmission: string;
  category: string | null;
  power?: string | null;
  doors?: number | null;
  color?: string | null;
  co2?: string | null;
  euro_norm?: string | null;
  location: string | null;
  description?: string | null;
  equipment: string[] | null;
  is_featured?: boolean | null;
  status: string | null;
  images?: string[];
}

export const popularBrands = [
  'Audi', 'BMW', 'Citroën', 'Dacia', 'Fiat', 'Ford',
  'Honda', 'Hyundai', 'Kia', 'Mercedes', 'Peugeot', 'Renault',
  'Toyota', 'Volkswagen', 'Volvo', 'Tesla',
  'Nissan', 'Opel', 'Seat', 'Skoda', 'DS', 'Jeep',
  'Mazda', 'Mitsubishi', 'Suzuki', 'Land Rover',
  'Alfa Romeo', 'Jaguar', 'Porsche', 'Mini', 'Lexus', 'Infiniti', 'Maserati',
];

export const energyTypes = [
  'Diesel', 'Essence', 'Électrique', 'Hybride', 'Hybride rechargeable', 'GPL', 'Bioéthanol',
];

export const categoryTypes = [
  'berline', 'break', 'suv', 'utilitaire', '4x4', 'cabriolet', 'monospace', 'coupé',
];

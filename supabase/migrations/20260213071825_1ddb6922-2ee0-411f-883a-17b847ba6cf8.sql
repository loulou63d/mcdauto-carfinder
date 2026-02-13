
-- 1. Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- 4. Create vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  monthly_price NUMERIC(10,2),
  mileage INTEGER NOT NULL DEFAULT 0,
  energy TEXT NOT NULL DEFAULT 'Diesel',
  transmission TEXT NOT NULL DEFAULT 'Manuelle',
  description TEXT,
  equipment TEXT[] DEFAULT '{}',
  category TEXT,
  location TEXT DEFAULT 'Salon-de-Provence',
  color TEXT,
  power TEXT,
  doors INTEGER DEFAULT 5,
  co2 TEXT,
  euro_norm TEXT,
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create vehicle_images table
CREATE TABLE public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create contact_requests table
CREATE TABLE public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- 8. Security definer function to check admin role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 9. Convenience function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

-- 10. Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

-- 13. RLS Policies for user_roles
CREATE POLICY "Only admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin());

-- 14. RLS Policies for vehicles
CREATE POLICY "Anyone can view vehicles"
  ON public.vehicles FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert vehicles"
  ON public.vehicles FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update vehicles"
  ON public.vehicles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete vehicles"
  ON public.vehicles FOR DELETE
  USING (public.is_admin());

-- 15. RLS Policies for vehicle_images
CREATE POLICY "Anyone can view vehicle images"
  ON public.vehicle_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert vehicle images"
  ON public.vehicle_images FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete vehicle images"
  ON public.vehicle_images FOR DELETE
  USING (public.is_admin());

-- 16. RLS Policies for contact_requests
CREATE POLICY "Anyone can submit contact request"
  ON public.contact_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact requests"
  ON public.contact_requests FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update contact requests"
  ON public.contact_requests FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete contact requests"
  ON public.contact_requests FOR DELETE
  USING (public.is_admin());

-- 17. Storage bucket for vehicle images
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true);

CREATE POLICY "Anyone can view vehicle images storage"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-images');

CREATE POLICY "Admins can upload vehicle images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicle-images' AND public.is_admin());

CREATE POLICY "Admins can delete vehicle images storage"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vehicle-images' AND public.is_admin());

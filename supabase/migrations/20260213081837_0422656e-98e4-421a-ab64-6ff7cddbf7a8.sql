
-- Create categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (is_admin());

-- Insert default categories
INSERT INTO public.categories (name, slug) VALUES
  ('Tracteurs', 'tracteurs'),
  ('Moissonneuses', 'moissonneuses'),
  ('Semoirs', 'semoirs'),
  ('Pulvérisateurs', 'pulverisateurs'),
  ('Remorques', 'remorques'),
  ('Chargeurs', 'chargeurs'),
  ('Faucheuses', 'faucheuses'),
  ('Presses', 'presses'),
  ('Outils de travail du sol', 'outils-travail-sol'),
  ('Pièces détachées', 'pieces-detachees'),
  ('Autres', 'autres');

-- Create products table
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  category_id uuid REFERENCES public.categories(id),
  brand text,
  images text[] DEFAULT '{}',
  status text DEFAULT 'draft',
  stock integer DEFAULT 0,
  condition text DEFAULT 'new',
  source_url text,
  title_translations jsonb DEFAULT '{}',
  description_translations jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (is_admin());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

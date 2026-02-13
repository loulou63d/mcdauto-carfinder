
-- Create site_settings table for admin-configurable settings
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings (needed for checkout page)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (is_admin());

-- Insert default bank details
INSERT INTO public.site_settings (key, value) VALUES
  ('bank_iban', 'DE89 3704 0044 0532 0130 00'),
  ('bank_bic', 'COBADEFFXXX'),
  ('bank_name', 'MCD AUTO');

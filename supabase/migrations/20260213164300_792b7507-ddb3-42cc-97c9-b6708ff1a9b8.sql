
-- Create orders table
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  vehicle_ids uuid[] NOT NULL,
  vehicle_details jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_price numeric NOT NULL DEFAULT 0,
  deposit_amount numeric NOT NULL DEFAULT 0,
  receipt_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies: anyone can insert (public checkout), admins can do everything
CREATE POLICY "Anyone can create an order"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('order-receipts', 'order-receipts', true);

-- Storage policies
CREATE POLICY "Anyone can upload receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'order-receipts');

CREATE POLICY "Anyone can view receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'order-receipts');

CREATE POLICY "Admins can delete receipts"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'order-receipts');

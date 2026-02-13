
-- Add user_id column to orders table to link orders to authenticated customers
ALTER TABLE public.orders ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update RLS: authenticated users can view their own orders
CREATE POLICY "Users can view their own orders"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id);

-- Update insert policy: require user_id to match auth.uid()
DROP POLICY "Anyone can create an order" ON public.orders;
CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

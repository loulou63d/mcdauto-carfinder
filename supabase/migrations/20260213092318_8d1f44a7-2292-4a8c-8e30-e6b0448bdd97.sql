-- Add translation support to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN description_translations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN equipment_translations JSONB DEFAULT '{}'::jsonb;

-- Create an index for better performance on JSONB columns
CREATE INDEX idx_vehicles_description_translations ON public.vehicles USING GIN(description_translations);
CREATE INDEX idx_vehicles_equipment_translations ON public.vehicles USING GIN(equipment_translations);
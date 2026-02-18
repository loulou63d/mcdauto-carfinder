
-- Appointments table
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  appointment_type text NOT NULL DEFAULT 'test_drive',
  preferred_date date NOT NULL,
  preferred_time text NOT NULL,
  vehicle_info text,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  lang text DEFAULT 'de',
  user_id uuid,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update appointments" ON public.appointments
  FOR UPDATE USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "Admins can delete appointments" ON public.appointments
  FOR DELETE USING (is_admin());

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chat conversations table
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create conversations" ON public.chat_conversations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view own conversations by session" ON public.chat_conversations
  FOR SELECT USING (true);

CREATE POLICY "Anyone can update own conversations" ON public.chat_conversations
  FOR UPDATE USING (true);

CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON public.chat_conversations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chat messages table
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create messages" ON public.chat_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view messages" ON public.chat_messages
  FOR SELECT USING (true);

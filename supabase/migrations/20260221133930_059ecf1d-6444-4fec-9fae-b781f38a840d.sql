
-- 1. Profiles: Add INSERT policy so users can create their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Chat messages: Drop overly permissive SELECT/INSERT policies
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can create messages" ON public.chat_messages;

-- 3. Chat messages: Restrict SELECT to conversation participants (by session or user)
CREATE POLICY "Users can view own conversation messages"
ON public.chat_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.chat_conversations cc
    WHERE cc.id = chat_messages.conversation_id
    AND (cc.user_id = auth.uid() OR cc.user_id IS NULL)
  )
);

-- 4. Chat messages: Restrict INSERT to own conversations
CREATE POLICY "Users can create messages in own conversations"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations cc
    WHERE cc.id = chat_messages.conversation_id
    AND (cc.user_id = auth.uid() OR cc.user_id IS NULL)
  )
);

-- 5. Chat conversations: Tighten SELECT to own conversations only
DROP POLICY IF EXISTS "Anyone can view own conversations by session" ON public.chat_conversations;
CREATE POLICY "Users can view own conversations"
ON public.chat_conversations
FOR SELECT
USING (user_id = auth.uid() OR user_id IS NULL);

-- 6. Chat conversations: Tighten UPDATE
DROP POLICY IF EXISTS "Anyone can update own conversations" ON public.chat_conversations;
CREATE POLICY "Users can update own conversations"
ON public.chat_conversations
FOR UPDATE
USING (user_id = auth.uid() OR user_id IS NULL);

-- 7. Chat conversations: Tighten INSERT
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;
CREATE POLICY "Users can create conversations"
ON public.chat_conversations
FOR INSERT
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

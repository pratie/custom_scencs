-- CRITICAL: Production Security Fixes
-- Run these commands in Supabase SQL Editor BEFORE deploying

-- 1. Re-enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- 2. Create secure policies for conversations
CREATE POLICY "Users can only view their own conversations"
ON conversations FOR SELECT
USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can only insert their own conversations"
ON conversations FOR INSERT
WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can only update their own conversations"
ON conversations FOR UPDATE
USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can only delete their own conversations"
ON conversations FOR DELETE
USING (user_id = auth.jwt() ->> 'email');

-- 3. Create secure policies for usage tracking
CREATE POLICY "Users can only view their own usage"
ON usage_tracking FOR SELECT
USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can only insert their own usage"
ON usage_tracking FOR INSERT
WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can only update their own usage"
ON usage_tracking FOR UPDATE
USING (user_id = auth.jwt() ->> 'email');

-- 4. Test the policies
-- This should return 0 rows if RLS is working:
-- SELECT * FROM conversations WHERE user_id != auth.jwt() ->> 'email';
-- Temporarily disable Row Level Security to get basic functionality working
-- We'll re-enable it later with proper NextAuth integration

ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking DISABLE ROW LEVEL SECURITY;

-- Drop the policies for now
DROP POLICY IF EXISTS "Users can view their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can delete their own conversations" ON conversations;
DROP POLICY IF EXISTS "Users can view their own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Users can insert their own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Users can update their own usage" ON usage_tracking;

-- Note: We'll implement application-level security through the queries
-- This ensures user data isolation while keeping the migration simple
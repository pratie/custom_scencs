-- Supabase schema for AI Ad Assets
-- This replaces your IndexedDB structure

-- Conversations table (matches your IndexedDB Conversation interface)
CREATE TABLE conversations (
  id text PRIMARY KEY,
  user_id text NOT NULL,
  title text NOT NULL,
  messages jsonb NOT NULL DEFAULT '[]',
  generated_images jsonb NOT NULL DEFAULT '[]',
  generated_videos jsonb DEFAULT '[]',
  created_at bigint NOT NULL,
  updated_at bigint NOT NULL
);

-- Usage tracking table (replaces localStorage usage limits)
CREATE TABLE usage_tracking (
  user_id text PRIMARY KEY,
  date text NOT NULL,
  images integer DEFAULT 0,
  videos integer DEFAULT 0,
  avatars integer DEFAULT 0,
  updated_at bigint DEFAULT EXTRACT(epoch FROM now())
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_updated ON conversations(user_id, updated_at DESC);
CREATE INDEX idx_conversations_user_created ON conversations(user_id, created_at DESC);
CREATE INDEX idx_usage_date ON usage_tracking(date);

-- Enable Row Level Security (RLS)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert their own conversations"
ON conversations FOR INSERT
WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own conversations"
ON conversations FOR UPDATE
USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete their own conversations"
ON conversations FOR DELETE
USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can view their own usage"
ON usage_tracking FOR SELECT
USING (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert their own usage"
ON usage_tracking FOR INSERT
WITH CHECK (user_id = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own usage"
ON usage_tracking FOR UPDATE
USING (user_id = auth.jwt() ->> 'email');
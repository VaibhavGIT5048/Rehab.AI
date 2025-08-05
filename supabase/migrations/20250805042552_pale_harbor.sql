/*
  # Fix chat_messages table structure

  1. Table Updates
    - Add `sender_id` and `receiver_id` columns to chat_messages table
    - Keep existing `sender_type` column for backward compatibility
    - Add proper foreign key constraints

  2. Security
    - Update RLS policies to work with new columns
    - Ensure users can only access their own messages

  3. Indexes
    - Add indexes for better query performance
*/

-- Add missing columns to chat_messages table
DO $$
BEGIN
  -- Add sender_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'sender_id'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN sender_id UUID;
  END IF;

  -- Add receiver_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'receiver_id'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN receiver_id UUID;
  END IF;
END $$;

-- Add foreign key constraints
DO $$
BEGIN
  -- Add sender_id foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chat_messages_sender_id_fkey'
  ) THEN
    ALTER TABLE chat_messages 
    ADD CONSTRAINT chat_messages_sender_id_fkey 
    FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  -- Add receiver_id foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'chat_messages_receiver_id_fkey'
  ) THEN
    ALTER TABLE chat_messages 
    ADD CONSTRAINT chat_messages_receiver_id_fkey 
    FOREIGN KEY (receiver_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON chat_messages(receiver_id);

-- Update RLS policies for direct messaging
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON chat_messages;
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON chat_messages;
DROP POLICY IF EXISTS "Users can delete messages in their conversations" ON chat_messages;

-- Add new policies for direct messaging
CREATE POLICY "Users can view their direct messages" ON chat_messages
  FOR SELECT USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE chat_conversations.id = chat_messages.conversation_id 
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their direct messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE chat_conversations.id = chat_messages.conversation_id 
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their direct messages" ON chat_messages
  FOR DELETE USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id OR
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE chat_conversations.id = chat_messages.conversation_id 
      AND chat_conversations.user_id = auth.uid()
    )
  );
/*
  Fix Foreign Key Constraints for direct_messages

  - Drops existing conflicting constraints if present
  - Adds correct foreign keys from direct_messages.sender_id and receiver_id to profiles.id
  - Creates indexes for sender_id and receiver_id to optimize lookups
*/

/* ---- Drop existing constraints if they exist ---- */
ALTER TABLE direct_messages
DROP CONSTRAINT IF EXISTS direct_messages_sender_profile_fkey;

ALTER TABLE direct_messages
DROP CONSTRAINT IF EXISTS direct_messages_receiver_profile_fkey;

/* ---- Add proper foreign key constraints (no IF NOT EXISTS here) ---- */
ALTER TABLE direct_messages
ADD CONSTRAINT direct_messages_sender_profile_fkey
FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE direct_messages
ADD CONSTRAINT direct_messages_receiver_profile_fkey
FOREIGN KEY (receiver_id) REFERENCES profiles(id) ON DELETE CASCADE;

/* ---- Create indexes for better performance ---- */
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_profile
ON direct_messages(sender_id);

CREATE INDEX IF NOT EXISTS idx_direct_messages_receiver_profile
ON direct_messages(receiver_id);

/* ---- (Optional) Reload schema cache so API reflects changes ---- */
NOTIFY pgrst, 'reload schema';

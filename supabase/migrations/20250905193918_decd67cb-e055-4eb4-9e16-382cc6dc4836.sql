-- Add missing columns to waitlist_entries table for tracking email confirmation status
ALTER TABLE waitlist_entries 
ADD COLUMN confirmation_status text DEFAULT 'pending' CHECK (confirmation_status IN ('pending', 'sent', 'failed')),
ADD COLUMN confirmation_sent_at timestamptz;
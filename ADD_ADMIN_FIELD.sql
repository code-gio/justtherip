-- ============================================================================
-- ADD ADMIN FIELD TO PROFILES TABLE
-- ============================================================================
-- Run this SQL in Supabase SQL Editor to add admin functionality
--
-- This migration adds an is_admin boolean field to the profiles table
-- to enable admin-only access control for administrative routes.

-- Add is_admin field to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

-- Create index for efficient admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- Example: Set a specific user as admin (replace USER_ID with actual UUID)
-- UPDATE profiles SET is_admin = true WHERE id = 'USER_ID';

-- ============================================================================
-- NOTES:
-- - All existing users will have is_admin = false by default
-- - Only users with is_admin = true can access admin routes
-- - Use adminClient (service role) to check admin status to bypass RLS
-- ============================================================================

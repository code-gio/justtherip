-- ============================================================
-- USE THESE EXPRESSIONS IF CREATING POLICIES FROM THE UI
-- ============================================================
-- Go to: Storage > Buckets > avatars > Policies > New policy
-- ============================================================

-- POLICY 1: INSERT (Upload avatars)
-- ============================================================
-- Policy name: Users can upload their own avatar
-- Allowed operation: INSERT
-- Target roles: authenticated
-- USING expression: (leave empty)
-- WITH CHECK expression: (copy below)

bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text

-- ============================================================
-- POLICY 2: UPDATE (Update avatars)
-- ============================================================
-- Policy name: Users can update their own avatar
-- Allowed operation: UPDATE
-- Target roles: authenticated
-- USING expression: (copy below)

bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text

-- WITH CHECK expression: (copy the same)

bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text

-- ============================================================
-- POLICY 3: DELETE (Delete avatars)
-- ============================================================
-- Policy name: Users can delete their own avatar
-- Allowed operation: DELETE
-- Target roles: authenticated
-- USING expression: (copy below)

bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text

-- WITH CHECK expression: (leave empty)

-- ============================================================
-- POLICY 4: SELECT (View avatars)
-- ============================================================
-- Policy name: Users can view avatars
-- Allowed operation: SELECT
-- Target roles: authenticated
-- USING expression: (copy below)

bucket_id = 'avatars'

-- WITH CHECK expression: (leave empty)

-- ============================================================
-- END - You should now have 4 policies created
-- ============================================================

# Avatar Bucket Setup in Supabase

## Steps to Configure the "avatars" Bucket

### 1. Create the Bucket

1. Go to your Supabase Dashboard project
2. Navigate to **Storage** in the sidebar menu
3. Click on **Create bucket**
4. Bucket name: `avatars`
5. **DO NOT check** Public bucket (keep it private for better security)
6. Click on **Save**

### 2. Configure Security Policies (RLS Policies)

After creating the bucket, you need to set up security policies:

#### Policy for UPLOAD (Upload/Insert)

```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy for UPDATE

```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy for DELETE

```sql
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Policy for READ (Select) - Authenticated Users Only

```sql
CREATE POLICY "Users can view avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');
```

### 3. Apply the Policies

**⚠️ IMPORTANT**: Use the `avatar_policies.sql` file located in `docs/database/policies/`. That file contains clean SQL queries without markdown formatting.

You can apply these policies in two ways:

#### Option A: From SQL Editor (RECOMMENDED)

1. Go to **SQL Editor** in the Supabase sidebar
2. Create a new query
3. Open the `avatar_policies.sql` file
4. Copy and paste ALL the file content
5. Execute the query

#### Option B: From Storage Interface (One by one)

1. Go to **Storage** > **Policies**
2. Click on **New policy**
3. Copy ONLY the SQL code from each policy (without the markdown #### comments)
4. Repeat for each of the 4 policies

### 4. Verify the Setup

To verify everything works:

1. Go to your application
2. Navigate to **Account Settings**
3. Click on the camera icon on the avatar
4. Select an image (maximum 5MB)
5. The image should upload and display immediately

### File Structure

Avatars will be stored with this structure:

```
avatars/
  └── {user_id}/
      └── profile_photo.{ext}
```

Where:

- `{user_id}` is the user's unique ID
- `{ext}` is the file extension (jpg, png, etc.)

### Important Notes

- Maximum image size is 5MB
- Only image file types are allowed
- Each user can only upload/modify files in their own folder
- Images are accessible only to authenticated users via signed URLs
- When uploading a new image, the previous one is automatically overwritten
- Avatar URLs expire after 1 hour for security

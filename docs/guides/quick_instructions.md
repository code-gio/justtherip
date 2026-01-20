# Quick Instructions - Setting Up Avatars

## Step 1: Create the Bucket

1. Go to **Storage** in Supabase
2. Click on **Create bucket**
3. Name: `avatars`
4. **DO NOT mark** as public
5. Save

## Step 2: Apply Policies

### OPTION A: SQL Editor (RECOMMENDED - EASIER)

1. Go to **SQL Editor** (in the left sidebar menu)
2. Click on **New query**
3. Copy ALL the content from `setup_avatar_policies.sql`
4. Paste it in the editor
5. Click **RUN** (or Ctrl+Enter)
6. ✅ Done!

### OPTION B: From Storage UI (More laborious)

If you want to use the Storage interface instead of the SQL Editor, follow these instructions:

1. Go to **Storage** > **Buckets** > `avatars`
2. Click on the **Policies** tab
3. Click on **New policy**
4. For each policy:

**IMPORTANT**: In the Storage interface, DO NOT use the complete CREATE POLICY command. Only use the expressions found in the `setup_avatar_policies_UI.sql` file I just created.

The `setup_avatar_policies_UI.sql` file contains the correct expressions to copy and paste into the Storage interface.

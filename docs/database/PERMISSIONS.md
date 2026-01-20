# Deck Folders - Permission Matrix

This document explains the permission model for deck folders based on their visibility status.

## Visibility Levels

### Private
- **Creator**: Full access (read + write)
- **Other Users**: No access

### Unlisted
- **Creator**: Full access (read + write)
- **Other Users**: Read-only access

### Public
- **Creator**: Full access (read + write)
- **Other Users**: Read-only access

## Permission Matrix

| Action | Private (Creator) | Private (Others) | Unlisted (Creator) | Unlisted (Others) | Public (Creator) | Public (Others) |
|--------|------------------|------------------|-------------------|------------------|-----------------|-----------------|
| **View (SELECT)** | ✅ Yes | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Create (INSERT)** | ✅ Yes | ❌ No | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Update** | ✅ Yes | ❌ No | ✅ Yes | ❌ No | ✅ Yes | ❌ No |
| **Delete** | ✅ Yes | ❌ No | ✅ Yes | ❌ No | ✅ Yes | ❌ No |

## RLS Policy Implementation

### SELECT Policy
```sql
create policy "Users can view deck_folders based on status"
  on public.deck_folders
  for select
  using (
    user_id = auth.uid()              -- Creator can always view
    or status in ('public', 'unlisted') -- Others can view if public/unlisted
  );
```

### INSERT Policy
```sql
create policy "Users can insert own deck_folders"
  on public.deck_folders
  for insert
  with check (user_id = auth.uid());  -- Only create your own
```

### UPDATE Policy
```sql
create policy "Users can update own deck_folders"
  on public.deck_folders
  for update
  using (user_id = auth.uid());       -- Only update your own
```

### DELETE Policy
```sql
create policy "Users can delete own deck_folders"
  on public.deck_folders
  for delete
  using (user_id = auth.uid());       -- Only delete your own
```

## Use Cases

### Private Deck
**Purpose**: Personal drafts, work-in-progress decks, or private collections

**Example**:
- User A creates a private deck → Only User A can see and edit it
- User B cannot see it exists, even if they know the ID

### Unlisted Deck
**Purpose**: Share with specific people via link, but not discoverable

**Example**:
- User A creates an unlisted deck → User A can edit it
- User B can view it via direct link but cannot edit
- Deck won't appear in public search/browse

### Public Deck
**Purpose**: Community sharing, public tournaments, showcases

**Example**:
- User A creates a public deck → User A can edit it
- All users can view it and browse it
- Other users cannot modify it

## Security Notes

- ⚠️ **Write operations** (INSERT, UPDATE, DELETE) are ALWAYS restricted to the creator, regardless of status
- ✅ **Read operations** (SELECT) respect the status field
- 🔒 **Authentication required**: All policies require `auth.uid()` to be set
- 🚫 **No anonymous access**: Users must be logged in to interact with decks

## Testing Policies

To verify policies are working correctly:

```sql
-- 1. Check active policies
SELECT * FROM pg_policies WHERE tablename = 'deck_folders';

-- 2. Test as User A (creator)
-- Should see all your decks regardless of status
SELECT * FROM deck_folders WHERE user_id = auth.uid();

-- 3. Test as User B (other user)
-- Should only see public and unlisted decks from others
SELECT * FROM deck_folders WHERE user_id != auth.uid();

-- 4. Try to update someone else's deck (should fail)
UPDATE deck_folders 
SET name = 'Hacked!' 
WHERE user_id != auth.uid();  -- Will return 0 rows affected
```

## Related Files

- [001_create_deck_folders_table.sql](../migrations/001_create_deck_folders_table.sql) - Table creation with RLS policies
- [Database README](../README.md) - Full database documentation

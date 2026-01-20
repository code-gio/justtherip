-- Create deck_folders table for managing decks and folders with recursive structure
create table public.deck_folders (
  id uuid not null default gen_random_uuid(),
  name character varying(100) not null,
  type character varying(10) not null,
  status character varying(20) not null default 'private'::character varying,
  packages text[] null,
  user_id uuid not null,
  parent_id uuid null,
  position integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint deck_folders_pkey primary key (id),
  constraint deck_folders_user_id_fkey foreign key (user_id) references public.profiles (id) on delete cascade,
  constraint deck_folders_parent_id_fkey foreign key (parent_id) references public.deck_folders (id) on delete cascade,
  constraint deck_folders_type_check check (
    (type)::text = any (array['folder'::character varying, 'deck'::character varying]::text[])
  ),
  constraint deck_folders_status_check check (
    (status)::text = any (
      array[
        'private'::character varying,
        'unlisted'::character varying,
        'public'::character varying
      ]::text[]
    )
  ),
  constraint deck_folders_name_check check ((length((name)::text) >= 1))
) tablespace pg_default;

-- Create indexes for better query performance
create index if not exists idx_deck_folders_user_id on public.deck_folders using btree (user_id) tablespace pg_default;

create index if not exists idx_deck_folders_parent_id on public.deck_folders using btree (parent_id) tablespace pg_default;

create index if not exists idx_deck_folders_type on public.deck_folders using btree (type) tablespace pg_default;

create index if not exists idx_deck_folders_position on public.deck_folders using btree (position) tablespace pg_default;

create index if not exists idx_deck_folders_created_at on public.deck_folders using btree (created_at desc) tablespace pg_default;

-- Create trigger to update updated_at timestamp
create trigger update_deck_folders_updated_at before
update on deck_folders for each row
execute function update_updated_at_column ();

-- Enable Row Level Security
alter table public.deck_folders enable row level security;

-- Create RLS policies
-- SELECT policy: 
--   - private: only creator can read
--   - unlisted: creator + anyone can read
--   - public: creator + anyone can read
create policy "Users can view deck_folders based on status"
  on public.deck_folders
  for select
  using (
    user_id = auth.uid()
    or status in ('public', 'unlisted')
  );

-- INSERT policy: Only authenticated users can create their own deck_folders
create policy "Users can insert own deck_folders"
  on public.deck_folders
  for insert
  with check (user_id = auth.uid());

-- UPDATE policy: Only the creator can update
create policy "Users can update own deck_folders"
  on public.deck_folders
  for update
  using (user_id = auth.uid());

-- DELETE policy: Only the creator can delete
create policy "Users can delete own deck_folders"
  on public.deck_folders
  for delete
  using (user_id = auth.uid());

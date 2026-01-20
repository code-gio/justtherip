-- Create deck_cards table for managing cards within decks
create table public.deck_cards (
  id uuid not null default gen_random_uuid(),
  deck_id uuid not null,
  card_id uuid not null,
  category character varying(50) null,
  is_pinned boolean not null default false,
  position integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint deck_cards_pkey primary key (id),
  constraint deck_cards_deck_id_fkey foreign key (deck_id) references public.deck_folders (id) on delete cascade,
  constraint deck_cards_unique_card_per_deck unique (deck_id, card_id)
) tablespace pg_default;

-- Create indexes for better query performance
create index if not exists idx_deck_cards_deck_id on public.deck_cards using btree (deck_id) tablespace pg_default;

create index if not exists idx_deck_cards_card_id on public.deck_cards using btree (card_id) tablespace pg_default;

create index if not exists idx_deck_cards_category on public.deck_cards using btree (category) tablespace pg_default;

create index if not exists idx_deck_cards_is_pinned on public.deck_cards using btree (is_pinned) tablespace pg_default
where
  (is_pinned = true);

create index if not exists idx_deck_cards_position on public.deck_cards using btree (position) tablespace pg_default;

create index if not exists idx_deck_cards_created_at on public.deck_cards using btree (created_at desc) tablespace pg_default;

-- Create trigger to update updated_at timestamp
create trigger update_deck_cards_updated_at before
update on deck_cards for each row
execute function update_updated_at_column ();

-- Enable Row Level Security
alter table public.deck_cards enable row level security;

-- Create RLS policies
-- SELECT policy: Users can view cards based on deck status
--   - private: only deck creator can read
--   - unlisted: deck creator + anyone can read
--   - public: deck creator + anyone can read
create policy "Users can view cards in accessible decks"
  on public.deck_cards
  for select
  using (
    exists (
      select 1
      from public.deck_folders
      where deck_folders.id = deck_cards.deck_id
        and (
          deck_folders.user_id = auth.uid()
          or deck_folders.status in ('public', 'unlisted')
        )
    )
  );

-- Users can insert cards only in their own decks
create policy "Users can insert cards in own decks"
  on public.deck_cards
  for insert
  with check (
    exists (
      select 1
      from public.deck_folders
      where deck_folders.id = deck_cards.deck_id
        and deck_folders.user_id = auth.uid()
    )
  );

-- Users can update cards only in their own decks
create policy "Users can update cards in own decks"
  on public.deck_cards
  for update
  using (
    exists (
      select 1
      from public.deck_folders
      where deck_folders.id = deck_cards.deck_id
        and deck_folders.user_id = auth.uid()
    )
  );

-- Users can delete cards only from their own decks
create policy "Users can delete cards from own decks"
  on public.deck_cards
  for delete
  using (
    exists (
      select 1
      from public.deck_folders
      where deck_folders.id = deck_cards.deck_id
        and deck_folders.user_id = auth.uid()
    )
  );

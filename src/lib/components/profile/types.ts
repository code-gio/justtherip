export interface Profile {
  id?: string;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  display_name: string | null;
  total_packs_opened: number | null;
  best_pull_value_cents: number | null;
  profile_visibility: "public" | "private" | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProfileFormData {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
  profileVisibility: "public" | "private";
}


export interface UserWithStats {
  // Profile fields
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  display_name: string | null;
  total_packs_opened: number;
  best_pull_value_cents: number;
  profile_visibility: 'public' | 'private' | 'friends';
  created_at: string;
  updated_at: string;
  stripe_customer_id: string | null;
  is_admin: boolean;
  
  // Aggregated stats
  inventory_card_count: number;
  inventory_value_cents: number;
  current_balance: number;
  total_purchased: number;
  total_spent: number;
}

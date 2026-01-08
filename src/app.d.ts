import { SupabaseClient, Session } from "@supabase/supabase-js";
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
  is_admin?: boolean;
  created_at?: string;
  updated_at?: string;
}

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      supabase: SupabaseClient;
      safeGetSession(): Promise<{
        session: Session | null;
        user?: Session["user"] | null;
      }>;
    }
    interface PageData {
      session: Session | null;
      user?: Session["user"] | null;
      profile?: Profile | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};

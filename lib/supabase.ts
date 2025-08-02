import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  username: string;
  email?: string;
  display_name?: string;
  created_at: string;
  updated_at: string;
};

export type UserCredential = {
  id: string;
  user_id: string;
  credential_id: string;
  credential_public_key: ArrayBuffer;
  counter: number;
  credential_device_type?: string;
  credential_backed_up: boolean;
  transports?: string[];
  created_at: string;
};
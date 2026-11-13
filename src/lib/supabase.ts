// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import { Evento } from '../types/evento';
import { Inscricao } from '../types/inscricao';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://lnmyjhzlymqbhrocukap.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_zmY89Z2VKttkbSs5hUaz9A_YCvI1XYy';

export const isLiveSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('sua-igreja'));

// Cliente real Supabase
export const supabase = createClient(
  supabaseUrl || 'https://mock-eira.supabase.co',
  supabaseAnonKey || 'mock-anon-key'
);

// Dados de Seed zerados para configuração oficial da Eira Church
export const SEED_EVENTOS: Evento[] = [];
export const SEED_INSCRICOES: Inscricao[] = [];

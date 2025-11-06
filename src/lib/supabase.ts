import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase-database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Variáveis de ambiente do Supabase não configuradas!\n' +
    'Por favor, configure as seguintes variáveis de ambiente:\n' +
    '- VITE_SUPABASE_URL\n' +
    '- VITE_SUPABASE_ANON_KEY\n\n' +
    'Na Vercel, vá em Settings > Environment Variables e adicione essas variáveis.'
  );
  throw new Error(
    'Supabase não configurado: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);


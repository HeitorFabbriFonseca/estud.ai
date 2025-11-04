// Tipos baseados nas tabelas do Supabase

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  sequence_order: number;
  created_at: string;
}

// Tipos para inserção (sem campos gerados automaticamente)
export interface InsertUserInfo {
  username: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface InsertChat {
  user_id: string;
  title?: string;
  is_archived?: boolean;
}

export interface InsertMessage {
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  sequence_order: number;
}


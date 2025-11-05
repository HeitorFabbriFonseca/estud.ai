// Tipos gerados automaticamente para o Supabase
// Baseado no schema.sql criado

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_info: {
        Row: {
          id: string;
          username: string;
          email: string;
          name: string;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          name: string;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          name?: string;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          role: 'user' | 'assistant';
          content: string;
          sequence_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: 'user' | 'assistant';
          content: string;
          sequence_order: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
          sequence_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}


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
          password_hash: string;
          avatar: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          name: string;
          password_hash: string;
          avatar?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          name?: string;
          password_hash?: string;
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
      authenticate_user: {
        Args: {
          p_username: string;
          p_password: string;
        };
        Returns: {
          id: string;
          username: string;
          email: string;
          name: string;
          avatar: string | null;
          created_at: string;
          updated_at: string;
          password_hash: string;
        }[];
      };
      hash_password: {
        Args: {
          password: string;
        };
        Returns: string;
      };
      change_password: {
        Args: {
          p_user_id: string;
          p_current_password: string;
          p_new_password: string;
        };
        Returns: boolean | null;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}


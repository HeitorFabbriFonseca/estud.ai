import { supabase } from '../lib/supabase';
import type { UserInfo, InsertUserInfo } from '../types/database';

export class UserService {
  // Criar ou obter usuário
  static async createOrGetUser(userData: InsertUserInfo): Promise<UserInfo | null> {
    // Primeiro, tenta encontrar o usuário pelo username
    const { data: existingUser } = await supabase
      .from('user_info')
      .select('*')
      .eq('username', userData.username)
      .single();

    if (existingUser) {
      return existingUser as UserInfo;
    }

    // Se não existir, cria um novo
    const { data, error } = await supabase
      .from('user_info')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }

    return data as UserInfo;
  }

  // Obter usuário por ID
  static async getUserById(userId: string): Promise<UserInfo | null> {
    const { data, error } = await supabase
      .from('user_info')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }

    return data as UserInfo;
  }

  // Obter usuário por username
  static async getUserByUsername(username: string): Promise<UserInfo | null> {
    const { data, error } = await supabase
      .from('user_info')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }

    return data as UserInfo;
  }

  // Atualizar informações do usuário
  static async updateUser(userId: string, updates: Partial<InsertUserInfo>): Promise<boolean> {
    const { error } = await supabase
      .from('user_info')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }

    return true;
  }
}


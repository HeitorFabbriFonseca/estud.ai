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

  // Autenticar usuário com username e senha
  static async authenticateUser(username: string, password: string): Promise<UserInfo | null> {
    // Usar função RPC do Supabase para autenticar
    const { data, error } = await supabase.rpc('authenticate_user', {
      p_username: username,
      p_password: password
    });

    if (error) {
      console.error('Erro ao autenticar usuário:', error);
      return null;
    }

    if (data && data.length > 0) {
      // Retornar usuário sem o password_hash
      const userData = data[0];
      const { password_hash, ...userWithoutPassword } = userData;
      return userWithoutPassword as UserInfo;
    }

    return null;
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


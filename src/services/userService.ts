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
    try {
      // Validar parâmetros
      if (!username || !password) {
        console.error('Username e senha são obrigatórios');
        return null;
      }

      // Usar função RPC do Supabase para autenticar
      const trimmedUsername = username.trim();
      const { data, error } = await supabase.rpc('authenticate_user', {
        p_username: trimmedUsername,
        p_password: password
      });

      if (error) {
        console.error('❌ Erro ao autenticar usuário:', error);
        console.error('Detalhes do erro:', JSON.stringify(error, null, 2));
        console.error('Username usado:', trimmedUsername);
        return null;
      }

      // Debug: verificar o que foi retornado
      if (data === null || data === undefined) {
        console.warn('⚠️ Função retornou null/undefined');
        return null;
      }

      if (Array.isArray(data) && data.length > 0) {
        // Retornar usuário sem o password_hash
        const userData = data[0];
        const { password_hash, ...userWithoutPassword } = userData;
        console.log('✅ Autenticação bem-sucedida:', userWithoutPassword.username);
        return userWithoutPassword as UserInfo;
      }

      // Se chegou aqui, data está vazio (senha incorreta ou usuário não existe)
      console.warn('⚠️ Autenticação falhou - dados vazios. Username:', trimmedUsername);
      return null;
    } catch (error) {
      console.error('Exceção ao autenticar usuário:', error);
      return null;
    }
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

  // Alterar senha do usuário
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Type assertion necessário porque o TypeScript não está inferindo corretamente
      const { data, error } = await (supabase.rpc as any)('change_password', {
        p_user_id: userId,
        p_current_password: currentPassword,
        p_new_password: newPassword
      });

      if (error) {
        console.error('Erro ao alterar senha:', error);
        return { success: false, error: 'Erro ao alterar senha' };
      }

      if (data === false || data === null) {
        return { success: false, error: 'Senha atual incorreta' };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return { success: false, error: 'Erro ao alterar senha' };
    }
  }
}


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

  // Upload de avatar
  static async uploadAvatar(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        return { success: false, error: 'O arquivo deve ser uma imagem' };
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return { success: false, error: 'A imagem deve ter no máximo 5MB' };
      }

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError);
        
        // Verificar se o erro é porque o bucket não existe
        if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('The resource was not found')) {
          return { 
            success: false, 
            error: 'Bucket de avatares não configurado. Por favor, crie um bucket chamado "avatars" no Supabase Storage.' 
          };
        }
        
        return { success: false, error: uploadError.message || 'Erro ao fazer upload da imagem' };
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        return { success: false, error: 'Erro ao obter URL da imagem' };
      }

      // Atualizar avatar no banco de dados
      const updateSuccess = await this.updateUser(userId, { avatar: urlData.publicUrl });

      if (!updateSuccess) {
        return { success: false, error: 'Erro ao atualizar avatar no banco de dados' };
      }

      return { success: true, url: urlData.publicUrl };
    } catch (error: any) {
      console.error('Erro ao fazer upload do avatar:', error);
      return { 
        success: false, 
        error: error?.message || 'Erro ao fazer upload do avatar. Verifique se o bucket "avatars" está configurado no Supabase Storage.' 
      };
    }
  }
}


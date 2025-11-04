import { supabase } from '../lib/supabase';
import type { Chat, Message, InsertChat, InsertMessage } from '../types/database';

export class ChatService {
  // Criar um novo chat
  static async createChat(userId: string, title?: string): Promise<Chat | null> {
    const chatData: InsertChat = {
      user_id: userId,
      title: title || 'Nova Conversa',
      is_archived: false,
    };

    const { data, error } = await supabase
      .from('chats')
      .insert(chatData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar chat:', error);
      return null;
    }

    return data as Chat;
  }

  // Obter todos os chats de um usuário
  static async getUserChats(userId: string, includeArchived: boolean = false): Promise<Chat[]> {
    let query = supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar chats:', error);
      return [];
    }

    return (data || []) as Chat[];
  }

  // Obter um chat específico
  static async getChat(chatId: string): Promise<Chat | null> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    if (error) {
      console.error('Erro ao buscar chat:', error);
      return null;
    }

    return data as Chat;
  }

  // Arquivar um chat
  static async archiveChat(chatId: string): Promise<boolean> {
    const { error } = await supabase
      .from('chats')
      .update({ is_archived: true })
      .eq('id', chatId);

    if (error) {
      console.error('Erro ao arquivar chat:', error);
      return false;
    }

    return true;
  }

  // Adicionar uma mensagem ao chat
  static async addMessage(chatId: string, role: 'user' | 'assistant', content: string): Promise<Message | null> {
    // Obter o próximo sequence_order
    const { data: messages } = await supabase
      .from('messages')
      .select('sequence_order')
      .eq('chat_id', chatId)
      .order('sequence_order', { ascending: false })
      .limit(1);

    const nextSequence = messages && messages.length > 0 
      ? (messages[0].sequence_order as number) + 1 
      : 0;

    const messageData: InsertMessage = {
      chat_id: chatId,
      role,
      content,
      sequence_order: nextSequence,
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao adicionar mensagem:', error);
      return null;
    }

    // Atualizar o updated_at do chat
    await supabase
      .from('chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', chatId);

    return data as Message;
  }

  // Obter todas as mensagens de um chat
  static async getChatMessages(chatId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('sequence_order', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }

    return (data || []) as Message[];
  }

  // Atualizar o título do chat
  static async updateChatTitle(chatId: string, title: string): Promise<boolean> {
    const { error } = await supabase
      .from('chats')
      .update({ title })
      .eq('id', chatId);

    if (error) {
      console.error('Erro ao atualizar título do chat:', error);
      return false;
    }

    return true;
  }
}


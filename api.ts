import { supabase } from './supabase';
import type { Conversation, Message, GeneratedImage, Profile } from '@/types';

export const conversationsApi = {
  // Get all conversations for current user
  async getConversations(): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // Create new conversation
  async createConversation(title: string = 'New Conversation'): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update conversation title
  async updateConversation(id: string, title: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;
  },

  // Delete conversation
  async deleteConversation(id: string): Promise<void> {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

export const messagesApi = {
  // Get messages for a conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // Create new message
  async createMessage(conversationId: string, role: 'user' | 'model', content: string): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete all messages in a conversation
  async deleteMessages(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (error) throw error;
  },
};

export const imagesApi = {
  // Get generated images for a conversation
  async getImages(conversationId: string): Promise<GeneratedImage[]> {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

export const profilesApi = {
  // Get current user profile
  async getCurrentProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Get all profiles (admin only)
  async getAllProfiles(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  // Update user role (admin only)
  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
  },
};

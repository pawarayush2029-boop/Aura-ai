export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  username: string;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export interface GeneratedImage {
  id: string;
  conversation_id: string;
  prompt: string;
  image_url: string;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
    };
  }>;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
  color: string;
  capabilities: string[];
}

export interface ImageGenerationTask {
  taskId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'TIMEOUT';
  imageUrl?: string;
  error?: string;
}

export interface ConversationTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  agentId: string;
}

export interface MessageBookmark {
  id: string;
  messageId: string;
  conversationId: string;
  note?: string;
  createdAt: string;
}

export interface ConversationTag {
  id: string;
  name: string;
  color: string;
}

export interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
}

export interface ImageGenerationRequest {
  prompt: string;
  conversationId?: string;
  aspectRatio?: string;
  n?: number;
}

export interface ImageGenerationResponse {
  id: string;
  data: {
    image_urls?: string[];
    image_base64?: string[];
  };
  metadata: {
    success_count: string;
    failed_count: string;
  };
  base_resp: {
    status_code: number;
    status_msg: string;
  };
}

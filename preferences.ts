// User preferences and settings types

export interface UserPreferences {
  // Appearance
  theme: 'light' | 'dark' | 'auto' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'rose' | 'lavender' | 'mint' | 'amber' | 'slate';
  fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  messageDensity: 'compact' | 'comfortable' | 'spacious';
  sidebarPosition: 'left' | 'right';
  layoutMode: 'default' | 'focus' | 'zen';
  messageBubbleStyle: 'rounded' | 'square' | 'minimal';
  showAvatars: boolean;
  showTimestamps: boolean;
  
  // AI Settings
  aiModel: 'gemini-2.5-flash' | 'gemini-pro' | 'gemini-ultra';
  aiPersonality: 'professional' | 'friendly' | 'creative' | 'concise' | 'detailed' | 'humorous';
  temperature: number; // 0-1
  maxTokens: number;
  contextWindow: number;
  enableMemory: boolean;
  
  // Features
  enableVoiceInput: boolean;
  enableAutoSave: boolean;
  enableSpellCheck: boolean;
  enableMarkdownPreview: boolean;
  enableCodeHighlight: boolean;
  enableLinkPreview: boolean;
  
  // Notifications
  enableSoundEffects: boolean;
  enableNotifications: boolean;
  notificationSound: 'default' | 'chime' | 'pop' | 'none';
  
  // Privacy
  saveHistory: boolean;
  enableAnalytics: boolean;
  shareUsageData: boolean;
}

export interface ChatFolder {
  id: string;
  name: string;
  color: string;
  icon: string;
  conversationIds: string[];
  created_at: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'writing' | 'coding' | 'analysis' | 'creative' | 'business' | 'education' | 'custom';
  tags: string[];
  usageCount: number;
  isFavorite: boolean;
  created_at: string;
}

export interface MessageBookmark {
  id: string;
  messageId: string;
  conversationId: string;
  note?: string;
  tags: string[];
  created_at: string;
}

export interface ChatAnalytics {
  totalMessages: number;
  totalConversations: number;
  totalTokensUsed: number;
  averageResponseTime: number;
  mostUsedFeatures: string[];
  dailyUsage: { date: string; count: number }[];
  topTopics: string[];
  favoriteModel: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  extractedFrom: string; // conversation ID
  created_at: string;
}

export interface QuickNote {
  id: string;
  content: string;
  tags: string[];
  linkedConversation?: string;
  created_at: string;
  updated_at: string;
}

export interface SharedConversation {
  id: string;
  conversationId: string;
  shareLink: string;
  expiresAt?: string;
  viewCount: number;
  password?: string;
  created_at: string;
}

// Default preferences
export const defaultPreferences: UserPreferences = {
  theme: 'auto',
  fontSize: 'base',
  messageDensity: 'comfortable',
  sidebarPosition: 'left',
  layoutMode: 'default',
  messageBubbleStyle: 'rounded',
  showAvatars: true,
  showTimestamps: true,
  
  aiModel: 'gemini-2.5-flash',
  aiPersonality: 'friendly',
  temperature: 0.7,
  maxTokens: 2048,
  contextWindow: 8192,
  enableMemory: true,
  
  enableVoiceInput: true,
  enableAutoSave: true,
  enableSpellCheck: true,
  enableMarkdownPreview: true,
  enableCodeHighlight: true,
  enableLinkPreview: true,
  
  enableSoundEffects: true,
  enableNotifications: true,
  notificationSound: 'default',
  
  saveHistory: true,
  enableAnalytics: true,
  shareUsageData: false,
};

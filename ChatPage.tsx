import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/db/supabase';
import type { ChatMessage } from '@/types';
import ChatSidebar from '@/components/chat/ChatSidebar';
import MessageBubble from '@/components/chat/MessageBubble';
import MessageItem from '@/components/chat/MessageItem';
import ChatInput from '@/components/chat/ChatInput';
import KeyboardShortcutsDialog from '@/components/chat/KeyboardShortcutsDialog';
import ConversationStatsDialog from '@/components/chat/ConversationStatsDialog';
import ExportDialog from '@/components/chat/ExportDialog';
import ConversationSearch from '@/components/chat/ConversationSearch';
import TextToSpeechDialog from '@/components/chat/TextToSpeechDialog';
import { Button } from '@/components/ui/button';
import { Plus, Moon, Sun, RotateCcw, Brain, Settings, Menu, Mic, MicOff, Download, Search, Zap, Image as ImageIcon, BarChart3, Keyboard, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from 'next-themes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LocalConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface LocalMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
  video_url?: string;
  pinned?: boolean;
}

const STORAGE_KEY = 'aura_ai_conversations';
const MESSAGES_KEY = 'aura_ai_messages';
const SETTINGS_KEY = 'aura_ai_settings';

interface UserSettings {
  customInstructions: string;
  responseStyle: string;
  voiceEnabled: boolean;
  textSize: 'small-x4' | 'double-extra-small' | 'extra-small' | 'small' | 'medium' | 'large';
  chatBoxHeaderSize: 'small-x4' | 'small' | 'medium' | 'large';
  uiSize: 'small-x4' | 'double-extra-small' | 'small' | 'medium' | 'large';
}

const QUICK_PROMPTS = [
  { icon: '💡', label: 'Explain', prompt: 'Explain this concept in simple terms:' },
  { icon: '🔍', label: 'Analyze', prompt: 'Analyze and provide insights on:' },
  { icon: '📝', label: 'Summarize', prompt: 'Summarize the following:' },
  { icon: '💻', label: 'Code', prompt: 'Write code to:' },
  { icon: '🎨', label: 'Creative', prompt: 'Create a creative response for:' },
  { icon: '🔬', label: 'Research', prompt: 'Research and explain:' },
];

export default function ChatPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<LocalConversation | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false); // Hidden by default on mobile
  const [userSettings, setUserSettings] = useState<UserSettings>({
    customInstructions: '',
    responseStyle: 'balanced',
    voiceEnabled: false,
    textSize: 'small',
    chatBoxHeaderSize: 'small',
    uiSize: 'small',
  });
  const [showTabletTip, setShowTabletTip] = useState(false);
  const [showOkButton, setShowOkButton] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New feature states
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showConversationStats, setShowConversationStats] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [conversationSearchQuery, setConversationSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [useEnhancedMessages, setUseEnhancedMessages] = useState(true);
  const [showTextToSpeech, setShowTextToSpeech] = useState(false);
  const [textToSpeechContent, setTextToSpeechContent] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Helper function to get text size class
  const getTextSizeClass = () => {
    switch (userSettings.textSize) {
      case 'small-x4':
        return 'text-[8px]';
      case 'double-extra-small':
        return 'text-[9px]';
      case 'extra-small':
        return 'text-[10px]';
      case 'small':
        return 'text-[11px]';
      case 'medium':
        return 'text-sm';
      case 'large':
        return 'text-base';
      default:
        return 'text-[11px]';
    }
  };

  // Helper function to get Chat Box & Header size classes
  const getChatBoxHeaderSizeClasses = () => {
    switch (userSettings.chatBoxHeaderSize) {
      case 'small-x4':
        return {
          header: 'h-6',
          headerPadding: 'px-0.5',
          headerGap: 'gap-0.5',
          button: 'h-4 w-4',
          icon: 'w-2 h-2',
          inputContainer: 'p-0.5',
          messagesPadding: 'p-0.5',
          messagesSpacing: 'space-y-0.5',
          messagesPb: 'pb-0.5',
          avatar: 'w-3 h-3',
          avatarIcon: 'w-1.5 h-1.5',
          bubblePadding: 'px-1 py-0.5',
          bubbleRounded: 'rounded-sm',
          bubbleGap: 'gap-0.5',
          inputButton: 'h-4',
          inputGap: 'gap-0.5',
          inputSpacing: 'space-y-0.5',
          textarea: 'min-h-[20px] max-h-[50px] py-0.5',
          sendButton: 'h-[20px] w-[20px]',
          sendIcon: 'w-2 h-2',
        };
      case 'small':
        return {
          header: 'h-10',
          headerPadding: 'px-2',
          headerGap: 'gap-1',
          button: 'h-7 w-7',
          icon: 'w-3.5 h-3.5',
          inputContainer: 'p-2',
          messagesPadding: 'p-2',
          messagesSpacing: 'space-y-2',
          messagesPb: 'pb-2',
          avatar: 'w-6 h-6',
          avatarIcon: 'w-3.5 h-3.5',
          bubblePadding: 'px-2.5 py-1.5',
          bubbleRounded: 'rounded-lg',
          bubbleGap: 'gap-1.5',
          inputButton: 'h-7',
          inputGap: 'gap-1.5',
          inputSpacing: 'space-y-1.5',
          textarea: 'min-h-[36px] max-h-[100px] py-2',
          sendButton: 'h-[36px] w-[36px]',
          sendIcon: 'w-3.5 h-3.5',
        };

      case 'medium':
        return {
          header: 'h-14',
          headerPadding: 'px-4',
          headerGap: 'gap-2',
          button: 'h-10 w-10',
          icon: 'w-5 h-5',
          inputContainer: 'p-4',
          messagesPadding: 'p-4',
          messagesSpacing: 'space-y-4',
          messagesPb: 'pb-4',
          avatar: 'w-9 h-9',
          avatarIcon: 'w-5 h-5',
          bubblePadding: 'px-4 py-2.5',
          bubbleRounded: 'rounded-xl',
          bubbleGap: 'gap-2',
          inputButton: 'h-10',
          inputGap: 'gap-2',
          inputSpacing: 'space-y-2',
          textarea: 'min-h-[48px] max-h-[130px] py-3',
          sendButton: 'h-[48px] w-[48px]',
          sendIcon: 'w-5 h-5',
        };
      case 'large':
        return {
          header: 'h-16',
          headerPadding: 'px-5',
          headerGap: 'gap-3',
          button: 'h-12 w-12',
          icon: 'w-6 h-6',
          inputContainer: 'p-5',
          messagesPadding: 'p-5',
          messagesSpacing: 'space-y-5',
          messagesPb: 'pb-5',
          avatar: 'w-12 h-12',
          avatarIcon: 'w-6 h-6',
          bubblePadding: 'px-5 py-3.5',
          bubbleRounded: 'rounded-2xl',
          bubbleGap: 'gap-3',
          inputButton: 'h-12',
          inputGap: 'gap-3',
          inputSpacing: 'space-y-3',
          textarea: 'min-h-[56px] max-h-[150px] py-3.5',
          sendButton: 'h-[56px] w-[56px]',
          sendIcon: 'w-6 h-6',
        };
      default:
        return {
          header: 'h-10',
          headerPadding: 'px-2',
          headerGap: 'gap-1',
          button: 'h-7 w-7',
          icon: 'w-3.5 h-3.5',
          inputContainer: 'p-2',
          messagesPadding: 'p-2',
          messagesSpacing: 'space-y-2',
          messagesPb: 'pb-2',
          avatar: 'w-6 h-6',
          avatarIcon: 'w-3.5 h-3.5',
          bubblePadding: 'px-2.5 py-1.5',
          bubbleRounded: 'rounded-lg',
          bubbleGap: 'gap-1.5',
          inputButton: 'h-7',
          inputGap: 'gap-1.5',
          inputSpacing: 'space-y-1.5',
          textarea: 'min-h-[36px] max-h-[100px] py-2',
          sendButton: 'h-[36px] w-[36px]',
          sendIcon: 'w-3.5 h-3.5',
        };
    }
  };

  // Helper function to get UI size classes (for sidebar and interface)
  const getUISizeClasses = () => {
    switch (userSettings.uiSize) {
      case 'small-x4':
        return {
          sidebarWidth: 'w-48',
          sidebarPadding: 'p-1',
          sidebarItemPadding: 'px-1.5 py-0.5',
          sidebarItemGap: 'gap-1',
          sidebarItemText: 'text-[8px]',
          sidebarButtonSize: 'h-5',
          sidebarIconSize: 'w-2.5 h-2.5',
          sidebarSpacing: 'space-y-0.5',
          conversationItemHeight: 'min-h-[24px]',
        };
      case 'double-extra-small':
        return {
          sidebarWidth: 'w-52',
          sidebarPadding: 'p-1.5',
          sidebarItemPadding: 'px-2 py-1',
          sidebarItemGap: 'gap-1.5',
          sidebarItemText: 'text-[9px]',
          sidebarButtonSize: 'h-6',
          sidebarIconSize: 'w-3 h-3',
          sidebarSpacing: 'space-y-1',
          conversationItemHeight: 'min-h-[28px]',
        };
      case 'small':
        return {
          sidebarWidth: 'w-56',
          sidebarPadding: 'p-2',
          sidebarItemPadding: 'px-2.5 py-1.5',
          sidebarItemGap: 'gap-2',
          sidebarItemText: 'text-[10px]',
          sidebarButtonSize: 'h-7',
          sidebarIconSize: 'w-3.5 h-3.5',
          sidebarSpacing: 'space-y-1.5',
          conversationItemHeight: 'min-h-[32px]',
        };
      case 'medium':
        return {
          sidebarWidth: 'w-64',
          sidebarPadding: 'p-3',
          sidebarItemPadding: 'px-3 py-2',
          sidebarItemGap: 'gap-2.5',
          sidebarItemText: 'text-xs',
          sidebarButtonSize: 'h-9',
          sidebarIconSize: 'w-4 h-4',
          sidebarSpacing: 'space-y-2',
          conversationItemHeight: 'min-h-[40px]',
        };
      case 'large':
        return {
          sidebarWidth: 'w-72',
          sidebarPadding: 'p-4',
          sidebarItemPadding: 'px-4 py-2.5',
          sidebarItemGap: 'gap-3',
          sidebarItemText: 'text-sm',
          sidebarButtonSize: 'h-10',
          sidebarIconSize: 'w-5 h-5',
          sidebarSpacing: 'space-y-2.5',
          conversationItemHeight: 'min-h-[44px]',
        };
      default:
        return {
          sidebarWidth: 'w-56',
          sidebarPadding: 'p-2',
          sidebarItemPadding: 'px-2.5 py-1.5',
          sidebarItemGap: 'gap-2',
          sidebarItemText: 'text-[10px]',
          sidebarButtonSize: 'h-7',
          sidebarIconSize: 'w-3.5 h-3.5',
          sidebarSpacing: 'space-y-1.5',
          conversationItemHeight: 'min-h-[32px]',
        };
    }
  };

  useEffect(() => {
    loadConversations();
    loadSettings();
    initializeSpeechRecognition();
    checkFirstTimeUser();
  }, []);

  const checkFirstTimeUser = () => {
    const hasSeenTip = localStorage.getItem('hasSeenTabletTip');
    if (!hasSeenTip) {
      setShowTabletTip(true);
      // Show OK button after 3 seconds
      setTimeout(() => {
        setShowOkButton(true);
      }, 3000);
    }
  };

  const handleDismissTabletTip = () => {
    localStorage.setItem('hasSeenTabletTip', 'true');
    setShowTabletTip(false);
    setShowOkButton(false);
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingMessage]);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript, 'text');
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast({
          title: 'Voice Input Error',
          description: 'Failed to recognize speech. Please try again.',
          variant: 'destructive',
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice Input Unavailable',
        description: 'Your browser does not support voice input.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: 'Listening...',
        description: 'Speak now to send a message',
      });
    }
  };

  useEffect(() => {
    if (currentConversation) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadConversations = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const convs = JSON.parse(stored) as LocalConversation[];
      setConversations(convs);
      if (convs.length > 0 && !currentConversation) {
        setCurrentConversation(convs[0]);
      }
    }
  };

  const loadSettings = () => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      setUserSettings(JSON.parse(stored));
    }
  };

  const saveSettings = (settings: UserSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    setUserSettings(settings);
    toast({
      title: 'Settings Saved',
      description: 'Your personalization settings have been updated.',
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload an image file.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      toast({
        title: 'Image Selected',
        description: 'Image ready to send. Type your question about the image.',
      });
    };
    reader.readAsDataURL(file);
  };

  const exportConversation = () => {
    if (!currentConversation || messages.length === 0) {
      toast({
        title: 'No Conversation',
        description: 'No messages to export.',
        variant: 'destructive',
      });
      return;
    }

    // Create simple, readable format
    let conversationText = `${currentConversation.title}\n`;
    conversationText += '='.repeat(currentConversation.title.length) + '\n\n';

    messages.forEach((m) => {
      const speaker = m.role === 'user' ? 'User' : 'Aura_AI';
      conversationText += `${speaker}: ${m.content}\n\n`;
    });

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentConversation.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Conversation Exported',
      description: 'Your conversation has been downloaded.',
    });
  };

  const filteredMessages = searchQuery
    ? messages.filter((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const saveConversations = (convs: LocalConversation[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    setConversations(convs);
  };

  const loadMessages = (conversationId: string) => {
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const allMessages = JSON.parse(stored) as LocalMessage[];
      const convMessages = allMessages.filter((m) => m.conversation_id === conversationId);
      setMessages(convMessages);
    } else {
      setMessages([]);
    }
  };

  const saveMessage = (message: LocalMessage) => {
    const stored = localStorage.getItem(MESSAGES_KEY);
    const allMessages = stored ? JSON.parse(stored) as LocalMessage[] : [];
    allMessages.push(message);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
    setMessages((prev) => [...prev, message]);
  };

  const handleNewConversation = () => {
    const newConv: LocalConversation = {
      id: crypto.randomUUID(),
      title: 'New Conversation',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedConvs = [newConv, ...conversations];
    saveConversations(updatedConvs);
    setCurrentConversation(newConv);
    setMessages([]);
    // Close sidebar on mobile after creating new conversation
    if (window.innerWidth < 1024) {
      setSidebarVisible(false);
    }
  };

  const handleSelectConversation = (conv: LocalConversation) => {
    setCurrentConversation(conv);
    // Close sidebar on mobile after selecting
    if (window.innerWidth < 1024) {
      setSidebarVisible(false);
    }
  };

  const handleDeleteConversation = (id: string) => {
    const updatedConvs = conversations.filter((c) => c.id !== id);
    saveConversations(updatedConvs);
    
    // Delete messages
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const allMessages = JSON.parse(stored) as LocalMessage[];
      const filteredMessages = allMessages.filter((m) => m.conversation_id !== id);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(filteredMessages));
    }
    
    if (currentConversation?.id === id) {
      setCurrentConversation(updatedConvs[0] || null);
      setMessages([]);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast({
        title: 'Invalid Title',
        description: 'Conversation title cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    const updatedConvs = conversations.map((c) =>
      c.id === id ? { ...c, title: newTitle.trim(), updated_at: new Date().toISOString() } : c
    );
    saveConversations(updatedConvs);

    if (currentConversation?.id === id) {
      setCurrentConversation({ ...currentConversation, title: newTitle.trim() });
    }

    toast({
      title: 'Conversation Renamed',
      description: 'Successfully updated conversation title.',
    });
  };

  const handleRegenerateResponse = useCallback(async () => {
    if (messages.length < 2) return;
    
    // Find the last user message
    const lastUserMessageIndex = messages.map((m, i) => ({ msg: m, index: i }))
      .reverse()
      .find(({ msg }) => msg.role === 'user');
    
    if (!lastUserMessageIndex) return;
    
    // Remove all messages after the last user message
    const messagesToKeep = messages.slice(0, lastUserMessageIndex.index + 1);
    setMessages(messagesToKeep);
    
    // Update local storage
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const allMessages = JSON.parse(stored) as LocalMessage[];
      const otherConvMessages = allMessages.filter((m) => m.conversation_id !== currentConversation?.id);
      const updatedMessages = [...otherConvMessages, ...messagesToKeep];
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
    }
    
    // Regenerate response
    if (currentConversation) {
      await handleTextChat(currentConversation.id, lastUserMessageIndex.msg.content);
    }
  }, [messages, currentConversation]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ or Cmd+/ - Show keyboard shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
      // Ctrl+N or Cmd+N - New conversation
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewConversation();
      }
      // Ctrl+S or Cmd+S - Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setSidebarVisible((prev) => !prev);
      }
      // Ctrl+, or Cmd+, - Open settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setSettingsOpen(true);
      }
      // Ctrl+E or Cmd+E - Export conversation
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && currentConversation) {
        e.preventDefault();
        setShowExportDialog(true);
      }
      // Ctrl+L or Cmd+L - Clear conversation
      if ((e.ctrlKey || e.metaKey) && e.key === 'l' && messages.length > 0) {
        e.preventDefault();
        setShowClearConfirm(true);
      }
      // Ctrl+R or Cmd+R - Regenerate last response
      if ((e.ctrlKey || e.metaKey) && e.key === 'r' && messages.length > 0) {
        e.preventDefault();
        handleRegenerateResponse();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentConversation, messages, handleRegenerateResponse]);

  // New feature handlers
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: 'Message copied to clipboard',
    });
  };

  const handleRegenerateMessage = async (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Find the previous user message
    const userMessageIndex = messages.slice(0, messageIndex).reverse().findIndex((m) => m.role === 'user');
    if (userMessageIndex === -1) return;

    const actualUserIndex = messageIndex - userMessageIndex - 1;
    const userMessage = messages[actualUserIndex];

    // Remove messages from this AI response onwards
    const messagesToKeep = messages.slice(0, messageIndex);
    setMessages(messagesToKeep);

    // Update local storage
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const allMessages = JSON.parse(stored) as LocalMessage[];
      const otherConvMessages = allMessages.filter((m) => m.conversation_id !== currentConversation?.id);
      const updatedMessages = [...otherConvMessages, ...messagesToKeep];
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedMessages));
    }

    // Regenerate response
    if (currentConversation) {
      await handleTextChat(currentConversation.id, userMessage.content);
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // Update the message
    const updatedMessages = messages.map((m) =>
      m.id === messageId ? { ...m, content: newContent } : m
    );

    // Remove all messages after this one
    const messagesToKeep = updatedMessages.slice(0, messageIndex + 1);
    setMessages(messagesToKeep);

    // Update local storage
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const allMessages = JSON.parse(stored) as LocalMessage[];
      const otherConvMessages = allMessages.filter((m) => m.conversation_id !== currentConversation?.id);
      const updatedAllMessages = [...otherConvMessages, ...messagesToKeep];
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedAllMessages));
    }

    // Regenerate response with edited message
    if (currentConversation) {
      await handleTextChat(currentConversation.id, newContent);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter((m) => m.id !== messageId);
    setMessages(updatedMessages);

    // Update local storage
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const allMessages = JSON.parse(stored) as LocalMessage[];
      const otherConvMessages = allMessages.filter((m) => m.conversation_id !== currentConversation?.id);
      const updatedAllMessages = [...otherConvMessages, ...updatedMessages];
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedAllMessages));
    }

    toast({
      title: 'Message deleted',
      description: 'The message has been removed from the conversation',
    });
  };

  const handleClearConversation = () => {
    setMessages([]);

    // Update local storage
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const allMessages = JSON.parse(stored) as LocalMessage[];
      const otherConvMessages = allMessages.filter((m) => m.conversation_id !== currentConversation?.id);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(otherConvMessages));
    }

    setShowClearConfirm(false);
    toast({
      title: 'Conversation cleared',
      description: 'All messages have been removed',
    });
  };

  const handleConversationSearch = (query: string) => {
    setConversationSearchQuery(query);
  };

  const handlePinMessage = (messageId: string) => {
    const updatedMessages = messages.map((m) =>
      m.id === messageId ? { ...m, pinned: !m.pinned } : m
    );
    setMessages(updatedMessages);

    // Update local storage
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const allMessages = JSON.parse(stored) as LocalMessage[];
      const otherConvMessages = allMessages.filter((m) => m.conversation_id !== currentConversation?.id);
      const updatedAllMessages = [...otherConvMessages, ...updatedMessages];
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedAllMessages));
    }

    const message = updatedMessages.find((m) => m.id === messageId);
    toast({
      title: message?.pinned ? 'Message pinned' : 'Message unpinned',
      description: message?.pinned ? 'Message has been pinned to the top' : 'Message has been unpinned',
    });
  };

  const handleTextToSpeechOpen = (content: string) => {
    setTextToSpeechContent(content);
    setShowTextToSpeech(true);
  };

  const handleReplyToMessage = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      // Scroll to input and pre-fill with reply context
      const replyText = `Replying to: "${message.content.slice(0, 50)}${message.content.length > 50 ? '...' : ''}"\n\n`;
      // You can add this to input state if needed
      toast({
        title: 'Reply mode',
        description: 'Type your reply in the input box',
      });
    }
  };

  const handleStartEdit = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
      setEditingContent(message.content);
    }
  };

  const handleSaveEdit = () => {
    if (!editingMessageId) return;

    const updatedMessages = messages.map((m) =>
      m.id === editingMessageId ? { ...m, content: editingContent } : m
    );
    setMessages(updatedMessages);

    // Update local storage
    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const allMessages = JSON.parse(stored) as LocalMessage[];
      const otherConvMessages = allMessages.filter((m) => m.conversation_id !== currentConversation?.id);
      const updatedAllMessages = [...otherConvMessages, ...updatedMessages];
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updatedAllMessages));
    }

    setEditingMessageId(null);
    setEditingContent('');
    toast({
      title: 'Message updated',
      description: 'Your message has been edited',
    });
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingContent('');
  };

  const filteredConversations = useMemo(() => {
    if (!conversationSearchQuery.trim()) return conversations;
    
    const query = conversationSearchQuery.toLowerCase();
    return conversations.filter((conv) =>
      conv.title.toLowerCase().includes(query)
    );
  }, [conversations, conversationSearchQuery]);

  const handleSendMessage = async (content: string, mode: 'text' | 'image' | 'video') => {
    if (!currentConversation) {
      const newConv: LocalConversation = {
        id: crypto.randomUUID(),
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedConvs = [newConv, ...conversations];
      saveConversations(updatedConvs);
      setCurrentConversation(newConv);
      await handleSendMessageToConversation(newConv.id, content, mode);
    } else {
      await handleSendMessageToConversation(currentConversation.id, content, mode);
    }
  };

  const handleSendMessageToConversation = async (
    conversationId: string,
    content: string,
    mode: 'text' | 'image' | 'video'
  ) => {
    const userMessage: LocalMessage = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      role: 'user',
      content: selectedImage ? `[Image attached]\n${content}` : content,
      created_at: new Date().toISOString(),
    };
    saveMessage(userMessage);

    if (mode === 'text') {
      await handleTextChat(conversationId, content);
    } else if (mode === 'image') {
      await handleImageGeneration(conversationId, content);
    } else if (mode === 'video') {
      await handleVideoGeneration(conversationId, content);
    }

    // Clear selected image after sending
    setSelectedImage(null);

    if (messages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      const updatedConvs = conversations.map((c) =>
        c.id === conversationId ? { ...c, title, updated_at: new Date().toISOString() } : c
      );
      saveConversations(updatedConvs);
    }
  };

  const handleTextChat = useCallback(async (conversationId: string, userContent: string) => {
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      const conversationHistory: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      // Add image if selected
      if (selectedImage) {
        conversationHistory.push({
          role: 'user',
          parts: [
            { text: userContent },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: selectedImage.split(',')[1],
              },
            },
          ],
        });
      } else {
        conversationHistory.push({
          role: 'user',
          parts: [{ text: userContent }],
        });
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/chat-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          contents: conversationHistory,
          conversationId,
          customInstructions: userSettings.customInstructions,
          responseStyle: userSettings.responseStyle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              const text = jsonData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                accumulatedText += text;
                setStreamingMessage(accumulatedText);
              }
            } catch (e) {
              // Silently ignore parse errors
            }
          }
        }
      }

      if (accumulatedText) {
        const modelMessage: LocalMessage = {
          id: crypto.randomUUID(),
          conversation_id: conversationId,
          role: 'model',
          content: accumulatedText,
          created_at: new Date().toISOString(),
        };
        saveMessage(modelMessage);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setIsStreaming(false);
      setStreamingMessage('');
    }
  }, [messages, selectedImage, userSettings, toast]);

  const handleImageGeneration = useCallback(async (conversationId: string, prompt: string) => {
    setIsStreaming(true);
    setStreamingMessage('🎨 Generating your image...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt,
          conversationId,
          aspectRatio: '1:1',
          n: 1,
        },
      });

      if (error) throw error;

      if (data.base_resp?.status_code !== 0) {
        throw new Error(data.base_resp?.status_msg || 'Image generation failed');
      }

      const imageUrls = data.data?.image_urls || [];
      if (imageUrls.length > 0) {
        const imageContent = `![Generated Image](${imageUrls[0]})`;
        const modelMessage: LocalMessage = {
          id: crypto.randomUUID(),
          conversation_id: conversationId,
          role: 'model',
          content: imageContent,
          created_at: new Date().toISOString(),
        };
        saveMessage(modelMessage);
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: 'destructive',
      });
    } finally {
      setIsStreaming(false);
      setStreamingMessage('');
    }
  }, [toast]);

  const handleVideoGeneration = useCallback(async (conversationId: string, prompt: string) => {
    setIsStreaming(true);
    setStreamingMessage('🎬 Creating your video... This may take a few minutes.');

    try {
      // Create video generation task
      const { data: createData, error: createError } = await supabase.functions.invoke('text-to-video', {
        body: {
          prompt,
          model_name: 'kling-v2-5-turbo',
          aspect_ratio: '16:9',
          duration: '5',
        },
      });

      if (createError) throw createError;

      if (createData.code !== 0) {
        throw new Error(createData.message || 'Video generation failed');
      }

      const taskId = createData.data?.task_id;
      if (!taskId) {
        throw new Error('No task ID returned');
      }

      // Poll for video completion
      let attempts = 0;
      const maxAttempts = 120; // 10 minutes with 5-second intervals
      
      const pollVideo = async (): Promise<string | null> => {
        if (attempts >= maxAttempts) {
          throw new Error('Video generation timed out');
        }

        attempts++;
        setStreamingMessage(`🎬 Generating video... (${Math.floor(attempts * 5 / 60)}m ${(attempts * 5) % 60}s)`);

        const { data: queryData, error: queryError } = await supabase.functions.invoke(
          `query-text-video?taskId=${taskId}`,
          { method: 'GET' }
        );

        if (queryError) throw queryError;

        const status = queryData.data?.task_status;

        if (status === 'succeed') {
          const videoUrl = queryData.data?.task_result?.videos?.[0]?.url;
          return videoUrl || null;
        } else if (status === 'failed') {
          throw new Error(queryData.data?.task_status_msg || 'Video generation failed');
        } else {
          // Still processing, wait and retry
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return pollVideo();
        }
      };

      const videoUrl = await pollVideo();

      if (videoUrl) {
        const videoContent = `[Video Generated]\n${videoUrl}`;
        const modelMessage: LocalMessage = {
          id: crypto.randomUUID(),
          conversation_id: conversationId,
          role: 'model',
          content: videoContent,
          video_url: videoUrl,
          created_at: new Date().toISOString(),
        };
        saveMessage(modelMessage);
        
        toast({
          title: 'Success!',
          description: 'Video generated successfully',
        });
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate video',
        variant: 'destructive',
      });
    } finally {
      setIsStreaming(false);
      setStreamingMessage('');
    }
  }, [toast]);

  const sidebarContent = useMemo(() => (
    <ChatSidebar
      conversations={filteredConversations}
      currentConversation={currentConversation}
      onSelectConversation={handleSelectConversation}
      onNewConversation={handleNewConversation}
      onDeleteConversation={handleDeleteConversation}
      onRenameConversation={handleRenameConversation}
      onClose={() => setSidebarVisible(false)}
      onSearch={handleConversationSearch}
      uiSizeClasses={{
        sidebarWidth: getUISizeClasses().sidebarWidth,
        sidebarPadding: getUISizeClasses().sidebarPadding,
        sidebarItemPadding: getUISizeClasses().sidebarItemPadding,
        sidebarItemGap: getUISizeClasses().sidebarItemGap,
        sidebarItemText: getUISizeClasses().sidebarItemText,
        sidebarButtonSize: getUISizeClasses().sidebarButtonSize,
        sidebarIconSize: getUISizeClasses().sidebarIconSize,
        sidebarSpacing: getUISizeClasses().sidebarSpacing,
        conversationItemHeight: getUISizeClasses().conversationItemHeight,
      }}
    />
  ), [filteredConversations, currentConversation, userSettings.uiSize, handleConversationSearch]);

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Backdrop for mobile only */}
      {sidebarVisible && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarVisible(false)}
        />
      )}

      {/* Sidebar - Full screen on mobile, side panel on tablet/desktop */}
      {sidebarVisible && (
        <div
          className={`
            fixed md:relative z-50 md:z-0
            h-full border-r border-border bg-card
            transition-all duration-300 ease-in-out
            left-0 top-0
            w-full md:${getUISizeClasses().sidebarWidth}
          `}
        >
          {sidebarContent}
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header - Dynamic sizing based on user settings */}
        <div className={`border-b border-border bg-card flex items-center justify-between shrink-0 ${getChatBoxHeaderSizeClasses().header} ${getChatBoxHeaderSizeClasses().headerPadding} ${getChatBoxHeaderSizeClasses().headerGap}`}>
          <div className={`flex items-center min-w-0 flex-1 ${getChatBoxHeaderSizeClasses().headerGap}`}>
            {/* Hamburger Menu */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className={`shrink-0 ${getChatBoxHeaderSizeClasses().button}`}
              title={sidebarVisible ? 'Hide Conversations' : 'Show Conversations'}
            >
              <Menu className={getChatBoxHeaderSizeClasses().icon} />
            </Button>

            <div className={`flex items-center min-w-0 ${getChatBoxHeaderSizeClasses().headerGap}`}>
              <div className={`bg-gradient-to-br from-primary to-secondary rounded-lg shrink-0 ${userSettings.chatBoxHeaderSize === 'small-x4' ? 'p-0.5' : userSettings.chatBoxHeaderSize === 'large' ? 'p-1.5' : 'p-1'}`}>
                <Brain className={getChatBoxHeaderSizeClasses().icon + ' text-white'} />
              </div>
              <div className="min-w-0">
                <h1 className={`font-bold truncate ${userSettings.chatBoxHeaderSize === 'small-x4' ? 'text-[8px]' : userSettings.chatBoxHeaderSize === 'large' ? 'text-sm' : 'text-xs'}`}>Aura_AI</h1>
                <p className="text-[10px] md:text-xs xl:text-[10px] text-muted-foreground truncate hidden sm:block">
                  {currentConversation?.title || 'New Conversation'}
                </p>
              </div>
            </div>
          </div>
          <div className={`flex items-center shrink-0 ${getChatBoxHeaderSizeClasses().headerGap}`}>
            {/* Quick Actions */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" title="Quick Prompts" className={`hidden sm:flex ${getChatBoxHeaderSizeClasses().button}`}>
                  <Zap className={getChatBoxHeaderSizeClasses().icon} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs">Quick Prompts</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {QUICK_PROMPTS.map((prompt) => (
                      <Button
                        key={prompt.label}
                        variant="outline"
                        size="sm"
                        className="justify-start gap-1.5 text-xs h-7"
                        onClick={() => {
                          const input = document.querySelector('textarea') as HTMLTextAreaElement;
                          if (input) {
                            input.value = prompt.prompt + ' ';
                            input.focus();
                          }
                        }}
                      >
                        <span className="text-xs">{prompt.icon}</span>
                        <span className="truncate text-xs">{prompt.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Search */}
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Search Messages" className={`hidden md:flex ${getChatBoxHeaderSizeClasses().button}`}>
                  <Search className={getChatBoxHeaderSizeClasses().icon} />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-base">Search Messages</DialogTitle>
                  <DialogDescription className="text-sm">
                    Find specific messages in this conversation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="text-sm"
                  />
                  <ScrollArea className="h-64">
                    {filteredMessages.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No messages found
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {filteredMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className="p-3 border border-border rounded-lg text-sm"
                          >
                            <p className="font-semibold text-xs text-muted-foreground mb-1">
                              {msg.role === 'user' ? 'You' : 'Aura_AI'}
                            </p>
                            <p className="line-clamp-3 text-xs">{msg.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </DialogContent>
            </Dialog>

            {/* Export */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowExportDialog(true)}
              title="Export Conversation"
              disabled={!currentConversation || messages.length === 0}
              className={`hidden md:flex ${getChatBoxHeaderSizeClasses().button}`}
            >
              <Download className={getChatBoxHeaderSizeClasses().icon} />
            </Button>

            {/* Statistics */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowConversationStats(true)}
              title="Conversation Statistics"
              disabled={!currentConversation || messages.length === 0}
              className={`hidden lg:flex ${getChatBoxHeaderSizeClasses().button}`}
            >
              <BarChart3 className={getChatBoxHeaderSizeClasses().icon} />
            </Button>

            {/* Clear Conversation */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowClearConfirm(true)}
              title="Clear Conversation"
              disabled={messages.length === 0}
              className={`hidden lg:flex ${getChatBoxHeaderSizeClasses().button}`}
            >
              <Trash className={getChatBoxHeaderSizeClasses().icon} />
            </Button>

            {/* Keyboard Shortcuts */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowKeyboardShortcuts(true)}
              title="Keyboard Shortcuts"
              className={`hidden xl:flex ${getChatBoxHeaderSizeClasses().button}`}
            >
              <Keyboard className={getChatBoxHeaderSizeClasses().icon} />
            </Button>

            {/* Voice Input */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleVoiceInput}
              title={isListening ? 'Stop Listening' : 'Voice Input'}
              className={`${getChatBoxHeaderSizeClasses().button} ${isListening ? 'text-red-500 animate-pulse' : ''}`}
            >
              {isListening ? <MicOff className={getChatBoxHeaderSizeClasses().icon} /> : <Mic className={getChatBoxHeaderSizeClasses().icon} />}
            </Button>

            {/* Image Upload */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Image"
              className={getChatBoxHeaderSizeClasses().button}
            >
              <ImageIcon className={getChatBoxHeaderSizeClasses().icon} />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {/* Settings */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Settings" className={getChatBoxHeaderSizeClasses().button}>
                  <Settings className={getChatBoxHeaderSizeClasses().icon} />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-sm">Personalization Settings</DialogTitle>
                  <DialogDescription className="text-xs">
                    Customize how Aura_AI responds
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="custom-instructions" className="text-xs">Custom Instructions</Label>
                    <Textarea
                      id="custom-instructions"
                      placeholder="Tell the AI how you'd like it to respond..."
                      value={userSettings.customInstructions}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, customInstructions: e.target.value })
                      }
                      rows={3}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="response-style" className="text-xs">Response Style</Label>
                    <select
                      id="response-style"
                      value={userSettings.responseStyle}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, responseStyle: e.target.value })
                      }
                      className="w-full p-2 border border-border rounded-md bg-background text-xs"
                    >
                      <option value="concise">Concise</option>
                      <option value="balanced">Balanced</option>
                      <option value="detailed">Detailed</option>
                      <option value="creative">Creative</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="text-size" className="text-xs">Text Size</Label>
                    <select
                      id="text-size"
                      value={userSettings.textSize}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, textSize: e.target.value as 'small-x4' | 'double-extra-small' | 'extra-small' | 'small' | 'medium' | 'large' })
                      }
                      className="w-full p-2 border border-border rounded-md bg-background text-xs"
                    >
                      <option value="small-x4">Small ×4</option>
                      <option value="double-extra-small">Double Extra Small</option>
                      <option value="extra-small">Extra Small</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chatbox-header-size" className="text-xs">Chat Box & Header Size</Label>
                    <select
                      id="chatbox-header-size"
                      value={userSettings.chatBoxHeaderSize}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, chatBoxHeaderSize: e.target.value as 'small-x4' | 'small' | 'medium' | 'large' })
                      }
                      className="w-full p-2 border border-border rounded-md bg-background text-xs"
                    >
                      <option value="small-x4">Small ×4</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="ui-size" className="text-xs">UI Size (Interface & Conversations)</Label>
                    <select
                      id="ui-size"
                      value={userSettings.uiSize}
                      onChange={(e) =>
                        setUserSettings({ ...userSettings, uiSize: e.target.value as 'small-x4' | 'double-extra-small' | 'small' | 'medium' | 'large' })
                      }
                      className="w-full p-2 border border-border rounded-md bg-background text-xs"
                    >
                      <option value="small-x4">Small ×4</option>
                      <option value="double-extra-small">Double Extra Small</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setSettingsOpen(false)} size="sm" className="text-xs h-7">
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        saveSettings(userSettings);
                        setSettingsOpen(false);
                      }}
                      size="sm"
                      className="text-xs h-7"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title="Toggle Theme"
              className={`hidden sm:flex ${getChatBoxHeaderSizeClasses().button}`}
            >
              {theme === 'dark' ? <Sun className={getChatBoxHeaderSizeClasses().icon} /> : <Moon className={getChatBoxHeaderSizeClasses().icon} />}
            </Button>

            {/* New Chat */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNewConversation} 
              title="New Chat" 
              className={getChatBoxHeaderSizeClasses().button}
            >
              <Plus className={getChatBoxHeaderSizeClasses().icon} />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className={`h-full ${getChatBoxHeaderSizeClasses().messagesPadding}`} ref={scrollRef}>
            <div className={`max-w-3xl mx-auto ${getChatBoxHeaderSizeClasses().messagesSpacing} ${getChatBoxHeaderSizeClasses().messagesPb}`}>
            {messages.length === 0 && !isStreaming && (
              <div className={`flex flex-col items-center justify-center h-full text-center ${userSettings.chatBoxHeaderSize === 'small-x4' ? 'py-2 px-1' : userSettings.chatBoxHeaderSize === 'large' ? 'py-10 px-5' : 'py-6 px-3'}`}>
                <div className={`bg-gradient-to-br from-primary to-secondary rounded-2xl ${userSettings.chatBoxHeaderSize === 'small-x4' ? 'p-1 mb-1' : userSettings.chatBoxHeaderSize === 'large' ? 'p-4 mb-4' : 'p-2.5 mb-2.5'}`}>
                  <Brain className={userSettings.chatBoxHeaderSize === 'small-x4' ? 'w-4 h-4' : userSettings.chatBoxHeaderSize === 'large' ? 'w-10 h-10' : 'w-8 h-8'} />
                </div>
                <h2 className={`font-bold mb-2 ${userSettings.chatBoxHeaderSize === 'small-x4' ? 'text-[10px]' : userSettings.chatBoxHeaderSize === 'large' ? 'text-lg' : 'text-base'}`}>Welcome to Aura_AI</h2>
                <p className={`text-muted-foreground max-w-md mb-3 ${userSettings.chatBoxHeaderSize === 'small-x4' ? 'text-[8px]' : userSettings.chatBoxHeaderSize === 'large' ? 'text-sm' : 'text-xs'}`}>
                  An advanced AI assistant with voice input, image analysis, and personalized responses.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg w-full">
                  <div className="p-2 border border-border rounded-lg">
                    <Mic className="w-4 h-4 mb-1 text-primary mx-auto" />
                    <p className="text-xs font-semibold">Voice Input</p>
                  </div>
                  <div className="p-2 border border-border rounded-lg">
                    <ImageIcon className="w-4 h-4 mb-1 text-primary mx-auto" />
                    <p className="text-xs font-semibold">Image Analysis</p>
                  </div>
                  <div className="p-2 border border-border rounded-lg">
                    <Zap className="w-4 h-4 mb-1 text-primary mx-auto" />
                    <p className="text-xs font-semibold">Quick Prompts</p>
                  </div>
                  <div className="p-2 border border-border rounded-lg">
                    <Search className="w-4 h-4 mb-1 text-primary mx-auto" />
                    <p className="text-xs font-semibold">Search</p>
                  </div>
                  <div className="p-2 border border-border rounded-lg">
                    <Download className="w-4 h-4 mb-1 text-primary mx-auto" />
                    <p className="text-xs font-semibold">Export</p>
                  </div>
                  <div className="p-2 border border-border rounded-lg">
                    <Settings className="w-4 h-4 mb-1 text-primary mx-auto" />
                    <p className="text-xs font-semibold">Personalize</p>
                  </div>
                </div>
              </div>
            )}
            {selectedImage && (
              <div className="flex items-center gap-2 p-2 bg-accent rounded-lg">
                <img src={selectedImage} alt="Selected" className="w-12 h-12 object-cover rounded" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Image attached</p>
                  <p className="text-xs text-muted-foreground">Ready to analyze</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="text-xs h-7"
                >
                  Remove
                </Button>
              </div>
            )}
            {messages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg} 
                textSizeClass={getTextSizeClass()} 
                uiSizeClasses={{
                  avatar: getChatBoxHeaderSizeClasses().avatar,
                  avatarIcon: getChatBoxHeaderSizeClasses().avatarIcon,
                  bubblePadding: getChatBoxHeaderSizeClasses().bubblePadding,
                  bubbleRounded: getChatBoxHeaderSizeClasses().bubbleRounded,
                  bubbleGap: getChatBoxHeaderSizeClasses().bubbleGap,
                }}
                onCopy={handleCopyMessage}
                onEdit={handleStartEdit}
                onDelete={handleDeleteMessage}
                onRegenerate={handleRegenerateMessage}
                onPin={handlePinMessage}
                onTextToSpeech={handleTextToSpeechOpen}
                onReply={handleReplyToMessage}
              />
            ))}
            {isStreaming && streamingMessage && (
              <MessageBubble
                message={{
                  id: 'streaming',
                  conversation_id: currentConversation?.id || '',
                  role: 'model',
                  content: streamingMessage,
                  created_at: new Date().toISOString(),
                }}
                isStreaming
                textSizeClass={getTextSizeClass()}
                uiSizeClasses={{
                  avatar: getChatBoxHeaderSizeClasses().avatar,
                  avatarIcon: getChatBoxHeaderSizeClasses().avatarIcon,
                  bubblePadding: getChatBoxHeaderSizeClasses().bubblePadding,
                  bubbleRounded: getChatBoxHeaderSizeClasses().bubbleRounded,
                  bubbleGap: getChatBoxHeaderSizeClasses().bubbleGap,
                }}
              />
            )}
            {isStreaming && !streamingMessage && (
              <div className="flex items-center gap-2 text-muted-foreground px-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs">Thinking...</span>
              </div>
            )}
            {messages.length > 0 && !isStreaming && messages[messages.length - 1].role === 'model' && (
              <div className="flex justify-start gap-2 px-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateResponse}
                  className="gap-2 text-xs h-7"
                >
                  <RotateCcw className="w-3 h-3" />
                  Regenerate
                </Button>
              </div>
            )}
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <div className={`border-t border-border bg-card shrink-0 ${getChatBoxHeaderSizeClasses().inputContainer}`}>
          <div className="max-w-3xl mx-auto">
            <ChatInput 
              onSend={handleSendMessage} 
              disabled={isStreaming} 
              textSizeClass={getTextSizeClass()}
              uiSizeClasses={{
                inputButton: getChatBoxHeaderSizeClasses().inputButton,
                inputGap: getChatBoxHeaderSizeClasses().inputGap,
                inputSpacing: getChatBoxHeaderSizeClasses().inputSpacing,
                textarea: getChatBoxHeaderSizeClasses().textarea,
                sendButton: getChatBoxHeaderSizeClasses().sendButton,
                sendIcon: getChatBoxHeaderSizeClasses().sendIcon,
                icon: getChatBoxHeaderSizeClasses().icon,
              }}
            />
          </div>
        </div>
      </div>

      {/* Tablet Tip Dialog - First Time Only */}
      <Dialog open={showTabletTip} onOpenChange={(open) => {
        if (!open && showOkButton) {
          handleDismissTabletTip();
        }
      }}>
        <DialogContent className="w-[95vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg flex items-center gap-2">
              <span className="text-3xl">💡</span>
              Welcome to Aura_AI!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm mb-1">Tablet Users</h3>
                  <p className="text-sm text-muted-foreground">
                    For the best experience on tablets, go to <strong>Settings</strong> and change <strong>Chat Box & Header Size</strong> to <strong>Small ×4</strong>. This will optimize the interface for your screen size.
                  </p>
                </div>
              </div>
            </div>

            {showOkButton ? (
              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={handleDismissTabletTip} className="text-sm px-6">
                  Got it!
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Button will appear in a moment...
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={showKeyboardShortcuts}
        onOpenChange={setShowKeyboardShortcuts}
      />

      {/* Conversation Statistics Dialog */}
      <ConversationStatsDialog
        open={showConversationStats}
        onOpenChange={setShowConversationStats}
        conversation={currentConversation}
        messages={messages}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        conversation={currentConversation}
        messages={messages}
      />

      {/* Clear Conversation Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages in this conversation. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearConversation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear All Messages
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Text to Speech Dialog */}
      <TextToSpeechDialog
        open={showTextToSpeech}
        onOpenChange={setShowTextToSpeech}
        initialText={textToSpeechContent}
      />
    </div>
  );
}

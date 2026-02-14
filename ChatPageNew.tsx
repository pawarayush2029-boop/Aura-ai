import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/db/supabase';
import type { ChatMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Menu, Send, Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Streamdown } from 'streamdown';

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
}

const STORAGE_KEY = 'aura_ai_conversations';
const MESSAGES_KEY = 'aura_ai_messages';

export default function ChatPageNew() {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<LocalConversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<LocalConversation | null>(null);
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Load conversations
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const convs = JSON.parse(stored) as LocalConversation[];
      setConversations(convs);
      if (convs.length > 0) {
        setCurrentConversation(convs[0]);
      }
    }
  }, []);

  // Load messages for current conversation
  useEffect(() => {
    if (!currentConversation) {
      setMessages([]);
      return;
    }

    const stored = localStorage.getItem(MESSAGES_KEY);
    if (stored) {
      const allMessages = JSON.parse(stored) as LocalMessage[];
      const convMessages = allMessages.filter((m) => m.conversation_id === currentConversation.id);
      setMessages(convMessages);
    }
  }, [currentConversation]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage]);

  const saveConversations = (convs: LocalConversation[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
    setConversations(convs);
  };

  const saveMessage = (message: LocalMessage) => {
    const stored = localStorage.getItem(MESSAGES_KEY);
    const allMessages = stored ? JSON.parse(stored) : [];
    allMessages.push(message);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages));
    setMessages((prev) => [...prev, message]);
  };

  const handleNewConversation = () => {
    const newConv: LocalConversation = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updatedConvs = [newConv, ...conversations];
    saveConversations(updatedConvs);
    setCurrentConversation(newConv);
    setMessages([]);
    setSheetOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userContent = input.trim();
    setInput('');

    // Create conversation if needed
    if (!currentConversation) {
      const newConv: LocalConversation = {
        id: crypto.randomUUID(),
        title: userContent.slice(0, 30) + '...',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const updatedConvs = [newConv, ...conversations];
      saveConversations(updatedConvs);
      setCurrentConversation(newConv);
    }

    const convId = currentConversation?.id || crypto.randomUUID();

    // Save user message
    const userMessage: LocalMessage = {
      id: crypto.randomUUID(),
      conversation_id: convId,
      role: 'user',
      content: userContent,
      created_at: new Date().toISOString(),
    };
    saveMessage(userMessage);

    // Stream AI response
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      const conversationHistory: ChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      conversationHistory.push({
        role: 'user',
        parts: [{ text: userContent }],
      });

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
          conversationId: convId,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

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
              // Ignore parse errors
            }
          }
        }
      }

      if (accumulatedText) {
        const modelMessage: LocalMessage = {
          id: crypto.randomUUID(),
          conversation_id: convId,
          role: 'model',
          content: accumulatedText,
          created_at: new Date().toISOString(),
        };
        saveMessage(modelMessage);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get response',
        variant: 'destructive',
      });
    } finally {
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Compact Top Bar */}
      <div className="h-11 border-b flex items-center justify-between px-2 gap-2 shrink-0 bg-card">
        <div className="flex items-center gap-2">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <div className="p-3 border-b">
                  <Button onClick={handleNewConversation} size="sm" className="w-full h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    New Chat
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => {
                          setCurrentConversation(conv);
                          setSheetOpen(false);
                        }}
                        className={`p-2 rounded cursor-pointer text-xs hover:bg-accent ${
                          currentConversation?.id === conv.id ? 'bg-accent' : ''
                        }`}
                      >
                        <p className="font-medium truncate">{conv.title}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(conv.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
          <h1 className="text-sm font-bold">Aura AI</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Settings className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-2xl mx-auto p-2 space-y-2">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <h2 className="text-base font-bold mb-1">Welcome to Aura AI</h2>
                <p className="text-xs text-muted-foreground">Start a conversation</p>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-1.5 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-[11px]">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-[11px]">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isStreaming && streamingMessage && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-3 py-1.5 bg-muted">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-[11px]">
                    <Streamdown>{streamingMessage}</Streamdown>
                  </div>
                </div>
              </div>
            )}
            {isStreaming && !streamingMessage && (
              <div className="flex justify-start">
                <div className="flex gap-1 px-3 py-1.5">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Compact Input */}
      <div className="border-t p-2 shrink-0 bg-card">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="min-h-[36px] max-h-[100px] text-[11px] resize-none"
            rows={1}
            disabled={isStreaming}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="h-9 w-9 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

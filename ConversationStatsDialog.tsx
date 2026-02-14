import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Image, Clock, Calendar, TrendingUp, Zap } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  image_url?: string;
  timestamp?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationStatsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation | null;
  messages: Message[];
}

export default function ConversationStatsDialog({
  open,
  onOpenChange,
  conversation,
  messages,
}: ConversationStatsDialogProps) {
  if (!conversation) return null;

  const userMessages = messages.filter((m) => m.role === 'user');
  const aiMessages = messages.filter((m) => m.role === 'assistant' || m.role === 'model');
  const imagesGenerated = messages.filter((m) => m.image_url).length;
  
  const totalWords = messages.reduce((acc, msg) => {
    return acc + msg.content.split(/\s+/).length;
  }, 0);

  const avgWordsPerMessage = messages.length > 0 
    ? Math.round(totalWords / messages.length) 
    : 0;

  const totalChars = messages.reduce((acc, msg) => acc + msg.content.length, 0);

  const createdDate = new Date(conversation.created_at);
  const updatedDate = new Date(conversation.updated_at);
  const duration = updatedDate.getTime() - createdDate.getTime();
  const durationMinutes = Math.round(duration / 60000);

  const stats = [
    {
      icon: MessageSquare,
      label: 'Total Messages',
      value: messages.length,
      color: 'text-blue-500',
    },
    {
      icon: MessageSquare,
      label: 'Your Messages',
      value: userMessages.length,
      color: 'text-green-500',
    },
    {
      icon: MessageSquare,
      label: 'AI Responses',
      value: aiMessages.length,
      color: 'text-purple-500',
    },
    {
      icon: Image,
      label: 'Images Generated',
      value: imagesGenerated,
      color: 'text-pink-500',
    },
    {
      icon: TrendingUp,
      label: 'Total Words',
      value: totalWords.toLocaleString(),
      color: 'text-orange-500',
    },
    {
      icon: Zap,
      label: 'Avg Words/Message',
      value: avgWordsPerMessage,
      color: 'text-yellow-500',
    },
    {
      icon: TrendingUp,
      label: 'Total Characters',
      value: totalChars.toLocaleString(),
      color: 'text-cyan-500',
    },
    {
      icon: Clock,
      label: 'Duration',
      value: durationMinutes > 60 
        ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m` 
        : `${durationMinutes}m`,
      color: 'text-indigo-500',
    },
    {
      icon: Calendar,
      label: 'Created',
      value: createdDate.toLocaleDateString(),
      color: 'text-gray-500',
    },
    {
      icon: Calendar,
      label: 'Last Updated',
      value: updatedDate.toLocaleDateString(),
      color: 'text-gray-500',
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Conversation Statistics</DialogTitle>
          <DialogDescription>
            Detailed analytics for "{conversation.title}"
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[500px] pr-4">
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold truncate">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

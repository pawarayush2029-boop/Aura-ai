import { cn } from '@/lib/utils';
import { User, Bot, Pin } from 'lucide-react';
import { Streamdown } from 'streamdown';
import VideoPlayer from './VideoPlayer';
import MessageActions from './MessageActions';

interface LocalMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
  video_url?: string;
  pinned?: boolean;
}

interface MessageBubbleProps {
  message: LocalMessage;
  isStreaming?: boolean;
  textSizeClass?: string;
  uiSizeClasses?: {
    avatar: string;
    avatarIcon: string;
    bubblePadding: string;
    bubbleRounded: string;
    bubbleGap: string;
  };
  onCopy?: (content: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onTextToSpeech?: (content: string) => void;
  onReply?: (messageId: string) => void;
}

export default function MessageBubble({ 
  message, 
  isStreaming = false, 
  textSizeClass = 'text-[11px]',
  uiSizeClasses = {
    avatar: 'w-6 h-6',
    avatarIcon: 'w-3.5 h-3.5',
    bubblePadding: 'px-2.5 py-1.5',
    bubbleRounded: 'rounded-lg',
    bubbleGap: 'gap-1.5',
  },
  onCopy,
  onEdit,
  onDelete,
  onRegenerate,
  onPin,
  onTextToSpeech,
  onReply,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(`flex ${uiSizeClasses.bubbleGap} group relative`, isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className={cn(`shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center`, uiSizeClasses.avatar)}>
          <Bot className={cn(uiSizeClasses.avatarIcon, 'text-white')} />
        </div>
      )}
      <div className="flex flex-col gap-1 max-w-[80%]">
        {/* Pinned Indicator */}
        {message.pinned && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Pin className="w-3 h-3" />
            <span>Pinned</span>
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <div
            className={cn(
              `flex-1 ${uiSizeClasses.bubbleRounded} ${uiSizeClasses.bubblePadding}`,
              isUser
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border'
            )}
          >
            {message.video_url ? (
              <div className="space-y-2">
                <VideoPlayer url={message.video_url} className="w-full max-w-md" />
                {message.content && !message.content.startsWith('[Video Generated]') && (
                  <p className={cn('leading-relaxed whitespace-pre-wrap break-words', textSizeClass)}>
                    {message.content}
                  </p>
                )}
              </div>
            ) : isUser ? (
              <p className={cn('leading-relaxed whitespace-pre-wrap break-words', textSizeClass)}>{message.content}</p>
            ) : (
              <div className={cn('prose prose-sm dark:prose-invert max-w-none leading-relaxed', textSizeClass)}>
                <Streamdown>{message.content}</Streamdown>
                {isStreaming && (
                  <span className="inline-block w-1.5 h-3 ml-1 bg-current animate-pulse" />
                )}
              </div>
            )}
          </div>
          
          {/* Message Actions */}
          <MessageActions
            messageId={message.id}
            content={message.content}
            isUser={isUser}
            isPinned={message.pinned}
            onCopy={onCopy}
            onEdit={onEdit}
            onDelete={onDelete}
            onRegenerate={onRegenerate}
            onPin={onPin}
            onTextToSpeech={onTextToSpeech}
            onReply={onReply}
          />
        </div>
      </div>
      {isUser && (
        <div className={cn(`shrink-0 rounded-full bg-muted flex items-center justify-center`, uiSizeClasses.avatar)}>
          <User className={cn(uiSizeClasses.avatarIcon, 'text-muted-foreground')} />
        </div>
      )}
    </div>
  );
}

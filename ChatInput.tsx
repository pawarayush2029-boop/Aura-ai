import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageSquare, Image, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (content: string, mode: 'text' | 'image' | 'video') => void;
  disabled?: boolean;
  textSizeClass?: string;
  uiSizeClasses?: {
    inputButton: string;
    inputGap: string;
    inputSpacing: string;
    textarea: string;
    sendButton: string;
    sendIcon: string;
    icon: string;
  };
}

export default function ChatInput({ 
  onSend, 
  disabled = false,
  textSizeClass = 'text-[11px]',
  uiSizeClasses = {
    inputButton: 'h-7',
    inputGap: 'gap-1.5',
    inputSpacing: 'space-y-1.5',
    textarea: 'min-h-[36px] max-h-[100px] py-2',
    sendButton: 'h-[36px] w-[36px]',
    sendIcon: 'w-3.5 h-3.5',
    icon: 'w-3.5 h-3.5',
  }
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'text' | 'image' | 'video'>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    onSend(input.trim(), mode);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={uiSizeClasses.inputSpacing}>
      <div className={`flex ${uiSizeClasses.inputGap}`}>
        <Button
          type="button"
          variant={mode === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('text')}
          disabled={disabled}
          className={cn('flex-1', textSizeClass, uiSizeClasses.inputButton)}
        >
          <MessageSquare className={cn(uiSizeClasses.icon, 'mr-1')} />
          <span>Chat</span>
        </Button>
        <Button
          type="button"
          variant={mode === 'image' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('image')}
          disabled={disabled}
          className={cn('flex-1', textSizeClass, uiSizeClasses.inputButton)}
        >
          <Image className={cn(uiSizeClasses.icon, 'mr-1')} />
          <span>Image</span>
        </Button>
        <Button
          type="button"
          variant={mode === 'video' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setMode('video')}
          disabled={disabled}
          className={cn('flex-1', textSizeClass, uiSizeClasses.inputButton)}
        >
          <Video className={cn(uiSizeClasses.icon, 'mr-1')} />
          <span>Video</span>
        </Button>
      </div>

      <div className={`flex ${uiSizeClasses.inputGap}`}>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === 'text'
              ? 'Type your message...'
              : mode === 'image'
              ? 'Describe the image...'
              : 'Describe the video...'
          }
          disabled={disabled}
          className={cn('resize-none', textSizeClass, uiSizeClasses.textarea)}
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || disabled}
          className={cn('shrink-0', uiSizeClasses.sendButton)}
        >
          <Send className={uiSizeClasses.sendIcon} />
        </Button>
      </div>
    </form>
  );
}

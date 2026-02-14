import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Copy,
  Edit,
  Trash2,
  RotateCcw,
  Pin,
  Volume2,
  Reply,
  MoreVertical,
  Check,
} from 'lucide-react';

interface MessageActionsProps {
  messageId: string;
  content: string;
  isUser: boolean;
  isPinned?: boolean;
  onCopy?: (content: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  onPin?: (messageId: string) => void;
  onTextToSpeech?: (content: string) => void;
  onReply?: (messageId: string) => void;
}

export default function MessageActions({
  messageId,
  content,
  isUser,
  isPinned = false,
  onCopy,
  onEdit,
  onDelete,
  onRegenerate,
  onPin,
  onTextToSpeech,
  onReply,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy?.(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Copy */}
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </>
          )}
        </DropdownMenuItem>

        {/* Reply */}
        {onReply && (
          <DropdownMenuItem onClick={() => onReply(messageId)}>
            <Reply className="w-4 h-4 mr-2" />
            Reply
          </DropdownMenuItem>
        )}

        {/* Pin/Unpin */}
        {onPin && (
          <DropdownMenuItem onClick={() => onPin(messageId)}>
            <Pin className="w-4 h-4 mr-2" />
            {isPinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
        )}

        {/* Text to Speech */}
        {onTextToSpeech && (
          <DropdownMenuItem onClick={() => onTextToSpeech(content)}>
            <Volume2 className="w-4 h-4 mr-2" />
            Text to Speech
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {/* Edit (user messages only) */}
        {isUser && onEdit && (
          <DropdownMenuItem onClick={() => onEdit(messageId)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}

        {/* Regenerate (AI messages only) */}
        {!isUser && onRegenerate && (
          <DropdownMenuItem onClick={() => onRegenerate(messageId)}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Regenerate
          </DropdownMenuItem>
        )}

        {/* Delete */}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(messageId)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, RefreshCw, Edit2, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  image_url?: string;
  timestamp?: string;
}

interface MessageItemProps {
  message: Message;
  onCopy: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  textSizeClass: string;
  avatarClass: string;
  avatarIconClass: string;
  bubblePaddingClass: string;
  bubbleRoundedClass: string;
  bubbleGapClass: string;
  showTimestamp?: boolean;
}

export default function MessageItem({
  message,
  onCopy,
  onRegenerate,
  onEdit,
  onDelete,
  textSizeClass,
  avatarClass,
  avatarIconClass,
  bubblePaddingClass,
  bubbleRoundedClass,
  bubbleGapClass,
  showTimestamp = true,
}: MessageItemProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    if (onEdit && editContent.trim() !== message.content) {
      onEdit(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const CodeBlock = ({ language, value }: { language: string; value: string }) => {
    const [codeCopied, setCodeCopied] = useState(false);

    const handleCodeCopy = () => {
      navigator.clipboard.writeText(value);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    };

    return (
      <div className="relative group">
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={handleCodeCopy}
        >
          {codeCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
        <SyntaxHighlighter
          language={language || 'text'}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex gap-3 group',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {(message.role === 'assistant' || message.role === 'model') && (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0',
            avatarClass
          )}
        >
          <span className={cn('text-white font-bold', avatarIconClass)}>AI</span>
        </div>
      )}

      <div className="flex flex-col max-w-[80%] min-w-0">
        <div
          className={cn(
            'relative',
            bubbleRoundedClass,
            bubblePaddingClass,
            message.role === 'user'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          )}
        >
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={cn(
                  'w-full min-h-[100px] p-2 border border-border rounded-md bg-background resize-none',
                  textSizeClass
                )}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              {message.image_url && (
                <img
                  src={message.image_url}
                  alt="Generated"
                  className="rounded-lg mb-2 max-w-full h-auto"
                />
              )}
              <div className={cn('prose prose-sm dark:prose-invert max-w-none', textSizeClass)}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    code(props) {
                      const { node, className, children, ...rest } = props;
                      const match = /language-(\w+)/.exec(className || '');
                      const value = String(children).replace(/\n$/, '');
                      const inline = !match;
                      
                      return !inline && match ? (
                        <CodeBlock language={match[1]} value={value} />
                      ) : (
                        <code className={cn('bg-muted px-1 py-0.5 rounded', className)} {...rest}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </>
          )}
        </div>

        {/* Message Actions */}
        {!isEditing && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {showTimestamp && message.timestamp && (
              <span className="text-[10px] text-muted-foreground mr-auto">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={handleCopy}
              title="Copy message"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>

            {(message.role === 'assistant' || message.role === 'model') && onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onRegenerate(message.id)}
                title="Regenerate response"
              >
                <RefreshCw className="w-3 h-3" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  title="More actions"
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {message.role === 'user' && onEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-3 h-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(message.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {message.role === 'user' && (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center shrink-0',
            avatarClass
          )}
        >
          <span className={cn('text-white font-bold', avatarIconClass)}>U</span>
        </div>
      )}
    </div>
  );
}

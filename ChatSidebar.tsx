import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Trash2, Youtube, X, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import ConversationSearch from '@/components/chat/ConversationSearch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocalConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ChatSidebarProps {
  conversations: LocalConversation[];
  currentConversation: LocalConversation | null;
  onSelectConversation: (conversation: LocalConversation) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onClose: () => void;
  onSearch?: (query: string) => void;
  uiSizeClasses?: {
    sidebarWidth: string;
    sidebarPadding: string;
    sidebarItemPadding: string;
    sidebarItemGap: string;
    sidebarItemText: string;
    sidebarButtonSize: string;
    sidebarIconSize: string;
    sidebarSpacing: string;
    conversationItemHeight: string;
  };
}

export default function ChatSidebar({
  conversations,
  currentConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onClose,
  onSearch,
  uiSizeClasses = {
    sidebarWidth: 'w-56',
    sidebarPadding: 'p-2',
    sidebarItemPadding: 'px-2.5 py-1.5',
    sidebarItemGap: 'gap-2',
    sidebarItemText: 'text-[10px]',
    sidebarButtonSize: 'h-7',
    sidebarIconSize: 'w-3.5 h-3.5',
    sidebarSpacing: 'space-y-1.5',
    conversationItemHeight: 'min-h-[32px]',
  },
}: ChatSidebarProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingConvId, setRenamingConvId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const handleSubscribe = () => {
    window.open('https://www.youtube.com/@officialthe_truth', '_blank');
  };

  const openRenameDialog = (conv: LocalConversation) => {
    setRenamingConvId(conv.id);
    setNewTitle(conv.title);
    setRenameDialogOpen(true);
  };

  const handleRename = () => {
    if (renamingConvId && newTitle.trim()) {
      onRenameConversation(renamingConvId, newTitle.trim());
      setRenameDialogOpen(false);
      setRenamingConvId(null);
      setNewTitle('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-card w-full">
      {/* Header */}
      <div className={cn('border-b border-border', uiSizeClasses.sidebarPadding)}>
        <div className={cn('flex items-center justify-between', uiSizeClasses.sidebarItemGap, 'mb-2')}>
          <h2 className={cn('font-bold', uiSizeClasses.sidebarItemText)}>Conversations</h2>
          <div className="flex items-center gap-1">
            {onSearch && (
              <ConversationSearch onSearch={onSearch} />
            )}
            {/* Close button - visible on all screen sizes */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(uiSizeClasses.sidebarButtonSize, uiSizeClasses.sidebarButtonSize.replace('h-', 'w-'))}
              onClick={onClose}
              title="Close Sidebar"
            >
              <X className={uiSizeClasses.sidebarIconSize} />
            </Button>
          </div>
        </div>
        <Button 
          onClick={onNewConversation} 
          className={cn('w-full', uiSizeClasses.sidebarItemText, uiSizeClasses.sidebarButtonSize)} 
          size="sm"
        >
          <Plus className={cn(uiSizeClasses.sidebarIconSize, 'mr-1')} />
          New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto">
        <div className={cn(uiSizeClasses.sidebarPadding, uiSizeClasses.sidebarSpacing)}>
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="mb-3 flex justify-center">
                <div className={cn('bg-primary/10 rounded-full', uiSizeClasses.sidebarPadding)}>
                  <MessageSquare className={uiSizeClasses.sidebarIconSize} />
                </div>
              </div>
              <p className={cn('font-medium', uiSizeClasses.sidebarItemText)}>No conversations yet</p>
              <p className={cn('text-muted-foreground/70 mt-1', uiSizeClasses.sidebarItemText)}>Start a new chat to begin</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group relative flex items-center rounded-lg cursor-pointer transition-all',
                  'hover:bg-accent',
                  currentConversation?.id === conv.id && 'bg-accent',
                  uiSizeClasses.sidebarItemPadding,
                  uiSizeClasses.sidebarItemGap,
                  uiSizeClasses.conversationItemHeight
                )}
              >
                <div
                  className="flex-1 min-w-0"
                  onClick={() => onSelectConversation(conv)}
                >
                  <p className={cn('font-semibold truncate mb-0.5', uiSizeClasses.sidebarItemText)}>{conv.title}</p>
                  <p className={cn('text-muted-foreground/70', uiSizeClasses.sidebarItemText)}>
                    {new Date(conv.updated_at).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className={cn('flex opacity-0 group-hover:opacity-100 transition-all', uiSizeClasses.sidebarItemGap)}>
                  {/* Rename Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('shrink-0', uiSizeClasses.sidebarButtonSize, uiSizeClasses.sidebarButtonSize.replace('h-', 'w-'))}
                    onClick={(e) => {
                      e.stopPropagation();
                      openRenameDialog(conv);
                    }}
                    title="Rename"
                  >
                    <Edit2 className={uiSizeClasses.sidebarIconSize} />
                  </Button>
                  {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn('shrink-0', uiSizeClasses.sidebarButtonSize, uiSizeClasses.sidebarButtonSize.replace('h-', 'w-'))}
                        onClick={(e) => e.stopPropagation()}
                        title="Delete"
                      >
                        <Trash2 className={uiSizeClasses.sidebarIconSize} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[90vw] max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm">Delete Conversation</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                          Are you sure? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="text-xs h-7">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteConversation(conv.id)} className="text-xs h-7 bg-destructive hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Creator Section */}
      <div className={cn('border-t border-border', uiSizeClasses.sidebarPadding)}>
        <div className={cn('text-center', uiSizeClasses.sidebarSpacing)}>
          <div className={cn('flex items-center justify-center', uiSizeClasses.sidebarItemGap)}>
            <div className="relative">
              <img 
                src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9ll1b0refu2o/conv-9ll1d7otsq2o/20260213/file-9lloy2ria70g.png"
                alt="me_aura"
                className={cn('rounded-full object-cover ring-2 ring-primary/20', 
                  uiSizeClasses.sidebarButtonSize, 
                  uiSizeClasses.sidebarButtonSize.replace('h-', 'w-'))}
              />
              <div className={cn('absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full border-2 border-card',
                uiSizeClasses.sidebarIconSize === 'w-2.5 h-2.5' ? 'w-2 h-2' : 
                uiSizeClasses.sidebarIconSize === 'w-3 h-3' ? 'w-2.5 h-2.5' : 
                'w-3 h-3')}></div>
            </div>
            <div className="text-left">
              <p className={cn('font-bold', uiSizeClasses.sidebarItemText)}>me_aura</p>
              <p className={cn('text-muted-foreground', uiSizeClasses.sidebarItemText)}>Creator</p>
            </div>
          </div>
          
          <Button
            onClick={handleSubscribe}
            className={cn('w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white', 
              uiSizeClasses.sidebarItemText, 
              uiSizeClasses.sidebarButtonSize)}
            size="sm"
          >
            <Youtube className={cn(uiSizeClasses.sidebarIconSize, 'mr-1')} />
            Subscribe on YouTube
          </Button>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="w-[90vw] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Rename Conversation</DialogTitle>
            <DialogDescription className="text-xs">
              Enter a new title for this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <Label htmlFor="conversation-title" className="text-xs">
              Conversation Title
            </Label>
            <Input
              id="conversation-title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter new title..."
              className="mt-2 text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              className="text-xs h-7"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              className="text-xs h-7"
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

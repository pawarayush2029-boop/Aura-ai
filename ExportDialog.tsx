import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, FileCode, FileJson, Globe } from 'lucide-react';
import {
  exportConversationAsText,
  exportConversationAsMarkdown,
  exportConversationAsJSON,
  exportConversationAsHTML,
} from '@/lib/exportUtils';

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

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversation: Conversation | null;
  messages: Message[];
}

export default function ExportDialog({
  open,
  onOpenChange,
  conversation,
  messages,
}: ExportDialogProps) {
  if (!conversation) return null;

  const exportOptions = [
    {
      icon: FileText,
      title: 'Plain Text',
      description: 'Export as .txt file',
      action: () => exportConversationAsText(conversation, messages),
      color: 'text-blue-500',
    },
    {
      icon: FileCode,
      title: 'Markdown',
      description: 'Export as .md file with formatting',
      action: () => exportConversationAsMarkdown(conversation, messages),
      color: 'text-purple-500',
    },
    {
      icon: FileJson,
      title: 'JSON',
      description: 'Export as .json file for data processing',
      action: () => exportConversationAsJSON(conversation, messages),
      color: 'text-green-500',
    },
    {
      icon: Globe,
      title: 'HTML',
      description: 'Export as .html file for web viewing',
      action: () => exportConversationAsHTML(conversation, messages),
      color: 'text-orange-500',
    },
  ];

  const handleExport = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Conversation</DialogTitle>
          <DialogDescription>
            Choose a format to export "{conversation.title}"
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {exportOptions.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-4 justify-start hover:bg-accent"
              onClick={() => handleExport(option.action)}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`p-2 rounded-lg bg-muted ${option.color}`}>
                  <option.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm">{option.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: ['Ctrl', 'K'], description: 'Open command palette' },
        { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts' },
        { keys: ['Ctrl', 'N'], description: 'New conversation' },
        { keys: ['Ctrl', 'S'], description: 'Toggle sidebar' },
        { keys: ['Ctrl', ','], description: 'Open settings' },
        { keys: ['Esc'], description: 'Close dialog/modal' },
      ],
    },
    {
      category: 'Chat',
      items: [
        { keys: ['Enter'], description: 'Send message' },
        { keys: ['Shift', 'Enter'], description: 'New line' },
        { keys: ['Ctrl', 'Enter'], description: 'Send message (alternative)' },
        { keys: ['Ctrl', 'L'], description: 'Clear conversation' },
        { keys: ['Ctrl', 'E'], description: 'Export conversation' },
        { keys: ['Ctrl', 'F'], description: 'Search in conversation' },
      ],
    },
    {
      category: 'Messages',
      items: [
        { keys: ['Ctrl', 'C'], description: 'Copy selected message' },
        { keys: ['Ctrl', 'R'], description: 'Regenerate last response' },
        { keys: ['Ctrl', 'D'], description: 'Delete selected message' },
        { keys: ['Ctrl', 'E'], description: 'Edit selected message' },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { keys: ['↑'], description: 'Previous conversation' },
        { keys: ['↓'], description: 'Next conversation' },
        { keys: ['Ctrl', '↑'], description: 'Scroll to top' },
        { keys: ['Ctrl', '↓'], description: 'Scroll to bottom' },
      ],
    },
    {
      category: 'Modes',
      items: [
        { keys: ['Ctrl', 'M'], description: 'Toggle chat/image mode' },
        { keys: ['Ctrl', 'V'], description: 'Toggle voice input' },
        { keys: ['Ctrl', 'I'], description: 'Upload image' },
        { keys: ['Ctrl', 'P'], description: 'Show quick prompts' },
      ],
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and interact with Aura_AI more efficiently
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="font-semibold text-sm mb-3 text-primary">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

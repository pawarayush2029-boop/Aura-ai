import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { usePreferences } from '@/contexts/PreferencesContext';
import {
  Settings,
  Palette,
  Brain,
  Bell,
  Shield,
  Zap,
  Type,
  Layout,
  Volume2,
} from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { preferences, updatePreferences, resetPreferences } = usePreferences();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Settings & Preferences
          </DialogTitle>
          <DialogDescription>
            Customize your Aura AI experience with 50+ features and options
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="appearance" className="text-xs">
              <Palette className="w-4 h-4 mr-1" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="ai" className="text-xs">
              <Brain className="w-4 h-4 mr-1" />
              AI
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs">
              <Zap className="w-4 h-4 mr-1" />
              Features
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">
              <Bell className="w-4 h-4 mr-1" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance & Layout
              </h3>

              {/* Theme Selection */}
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={preferences.theme}
                  onValueChange={(value: any) => updatePreferences({ theme: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                    <SelectItem value="ocean">Ocean Blue</SelectItem>
                    <SelectItem value="forest">Forest Green</SelectItem>
                    <SelectItem value="sunset">Sunset Orange</SelectItem>
                    <SelectItem value="midnight">Midnight Purple</SelectItem>
                    <SelectItem value="rose">Rose Pink</SelectItem>
                    <SelectItem value="lavender">Lavender</SelectItem>
                    <SelectItem value="mint">Mint</SelectItem>
                    <SelectItem value="amber">Amber</SelectItem>
                    <SelectItem value="slate">Slate Gray</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select
                  value={preferences.fontSize}
                  onValueChange={(value: any) => updatePreferences({ fontSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xs">Extra Small</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="base">Medium (Default)</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Density */}
              <div className="space-y-2">
                <Label>Message Density</Label>
                <Select
                  value={preferences.messageDensity}
                  onValueChange={(value: any) => updatePreferences({ messageDensity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable (Default)</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Layout Mode */}
              <div className="space-y-2">
                <Label>Layout Mode</Label>
                <Select
                  value={preferences.layoutMode}
                  onValueChange={(value: any) => updatePreferences({ layoutMode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="focus">Focus Mode</SelectItem>
                    <SelectItem value="zen">Zen Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Bubble Style */}
              <div className="space-y-2">
                <Label>Message Bubble Style</Label>
                <Select
                  value={preferences.messageBubbleStyle}
                  onValueChange={(value: any) => updatePreferences({ messageBubbleStyle: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sidebar Position */}
              <div className="space-y-2">
                <Label>Sidebar Position</Label>
                <Select
                  value={preferences.sidebarPosition}
                  onValueChange={(value: any) => updatePreferences({ sidebarPosition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Display Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Show Avatars</Label>
                  <Switch
                    checked={preferences.showAvatars}
                    onCheckedChange={(checked) => updatePreferences({ showAvatars: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Timestamps</Label>
                  <Switch
                    checked={preferences.showTimestamps}
                    onCheckedChange={(checked) => updatePreferences({ showTimestamps: checked })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* AI Settings */}
          <TabsContent value="ai" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Model & Behavior
              </h3>

              {/* AI Model */}
              <div className="space-y-2">
                <Label>AI Model</Label>
                <Select
                  value={preferences.aiModel}
                  onValueChange={(value: any) => updatePreferences({ aiModel: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash (Fast)</SelectItem>
                    <SelectItem value="gemini-pro">Gemini Pro (Balanced)</SelectItem>
                    <SelectItem value="gemini-ultra">Gemini Ultra (Advanced)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* AI Personality */}
              <div className="space-y-2">
                <Label>AI Personality</Label>
                <Select
                  value={preferences.aiPersonality}
                  onValueChange={(value: any) => updatePreferences({ aiPersonality: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <Label>Creativity (Temperature): {preferences.temperature.toFixed(1)}</Label>
                <Slider
                  value={[preferences.temperature]}
                  onValueChange={([value]) => updatePreferences({ temperature: value })}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Lower = More focused, Higher = More creative
                </p>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <Label>Max Response Length: {preferences.maxTokens} tokens</Label>
                <Slider
                  value={[preferences.maxTokens]}
                  onValueChange={([value]) => updatePreferences({ maxTokens: value })}
                  min={256}
                  max={4096}
                  step={256}
                  className="w-full"
                />
              </div>

              {/* Context Window */}
              <div className="space-y-2">
                <Label>Context Window: {preferences.contextWindow} tokens</Label>
                <Slider
                  value={[preferences.contextWindow]}
                  onValueChange={([value]) => updatePreferences({ contextWindow: value })}
                  min={2048}
                  max={32768}
                  step={2048}
                  className="w-full"
                />
              </div>

              {/* Memory */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Memory</Label>
                  <p className="text-xs text-muted-foreground">Remember context across conversations</p>
                </div>
                <Switch
                  checked={preferences.enableMemory}
                  onCheckedChange={(checked) => updatePreferences({ enableMemory: checked })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Features Settings */}
          <TabsContent value="features" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Features & Functionality
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Voice Input</Label>
                    <p className="text-xs text-muted-foreground">Speech-to-text for messages</p>
                  </div>
                  <Switch
                    checked={preferences.enableVoiceInput}
                    onCheckedChange={(checked) => updatePreferences({ enableVoiceInput: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Save</Label>
                    <p className="text-xs text-muted-foreground">Automatically save drafts</p>
                  </div>
                  <Switch
                    checked={preferences.enableAutoSave}
                    onCheckedChange={(checked) => updatePreferences({ enableAutoSave: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Spell Check</Label>
                    <p className="text-xs text-muted-foreground">Check spelling as you type</p>
                  </div>
                  <Switch
                    checked={preferences.enableSpellCheck}
                    onCheckedChange={(checked) => updatePreferences({ enableSpellCheck: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Markdown Preview</Label>
                    <p className="text-xs text-muted-foreground">Live markdown rendering</p>
                  </div>
                  <Switch
                    checked={preferences.enableMarkdownPreview}
                    onCheckedChange={(checked) => updatePreferences({ enableMarkdownPreview: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Code Highlighting</Label>
                    <p className="text-xs text-muted-foreground">Syntax highlighting for code</p>
                  </div>
                  <Switch
                    checked={preferences.enableCodeHighlight}
                    onCheckedChange={(checked) => updatePreferences({ enableCodeHighlight: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Link Preview</Label>
                    <p className="text-xs text-muted-foreground">Show previews for links</p>
                  </div>
                  <Switch
                    checked={preferences.enableLinkPreview}
                    onCheckedChange={(checked) => updatePreferences({ enableLinkPreview: checked })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications & Sounds
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Sound Effects</Label>
                  <Switch
                    checked={preferences.enableSoundEffects}
                    onCheckedChange={(checked) => updatePreferences({ enableSoundEffects: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Notifications</Label>
                  <Switch
                    checked={preferences.enableNotifications}
                    onCheckedChange={(checked) => updatePreferences({ enableNotifications: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Notification Sound</Label>
                  <Select
                    value={preferences.notificationSound}
                    onValueChange={(value: any) => updatePreferences({ notificationSound: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="chime">Chime</SelectItem>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Privacy</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Save History</Label>
                      <p className="text-xs text-muted-foreground">Store conversations locally</p>
                    </div>
                    <Switch
                      checked={preferences.saveHistory}
                      onCheckedChange={(checked) => updatePreferences({ saveHistory: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Analytics</Label>
                      <p className="text-xs text-muted-foreground">Track usage statistics</p>
                    </div>
                    <Switch
                      checked={preferences.enableAnalytics}
                      onCheckedChange={(checked) => updatePreferences({ enableAnalytics: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Share Usage Data</Label>
                      <p className="text-xs text-muted-foreground">Help improve Aura AI</p>
                    </div>
                    <Switch
                      checked={preferences.shareUsageData}
                      onCheckedChange={(checked) => updatePreferences({ shareUsageData: checked })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={resetPreferences}>
            Reset to Defaults
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

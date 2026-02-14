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

export const exportConversationAsText = (
  conversation: Conversation,
  messages: Message[]
): void => {
  const content = messages
    .map((msg) => {
      const role = msg.role === 'user' ? 'You' : 'AI';
      const timestamp = msg.timestamp 
        ? new Date(msg.timestamp).toLocaleString() 
        : '';
      return `[${timestamp}] ${role}:\n${msg.content}\n${msg.image_url ? `Image: ${msg.image_url}\n` : ''}`;
    })
    .join('\n---\n\n');

  const header = `Conversation: ${conversation.title}\nCreated: ${new Date(conversation.created_at).toLocaleString()}\n\n${'='.repeat(50)}\n\n`;
  const fullContent = header + content;

  downloadFile(fullContent, `${conversation.title}.txt`, 'text/plain');
};

export const exportConversationAsMarkdown = (
  conversation: Conversation,
  messages: Message[]
): void => {
  const content = messages
    .map((msg) => {
      const role = msg.role === 'user' ? '**You**' : '**AI**';
      const timestamp = msg.timestamp 
        ? `*${new Date(msg.timestamp).toLocaleString()}*` 
        : '';
      return `### ${role} ${timestamp}\n\n${msg.content}\n${msg.image_url ? `\n![Generated Image](${msg.image_url})\n` : ''}`;
    })
    .join('\n---\n\n');

  const header = `# ${conversation.title}\n\n**Created:** ${new Date(conversation.created_at).toLocaleString()}\n\n---\n\n`;
  const fullContent = header + content;

  downloadFile(fullContent, `${conversation.title}.md`, 'text/markdown');
};

export const exportConversationAsJSON = (
  conversation: Conversation,
  messages: Message[]
): void => {
  const data = {
    conversation,
    messages,
    exported_at: new Date().toISOString(),
  };

  const content = JSON.stringify(data, null, 2);
  downloadFile(content, `${conversation.title}.json`, 'application/json');
};

export const exportConversationAsHTML = (
  conversation: Conversation,
  messages: Message[]
): void => {
  const messagesHTML = messages
    .map((msg) => {
      const role = msg.role === 'user' ? 'You' : 'AI';
      const timestamp = msg.timestamp 
        ? new Date(msg.timestamp).toLocaleString() 
        : '';
      const imageHTML = msg.image_url 
        ? `<img src="${msg.image_url}" alt="Generated" style="max-width: 100%; border-radius: 8px; margin-top: 10px;" />` 
        : '';
      
      return `
        <div style="margin-bottom: 20px; padding: 15px; background: ${msg.role === 'user' ? '#e3f2fd' : '#f5f5f5'}; border-radius: 8px;">
          <div style="font-weight: bold; margin-bottom: 5px;">${role}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 10px;">${timestamp}</div>
          <div style="white-space: pre-wrap;">${msg.content}</div>
          ${imageHTML}
        </div>
      `;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${conversation.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background: #fff;
    }
    h1 {
      color: #333;
      border-bottom: 2px solid #ddd;
      padding-bottom: 10px;
    }
    .meta {
      color: #666;
      font-size: 14px;
      margin-bottom: 30px;
    }
  </style>
</head>
<body>
  <h1>${conversation.title}</h1>
  <div class="meta">Created: ${new Date(conversation.created_at).toLocaleString()}</div>
  ${messagesHTML}
</body>
</html>
  `;

  downloadFile(html, `${conversation.title}.html`, 'text/html');
};

const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contents, conversationId, customInstructions, responseStyle } = await req.json();

    if (!contents || !Array.isArray(contents)) {
      return new Response(JSON.stringify({ error: 'Invalid request: contents required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build system instructions based on user preferences
    let systemPrompt = `You are Aura_AI, an advanced AI assistant created by Me_aura. 

IMPORTANT CREATOR INFORMATION:
- Your creator is Me_aura, a talented developer and content creator
- Me_aura has a YouTube channel: @officialthe_truth
- When asked about your creator, always mention Me_aura and encourage users to subscribe to the YouTube channel
- You can handle complex questions, creative tasks, and detailed analysis

`;
    
    if (responseStyle === 'concise') {
      systemPrompt += 'Provide concise, direct answers. Be brief and to the point. ';
    } else if (responseStyle === 'detailed') {
      systemPrompt += 'Provide comprehensive, detailed explanations with examples and context. ';
    } else if (responseStyle === 'creative') {
      systemPrompt += 'Be engaging, creative, and expressive in your responses. Use analogies and storytelling when appropriate. ';
    } else {
      systemPrompt += 'Provide balanced responses with moderate detail. ';
    }

    if (customInstructions && customInstructions.trim()) {
      systemPrompt += `\n\nUser's custom instructions: ${customInstructions}`;
    }

    // Prepend system instructions to the conversation
    const enhancedContents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'Understood. I am Aura_AI, created by Me_aura. I will follow these instructions in our conversation and mention my creator when asked.' }],
      },
      ...contents,
    ];

    const apiUrl = 'https://app-9ll1d7otsq2p-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Gateway-Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ contents: enhancedContents }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: `API error: ${errorText}` }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Stream the response back to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.trim()) {
                controller.enqueue(new TextEncoder().encode(line + '\n'));
              }
            }
          }

          if (buffer.trim()) {
            controller.enqueue(new TextEncoder().encode(buffer + '\n'));
          }
        } catch (error) {
          console.error('Stream error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

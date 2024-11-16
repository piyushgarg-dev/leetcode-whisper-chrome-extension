import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, SendHorizontal } from 'lucide-react';
import OpenAI from 'openai';

import './style.css';
import { Input } from '@/components/ui/input';
import { SYSTEM_PROMPT } from '@/constants/prompt';
import { extractCode } from './util';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Markdown from 'react-markdown';

function createOpenAISDK(apiKey: string) {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

interface ChatBoxProps {
  context: {
    programmingLanguage: string;
    problemStatement: string;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
  type: 'text' | 'markdown';
}

function ChatBox({ context }: ChatBoxProps) {
  const [value, setValue] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  const handleGenerateAIResponse = async () => {
    const openAIAPIKey = (await chrome.storage.local.get('apiKey')) as {
      apiKey?: string;
    };

    if (!openAIAPIKey.apiKey) return alert('OpenAI API Key is required');

    const openai = createOpenAISDK(openAIAPIKey.apiKey);

    const userMessage = value;
    const userCurrentCodeContainer = document.querySelector('.view-line');

    const extractedCode = extractCode(
      userCurrentCodeContainer?.innerHTML ?? ''
    );

    const systemPromptModified = SYSTEM_PROMPT.replace(
      '{{problem_statement}}',
      context.problemStatement
    )
      .replace('{{programming_language}}', context.programmingLanguage)
      .replace('{{user_code}}', extractedCode);

    const apiResponse = await openai.chat.completions.create({
      model: 'chatgpt-4o-latest',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPromptModified },
        ...chatHistory.map(
          (chat) =>
            ({
              role: chat.role,
              content: chat.message,
            } as ChatCompletionMessageParam)
        ),
        { role: 'user', content: userMessage },
      ],
    });

    if (apiResponse.choices[0].message.content) {
      const result = JSON.parse(apiResponse.choices[0].message.content);
      if ('output' in result) {
        setChatHistory((prev) => [
          ...prev,
          { message: result.output, role: 'user', type: 'markdown' },
        ]);
        chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const onSendMessage = () => {
    if(value.trim() === ""){
      alert("Enter your prompt...")
      return;
    }
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', message: value, type: 'text' },
    ]);
    setValue('');
    chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
    handleGenerateAIResponse();
  };
  return (
    <div className="w-[400px] h-[550px] mb-2 rounded-xl relative text-wrap overflow-auto">
      <div className="h-[510px] overflow-auto" ref={chatBoxRef}>
        {chatHistory.map((message, index) => (
          <div
            key={index.toString()}
            className="flex gap-4 mt-3 w-[400px] text-wrap"
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="w-[100%]">
              <p>{message.role.toLocaleUpperCase()}</p>
              {message.type === 'markdown' ? (
                <Markdown>{message.message}</Markdown>
              ) : (
                <p>{message.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 w-full flex items-center gap-2 mb-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSendMessage();
          }}
          className="rounded-lg bg-black focus:border-2 focus:border-white focus:shadow-md focus:shadow-white"
          placeholder="Type your message here"
        />
        <SendHorizontal onClick={onSendMessage} className="cursor-pointer hover:scale-90 hover:text-red-600" />
      </div>
    </div>
  );
}

const ContentPage: React.FC = () => {
  const [chatboxExpanded, setChatboxExpanded] = React.useState(false);
  const [apiKeyAvailable, setApiKeyAvailable] = React.useState(false);

  const metaDescriptionEl = document.querySelector('meta[name=description]');

  const problemStatement = metaDescriptionEl?.getAttribute('content') as string;

  React.useEffect(() => {
    (async function loadOpenAPIKey() {
      if (!chrome) return;
      const apiKeyFromStorage = (await chrome.storage.local.get('apiKey')) as {
        apiKey?: string;
      };
      // console.log('API Key:', apiKeyFromStorage.apiKey);
      if (apiKeyFromStorage.apiKey){
        const openAIKeyRegex = /^sk(-proj)?-[a-zA-Z0-9_\-]+$/;
        const valid = openAIKeyRegex.test(apiKeyFromStorage?.apiKey);
        if(valid){
          setApiKeyAvailable(true);
        }
      };
    })();
  }, []);

  return (
    <div className="__chat-container dark">
      {chatboxExpanded && (
        <ChatBox context={{ problemStatement, programmingLanguage: 'C++' }} />
      )}
        <div className="flex justify-end">
        {apiKeyAvailable ? (
          <Button onClick={() => setChatboxExpanded(!chatboxExpanded)}>
            <Bot />
            Ask AI
          </Button>
        ) : (
          <p className="text-red-500">API Key not found. Please configure it.</p>
        )}
      </div>
    </div>
  );
};

export default ContentPage;

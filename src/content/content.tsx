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
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', message: value, type: 'text' },
    ]);
    setValue('');
    chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
    handleGenerateAIResponse();
  };
  return (
    <div className="w-[400px] h-[550px] bg-black rounded-xl p-2 text-white overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto mb-2 space-y-4" ref={chatBoxRef}>
        {chatHistory.map((message, index) => (
          <div
            key={index.toString()}
            className="!bg-stone-800 flex gap-4 mt-3 w-full text-wrap rounded-lg p-2"
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="w-full">
              <p className="text-gray-300 font-semibold">
                {message.role.toLocaleUpperCase()}
              </p>
              {message.type === 'markdown' ? (
                <Markdown>{message.message}</Markdown>
              ) : (
                <p className="text-gray-400">{message.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>
  
      <div className="flex items-center gap-2 p-2 bg-gray-900 rounded-lg">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSendMessage();
          }}
          className="rounded-lg bg-black text-gray-200"
          placeholder="Type your message here"
        />
        <SendHorizontal onClick={onSendMessage} className="cursor-pointer" />
      </div>
    </div>
  );

}

const ContentPage: React.FC = () => {
  const [chatboxExpanded, setChatboxExpanded] = React.useState(false);

  const metaDescriptionEl = document.querySelector('meta[name=description]');

  const problemStatement = metaDescriptionEl?.getAttribute('content') as string;

  return (
    <div className="__chat-container dark">
      {chatboxExpanded && (
        <ChatBox context={{ problemStatement, programmingLanguage: 'C++' }} />
      )}
      <div className="flex justify-end">
        <Button onClick={() => setChatboxExpanded(!chatboxExpanded)}>
          <Bot />
          Ask AI
        </Button>
      </div>
    </div>
  );
};

export default ContentPage;

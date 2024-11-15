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
    <div className='border-2 border-gray-200 p-2 backdrop-blur-md w-[500px] h-[540px] mb-2 rounded-xl relative'>
      <div className='bg-yellow-300 h-[490px] pb-16' ref={chatBoxRef}>
        {chatHistory.map((message, index) => (
          <div
            key={index.toString()}
            className='flex gap-4 mt-3 w-[400px] text-wrap'
          >
            <Avatar>
              <AvatarImage src='https://github.com/shadcn.png' />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className='w-[100%]'>
              <p className='text-yellow-100'>
                {message.role.toLocaleUpperCase()}
              </p>
              {message.type === 'markdown' ? (
                <Markdown>{message.message}</Markdown>
              ) : (
                <p>{message.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className='absolute bottom-0 flex w-full items-center gap-2 p-2 bg-gray-800'>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSendMessage();
          }}
          className='flex-1 rounded-lg bg-black text-white px-4 py-2'
          placeholder='Type your message here'
        />
        <button
          onClick={onSendMessage}
          className='flex items-center justify-center text-white bg-gray-700 hover:bg-gray-600 rounded-lg p-2'
        >
          <SendHorizontal className='h-5 w-5' />
        </button>
      </div>
    </div>
  );
}

const ContentPage: React.FC = () => {
  const [chatboxExpanded, setChatboxExpanded] = React.useState(false);

  const metaDescriptionEl = document.querySelector('meta[name=description]');

  const problemStatement = metaDescriptionEl?.getAttribute('content') as string;

  return (
    <div className='__chat-container dark'>
      {chatboxExpanded && (
        <ChatBox context={{ problemStatement, programmingLanguage: 'C++' }} />
      )}
      <div className='flex justify-end'>
        <Button onClick={() => setChatboxExpanded(!chatboxExpanded)}>
          <Bot />
          Ask AI
        </Button>
      </div>
    </div>
  );
};

export default ContentPage;

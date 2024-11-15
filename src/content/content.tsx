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
import { GoogleGenerativeAI } from "@google/generative-ai";


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
    const { apiKey, selectedModel } = await chrome.storage.local.get([
      'apiKey',
      'selectedModel',
    ]);
  
    if (!apiKey || !selectedModel) {
      return alert('API Key or Model name is required');
    }
  
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
  
    if (selectedModel === 'chatgpt') {
      const openai = createOpenAISDK(apiKey);
  
      const apiResponse = await openai.chat.completions.create({
        model: 'chatgpt-4o-latest',
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
  
      const result = apiResponse.choices[0].message?.content;
      if (result) {
        setChatHistory((prev) => [
          ...prev,
          { message: result, role: 'assistant', type: 'markdown' },
        ]);
      }
    } else if (selectedModel === 'gemini') {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
      const prompt = `${systemPromptModified}\nUser message: ${userMessage}`;
      const apiResponse = await model.generateContent( prompt );
  
      const result = apiResponse?.response?.text() ;
      console.log({result})
      if (result) {
        const cleanResult = result.replace(/```json\n|```/g, '').trim();
        const parsedResult = JSON.parse(cleanResult); 
        const output = parsedResult?.output || "No output found";
        console.log({output})
        setChatHistory((prev) => [
          ...prev,
          { message: output, role: 'assistant', type: 'markdown' },
        ]);
      }
    }
  
    chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
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
              <p className='font-bold'>{message.role.toLocaleUpperCase()}</p>
              {message.type === 'markdown' ? (
                <div className='p-1'>
                <Markdown>{message.message}</Markdown>
                </div>
              ) : (
                
                <p className='p-1'>{message.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 w-full flex items-center gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSendMessage();
          }}
          className="rounded-lg bg-black"
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
   // With the help of this we can easily detect the programming language
   const programmingLanguage = document?.querySelector('#editor')?.firstChild?.textContent?.split("Auto").join("")  as string;
   
  return (
    <div className="__chat-container dark">
      {chatboxExpanded && (
        <ChatBox context={{ problemStatement, programmingLanguage: programmingLanguage }} />
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

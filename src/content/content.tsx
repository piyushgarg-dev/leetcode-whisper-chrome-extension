import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, ClipboardCopy, Send } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

import './style.css';
import { Input } from '@/components/ui/input';
import { SYSTEM_PROMPT } from '@/constants/prompt';
import { extractCode } from './util';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

function createGoogleGeminiSDK(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
}

interface ChatBoxProps {
  visible: boolean;
  context: {
    problemStatement: string;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  message: string;
  type: 'text' | 'markdown';
  assistantResponse?: {
    feedback?: string;
    hints?: string[];
    snippet?: string;
    programmingLanguage?: string;
  };
}

async function fetchWithRetry(apiFunction: Function, retries: number = 5, delay: number = 1000) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const response = await apiFunction();
      return response;
    } catch (error) {
      if (attempt === retries - 1) {
        throw error;
      }
      attempt++;
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
}

function ChatBox({ context, visible }: ChatBoxProps) {
  const [value, setValue] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState<'openai' | 'google-gemini' | null>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initialize() {
      const keys = (await chrome.storage.local.get(['apiKey', 'giminiKey'])) as {
        apiKey?: string;
        giminiKey?: string;
      };

      if (keys.giminiKey) {
        setSelectedModel('google-gemini');
      } else if (keys.apiKey) {
        setSelectedModel('openai');
      } else {
        alert('No API keys available. Please add at least one key to use the AI features.');
      }
    }

    initialize();
  }, []);

  const handleGenerateAIResponse = async () => {
    const { giminiKey } = (await chrome.storage.local.get(['giminiKey'])) as {
      giminiKey?: string;
    };

    let responseContent = '';
    const userMessage = value;
    const extractedCode = extractCode(document.querySelectorAll('.view-line'));

    const systemPromptModified = SYSTEM_PROMPT.replace(
      '{{problem_statement}}',
      context.problemStatement
    )
      .replace('{{programming_language}}', 'UNKNOWN')
      .replace('{{user_code}}', extractedCode);

    if (selectedModel === 'google-gemini' && giminiKey) {
      const gemini = createGoogleGeminiSDK(giminiKey);

      try {
        const apiResponse = await fetchWithRetry(() => gemini.generateContent([systemPromptModified]));

        // Parse the response content
        const responseText = apiResponse.response?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText) {
          // The responseText contains a JSON string, so we need to parse it
          try {
            const parsedResponse = JSON.parse(responseText.trim().replace(/```json\n|\n```/g, ''));

            const { feedback, hints, snippet, programmingLanguage } = parsedResponse.output;

            // Update chat history with the parsed content
            setChatHistory((prev) => [
              ...prev,
              {
                message: feedback, // Display the feedback message
                role: 'assistant',
                type: 'text',
                assistantResponse: {
                  feedback,
                  hints,
                  snippet,
                  programmingLanguage,
                },
              },
            ]);
          } catch (error) {
            console.error('Error parsing response text:', error);
            alert('Failed to parse the response from Gemini API.');
          }
        } else {
          console.error('Response does not contain valid text:', apiResponse);
          alert('Response does not contain valid text');
        }
      } catch (error) {
        console.error('Error fetching from Gemini API:', error);
        alert('Failed to fetch response from Gemini API. Please try again later.');
      }
    } else {
      alert('No valid API key or model selected.');
      return;
    }

    chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSendMessage = () => {
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', message: value, type: 'text' },
    ]);
    setValue('');
    handleGenerateAIResponse();
  };

  if (!visible) return null;

  return (
    <Card className="mb-5">
      <CardContent>
        <div className="space-y-4 h-[400px] w-[500px] overflow-auto mt-5">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                message.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'bg-muted'
              )}
            >
              {message.role === 'user' && <>{message.message}</>}
              {message.role === 'assistant' && (
                <>
                  <p>{message.assistantResponse?.feedback}</p>
                  <Accordion type="multiple">
                    {message.assistantResponse?.hints && (
                      <AccordionItem value="item-1">
                        <AccordionTrigger>Hints 👀</AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-4">
                            {message.assistantResponse?.hints?.map((hint) => (
                              <li key={hint}>{hint}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    {message.assistantResponse?.snippet && (
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Code 🧑🏻‍💻</AccordionTrigger>
                        <AccordionContent>
                          <pre className="bg-black p-3 rounded-md shadow-lg">
                            <code>{message.assistantResponse?.snippet}</code>
                          </pre>
                          <Button
                            className="p-0 mt-2"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                message.assistantResponse?.snippet || ''
                              )
                            }
                          >
                            <ClipboardCopy />
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                </>
              )}
            </div>
          ))}
          <div ref={chatBoxRef} />
        </div>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.length === 0) return;
            onSendMessage();
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button type="submit" size="icon" disabled={value.length === 0}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

const ContentPage: React.FC = () => {
  const [chatboxExpanded, setChatboxExpanded] = useState(false);

  const metaDescriptionEl = document.querySelector('meta[name=description]');
  const problemStatement = metaDescriptionEl?.getAttribute('content') as string;

  return (
    <div className="__chat-container dark z-50">
      <ChatBox visible={chatboxExpanded} context={{ problemStatement }} />
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

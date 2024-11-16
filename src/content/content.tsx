import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Send, Eye, EyeOff, Paintbrush, CodeXml, Check, X } from 'lucide-react';
import OpenAI from 'openai';
import { Highlight, themes } from 'prism-react-renderer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

function createOpenAISDK(apiKey: string) {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
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

type ThemeKey = keyof typeof AVAILABLE_THEMES;

const AVAILABLE_THEMES = {
  nightOwl: "Night Owl",
  dracula: "Dracula",
  vsDark: "VS Dark",
  github: "GitHub",
  palenight: "Palenight",
  synthwave84: "Synthwave",
} as const;

function ChatBox({ context, visible }: ChatBoxProps) {
  const [value, setValue] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [selectedTheme, setSelectedTheme] = React.useState<keyof typeof AVAILABLE_THEMES>('nightOwl');
  const [hintVisibility, setHintVisibility] = React.useState<boolean[]>([]);
  const [copyStatus, setCopyStatus] = React.useState<Record<number, boolean>>({});

  const chatBoxRef = useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      const hintsCount = lastMessage.assistantResponse?.hints?.length || 0;
      setHintVisibility(new Array(hintsCount).fill(false));
    }
  }, [chatHistory]);

  const toggleHintVisibility = (index: number) => {
    setHintVisibility(prev => {
      const newVisibility = [...prev];
      newVisibility[index] = !newVisibility[index];
      return newVisibility;
    });
  };

  const handleGenerateAIResponse = async () => {
    const openAIAPIKey = (await chrome.storage.local.get('apiKey')) as {
      apiKey?: string
    }

    const openai = createOpenAISDK(openAIAPIKey.apiKey)

    const userMessage = value;
    const userCurrentCodeContainer = document.querySelectorAll('.view-line');
    const changeLanguageButton = document.querySelector(
      'button.rounded.items-center.whitespace-nowrap.inline-flex.bg-transparent.dark\\:bg-dark-transparent.text-text-secondary.group'
    );
    let programmingLanguage = 'UNKNOWN';

    if (changeLanguageButton) {
      if (changeLanguageButton.textContent)
        programmingLanguage = changeLanguageButton.textContent;
    }

    const extractedCode = extractCode(userCurrentCodeContainer);

    const systemPromptModified = SYSTEM_PROMPT.replace(
      '{{problem_statement}}',
      context.problemStatement
    )
      .replace('{{programming_language}}', programmingLanguage)
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
            }) as ChatCompletionMessageParam
        ),
        {
          role: 'user',
          content: `User Prompt: ${userMessage}\n\nCode: ${extractedCode}`,
        },
      ],
    })

    if (apiResponse.choices[0].message.content) {
      const result = JSON.parse(apiResponse.choices[0].message.content);

      if ('output' in result) {
        setChatHistory((prev) => [
          ...prev,
          {
            message: 'NA',
            role: 'assistant',
            type: 'markdown',
            assistantResponse: {
              feedback: result.output.feedback,
              hints: result.output.hints,
              snippet: result.output.snippet,
              programmingLanguage: result.output.programmingLanguage,
            },
          },
        ]);
        chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }

  const onSendMessage = () => {
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', message: value, type: 'text' },
    ]);
    chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
    setValue('');
    handleGenerateAIResponse();
  };

  const handleCopy = async (code: string, messageIndex: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus(prev => ({ ...prev, [messageIndex]: true }));
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setCopyStatus(prev => ({ ...prev, [messageIndex]: false }));
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!visible) return <></>;

  return (
    <Card className="mb-5">
      <CardContent>
        <div className="space-y-4 h-[400px] w-[500px] overflow-auto mt-5">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex w-max max-w-[100%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
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
                            {message.assistantResponse?.hints?.map((hint, index) => (
                              <li key={index} className="relative">
                                <div className="bg-[#1E1E1E] rounded-md p-4 relative overflow-hidden">
                                  <div
                                    className={cn(
                                      "transition-all duration-200",
                                      !hintVisibility[index] && "blur-md select-none"
                                    )}
                                  >
                                    {hint}
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 h-8 w-8 p-0"
                                    onClick={() => toggleHintVisibility(index)}
                                  >
                                    {hintVisibility[index] ? (
                                      <EyeOff className="h-4 w-4 text-[#858585]" />
                                    ) : (
                                      <Eye className="h-4 w-4 text-[#858585]" />
                                    )}
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    {message.assistantResponse?.snippet && (
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Code 🧑🏻‍💻</AccordionTrigger>
                        <AccordionContent>
                          <div className="mt-4">
                            <div className="code-header rounded-t-lg bg-gradient-to-r from-slate-800 to-slate-800 p-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-slate-700/50 hover:bg-slate-700 transition-colors px-3 py-1.5 text-xs font-medium text-slate-200"
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <CodeXml className="h-4 w-4" /> 
                                      {message.assistantResponse?.programmingLanguage || 'javascript'}
                                    </div>
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-3">
                                  <Select
                                    value={selectedTheme}
                                    onValueChange={(value) => setSelectedTheme(value as keyof typeof AVAILABLE_THEMES)}
                                  >
                                    <SelectTrigger 
                                      className="w-[140px] h-8 bg-slate-700/50 border-slate-600 hover:bg-slate-700 transition-colors text-slate-200"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Paintbrush className="h-3.5 w-3.5 text-indigo-400" />
                                        <SelectValue placeholder="Select theme" />
                                      </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                      {Object.entries(AVAILABLE_THEMES).map(([key, label]) => (
                                        <SelectItem 
                                          key={key} 
                                          value={key}
                                          className="text-slate-200 hover:bg-slate-700 focus:bg-slate-700"
                                        >
                                          {label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className={cn(
                                        "h-8 w-8 rounded-lg bg-slate-700/50 transition-all duration-200",
                                        copyStatus[index] 
                                          ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-400" 
                                          : "hover:bg-slate-700 hover:text-indigo-400 hover:scale-105"
                                      )}
                                      onClick={() => handleCopy(message.assistantResponse?.snippet || '', index)}
                                      title={copyStatus[index] ? "Copied!" : "Copy code"}
                                    >
                                      {copyStatus[index] ? (
                                        <div className="flex items-center gap-1">
                                          <Check className="h-3.5 w-3.5" />
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1">
                                          <svg 
                                            className="h-3.5 w-3.5" 
                                            viewBox="0 0 24 24" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            strokeWidth="2" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round"
                                          >
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                          </svg>
                                        </div>
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="relative">
                              <Highlight
                                theme={themes[selectedTheme]}
                                code={message.assistantResponse?.snippet || ''}
                                language={message.assistantResponse?.programmingLanguage?.toLowerCase() || 'javascript'}
                              >
                                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                  <pre className="bg-[#011627] rounded-b-lg overflow-x-auto">
                                    {tokens.map((line, i) => (
                                      <div key={i} {...getLineProps({ line })}>
                                        {line.map((token, key) => (
                                          <span key={key} {...getTokenProps({ token })} />
                                        ))}
                                      </div>
                                    ))}
                                  </pre>
                                )}
                              </Highlight>
                            </div>
                          </div>
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
          onSubmit={(event) => {
            event.preventDefault();
            if (value.length === 0) return;
            onSendMessage();
            setValue('');
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={value}
            onChange={(event) => setValue(event.target.value)}
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
  const [chatboxExpanded, setChatboxExpanded] = React.useState(false)

  const metaDescriptionEl = document.querySelector('meta[name=description]')

  const problemStatement = metaDescriptionEl?.getAttribute('content') as string

  return (
    <div className="__chat-container dark z-50">
      <ChatBox visible={chatboxExpanded} context={{ problemStatement }} />
      <div className="flex justify-end">
        <Button
          onClick={() => setChatboxExpanded(!chatboxExpanded)}
          className={cn(
            "flex items-center transition-all duration-300",
            chatboxExpanded ? "bg-red-500 text-white hover:bg-red-600" : "bg-slate-100 text-black hover:bg-slate-200"
          )}
        >
          {chatboxExpanded ? (
            <>
              <X className="h-4 w-4 mr-2" />
              Close Chat
            </>
          ) : (
            <>
              <Bot className="h-4 w-4 mr-2" />
              Ask AI
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default ContentPage

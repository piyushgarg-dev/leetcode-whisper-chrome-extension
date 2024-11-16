import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, ClipboardCopy, Send } from 'lucide-react';
import OpenAI from 'openai';

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

function ChatBox({ context, visible }: ChatBoxProps) {
  const [value, setValue] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);

  const chatBoxRef = React.useRef<HTMLDivElement>(null)

  const handleGenerateAIResponse = async () => {
    const openAIAPIKey = (await chrome.storage.local.get('apiKey')) as {
      apiKey?: string
    }

    if (!openAIAPIKey.apiKey) return alert('OpenAI API Key is required')

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

  if (!visible) return <></>;

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
                            {message.assistantResponse?.hints?.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    {message.assistantResponse?.snippet && (
                      <AccordionItem value="item-2">
                        <AccordionTrigger>Code 🧑🏻‍💻</AccordionTrigger>

                        <AccordionContent>
                          <pre className="bg-black p-3 rounded-md shadow-lg ">
                            <code>{message.assistantResponse?.snippet}</code>
                          </pre>
                          <Button
                            className="p-0 mt-2"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                `${message.assistantResponse?.snippet}`
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
  const chatboxRef = React.useRef<HTMLDivElement>(null)

  // Flag to prevent multiple outside clicks on "Close AI" button
  const ignoreOutsideClick = React.useRef(true)

  const metaDescriptionEl = document.querySelector('meta[name=description]')
  const problemStatement = metaDescriptionEl?.getAttribute('content') as string


  // Close the chatbox if clicked outside
  const handlePointerDown = React.useCallback((event: PointerEvent) => {
    // Only proceed if click is outside the chatbox and chatbox is expanded
    if (!ignoreOutsideClick.current || !chatboxExpanded) return;

    const isOutsideChatbox = chatboxRef.current && !chatboxRef.current.contains(event.target as Node);

    // Check if click is outside ChatBox but not on the "Close AI" button
    const isClickOnCloseButton = (event.target as Element).closest('.__chat-container button');

    if (isOutsideChatbox && !isClickOnCloseButton) {
      setChatboxExpanded(false);
      ignoreOutsideClick.current = false; // Reset flag after processed
    } else {
      ignoreOutsideClick.current = true; // Reset flag for next click
    }
  }, [chatboxExpanded]);

  const handleFocusLoss = () => {
    if (chatboxExpanded) {
      setChatboxExpanded(false); // Close the chatbox on losing focus
    }
  }


  React.useEffect(() => {
    // Listen for clicks outside the chatbox
    document.addEventListener('pointerdown', handlePointerDown);
    // Listen for focus loss (e.g., clicking on desktop or browser toolbar)
    window.addEventListener('blur', handleFocusLoss);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('blur', handleFocusLoss);
    }
  }, [handlePointerDown]);


  // Close the chatbox if the Escape key is pressed
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setChatboxExpanded(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  // Function to toggle chatbox
  const toggleChatbox = () => {
    setChatboxExpanded(prevState => !prevState);
    ignoreOutsideClick.current = true; // Reset flag for next click
  };

  return (
    <div className="__chat-container dark z-50">
      {chatboxExpanded && (
        <div ref={chatboxRef}>
          <ChatBox visible={chatboxExpanded} context={{ problemStatement }} />
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={toggleChatbox}>
          <Bot />
          {chatboxExpanded ? 'Close AI' : 'Ask AI'}
        </Button>
      </div>
    </div>
  )
}

export default ContentPage

import { Button } from "@/components/ui/button";
import { SendHorizontal, Sparkles, X } from "lucide-react";
import OpenAI from "openai";
import React, { useRef } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SYSTEM_PROMPT } from "@/constants/prompt";
import { cn } from "@/lib/utils";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import Markdown from "react-markdown";
import "./style.css";
import { extractCode } from "./util";

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
  role: "user" | "assistant";
  message: string;
  type: "text" | "markdown";
}

function ChatBox({ context }: ChatBoxProps) {
  const [value, setValue] = React.useState("");
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);
  const [chatboxExpanded, setChatboxExpanded] = React.useState(false);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  const handleGenerateAIResponse = async () => {
    try {
      const openAIAPIKey = (await chrome.storage.local.get("apiKey")) as {
        apiKey?: string;
      };

      if (!openAIAPIKey.apiKey) return alert("OpenAI API Key is required");

      const openai = createOpenAISDK(openAIAPIKey.apiKey);

      const userMessage = value;
      const userCurrentCodeContainer = document.querySelector(".view-line");

      const extractedCode = extractCode(
        userCurrentCodeContainer?.innerHTML ?? "",
      );

      const systemPromptModified = SYSTEM_PROMPT.replace(
        "{{problem_statement}}",
        context.problemStatement,
      )
        .replace("{{programming_language}}", context.programmingLanguage)
        .replace("{{user_code}}", extractedCode);

      const apiResponse = await openai.chat.completions.create({
        model: "chatgpt-4o-latest",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPromptModified },
          ...chatHistory.map(
            (chat) =>
              ({
                role: chat.role,
                content: chat.message,
              } as ChatCompletionMessageParam),
          ),
          { role: "user", content: userMessage },
        ],
      });

      if (apiResponse.choices[0].message.content) {
        const result = JSON.parse(apiResponse.choices[0].message.content);
        if ("output" in result) {
          setChatHistory((prev) => [
            ...prev,
            { message: result.output, role: "user", type: "markdown" },
          ]);
          chatBoxRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch (error) {
      console.error("Error generating response");
    }
  };

  const onSendMessage = () => {
    setChatHistory((prev) => [
      ...prev,
      { role: "user", message: value, type: "text" },
    ]);
    setValue("");
    chatBoxRef.current?.scrollIntoView({ behavior: "smooth" });
    handleGenerateAIResponse();
  };

  return (
    <div className='fixed bottom-6 right-6 flex flex-col items-end'>
      {/* Chat Card */}
      <Card
        className={cn(
          "w-[400px] bg-[#282828] border border-[#383838] shadow-lg transition-all duration-200 ease-in-out",
          chatboxExpanded
            ? "h-[600px] opacity-100"
            : "h-0 opacity-0 pointer-events-none",
        )}
      >
        <CardContent className='p-0 h-full flex flex-col'>
          {/* Header */}
          <div className='p-3 border-b border-[#383838] flex justify-between items-center'>
            <h3 className='text-sm font-medium text-zinc-200'>Chat</h3>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full hover:bg-[#383838]'
              onClick={() => setChatboxExpanded(false)}
            >
              <X className='h-4 w-4' />
              <span className='sr-only'>Close chat</span>
            </Button>
          </div>

          {/* Chat History */}
          <ScrollArea ref={chatBoxRef} className='flex-1 p-4'>
            {chatHistory.map((message, index) => (
              <div key={index} className='flex gap-3 mb-4 group'>
                <Avatar className='h-8 w-8 border-2 border-[#383838]'>
                  <AvatarImage src='https://github.com/shadcn.png' />
                  <AvatarFallback className='bg-[#383838] text-xs'>
                    {message.role.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className='flex-1'>
                  <p className='text-xs font-medium text-zinc-400 mb-1'>
                    {message.role.toUpperCase()}
                  </p>
                  <div className='text-sm text-zinc-200'>
                    {message.type === "markdown" ? (
                      <Markdown>{message.message}</Markdown>
                    ) : (
                      <p>{message.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>

          {/* Input Area */}
          <div className='p-4 border-t border-[#383838]'>
            <div className='flex gap-2'>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSendMessage();
                  }
                }}
                placeholder='Type your message...'
                className='bg-[#383838] border-none text-sm placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-400'
              />
              <Button size='icon' className='bg-white' onClick={onSendMessage}>
                <SendHorizontal className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Open Chat Button */}
      {!chatboxExpanded && (
        <Button
          className='rounded-lg bg-[#ffffff] border-none hover:bg-[#383838] my-4 mx-8 px-4'
          onClick={() => setChatboxExpanded(true)}
        >
          <Sparkles className='h-4 w-4' />
          <span>Ask AI</span>
        </Button>
      )}
    </div>
  );
}

const ContentPage: React.FC = () => {
  const metaDescriptionEl = document.querySelector("meta[name=description]");
  const problemStatement = metaDescriptionEl?.getAttribute("content") ?? "";

  return (
    <div className='__chat-container dark'>
      <ChatBox context={{ problemStatement, programmingLanguage: "C++" }} />
    </div>
  );
};

export default ContentPage;

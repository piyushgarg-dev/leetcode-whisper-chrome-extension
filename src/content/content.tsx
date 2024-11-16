import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bot, SendHorizontal } from "lucide-react";
import OpenAI from "openai";

import "./style.css";
import { Input } from "@/components/ui/input";
import { SYSTEM_PROMPT } from "@/constants/prompt";
import { extractCode } from "./util";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";

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
  openAIKey: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  message: string;
  type: "text" | "markdown";
}

function ChatBox({ context, openAIKey: openAIAPIKey }: ChatBoxProps) {
  const [value, setValue] = React.useState("");
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([]);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  const handleGenerateAIResponse = async () => {
    // const openAIAPIKey = (await chrome.storage.local.get("apiKey")) as {
    //   apiKey?: string;
    // };

    if (!openAIAPIKey) return alert("OpenAI API Key is required");

    const openai = createOpenAISDK(openAIAPIKey);

    const userMessage = value;
    const userCurrentCodeContainer = document.querySelector(".view-line");

    const extractedCode = extractCode(
      userCurrentCodeContainer?.innerHTML ?? ""
    );

    const systemPromptModified = SYSTEM_PROMPT.replace(
      "{{problem_statement}}",
      context.problemStatement
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
            } as ChatCompletionMessageParam)
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
    <div className="w-[400px] h-[550px] flex flex-col rounded-xl relative text-wrap overflow-auto  bg-zinc-900">
      <div className="flex-1 overflow-auto p-2" ref={chatBoxRef}>
        {chatHistory.map((message, index) => (
          <div
            key={index.toString()}
            className={cn(
              "flex gap-4 mt-3 w-full text-wrap items-start justify-end ",
              {
                "max-w-80 ml-auto": message.role === "user",
                "flex-row-reverse": message.role === "assistant",
              }
            )}
          >
            <div className="w-auto space-y-2">
              <p
                className={cn("text-xs font-semibold ", {
                  "text-start": message.role === "assistant",
                  "text-end": message.role === "user",
                })}
              >
                {message.role.toLocaleUpperCase()}
              </p>
              {message.type === "markdown" ? (
                <Markdown>{message.message}</Markdown>
              ) : (
                <p
                  className={cn("", {
                    "bg-zinc-700 p-1 rounded-md text-sm":
                      message.type === "text",
                  })}
                >
                  {message.message}
                </p>
              )}
            </div>
            {message.role === "assistant" ? (
              <div className="size-8 bg-yellow-500 rounded-full text-sm font-bold flex items-center justify-center">
                AI
              </div>
            ) : (
              <Avatar className="w-8 h-8">
                <AvatarImage src={"https://github.com/shadcn.png"} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
      </div>

      <div className=" w-full flex items-center gap-2 px-2 mb-4">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSendMessage();
          }}
          className="rounded-lg bg-black flex-1 min-w-0"
          placeholder="Type your message here"
        />
        <Button
          onClick={onSendMessage}
          size={"icon"}
          className="rounded-full transition-all "
          disabled={value.trim().length < 1}
        >
          <SendHorizontal className="size-4 " />
        </Button>
      </div>
    </div>
  );
}

const ContentPage: React.FC = () => {
  const [chatboxExpanded, setChatboxExpanded] = React.useState(false);
  const [openAIKey, setOpenAIKey] = React.useState<string | null>(null);
  const metaDescriptionEl = document.querySelector("meta[name=description]");
  const programmingLanguageOuterEl = document.getElementById(
    "headlessui-popover-button-:r1u:"
  );
  const problemStatement = metaDescriptionEl?.getAttribute("content") as string;

  const programmingLanguage =
    programmingLanguageOuterEl?.querySelector("div button")?.textContent ??
    "C++";

  useEffect(() => {
    (async function loadOpenAPIKey() {
      if (!chrome) return;
      const apiKeyFromStorage = (await chrome.storage.local.get("apiKey")) as {
        apiKey?: string;
      };
      if (apiKeyFromStorage.apiKey) setOpenAIKey(apiKeyFromStorage.apiKey);
    })();
  }, []);

  if (openAIKey === null) return;

  return (
    <div className="__chat-container dark space-y-4">
      {/*  */}
      {chatboxExpanded && (
        <ChatBox
          context={{ problemStatement, programmingLanguage }}
          openAIKey={openAIKey}
        />
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

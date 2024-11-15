import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, Loader2, SendHorizontal, X } from "lucide-react";
import OpenAI from "openai";

import "./style.css";
import { Input } from "@/components/ui/input";
import { SYSTEM_PROMPT } from "@/constants/prompt";
import { extractCode } from "./util";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Avatar } from "@/components/ui/avatar";
import Markdown from "react-markdown";
import { Card } from "@/components/ui/card";

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
  onClose: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  message: string;
  type: "text" | "markdown";
}

export function ChatBox({ context, onClose }: ChatBoxProps) {
  const [value, setValue] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const chatBoxRef = useRef<HTMLDivElement>(null);

  const handleGenerateAIResponse = async () => {
    setIsLoading(true);
    try {
      const openAIAPIKey = (await chrome.storage.local.get("apiKey")) as {
        apiKey?: string;
      };

      if (!openAIAPIKey.apiKey) {
        alert("OpenAI API Key is required");
        return;
      }

      const openai = createOpenAISDK(openAIAPIKey.apiKey);

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
        model: "gpt-4o-2024-08-06",
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
            { message: result.output, role: "assistant", type: "markdown" },
          ]);
        }
      }
    } catch (error) {
      console.error("Error generating AI response:", error);
      alert(
        "An error occurred while generating the AI response. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSendMessage = () => {
    if (!value.trim()) return;
    setChatHistory((prev) => [
      ...prev,
      { role: "user", message: value, type: "text" },
    ]);
    setValue("");
    handleGenerateAIResponse();
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      const parent = chatBoxRef.current.parentElement;
      if (parent) {
        parent.scrollTop = parent.scrollHeight;
      }
    }
  }, [chatHistory]);

  return (
    <Card className="w-[400px] h-[550px] mb-2 rounded-xl relative bg-background text-foreground flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4">
          <div className="flex flex-col gap-3 py-4">
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 mt-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    <span>{message.role === "user" ? "U" : "AI"}</span>
                  </Avatar>
                  <div
                    className={`rounded-lg p-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {message.type === "markdown" ? (
                      <Markdown className="prose dark:prose-invert max-w-none">
                        {message.message}
                      </Markdown>
                    ) : (
                      <p>{message.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatBoxRef} />
          </div>
        </div>
      </div>
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex items-center w-full gap-2"
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-grow"
            placeholder="Type your message here"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </Card>
  );
}

export function ContentPage() {
  const [chatboxExpanded, setChatboxExpanded] = useState(false);
  const [isApiKeyAvailable, setIsApiKeyAvailable] = useState(false);

  useEffect(() => {
    async function checkApiKey() {
      const apiKeyFromStorage = (await chrome.storage.local.get("apiKey")) as {
        apiKey?: string;
      };
      setIsApiKeyAvailable(!!apiKeyFromStorage.apiKey);
    }
    checkApiKey();
  }, []);

  const metaDescriptionEl = document.querySelector("meta[name=description]");
  const problemStatement =
    metaDescriptionEl?.getAttribute("content") || "No problem statement found";

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {chatboxExpanded ? (
        <ChatBox
          context={{ problemStatement, programmingLanguage: "C++" }}
          onClose={() => setChatboxExpanded(false)}
        />
      ) : (
        <Button
          onClick={() => setChatboxExpanded(true)}
          disabled={!isApiKeyAvailable}
          className="rounded-full"
        >
          <Bot className="mr-2 h-4 w-4" />
          {isApiKeyAvailable ? "Open Chat" : "Add OpenAI API Key"}
        </Button>
      )}
    </div>
  );
}

export default ContentPage;

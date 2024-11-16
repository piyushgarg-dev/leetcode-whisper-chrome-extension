import React, { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, SendHorizontal, X, Loader2 } from 'lucide-react'
import OpenAI from 'openai'
import { Input } from '@/components/ui/input'
import { SYSTEM_PROMPT } from '@/constants/prompt'
import { extractCode } from './util'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import MarkdownWithCode from '@/components/MarkDownWithCode'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

function createOpenAISDK(apiKey: string) {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

interface ChatBoxProps {
  context: {
    programmingLanguage: string
    problemStatement: string
  }
  onClose: () => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  message: string
  type: 'text' | 'markdown'
  timestamp: number
}

const MAX_MESSAGES = 50
const MESSAGE_LENGTH_LIMIT = 1000

function ChatBox({ context, onClose }: ChatBoxProps) {
  const [value, setValue] = React.useState('')
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { toast } = useToast()

  const chatBoxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight
    }
  }, [chatHistory])

  const handleGenerateAIResponse = async (userMessage: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const openAIAPIKey = (await chrome.storage.local.get('apiKey')) as {
        apiKey?: string
      }

      if (!openAIAPIKey.apiKey) {
        throw new Error(
          'OpenAI API Key is required. Please add it in the extension settings.'
        )
      }

      const openai = createOpenAISDK(openAIAPIKey.apiKey)
      const userCurrentCodeContainer = document.querySelector('.view-line')

      if (!userCurrentCodeContainer) {
        throw new Error(
          'No code found in the editor. Please make sure you have some code written.'
        )
      }

      const extractedCode = extractCode(
        userCurrentCodeContainer.innerHTML ?? ''
      )

      if (!extractedCode.trim()) {
        throw new Error('No valid code found in the editor.')
      }

      const systemPromptModified = SYSTEM_PROMPT.replace(
        '{{problem_statement}}',
        context.problemStatement || 'No problem statement found'
      )
        .replace('{{programming_language}}', context.programmingLanguage)
        .replace('{{user_code}}', extractedCode)

      const apiResponse = await openai.chat.completions.create({
        model: 'gpt-4',
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
          { role: 'user', content: userMessage },
        ],
      })

      if (!apiResponse.choices[0].message.content) {
        throw new Error('No response received from AI')
      }

      const result = JSON.parse(apiResponse.choices[0].message.content)

      if (!result.output) {
        throw new Error('Invalid response format from AI')
      }

      setChatHistory((prev) => [
        ...prev.slice(-MAX_MESSAGES),
        {
          message: result.output,
          role: 'assistant',
          type: 'markdown',
          timestamp: Date.now(),
        },
      ])
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSendMessage = () => {
    if (!value.trim()) {
      toast({
        description: 'Please enter a message',
        duration: 2000,
      })
      return
    }

    if (value.length > MESSAGE_LENGTH_LIMIT) {
      toast({
        variant: 'destructive',
        description: `Message too long. Maximum ${MESSAGE_LENGTH_LIMIT} characters allowed.`,
        duration: 3000,
      })
      return
    }

    if (isLoading) {
      toast({
        description: 'Please wait for the current response',
        duration: 2000,
      })
      return
    }

    const newMessage = {
      role: 'user' as const,
      message: value.trim(),
      type: 'text' as const,
      timestamp: Date.now(),
    }

    setChatHistory((prev) => [...prev.slice(-MAX_MESSAGES), newMessage])
    setValue('')
    handleGenerateAIResponse(value.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSendMessage()
    }
  }

  return (
    <div className="w-[400px] h-[550px] bg-gray-900 rounded-xl relative shadow-lg border border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-orange-500" />
          <h2 className="font-semibold text-white">LeetCode Assistant</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-gray-800 text-orange-500 hover:text-orange-400"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat Messages */}
      <div
        className="h-[420px] overflow-y-auto p-4 space-y-4 scroll-smooth"
        ref={chatBoxRef}
      >
        {chatHistory.map((message, index) => (
          <div
            key={`${index}-${message.timestamp}`}
            className={`flex gap-4 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <Avatar className="h-8 w-8">
                <AvatarImage src="/api/placeholder/32/32" alt="AI" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}

            <div
              className={`max-w-[70%] ${
                message.role === 'user'
                  ? 'bg-orange-600 ml-auto'
                  : 'bg-gray-700'
              } rounded-lg p-3`}
            >
              {message.type === 'markdown' ? (
                <MarkdownWithCode>{message.message}</MarkdownWithCode>
              ) : (
                <p className="text-white break-words">{message.message}</p>
              )}
            </div>

            {message.role === 'user' && (
              <Avatar className="h-8 w-8">
                <AvatarImage src="/api/placeholder/32/32" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-orange-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 w-full p-4 bg-gray-900 border-t border-gray-800">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="rounded-lg bg-gray-800 border-gray-700 focus:border-orange-500 text-white"
            placeholder="Type your message here..."
            disabled={isLoading}
            maxLength={MESSAGE_LENGTH_LIMIT}
          />
          <Button
            onClick={onSendMessage}
            disabled={isLoading || !value.trim()}
            className="h-10 w-10 p-2 rounded-lg bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

const ContentPage: React.FC = () => {
  const [chatboxExpanded, setChatboxExpanded] = React.useState(false)
  const metaDescriptionEl = document.querySelector('meta[name=description]')
  const problemStatement = metaDescriptionEl?.getAttribute('content') as string

  const handleClose = () => {
    setChatboxExpanded(false)
  }

  return (
    <div className="__chat-container dark fixed z-50 bottom-4 right-4">
      {chatboxExpanded && (
        <ChatBox
          context={{
            problemStatement,
            programmingLanguage: 'C++',
          }}
          onClose={handleClose}
        />
      )}
      <div className="flex justify-end mt-2">
        <Button
          onClick={() => setChatboxExpanded(!chatboxExpanded)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          {chatboxExpanded ? (
            <X className="h-5 w-5 mr-2" />
          ) : (
            <Bot className="h-5 w-5 mr-2" />
          )}
          {chatboxExpanded ? 'Close AI' : 'Ask AI'}
        </Button>
      </div>
    </div>
  )
}

export default ContentPage

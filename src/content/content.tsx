import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, SendHorizontal } from 'lucide-react'
import OpenAI from 'openai'
import { parse } from 'partial-json'
import { z } from 'zod'
import './style.css'
import { Input } from '@/components/ui/input'
import { SYSTEM_PROMPT } from '@/constants/prompt'
import { extractCode } from './util'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Markdown from 'react-markdown'
import { zodResponseFormat } from 'openai/helpers/zod'
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
}

// Define the schema for the AI response
export const AIResponseSchema = z.object({
  content: z
    .string()
    .describe('The content of the response in markdown format'),
})
interface ChatMessage {
  role: 'user' | 'assistant'
  message: string
  type: 'text' | 'markdown'
}

function ChatBox({ context }: ChatBoxProps) {
  const [value, setValue] = React.useState('')
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([])

  const chatBoxRef = useRef<HTMLDivElement>(null)

  const handleGenerateAIResponse = async () => {
    const openAIAPIKey = (await chrome.storage.local.get('apiKey')) as {
      apiKey?: string
    }

    if (!openAIAPIKey.apiKey) return alert('OpenAI API Key is required')

    const openai = createOpenAISDK(openAIAPIKey.apiKey)

    const userMessage = value
    const userCurrentCodeContainer = document.querySelector('.view-line')

    const extractedCode = extractCode(userCurrentCodeContainer?.innerHTML ?? '')

    const systemPromptModified = SYSTEM_PROMPT.replace(
      '{{problem_statement}}',
      context.problemStatement
    )
      .replace('{{programming_language}}', context.programmingLanguage)
      .replace('{{user_code}}', extractedCode)

    const apiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06', // support json format
      response_format: zodResponseFormat(AIResponseSchema, 'responseSchema'),
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
      stream: true,
    })

    // add an empty message to the chat history
    setChatHistory((prev) => [
      ...prev,
      { role: 'assistant', message: '', type: 'markdown' },
    ])
    let aiResponse: z.infer<typeof AIResponseSchema> = {
      content: '',
    }
    let data = ''

    // iterate over the response stream
    for await (const chunk of apiResponse) {
      const content = chunk.choices[0].delta?.content ?? ''
      data += content
      try {
        aiResponse = parse(data)

        // update the last message in the chat history
        setChatHistory((prev) => {
          const lastMessage = prev[prev.length - 1]
          lastMessage.message = aiResponse?.content ?? ''
          return [...prev]
        })
        chatBoxRef.current?.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior: 'smooth',
        })
      } catch (e) {
        console.error('Error parsing JSON', e)
      }
    }
  }

  const onSendMessage = () => {
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', message: value, type: 'text' },
    ])
    setValue('')
    chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' })
    handleGenerateAIResponse()
  }
  return (
    <div className="w-[400px] h-[550px] mb-2 rounded-sm relative text-wrap overflow-auto bg-white shadow-sm border">
      <div
        className="h-[510px] overflow-auto bg-white shadow-sm"
        style={{
          zIndex: 1000,
        }}
        ref={chatBoxRef}
      >
        {chatHistory.map((message, index) => (
          <div
            key={index.toString()}
            className="flex gap-4 mt-3 w-[400px] text-wrap px-2"
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" loading="lazy" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="w-[100%]">
              <p>{message.role.toLocaleUpperCase()}</p>
              {message.type === 'markdown' ? (
                <Markdown>{message.message}</Markdown>
              ) : (
                <p>{message.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 w-full flex items-center gap-2 bg-white p-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSendMessage()
          }}
          className="rounded-lg bg-white text-black"
          placeholder="Type your message here"
        />
        <SendHorizontal onClick={onSendMessage} className="cursor-pointer" />
      </div>
    </div>
  )
}

const ContentPage: React.FC = () => {
  const [chatboxExpanded, setChatboxExpanded] = React.useState(false)

  const metaDescriptionEl = document.querySelector('meta[name=description]')

  const problemStatement = metaDescriptionEl?.getAttribute('content') as string

  return (
    <div className="__chat-container dark z-[100]">
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
  )
}

export default ContentPage

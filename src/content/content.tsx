import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { SYSTEM_PROMPT } from '@/constants/prompt'
import { cn } from '@/lib/utils'
import { ClipboardCopy, Send, Sparkles, X } from 'lucide-react'
import OpenAI from 'openai'
import { useRef, useState } from 'react'
import { extractCode } from './util'

function createOpenAISDK(apiKey: string) {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}

interface ChatBoxProps {
  visible: boolean
  context: {
    problemStatement: string
  }
  onClose: () => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  message: string
  type: 'text' | 'markdown'
  assistantResponse?: {
    feedback?: string
    hints?: string[]
    snippet?: string
    programmingLanguage?: string
  }
}

function ChatBox({ context, visible, onClose }: ChatBoxProps) {
  const [value, setValue] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const chatBoxRef = useRef<HTMLDivElement>(null)

  const handleGenerateAIResponse = async () => {
    const openAIAPIKey = (await chrome.storage.local.get('apiKey')) as {
      apiKey?: string
    }

    if (!openAIAPIKey.apiKey) return alert('OpenAI API Key is required')

    const openai = createOpenAISDK(openAIAPIKey.apiKey)

    const userMessage = value
    const userCurrentCodeContainer = document.querySelectorAll('.view-line')
    const changeLanguageButton = document.querySelector(
      'button.rounded.items-center.whitespace-nowrap.inline-flex.bg-transparent.dark\\:bg-dark-transparent.text-text-secondary.group'
    )
    let programmingLanguage = 'UNKNOWN'

    if (changeLanguageButton && changeLanguageButton.textContent) {
      programmingLanguage = changeLanguageButton.textContent
    }

    {
      /* Argument of type 'NodeListOf<Element>' is not assignable to parameter of type 'string'. 
      this error was comming for extractedCode before so to pass it as string rthe below synteax is being rewritten*/
    }
    const extractedCode = extractCode(
      Array.from(userCurrentCodeContainer)
        .map((node) => node.textContent || '')
        .join('\n')
    )

    const systemPromptModified = SYSTEM_PROMPT.replace(
      '{{problem_statement}}',
      context.problemStatement
    )
      .replace('{{programming_language}}', programmingLanguage)
      .replace('{{user_code}}', extractedCode)

    const apiResponse = await openai.chat.completions.create({
      model: 'chatgpt-4o-latest',
      messages: [
        { role: 'system', content: systemPromptModified },
        ...chatHistory.map((chat) => ({
          role: chat.role,
          content: chat.message,
        })),
        {
          role: 'user',
          content: `User Prompt: ${userMessage}\n\nCode: ${extractedCode}`,
        },
      ],
    })

    if (apiResponse.choices[0]?.message.content) {
      const result = JSON.parse(apiResponse.choices[0].message.content)

      if (result.output) {
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
        ])
        chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const onSendMessage = () => {
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', message: value, type: 'text' },
    ])
    chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' })
    setValue('')
    handleGenerateAIResponse()
  }

  if (!visible) return <></>

  return (
    <Card className="w-[400px] fixed bottom-4 right-4 bg-[#282828] text-[#eff1f6] border-[#3e3e3e]">
      <CardContent className="p-0">
        <div className="flex justify-between items-center p-4 border-b border-[#3e3e3e]">
          <h2 className="text-lg font-semibold">LeetCode Whisper</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-[#eff1f6] hover:text-[#ffa116]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="h-[400px] overflow-auto p-4 space-y-4">
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex w-max max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                message.role === 'user'
                  ? 'ml-auto bg-[#ffa116] text-[#282828]'
                  : 'bg-[#3e3e3e] text-[#eff1f6]'
              )}
            >
              {message.role === 'user' ? (
                <>{message.message}</>
              ) : (
                <>
                  <p>{message.assistantResponse?.feedback}</p>
                  <Accordion type="multiple">
                    {message.assistantResponse?.hints && (
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="text-[#ffa116]">
                          Hints 👀
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-disc pl-4 space-y-2">
                            {message.assistantResponse?.hints?.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                    {message.assistantResponse?.snippet && (
                      <AccordionItem value="item-2">
                        <AccordionTrigger className="text-[#ffa116]">
                          Code 🧑🏻‍💻
                        </AccordionTrigger>
                        <AccordionContent>
                          <pre className="bg-[#1c1c1c] p-3 rounded-md shadow-lg overflow-x-auto">
                            <code>{message.assistantResponse.snippet}</code>
                          </pre>
                          <Button
                            className="mt-2 text-[#eff1f6] hover:text-[#ffa116]"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                message.assistantResponse?.snippet || ''
                              )
                            }
                          >
                            <ClipboardCopy className="h-4 w-4 mr-2" />
                            Copy
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
      <CardFooter className="border-t border-[#3e3e3e] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSendMessage()
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-[#3e3e3e] border-[#3e3e3e] text-[#eff1f6] placeholder-[#8a8a8a]"
          />
          <Button
            type="submit"
            size="icon"
            className="bg-[#ffa116] text-[#282828] hover:bg-[#ffa116]/80"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

export default function ContentPage() {
  const [chatboxExpanded, setChatboxExpanded] = useState(false)
  const problemStatement = 'Sample problem statement'

  return (
    <div className="__chat-container dark:bg-[#282828] min-h-screen">
      <ChatBox
        visible={chatboxExpanded}
        onClose={() => setChatboxExpanded(false)}
        context={{ problemStatement }}
      />
      <div className="fixed bottom-4 right-4">
        {!chatboxExpanded && (
          <Button
            onClick={() => setChatboxExpanded(!chatboxExpanded)}
            className="bg-[#ffa116] text-[#282828] hover:bg-[#ffa116]/80"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            'Ask AI'
          </Button>
        )}
      </div>
    </div>
  )
}

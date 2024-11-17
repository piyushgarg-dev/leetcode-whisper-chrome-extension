import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, ClipboardCopy, Send, SendHorizontal } from 'lucide-react'
import OpenAI from 'openai'

import './style.css'
import { Input } from '@/components/ui/input'
import { SYSTEM_PROMPT } from '@/constants/prompt'
import { extractCode } from './util'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, Copy, Send } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import { Input } from '@/components/ui/input'
import { SYSTEM_PROMPT } from '@/constants/prompt'
import { extractCode } from './util'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

function createOpenAISDK(apiKey: string) {
  return new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  })
}
import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

import { ModalService } from '@/services/ModalService'
import { useChromeStorage } from '@/hooks/useChromeStorage'
import { ChatHistory, parseChatHistory } from '@/interface/chatHistory'
import { VALID_MODELS, ValidModel } from '@/constants/valid_modals'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ChatBoxProps {
  visible: boolean
  context: {
    problemStatement: string
  }
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

function ChatBox({ context, visible }: ChatBoxProps) {
  const [value, setValue] = React.useState('')
  const [chatHistory, setChatHistory] = React.useState<ChatMessage[]>([])

  const chatBoxRef = useRef<HTMLDivElement>(null)

    problemStatement: string
  }
  model: ValidModel
  apikey: string
  heandelModel: (v: ValidModel) => void
  selectedModel: ValidModel | undefined
}

const ChatBox: React.FC<ChatBoxProps> = ({
  context,
  visible,
  model,
  apikey,
  heandelModel,
  selectedModel,
}) => {
  const [value, setValue] = React.useState('')
  const [chatHistory, setChatHistory] = React.useState<ChatHistory[]>([])
  const [isResponseLoading, setIsResponseLoading] =
    React.useState<boolean>(false)
  // const chatBoxRef = useRef<HTMLDivElement>(null)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory, isResponseLoading])
  /**
   * Handles the generation of an AI response.
   *
   * This function performs the following steps:
   * 1. Initializes a new instance of `ModalService`.
   * 2. Selects a modal using the provided model and API key.
   * 3. Determines the programming language from the UI.
   * 4. Extracts the user's current code from the document.
   * 5. Modifies the system prompt with the problem statement, programming language, and extracted code.
   * 6. Generates a response using the modified system prompt.
   * 7. Updates the chat history with the generated response or error message.
   * 8. Scrolls the chat box into view.
   *
   * @async
   * @function handleGenerateAIResponse
   * @returns {Promise<void>} A promise that resolves when the AI response generation is complete.
   */
  const handleGenerateAIResponse = async () => {
    const modalService = new ModalService()

    modalService.selectModal(model, apikey)

    let programmingLanguage = 'UNKNOWN'

    const userMessage = value
    const userCurrentCodeContainer = document.querySelectorAll('.view-line')
    const changeLanguageButton = document.querySelector(
      '[id="editor"] [data-headlessui-state] button'
    )
    if (changeLanguageButton) {
      if (changeLanguageButton.textContent)
        programmingLanguage = changeLanguageButton.textContent
    }
    const userCurrentCodeContainer = document.querySelectorAll('.view-line')

    const extractedCode = extractCode(userCurrentCodeContainer)

    const systemPromptModified = SYSTEM_PROMPT.replace(
      /{{problem_statement}}/gi,
      context.problemStatement
    )
      .replace(/{{programming_language}}/g, programmingLanguage)
      .replace(/{{user_code}}/g, extractedCode)

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
            } as ChatCompletionMessageParam)
        ),
      .replace('{{user_code}}', extractedCode)

    const PCH = parseChatHistory(chatHistory)

    const { error, success } = await modalService.generate({
      prompt: `${value}`,
      systemPrompt: systemPromptModified,
      messages: PCH,
      extractedCode: extractedCode,
    })

    if (error) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error.message,
        },
      ],
    })

    if (apiResponse.choices[0].message.content) {
      const result = JSON.parse(apiResponse.choices[0].message.content)

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
        ])
        chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
      ])
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    if (success) {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: success,
        },
      ])
      setValue('')
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    setIsResponseLoading(false)
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
  const onSendMessage = (value: string) => {
    setIsResponseLoading(true)
    setChatHistory((prev) => [...prev, { role: 'user', content: value }])
    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    handleGenerateAIResponse()
  }

  if (!visible) return <></>

  return (
    <Card className="mb-5">
      <div className="p-2">
        <Select
          onValueChange={(v: ValidModel) => heandelModel(v)}
          value={selectedModel}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Model</SelectLabel>
              <SelectSeparator />
              {VALID_MODELS.map((modelOption) => (
                <SelectItem key={modelOption.name} value={modelOption.name}>
                  {modelOption.display}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <CardContent className="p-2">
        {chatHistory.length > 0 ? (
          <ScrollArea
            className="space-y-4 h-[510px] w-[400px] p-2"
            ref={scrollAreaRef}
          >
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex w-max max-w-[75%] flex-col gap-2 px-3 py-2 text-sm my-4',
                  message.role === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground rounded-bl-lg rounded-tl-lg rounded-tr-lg '
                    : 'bg-muted rounded-br-lg rounded-tl-lg rounded-tr-lg'
                )}
              >
                <>
                  <p className="max-w-80">
                    {typeof message.content === 'string'
                      ? message.content
                      : message.content.feedback}
                  </p>

                  {!(typeof message.content === 'string') && (
                    <Accordion type="multiple">
                      {message.content?.hints &&
                        message.content.hints.length > 0 && (
                          <AccordionItem value="item-1" className="max-w-80">
                            <AccordionTrigger>Hints 👀</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-4">
                                {message.content?.hints?.map((e) => (
                                  <li key={e}>{e}</li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      {message.content?.snippet && (
                        <AccordionItem value="item-2" className="max-w-80">
                          <AccordionTrigger>Code 🧑🏻‍💻</AccordionTrigger>

                          <AccordionContent>
                            <div className="mt-4 rounded-md">
                              <div className="relative">
                                <Copy
                                  onClick={() => {
                                    if (typeof message.content !== 'string')
                                      navigator.clipboard.writeText(
                                        `${message.content?.snippet}`
                                      )
                                  }}
                                  className="absolute right-2 top-2 h-4 w-4"
                                />
                                <Highlight
                                  theme={themes.dracula}
                                  code={message.content?.snippet || ''}
                                  language={
                                    message.content?.programmingLanguage?.toLowerCase() ||
                                    'javascript'
                                  }
                                >
                                  {({
                                    className,
                                    style,
                                    tokens,
                                    getLineProps,
                                    getTokenProps,
                                  }) => (
                                    <pre
                                      style={style}
                                      className={cn(
                                        className,
                                        'p-3 rounded-md'
                                      )}
                                    >
                                      {tokens.map((line, i) => (
                                        <div
                                          key={i}
                                          {...getLineProps({ line })}
                                        >
                                          {line.map((token, key) => (
                                            <span
                                              key={key}
                                              {...getTokenProps({ token })}
                                            />
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
                  )}
                </>
              </div>
            ))}
            {isResponseLoading && (
              <div className={'flex w-max max-w-[75%] flex-col my-2'}>
                <div className="w-5 h-5 rounded-full animate-pulse bg-primary"></div>
              </div>
            )}
            <div ref={lastMessageRef} />
          </ScrollArea>
        ) : (
          <div>
            <p className="flex items-center justify-center h-[510px] w-[400px] text-center space-y-4">
              No messages yet.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (value.length === 0) return
            onSendMessage()
            setValue('')
            event.preventDefault()
            if (value.trim().length === 0) return
            onSendMessage(value)
            setValue('')
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
            disabled={isResponseLoading}
            required
          />
          <Button type="submit" size="icon" disabled={value.length === 0}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

const ContentPage: React.FC = () => {
  const [chatboxExpanded, setChatboxExpanded] = React.useState<boolean>(false)

  const metaDescriptionEl = document.querySelector('meta[name=description]')
  const problemStatement = metaDescriptionEl?.getAttribute('content') as string

  const [modal, setModal] = React.useState<ValidModel | null | undefined>(null)
  const [apiKey, setApiKey] = React.useState<string | null | undefined>(null)

  ;(async () => {
    const { getKeyModel, selectModel } = useChromeStorage()
    const { model, apiKey } = await getKeyModel(await selectModel())

    setModal(model)
    setApiKey(apiKey)
  })()

  const [selectedModel, setSelectedModel] = React.useState<ValidModel>()

  const heandelModel = (v: ValidModel) => {
    if (v) {
      const { setSelectModel } = useChromeStorage()
      setSelectModel(v)
      setSelectedModel(v)
    }
  }

  React.useEffect(() => {
    const loadChromeStorage = async () => {
      if (!chrome) return

      const { selectModel } = useChromeStorage()

      setSelectedModel(await selectModel())
    }

    loadChromeStorage()
  }, [])

  return (
    <div
      className="dark z-50"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
      }}
    >
      {!modal || !apiKey ? (
        !chatboxExpanded ? null : (
          <>
            <Card className="mb-5">
              <CardContent className="h-[500px] grid place-items-center">
                <div className="grid place-items-center gap-4">
                  {!selectedModel && (
                    <>
                      <p className="text-center">
                        Please configure the extension before using this
                        feature.
                      </p>
                      <Button
                        onClick={() => {
                          chrome.runtime.sendMessage({ action: 'openPopup' })
                        }}
                      >
                        configure
                      </Button>
                    </>
                  )}
                  {selectedModel && (
                    <>
                      <p>
                        We couldn't find any API key for selected model{' '}
                        <b>
                          <u>{selectedModel}</u>
                        </b>
                      </p>
                      <p>you can select another models</p>
                      <Select
                        onValueChange={(v: ValidModel) => heandelModel(v)}
                        value={selectedModel}
                      >
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Model</SelectLabel>
                            <SelectSeparator />
                            {VALID_MODELS.map((modelOption) => (
                              <SelectItem
                                key={modelOption.name}
                                value={modelOption.name}
                              >
                                {modelOption.display}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )
      ) : (
        <ChatBox
          visible={chatboxExpanded}
          context={{ problemStatement }}
          model={modal}
          apikey={apiKey}
          heandelModel={heandelModel}
          selectedModel={selectedModel}
        />
      )}
      <div className="flex justify-end">
        <Button
          size={'icon'}
          onClick={() => setChatboxExpanded(!chatboxExpanded)}
        >
          <Bot />
        </Button>
      </div>
    </div>
  )
}

export default ContentPage

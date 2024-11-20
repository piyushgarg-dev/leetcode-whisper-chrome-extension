import React, { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, Copy, Dot, Send } from 'lucide-react'
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
import { LIMIT_VALUE } from '@/lib/indexedDB'
import { useIndexDB } from '@/hooks/useIndexDB'

interface ChatBoxProps {
  visible: boolean
  context: {
    problemStatement: string
  }
  model: ValidModel
  apikey: string
  heandelModel: (v: ValidModel) => void
  selectedModel: ValidModel | undefined
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string | {
    feedback: string
    hints?: string[]
    snippet?: string
  }
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
  const [previousChatHistory, setPreviousChatHistory] = React.useState<
    ChatHistory[]
  >([])
  const [isResponseLoading, setIsResponseLoading] = React.useState<boolean>(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const [offset, setOffset] = React.useState<number>(0)
  const [totalMessages, setTotalMessages] = React.useState<number>(0)
  const [isPreviousMsgLoading, setIsPreviousMsgLoading] =
    React.useState<boolean>(false)
  const { fetchChatHistory, saveChatHistory } = useIndexDB()

  const getProblemName = () => {
    const url = window.location.href
    const match = /\/problems\/([^/]+)/.exec(url)
    return match ? match[1] : 'Unknown Problem'
  }

  const problemName = getProblemName()
  const inputFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (lastMessageRef.current && !isPreviousMsgLoading) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    setTimeout(() => {
      inputFieldRef.current?.focus()
    }, 0)
  }, [chatHistory, isResponseLoading, visible])

  const handleGenerateAIResponse = async (): Promise<void> => {
    const modalService = new ModalService()
    modalService.selectModal(model, apikey)

    let programmingLanguage = 'UNKNOWN'
    const changeLanguageButton = document.querySelector(
      'button.rounded.items-center.whitespace-nowrap.inline-flex.bg-transparent.dark\\:bg-dark-transparent.text-text-secondary.group'
    )
    if (changeLanguageButton?.textContent) {
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

    const PCH = parseChatHistory(chatHistory)

    const { error, success } = await modalService.generate({
      prompt: value,
      systemPrompt: systemPromptModified,
      messages: PCH,
      extractedCode: extractedCode,
    })

    if (error) {
      const errorMessage: ChatHistory = {
        role: 'assistant',
        content: error.message,
      }
      await saveChatHistory(problemName, [
        ...previousChatHistory,
        { role: 'user', content: value },
        errorMessage,
      ])
      setPreviousChatHistory((prev) => [...prev, errorMessage])
      setChatHistory((prev) => [...prev, errorMessage])
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    if (success) {
      const res: ChatHistory = {
        role: 'assistant',
        content: success,
      }
      await saveChatHistory(problemName, [
        ...previousChatHistory,
        { role: 'user', content: value },
        res,
      ])
      setPreviousChatHistory((prev) => [...prev, res])
      setChatHistory((prev) => [...prev, res])
      setValue('')
    }

    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    setIsResponseLoading(false)
    setTimeout(() => {
      inputFieldRef.current?.focus()
    }, 0)
  }

  const loadInitialChatHistory = async () => {
    const { totalMessageCount, chatHistory, allChatHistory } =
      await fetchChatHistory(problemName, LIMIT_VALUE, 0)
    setPreviousChatHistory(allChatHistory || [])

    setTotalMessages(totalMessageCount)
    setChatHistory(chatHistory)
    setOffset(LIMIT_VALUE)
  }

  useEffect(() => {
    loadInitialChatHistory()
  }, [problemName])

  const loadMoreMessages = async () => {
    if (totalMessages < offset) {
      return
    }
    setIsPreviousMsgLoading(true)
    const { chatHistory: moreMessages } = await fetchChatHistory(
      problemName,
      LIMIT_VALUE,
      offset
    )

    if (moreMessages.length > 0) {
      setChatHistory((prev) => [...moreMessages, ...prev]) 
      setOffset((prevOffset) => prevOffset + LIMIT_VALUE)
    }

    setTimeout(() => {
      setIsPreviousMsgLoading(false)
    }, 500)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target.scrollTop === 0) {
      loadMoreMessages()
    }
  }

  const onSendMessage = async (value: string) => {
    setIsResponseLoading(true)
    const newMessage: ChatHistory = { role: 'user', content: value }

    setPreviousChatHistory((prev) => {
      return [...prev, newMessage]
    })
    setChatHistory([...chatHistory, newMessage])

    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    handleGenerateAIResponse()
  }

  if (!visible) return null

  return (
    <Card className="mb-2 ">
      <div className="flex gap-2 items-center justify-between h-20 rounded-t-lg p-4">
        <div className="flex gap-2 items-center justify-start">
          <div className="bg-white rounded-full p-2">
            <Bot color="#000" className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Need Help?</h3>
            <h6 className="font-normal text-xs">Always online</h6>
          </div>
        </div>
        <Select
          onValueChange={(v: ValidModel) => heandelModel(v)}
          value={selectedModel}
        >
          <SelectTrigger className="w-[180px] border-none shadow-none">
            <SelectValue placeholder="Select model" />
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
            className="space-y-4 h-[500px] w-[400px] p-2"
            ref={scrollAreaRef}
            onScroll={handleScroll}
          >
            {totalMessages > offset && (
              <div className="flex w-full items-center justify-center">
                <Button
                  className="text-sm p-1 m-x-auto bg-transpernent text-white hover:bg-transpernent"
                  onClick={loadMoreMessages}
                >
                  Load Previous Messages
                </Button>
              </div>
            )}
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex w-max max-w-[75%] flex-col gap-2 px-3 py-2 text-sm',
                  {
                    'ml-auto items-end': message.role === 'user',
                    'mr-auto items-start': message.role === 'assistant',
                  }
                )}
              >
                <div
                  ref={
                    index === chatHistory.length - 1
                      ? lastMessageRef
                      : undefined
                  }
                >
                  <Accordion type="single" collapsible>
                    <AccordionItem value="message-content">
                      <AccordionTrigger>
                        {typeof message.content === 'string'
                          ? message.content
                          : 'Code Snippet'}
                      </AccordionTrigger>
                      <AccordionContent>
                        {typeof message.content === 'object' &&
                          message.content.snippet && (
                            <Highlight
                              theme={themes.vsDark}
                              code={message.content.snippet}
                              language="javascript"
                            >
                              {({
                                className,
                                style,
                                tokens,
                                getLineProps,
                                getTokenProps,
                              }) => (
                                <pre
                                  className={className}
                                  style={style}
                                  role="presentation"
                                >
                                  {tokens.map((line, i) => (
                                    <div {...getLineProps({ line, key: i })}>
                                      {line.map((token, key) => (
                                        <span
                                          {...getTokenProps({ token, key })}
                                        />
                                      ))}
                                    </div>
                                  ))}
                                </pre>
                              )}
                            </Highlight>
                          )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </div>
            ))}
          </ScrollArea>
        ) : null}
      </CardContent>
      <CardFooter className="relative gap-1">
        <Input
          ref={inputFieldRef}
          type="text"
          placeholder="Write your message..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="focus:ring-0 focus:ring-offset-0 border-none focus:outline-none"
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onSendMessage(value)}
          className="text-white hover:text-gray-300"
        >
          <Send />
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ChatBox

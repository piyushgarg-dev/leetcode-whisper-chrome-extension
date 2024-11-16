import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, ClipboardCopy, Send } from 'lucide-react'
import OpenAI from 'openai'

import './style.css'
import { Input } from '@/components/ui/input'
import { SYSTEM_PROMPT } from '@/constants/prompt'
import { extractCode } from './util'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import SideBar from '@/components/SideBar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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

export interface PreviousChat {
  problemName: string
  chatHistory: ChatMessage[]
}

const getProblemName = () => {
  const url = window.location.href
  const match = /\/problems\/([^/]+)/.exec(url)
  return match ? match[1] : 'Unknown Problem'
}

function ChatBox({ context, visible }: ChatBoxProps) {
  const [value, setValue] = useState('')
  const [previousChats, setPreviousChats] = useState<PreviousChat[]>([])
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [isAITyping, setIsAITyping] = useState<boolean>(false)

  const [problemName, setProblemName] = useState(getProblemName())

  const chatBoxRef = useRef<HTMLDivElement>(null)

  const ScrollToBottom = () => {
    setTimeout(() => {
      if (chatBoxRef.current) {
        chatBoxRef.current.scrollTo({
          top: chatBoxRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }
    }, 100)
  }
  const handleGenerateAIResponse = async () => {
    const openAIAPIKey = (await chrome.storage.local.get('apiKey')) as {
      apiKey?: string
    }

    if (!openAIAPIKey.apiKey) return

    const openai = createOpenAISDK(openAIAPIKey.apiKey)

    const userMessage = value
    const userCurrentCodeContainer = document.querySelectorAll('.view-line')
    const changeLanguageButton = document.querySelector(
      'button.rounded.items-center.whitespace-nowrap.inline-flex.bg-transparent.dark\\:bg-dark-transparent.text-text-secondary.group'
    )
    let programmingLanguage = 'UNKNOWN'

    if (changeLanguageButton) {
      if (changeLanguageButton.textContent)
        programmingLanguage = changeLanguageButton.textContent
    }

    const extractedCode = extractCode(userCurrentCodeContainer)

    const systemPromptModified = SYSTEM_PROMPT.replace(
      '{{problem_statement}}',
      context.problemStatement
    )
      .replace('{{programming_language}}', programmingLanguage)
      .replace('{{user_code}}', extractedCode)
    setIsAITyping(true)
    try {
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
        const result = JSON.parse(apiResponse.choices[0].message.content)

        if ('output' in result) {
          const response: ChatMessage = {
            message: 'NA',
            role: 'assistant',
            type: 'markdown',
            assistantResponse: {
              feedback: result.output.feedback,
              hints: result.output.hints,
              snippet: result.output.snippet,
              programmingLanguage: result.output.programmingLanguage,
            },
          }
          setChatHistory((prev) => {
            saveChatHistoryToLocalStorage(problemName, [...prev, response])
            return [...prev, response]
          })
        }
      } else {
        throw new Error('Unexpected API response format.')
      }
    } catch (error: any) {
      console.error('Error during AI response generation:', error)

      const errorMessage: ChatMessage = {
        message: `Error: ${error?.message || 'An unknown error occurred.'}`,
        role: 'assistant',
        type: 'markdown',
        assistantResponse: {
          feedback: error?.message
            ? 'Oops! Something went wrong while processing your request. Please try again later.'
            : 'Unknown error, please check the details and try again.',
          hints: [
            error?.code || 'unknown_error',
            `${error?.message || 'An unknown error occurred.'}`,
          ],
          snippet: `Error code: ${error?.error?.code || 'unknown_error'} \nMessage: ${error?.message || 'No message available'}\n${error?.param ? `Param: ${error.param}` : ''}\n${error?.type ? `Error type: ${error.type}` : ''}\nYou can find more information here: https://platform.openai.com/account/api-keys
          `,
        },
      }

      setChatHistory((prev) => {
        saveChatHistoryToLocalStorage(problemName, [...prev, errorMessage])
        return [...prev, errorMessage]
      })
    } finally {
      setIsAITyping(false)
      ScrollToBottom()
    }
  }

  const saveChatHistoryToLocalStorage = (
    problemName: string,
    history: ChatMessage[]
  ) => {
    const previousChats = JSON.parse(
      localStorage.getItem('previousChats') || '[]'
    )

    const existingChat = previousChats.find(
      (chat: { problemName: string }) => chat.problemName === problemName
    )

    if (existingChat) {
      existingChat.chatHistory = history
    } else {
      const newChatHistory = {
        problemName,
        chatHistory: history,
      }
      previousChats.push(newChatHistory)
    }

    localStorage.setItem('previousChats', JSON.stringify(previousChats))
  }

  const onSendMessage = async () => {
    const openAIAPIKey = (await chrome.storage.local.get('apiKey')) as {
      apiKey?: string
    }
    if (!openAIAPIKey.apiKey) return alert('Open Ai Api Key Required')

    saveChatHistoryToLocalStorage(problemName, [
      ...chatHistory,
      { role: 'user', message: value, type: 'text' },
    ])
    setChatHistory((prev) => [
      ...prev,
      { role: 'user', message: value, type: 'text' },
    ])
    ScrollToBottom()

    await handleGenerateAIResponse()

    setValue('')
  }
  const loadPreviousChats = () => {
    const previousChats = JSON.parse(
      localStorage.getItem('previousChats') || '[]'
    )
    return previousChats
  }

  useEffect(() => {
    const previousChats = loadPreviousChats()
    const pbName = getProblemName()
    setProblemName(pbName)
    const filteredChat = previousChats.filter(
      (chat: PreviousChat) =>
        chat.problemName.toLocaleLowerCase() === pbName.toLowerCase()
    )

    if (filteredChat.length > 0) {
      const chatHistoryData = filteredChat[0].chatHistory
      setChatHistory([...chatHistoryData])
    } else {
      setChatHistory([])
    }
    setPreviousChats(previousChats)
    ScrollToBottom()
  }, [context, visible])

  const onClickPriviousChat = (problemName: string) => {
    const previousChats = loadPreviousChats()
    const filteredChat = previousChats.filter(
      (chat: PreviousChat) =>
        chat.problemName.toLocaleLowerCase() === problemName.toLocaleLowerCase()
    )
    setProblemName(filteredChat[0].problemName)
    const chatHistoryData = filteredChat[0].chatHistory
    setChatHistory([...chatHistoryData])
  }

  if (!visible) return <></>

  return (
    <Card className="mb-5">
      <CardContent className="w-full p-0">
        <div className="h-10 bg-[#333333] flex items-center  overflow-hidden p-2">
          {previousChats && (
            <SideBar
              previousChats={previousChats}
              onClickPriviousChat={onClickPriviousChat}
            />
          )}
          <h3 className="text-white text- p-2 capitalize flex-1 ">
            {problemName.replace(/-/g, ' ')}
          </h3>
          {isAITyping && (
            <div className="ml-4 text-white text-sm animate-pulse display-block">
              AI is typing...
            </div>
          )}
        </div>
        <div
          className="space-y-4 h-[400px] w-[500px] overflow-auto mt-5 p-2"
          ref={chatBoxRef}
        >
          {chatHistory.length < 1 && (
            <>
              <div className="text-white text-center text-lg p-2 w-full h-full flex items-center justify-center">
                Type a message to start the conversation
              </div>
            </>
          )}
          {chatHistory &&
            chatHistory.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex w-max max-w-[75%] w-[70%] flex-col gap-2 rounded-lg px-3 py-2 text-sm',
                  message.role === 'user'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={
                        message.role === 'user'
                          ? 'https://github.com/shadcn.png'
                          : 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg?t=st=1731697574~exp=1731701174~hmac=2f4fa91058d2386b79cdc9bd4a9d5f7318ae5443acfcd649ac200bea56eb0e90&w=740'
                      }
                    />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <p className="font-bold">
                    {message.role.toLocaleUpperCase()}
                  </p>
                </div>
                <div className="w-[100%]  overflow-x-hidden ">
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
                                <code>
                                  {message.assistantResponse?.snippet}
                                </code>
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
              </div>
            ))}
        </div>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (value.length === 0) return
            onSendMessage()
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
  const [chatboxExpanded, setChatboxExpanded] = React.useState(false)

  const metaDescriptionEl = document.querySelector('meta[name=description]')

  const problemStatement = metaDescriptionEl?.getAttribute('content') as string

  return (
    <div className="__chat-container dark z-50">
      <ChatBox visible={chatboxExpanded} context={{ problemStatement }} />
      <div className="flex justify-end">
        <Button onClick={() => setChatboxExpanded(!chatboxExpanded)}>
          {chatboxExpanded ? (
            'Close'
          ) : (
            <>
              <Bot /> Ask AI
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default ContentPage

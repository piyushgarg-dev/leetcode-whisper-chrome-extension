import React, { useState, useEffect, useRef } from 'react'
import { Bot, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useChromeStorage } from '@/hooks/useChromeStorage'
import { useIndexDB } from '@/hooks/useIndexDB'
import { ChatHistory } from '@/interface/chatHistory'
import { VALID_MODELS, ValidModel } from '@/constants/valid_modals'
import { LIMIT_VALUE } from '@/lib/indexedDB'
import { ModalService } from '@/services/ModalService'
import { SYSTEM_PROMPT } from '@/constants/prompt'
import { extractCode } from './util'

const ChatBox: React.FC<ChatBoxProps> = ({
  visible,
  context,
  model,
  apikey,
  handleModelChange,
  selectedModel,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [isResponseLoading, setIsResponseLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [totalMessages, setTotalMessages] = useState(0)
  const [isLoadingPreviousMessages, setIsLoadingPreviousMessages] = useState(false)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)
  const inputFieldRef = useRef<HTMLInputElement>(null)

  const { fetchChatHistory, saveChatHistory } = useIndexDB()
  const problemName = getProblemName()

  useEffect(() => {
    loadInitialChatHistory()
  }, [problemName])

  useEffect(() => {
    if (lastMessageRef.current && !isLoadingPreviousMessages) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    inputFieldRef.current?.focus()
  }, [chatHistory, isResponseLoading, visible])

  const handleGenerateAIResponse = async () => {
    const modalService = new ModalService()
    modalService.selectModal(model, apikey)

    const programmingLanguage = getProgrammingLanguage()
    const extractedCode = extractCode(document.querySelectorAll('.view-line'))

    const systemPromptModified = SYSTEM_PROMPT
      .replace(/{{problem_statement}}/gi, context.problemStatement)
      .replace(/{{programming_language}}/g, programmingLanguage)
      .replace(/{{user_code}}/g, extractedCode)

    const { error, success } = await modalService.generate({
      prompt: inputValue,
      systemPrompt: systemPromptModified,
      messages: chatHistory,
      extractedCode: extractedCode,
    })

    const newMessage: ChatHistory = {
      role: 'assistant',
      content: error ? error.message : success,
    }

    await saveChatHistory(problemName, [...chatHistory, newMessage])
    setChatHistory((prev) => [...prev, newMessage])
    setIsResponseLoading(false)
    inputFieldRef.current?.focus()
  }

  const loadInitialChatHistory = async () => {
    const { totalMessageCount, chatHistory } = await fetchChatHistory(problemName, LIMIT_VALUE, 0)
    setTotalMessages(totalMessageCount)
    setChatHistory(chatHistory)
    setOffset(LIMIT_VALUE)
  }

  const loadMoreMessages = async () => {
    if (totalMessages <= offset) return
    setIsLoadingPreviousMessages(true)
    const { chatHistory: moreMessages } = await fetchChatHistory(problemName, LIMIT_VALUE, offset)
    if (moreMessages.length > 0) {
      setChatHistory((prev) => [...moreMessages, ...prev])
      setOffset((prevOffset) => prevOffset + LIMIT_VALUE)
    }
    setTimeout(() => setIsLoadingPreviousMessages(false), 500)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop === 0) {
      loadMoreMessages()
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim().length === 0) return
    setIsResponseLoading(true)
    const newMessage: ChatHistory = { role: 'user', content: inputValue }
    setChatHistory((prev) => [...prev, newMessage])
    setInputValue('')
    await handleGenerateAIResponse()
  }

  if (!visible) return null

  return (
    <Card className="mb-2 w-[400px]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground rounded-full p-2">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Need Help?</h3>
              <h6 className="text-sm text-muted-foreground">Always online</h6>
            </div>
          </div>
          <Select onValueChange={handleModelChange} value={selectedModel}>
            <SelectTrigger className="w-[180px] border-none shadow-none">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Model</SelectLabel>
                {VALID_MODELS.map((modelOption) => (
                  <SelectItem key={modelOption.name} value={modelOption.name}>
                    {modelOption.display}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <ScrollArea
          className="h-[500px] pr-4"
          ref={scrollAreaRef}
          onScroll={handleScroll}
        >
          {totalMessages > offset && (
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={loadMoreMessages}
              disabled={isLoadingPreviousMessages}
            >
              {isLoadingPreviousMessages ? 'Loading...' : 'Load Previous Messages'}
            </Button>
          )}
          {chatHistory.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isResponseLoading && (
            <div className="flex w-max max-w-[75%] my-2">
              <div className="w-5 h-5 rounded-full animate-pulse bg-primary"></div>
            </div>
          )}
          <div ref={lastMessageRef} />
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            id="message"
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isResponseLoading}
            required
            ref={inputFieldRef}
          />
          <Button type="submit" size="icon" disabled={inputValue.length === 0 || isResponseLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

const ContentPage: React.FC = () => {
  const [chatboxExpanded, setChatboxExpanded] = useState(false)
  const [model, setModel] = useState<ValidModel | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<ValidModel>()
  const [isHovering, setIsHovering] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Uncomment the following line if you want to close the chatbox when clicking outside
        // setChatboxExpanded(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    const loadChromeStorage = async () => {
      if (!chrome) return
      const { getKeyModel, selectModel } = useChromeStorage()
      const selectedModel = await selectModel()
      const { model, apiKey } = await getKeyModel(selectedModel)
      setModel(model)
      setApiKey(apiKey)
      setSelectedModel(selectedModel)
    }

    loadChromeStorage()
  }, [])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        setChatboxExpanded(true);
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  const handleModelChange = async (newModel: ValidModel) => {
    const { setSelectModel } = useChromeStorage()
    await setSelectModel(newModel)
    setSelectedModel(newModel)
  }

  const openAiChat = () => {
    setChatboxExpanded(true);
  }

  const problemStatement = document.querySelector('meta[name=description]')?.getAttribute('content') || ''

  return (
    <div
      ref={containerRef}
      className="fixed bottom-8 right-8 z-50 flex flex-col items-end space-y-4"
    >
      {chatboxExpanded && (model && apiKey ? (
        <ChatBox
          visible={true}
          context={{ problemStatement }}
          model={model}
          apikey={apiKey}
          handleModelChange={handleModelChange}
          selectedModel={selectedModel}
        />
      ) : (
        <Card className="w-[400px] p-6">
          <CardContent className="text-center space-y-4">
            {!selectedModel ? (
              <>
                <p>Please configure the extension before using this feature.</p>
                <Button onClick={() => chrome.runtime.sendMessage({ action: 'openPopup' })}>
                  Configure
                </Button>
              </>
            ) : (
              <>
                <p>No API key found for the selected model: <strong>{selectedModel}</strong></p>
                <p>Please select another model or configure the API key.</p>
                <Select onValueChange={handleModelChange} value={selectedModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Model</SelectLabel>
                      {VALID_MODELS.map((modelOption) => (
                        <SelectItem key={modelOption.name} value={modelOption.name}>
                          {modelOption.display}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </>
            )}
          </CardContent>
        </Card>
      ))}
       <div className="relative">
        <Button
          size="icon"
          variant={chatboxExpanded ? "secondary" : "default"}
          onClick={() => setChatboxExpanded(!chatboxExpanded)}
          className="rounded-full h-12 w-12"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Bot className="h-6 w-6" />
        </Button>
        {isHovering && ( // Conditional rendering of tooltip
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-background text-foreground text-xs p-2 rounded shadow">
            Press Ctrl+Shift+A to toggle chat
          </div>
        )}
      </div>
    </div>
  )
}

export default ContentPage
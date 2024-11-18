import { outputSchema } from '@/schema/modeOutput'
import { z } from 'zod'

export type Roles =
  | 'function'
  | 'system'
  | 'user'
  | 'assistant'
  | 'data'
  | 'tool'

export interface ChatHistory {
  role: Roles
  content: string | z.infer<typeof outputSchema>
}

// parse ChatHistory to new interface where content if z.infer<typeof outputSchema> than make it string

export interface ChatHistoryParsed {
  role: Roles
  content: string
}

export const parseChatHistory = (
  chatHistory: ChatHistory[]
): ChatHistoryParsed[] => {
  return chatHistory.map((history) => {
    return {
      role: history.role,
      content:
        typeof history.content === 'string'
          ? history.content
          : JSON.stringify(history.content),
    }
  })
}

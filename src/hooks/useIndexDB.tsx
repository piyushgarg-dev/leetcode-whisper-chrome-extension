import { ChatHistory } from '@/interface/chatHistory'
import { getChatHistory, saveChatHistory } from '@/lib/indexedDB'

export const useIndexDB = () => {
  return {
    saveChatHistory: async (problemName: string, history: ChatHistory[]) => {
      await saveChatHistory(problemName, history)
    },

    fetchChatHistory: async (
      problemName: string,
      limit: number,
      offset: number
    ) => {
      return await getChatHistory(problemName, limit, offset)
    },
  }
}
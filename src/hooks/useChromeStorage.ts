import { ValidModel } from '@/constants/valid_modals'

export const useChromeStorage = () => {
  return {
    setKeyModel: async (apiKey: string, model: ValidModel) => {
      chrome.storage.local.set({ [model]: apiKey })
    },

    getKeyModel: async (model: ValidModel) => {
      const result = await chrome.storage.local.get(model)
      return { model: model, apiKey: result[model] }
    },

    setSelectModel: async (model: ValidModel) => {
      await chrome.storage.local.set({ ['selectedModel']: model })
    },

    selectModel: async () => {
      const result = await chrome.storage.local.get('selectedModel')
      return result['selectedModel'] as ValidModel
    },
  }
}

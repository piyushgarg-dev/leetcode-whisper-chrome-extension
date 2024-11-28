import { ModalInterface } from '@/interface/ModalInterface'
import { ValidModel } from '@/constants/valid_modals'

import { OpenAI_3_5_turbo } from '@/modals/modal/OpenAI_3_5_turbo'
import { GeminiAI_1_5_pro } from '@/modals/modal/GeminiAI_1_5_pro'
import { OpenAi_4o } from './modal/OpenAI_40'
import { GroqLlama70B } from './modal/GroqLlama70B'
import { GroqLlama90B } from './modal/GroqLlama90B'
import { GitHubGPT4o } from './modal/GitHubGPT4o'

/**
 * This object contains all the modals that are available in the extension.
 * @type {Record<ValidModel, ModalInterface>}
 */
export const modals: Record<ValidModel, ModalInterface> = {
  'openai_3.5_turbo': new OpenAI_3_5_turbo(),
  openai_4o: new OpenAi_4o(),
  'gemini_1.5_pro': new GeminiAI_1_5_pro(),
  'groq_llama70b': new GroqLlama70B(),
  'groq_llama90b': new GroqLlama90B(),
  'github_gpt4o': new GitHubGPT4o(),
}

/**
 * List of valid models that can be used in the application.
 */
export const VALID_MODELS = [
  {
    model: 'gpt-3.5-turbo',
    name: 'openai_3.5_turbo',
    display: 'GPT-3.5 Turbo',
  },
  {
    model: 'gpt-4o',
    name: 'openai_4o',
    display: 'GPT-4 Optimized',
  },
  {
    model: 'gemini-1.5-pro-latest',
    name: 'gemini_1.5_pro',
    display: 'Gemini 1.5 Pro (Latest)',
  },
  {
    model: 'llama-3.1-70b-versatile',
    name: 'groq_llama70b',
    display: 'Llama 3.1 70B',
  },
  {
    model: 'llama-3.2-90b-vision-preview',
    name: 'groq_llama90b',
    display: 'Llama 3.2 90B',
  },
  {
    model: 'gpt-4o',
    name: 'github_gpt4o',
    display: 'GitHub GPT-4o',
  },
]

/**
 * Type of valid models that can be used in the application.
 */
export type ValidModel = 'openai_3.5_turbo' | 'openai_4o' | 'gemini_1.5_pro' | 'groq_llama70b' | 'groq_llama90b' | 'github_gpt4o'

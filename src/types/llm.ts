// types/llm.ts
import { LLMService } from "@/service/llm";
export type LLMProvider = 'openai' | 'claude';


export interface LLMResponse {
  feedback: string;
  hints: string[];
  snippet?: string;
  programmingLanguage?: string;
}

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
}

export interface StorageData {
  provider?: LLMProvider;
  openaiKey?: string;
  claudeKey?: string;
}

export interface LLMContextType {
  llmService: LLMService | null;
  provider: LLMProvider;
  isLoading: boolean;
  error: string | null;
}

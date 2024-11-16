// context/LLMContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { LLMService } from '@/service/llm';
import { LLMConfig, LLMContextType, LLMProvider, StorageData } from '@/types/llm';

const LLMContext = createContext<LLMContextType | null>(null);

interface LLMContextProviderProps {
  children: React.ReactNode;
}

export const LLMContextProvider: React.FC<LLMContextProviderProps> = ({
  children
}) => {
  const [llmService, setLLMService] = useState<LLMService | null>(null);
  const [provider, setProvider] = useState<LLMProvider>('openai');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeLLM() {
      try {
        const data = await chrome.storage.local.get([
          'provider',
          'openaiKey',
          'claudeKey',
        ]) as StorageData;

        const selectedProvider = data.provider || 'openai';
        const apiKey = selectedProvider === 'openai'
          ? data.openaiKey
          : data.claudeKey;

        if (!apiKey) {
          setError('API key not found. Please set up your API key in the extension settings.');
          setIsLoading(false);
          return;
        }

        const config: LLMConfig = {
          provider: selectedProvider,
          apiKey,
        };

        const service = new LLMService(config);
        setLLMService(service);
        setProvider(selectedProvider);
      } catch (err) {
        setError('Failed to initialize LLM service');
        console.error('LLM initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initializeLLM();
  }, []);

  const contextValue: LLMContextType = {
    llmService,
    provider,
    isLoading,
    error,
  };

  return (
    <LLMContext.Provider value= { contextValue } >
    { children }
    </LLMContext.Provider>
  );
};

export const useLLM = (): LLMContextType => {
  const context = useContext(LLMContext);
  if (context === null) {
    throw new Error('useLLM must be used within an LLMContextProvider');
  }
  return context;
};

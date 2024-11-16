import OpenAI from 'openai';
import { MessageParam } from '@anthropic-ai/sdk/resources/messages.mjs';
import Anthropic from '@anthropic-ai/sdk';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { LLMConfig, LLMProvider, LLMResponse } from '@/types/llm';

export class LLMService {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private provider: LLMProvider;

  constructor(config: LLMConfig) {
    this.provider = config.provider;
    if (config.provider === 'openai') {
      this.openai = new OpenAI({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true,
      });
    } else if (config.provider === 'claude') {
      this.anthropic = new Anthropic({
        apiKey: config.apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
  }

  async generateResponse(
    systemPrompt: string,
    messages: ChatCompletionMessageParam[],
    userMessage: string,
    code: string
  ): Promise<LLMResponse> {
    if (this.openai && this.provider === 'openai') {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
          {
            role: 'user',
            content: `User Prompt: ${userMessage}\n\nCode: ${code}`,
          },
        ],
      });
      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.output;
    }

    if (this.anthropic && this.provider === 'claude') {
      // Convert the message history to Anthropic's format
      const anthropicMessages: MessageParam[] = [
        { role: 'user', content: systemPrompt }
      ];

      // Add formatted chat history
      messages.forEach(msg => {
        anthropicMessages.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content as string
        });
      });

      // Add the current user message
      anthropicMessages.push({
        role: 'user',
        content: `User Prompt: ${userMessage}\n\nCode: ${code}`
      });

      try {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4096,
          messages: anthropicMessages,
        });

        // Parse the response content
        console.log("Result: ", response)
        const result = JSON.parse(response.content[0].text || "")

        // Ensure the response matches our expected LLMResponse format
        return {
          feedback: result.output.feedback || '',
          hints: result.output.hints || [],
          snippet: result.output.snippet,
          programmingLanguage: result.output.programmingLanguage,
        };
      } catch (error) {
        console.error('Anthropic API error:', error);
        throw new Error('Failed to generate response from Claude');
      }
    }

    throw new Error(`No LLM provider configured for ${this.provider}`);
  }
}

import {
  GenerateResponseParamsType,
  GenerateResponseReturnType,
  ModalInterface,
} from '../../interface/ModalInterface'
import ModelClient, { ChatCompletionsOutput } from "@azure-rest/ai-inference"
import { AzureKeyCredential } from "@azure/core-auth"
import { VALID_MODELS } from '@/constants/valid_modals'

interface ErrorResponse {
  error?: {
    message: string;
  };
}

export class GitHubGPT4o implements ModalInterface {
  name = 'github_gpt4o'
  private readonly baseURL = 'https://models.inference.ai.azure.com'
  private client: ReturnType<typeof ModelClient> | null = null

  init(apiKey: string) {
    this.client = ModelClient(
      this.baseURL,
      new AzureKeyCredential(apiKey)
    )
  }

  async generateResponse(
    props: GenerateResponseParamsType
  ): GenerateResponseReturnType {
    try {
      if (!this.client) {
        throw new Error('Client not initialized')
      }

      const messages = [
        { role: "system", content: props.systemPrompt },
        ...props.messages,
        { role: "user", content: props.prompt }
      ]

      const response = await this.client.path("/chat/completions").post({
        body: {
          messages,
          model: VALID_MODELS.find((model) => model.name === this.name)?.model!,
          temperature: 1.0,
          top_p: 1.0,
          max_tokens: 1000,
        }
      })

      if (response.status !== "200") {
        const errorResponse = response.body as ErrorResponse;
        throw new Error(errorResponse.error?.message || 'Unknown error');
      }

      const successResponse = response.body as ChatCompletionsOutput;
      return {
        error: null,
        success: successResponse.choices[0].message.content,
      }
    } catch (error: any) {
      return { error, success: null }
    }
  }
}
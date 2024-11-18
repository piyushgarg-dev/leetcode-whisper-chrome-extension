import {
  GenerateResponseParamsType,
  GenerateResponseReturnType,
  ModalInterface,
} from '../../interface/ModalInterface'
import { createOpenAI } from '@ai-sdk/openai'
import { generateObjectResponce } from '../utils'
import { VALID_MODELS } from '@/constants/valid_modals'

export class OpenAI_3_5_turbo implements ModalInterface {
  name = 'openai_3.5_turbo'
  private apiKey: string = ''

  init(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(
    props: GenerateResponseParamsType
  ): GenerateResponseReturnType {
    try {
      const openai = createOpenAI({
        compatibility: 'strict',
        apiKey: this.apiKey,
      })

      let data = await generateObjectResponce({
        model: openai(
          VALID_MODELS.find((model) => model.name === this.name)?.model!
        ),
        messages: props.messages,
        systemPrompt: props.systemPrompt,
        prompt: props.prompt,
        extractedCode: props.extractedCode,
      })

      return {
        error: null,
        success: data.object,
      }
    } catch (error: any) {
      return { error, success: null }
    }
  }
}

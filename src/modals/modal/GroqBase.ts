import { GenerateResponseParamsType, GenerateResponseReturnType, ModalInterface } from '@/interface/ModalInterface'
import { createGroq } from '@ai-sdk/groq'
import { generateObjectResponce } from '../utils'
import { VALID_MODELS } from '@/constants/valid_modals'

export abstract class GroqBase implements ModalInterface {
  abstract name: string
  private apiKey: string = ''

  init(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateResponse(props: GenerateResponseParamsType): GenerateResponseReturnType {
    try {
      const groq = createGroq({
        apiKey: this.apiKey,
      })

      let data = await generateObjectResponce({
        model: groq(
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
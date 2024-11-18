import { z } from 'zod'
import { ValidModel } from '@/constants/valid_modals'
import { modals } from '@/modals'
import {
  GenerateResponseParamsType,
  ModalInterface,
} from '@/interface/ModalInterface'
import { outputSchema } from '@/schema/modeOutput'

/**
 * Service to manage and interact with modals.
 */
export class ModalService {
  /**
   * The currently active modal.
   * @private
   */
  private activeModal: ModalInterface | null = null

  /**
   * Selects a modal by its name and initializes it with an optional API key.
   * @param modalName - The name of the modal to select.
   * @param apiKey - An optional API key to initialize the modal with.
   * @throws Will throw an error if the modal with the given name is not found.
   */
  selectModal(modalName: ValidModel, apiKey?: string) {
    if (modals[modalName]) {
      this.activeModal = modals[modalName]
      this.activeModal.init(apiKey)
    } else {
      throw new Error(`Modal "${modalName}" not found`)
    }
  }

  /**
   * Generates a response using the currently active modal.
   * @param props - The parameters required to generate the response.
   * @returns A promise that resolves to an object containing either an error or the successful response.
   * @throws Will throw an error if no modal is selected.
   */
  async generate(props: GenerateResponseParamsType): Promise<
    Promise<{
      error: Error | null
      success: z.infer<typeof outputSchema> | null
    }>
  > {
    if (!this.activeModal) {
      throw new Error('No modal selected')
    }
    return this.activeModal.generateResponse(props)
  }
}

import {
  GenerateResponseParamsType,
  GenerateResponseReturnType,
  ModalInterface,
} from '../interface/ModalInterface'

/**
 * Abstract base class for modals that interact with an API.
 * This class is the base class for all modals.
 * It implements the interface defined above.
 * It provides a base implementation for the `generateResponse` method.
 * It also defines an abstract method that must be implemented by all subclasses.
 * 
 * @abstract
 * @extends {ModalInterface}
 */
export abstract class BaseModal extends ModalInterface {
  /**
   * The API key used for making API calls.
   * 
   * @protected
   * @type {string}
   */
  protected apiKey: string = ''

  /**
   * Initializes the modal with the provided API key.
   * 
   * @param {string} apiKey - The API key to be used for API calls.
   */
  init(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Makes an API call with the provided parameters.
   * 
   * @protected
   * @abstract
   * @param {GenerateResponseParamsType} props - The parameters for the API call.
   * @returns {GenerateResponseReturnType} The response from the API call.
   */
  protected abstract makeApiCall(
    props: GenerateResponseParamsType
  ): GenerateResponseReturnType

  /**
   * Generates a response by making an API call with the provided parameters.
   * 
   * @async
   * @param {GenerateResponseParamsType} props - The parameters for the API call.
   * @returns {Promise<GenerateResponseReturnType>} The response from the API call.
   */
  async generateResponse(
    props: GenerateResponseParamsType
  ): GenerateResponseReturnType {
    return this.makeApiCall(props)
  }
}

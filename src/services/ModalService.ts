import { z } from 'zod';
import { ValidModel } from '@/constants/valid_modals';
import { modals } from '@/modals';
import {
  GenerateResponseParamsType,
  ModalInterface,
} from '@/interface/ModalInterface';
import { outputSchema } from '@/schema/modeOutput';

/**
 * Service to manage and interact with modals.
 */
export class ModalService {
  private activeModal: ModalInterface | null = null;
  private abortController: AbortController | null = null;
  private isGenerating: boolean = false;
  private activeGenerationId: string | null = null; // Track active generation ID

  selectModal(modalName: ValidModel, apiKey?: string) {
    if (modals[modalName]) {
      this.activeModal = modals[modalName];
      this.activeModal.init(apiKey);
    } else {
      throw new Error(`Modal "${modalName}" not found`);
    }
  }

  async generate(props: GenerateResponseParamsType): Promise<{
    error: Error | null;
    success: z.infer<typeof outputSchema> | null;
  }> {
    if (!this.activeModal) {
      throw new Error('No modal selected');
    }

    if (this.isGenerating) {
      this.stopGeneration();
    }

    this.abortController = new AbortController();
    this.isGenerating = true;
    this.activeGenerationId = Date.now().toString(); // Unique ID for this generation

    try {
      const currentGenerationId = this.activeGenerationId; // Capture ID for this request
      const response = await this.activeModal.generateResponse({
        ...props,
        signal: this.abortController.signal,
      });

      // Ignore response if generation ID has changed
      if (this.activeGenerationId !== currentGenerationId) {
        console.log('Generation response ignored: Stopped or superseded');
        return { error: null, success: null };
      }

      return response;
    } catch (error:any) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { error: new Error('Generation stopped by user'), success: null };
      }
      return {
        error: new Error(`Generation failed: ${error.message}`),
        success: null,
      };
    } finally {
      this.isGenerating = false;
      this.abortController = null;
    }
  }

  stopGeneration(): boolean {
    if (this.isGenerating && this.abortController) {
      this.abortController.abort();
      this.isGenerating = false;
      this.activeGenerationId = null; // Invalidate generation ID
      return true;
    }
    return false;
  }
}


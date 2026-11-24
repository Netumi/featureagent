import { geminiService } from './gemini.service';
import { promptLoader } from './prompt-loader.service';
import { DocumentationData } from './documentation.service';

export interface MockupResult {
  tsxCode: string;
  cssCode?: string;
}

const MOCKUP_JSON_SCHEMA = {
  type: 'object',
  properties: {
    tsxCode: {
      type: 'string',
      description: 'Complete, fully functional React component TSX code'
    },
    cssCode: {
      type: 'string',
      description: 'Optional custom CSS styling'
    }
  },
  required: ['tsxCode']
};

export class MockupService {
  public async generateMockup(
    doc: DocumentationData,
    screenshotAnalysis: string,
    images?: { path: string; mimetype: string }[]
  ): Promise<MockupResult> {
    const prompt = promptLoader.loadPrompt('mockup-generation.md', {
      featureName: doc.featureName,
      featureDescription: doc.featureDescription,
      documentationSummary: JSON.stringify({
        userBenefits: doc.userBenefits,
        conditions: doc.conditionsOfSatisfaction
      }),
      screenshotAnalysis: screenshotAnalysis || 'Brak zrzutów ekranu.'
    });

    const rawResponse = await geminiService.generateText(prompt, images, {
      jsonSchema: MOCKUP_JSON_SCHEMA,
      maxOutputTokens: 16384
    });
    const parsed = geminiService.extractJson(rawResponse);
    return {
      tsxCode: parsed.tsxCode || '// Brak kodu TSX',
      cssCode: parsed.cssCode || ''
    };
  }

  public async editMockup(
    existingTsx: string,
    existingCss: string,
    instruction: string,
    featureContext: string
  ): Promise<MockupResult> {
    const prompt = promptLoader.loadPrompt('mockup-editing.md', {
      existingTsx,
      existingCss: existingCss || '',
      instruction,
      featureContext
    });

    const rawResponse = await geminiService.generateText(prompt, undefined, {
      jsonSchema: MOCKUP_JSON_SCHEMA,
      maxOutputTokens: 16384
    });
    const parsed = geminiService.extractJson(rawResponse);
    return {
      tsxCode: parsed.tsxCode || existingTsx,
      cssCode: parsed.cssCode || existingCss
    };
  }
}

export const mockupService = new MockupService();

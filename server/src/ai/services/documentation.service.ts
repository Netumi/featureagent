import { geminiService } from './gemini.service';
import { promptLoader } from './prompt-loader.service';

export interface DocumentationData {
  featureName: string;
  featureDescription: string;
  assumptions: string[];
  dependencies: string[];
  risks: string[];
  userBenefits: string[];
  conditionsOfSatisfaction: string[];
  successMetrics: string[];
  openQuestions: string[];
  completenessScore: number;
  missingInformation: string[];
  keyDecisions: string[];
}

const DOCUMENTATION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    featureName: { type: 'string' },
    featureDescription: { type: 'string' },
    assumptions: { type: 'array', items: { type: 'string' } },
    dependencies: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    userBenefits: { type: 'array', items: { type: 'string' } },
    conditionsOfSatisfaction: { type: 'array', items: { type: 'string' } },
    successMetrics: { type: 'array', items: { type: 'string' } },
    openQuestions: { type: 'array', items: { type: 'string' } },
    completenessScore: { type: 'number' },
    missingInformation: { type: 'array', items: { type: 'string' } },
    keyDecisions: { type: 'array', items: { type: 'string' } }
  },
  required: [
    'featureName',
    'featureDescription',
    'assumptions',
    'dependencies',
    'risks',
    'userBenefits',
    'conditionsOfSatisfaction',
    'successMetrics',
    'openQuestions',
    'completenessScore',
    'missingInformation',
    'keyDecisions'
  ]
};

export class DocumentationService {
  public async analyzeScreenshots(images: { path: string; mimetype: string }[]): Promise<string> {
    if (!images || images.length === 0) return 'Brak zrzutów ekranu.';
    const prompt = promptLoader.loadPrompt('screenshot-analysis.md');
    const result = await geminiService.generateText(prompt, images);
    return result;
  }

  public async generateDocumentation(
    featureIdea: string,
    additionalContext: string,
    images: { path: string; mimetype: string }[]
  ): Promise<DocumentationData> {
    let screenshotAnalysis = 'Brak analizy zrzutów ekranu.';
    if (images && images.length > 0) {
      try {
        screenshotAnalysis = await this.analyzeScreenshots(images);
      } catch (err) {
        console.error('Screenshot analysis failed, proceeding without it:', err);
      }
    }

    const prompt = promptLoader.loadPrompt('feature-documentation.md', {
      featureIdea,
      additionalContext: additionalContext || 'Brak dodatkowego kontekstu.',
      screenshotAnalysis
    });

    const rawResponse = await geminiService.generateText(prompt, images, {
      jsonSchema: DOCUMENTATION_JSON_SCHEMA,
      maxOutputTokens: 16384
    });
    const parsedData = geminiService.extractJson(rawResponse);
    return parsedData as DocumentationData;
  }

  public async editDocumentation(
    existingDocumentation: DocumentationData,
    instruction: string
  ): Promise<DocumentationData> {
    const prompt = promptLoader.loadPrompt('documentation-editing.md', {
      existingDocumentation: JSON.stringify(existingDocumentation, null, 2),
      instruction
    });

    const rawResponse = await geminiService.generateText(prompt, undefined, {
      jsonSchema: DOCUMENTATION_JSON_SCHEMA,
      maxOutputTokens: 16384
    });
    const parsedData = geminiService.extractJson(rawResponse);
    return parsedData as DocumentationData;
  }

  public async regenerateSection(
    sectionKey: string,
    existingDocumentation: DocumentationData
  ): Promise<any> {
    const prompt = promptLoader.loadPrompt('section-regeneration.md', {
      sectionKey,
      existingDocumentation: JSON.stringify(existingDocumentation, null, 2)
    });

    const rawResponse = await geminiService.generateText(prompt, undefined, {
      maxOutputTokens: 16384
    });
    const parsedData = geminiService.extractJson(rawResponse);
    return parsedData.sectionValue !== undefined ? parsedData.sectionValue : parsedData;
  }
}

export const documentationService = new DocumentationService();

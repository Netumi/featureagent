import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const serverEnvPath = path.join(__dirname, '../../.env');
const rootEnvPath = path.join(__dirname, '../../../.env');
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath, override: true });
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath, override: true });
} else {
  dotenv.config({ override: true });
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private primaryModel: string;
  private fallbackModels: string[];

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('WARNING: GEMINI_API_KEY is not set in environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

    // Read models from environment (GEMINI_MODELS or GEMINI_MODEL comma-separated list).
    const modelsEnv = process.env.GEMINI_MODELS || process.env.GEMINI_MODEL;
    if (modelsEnv) {
      this.fallbackModels = modelsEnv.split(',').map(m => m.trim()).filter(Boolean);
    } else {
      this.fallbackModels = [
        'gemini-3.6-flash',
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash-lite'
      ];
    }
    this.primaryModel = this.fallbackModels[0] || 'gemini-3.1-flash-lite';
    this.primaryModel = this.fallbackModels[0] || 'gemini-3.6-flash';

    console.log(`[GeminiService] Configured Primary Model: ${this.primaryModel}`);
    console.log(`[GeminiService] Fallback Chain: ${this.fallbackModels.join(', ')}`);
  }

  public async generateText(
    prompt: string,
    images?: { path: string; mimetype: string }[],
    options?: {
      jsonSchema?: any;
      maxOutputTokens?: number;
    }
  ): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the backend. Please check your .env file.');
    }

    let lastError: any = null;

    for (const modelName of this.fallbackModels) {
      let attempt = 1;
      const maxAttempts = 3; // 1 initial + 2 retries

      while (attempt <= maxAttempts) {
        try {
          console.log(`[GeminiService] 🚀 Sending generation request to model: ${modelName} (Attempt ${attempt}/${maxAttempts})`);
          const generationConfig: any = {
            maxOutputTokens: options?.maxOutputTokens || 16384
          };

          if (options?.jsonSchema) {
            generationConfig.responseMimeType = 'application/json';
            generationConfig.responseSchema = options.jsonSchema;
          }

          const model = this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig
          });
          const contents: any[] = [];

          if (images && images.length > 0) {
            for (const img of images) {
              const fileBuffer = fs.readFileSync(img.path);
              const base64Data = fileBuffer.toString('base64');
              contents.push({
                inlineData: {
                  data: base64Data,
                  mimeType: img.mimetype
                }
              });
            }
          }

          contents.push(prompt);

          const result = await model.generateContent(contents);
          const response = await result.response;
          const text = response.text();

          if (!text) {
            throw new Error('Empty response received from Gemini API.');
          }
          console.log(`[GeminiService] ✅ Successfully generated response using model: ${modelName}`);
          return text;
        } catch (error: any) {
          lastError = error;
          const errMessage = error.message || String(error);
          console.warn(`[GeminiService] ⚠️ Model ${modelName} failed on attempt ${attempt}: ${errMessage}`);

          attempt++;
          if (attempt <= maxAttempts) {
            // 30s after 1st failure, 1m 10s (70s) after 2nd failure
            const delayMs = attempt === 2 ? 30000 : 70000;
            console.log(`[GeminiService] Waiting ${delayMs / 1000}s before retry for model ${modelName}...`);
            await new Promise(res => setTimeout(res, delayMs));
          } else {
            console.log(`[GeminiService] 🔄 Max attempts reached for ${modelName}. Moving to next model in fallback chain...`);
            break;
          }
        }
      }
    }

    console.error('[GeminiService] ❌ All Gemini models and retries failed:', lastError);
    throw new Error(`Gemini API Error (model: ${this.primaryModel}): ${lastError?.message || lastError}`);
  }

  public extractJson(text: string): any {
    try {
      return JSON.parse(text);
    } catch (e) {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const content = jsonMatch && jsonMatch[1] ? jsonMatch[1].trim() : text;

      try {
        return JSON.parse(content);
      } catch (e2) {
        const firstBrace = content.indexOf('{');
        const lastBrace = content.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const sub = content.substring(firstBrace, lastBrace + 1);
          try {
            return JSON.parse(sub);
          } catch (e3) {
            // ignore
          }
        }

        // Fallback: try extracting tsxCode via regex if JSON is truncated
        const tsxMatch = content.match(/"tsxCode"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"|"\s*\}|$)/);
        if (tsxMatch && tsxMatch[1]) {
          try {
            const tsxCode = tsxMatch[1]
              .replace(/\\n/g, '\n')
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, '\\');
            return { tsxCode, cssCode: '' };
          } catch (ex) {
            // ignore
          }
        }

        throw new Error('Failed to parse JSON from Gemini response: ' + text.substring(0, 200));
      }
    }
  }
}

export const geminiService = new GeminiService();

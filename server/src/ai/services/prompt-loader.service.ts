import fs from 'fs';
import path from 'path';

export class PromptLoaderService {
  private getPromptsDir(): string {
    const candidates = [
      path.join(__dirname, '../prompts'),
      path.join(__dirname, '../../src/ai/prompts'),
      path.resolve(process.cwd(), 'src/ai/prompts'),
      path.resolve(process.cwd(), 'server/src/ai/prompts')
    ];

    for (const dir of candidates) {
      if (fs.existsSync(dir)) {
        return dir;
      }
    }
    return candidates[0];
  }

  public loadPrompt(promptFileName: string, variables: Record<string, string> = {}): string {
    const promptsDir = this.getPromptsDir();
    const filePath = path.join(promptsDir, promptFileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Prompt file not found: ${promptFileName} in ${promptsDir}`);
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      content = content.replace(regex, value || '');
    }

    return content;
  }
}

export const promptLoader = new PromptLoaderService();

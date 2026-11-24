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

  private validateFilename(filename: string): string {
    const promptsDir = this.getPromptsDir();
    const safeName = path.basename(filename);
    const filePath = path.join(promptsDir, safeName);
    if (!path.resolve(filePath).startsWith(path.resolve(promptsDir))) {
      throw new Error('Invalid filename');
    }
    return filePath;
  }

  public listPrompts(): string[] {
    const promptsDir = this.getPromptsDir();
    if (!fs.existsSync(promptsDir)) return [];
    return fs.readdirSync(promptsDir).filter(f => f.endsWith('.md')).sort();
  }

  public getPromptContent(filename: string): string {
    const filePath = this.validateFilename(filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Prompt file not found: ${filename}`);
    }
    const fullContent = fs.readFileSync(filePath, 'utf-8');
    return this.extractEditableContent(filename, fullContent);
  }

  public savePromptContent(filename: string, editableContent: string): void {
    const filePath = this.validateFilename(filename);
    let originalFullContent = '';
    if (fs.existsSync(filePath)) {
      originalFullContent = fs.readFileSync(filePath, 'utf-8');
    }
    const fullContent = this.mergePromptContent(filename, originalFullContent, editableContent);
    fs.writeFileSync(filePath, fullContent, 'utf-8');
  }

  private isImmutableSection(filename: string, headerText: string): boolean {
    if (
      headerText.startsWith('output') ||
      headerText.startsWith('input') ||
      headerText.startsWith('context')
    ) {
      return true;
    }
    if (
      (filename === 'mockup-generation.md' || filename === 'mockup-editing.md') &&
      headerText.startsWith('requirements')
    ) {
      return true;
    }
    return false;
  }

  private extractEditableContent(filename: string, fullContent: string): string {
    const lines = fullContent.split(/\r?\n/);
    const resultLines: string[] = [];
    let skip = false;

    for (const line of lines) {
      if (line.startsWith('# ')) {
        const headerText = line.replace(/^#\s+/, '').trim().toLowerCase();
        if (this.isImmutableSection(filename, headerText)) {
          skip = true;
        } else {
          skip = false;
        }
      }
      if (!skip) {
        resultLines.push(line);
      }
    }
    return resultLines.join('\n').trim();
  }

  private mergePromptContent(filename: string, originalFullContent: string, newEditableContent: string): string {
    const originalLines = originalFullContent.split(/\r?\n/);
    const immutableSections: string[] = [];
    let currentImmutableLines: string[] = [];
    let capturing = false;

    for (const line of originalLines) {
      if (line.startsWith('# ')) {
        if (capturing && currentImmutableLines.length > 0) {
          immutableSections.push(currentImmutableLines.join('\n'));
          currentImmutableLines = [];
        }
        const headerText = line.replace(/^#\s+/, '').trim().toLowerCase();
        if (this.isImmutableSection(filename, headerText)) {
          capturing = true;
          currentImmutableLines.push(line);
        } else {
          capturing = false;
        }
      } else if (capturing) {
        currentImmutableLines.push(line);
      }
    }
    if (capturing && currentImmutableLines.length > 0) {
      immutableSections.push(currentImmutableLines.join('\n'));
    }

    const trimmedEditable = newEditableContent.trim();
    if (immutableSections.length === 0) {
      return trimmedEditable;
    }

    return trimmedEditable + '\n\n' + immutableSections.join('\n\n') + '\n';
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

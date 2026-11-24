import { DocumentationData, MockupData } from '../types';

export const apiService = {
  async generateDocumentation(
    featureIdea: string,
    additionalContext: string,
    generateMockup: boolean,
    screenshots: File[]
  ): Promise<{ documentation: DocumentationData; mockup: MockupData | null }> {
    const formData = new FormData();
    formData.append('featureIdea', featureIdea);
    if (additionalContext) {
      formData.append('additionalContext', additionalContext);
    }
    formData.append('generateMockup', generateMockup ? 'true' : 'false');

    screenshots.forEach(file => {
      formData.append('screenshots', file);
    });

    const res = await fetch('/api/generate-documentation', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Błąd generowania dokumentacji.');
    }
    return {
      documentation: data.documentation,
      mockup: data.mockup
    };
  },

  async editDocumentation(documentation: DocumentationData, instruction: string): Promise<DocumentationData> {
    const res = await fetch('/api/edit-documentation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentation, instruction })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Błąd edycji dokumentacji przez AI.');
    return data.documentation;
  },

  async regenerateSection(sectionKey: string, documentation: DocumentationData): Promise<any> {
    const res = await fetch('/api/regenerate-section', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionKey, documentation })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Błąd regeneracji sekcji.');
    return data.sectionValue;
  },

  async generateMockup(documentation: DocumentationData, screenshots: File[]): Promise<MockupData> {
    const formData = new FormData();
    formData.append('documentation', JSON.stringify(documentation));
    screenshots.forEach(file => {
      formData.append('screenshots', file);
    });

    const res = await fetch('/api/generate-mockup', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Błąd generowania makiety.');
    return data.mockup;
  },

  async editMockup(existingTsx: string, existingCss: string, instruction: string, featureContext: string): Promise<MockupData> {
    const res = await fetch('/api/edit-mockup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ existingTsx, existingCss, instruction, featureContext })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Błąd edycji makiety przez AI.');
    return data.mockup;
  },

  async exportDocumentation(documentation: DocumentationData, format: string = 'markdown'): Promise<Blob> {
    const res = await fetch('/api/export-documentation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentation, format })
    });
    if (!res.ok) throw new Error('Błąd eksportu dokumentacji.');
    return await res.blob();
  },

  async getPrompts(): Promise<string[]> {
    const res = await fetch('/api/prompts');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Błąd pobierania listy promptów.');
    return data.prompts;
  },

  async getPromptContent(filename: string): Promise<string> {
    const res = await fetch(`/api/prompts/${encodeURIComponent(filename)}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Błąd pobierania treści promptu.');
    return data.content;
  },

  async savePromptContent(filename: string, content: string): Promise<void> {
    const res = await fetch(`/api/prompts/${encodeURIComponent(filename)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Błąd zapisu promptu.');
  }
};

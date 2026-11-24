import React, { useState } from 'react';
import { Header } from './components/Header';
import { LeftPanel } from './components/LeftPanel';
import { DocumentationPanel } from './components/DocumentationPanel';
import { MockupPanel } from './components/MockupPanel';
import { DocumentationData, MockupData } from './types';
import { apiService } from './services/api.service';
import { AlertCircle, Sparkles } from 'lucide-react';

export function App() {
  const [documentation, setDocumentation] = useState<DocumentationData | null>(null);
  const [mockup, setMockup] = useState<MockupData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (
    featureIdea: string,
    additionalContext: string,
    generateMockup: boolean,
    screenshots: File[]
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.generateDocumentation(
        featureIdea,
        additionalContext,
        generateMockup,
        screenshots
      );
      setDocumentation(result.documentation);
      setMockup(result.mockup);
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd podczas generowania dokumentacji.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiEditDoc = async (instruction: string) => {
    if (!documentation) return;
    setIsLoading(true);
    setError(null);
    try {
      const updated = await apiService.editDocumentation(documentation, instruction);
      setDocumentation(updated);
    } catch (err: any) {
      setError(err.message || 'Błąd edycji dokumentacji przez AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiEditMockup = async (instruction: string) => {
    if (!mockup || !documentation) return;
    setIsLoading(true);
    setError(null);
    try {
      const updated = await apiService.editMockup(
        mockup.tsxCode,
        mockup.cssCode || '',
        instruction,
        documentation.featureDescription
      );
      setMockup(updated);
    } catch (err: any) {
      setError(err.message || 'Błąd edycji makiety przez AI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSection = async (sectionKey: string) => {
    if (!documentation) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedSectionValue = await apiService.regenerateSection(sectionKey, documentation);
      setDocumentation({
        ...documentation,
        [sectionKey]: updatedSectionValue
      });
    } catch (err: any) {
      setError(err.message || 'Błąd regeneracji sekcji.');
    } finally {
      setIsLoading(false);
    }
  };

    const handleRegenerateMockup = async () => {
    if (!documentation) return;
    setIsLoading(true);
    setError(null);
    try {
      const newMockup = await apiService.generateMockup(documentation, []);
      setMockup(newMockup);
    } catch (err: any) {
      setError(err.message || 'Błąd regeneracji makiety.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!documentation) return;
    try {
      const blob = await apiService.exportDocumentation(documentation, 'markdown');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentation.featureName || 'feature'}-documentation.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Błąd eksportu.');
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-gray-100 font-sans relative">
      <Header />

      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center justify-between text-red-700 text-sm shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-xs">
            ✕ Zamknij
          </button>
        </div>
      )}

      {/* Main 3-Panel Layout */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row lg:overflow-hidden">
        <LeftPanel
          onGenerate={handleGenerate}
          onAiEditDoc={handleAiEditDoc}
          onAiEditMockup={handleAiEditMockup}
          isLoading={isLoading}
          hasDocumentation={!!documentation}
          hasMockup={!!mockup}
        />

        <DocumentationPanel
          documentation={documentation}
          onUpdateDocumentation={setDocumentation}
          onRegenerateSection={handleRegenerateSection}
          onExport={handleExport}
          isLoading={isLoading}
        />

        {mockup && (
          <MockupPanel
            mockup={mockup}
            onRegenerateMockup={handleRegenerateMockup}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Floating Global AI Loading Indicator */}
      {isLoading && <LoadingIndicator />}
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-medium animate-bounce">
      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
        <span>Generowanie...</span>
      </div>
    </div>
  );
}

export default App;

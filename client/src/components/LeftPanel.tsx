import React, { useState, useEffect } from 'react';
import { Upload, Sparkles, X, MessageSquare, Settings } from 'lucide-react';

interface LeftPanelProps {
  onGenerate: (featureIdea: string, additionalContext: string, generateMockup: boolean, screenshots: File[]) => void;
  onAiEditDoc: (instruction: string) => void;
  onAiEditMockup: (instruction: string) => void;
  onOpenSettings: () => void;
  isLoading: boolean;
  hasDocumentation: boolean;
  hasMockup: boolean;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  onGenerate,
  onAiEditDoc,
  onAiEditMockup,
  onOpenSettings,
  isLoading,
  hasDocumentation,
  hasMockup
}) => {
  const [featureIdea, setFeatureIdea] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [generateMockup, setGenerateMockup] = useState(true);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<string[]>([]);

  const [aiDocInstruction, setAiDocInstruction] = useState('');
  const [aiMockupInstruction, setAiMockupInstruction] = useState('');

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      let added = false;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            const imageFile = new File([file], `screenshot-${Date.now()}.png`, { type: file.type || 'image/png' });
            setScreenshots(prev => [...prev, imageFile]);
            const previewUrl = URL.createObjectURL(imageFile);
            setScreenshotPreviews(prev => [...prev, previewUrl]);
            added = true;
          }
        }
      }
      if (added) {
        e.preventDefault();
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setScreenshots(prev => [...prev, ...filesArray]);

      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setScreenshotPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
    setScreenshotPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureIdea.trim()) return;
    onGenerate(featureIdea, additionalContext, generateMockup, screenshots);
  };

  const handleDocEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiDocInstruction.trim()) return;
    onAiEditDoc(aiDocInstruction);
    setAiDocInstruction('');
  };

  const handleMockupEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiMockupInstruction.trim()) return;
    onAiEditMockup(aiMockupInstruction);
    setAiMockupInstruction('');
  };

  return (
    <div className="w-full lg:w-96 lg:shrink-0 lg:h-full min-h-0 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-5 flex flex-col gap-6 overflow-y-auto shadow-md">
      {/* Initial Generation Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
            Opis pomysłu na funkcję <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={6}
            value={featureIdea}
            onChange={e => setFeatureIdea(e.target.value)}
            placeholder="np. Eksport raportów finansowych do formatu CSV z zaawansowanym filtrowaniem po zakresie dat, kategorii i kwotach, oraz widokiem podsumowania w tabeli..."
            className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs resize-y"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
            Dodatkowy kontekst / Wytyczne
          </label>
          <textarea
            rows={4}
            value={additionalContext}
            onChange={e => setAdditionalContext(e.target.value)}
            placeholder="np. Wymagane uprawnienia administratora, integracja z zewnętrznym API bankowym, responsywny design mobilny..."
            className="w-full p-3 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xs resize-y"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider mb-1.5">
            Zrzuty ekranu / Referencje (opcjonalnie)
          </label>
          <div className="mt-1 flex justify-center px-4 pt-4 pb-4 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
            <label className="space-y-1.5 text-center cursor-pointer w-full">
              <Upload className="mx-auto h-7 w-7 text-gray-400" />
              <div className="text-xs text-gray-600">
                <span className="font-semibold text-blue-600 hover:text-blue-500">Prześlij pliki</span>, upuść lub wklej (<span className="font-semibold text-gray-800">Ctrl+V</span>)
              </div>
              <p className="text-[11px] text-gray-500">PNG, JPG do 5MB (max 5 plików)</p>
              <input type="file" multiple accept="image/*" onChange={handleFileChange} className="sr-only" />
            </label>
          </div>

          {screenshotPreviews.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {screenshotPreviews.map((src, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square shadow-xs">
                  <img src={src} alt="screenshot" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(index)}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="generateMockupToggle"
            checked={generateMockup}
            onChange={e => setGenerateMockup(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
          />
          <label htmlFor="generateMockupToggle" className="text-sm font-medium text-gray-800 select-none cursor-pointer">
            Wygeneruj makietę UI
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !featureIdea.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? 'Generowanie...' : 'Generuj Dokumentację i Makietę UI'}
        </button>
      </form>

      {/* AI Assistant Actions when Documentation exists */}
      {hasDocumentation && (
        <div className="border-t border-gray-200 pt-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            Asystent AI – Edycja dokumentacji
          </h3>
          <form onSubmit={handleDocEditSubmit} className="flex flex-col gap-2.5">
            <textarea
              rows={3}
              value={aiDocInstruction}
              onChange={e => setAiDocInstruction(e.target.value)}
              placeholder="np. Dodaj eksport do PDF i zaktualizuj sekcję ryzyk..."
              className="w-full p-2.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y"
            />
            <button
              type="submit"
              disabled={isLoading || !aiDocInstruction.trim()}
              className="bg-slate-800 hover:bg-slate-900 disabled:bg-slate-400 text-white font-medium py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Zaktualizuj dokumentację przez AI
            </button>
          </form>

          {hasMockup && (
            <>
              <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5 pt-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Asystent AI – Edycja makiety UI
              </h3>
              <form onSubmit={handleMockupEditSubmit} className="flex flex-col gap-2.5">
                <textarea
                  rows={3}
                  value={aiMockupInstruction}
                  onChange={e => setAiMockupInstruction(e.target.value)}
                  placeholder="np. Dodaj filtr tabeli nad listą w dwóch kolumnach..."
                  className="w-full p-2.5 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
                />
                <button
                  type="submit"
                  disabled={isLoading || !aiMockupInstruction.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Zaktualizuj makietę przez AI
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Settings Button in Bottom Left Corner */}
      <div className="pt-2 mt-auto border-t border-gray-200">
        <button
          type="button"
          onClick={onOpenSettings}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer shadow-xs border border-gray-200"
        >
          <Settings className="w-4 h-4 text-gray-600" />
          <span>Ustawienia</span>
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Check, AlertCircle, BookOpen, Loader2 } from 'lucide-react';
import { apiService } from '../services/api.service';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROMPT_DISPLAY_NAMES: Record<string, string> = {
  'consistency-check.md': 'Kontrola spójności',
  'documentation-editing.md': 'Edycja dokumentacji',
  'feature-documentation.md': 'Generowanie dokumentacji',
  'mockup-editing.md': 'Edycja makiety',
  'mockup-generation.md': 'Generowanie makiety',
  'screenshot-analysis.md': 'Analiza zrzutów ekranu',
  'section-regeneration.md': 'Regeneracja sekcji'
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [prompts, setPrompts] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadPromptsList();
    }
  }, [isOpen]);

  const loadPromptsList = async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const list = await apiService.getPrompts();
      setPrompts(list);
      if (list.length > 0 && !selectedPrompt) {
        selectPrompt(list[0]);
      } else if (selectedPrompt && list.includes(selectedPrompt)) {
        selectPrompt(selectedPrompt);
      } else if (list.length > 0) {
        selectPrompt(list[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Nie udało się pobrać listy promptów.');
    } finally {
      setIsLoadingList(false);
    }
  };

  const selectPrompt = async (filename: string) => {
    setSelectedPrompt(filename);
    setIsLoadingContent(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const text = await apiService.getPromptContent(filename);
      setContent(text);
      setOriginalContent(text);
    } catch (err: any) {
      setError(err.message || 'Nie udało się pobrać treści promptu.');
    } finally {
      setIsLoadingContent(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPrompt) return;
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await apiService.savePromptContent(selectedPrompt, content);
      setOriginalContent(content);
      setSuccessMessage('Zapisano pomyślnie!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Nie udało się zapisać promptu.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const hasChanges = content !== originalContent;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[82vh] flex flex-col overflow-hidden border border-gray-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Biblioteka promptów</h2>
              <p className="text-xs text-gray-500">Zarządzaj i edytuj szablony promptów systemowych</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {successMessage && (
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-4 h-4" />
                {successMessage}
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={!selectedPrompt || isSaving || !hasChanges}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Zapisz zmiany
            </button>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
              title="Zamknij"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-b border-red-200 px-6 py-2.5 flex items-center gap-2 text-red-700 text-xs shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body: Split view */}
        <div className="flex-1 flex min-h-0">
          {/* Left Sidebar: Prompts list */}
          <div className="w-72 bg-gray-50/70 border-r border-gray-200 flex flex-col shrink-0">
            <div className="p-3.5 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
              Biblioteka promptów ({prompts.length})
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingList ? (
                <div className="flex items-center justify-center py-10 text-gray-400 text-xs gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ładowanie promptów...
                </div>
              ) : prompts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-xs">Brak promptów</div>
              ) : (
                prompts.map(filename => {
                  const displayName = PROMPT_DISPLAY_NAMES[filename] || filename;
                  return (
                    <button
                      key={filename}
                      onClick={() => selectPrompt(filename)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                        selectedPrompt === filename
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-gray-700 hover:bg-gray-200/60'
                      }`}
                    >
                      <FileText className={`w-4 h-4 shrink-0 ${selectedPrompt === filename ? 'text-white' : 'text-gray-500'}`} />
                      <span className="truncate">{displayName}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Area: Prompt Editor */}
          <div className="flex-1 flex flex-col min-h-0 bg-white p-5">
            {selectedPrompt ? (
              <div className="flex-1 flex flex-col min-h-0 gap-2">
                <div className="flex items-center justify-between shrink-0">
                  <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    Edycja pliku: <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-900 font-mono">{selectedPrompt}</code>
                  </span>
                  {hasChanges && (
                    <span className="text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      Niezapisane zmiany
                    </span>
                  )}
                </div>

                <div className="flex-1 relative min-h-0">
                  {isLoadingContent ? (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center text-gray-500 text-xs gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      Ładowanie treści promptu...
                    </div>
                  ) : null}
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full h-full p-4 font-mono text-xs text-gray-800 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none leading-relaxed shadow-inner"
                    placeholder="Treść promptu..."
                    spellCheck={false}
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Wybierz prompt z listy po lewej stronie
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { DocumentationData } from '../types';
import { Edit2, RefreshCw, Save, X, Download, Sparkles, Maximize2, Minimize2, Copy, Check } from 'lucide-react';

interface DocumentationPanelProps {
  documentation: DocumentationData | null;
  onUpdateDocumentation: (newDoc: DocumentationData) => void;
  onRegenerateSection: (sectionKey: string) => void;
  onExport: () => void;
  isLoading: boolean;
}

export const DocumentationPanel: React.FC<DocumentationPanelProps> = ({
  documentation,
  onUpdateDocumentation,
  onRegenerateSection,
  onExport,
  isLoading
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!documentation) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <div className="max-w-md space-y-3">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-semibold">
            PO
          </div>
          <h2 className="text-xl font-bold text-gray-800">Workspace Gotowy do Pracy</h2>
          <p className="text-sm text-gray-600">
            Wprowadź opis funkcji w panelu po lewej stronie, opcjonalnie dołącz zrzuty ekranu i kliknij "Generuj Dokumentację", aby uruchomić sztuczną inteligencję w roli doświadczonego Senior Product Ownera.
          </p>
        </div>
      </div>
    );
  }

  const handleStartEdit = (key: string, value: any) => {
    setEditingField(key);
    setEditValues({ ...editValues, [key]: value });
  };

  const handleCancelEdit = (key: string) => {
    setEditingField(null);
  };

  const handleSaveEdit = (key: string) => {
    const updated = { ...documentation, [key]: editValues[key] };
    onUpdateDocumentation(updated);
    setEditingField(null);
  };

  const handleArrayItemChange = (key: string, index: number, val: string) => {
    const list = [...(editValues[key] || documentation[key as keyof DocumentationData] as string[])];
    list[index] = val;
    setEditValues({ ...editValues, [key]: list });
  };

  const handleAddArrayItem = (key: string) => {
    const list = [...(editValues[key] || documentation[key as keyof DocumentationData] as string[]), ''];
    setEditValues({ ...editValues, [key]: list });
  };

  const handleRemoveArrayItem = (key: string, index: number) => {
    const list = [...(editValues[key] || documentation[key as keyof DocumentationData] as string[])];
    list.splice(index, 1);
    setEditValues({ ...editValues, [key]: list });
  };

  const getDocumentationText = (doc: DocumentationData) => {
    return `${doc.featureName}

1. Opis Funkcji (Feature Description)
${doc.featureDescription}

2. Założenia (Assumptions)
${doc.assumptions.map(item => `- ${item}`).join('\n')}

3. Zależności (Dependencies)
${doc.dependencies.map(item => `- ${item}`).join('\n')}

4. Ryzyka i Mitygacja (Risks)
${doc.risks.map(item => `- ${item}`).join('\n')}

5. Korzyści dla Użytkownika (User Benefits)
${doc.userBenefits.map(item => `- ${item}`).join('\n')}

6. Warunki Spełnienia (Conditions of Satisfaction)
${doc.conditionsOfSatisfaction.map(item => `- ${item}`).join('\n')}

7. Metryki Sukcesu (Success Metrics)
${doc.successMetrics.map(item => `- ${item}`).join('\n')}

8. Otwarte Pytania (Open Questions)
${doc.openQuestions.map(item => `- ${item}`).join('\n')}

---
Wynik Kompletności Dokumentacji: ${doc.completenessScore}/10

Brakujące Informacje:
${doc.missingInformation.map(item => `- ${item}`).join('\n')}

Kluczowe Decyzje do Potwierdzenia:
${doc.keyDecisions.map(item => `- ${item}`).join('\n')}
`;
  };

  const copyDocumentation = () => {
    const text = getDocumentationText(documentation);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 min-w-0 min-h-0 bg-gray-50 flex flex-col lg:h-full overflow-hidden">
      {/* Top Bar Actions */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-xs shrink-0">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Dokumentacja Produktu</span>
          <h2 className="text-lg font-bold text-gray-900">{documentation.featureName}</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(true)}
            title="Pełny ekran / Podgląd tekstowy"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            Pełny ekran
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            Pobierz
          </button>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-fadeIn">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl border border-gray-300 flex flex-col overflow-hidden">
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Podgląd Dokumentacji (Tekst gotowy do skopiowania)</span>
                <h3 className="text-lg font-bold text-gray-900">{documentation.featureName}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyDocumentation}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Skopiowano!' : 'Kopiuj'}
                </button>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                  title="Zamknij"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 flex flex-col p-6 min-h-0 overflow-hidden bg-slate-900">
              <textarea
                readOnly
                value={getDocumentationText(documentation)}
                className="flex-1 min-h-0 w-full p-4 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl border border-slate-800 focus:outline-none resize-none shadow-inner leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Completeness Score Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-4 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold">Ocena Kompletności Wymagań</span>
            <p className="text-sm text-slate-300 mt-0.5">Analiza AI kompletności i gotowości do wdrożenia</p>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/30 border border-blue-400/30 px-4 py-2 rounded-lg">
            <span className="text-2xl font-black text-blue-400">{documentation.completenessScore}</span>
            <span className="text-sm text-slate-300">/ 10</span>
          </div>
        </div>

        {/* 1. Feature Name */}
        <SectionCard
          title="1. Nazwa Funkcji (Feature Name)"
          sectionKey="featureName"
          isEditing={editingField === 'featureName'}
          onEdit={() => handleStartEdit('featureName', documentation.featureName)}
          onCancel={() => handleCancelEdit('featureName')}
          onSave={() => handleSaveEdit('featureName')}
          onRegenerate={() => onRegenerateSection('featureName')}
          isLoading={isLoading}
        >
          {editingField === 'featureName' ? (
            <input
              type="text"
              value={editValues.featureName !== undefined ? editValues.featureName : documentation.featureName}
              onChange={e => setEditValues({ ...editValues, featureName: e.target.value })}
              className="w-full p-2 border border-blue-400 rounded-md text-sm focus:outline-none"
            />
          ) : (
            <p className="text-gray-800 font-medium">{documentation.featureName}</p>
          )}
        </SectionCard>

        {/* 2. Feature Description */}
        <SectionCard
          title="2. Opis Funkcji (Feature Description)"
          sectionKey="featureDescription"
          isEditing={editingField === 'featureDescription'}
          onEdit={() => handleStartEdit('featureDescription', documentation.featureDescription)}
          onCancel={() => handleCancelEdit('featureDescription')}
          onSave={() => handleSaveEdit('featureDescription')}
          onRegenerate={() => onRegenerateSection('featureDescription')}
          isLoading={isLoading}
        >
          {editingField === 'featureDescription' ? (
            <textarea
              rows={6}
              value={editValues.featureDescription !== undefined ? editValues.featureDescription : documentation.featureDescription}
              onChange={e => setEditValues({ ...editValues, featureDescription: e.target.value })}
              className="w-full p-2.5 border border-blue-400 rounded-md text-sm focus:outline-none"
            />
          ) : (
            <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
              {documentation.featureDescription}
            </div>
          )}
        </SectionCard>

        {/* 3. Assumptions */}
        <ArraySectionCard
          title="3. Założenia (Assumptions)"
          sectionKey="assumptions"
          items={documentation.assumptions}
          isEditing={editingField === 'assumptions'}
          editValues={editValues.assumptions || documentation.assumptions}
          onEdit={() => handleStartEdit('assumptions', documentation.assumptions)}
          onCancel={() => handleCancelEdit('assumptions')}
          onSave={() => handleSaveEdit('assumptions')}
          onRegenerate={() => onRegenerateSection('assumptions')}
          onChangeItem={(idx, val) => handleArrayItemChange('assumptions', idx, val)}
          onAddItem={() => handleAddArrayItem('assumptions')}
          onRemoveItem={idx => handleRemoveArrayItem('assumptions', idx)}
          isLoading={isLoading}
        />

        {/* 4. Dependencies */}
        <ArraySectionCard
          title="4. Zależności (Dependencies)"
          sectionKey="dependencies"
          items={documentation.dependencies}
          isEditing={editingField === 'dependencies'}
          editValues={editValues.dependencies || documentation.dependencies}
          onEdit={() => handleStartEdit('dependencies', documentation.dependencies)}
          onCancel={() => handleCancelEdit('dependencies')}
          onSave={() => handleSaveEdit('dependencies')}
          onRegenerate={() => onRegenerateSection('dependencies')}
          onChangeItem={(idx, val) => handleArrayItemChange('dependencies', idx, val)}
          onAddItem={() => handleAddArrayItem('dependencies')}
          onRemoveItem={idx => handleRemoveArrayItem('dependencies', idx)}
          isLoading={isLoading}
        />

        {/* 5. Risks */}
        <ArraySectionCard
          title="5. Ryzyka i Mitygacja (Risks)"
          sectionKey="risks"
          items={documentation.risks}
          isEditing={editingField === 'risks'}
          editValues={editValues.risks || documentation.risks}
          onEdit={() => handleStartEdit('risks', documentation.risks)}
          onCancel={() => handleCancelEdit('risks')}
          onSave={() => handleSaveEdit('risks')}
          onRegenerate={() => onRegenerateSection('risks')}
          onChangeItem={(idx, val) => handleArrayItemChange('risks', idx, val)}
          onAddItem={() => handleAddArrayItem('risks')}
          onRemoveItem={idx => handleRemoveArrayItem('risks', idx)}
          isLoading={isLoading}
        />

        {/* 6. User Benefits */}
        <ArraySectionCard
          title="6. Korzyści dla Użytkownika (User Benefits)"
          sectionKey="userBenefits"
          items={documentation.userBenefits}
          isEditing={editingField === 'userBenefits'}
          editValues={editValues.userBenefits || documentation.userBenefits}
          onEdit={() => handleStartEdit('userBenefits', documentation.userBenefits)}
          onCancel={() => handleCancelEdit('userBenefits')}
          onSave={() => handleSaveEdit('userBenefits')}
          onRegenerate={() => onRegenerateSection('userBenefits')}
          onChangeItem={(idx, val) => handleArrayItemChange('userBenefits', idx, val)}
          onAddItem={() => handleAddArrayItem('userBenefits')}
          onRemoveItem={idx => handleRemoveArrayItem('userBenefits', idx)}
          isLoading={isLoading}
        />

        {/* 7. Conditions of Satisfaction */}
        <ArraySectionCard
          title="7. Warunki Spełnienia (Conditions of Satisfaction)"
          sectionKey="conditionsOfSatisfaction"
          items={documentation.conditionsOfSatisfaction}
          isEditing={editingField === 'conditionsOfSatisfaction'}
          editValues={editValues.conditionsOfSatisfaction || documentation.conditionsOfSatisfaction}
          onEdit={() => handleStartEdit('conditionsOfSatisfaction', documentation.conditionsOfSatisfaction)}
          onCancel={() => handleCancelEdit('conditionsOfSatisfaction')}
          onSave={() => handleSaveEdit('conditionsOfSatisfaction')}
          onRegenerate={() => onRegenerateSection('conditionsOfSatisfaction')}
          onChangeItem={(idx, val) => handleArrayItemChange('conditionsOfSatisfaction', idx, val)}
          onAddItem={() => handleAddArrayItem('conditionsOfSatisfaction')}
          onRemoveItem={idx => handleRemoveArrayItem('conditionsOfSatisfaction', idx)}
          isLoading={isLoading}
        />

        {/* 8. Success Metrics */}
        <ArraySectionCard
          title="8. Metryki Sukcesu (Success Metrics)"
          sectionKey="successMetrics"
          items={documentation.successMetrics}
          isEditing={editingField === 'successMetrics'}
          editValues={editValues.successMetrics || documentation.successMetrics}
          onEdit={() => handleStartEdit('successMetrics', documentation.successMetrics)}
          onCancel={() => handleCancelEdit('successMetrics')}
          onSave={() => handleSaveEdit('successMetrics')}
          onRegenerate={() => onRegenerateSection('successMetrics')}
          onChangeItem={(idx, val) => handleArrayItemChange('successMetrics', idx, val)}
          onAddItem={() => handleAddArrayItem('successMetrics')}
          onRemoveItem={idx => handleRemoveArrayItem('successMetrics', idx)}
          isLoading={isLoading}
        />

        {/* 9. Open Questions */}
        <ArraySectionCard
          title="9. Otwarte Pytania i Brakujące Informacje (Open Questions)"
          sectionKey="openQuestions"
          items={documentation.openQuestions}
          isEditing={editingField === 'openQuestions'}
          editValues={editValues.openQuestions || documentation.openQuestions}
          onEdit={() => handleStartEdit('openQuestions', documentation.openQuestions)}
          onCancel={() => handleCancelEdit('openQuestions')}
          onSave={() => handleSaveEdit('openQuestions')}
          onRegenerate={() => onRegenerateSection('openQuestions')}
          onChangeItem={(idx, val) => handleArrayItemChange('openQuestions', idx, val)}
          onAddItem={() => handleAddArrayItem('openQuestions')}
          onRemoveItem={idx => handleRemoveArrayItem('openQuestions', idx)}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

interface SectionCardProps {
  title: string;
  sectionKey: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onRegenerate,
  isLoading,
  children
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">{title}</h3>
        <div className="flex items-center space-x-1.5">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded text-xs font-medium"
              >
                <Save className="w-3.5 h-3.5" /> Zapisz
              </button>
              <button
                onClick={onCancel}
                className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2.5 py-1 rounded text-xs font-medium"
              >
                <X className="w-3.5 h-3.5" /> Anuluj
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600 bg-white border border-gray-300 hover:border-blue-400 px-2.5 py-1 rounded text-xs font-medium transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edytuj
              </button>
              <button
                onClick={onRegenerate}
                disabled={isLoading}
                className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 bg-white border border-gray-300 hover:border-indigo-400 px-2.5 py-1 rounded text-xs font-medium transition-colors"
                title="Regeneruj tę sekcję przez AI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Regeneruj AI
              </button>
            </>
          )}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
};

interface ArraySectionCardProps {
  title: string;
  sectionKey: string;
  items: string[];
  isEditing: boolean;
  editValues: string[];
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onRegenerate: () => void;
  onChangeItem: (index: number, val: string) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  isLoading: boolean;
}

const ArraySectionCard: React.FC<ArraySectionCardProps> = ({
  title,
  items,
  isEditing,
  editValues,
  onEdit,
  onCancel,
  onSave,
  onRegenerate,
  onChangeItem,
  onAddItem,
  onRemoveItem,
  isLoading
}) => {
  return (
    <SectionCard
      title={title}
      sectionKey=""
      isEditing={isEditing}
      onEdit={onEdit}
      onCancel={onCancel}
      onSave={onSave}
      onRegenerate={onRegenerate}
      isLoading={isLoading}
    >
      {isEditing ? (
        <div className="space-y-2">
          {editValues.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={item}
                onChange={e => onChangeItem(index, e.target.value)}
                className="flex-1 p-2 border border-blue-400 rounded-md text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => onRemoveItem(index)}
                className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-md text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddItem}
            className="mt-2 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium px-3 py-1.5 rounded border border-blue-200 transition-colors"
          >
            + Dodaj pozycję
          </button>
        </div>
      ) : (
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-700">
          {items && items.length > 0 ? (
            items.map((item, index) => <li key={index}>{item}</li>)
          ) : (
            <li className="text-gray-400 italic">Brak elementów</li>
          )}
        </ul>
      )}
    </SectionCard>
  );
};

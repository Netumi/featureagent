import React, { useState, useEffect, useRef } from 'react';
import { MockupData } from '../types';
import { Code, Eye, RefreshCw, Download, Copy, Check, ShieldAlert, Maximize2, Minimize2 } from 'lucide-react';

interface MockupPanelProps {
  mockup: MockupData | null;
  onRegenerateMockup: () => void;
  isLoading: boolean;
}

// Compile TSX code using Babel Standalone loaded in main app context
// Returns { code: string } on success or { error: string } on failure
function compileTsx(source: string): { code: string } | { error: string } {
  try {
    // @ts-ignore - Babel is loaded globally via script tag in index.html
    const Babel = (window as any).Babel;
    if (!Babel) return { error: 'Babel nie jest dostępny. Sprawdź czy index.html ładuje Babel Standalone.' };
    const result = Babel.transform(source, {
      presets: [
        ['env', { modules: 'commonjs' }],
        'react',
        'typescript',
      ],
      filename: 'App.tsx',
    });
    return { code: result.code as string };
  } catch (e: any) {
    return { error: e.message || String(e) };
  }
}

export const MockupPanel: React.FC<MockupPanelProps> = ({
  mockup,
  onRegenerateMockup,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [compiledHtml, setCompiledHtml] = useState<string>('');
  const prevCodeRef = useRef<string>('');

  // Compile TSX whenever mockup changes
  useEffect(() => {
    if (!mockup) return;

    // Normalize: strip markdown fences
    let rawCode = (mockup.tsxCode || '').trim();
    rawCode = rawCode.replace(/^```(?:tsx|jsx|typescript|javascript)?\s*/i, '');
    rawCode = rawCode.replace(/\s*```$/i, '').trim();

    // Avoid recompiling the same code (e.g. tab switch)
    if (rawCode === prevCodeRef.current) return;
    prevCodeRef.current = rawCode;

    const compiled = compileTsx(rawCode);

    const errorHtml = (title: string, msg: string) => `<!DOCTYPE html><html><body style="margin:0;padding:20px;font-family:ui-sans-serif,system-ui,sans-serif;background:#fff"><div style="color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px"><div style="font-weight:700;margin-bottom:8px">${title}</div><pre style="background:#fee2e2;padding:12px;border-radius:8px;font-size:12px;overflow:auto;white-space:pre-wrap;font-family:monospace">${msg.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre></div></body></html>`;

    if ('error' in compiled) {
      setCompiledHtml(errorHtml('Błąd kompilacji TSX (Babel)', compiled.error));
      return;
    }

    // Build self-contained iframe HTML using ONLY the already-compiled vanilla JS
    // React and ReactDOM are inlined as UMD (CDN), no Babel needed inside iframe
    const jsCode = compiled.code;
    const cssCode = mockup.cssCode || '';

    const html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"><\/script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/lucide-react@0.460.0/dist/umd/lucide-react.min.js"><\/script>
  <style>
    html, body, #root { width:100%; min-height:100vh; margin:0; padding:0; background:#f8fafc; font-family:ui-sans-serif,system-ui,sans-serif; }
    ${cssCode}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
  window.onerror = function(msg, src, line, col, err) {
    document.getElementById('root').innerHTML =
      '<div style="padding:20px;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin:16px;font-family:ui-sans-serif,system-ui,sans-serif">' +
      '<div style="font-weight:700;margin-bottom:8px">Błąd wykonania (Runtime)</div>' +
      '<pre style="background:#fee2e2;padding:12px;border-radius:8px;font-size:12px;overflow:auto;white-space:pre-wrap;font-family:monospace">' + msg + (line ? ' (linia ' + line + ')' : '') + '</pre></div>';
    return true;
  };
  (function() {
    var exports = {};
    var module = { exports: exports };
    function require(name) {
      if (name === 'react') return Object.assign({}, React, { default: React });
      if (name === 'react-dom' || name === 'react-dom/client') return Object.assign({}, ReactDOM, { default: ReactDOM });
      if (name === 'lucide-react') {
        var lib = window.LucideReact || {};
        return new Proxy(lib, {
          get: function(t, p) {
            if (typeof p === 'string' && p in t) return t[p];
            return function DummyIcon(props) {
              return React.createElement('span', { title: String(p), style: { display:'inline-flex', opacity:0.4 } }, '□');
            };
          }
        });
      }
      return {};
    }
    try {
      ${jsCode}
      var mod = module.exports && Object.keys(module.exports).length ? module.exports : exports;
      var Component = mod.default || mod.App || mod.FeatureMockup ||
        Object.values(mod).find(function(v){ return typeof v === 'function'; });
      if (!Component) throw new Error('Nie znaleziono eksportowanego komponentu React (np. export default function App).');
      var root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(Component));
    } catch(e) {
      document.getElementById('root').innerHTML =
        '<div style="padding:20px;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin:16px;font-family:ui-sans-serif,system-ui,sans-serif">' +
        '<div style="font-weight:700;margin-bottom:8px">Błąd renderowania makiety</div>' +
        '<pre style="background:#fee2e2;padding:12px;border-radius:8px;font-size:12px;overflow:auto;white-space:pre-wrap;font-family:monospace">' + (e.message || String(e)) + '</pre></div>';
    }
  })();
  <\/script>
</body>
</html>`;
    setCompiledHtml(html);
  }, [mockup]);

  if (!mockup) return null;

  const copyCode = () => {
    navigator.clipboard.writeText(mockup.tsxCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCode = () => {
    const blob = new Blob([mockup.tsxCode], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FeatureMockup.tsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  const panelContent = (
    <div className={`bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col overflow-hidden shadow-lg ${isFullscreen
      ? 'w-full h-[96vh] max-w-7xl rounded-2xl shadow-2xl border border-gray-300'
      : 'w-full flex-1 min-w-0 min-h-[650px] lg:min-h-0 lg:h-full'
      }`}>
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Makieta UI (Konceptualna)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-100 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Eye className="w-3.5 h-3.5" /> Podgląd
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${activeTab === 'code' ? 'bg-indigo-600 text-white shadow-xs' : 'text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Code className="w-3.5 h-3.5" /> Kod TSX
            </button>
          </div>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Zamknij pełny ekran" : "Pełny ekran (wysokość okna)"}
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-gray-200"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-800 text-xs shrink-0">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
        <span>Konceptualna makieta UI – interaktywny komponent React</span>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col bg-slate-50 relative min-h-0 overflow-hidden">
        {activeTab === 'preview' ? (
          <div className="flex-1 flex flex-col min-h-0 w-full">
            <div className="flex-1 relative min-h-0 w-full">
              <iframe
                title="Podgląd makiety"
                srcDoc={compiledHtml}
                sandbox="allow-scripts"
                className="absolute inset-0 w-full h-full border-0 bg-transparent block"
              />
            </div>
            <div className="p-3 bg-white border-t border-gray-200 flex items-center justify-between shadow-xs shrink-0 z-10">
              <button
                onClick={onRegenerateMockup}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-xs bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3.5 py-2 rounded-lg font-medium shadow-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Regeneruj Makietę AI
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2 shrink-0">
              <span className="text-xs font-semibold text-gray-600">App.tsx (React + Tailwind)</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 text-xs bg-white border border-gray-300 hover:bg-gray-50 px-2.5 py-1 rounded text-gray-700 font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Skopiowano' : 'Kopiuj'}
                </button>
                <button
                  onClick={exportCode}
                  className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded font-medium shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Pobierz .tsx
                </button>
              </div>
            </div>
            <textarea
              readOnly
              value={mockup.tsxCode}
              className="flex-1 min-h-0 w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-lg border border-slate-800 focus:outline-none resize-none shadow-inner"
            />
          </div>
        )}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-fadeIn">
        {panelContent}
      </div>
    );
  }

  return panelContent;
};

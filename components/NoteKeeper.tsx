import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Code, 
  Wand2, 
  List, 
  Highlighter, 
  BrainCircuit, 
  GraduationCap,
  Settings,
  ChevronDown,
  ChevronUp,
  Play,
  Copy,
  Eraser,
  Eye,
  Edit3
} from 'lucide-react';
import { generateText } from '../services/geminiService';
import { AI_PROMPTS, AI_MODELS } from '../constants';
import { FlowerTheme } from '../types';

interface NoteKeeperProps {
  theme: FlowerTheme;
  apiKeys: {
      gemini: string;
      openai: string;
      [key: string]: string;
  };
  onLog: (msg: string, type: 'info' | 'success' | 'error') => void;
}

interface FeatureSettings {
  model: string;
  maxTokens: number;
  prompt: string;
}

const NoteKeeper: React.FC<NoteKeeperProps> = ({ theme, apiKeys, onLog }) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [rawText, setRawText] = useState('');
  const [processedText, setProcessedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Custom Keyword Highlight State
  const [customKeywords, setCustomKeywords] = useState('');
  const [highlightColor, setHighlightColor] = useState('#FF7F50'); // Default Coral

  // Settings State for each feature
  const [settingsOpen, setSettingsOpen] = useState<string | null>(null);
  const [configs, setConfigs] = useState<Record<string, FeatureSettings>>({
    'transform': { model: 'gemini-2.5-flash', maxTokens: 4096, prompt: AI_PROMPTS.TRANSFORM_MD },
    'entity': { model: 'gemini-2.5-flash', maxTokens: 4096, prompt: AI_PROMPTS.ENTITY_EXTRACTION },
    'format': { model: 'gemini-2.5-flash', maxTokens: 4096, prompt: AI_PROMPTS.AI_FORMATTING },
    'mindmap': { model: 'gemini-2.5-flash', maxTokens: 2048, prompt: AI_PROMPTS.MAGIC_MINDMAP },
    'quiz': { model: 'gemini-2.5-flash', maxTokens: 2048, prompt: AI_PROMPTS.MAGIC_QUIZ },
  });

  // --- Helpers ---

  const jsonToMarkdown = (data: any) => {
    let md = `# Summary\n\n${data.summary || 'No summary provided.'}\n\n## Key Entities\n\n| Entity Name | Context |\n| :--- | :--- |\n`;
    if (data.entities && Array.isArray(data.entities)) {
      data.entities.forEach((e: any) => {
        md += `| **${e.name}** | ${e.context} |\n`;
      });
    }
    return md;
  };

  const updateConfig = (feature: string, field: keyof FeatureSettings, value: any) => {
    setConfigs(prev => ({
      ...prev,
      [feature]: { ...prev[feature], [field]: value }
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    onLog('Copied to clipboard', 'success');
  };

  // --- Core AI Runner ---

  const runAI = async (feature: string, outputHandler: (text: string) => void, isJson = false) => {
    if (!rawText.trim()) {
      onLog('Please enter some text in the input box first', 'error');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    onLog(`Starting ${feature}...`, 'info');
    
    const config = configs[feature];
    const fullPrompt = `${config.prompt}\n\n[INPUT TEXT]:\n${rawText}`;

    // Determine Provider and Key based on selected model
    const modelInfo = AI_MODELS.find(m => m.id === config.model);
    const provider = (modelInfo?.provider || 'gemini') as 'gemini' | 'openai';
    const apiKey = apiKeys[provider];

    try {
      const result = await generateText(fullPrompt, apiKey, {
        model: config.model,
        maxTokens: config.maxTokens,
        responseMimeType: isJson ? 'application/json' : 'text/plain',
        provider: provider
      });
      
      if (!result) {
         throw new Error("AI returned empty content. Text might be blocked or model failed.");
      }

      outputHandler(result);
      onLog(`${feature.toUpperCase()} completed successfully`, 'success');
      setActiveTab('edit'); // Always switch to edit mode to see results immediately
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Unknown error occurred";
      onLog(`Failed to run ${feature}: ${msg}`, 'error');
      setErrorMsg(`Error: ${msg}\n\nPlease check your API Key settings, selected model, and network connection.`);
      setProcessedText(`> **Error during execution:**\n> ${msg}`);
      setActiveTab('edit');
    } finally {
      setIsProcessing(false);
    }
  };

  // --- Action Handlers ---

  // 1. Transform to MD
  const handleTransform = () => {
    runAI('transform', (text) => {
      setProcessedText(text);
    });
  };

  // 2. Entity Analysis -> Markdown Table
  const handleEntityAnalysis = () => {
    runAI('entity', (text) => {
      try {
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(cleanJson);
        const mdTable = jsonToMarkdown(data);
        setProcessedText(mdTable);
      } catch (e) {
        onLog('Failed to parse entity JSON. Showing raw output.', 'warning');
        setProcessedText(text);
      }
    }, true); 
  };

  // 3. AI Formatting
  const handleAIFormat = () => {
    runAI('format', (text) => {
      setProcessedText(text);
    });
  };

  // 4. Custom Keywords (Client-side)
  const handleCustomHighlight = () => {
    if (!processedText && !rawText) return;
    const keywords = customKeywords.split(',').map(k => k.trim()).filter(k => k);
    
    if (keywords.length === 0) {
      onLog('No keywords provided', 'error');
      return;
    }

    // Use processed text if available, otherwise raw
    let textToProcess = processedText || rawText;
    
    // Simple regex replacement to wrap keywords in span
    keywords.forEach(kw => {
        // Escape special regex chars
        const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedKw})`, 'gi');
        textToProcess = textToProcess.replace(regex, `<span style="background-color: ${highlightColor}; color: white; padding: 0 4px; border-radius: 4px; font-weight: bold;">$1</span>`);
    });

    setProcessedText(textToProcess);
    setActiveTab('preview'); // Auto-switch to preview for visual highlight
    onLog('Custom keywords highlighted. Switched to Preview.', 'success');
  };

  // 5. Magic: Mindmap
  const handleMagicMindmap = () => {
    runAI('mindmap', (text) => {
      const code = text.replace(/```mermaid/g, '').replace(/```/g, '').trim();
      const mdWrapper = `# Mindmap\n\n\`\`\`mermaid\n${code}\n\`\`\`\n\n> Note: Switch to Preview mode to see charts (if supported) or copy code to a Mermaid editor.`;
      setProcessedText(mdWrapper);
    });
  };

  // 6. Magic: Quiz
  const handleMagicQuiz = () => {
    runAI('quiz', (text) => {
      setProcessedText(text);
    });
  };

  // --- Components ---
  
  const SettingsPanel = ({ feature, title, onRun }: { feature: string, title: string, onRun: () => void }) => {
    const config = configs[feature];
    const isOpen = settingsOpen === feature;

    return (
      <div className="border-b border-gray-100 dark:border-gray-700 last:border-0">
        <button 
          onClick={() => setSettingsOpen(isOpen ? null : feature)}
          className={`w-full flex justify-between items-center p-3 text-sm transition-colors ${isOpen ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
        >
          <div className="flex items-center gap-2">
            <Settings size={14} className={isOpen ? 'text-indigo-600' : 'text-gray-400'} />
            <span className={`font-semibold ${isOpen ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>{title} Config</span>
          </div>
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        
        {isOpen && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900/50 space-y-4 text-xs animate-fadeIn">
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-600 dark:text-gray-400">Model</label>
                  <select 
                    value={config.model}
                    onChange={(e) => updateConfig(feature, 'model', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  >
                    <optgroup label="Gemini (Google)">
                        {AI_MODELS.filter(m => m.provider === 'gemini').map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </optgroup>
                    <optgroup label="OpenAI">
                        {AI_MODELS.filter(m => m.provider === 'openai').map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-600 dark:text-gray-400">Max Tokens</label>
                  <input 
                    type="number" 
                    value={config.maxTokens}
                    onChange={(e) => updateConfig(feature, 'maxTokens', parseInt(e.target.value))}
                    className="w-full p-2 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  />
                </div>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-600 dark:text-gray-400">System Prompt</label>
              <textarea 
                value={config.prompt}
                onChange={(e) => updateConfig(feature, 'prompt', e.target.value)}
                className="w-full p-3 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 h-24 text-gray-800 dark:text-gray-200 font-mono"
              />
            </div>
            <button 
              onClick={onRun}
              disabled={isProcessing}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"/> : <Play size={16} />}
              Run {title}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4">
      
      {/* 1. Header & Actions Toolbar */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-4">
         <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-3">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <FileText size={20} />
                </div>
                <div>
                    <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">AI Note Keeper</h2>
                    <p className="text-xs text-gray-500">Transform, Analyze, and Enhance your 510(k) notes</p>
                </div>
            </div>
            {/* Quick Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-2">
                <button onClick={handleTransform} disabled={isProcessing} className="btn-action bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300">
                    <Code size={16} /> Transform MD
                </button>
                <button onClick={handleEntityAnalysis} disabled={isProcessing} className="btn-action bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <List size={16} /> Entities
                </button>
                <button onClick={handleAIFormat} disabled={isProcessing} className="btn-action bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300">
                    <Wand2 size={16} /> Format
                </button>
            </div>
         </div>

         {/* Extended Toolbar & Magic Tools */}
         <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
                {/* Magic Dropdown */}
                <div className="relative group z-20">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 hover:bg-pink-100 transition-colors text-sm font-bold">
                        <BrainCircuit size={16} /> Magic Tools
                    </button>
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 hidden group-hover:block overflow-hidden animate-fadeIn">
                        <button onClick={handleMagicMindmap} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-3">
                            <BrainCircuit size={16} className="text-pink-500" /> Mind Map Generator
                        </button>
                        <button onClick={handleMagicQuiz} className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm flex items-center gap-3">
                            <GraduationCap size={16} className="text-purple-500" /> Quiz Generator
                        </button>
                    </div>
                </div>

                {/* Keyword Highlighter */}
                <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-lg p-1 ml-2 border border-gray-200 dark:border-gray-700">
                    <input 
                      type="text" 
                      placeholder="Keywords (comma separated)..." 
                      className="w-40 px-2 py-1 text-xs bg-transparent outline-none text-gray-700 dark:text-gray-200"
                      value={customKeywords}
                      onChange={e => setCustomKeywords(e.target.value)}
                    />
                    <input 
                      type="color" 
                      value={highlightColor}
                      onChange={e => setHighlightColor(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-none bg-transparent"
                      title="Highlight Color"
                    />
                    <button onClick={handleCustomHighlight} className="ml-2 p-1.5 bg-white dark:bg-gray-600 rounded shadow-sm text-gray-600 dark:text-gray-200 hover:text-primary transition-colors">
                       <Highlighter size={14} />
                    </button>
                </div>
            </div>

            {/* Config Toggle */}
            <div className="relative group z-20">
               <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Settings size={18} />
                  <span className="text-sm font-medium hidden sm:inline">Configuration</span>
               </button>
               {/* Config Dropdown Panel */}
               <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 hidden group-hover:block max-h-[80vh] overflow-y-auto custom-scrollbar">
                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700 font-bold text-xs text-gray-500 uppercase tracking-wider sticky top-0 backdrop-blur-sm">
                      Feature Settings
                  </div>
                  <SettingsPanel feature="transform" title="Transform MD" onRun={handleTransform} />
                  <SettingsPanel feature="entity" title="Analyze Entities" onRun={handleEntityAnalysis} />
                  <SettingsPanel feature="format" title="AI Formatting" onRun={handleAIFormat} />
                  <SettingsPanel feature="mindmap" title="Mind Map" onRun={handleMagicMindmap} />
                  <SettingsPanel feature="quiz" title="Quiz Gen" onRun={handleMagicQuiz} />
               </div>
            </div>
         </div>
      </div>

      {/* 2. Main Workspace (Split View) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        
        {/* Left: Input */}
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
             <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                <FileText size={14} /> Source Text
             </span>
             <button onClick={() => setRawText('')} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
               <Eraser size={12} /> Clear
             </button>
          </div>
          <textarea 
            className="flex-1 w-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200 focus:bg-indigo-50/10 transition-colors"
            placeholder="Paste your regulatory notes, meeting minutes, or device descriptions here..."
            value={rawText}
            onChange={e => setRawText(e.target.value)}
          />
        </div>

        {/* Right: Result Editor */}
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden h-full relative">
           <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase ml-2 mr-2">Results</span>
                  <div className="flex gap-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                    <button 
                      onClick={() => setActiveTab('edit')} 
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${activeTab === 'edit' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Edit3 size={12} /> Edit (MD)
                    </button>
                    <button 
                      onClick={() => setActiveTab('preview')} 
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${activeTab === 'preview' ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      <Eye size={12} /> Preview
                    </button>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                 {processedText && (
                     <button onClick={() => handleCopy(processedText)} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
                        <Copy size={12} /> Copy
                     </button>
                 )}
              </div>
           </div>

           <div className="flex-1 relative overflow-hidden group">
              {isProcessing && (
                <div className="absolute inset-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm flex items-center justify-center flex-col gap-4 animate-fadeIn">
                   <div className="relative">
                       <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                       <div className="absolute inset-0 flex items-center justify-center">
                           <BrainCircuit size={20} className="text-indigo-600 animate-pulse" />
                       </div>
                   </div>
                   <span className="text-sm font-semibold text-indigo-600 tracking-wide animate-pulse">Processing...</span>
                </div>
              )}
              
              {activeTab === 'edit' ? (
                <textarea 
                  className="w-full h-full p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed text-gray-800 dark:text-gray-200"
                  value={processedText}
                  onChange={e => setProcessedText(e.target.value)}
                  placeholder="AI generated results will appear here. You can edit this text freely."
                />
              ) : (
                 <div 
                   className="w-full h-full p-6 overflow-y-auto prose dark:prose-invert prose-sm max-w-none custom-scrollbar"
                   dangerouslySetInnerHTML={{ 
                     // Basic formatting for preview
                     __html: processedText
                        ? processedText
                            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mt-4 mb-2 text-indigo-600 dark:text-indigo-400">$1</h3>')
                            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 pb-1 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">$1</h2>')
                            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">$1</h1>')
                            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                            .replace(/```mermaid([\s\S]*?)```/g, '<div class="p-4 bg-gray-100 dark:bg-gray-900 rounded font-mono text-xs my-4 border-l-4 border-pink-500 overflow-x-auto">$1</div>')
                            .replace(/\|(.+)\|/g, (match) => { // Basic Table Row handler
                                return `<div class="grid grid-flow-col auto-cols-auto gap-4 py-1 border-b border-gray-100 dark:border-gray-800 min-w-max">${match.split('|').filter(s=>s.trim()).map(c => `<span>${c.trim()}</span>`).join('')}</div>`; 
                            })
                            .replace(/\n/g, '<br />')
                        : '<div class="h-full flex flex-col items-center justify-center text-gray-400"><ArrowRight size={48} class="mb-4 opacity-20" /><p>Result preview area</p></div>'
                   }}
                 />
              )}
           </div>
        </div>
      </div>

      <style>{`
        .btn-action {
            @apply flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed;
        }
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NoteKeeper;
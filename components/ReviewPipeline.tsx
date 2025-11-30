import React, { useState, useRef } from 'react';
import { 
  Play, 
  Settings, 
  Save, 
  Upload, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  GitBranch
} from 'lucide-react';
import { generateText } from '../services/geminiService';
import { AI_MODELS, DEFAULT_PIPELINE_CONFIG } from '../constants';
import { FlowerTheme, AgentConfig, AgentResult } from '../types';

interface ReviewPipelineProps {
  theme: FlowerTheme;
  apiKeys: {
      gemini: string;
      openai: string;
      [key: string]: string;
  };
  globalInput: string;
  onLog: (msg: string, type: 'info' | 'success' | 'error') => void;
  onUpdateStats: (manaCost: number, xpGain: number) => void;
  mana: number;
}

const ReviewPipeline: React.FC<ReviewPipelineProps> = ({ 
  theme, apiKeys, globalInput, onLog, onUpdateStats, mana 
}) => {
  // State
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>(DEFAULT_PIPELINE_CONFIG);
  const [results, setResults] = useState<Record<string, AgentResult>>({});
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null);
  const [editingOutputId, setEditingOutputId] = useState<string | null>(null); // Which agent's output are we editing?
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Actions ---

  const handleUpdateConfig = (id: string, field: keyof AgentConfig, value: any) => {
    setAgentConfigs(prev => prev.map(c => {
        if (c.id !== id) return c;
        // If model changes, update provider automatically
        if (field === 'model') {
            const modelInfo = AI_MODELS.find(m => m.id === value);
            return { ...c, model: value, provider: modelInfo?.provider || 'gemini' } as AgentConfig;
        }
        return { ...c, [field]: value };
    }));
  };

  const handleDownloadSettings = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(agentConfigs, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "fda_agents_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    onLog("Agent configurations downloaded.", "success");
  };

  const handleUploadSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsed = JSON.parse(event.target?.result as string);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
                setAgentConfigs(parsed);
                onLog("Agent configurations loaded successfully.", "success");
            } else {
                throw new Error("Invalid format");
            }
        } catch (err) {
            onLog("Failed to parse settings file.", "error");
        }
    };
    reader.readAsText(file);
  };

  const handleSaveOutput = (agentId: string, newText: string) => {
      setResults(prev => ({
          ...prev,
          [agentId]: { ...prev[agentId], output: newText }
      }));
  };

  // --- Execution Logic ---

  const executeAgent = async (index: number) => {
    const config = agentConfigs[index];
    
    // 1. Determine Input
    // If index 0, use globalInput.
    // Else, use output of index-1.
    let inputContent = "";
    if (index === 0) {
        inputContent = globalInput;
    } else {
        const prevAgentId = agentConfigs[index - 1].id;
        const prevResult = results[prevAgentId];
        if (!prevResult || !prevResult.output) {
            onLog(`Cannot run ${config.name}. Previous agent has no output.`, "error");
            return;
        }
        inputContent = prevResult.output;
    }

    if (!inputContent.trim()) {
        onLog(`Input for ${config.name} is empty.`, "error");
        return;
    }

    if (mana < 20) {
        onLog("Not enough Mana!", "error");
        return;
    }

    onUpdateStats(20, 0); // Consume Mana immediately

    // Set Status Running
    setResults(prev => ({
        ...prev,
        [config.id]: { status: 'running', output: prev[config.id]?.output || '' }
    }));
    onLog(`Agent ${config.name} started...`, "info");

    try {
        const apiKey = apiKeys[config.provider];
        const prompt = `${config.systemPrompt}\n\n[TASK INPUT]:\n${inputContent}`;
        
        const response = await generateText(prompt, apiKey, {
            model: config.model,
            maxTokens: config.maxTokens,
            temperature: config.temperature,
            provider: config.provider
        });

        if (!response) throw new Error("Empty response");

        setResults(prev => ({
            ...prev,
            [config.id]: { status: 'completed', output: response, timestamp: new Date().toLocaleTimeString() }
        }));
        onUpdateStats(0, 50); // Gain XP
        onLog(`Agent ${config.name} completed.`, "success");

    } catch (err: any) {
        setResults(prev => ({
            ...prev,
            [config.id]: { status: 'error', output: prev[config.id]?.output || '', error: err.message }
        }));
        onLog(`Agent ${config.name} failed: ${err.message}`, "error");
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* 1. Control Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.primaryColor }}>
                <GitBranch /> Standard Review Pipeline
            </h2>
            <p className="text-sm text-gray-500">Chain-of-thought review where each agent builds on the previous.</p>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={handleDownloadSettings}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Download Settings"
            >
                <Download size={16} /> JSON
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Upload Settings"
            >
                <Upload size={16} /> Import
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleUploadSettings}
            />
        </div>
      </div>

      {/* 2. Pipeline Steps */}
      <div className="relative space-y-8 pb-12">
        {/* Vertical Line Connector */}
        <div className="absolute left-8 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -z-10"></div>

        {agentConfigs.map((agent, index) => {
            const result = results[agent.id] || { status: 'idle', output: '' };
            const isExpanded = expandedConfig === agent.id;
            const isEditing = editingOutputId === agent.id;

            return (
                <div key={agent.id} className="relative pl-16 md:pl-20">
                    
                    {/* Status Dot */}
                    <div 
                        className={`absolute left-6 md:left-[2.35rem] top-6 w-5 h-5 rounded-full border-4 z-10 transition-colors shadow-sm bg-white dark:bg-gray-900`}
                        style={{ borderColor: result.status === 'completed' ? theme.primaryColor : result.status === 'error' ? 'red' : result.status === 'running' ? '#fbbf24' : '#e5e7eb' }}
                    ></div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        
                        {/* Header */}
                        <div className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{agent.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded font-mono border ${
                                        result.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' :
                                        result.status === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
                                    }`}>
                                        {result.status.toUpperCase()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{agent.description}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setExpandedConfig(isExpanded ? null : agent.id)}
                                    className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                    title="Configure Agent"
                                >
                                    <Settings size={18} className="text-gray-600 dark:text-gray-300" />
                                </button>
                                <button 
                                    onClick={() => executeAgent(index)}
                                    disabled={result.status === 'running'}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold shadow-md transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: theme.primaryColor }}
                                >
                                    {result.status === 'running' ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Play size={18} fill="currentColor" />
                                    )}
                                    <span className="hidden sm:inline">Run</span>
                                </button>
                            </div>
                        </div>

                        {/* Configuration Panel */}
                        {isExpanded && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-700 animate-fadeIn space-y-4 text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block font-medium mb-1 text-gray-600 dark:text-gray-400">Model</label>
                                        <select 
                                            value={agent.model}
                                            onChange={(e) => handleUpdateConfig(agent.id, 'model', e.target.value)}
                                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                        >
                                            <optgroup label="Gemini">
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
                                        <label className="block font-medium mb-1 text-gray-600 dark:text-gray-400">Max Tokens</label>
                                        <input 
                                            type="number" 
                                            value={agent.maxTokens}
                                            onChange={(e) => handleUpdateConfig(agent.id, 'maxTokens', parseInt(e.target.value))}
                                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block font-medium mb-1 text-gray-600 dark:text-gray-400">Temperature</label>
                                        <input 
                                            type="number" 
                                            step="0.1"
                                            min="0"
                                            max="1"
                                            value={agent.temperature}
                                            onChange={(e) => handleUpdateConfig(agent.id, 'temperature', parseFloat(e.target.value))}
                                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-medium mb-1 text-gray-600 dark:text-gray-400">System Prompt</label>
                                    <textarea 
                                        value={agent.systemPrompt}
                                        onChange={(e) => handleUpdateConfig(agent.id, 'systemPrompt', e.target.value)}
                                        className="w-full h-24 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-mono text-xs"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Output / Editor Area */}
                        {result.output && (
                            <div className="bg-white dark:bg-gray-800">
                                <div className="px-4 py-2 bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                    <span className="text-xs font-bold uppercase text-indigo-500 flex items-center gap-1">
                                        <CheckCircle size={12} /> Output (Next Agent's Input)
                                    </span>
                                    {isEditing ? (
                                        <div className="flex gap-2">
                                            <div className="flex bg-gray-200 dark:bg-gray-700 rounded p-0.5">
                                                <button onClick={() => setViewMode('edit')} className={`px-2 py-0.5 rounded text-xs ${viewMode === 'edit' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Edit</button>
                                                <button onClick={() => setViewMode('preview')} className={`px-2 py-0.5 rounded text-xs ${viewMode === 'preview' ? 'bg-white shadow text-black' : 'text-gray-500'}`}>Preview</button>
                                            </div>
                                            <button onClick={() => setEditingOutputId(null)} className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                                <Save size={12} /> Done
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setEditingOutputId(agent.id); setViewMode('edit'); }} className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors">
                                            <Edit3 size={12} /> Modify Output
                                        </button>
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className="h-64 relative">
                                        {viewMode === 'edit' ? (
                                            <textarea 
                                                value={result.output} 
                                                onChange={(e) => handleSaveOutput(agent.id, e.target.value)}
                                                className="w-full h-full p-4 bg-transparent outline-none resize-none font-mono text-sm" 
                                            />
                                        ) : (
                                            <div 
                                                className="w-full h-full p-4 overflow-y-auto prose dark:prose-invert prose-sm"
                                                dangerouslySetInnerHTML={{ __html: result.output.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} // Simple render for preview
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 max-h-48 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 font-mono bg-gray-50/30 dark:bg-black/20">
                                        {result.output}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {result.error && (
                             <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 text-sm flex items-start gap-2">
                                 <AlertCircle size={16} className="mt-0.5" />
                                 <span>{result.error}</span>
                             </div>
                        )}
                    </div>

                    {/* Arrow to next step */}
                    {index < agentConfigs.length - 1 && (
                        <div className="absolute left-6 md:left-[2.35rem] -bottom-6 text-gray-300 dark:text-gray-600 z-0">
                            <ArrowRight size={20} className="rotate-90" />
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};

export default ReviewPipeline;

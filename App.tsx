import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  GitBranch, 
  Bot, 
  Settings, 
  Sun, 
  Moon, 
  Globe, 
  Activity, 
  Zap, 
  Award,
  PenTool,
  Flower2,
  Terminal
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

import { FLOWER_THEMES, TRANSLATIONS } from './constants';
import { Language, ThemeMode, AppState, LogEntry } from './types';
import FlowerWheel from './components/FlowerWheel';
import SettingsModal from './components/SettingsModal';
import NoteKeeper from './components/NoteKeeper';
import ReviewPipeline from './components/ReviewPipeline';

const App: React.FC = () => {
  // --- State Management ---
  const [state, setState] = useState<AppState>({
    language: Language.ZH,
    themeMode: ThemeMode.DARK,
    currentFlowerId: 'rose',
    health: 85,
    mana: 60,
    experience: 1200,
    level: 3,
    apiKeys: { openai: '', gemini: '', anthropic: '', xai: '' }
  });

  const [activeTab, setActiveTab] = useState<'input' | 'pipeline' | 'notes' | 'dashboard'>('input');
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [observationText, setObservationText] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // --- Derived Data ---
  const currentTheme = FLOWER_THEMES.find(t => t.id === state.currentFlowerId) || FLOWER_THEMES[0];
  const t = TRANSLATIONS[state.language];

  // --- Effects ---
  useEffect(() => {
    // Apply theme variables to root
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.primaryColor);
    root.style.setProperty('--secondary', currentTheme.secondaryColor);
    root.style.setProperty('--accent', currentTheme.accentColor);
    
    if (state.themeMode === ThemeMode.DARK) {
      root.classList.add('dark');
      root.style.setProperty('--bg-color', currentTheme.darkBgColor);
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--bg-color', currentTheme.bgColor);
    }
  }, [state.currentFlowerId, state.themeMode, currentTheme]);

  // Auto-scroll logs
  useEffect(() => {
      if (logsEndRef.current) {
          logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [logs]);

  // --- Handlers ---
  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, { id: Date.now().toString(), timestamp: new Date().toLocaleTimeString(), message, type }]);
  };

  const updateStats = (manaCost: number, xpGain: number) => {
    setState(prev => ({
        ...prev,
        mana: Math.max(0, prev.mana - manaCost),
        experience: prev.experience + xpGain
    }));
  };

  // --- Component Parts ---

  const renderStatusCard = (title: string, value: number, max: number, color: string, icon: React.ReactNode) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4">
      <div className={`p-3 rounded-full text-white`} style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</span>
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{value}/{max}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${(value/max)*100}%`, backgroundColor: color }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen transition-colors duration-300 font-sans flex text-gray-800 dark:text-gray-100" style={{ backgroundColor: 'var(--bg-color)' }}>
      
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-r border-gray-200 dark:border-gray-800 flex flex-col fixed h-full z-10 transition-all shadow-xl">
         <div className="p-6 flex items-center justify-center lg:justify-start space-x-3 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: currentTheme.primaryColor }}>
               <Activity size={24} />
            </div>
            <span className="hidden lg:block font-bold text-lg tracking-tight">FDA Studio</span>
         </div>

         <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {[
                { id: 'input', label: t.input, icon: <FileText size={20} /> },
                { id: 'pipeline', label: t.pipeline, icon: <GitBranch size={20} /> },
                { id: 'notes', label: t.notes, icon: <Bot size={20} /> },
                { id: 'dashboard', label: t.dashboard, icon: <LayoutDashboard size={20} /> },
            ].map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${
                        activeTab === item.id 
                        ? 'text-white shadow-md' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    style={activeTab === item.id ? { backgroundColor: currentTheme.primaryColor } : {}}
                >
                    {item.icon}
                    <span className="hidden lg:block font-medium">{item.label}</span>
                </button>
            ))}

            <div className="my-4 border-t border-gray-100 dark:border-gray-800"></div>

             <button onClick={() => setIsWheelOpen(true)} className="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <Flower2 size={20} style={{ color: currentTheme.primaryColor }} />
                <span className="hidden lg:block font-medium">{t.spinWheel}</span>
             </button>
             <button onClick={() => setIsSettingsOpen(true)} className="w-full flex items-center space-x-3 p-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                <Settings size={20} />
                <span className="hidden lg:block font-medium">{t.settings}</span>
             </button>
         </nav>

         {/* Execution Log in Sidebar */}
         <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20 h-48 lg:h-64 flex flex-col">
             <div className="flex items-center gap-2 mb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                 <Terminal size={12} /> Execution Logs
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                 {logs.length === 0 ? (
                     <div className="text-xs text-gray-400 italic text-center py-4">No logs yet</div>
                 ) : (
                     logs.map(log => (
                         <div key={log.id} className="text-xs p-2 rounded bg-white dark:bg-gray-800/80 border-l-2 shadow-sm" style={{ borderColor: log.type === 'error' ? 'red' : log.type === 'success' ? 'green' : currentTheme.secondaryColor }}>
                             <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                 <span>{log.timestamp}</span>
                             </div>
                             <div className="text-gray-700 dark:text-gray-300 break-words leading-tight">
                                 {log.message}
                             </div>
                         </div>
                     ))
                 )}
                 <div ref={logsEndRef} />
             </div>
         </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20 lg:ml-64 p-4 lg:p-8 overflow-y-auto">
        
        {/* Top Bar */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold mb-1" style={{ color: currentTheme.primaryColor }}>
                    {state.language === Language.ZH ? currentTheme.nameZh : currentTheme.nameEn} Edition
                </h1>
                <p className="text-gray-500 dark:text-gray-400">{t.subtitle}</p>
            </div>

            <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setState(prev => ({ ...prev, language: prev.language === Language.EN ? Language.ZH : Language.EN }))}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
                >
                   <Globe size={20} />
                </button>
                <button 
                  onClick={() => setState(prev => ({ ...prev, themeMode: prev.themeMode === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT }))}
                  className="p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
                >
                   {state.themeMode === ThemeMode.LIGHT ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {renderStatusCard(t.level, state.level, 10, currentTheme.accentColor, <Award size={18} />)}
            {renderStatusCard(t.health, state.health, 100, '#10b981', <Activity size={18} />)}
            {renderStatusCard(t.mana, state.mana, 100, '#3b82f6', <Zap size={18} />)}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 rounded-xl shadow-lg flex flex-col justify-center">
                <span className="text-gray-400 text-sm mb-1">{t.theme}</span>
                <span className="font-bold text-lg flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: currentTheme.primaryColor }}></span>
                    {state.language === Language.ZH ? currentTheme.nameZh : currentTheme.nameEn}
                </span>
            </div>
        </div>

        {/* Content Area */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 min-h-[600px] shadow-xl border border-white/20">
            
            {activeTab === 'input' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        <div className="flex-1 flex flex-col">
                            <label className="mb-2 font-semibold text-gray-700 dark:text-gray-300">510(k) Template Content</label>
                            <textarea 
                                className="flex-1 w-full min-h-[300px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 outline-none transition-all resize-none font-mono text-sm"
                                style={{ '--tw-ring-color': currentTheme.primaryColor } as React.CSSProperties}
                                placeholder="Paste your device description, indications for use, and clinical strategy here to start the pipeline..."
                                value={inputText}
                                onChange={e => setInputText(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="mb-2 font-semibold text-gray-700 dark:text-gray-300">Observations</label>
                            <textarea 
                                className="flex-1 w-full min-h-[150px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 outline-none transition-all resize-none text-sm"
                                style={{ '--tw-ring-color': currentTheme.primaryColor } as React.CSSProperties}
                                placeholder="Notes and observations..."
                                value={observationText}
                                onChange={e => setObservationText(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'pipeline' && (
                <ReviewPipeline 
                  theme={currentTheme}
                  apiKeys={state.apiKeys}
                  globalInput={inputText}
                  onLog={addLog}
                  onUpdateStats={updateStats}
                  mana={state.mana}
                />
            )}

            {activeTab === 'notes' && (
               <NoteKeeper 
                 theme={currentTheme}
                 apiKeys={state.apiKeys}
                 onLog={addLog}
               />
            )}

            {activeTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold mb-6">Review Progress</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'Mon', tasks: 4 },
                                    { name: 'Tue', tasks: 3 },
                                    { name: 'Wed', tasks: 7 },
                                    { name: 'Thu', tasks: 5 },
                                    { name: 'Fri', tasks: 8 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip contentStyle={{ backgroundColor: state.themeMode === ThemeMode.DARK ? '#1f2937' : '#fff', borderRadius: '8px' }} />
                                    <Bar dataKey="tasks" fill={currentTheme.primaryColor} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold mb-6">Agent Performance</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[
                                    { name: 'Step 1', accuracy: 85 },
                                    { name: 'Step 2', accuracy: 88 },
                                    { name: 'Step 3', accuracy: 92 },
                                    { name: 'Step 4', accuracy: 90 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip contentStyle={{ backgroundColor: state.themeMode === ThemeMode.DARK ? '#1f2937' : '#fff', borderRadius: '8px' }} />
                                    <Line type="monotone" dataKey="accuracy" stroke={currentTheme.secondaryColor} strokeWidth={3} dot={{ fill: currentTheme.primaryColor }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </main>

      {/* Modals */}
      <FlowerWheel 
        isOpen={isWheelOpen} 
        onClose={() => setIsWheelOpen(false)} 
        onSelectTheme={(theme) => {
            setState(prev => ({ ...prev, currentFlowerId: theme.id }));
        }} 
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={state.language}
        apiKeys={state.apiKeys}
        onUpdateKey={(key, val) => setState(prev => ({ ...prev, apiKeys: { ...prev.apiKeys, [key]: val } }))}
      />

    </div>
  );
};

export default App;

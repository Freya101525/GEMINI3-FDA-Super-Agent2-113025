import React from 'react';
import { X, Key } from 'lucide-react';
import { Language, AppState } from '../types';
import { TRANSLATIONS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  apiKeys: AppState['apiKeys'];
  onUpdateKey: (provider: keyof AppState['apiKeys'], value: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, language, apiKeys, onUpdateKey 
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const providers: (keyof AppState['apiKeys'])[] = ['openai', 'gemini', 'anthropic', 'xai'];

  // Mock checking environment variables (in a real app, these are build-time or server-injected)
  const hasEnvKey = (key: string) => {
    // In a browser build, process.env might be polyfilled or empty.
    // This is just for UI demonstration based on the prompt's request.
    return process.env[`REACT_APP_${key.toUpperCase()}_API_KEY`] || process.env.API_KEY; 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold flex items-center text-gray-900 dark:text-white">
            <Key className="w-5 h-5 mr-2 text-primary" />
            {t.apiKeys}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your API keys below. Keys found in the environment will be hidden for security.
          </p>

          {providers.map((provider) => {
             const isEnvLoaded = provider === 'gemini' && !!process.env.API_KEY; 
             
             return (
              <div key={provider} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {provider} API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={isEnvLoaded ? '' : apiKeys[provider]}
                    onChange={(e) => onUpdateKey(provider, e.target.value)}
                    disabled={isEnvLoaded}
                    placeholder={isEnvLoaded ? t.apiKeyHint : `sk-...`}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white ${
                        isEnvLoaded ? 'bg-gray-100 text-gray-500 cursor-not-allowed italic' : ''
                    }`}
                  />
                  {isEnvLoaded && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 text-xs font-semibold px-2 py-0.5 bg-green-100 rounded">
                          ENV
                      </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-primary text-white rounded-lg hover:brightness-110 transition-all font-medium"
           >
             {t.close}
           </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
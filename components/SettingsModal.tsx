
import React, { useState } from 'react';
import { X, Check, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { TextSize, ThemeColor, TranslationMode, TextColor } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  'English', 'Chinese (Simplified)', 'Japanese'
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useSettings();
  const [showApiKey, setShowApiKey] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* API Key Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => updateSettings({ apiKey: e.target.value })}
                placeholder="Enter your Gemini API Key"
                className="w-full p-2.5 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Your API key is stored locally in your browser.
            </p>
          </div>

          {/* Target Language */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Target Language</label>
            <select
              value={settings.targetLanguage}
              onChange={(e) => updateSettings({ targetLanguage: e.target.value })}
              className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Text Size */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Text Size</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Small', value: TextSize.SMALL },
                { label: 'Normal', value: TextSize.NORMAL },
                { label: 'Large', value: TextSize.LARGE },
                { label: 'XL', value: TextSize.XLARGE },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSettings({ textSize: option.value })}
                  className={`py-2 text-sm rounded-md border transition-all ${
                    settings.textSize === option.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Text Color</label>
            <div className="flex gap-2 justify-between">
              {[
                { label: 'Standard', value: TextColor.STANDARD, bg: 'bg-slate-900' },
                { label: 'Gray', value: TextColor.GRAY, bg: 'bg-gray-500' },
                { label: 'Blue', value: TextColor.BLUE, bg: 'bg-blue-900' },
                { label: 'Indigo', value: TextColor.INDIGO, bg: 'bg-indigo-900' },
                { label: 'Green', value: TextColor.EMERALD, bg: 'bg-emerald-900' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSettings({ textColor: option.value })}
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                    settings.textColor === option.value
                      ? 'ring-2 ring-blue-500 ring-offset-2 border-transparent'
                      : 'border-gray-200 hover:scale-110'
                  }`}
                  aria-label={option.label}
                >
                  <div className={`w-6 h-6 rounded-full ${option.bg}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Theme Color */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Window Background</label>
            <div className="grid grid-cols-6 gap-2">
              {[
                { label: 'Light', value: ThemeColor.LIGHT, bg: 'bg-white border-gray-200' },
                { label: 'Dark', value: ThemeColor.DARK, bg: 'bg-slate-900 border-slate-700' },
                { label: 'Blue', value: ThemeColor.BLUE, bg: 'bg-blue-50 border-blue-100' },
                { label: 'Cream', value: ThemeColor.CREAM, bg: 'bg-orange-50 border-orange-100' },
                { label: 'Mint', value: ThemeColor.MINT, bg: 'bg-emerald-50 border-emerald-100' },
                { label: 'Rose', value: ThemeColor.ROSE, bg: 'bg-rose-50 border-rose-100' },
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSettings({ themeColor: theme.value })}
                  className={`group relative w-10 h-10 rounded-full border-2 shadow-sm mx-auto ${theme.bg} ${
                    settings.themeColor === theme.value ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }`}
                  aria-label={theme.label}
                >
                   {settings.themeColor === theme.value && (
                     <span className={`absolute inset-0 flex items-center justify-center ${theme.value === ThemeColor.DARK ? 'text-white' : 'text-gray-900'}`}>
                       <Check size={14} />
                     </span>
                   )}
                </button>
              ))}
            </div>
          </div>

          {/* Translation Mode */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Translation Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateSettings({ mode: TranslationMode.FAST })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.mode === TranslationMode.FAST
                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-emerald-700 mb-1">Fast Mode</div>
                <div className="text-xs text-gray-500">Uses Gemini 2.5 Flash. Instant results for everyday text.</div>
              </button>

              <button
                onClick={() => updateSettings({ mode: TranslationMode.PRECISE })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.mode === TranslationMode.PRECISE
                    ? 'bg-purple-50 border-purple-500 ring-1 ring-purple-500'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-purple-700 mb-1">Precise Mode</div>
                <div className="text-xs text-gray-500">Uses Gemini 3 Pro. Better for complex nuances and creative text.</div>
              </button>
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, Pin, X, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { TranslationState, ThemeColor } from '../types';
import { translateText } from '../services/geminiService';
import { SettingsModal } from './SettingsModal';

interface DraggableWindowProps {
  initialText?: string;
}

export const DraggableWindow: React.FC<DraggableWindowProps> = ({ initialText }) => {
  const { settings, updateSettings } = useSettings();
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ w: 647, h: 400 });
  const [splitRatio, setSplitRatio] = useState(0.5); // Set to 0.5 for equal height default
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [translationState, setTranslationState] = useState<TranslationState>({
    sourceText: '',
    translatedText: '',
    isTranslating: false,
    error: null,
  });

  const windowRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const resizeStartRef = useRef<{ w: number; h: number; x: number; y: number } | null>(null);
  const dividerDragRef = useRef<{ startY: number; startRatio: number } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const debounceTimerRef = useRef<number | null>(null);

  // --- Toast Logic ---
  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2000);
  };

  // --- Translation Logic ---
  const handleTranslate = useCallback(async (text: string) => {
    if (!text.trim()) {
      setTranslationState(prev => ({ ...prev, isTranslating: false }));
      return;
    }

    setTranslationState(prev => ({ 
      ...prev, 
      isTranslating: true, 
      error: null 
    }));
    
    try {
      const result = await translateText(
        text, 
        settings.targetLanguage, 
        settings.mode,
        settings.apiKey // Pass the API key from settings
      );
      setTranslationState(prev => ({ 
        ...prev, 
        translatedText: result, 
        isTranslating: false 
      }));
    } catch (err) {
      setTranslationState(prev => ({ 
        ...prev, 
        isTranslating: false, 
        error: "Translation failed. Please check your network or API key." 
      }));
    }
  }, [settings.targetLanguage, settings.mode, settings.apiKey]);

  // --- Input Change Logic (Typing/Pasting) ---
  const handleSourceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setTranslationState(prev => ({ ...prev, sourceText: newText }));

    if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = window.setTimeout(() => {
        if (newText.trim()) {
            handleTranslate(newText);
        } else {
            setTranslationState(prev => ({ ...prev, translatedText: '', isTranslating: false }));
        }
    }, 800);
  };

  // Handle external text selection
  useEffect(() => {
    const handleSelection = (e: MouseEvent) => {
      if (windowRef.current && windowRef.current.contains(e.target as Node)) {
        return;
      }

      const selection = window.getSelection();
      const text = selection?.toString();
      
      if (text && text.trim().length > 0) {
        setIsVisible(true);
        // Immediate update for selection
        setTranslationState(prev => ({ ...prev, sourceText: text }));
        handleTranslate(text);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [handleTranslate]);

  // Re-translate if language changes
  useEffect(() => {
    if (translationState.sourceText && !translationState.isTranslating && translationState.translatedText) {
       handleTranslate(translationState.sourceText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.targetLanguage, settings.mode]);

  // Clean up
  useEffect(() => {
      return () => {
          if (debounceTimerRef.current) window.clearTimeout(debounceTimerRef.current);
          if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
      }
  }, []);


  // --- Context Menu (Right Click) Logic ---
  // Note: We rely on native browser behavior for the source textarea to handle pasting.
  // This prevents "Clipboard API blocked" errors that occur with programmatic reading.
  
  const handleTargetContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!translationState.translatedText) return;

    try {
      await navigator.clipboard.writeText(translationState.translatedText);
      // Determine toast message based on target language
      const isAsianLang = settings.targetLanguage.includes('Chinese') || settings.targetLanguage.includes('Japanese');
      showToast(isAsianLang ? "译文已拷贝~" : "Translation Copied~");
    } catch (err) {
      console.error('Failed to write clipboard', err);
      showToast("Copy failed - please select and copy manually");
    }
  };

  // --- Drag & Resize Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (settings.isPinned) return;
    // Prevent drag when clicking buttons or inputs/textareas
    if ((e.target as HTMLElement).closest('button, textarea')) return; 
    
    e.preventDefault(); 
    
    dragStartRef.current = { 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    resizeStartRef.current = {
      w: size.w,
      h: size.h,
      x: e.clientX,
      y: e.clientY
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDividerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); 
    dividerDragRef.current = {
      startY: e.clientY,
      startRatio: splitRatio
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragStartRef.current) {
      const newX = e.clientX - dragStartRef.current.x;
      const newY = e.clientY - dragStartRef.current.y;
      
      const maxX = window.innerWidth - 100; // Allow some overlap
      const maxY = window.innerHeight - 30;

      setPosition({
        x: Math.min(Math.max(-200, newX), maxX), // Allow slight off-screen
        y: Math.min(Math.max(0, newY), maxY)
      });
      return;
    }

    if (resizeStartRef.current) {
      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;
      
      setSize({
        w: Math.max(320, resizeStartRef.current.w + deltaX),
        h: Math.max(250, resizeStartRef.current.h + deltaY)
      });
      return;
    }

    if (dividerDragRef.current) {
      const deltaY = e.clientY - dividerDragRef.current.startY;
      const contentHeight = size.h - 30; 
      const ratioDelta = deltaY / contentHeight;
      
      const newRatio = Math.min(Math.max(0.2, dividerDragRef.current.startRatio + ratioDelta), 0.8);
      setSplitRatio(newRatio);
    }
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
    resizeStartRef.current = null;
    dividerDragRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const getTextColor = () => settings.themeColor === ThemeColor.DARK ? 'text-gray-100' : settings.textColor;
  const getSubTextColor = () => settings.themeColor === ThemeColor.DARK ? 'text-gray-400' : 'text-gray-500';
  const getBorderColor = () => settings.themeColor === ThemeColor.DARK ? 'border-gray-700' : 'border-black/10';
  const getDividerColor = () => {
     if (settings.themeColor === ThemeColor.DARK) return 'bg-gray-700 hover:bg-gray-600';
     return 'bg-gray-200 hover:bg-gray-300';
  }

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-xl hover:bg-blue-700 transition-all z-50 animate-in fade-in zoom-in"
      >
        <RefreshCw size={24} />
      </button>
    );
  }

  return (
    <>
      <div 
        ref={windowRef}
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: size.w,
          height: size.h,
        }}
        className={`fixed top-0 left-0 z-40 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border backdrop-blur-md flex flex-col transition-colors duration-200 ${settings.themeColor} ${getBorderColor()}`}
      >
        {/* Header - Compact */}
        <div 
          onMouseDown={handleMouseDown}
          className={`flex items-center justify-between px-3 border-b ${getBorderColor()} cursor-move select-none rounded-t-xl shrink-0 h-[30px]`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${translationState.isTranslating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
            <span className={`text-xs font-medium ${getSubTextColor()}`}>kmk's LexRead</span>
          </div>
          <div className="flex items-center gap-1">
             <button 
              onClick={() => updateSettings({ isPinned: !settings.isPinned })}
              className={`p-1 rounded-md transition-colors ${settings.isPinned ? 'bg-blue-100 text-blue-600' : `text-gray-400 hover:bg-black/5`}`}
              title="Pin Window"
            >
              <Pin size={12} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`p-1 rounded-md text-gray-400 hover:bg-black/5 transition-colors`}
              title="Settings"
            >
              <Settings size={12} />
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className={`p-1 rounded-md text-gray-400 hover:bg-red-100 hover:text-red-500 transition-colors`}
              title="Minimize"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          
          {/* Top Pane: Source */}
          <div style={{ height: `${splitRatio * 100}%` }} className="flex flex-col min-h-0">
             <div className="px-3 py-1 flex justify-between items-center text-[10px] uppercase tracking-wider opacity-60 shrink-0 select-none">
                <span>Detected Language</span>
                <span>{translationState.sourceText.length} chars</span>
             </div>
             
             {/* Use standard Textarea for native behavior */}
             <textarea 
               className={`flex-1 w-full p-3 bg-transparent resize-none border-none outline-none ${settings.textSize} ${getTextColor()}`}
               placeholder="Select text on page or paste here..."
               value={translationState.sourceText}
               onChange={handleSourceChange}
               spellCheck={false}
             />
          </div>

          {/* Divider */}
          <div 
            className={`h-2 w-full cursor-row-resize flex items-center justify-center shrink-0 transition-colors ${getDividerColor()}`}
            onMouseDown={handleDividerMouseDown}
          >
            <div className="w-8 h-1 bg-black/10 rounded-full" />
          </div>

          {/* Bottom Pane: Target */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-3 py-1 flex justify-between items-center text-[10px] uppercase tracking-wider opacity-60 shrink-0 select-none">
                <span>{settings.targetLanguage}</span>
                <span>{translationState.translatedText.length} chars</span>
             </div>
             
             <div 
               className={`flex-1 overflow-y-auto p-3 ${settings.textSize} ${getTextColor()} selection:bg-blue-200 selection:text-blue-900`}
               onContextMenu={handleTargetContextMenu}
             >
                {translationState.isTranslating ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                    <RefreshCw className="animate-spin" size={20} />
                    <span className="text-sm">Translating...</span>
                  </div>
                ) : translationState.error ? (
                  <div className="flex flex-col items-center justify-center h-full text-red-500 gap-2 text-center">
                    <AlertCircle size={20} />
                    <span className="text-sm">{translationState.error}</span>
                  </div>
                ) : translationState.translatedText ? (
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {translationState.translatedText}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center opacity-30 select-none">
                    <span className="italic">Translation will appear here</span>
                  </div>
                )}
             </div>
          </div>

        </div>
        
        {/* Resize Handle */}
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50 flex items-end justify-end p-0.5 opacity-50 hover:opacity-100"
          onMouseDown={handleResizeMouseDown}
        >
          <div className={`w-2 h-2 border-r-2 border-b-2 ${settings.themeColor === ThemeColor.DARK ? 'border-gray-500' : 'border-gray-400'}`} />
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/75 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm animate-in fade-in zoom-in duration-200 flex items-center gap-2 shadow-lg z-50 pointer-events-none">
            <CheckCircle2 size={16} className="text-green-400"/>
            {toastMessage}
          </div>
        )}
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};
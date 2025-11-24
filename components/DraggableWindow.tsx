
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
  const [splitRatio, setSplitRatio] = useState(0.4); 
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

  // --- Toast Logic ---
  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 2000);
  };

  // --- Translation Logic ---
  const handleTranslate = useCallback(async (text: string) => {
    if (!text.trim()) return;

    setTranslationState(prev => ({ 
      ...prev, 
      sourceText: text, 
      translatedText: '', 
      isTranslating: true, 
      error: null 
    }));
    
    try {
      const result = await translateText(text, settings.targetLanguage, settings.mode);
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
  }, [settings.targetLanguage, settings.mode]);

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


  // --- Context Menu (Right Click) Logic ---
  const handleSourceContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim().length > 0) {
        // Explicitly clear and replace
        setTranslationState(prev => ({
          ...prev,
          sourceText: '',
          translatedText: '',
          isTranslating: true,
          error: null
        }));
        
        // Short delay to ensure state update visual (optional, but good for UX) then process
        setTimeout(() => handleTranslate(text), 50);

        const isAsianLang = settings.targetLanguage.includes('Chinese') || settings.targetLanguage.includes('Japanese');
        showToast(isAsianLang ? "原文已粘贴~" : "Source Pasted~");
      }
    } catch (err) {
      console.error('Failed to read clipboard', err);
      showToast("Clipboard access denied");
    }
  };

  const handleTargetContextMenu = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!translationState.translatedText) return;

    try {
      await navigator.clipboard.writeText(translationState.translatedText);
      // Determine toast message based on target language
      const isAsianLang = settings.targetLanguage.includes('Chinese') || settings.targetLanguage.includes('Japanese');
      // Updated message to "Copied" (拷贝) instead of "Pasted" (粘贴)
      showToast(isAsianLang ? "译文已拷贝~" : "Translation Copied~");
    } catch (err) {
      console.error('Failed to write clipboard', err);
    }
  };

  // --- Drag & Resize Logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (settings.isPinned) return;
    if ((e.target as HTMLElement).closest('button')) return; 
    
    e.preventDefault(); // CRITICAL: Prevents text selection/native drag which causes "sticking"
    
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
            <span className="text-lg leading-none select-none">📖</span>
            <span className={`text-sm font-semibold tracking-wide select-none ${getTextColor()}`}>kmk's LexRead</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => updateSettings({ isPinned: !settings.isPinned })}
              className={`p-1 rounded-md transition-colors ${settings.isPinned ? 'bg-blue-100 text-blue-600' : `hover:bg-black/5 ${getSubTextColor()}`}`}
              title={settings.isPinned ? "Unpin Window" : "Pin Window"}
            >
              <Pin size={12} className={settings.isPinned ? "fill-current" : ""} />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`p-1 rounded-md hover:bg-black/5 transition-colors ${getSubTextColor()}`}
              title="Settings"
            >
              <Settings size={12} />
            </button>
            <button 
              onClick={() => setIsVisible(false)}
              className={`p-1 rounded-md hover:bg-red-100 hover:text-red-600 transition-colors ${getSubTextColor()}`}
              title="Close"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Split Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative group/window">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-200 pointer-events-none">
              <CheckCircle2 size={16} className="text-green-400" />
              {toastMessage}
            </div>
          )}

          {/* Source Pane */}
          <div 
            style={{ height: `${splitRatio * 100}%` }} 
            className="w-full flex flex-col min-h-0"
          >
            {/* Source Label Bar */}
            <div className={`px-4 py-1.5 shrink-0 flex items-center justify-between border-b ${getBorderColor()} bg-opacity-50 ${settings.themeColor}`}>
               <span className={`text-xs font-medium ${getSubTextColor()}`}>Detected Language</span>
               <span className={`text-xs ${getSubTextColor()} font-mono`}>
                 字符 {translationState.sourceText.length} 个
               </span>
            </div>

            {/* Source Content - Right Click to Paste */}
            <div 
              onContextMenu={handleSourceContextMenu}
              className="flex-1 p-4 overflow-y-auto min-h-0 cursor-text hover:bg-black/[0.02] transition-colors"
              title="Right click to paste from clipboard"
            >
              {translationState.sourceText ? (
                <p className={`${settings.textSize} ${getTextColor()} leading-relaxed whitespace-pre-wrap`}>
                  {translationState.sourceText}
                </p>
              ) : (
                <div className={`h-full flex flex-col items-center justify-center text-center ${getSubTextColor()} opacity-60`}>
                  <p className="text-sm italic">Select text on page</p>
                  <p className="text-xs mt-1">- or -</p>
                  <p className="text-xs font-medium mt-1">Right Click to Paste</p>
                </div>
              )}
            </div>
          </div>

          {/* Draggable Divider */}
          <div 
             onMouseDown={handleDividerMouseDown}
             className={`h-2 shrink-0 cursor-row-resize flex items-center justify-center transition-colors group ${getDividerColor()}`}
          >
             <div className="w-8 h-1 rounded-full bg-black/10 group-hover:bg-black/20" />
          </div>

          {/* Target Pane */}
          <div 
             className="flex-1 flex flex-col w-full min-h-0"
          >
             {/* Target Label Bar */}
             <div className={`px-4 py-1.5 shrink-0 flex items-center justify-between border-b ${getBorderColor()} bg-opacity-50 ${settings.themeColor}`}>
               <div className="flex items-center gap-2">
                 <span className={`text-xs font-medium ${getSubTextColor()}`}>{settings.targetLanguage}</span>
                 {translationState.isTranslating && (
                   <span className="text-xs text-blue-500 font-medium animate-pulse">Translating...</span>
                 )}
               </div>
               <span className={`text-xs ${getSubTextColor()} font-mono`}>
                 字符 {translationState.translatedText.length} 个
               </span>
             </div>

             {/* Target Content - Right Click to Copy */}
             <div 
               onContextMenu={handleTargetContextMenu}
               className="flex-1 p-4 overflow-y-auto min-h-0 cursor-text hover:bg-black/[0.02] transition-colors"
               title="Right click to copy translation"
             >
               {translationState.error ? (
                  <div className="flex items-center gap-2 text-red-500 text-sm mt-2 bg-red-50 p-2 rounded-md">
                    <AlertCircle size={16} />
                    {translationState.error}
                  </div>
               ) : (
                 <p className={`${settings.textSize} ${getTextColor()} leading-relaxed font-medium whitespace-pre-wrap`}>
                   {translationState.translatedText}
                 </p>
               )}
             </div>
          </div>

          {/* Window Resize Handle */}
          <div 
            onMouseDown={handleResizeMouseDown}
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize flex items-center justify-center opacity-50 hover:opacity-100 z-50"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0L10 10L0 10" stroke={settings.themeColor === ThemeColor.DARK ? "white" : "black"} strokeWidth="2"/>
            </svg>
          </div>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </>
  );
};

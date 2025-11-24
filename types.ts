
export enum TranslationMode {
  FAST = 'FAST', // Gemini 2.5 Flash
  PRECISE = 'PRECISE' // Gemini 3 Pro
}

export enum TextSize {
  SMALL = 'text-sm',
  NORMAL = 'text-base',
  LARGE = 'text-lg',
  XLARGE = 'text-xl'
}

export enum TextColor {
  STANDARD = 'text-slate-900',
  GRAY = 'text-gray-600',
  BLUE = 'text-blue-900',
  INDIGO = 'text-indigo-900',
  EMERALD = 'text-emerald-900'
}

export enum ThemeColor {
  LIGHT = 'bg-white/95',
  DARK = 'bg-slate-900/95',
  BLUE = 'bg-blue-50/95',
  CREAM = 'bg-orange-50/95',
  MINT = 'bg-emerald-50/95',
  ROSE = 'bg-rose-50/95'
}

export interface AppSettings {
  targetLanguage: string;
  textSize: TextSize;
  textColor: TextColor;
  themeColor: ThemeColor;
  mode: TranslationMode;
  isPinned: boolean;
}

export interface TranslationState {
  sourceText: string;
  translatedText: string;
  isTranslating: boolean;
  error: string | null;
}

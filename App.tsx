import React from 'react';
import { SettingsProvider } from './contexts/SettingsContext';
import { DraggableWindow } from './components/DraggableWindow';
import { DemoContent } from './components/DemoContent';

function App() {
  return (
    <SettingsProvider>
      <div className="min-h-screen bg-slate-50 relative selection:bg-blue-200 selection:text-blue-900">
        {/* Background Patterns for visual interest */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        {/* Main Content Layer */}
        <div className="relative z-10">
          <DemoContent />
        </div>

        {/* Floating App Layer */}
        <DraggableWindow />
        
      </div>
    </SettingsProvider>
  );
}

export default App;

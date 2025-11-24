import React from 'react';
import { SettingsProvider } from './contexts/SettingsContext';
import { DraggableWindow } from './components/DraggableWindow';

function App() {
  return (
    <SettingsProvider>
      {/* 
        The outer div must be transparent and fill the Electron window.
        The DraggableWindow component will now fill this container.
      */}
      <div className="w-full h-full bg-transparent overflow-hidden">
        <DraggableWindow />
      </div>
    </SettingsProvider>
  );
}

export default App;
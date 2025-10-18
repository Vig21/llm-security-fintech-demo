import React, { useState } from 'react';
import SecurityDemo from './components/SecurityDemo';
import ChatInterface from './components/ChatInterface';

function App() {
  const [mode, setMode] = useState('demo'); // 'demo' or 'chat'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-4">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setMode('demo')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              mode === 'demo' 
                ? 'bg-cyan-500 text-white' 
                : 'bg-white/10 text-cyan-200'
            }`}
          >
            Security Demo
          </button>
          <button
            onClick={() => setMode('chat')}
            className={`px-6 py-3 rounded-lg font-semibold ${
              mode === 'chat' 
                ? 'bg-cyan-500 text-white' 
                : 'bg-white/10 text-cyan-200'
            }`}
          >
            Live Chat (LLM)
          </button>
        </div>
        
        {mode === 'demo' ? <SecurityDemo /> : <ChatInterface />}
      </div>
    </div>
  );
}

export default App;

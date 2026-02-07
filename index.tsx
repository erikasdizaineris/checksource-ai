import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

console.log("checkSourceAI: Starting module execution...");

const init = () => {
  try {
    const container = document.getElementById('root');
    if (!container) {
      console.error("checkSourceAI: Root container not found in DOM.");
      return;
    }

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("checkSourceAI: Application mounted successfully.");
  } catch (err) {
    console.error("checkSourceAI: Initialization failed:", err);
    const container = document.getElementById('root');
    if (container) {
      container.innerHTML = `<div style="padding: 20px; color: red;">Failed to start application. Please check the console for details.</div>`;
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
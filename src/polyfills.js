// Global/browser polyfills for Vite + libraries expecting Node globals
// Ensure this file is imported first in src/index.jsx

// global
if (typeof globalThis !== 'undefined') {
  // Map global to globalThis for libraries expecting Node's global
  if (typeof globalThis.global === 'undefined') {
    globalThis.global = globalThis;
  }
  // Also assign to window for browser compatibility
  if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
    window.global = globalThis;
  }
}

// process - Enhanced for Material-UI compatibility
if (typeof globalThis.process === 'undefined') {
  globalThis.process = { 
    env: {
      NODE_ENV: import.meta.env.MODE || 'development'
    },
    browser: true,
    version: 'v16.0.0',
    versions: { node: '16.0.0' }
  };
  
  // Also assign to window
  if (typeof window !== 'undefined') {
    window.process = globalThis.process;
  }
}

// setImmediate fallback
if (typeof globalThis.setImmediate === 'undefined') {
  globalThis.setImmediate = (fn, ...args) => setTimeout(fn, 0, ...args);
}

// speechSynthesis safe guard cancel helper (optional)
export const cancelSpeech = () => {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {
    // no-op
  }
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.onerror = function (message, source, lineno, colno, error) {
  document.body.innerHTML = `<div style="color:red; font-size:20px; padding:20px;">
    <h1>Application Error</h1>
    <p>Message: ${message}</p>
    <p>Source: ${source}:${lineno}</p>
    <pre>${error?.stack || ''}</pre>
  </div>`;
};

console.log("App starting...");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

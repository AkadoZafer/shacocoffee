import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'
import { logClientError } from './services/errorTrackingService'

window.onerror = function (message, source, lineno, colno, error) {
  void logClientError({
    source: 'app',
    severity: 'error',
    message,
    stack: error?.stack || `${source || 'unknown'}:${lineno || 0}:${colno || 0}`,
    route: window.location?.pathname || ''
  })
  return false
}

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason
  void logClientError({
    source: 'app',
    severity: 'error',
    message: reason?.message || reason || 'Unhandled promise rejection',
    stack: reason?.stack || '',
    route: window.location?.pathname || ''
  })
})

console.log("App starting...");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

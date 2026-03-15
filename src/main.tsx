import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { attachPerfTools } from './perf/attachPerfTools'
import './styles/chat.css'

attachPerfTools()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

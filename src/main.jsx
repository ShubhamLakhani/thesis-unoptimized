import { Profiler, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Profiler id="react-render-profiler" onRender={console.log}>
      <App />
    </Profiler>
  </StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { GameProvider } from './contexts/GameContext'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GameProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </GameProvider>
  </React.StrictMode>
)

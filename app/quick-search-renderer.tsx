import React from 'react'
import ReactDOM from 'react-dom/client'
import { QuickSearchStandalone } from '@/app/components/PasswordManager/QuickSearchStandalone'
import { ThemeProvider } from '@/app/components/theme-provider'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <QuickSearchStandalone />
    </ThemeProvider>
  </React.StrictMode>
)
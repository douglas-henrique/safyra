import { BrowserWindow, globalShortcut } from 'electron'
import { handle } from '@/lib/main/shared'

export const registerGlobalShortcutHandlers = (window: BrowserWindow) => {
  // Register global shortcuts
  handle('register-global-shortcut', (accelerator: string, action: string) => {
    try {
      const ret = globalShortcut.register(accelerator, () => {
        // Handle different actions
        switch (action) {
          case 'show-quick-search':
            // Show the window if it's hidden/minimized
            if (window.isMinimized()) {
              window.restore()
            }
            if (!window.isVisible()) {
              window.show()
            }
            // Focus the window
            window.focus()
            // Send event to renderer to open quick search
            window.webContents.send('global-shortcut-triggered', action)
            break
          default:
            console.log('Unknown global shortcut action:', action)
        }
      })
      
      if (!ret) {
        console.log('Registration failed for accelerator:', accelerator)
      }
      
      return ret
    } catch (error) {
      console.error('Error registering global shortcut:', error)
      return false
    }
  })

  // Unregister specific global shortcut
  handle('unregister-global-shortcut', (accelerator: string) => {
    globalShortcut.unregister(accelerator)
  })

  // Unregister all global shortcuts
  handle('unregister-all-global-shortcuts', () => {
    globalShortcut.unregisterAll()
  })

  // Handle show quick search (can be called from renderer)
  handle('show-quick-search', () => {
    // Show the window if it's hidden/minimized
    if (window.isMinimized()) {
      window.restore()
    }
    if (!window.isVisible()) {
      window.show()
    }
    // Focus the window
    window.focus()
    // Send event to renderer to open quick search
    window.webContents.send('global-shortcut-triggered', 'show-quick-search')
  })
}
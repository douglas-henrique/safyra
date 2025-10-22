import { contextBridge, ipcRenderer} from 'electron'
import { conveyor } from '@/lib/conveyor/api'

// Use `contextBridge` APIs to expose APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('conveyor', conveyor)
    contextBridge.exposeInMainWorld('electronAPI', {
      onGlobalShortcut: (callback: (action: string) => void) => {
        ipcRenderer.on('global-shortcut-triggered', (_, action) => callback(action))
      },
      removeGlobalShortcutListener: () => {
        ipcRenderer.removeAllListeners('global-shortcut-triggered')
      },
      resizeQuickSearchWindow: (height: number) => {
        ipcRenderer.send('resize-quick-search-window', height)
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  ;(window as any).conveyor = conveyor
  ;(window as any).electronAPI = {
    onGlobalShortcut: (callback: (action: string) => void) => {
      ipcRenderer.on('global-shortcut-triggered', (_, action) => callback(action))
    },
    removeGlobalShortcutListener: () => {
      ipcRenderer.removeAllListeners('global-shortcut-triggered')
    },
    resizeQuickSearchWindow: (height: number) => {
      ipcRenderer.send('resize-quick-search-window', height)
    }
  }
}
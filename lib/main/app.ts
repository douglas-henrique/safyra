import { BrowserWindow, shell, app, ipcMain, Tray, Menu, nativeImage } from 'electron'
import { join } from 'path'
import appIcon from '@/resources/build/icon.png?asset'
import { registerResourcesProtocol } from './protocols'
import { registerWindowHandlers } from '@/lib/conveyor/handlers/window-handler'
import { registerAppHandlers } from '@/lib/conveyor/handlers/app-handler'
import { registerPasswordHandlers } from '@/lib/conveyor/handlers/password-handler'
import { registerGlobalShortcutHandlers } from '@/lib/conveyor/handlers/global-shortcut-handler'
import { showQuickSearchWindow } from './quick-search-window'

// Global reference to prevent garbage collection
let tray: Tray | null = null

function createTray(mainWindow: BrowserWindow) {
  // Create tray icon
  const icon = nativeImage.createFromPath(appIcon)
  tray = new Tray(icon.resize({ width: 16, height: 16 }))
  
  // Create context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar Safyra',
      click: () => {
        if (mainWindow.isMinimized()) {
          mainWindow.restore()
        }
        mainWindow.show()
        mainWindow.focus()
      }
    },
    {
      label: 'Busca Rápida (Ctrl+Alt+P)',
      click: () => {
        showQuickSearchWindow()
      }
    },
    { type: 'separator' },
    {
      label: 'Ocultar',
      click: () => {
        mainWindow.hide()
      }
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => {
        // Set flag to actually quit the app
        ;(app as any).isQuiting = true
        // Clean up global shortcuts before quitting
        const { globalShortcut } = require('electron')
        globalShortcut.unregisterAll()
        // Destroy tray
        if (tray) {
          tray.destroy()
          tray = null
        }
        app.quit()
      }
    }
  ])
  
  // Set tooltip and context menu
  tray.setToolTip('Safyra - Gerenciador de Senhas')
  tray.setContextMenu(contextMenu)
  
  // Handle single click to show window (Windows/Linux behavior)
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.show()
      mainWindow.focus()
    }
  })
  
  // Handle double-click to show window (additional fallback)
  tray.on('double-click', () => {
    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }
    mainWindow.show()
    mainWindow.focus()
  })
}

export async function createAppWindow() {
  // Register custom protocol for resources
  registerResourcesProtocol()

  // Create the main window.
  const mainWindow = new BrowserWindow({
    width: 1290,
    height: 670,
    show: false,
    backgroundColor: '#1c1c1c',
    icon: appIcon,
    // frame: false,
    titleBarStyle: 'hiddenInset',
    title: 'Safyra',

    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
    },
  })

  // Register IPC events for the main window.
  registerWindowHandlers(mainWindow)
  registerAppHandlers(app)
  registerPasswordHandlers(app)
  registerGlobalShortcutHandlers(mainWindow)

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    
    // Create system tray
    createTray(mainWindow)
    
    // Register global shortcut for quick search directly in main process
    try {
      const { globalShortcut } = require('electron')
      const ret = globalShortcut.register('CommandOrControl+Alt+P', () => {
        // Show only the quick search window, not the main window
        showQuickSearchWindow()
      })
      
      if (ret) {
        console.log('Global shortcut Ctrl+Alt+P registered successfully')
      } else {
        console.log('Failed to register global shortcut Ctrl+Alt+P')
      }
    } catch (error) {
      console.error('Error registering global shortcut:', error)
    }
  })

  // Handle window close event - minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!(app as any).isQuiting) {
      event.preventDefault()
      mainWindow.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  ipcMain.on('titlebar-double-click', () => {
    if (!mainWindow) return;

    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  return mainWindow
}

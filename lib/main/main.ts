import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createAppWindow } from './app'

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  // Create app window
  createAppWindow()

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    const allWindows = BrowserWindow.getAllWindows()
    if (allWindows.length === 0) {
      createAppWindow()
    } else {
      // If window exists but is hidden, show it
      const mainWindow = allWindows[0]
      if (!mainWindow.isVisible()) {
        mainWindow.show()
      }
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })
})

// Don't quit when all windows are closed - keep running in background
// This allows the app to stay in system tray
app.on('window-all-closed', () => {
  // On macOS, keep the app running in background
  // On other platforms, also keep running (different from default behavior)
  // The app will only quit when user explicitly chooses "Exit" from tray menu
  
  // Don't clean up global shortcuts here since app is staying alive
  console.log('All windows closed, but keeping app running in background')
})

app.on('will-quit', () => {
  // Clean up global shortcuts before quitting
  const { globalShortcut } = require('electron')
  globalShortcut.unregisterAll()
})

// In this file, you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

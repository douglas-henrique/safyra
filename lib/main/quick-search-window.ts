import { BrowserWindow, screen, app, ipcMain } from 'electron'
import { join } from 'path'
import appIcon from '@/resources/build/icon.png?asset'

let quickSearchWindow: BrowserWindow | null = null
let resizeAnimation: NodeJS.Timeout | null = null

// Função para animar o redimensionamento suavemente
function animateResize(
  window: BrowserWindow,
  targetHeight: number,
  duration: number = 200
): void {
  if (resizeAnimation) {
    clearTimeout(resizeAnimation)
  }

  // Verificar se a janela ainda existe
  if (!window || window.isDestroyed()) {
    return
  }

  const startTime = Date.now()
  const currentBounds = window.getBounds()
  const startHeight = currentBounds.height
  const heightDiff = targetHeight - startHeight

  if (Math.abs(heightDiff) < 3) {
    // Se a diferença for muito pequena, aplica diretamente
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
    const newY = screenHeight - targetHeight - 20
    
    window.setBounds({
      x: screenWidth - 420,
      y: newY,
      width: 400,
      height: targetHeight
    })
    return
  }

  const animate = () => {
    // Verificar novamente se a janela ainda existe
    if (!window || window.isDestroyed()) {
      resizeAnimation = null
      return
    }

    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Usando easing cubic-bezier para suavidade (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    
    const currentHeight = Math.round(startHeight + (heightDiff * easeOut))
    
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
    const newY = screenHeight - currentHeight - 20
    
    try {
      window.setBounds({
        x: screenWidth - 420,
        y: newY,
        width: 400,
        height: currentHeight
      })
    } catch (error) {
      // Se houver erro, pare a animação
      resizeAnimation = null
      return
    }

    if (progress < 1) {
      resizeAnimation = setTimeout(animate, 16) // ~60fps
    } else {
      resizeAnimation = null
    }
  }

  animate()
}

export function createQuickSearchWindow(): BrowserWindow {
  if (quickSearchWindow && !quickSearchWindow.isDestroyed()) {
    return quickSearchWindow
  }

  // Get primary display bounds
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize

  // Create a small overlay window
  quickSearchWindow = new BrowserWindow({
    width: 400,
    height: 60, // Altura inicial menor, apenas para o input
    x: width - 420, // 20px from right edge
    y: height - 80, // 20px from bottom edge
    show: false,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    focusable: true,
    backgroundColor: '#00000000', // Completely transparent
    transparent: true,
    opacity: 1.0,
    vibrancy: undefined, // Disable vibrancy effects
    icon: appIcon,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
      backgroundThrottling: false,
    },
  })

  // Load the quick search page
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    quickSearchWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/quick-search.html`)
  } else {
    quickSearchWindow.loadFile(join(__dirname, '../renderer/quick-search.html'))
  }

  // Auto-hide when losing focus
  quickSearchWindow.on('blur', () => {
    if (quickSearchWindow && !quickSearchWindow.isDestroyed()) {
      quickSearchWindow.hide()
    }
  })

  // Cleanup when closed
  quickSearchWindow.on('closed', () => {
    // Clear any ongoing animation
    if (resizeAnimation) {
      clearTimeout(resizeAnimation)
      resizeAnimation = null
    }
    // Remove the IPC listener for this window
    ipcMain.removeAllListeners('resize-quick-search-window')
    quickSearchWindow = null
  })

  // Handle resize requests from renderer
  ipcMain.on('resize-quick-search-window', (_, height: number) => {
    if (quickSearchWindow && !quickSearchWindow.isDestroyed()) {
      animateResize(quickSearchWindow, height, 250) // 250ms de animação
    }
  })

  return quickSearchWindow
}

export function showQuickSearchWindow(): void {
  const window = createQuickSearchWindow()
  
  if (window.isVisible()) {
    window.hide()
  } else {
    // Reposition in case screen resolution changed
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    window.setBounds({
      x: width - 420,
      y: height - 80, // Posição inicial menor
      width: 400,
      height: 60 // Altura inicial menor
    })
    
    window.show()
    window.focus()
  }
}

export function hideQuickSearchWindow(): void {
  if (quickSearchWindow && !quickSearchWindow.isDestroyed()) {
    quickSearchWindow.hide()
  }
}

export function getQuickSearchWindow(): BrowserWindow | null {
  return quickSearchWindow
}
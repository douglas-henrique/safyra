/// <reference types="electron-vite/node" />

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.web' {
  const content: string
  export default content
}

// Global window types
declare global {
  interface Window {
    conveyor: {
      app: any
      window: any
      password: any
      globalShortcut: any
    }
    electronAPI: {
      onGlobalShortcut: (callback: (action: string) => void) => void
      removeGlobalShortcutListener: () => void
      resizeQuickSearchWindow: (height: number) => void
    }
  }
}

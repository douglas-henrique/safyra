import { ConveyorApi } from '@/lib/preload/shared'

export class GlobalShortcutApi extends ConveyorApi {
  // Global shortcut operations
  registerGlobalShortcut = (accelerator: string, action: string) => 
    this.invoke('register-global-shortcut', accelerator, action)
  
  unregisterGlobalShortcut = (accelerator: string) => 
    this.invoke('unregister-global-shortcut', accelerator)
  
  unregisterAllGlobalShortcuts = () => 
    this.invoke('unregister-all-global-shortcuts')
  
  showQuickSearch = () => 
    this.invoke('show-quick-search')
}
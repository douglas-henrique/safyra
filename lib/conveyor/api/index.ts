import { electronAPI } from '@electron-toolkit/preload'
import { AppApi } from './app-api'
import { WindowApi } from './window-api'
import { PasswordApi } from './password-api'
import { GlobalShortcutApi } from './global-shortcut-api'

export const conveyor = {
  app: new AppApi(electronAPI),
  window: new WindowApi(electronAPI),
  password: new PasswordApi(electronAPI),
  globalShortcut: new GlobalShortcutApi(electronAPI),
}

export type ConveyorApi = typeof conveyor

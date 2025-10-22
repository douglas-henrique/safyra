import { z } from 'zod'

export const globalShortcutIpcSchema = {
  'register-global-shortcut': {
    args: z.tuple([z.string(), z.string()]),
    return: z.boolean(),
  },
  'unregister-global-shortcut': {
    args: z.tuple([z.string()]),
    return: z.void(),
  },
  'unregister-all-global-shortcuts': {
    args: z.tuple([]),
    return: z.void(),
  },
  'show-quick-search': {
    args: z.tuple([]),
    return: z.void(),
  },
}
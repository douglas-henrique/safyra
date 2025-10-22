import { z } from 'zod'

// Password interface schema
const passwordSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  website: z.string(),
  category: z.string(),
  lastModified: z.string(),
  strength: z.enum(['weak', 'medium', 'strong']),
  password: z.string().optional(),
})

// Password creation schema (without id and lastModified)
const createPasswordSchema = passwordSchema.omit({ id: true, lastModified: true })

// Password update schema (partial)
const updatePasswordSchema = passwordSchema.partial()

// Define password IPC channel schemas
export const passwordIpcSchema = {
  // Password CRUD operations
  getAllPasswords: {
    args: z.tuple([]),
    return: z.array(passwordSchema.omit({ password: true })),
  },
  getPassword: {
    args: z.tuple([z.string()]),
    return: passwordSchema.omit({ password: true }),
  },
  createPassword: {
    args: z.tuple([createPasswordSchema]),
    return: passwordSchema.omit({ password: true }),
  },
  updatePassword: {
    args: z.tuple([z.string(), updatePasswordSchema]),
    return: passwordSchema.omit({ password: true }),
  },
  deletePassword: {
    args: z.tuple([z.string()]),
    return: z.boolean(),
  },
  
  // Safe storage operations
  storePassword: {
    args: z.tuple([passwordSchema]),
    return: z.boolean(),
  },
  retrievePassword: {
    args: z.tuple([z.string()]),
    return: passwordSchema,
  },
  deleteStoredPassword: {
    args: z.tuple([z.string()]),
    return: z.boolean(),
  },
} as const

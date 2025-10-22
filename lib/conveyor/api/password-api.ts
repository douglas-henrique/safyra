import { ConveyorApi } from '@/lib/preload/shared'

export interface Password {
  id: string
  name: string
  username: string
  email: string
  website: string
  category: string
  lastModified: string
  strength: "weak" | "medium" | "strong"
  password?: string
}

export class PasswordApi extends ConveyorApi {
  version = () => this.invoke('version')
  
  // Password CRUD operations
  getAllPasswords = () => this.invoke('getAllPasswords')
  getPassword = (id: string) => this.invoke('getPassword', id)
  createPassword = (password: Omit<Password, 'id' | 'lastModified'>) => this.invoke('createPassword', password)
  updatePassword = (id: string, password: Partial<Password>) => this.invoke('updatePassword', id, password)
  deletePassword = (id: string) => this.invoke('deletePassword', id)
  
  // Safe storage operations
  storePassword = (password: Password) => this.invoke('storePassword', password)
  retrievePassword = (id: string) => this.invoke('retrievePassword', id)
  deleteStoredPassword = (id: string) => this.invoke('deleteStoredPassword', id)
}

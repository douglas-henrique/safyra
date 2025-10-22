import { type App } from 'electron'
import { handle } from '@/lib/main/shared'
import { safeStorage } from 'electron'
import { Password } from '../api/password-api'
import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'

// Paths for persistent storage
const getStoragePath = () => {
  const userDataPath = app.getPath('userData')
  const safyraDataPath = path.join(userDataPath, 'safyra-data')
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(safyraDataPath)) {
    fs.mkdirSync(safyraDataPath, { recursive: true })
  }
  
  return safyraDataPath
}

const getMetadataFilePath = () => path.join(getStoragePath(), 'passwords-metadata.json')
const getPasswordFilePath = (id: string) => path.join(getStoragePath(), `password-${id}.enc`)

// Load metadata from file
const loadPasswordMetadata = (): Password[] => {
  try {
    const metadataPath = getMetadataFilePath()
    if (fs.existsSync(metadataPath)) {
      const data = fs.readFileSync(metadataPath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading password metadata:', error)
  }
  return []
}

// Save metadata to file
const savePasswordMetadata = (metadata: Password[]) => {
  try {
    const metadataPath = getMetadataFilePath()
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2))
  } catch (error) {
    console.error('Error saving password metadata:', error)
    throw new Error('Failed to save password metadata')
  }
}

// Load encrypted password from file
const loadEncryptedPassword = (id: string): Buffer | null => {
  try {
    const passwordPath = getPasswordFilePath(id)
    if (fs.existsSync(passwordPath)) {
      return fs.readFileSync(passwordPath)
    }
  } catch (error) {
    console.error(`Error loading encrypted password for ID ${id}:`, error)
  }
  return null
}

// Save encrypted password to file
const saveEncryptedPassword = (id: string, encryptedData: Buffer) => {
  try {
    const passwordPath = getPasswordFilePath(id)
    fs.writeFileSync(passwordPath, encryptedData)
  } catch (error) {
    console.error(`Error saving encrypted password for ID ${id}:`, error)
    throw new Error('Failed to save encrypted password')
  }
}

// Delete encrypted password file
const deleteEncryptedPassword = (id: string) => {
  try {
    const passwordPath = getPasswordFilePath(id)
    if (fs.existsSync(passwordPath)) {
      fs.unlinkSync(passwordPath)
    }
  } catch (error) {
    console.error(`Error deleting encrypted password for ID ${id}:`, error)
  }
}

// Initialize storage - load existing data
let passwordMetadata: Password[] = []

export const registerPasswordHandlers = (electronApp: App) => {
  // Initialize by loading existing data
  passwordMetadata = loadPasswordMetadata()
  console.log(`Loaded ${passwordMetadata.length} passwords from persistent storage`)
  console.log(`Storage location: ${getStoragePath()}`)
  
  // Add cleanup function for app uninstall (optional - can be called manually)
  const cleanupAllData = () => {
    try {
      const storagePath = getStoragePath()
      if (fs.existsSync(storagePath)) {
        fs.rmSync(storagePath, { recursive: true, force: true })
        console.log('All password data has been cleaned up')
      }
    } catch (error) {
      console.error('Error cleaning up data:', error)
    }
  }
  
  // Expose cleanup function (can be called via developer tools if needed)
  global.cleanupSafyraData = cleanupAllData
  // Password CRUD operations
  handle('getAllPasswords', () => {
    return passwordMetadata.map(p => ({ ...p, password: undefined })) // Don't return passwords in list
  })
  
  handle('getPassword', (id: string) => {
    const password = passwordMetadata.find(p => p.id === id)
    if (!password) {
      throw new Error('Password not found')
    }
    return { ...password, password: undefined } // Don't return password in details
  })
  
  handle('createPassword', (passwordData: Omit<Password, 'id' | 'lastModified'>) => {
    const newPassword: Password = {
      ...passwordData,
      id: Date.now().toString(),
      lastModified: new Date().toISOString(),
    }
    
    // Store metadata without password for listing
    const passwordMeta = { ...newPassword, password: undefined }
    passwordMetadata.push(passwordMeta)
    
    // Save metadata to file
    savePasswordMetadata(passwordMetadata)
    
    return newPassword // Return with password for immediate storage
  })
  
  handle('updatePassword', (id: string, passwordData: Partial<Password>) => {
    const index = passwordMetadata.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Password not found')
    }
    
    passwordMetadata[index] = {
      ...passwordMetadata[index],
      ...passwordData,
      lastModified: new Date().toISOString(),
    }
    
    return { ...passwordMetadata[index], password: undefined }
  })
  
  handle('deletePassword', (id: string) => {
    const index = passwordMetadata.findIndex(p => p.id === id)
    if (index === -1) {
      throw new Error('Password not found')
    }
    
    // Delete encrypted password file
    deleteEncryptedPassword(id)
    
    // Remove from metadata array
    passwordMetadata.splice(index, 1)
    
    // Save updated metadata to file
    savePasswordMetadata(passwordMetadata)
    
    console.log(`Successfully deleted password and metadata for ID: ${id}`)
    return true
  })
  
  // Safe storage operations
  handle('storePassword', (password: Password) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Safe storage is not available on this system')
      }
      
      if (!password.password) {
        throw new Error('Password data is required for storage')
      }
      
      // Encrypt only the password field
      const encrypted = safeStorage.encryptString(password.password)
      
      // Save encrypted password to file
      saveEncryptedPassword(password.id, encrypted)
      
      // Update metadata (without password) and save to file
      const existingIndex = passwordMetadata.findIndex(p => p.id === password.id)
      const passwordMetaData = { ...password, password: undefined }
      
      if (existingIndex >= 0) {
        passwordMetadata[existingIndex] = passwordMetaData
      } else {
        passwordMetadata.push(passwordMetaData)
      }
      
      // Save metadata to file
      savePasswordMetadata(passwordMetadata)
      
      console.log(`Successfully stored encrypted password for ID: ${password.id}`)
      return true
    } catch (error) {
      console.error('Error storing password:', error)
      throw new Error('Failed to store password securely')
    }
  })
  
  handle('retrievePassword', (id: string) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error('Safe storage is not available on this system')
      }
      
      // Find password metadata
      const passwordMeta = passwordMetadata.find(p => p.id === id)
      if (!passwordMeta) {
        throw new Error('Password not found')
      }
      
      // Load encrypted password from file
      const encrypted = loadEncryptedPassword(id)
      if (!encrypted) {
        throw new Error('Encrypted password not found in secure storage')
      }
      
      // Decrypt the password
      const decryptedPassword = safeStorage.decryptString(encrypted)
      
      // Return password with decrypted data
      const fullPassword = { ...passwordMeta, password: decryptedPassword }
      
      console.log(`Successfully retrieved password for ID: ${id}`)
      return fullPassword
    } catch (error) {
      console.error('Error retrieving password:', error)
      throw new Error('Failed to retrieve password from safe storage')
    }
  })
  
  handle('deleteStoredPassword', (id: string) => {
    try {
      // Delete encrypted password file
      deleteEncryptedPassword(id)
      
      console.log(`Successfully deleted password for ID: ${id}`)
      return true
    } catch (error) {
      console.error('Error deleting password from safe storage:', error)
      throw new Error('Failed to delete password from safe storage')
    }
  })
}

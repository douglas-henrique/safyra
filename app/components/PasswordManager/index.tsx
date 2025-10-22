"use client"

import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { Sidebar } from "./Sidebar"
import { PasswordGrid } from "./PasswordGrid"
import { PasswordDetails } from "./PasswordDetails"
import { SearchBar } from "./SearchBar"
import { ActionButtons } from "./ActionButtons"
import { CreatePasswordModal } from "./CreatePasswordModal"
import { PasswordTypeSelection, type PasswordType } from "./PasswordTypeSelection"
import { QuickSearchWidget } from "./QuickSearchWidget"
import { Toast } from "./Toast"
import { Password } from "@/lib/conveyor/api/password-api"

// Re-export the Password interface for other components
export type { Password }

export function PasswordManager() {
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Passwords")
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false)
  const [selectedPasswordType, setSelectedPasswordType] = useState<PasswordType>("general")
  const [passwords, setPasswords] = useState<Password[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [isToastVisible, setIsToastVisible] = useState(false)

  // Load passwords on component mount
  useEffect(() => {
    loadPasswords()
  }, [])

  // Global keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        setIsQuickSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const loadPasswords = async () => {
    try {
      setLoading(true)
      setError(null)
      const allPasswords = await window.conveyor.password.getAllPasswords() as Password[]
      setPasswords(allPasswords)
      if (allPasswords.length > 0 && !selectedPassword) {
        setSelectedPassword(allPasswords[0])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load passwords')
      console.error('Error loading passwords:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredPasswords = passwords.filter((password) => {
    const matchesSearch =
      password.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.website.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Passwords" || password.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreatePassword = async (newPasswordData: Omit<Password, "id" | "lastModified">) => {
    try {
      setError(null)
      const newPassword = await window.conveyor.password.createPassword(newPasswordData) as Password
      
      // Store the password securely
      await window.conveyor.password.storePassword(newPassword)
      
      // Reload passwords to get the updated list
      await loadPasswords()
      setSelectedPassword(newPassword)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create password')
      console.error('Error creating password:', err)
    }
  }

  const handleDeletePassword = async (id: string) => {
    try {
      setError(null)
      await window.conveyor.password.deletePassword(id)
      await window.conveyor.password.deleteStoredPassword(id)
      
      // Reload passwords to get the updated list
      await loadPasswords()
      
      // Clear selection if deleted password was selected
      if (selectedPassword?.id === id) {
        setSelectedPassword(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete password')
      console.error('Error deleting password:', err)
    }
  }

  const handleRetrievePassword = async (id: string) => {
    try {
      setError(null)
      const fullPassword = await window.conveyor.password.retrievePassword(id) as Password
      return fullPassword
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve password')
      console.error('Error retrieving password:', err)
      throw err
    }
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setIsToastVisible(true)
  }

  const handlePasswordTypeSelect = (type: PasswordType) => {
    setSelectedPasswordType(type)
    setIsTypeSelectionOpen(false)
    setIsCreateModalOpen(true)
  }

  const handleCloseTypeSelection = () => {
    setIsTypeSelectionOpen(false)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
    setSelectedPasswordType("general")
  }
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className={`transition-all duration-300 ease-in-out ${sidebarVisible ? "w-64" : "w-0"} overflow-hidden`}>
        <Sidebar selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-4 ">
            <div className="flex items-center gap-4 ">
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="p-2 hover:bg-muted hover:cursor-pointer rounded-lg transition-colors"
                title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
              >
                <Menu className="w-5 h-5" />
              </button>
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Find a password or website..." />
            </div>
            <ActionButtons onNewPassword={() => setIsTypeSelectionOpen(true)} />
          </div>
        </div>

        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 flex flex-col p-6 overflow-hidden">
            <div className="mb-4 flex-shrink-0">
              <h2 className="text-2xl font-semibold text-balance">Passwords</h2>
              {error && (
                <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-muted-foreground">Loading passwords...</div>
                </div>
              ) : (
                <PasswordGrid
                  passwords={filteredPasswords}
                  selectedPassword={selectedPassword}
                  onPasswordSelect={setSelectedPassword}
                  onDeletePassword={handleDeletePassword}
                  onRetrievePassword={handleRetrievePassword}
                />
              )}
            </div>
          </div>
          
          <div className={`absolute top-0 right-0 h-full bg-card border-l border-border shadow-lg transition-all duration-300 ease-out ${
            selectedPassword ? 'w-96 translate-x-0 opacity-100' : 'w-96 translate-x-full opacity-0'
          } overflow-hidden`}>
        <PasswordDetails 
          password={selectedPassword} 
          onClose={() => setSelectedPassword(null)}
          onRetrievePassword={handleRetrievePassword}
          onEdit={(password) => {
            // TODO: Implement edit functionality
            console.log('Edit password:', password)
          }}
          onDelete={handleDeletePassword}
        />
          </div>
        </div>
      </div>

      <PasswordTypeSelection
        isOpen={isTypeSelectionOpen}
        onClose={handleCloseTypeSelection}
        onSelect={handlePasswordTypeSelect}
      />
      
      <CreatePasswordModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onSave={handleCreatePassword}
        passwordType={selectedPasswordType}
      />

      <QuickSearchWidget
        isOpen={isQuickSearchOpen}
        onClose={() => setIsQuickSearchOpen(false)}
        passwords={passwords}
        onRetrievePassword={handleRetrievePassword}
        onShowToast={showToast}
      />

      <Toast
        message={toastMessage}
        isVisible={isToastVisible}
        onClose={() => setIsToastVisible(false)}
      />
    </div>
  )
}

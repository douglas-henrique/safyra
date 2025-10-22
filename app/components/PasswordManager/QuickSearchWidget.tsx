"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Copy, X } from "lucide-react"
import type { Password } from "."

interface QuickSearchWidgetProps {
  isOpen: boolean
  onClose: () => void
  passwords: Password[]
  onRetrievePassword: (id: string) => Promise<Password>
  onShowToast: (message: string) => void
}

export function QuickSearchWidget({ 
  isOpen, 
  onClose, 
  passwords, 
  onRetrievePassword, 
  onShowToast 
}: QuickSearchWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setSearchQuery("")
      setFilteredPasswords([])
      // Focus the input after the animation
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 150)
    } else {
      setTimeout(() => setIsVisible(false), 200)
    }
  }, [isOpen])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = passwords.filter((password) => {
        const query = searchQuery.toLowerCase()
        return (
          password.name.toLowerCase().includes(query) ||
          password.username.toLowerCase().includes(query) ||
          password.email.toLowerCase().includes(query) ||
          password.website.toLowerCase().includes(query)
        )
      })
      setFilteredPasswords(filtered.slice(0, 5)) // Limit to 5 results
    } else {
      setFilteredPasswords([])
    }
  }, [searchQuery, passwords])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
    return undefined
  }, [isOpen, onClose])

  const handleCopyPassword = async (password: Password) => {
    try {
      const fullPassword = await onRetrievePassword(password.id)
      if (fullPassword.password) {
        await navigator.clipboard.writeText(fullPassword.password)
        onShowToast("Senha copiada!")
        onClose()
      }
    } catch (error) {
      console.error('Error copying password:', error)
      onShowToast("Erro ao copiar senha")
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 transition-all duration-200 ${
        isOpen ? 'bg-black/20' : 'bg-transparent pointer-events-none'
      }`}
      onClick={handleBackdropClick}
    >
      <div 
        className={`fixed bottom-4 right-4 w-96 bg-background border border-border rounded-lg shadow-2xl transition-all duration-200 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Busca Rápida</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por email, usuário ou site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* Results */}
        <div className="max-h-64 overflow-y-auto">
          {searchQuery.trim() && filteredPasswords.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma senha encontrada
            </div>
          )}
          
          {filteredPasswords.map((password) => (
            <div
              key={password.id}
              className="flex items-center justify-between p-3 hover:bg-muted/50 border-b border-border last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{password.name}</span>
                  <div className={`w-2 h-2 rounded-full ${
                    password.strength === 'strong' ? 'bg-green-500' :
                    password.strength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {password.username || password.email} | {password.website}
                </div>
              </div>
              
              <button
                onClick={() => handleCopyPassword(password)}
                className="ml-2 p-2 hover:bg-muted rounded-md transition-colors"
                title="Copiar senha"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {searchQuery.trim() && filteredPasswords.length > 0 && (
          <div className="p-2 text-xs text-muted-foreground text-center border-t border-border">
            Pressione Esc para fechar
          </div>
        )}
      </div>
    </div>
  )
}
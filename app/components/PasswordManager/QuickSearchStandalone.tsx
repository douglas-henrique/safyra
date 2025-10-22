"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Copy, X } from "lucide-react"
import type { Password } from "./index"

// Chaves para persistência no localStorage
const SEARCH_STATE_KEY = 'quickSearchState'
const SEARCH_QUERY_KEY = 'quickSearchQuery'

export function QuickSearchStandalone() {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [filteredPasswords, setFilteredPasswords] = useState<Password[]>([])
  const [passwords, setPasswords] = useState<Password[]>([])
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Funções para persistir estado
  const saveSearchState = (query: string, results: Password[], expanded: boolean) => {
    try {
      localStorage.setItem(SEARCH_QUERY_KEY, query)
      localStorage.setItem(SEARCH_STATE_KEY, JSON.stringify({
        results,
        expanded,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.warn('Failed to save search state:', error)
    }
  }

  const restoreSearchState = () => {
    try {
      const savedQuery = localStorage.getItem(SEARCH_QUERY_KEY)
      const savedState = localStorage.getItem(SEARCH_STATE_KEY)
      
      if (savedQuery && savedState) {
        const state = JSON.parse(savedState)
        const isRecent = Date.now() - state.timestamp < 300000 // 5 minutos
        
        if (isRecent && state.results && state.expanded) {
          setSearchQuery(savedQuery)
          setDebouncedQuery(savedQuery)
          setFilteredPasswords(state.results)
          setIsExpanded(state.expanded)
          setShowResults(true)
          
          // Ajustar tamanho da janela baseado nos resultados salvos
          const baseHeight = 60 + 17
          const resultHeight = 60
          const maxResults = Math.min(state.results.length, 6)
          const calculatedHeight = baseHeight + (maxResults * resultHeight) + 16
          const finalHeight = Math.max(calculatedHeight, 160)
          
          setTimeout(() => {
            ;(window as any).electronAPI?.resizeQuickSearchWindow(finalHeight)
          }, 100)
          
          return true
        }
      }
    } catch (error) {
      console.warn('Failed to restore search state:', error)
    }
    
    return false
  }

  const clearSearchState = () => {
    try {
      localStorage.removeItem(SEARCH_QUERY_KEY)
      localStorage.removeItem(SEARCH_STATE_KEY)
    } catch (error) {
      console.warn('Failed to clear search state:', error)
    }
  }

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load passwords on mount and restore state
  useEffect(() => {
    const initializeWidget = async () => {
      await loadPasswords()
      
      // Tentar restaurar estado anterior
      const stateRestored = restoreSearchState()
      
      // Focus input when window opens
      setTimeout(() => {
        searchInputRef.current?.focus()
        // Se restaurou estado, mover cursor para o final
        if (stateRestored && searchInputRef.current) {
          const input = searchInputRef.current
          input.setSelectionRange(input.value.length, input.value.length)
        }
      }, stateRestored ? 200 : 100)
    }
    
    initializeWidget()
  }, [])

  // Handle expansion when there's a debounced query
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setIsExpanded(true)
      
      // Calculate dynamic height based on results
      const baseHeight = 60 + 17 // header + separator
      const resultHeight = 60 // each result item height
      const maxResults = Math.min(filteredPasswords.length, 6)
      const calculatedHeight = baseHeight + (maxResults * resultHeight) + 16 // 16px padding
      const finalHeight = Math.max(calculatedHeight, 160) // minimum expanded height
      
      // Resize window to calculated size
      ;(window as any).electronAPI?.resizeQuickSearchWindow(finalHeight)
      // Small delay to let expansion animation start before showing results
      setTimeout(() => setShowResults(true), 150)
    } else {
      setShowResults(false)
      // Resize window back to original size
      setTimeout(() => {
        setIsExpanded(false)
        ;(window as any).electronAPI?.resizeQuickSearchWindow(60)
      }, 200)
    }
  }, [debouncedQuery, filteredPasswords.length])

  // Filter passwords based on debounced search query
  useEffect(() => {
    if (debouncedQuery.trim()) {
      const filtered = passwords.filter((password) => {
        const query = debouncedQuery.toLowerCase()
        return (
          password.name.toLowerCase().includes(query) ||
          password.username.toLowerCase().includes(query) ||
          password.email.toLowerCase().includes(query) ||
          password.website.toLowerCase().includes(query)
        )
      })
      const limitedResults = filtered.slice(0, 6) // Limit to 6 results for small window
      setFilteredPasswords(limitedResults)
      
      // Salvar estado quando há resultados
      if (limitedResults.length > 0) {
        saveSearchState(debouncedQuery, limitedResults, true)
      }
    } else {
      setFilteredPasswords([])
      clearSearchState() // Limpar estado quando não há pesquisa
    }
  }, [debouncedQuery, passwords])

  // ESC to close window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Salvar estado antes de fechar
        if (debouncedQuery.trim() && filteredPasswords.length > 0) {
          saveSearchState(debouncedQuery, filteredPasswords, isExpanded)
        }
        window.close()
      }
    }

    const handleWindowClose = () => {
      // Salvar estado antes de fechar a janela
      if (debouncedQuery.trim() && filteredPasswords.length > 0) {
        saveSearchState(debouncedQuery, filteredPasswords, isExpanded)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('beforeunload', handleWindowClose)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('beforeunload', handleWindowClose)
    }
  }, [debouncedQuery, filteredPasswords, isExpanded])

  const loadPasswords = async () => {
    try {
      setLoading(true)
      const allPasswords = await window.conveyor.password.getAllPasswords() as Password[]
      setPasswords(allPasswords)
    } catch (err) {
      console.error('Error loading passwords:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyPassword = async (password: Password) => {
    try {
      const fullPassword = await window.conveyor.password.retrievePassword(password.id) as Password
      if (fullPassword.password) {
        await navigator.clipboard.writeText(fullPassword.password)
        
        // Salvar estado atual antes de fechar
        saveSearchState(debouncedQuery, filteredPasswords, isExpanded)
        
        // Show quick feedback and close window
        const button = document.querySelector(`[data-password-id="${password.id}"]`) as HTMLElement
        if (button) {
          button.textContent = '✓'
          button.className = button.className + ' copied'
          
          setTimeout(() => {
            window.close()
          }, 300)
        }
      }
    } catch (error) {
      console.error('Error copying password:', error)
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "strong":
        return "strength-strong"
      case "medium":
        return "strength-medium"
      case "weak":
        return "strength-weak"
      default:
        return "strength-weak"
    }
  }

  return (
    <div className={`quick-search-container ${isExpanded ? 'expanded' : ''}`}>
      {/* Header - sempre visível */}
      <div className="search-header">
        <Search className="search-icon" style={{ width: 16, height: 16 }} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar senhas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button
          onClick={() => {
            // Salvar estado antes de fechar
            if (debouncedQuery.trim() && filteredPasswords.length > 0) {
              saveSearchState(debouncedQuery, filteredPasswords, isExpanded)
            }
            window.close()
          }}
          className="close-button"
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* Separator - só aparece quando expandido */}
      {isExpanded && <div className="separator" />}

      {/* Results - só aparece quando expandido */}
      {isExpanded && (
        <div className={`results-container ${showResults ? 'visible' : ''}`}>
          {loading ? (
            <div className="loading">Carregando senhas...</div>
          ) : debouncedQuery.trim() && filteredPasswords.length === 0 ? (
            <div className="no-results">Nenhuma senha encontrada</div>
          ) : filteredPasswords.length > 0 ? (
            filteredPasswords.map((password) => (
              <div key={password.id} className="result-item">
                <div className="result-info">
                  <div className="result-name">
                    <div className={`strength-indicator ${getStrengthColor(password.strength)}`}></div>
                    <span>{password.name}</span>
                  </div>
                  <div className="result-details">
                    {password.username || password.email} | {password.website}
                  </div>
                </div>
                
                <button
                  data-password-id={password.id}
                  onClick={() => handleCopyPassword(password)}
                  className="copy-button"
                  title="Copiar senha"
                >
                  <Copy style={{ width: 14, height: 14 }} />
                </button>
              </div>
            ))
          ) : null}
        </div>
      )}
    </div>
  )
}
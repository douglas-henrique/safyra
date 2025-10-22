"use client"

import { useState, useEffect } from "react"
import { X, Eye, EyeOff, Copy, Share, Edit, ExternalLink, Trash2 } from "lucide-react"
import type { Password } from "."

interface PasswordDetailsProps {
  password: Password | null
  onClose: () => void
  onRetrievePassword?: (id: string) => Promise<Password>
  onEdit?: (password: Password) => void
  onDelete?: (id: string) => void
}

export function PasswordDetails({ password, onClose, onRetrievePassword, onEdit, onDelete }: PasswordDetailsProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue, setPasswordValue] = useState("••••••••••••")
  const [actualPassword, setActualPassword] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const handleEdit = () => {
    if (password && onEdit) {
      onEdit(password)
    }
  }

  const handleDelete = () => {
    if (password && onDelete) {
      if (confirm('Are you sure you want to delete this password?')) {
        onDelete(password.id)
      }
    }
  }

  const openWebsite = () => {
    if (password?.website) {
      const url = password.website.startsWith('http') ? password.website : `https://${password.website}`
      window.open(url, '_blank')
    }
  }

  const handleRetrievePassword = async () => {
    if (!password || !onRetrievePassword) return
    
    try {
      setLoading(true)
      const fullPassword = await onRetrievePassword(password.id)
      setActualPassword(fullPassword.password || null)
      if (fullPassword.password) {
        setPasswordValue(fullPassword.password)
      }
    } catch (error) {
      console.error('Error retrieving password:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset password display when password changes
  useEffect(() => {
    setActualPassword(null)
    setPasswordValue("••••••••••••")
    setShowPassword(false)
  }, [password?.id])

  // Control visibility animation
  useEffect(() => {
    if (password) {
      // Small delay to trigger animation after component mounts
      const timer = setTimeout(() => setIsVisible(true), 50)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
      return undefined
    }
  }, [password])

  return !!password && (
    <div className={`w-full h-full flex flex-col transition-all duration-300 ease-out ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Password Details</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm text-muted-foreground">Personal vault</div>
      </div>

      <div className="flex-1 overflow-hidden min-h-[350px] overflow-y-auto p-6 space-y-6">
        <div className="flex-1  ">
          <h3 className="text-lg font-medium mb-2">General</h3>

          <div className="space-y-4 h-full">
            <div className="flex-1 min-h-[60px] flex flex-col justify-center">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={password.name}
                  readOnly
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
                />
              </div>
            </div>

            <div className="flex-1 min-h-[60px] flex flex-col justify-center">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Website</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={password.website}
                  readOnly
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
                />
                <button
                  onClick={() => copyToClipboard(password.website)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy website"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {password.website && (
                  <button
                    onClick={openWebsite}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Open website"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-[60px] flex flex-col justify-center">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={password.username}
                  readOnly
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm text-foreground"
                />
                <button
                  onClick={() => copyToClipboard(password.username)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy username"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[60px] flex flex-col justify-center">
              <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
              <div className="flex items-center space-x-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={showPassword ? (actualPassword || passwordValue) : passwordValue}
                  readOnly
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm font-mono text-foreground"
                />
                {!actualPassword && (
                  <button
                    onClick={handleRetrievePassword}
                    disabled={loading}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    title="Retrieve password from safe storage"
                  >
                    {loading ? "..." : "🔓"}
                  </button>
                )}
                {actualPassword && (
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
                {actualPassword && (
                  <button
                    onClick={() => copyToClipboard(actualPassword)}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy password"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <h3 className="text-lg font-medium mb-2">Security</h3>
          <div className="flex flex-col text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Password strength:</span>
              <span className={`capitalize font-medium ${
                password.strength === 'strong' ? 'text-green-500' :
                password.strength === 'medium' ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {password.strength}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-muted-foreground">Last modified:</span>
              <span className="text-foreground">{password.lastModified}</span>
            </div>
            <div className="flex gap-2  mt-2">
              <span className="text-muted-foreground">Category:</span>
              <span className="text-foreground">{password.category}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border flex-shrink-0 bg-card">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => copyToClipboard(password.website)}
            className="flex items-center space-x-2 text-sm text-blue-500 hover:text-blue-400 transition-colors"
            title="Copy website URL"
          >
            <Share className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button 
            onClick={handleEdit}
            className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            title="Edit password"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button 
            onClick={handleDelete}
            className="flex items-center space-x-2 text-sm text-red-500 hover:text-red-400 transition-colors"
            title="Delete password"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>

        {password.website && (
          <button 
            onClick={openWebsite}
            className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Website</span>
          </button>
        )}
      </div>
    </div>
  )
}

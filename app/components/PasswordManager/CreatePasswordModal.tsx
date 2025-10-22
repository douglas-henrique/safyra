"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Eye, EyeOff, RefreshCw } from "lucide-react"
import type { Password } from "../PasswordManager"
import type { PasswordType } from "./PasswordTypeSelection"

interface CreatePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (password: Omit<Password, "id" | "lastModified">) => void
  passwordType?: PasswordType
}

export function CreatePasswordModal({ isOpen, onClose, onSave, passwordType = "general" }: CreatePasswordModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    website: "",
    password: "",
    category: "Personal",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const getCategories = () => {
    switch (passwordType) {
      case "website":
        return ["Social", "E-commerce", "Entertainment", "News", "Finance", "Email", "Work", "Personal"]
      case "server":
        return ["Database", "SSH", "FTP", "API", "Cloud", "Development", "Production", "Staging"]
      case "general":
      default:
        return ["Personal", "Work", "Finance", "Software", "Games", "Documents", "Other"]
    }
  }
  
  const categories = getCategories()

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      return
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking on the backdrop, not on the modal content
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    let password = ""
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password })
  }

  const getPasswordStrength = (password: string): "weak" | "medium" | "strong" => {
    if (password.length < 8) return "weak"
    if (password.length < 12) return "medium"
    return "strong"
  }

  const getModalTitle = () => {
    switch (passwordType) {
      case "website":
        return "Nova Senha de Site"
      case "server":
        return "Novas Credenciais de Servidor"
      case "general":
      default:
        return "Nova Senha Geral"
    }
  }

  const getFieldLabels = () => {
    switch (passwordType) {
      case "website":
        return {
          name: "Nome do Site",
          username: "Usuário/Login",
          email: "E-mail",
          website: "URL do Site",
          category: "Categoria"
        }
      case "server":
        return {
          name: "Nome do Servidor",
          username: "Usuário",
          email: "E-mail (opcional)",
          website: "Host/IP",
          category: "Tipo de Servidor"
        }
      case "general":
      default:
        return {
          name: "Nome",
          username: "Usuário",
          email: "E-mail",
          website: "Website/App",
          category: "Categoria"
        }
    }
  }

  const labels = getFieldLabels()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.password) return

    onSave({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      website: formData.website,
      password: formData.password, // Incluindo a senha
      category: formData.category,
      strength: getPasswordStrength(formData.password),
    })

    // Reset form
    setFormData({
      name: "",
      username: "",
      email: "",
      website: "",
      password: "",
      category: categories[0],
    })
    onClose()
  }

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] transition-opacity duration-200 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={handleBackdropClick}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
    >
      <div
        className={`bg-background border border-border rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto transition-all duration-200 relative ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">{getModalTitle()}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{labels.name} *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all pointer-events-auto"
              placeholder="e.g., Gmail Account"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{labels.website}</label>
            <input
              type="text"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all pointer-events-auto"
              placeholder={passwordType === 'server' ? 'e.g., 192.168.1.100 ou server.example.com' : 'e.g., gmail.com'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{labels.username}</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all pointer-events-auto"
              placeholder={passwordType === 'server' ? 'root, admin, user' : 'Username or email'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{labels.email}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all pointer-events-auto"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 pr-20 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter password"
                required
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={generatePassword}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title="Generate password"
                >
                  <RefreshCw className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
            {formData.password && (
              <div className="mt-1 text-xs text-muted-foreground">
                Strength:{" "}
                <span
                  className={`font-medium ${
                    getPasswordStrength(formData.password) === "strong"
                      ? "text-green-500"
                      : getPasswordStrength(formData.password) === "medium"
                        ? "text-yellow-500"
                        : "text-red-500"
                  }`}
                >
                  {getPasswordStrength(formData.password)}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">{labels.category}</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Save Password
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

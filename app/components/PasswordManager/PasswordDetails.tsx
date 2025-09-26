"use client"

import { useState } from "react"
import { X, Eye, EyeOff, Copy, Share, Edit } from "lucide-react"

interface PasswordDetailsProps {
  password: any
  onClose: () => void
}

export function PasswordDetails({ password, onClose }: PasswordDetailsProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [passwordValue] = useState("••••••••••••")

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return !!password && (
    <div className="w-80 bg-card border-l border-border flex flex-col h-screen">
      <div className="p-6 border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Password Details</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm text-muted-foreground">Personal vault</div>
      </div>

      <div className="flex-1 overflow-w-hidden overflow-y-auto p-3 space-y-6  h-screen">
        <div>
          <h3 className="text-lg font-medium mb-2">General</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={password.name}
                  readOnly
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Website</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={password.website}
                  readOnly
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm"
                />
                <button
                  onClick={() => copyToClipboard(password.website)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Username</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={password.username}
                  readOnly
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm"
                />
                <button
                  onClick={() => copyToClipboard(password.username)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
              <div className="flex items-center space-x-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={showPassword ? "MySecurePassword123!" : passwordValue}
                  readOnly
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-sm font-mono"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => copyToClipboard("MySecurePassword123!")}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">SSH Settings</h3>
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-muted-foreground">Port:</span>
            <span>22</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Security</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Password strength:</span>
              <span className="capitalize text-green-500">{password.strength}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Last modified:</span>
              <span>{password.lastModified}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t max-h-32 border-border flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button className="flex items-center space-x-2 text-sm text-blue-500 hover:text-blue-400 transition-colors">
            <Share className="w-4 h-4" />
            <span>Share this password</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>

        <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          Connect
        </button>
      </div>
    </div>
  )
}

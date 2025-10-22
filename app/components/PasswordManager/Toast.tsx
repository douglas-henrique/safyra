"use client"

import { useEffect } from "react"
import { CheckCircle, X } from "lucide-react"

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export function Toast({ message, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000) // Auto close after 3 seconds
      
      return () => clearTimeout(timer)
    }
    return undefined
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`bg-background border border-border rounded-lg shadow-lg p-4 flex items-center gap-3 transition-all duration-200 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <CheckCircle className="w-5 h-5 text-green-500" />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
"use client"

import { Plus } from "lucide-react"
import { SimpleThemeToggle } from "@/app/components/mode-toggle"

interface ActionButtonsProps {
  onNewPassword: () => void
}

export function ActionButtons({ onNewPassword }: ActionButtonsProps) {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onNewPassword}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Nova senha</span>
      </button>
      
      <SimpleThemeToggle />
    </div>
  )
}

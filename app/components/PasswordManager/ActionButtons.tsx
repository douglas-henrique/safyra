"use client"

import { Plus, Grid3X3, List, Settings } from "lucide-react"
import { useState } from "react"

interface ActionButtonsProps {
  onNewPassword: () => void
}

export function ActionButtons({ onNewPassword }: ActionButtonsProps) {
  // const [isDarkMode, setIsDarkMode] = useState(false)

  // const toggleDarkMode = () => {
  //   document.documentElement.classList.toggle('dark')
  //   setIsDarkMode(!isDarkMode)
  // }
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onNewPassword}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center space-x-2"
      >
        <Plus className="w-4 h-4" />
        <span>Nova senha</span>
      </button>
{/* 
      <div className="flex items-center  rounded-lg space-x-2">
        <button
          className="px-4 py-2 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors "
        >
          <Settings className="w-4 h-4" />
        </button>
      </div> */}
    </div>
  )
}

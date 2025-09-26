"use client"
import type { Password } from "."

interface PasswordCardProps {
  password: Password
  isSelected: boolean
  onClick: () => void
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const getStrengthColor = (strength: string) => {
  switch (strength) {
    case "strong":
      return "bg-green-500"
    case "medium":
      return "bg-yellow-500"
    case "weak":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

export function PasswordCard({ password, isSelected, onClick }: PasswordCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border text-left transition-all hover:border-primary/50 ${
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-card/80"
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-primary-foreground">{getInitials(password.name)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-foreground truncate">{password.name}</h3>
            <div className={`w-2 h-2 rounded-full ${getStrengthColor(password.strength)}`} />
          </div>
          <p className="text-sm text-muted-foreground truncate">{password.website}</p>
          <p className="text-xs text-muted-foreground">{password.username}</p>
        </div>
      </div>
    </button>
  )
}

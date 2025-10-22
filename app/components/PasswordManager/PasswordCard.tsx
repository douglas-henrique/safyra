"use client"
import type { Password } from "."

interface PasswordCardProps {
  password: Password
  isSelected: boolean
  onClick: () => void
  onDelete?: (id: string) => void
  onRetrievePassword?: (id: string) => Promise<Password>
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
      className={`w-full max-w-none h-[120px] p-5 rounded-lg border text-left transition-all hover:shadow-md hover:border-primary/50 ${
        isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-card/80"
      }`}
    >
      <div className="flex flex-row items-center h-full gap-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-primary-foreground">{getInitials(password.name)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h3 className="font-medium text-foreground truncate text-base">{password.name}</h3>
            <div className={`w-3 h-3 rounded-full ${getStrengthColor(password.strength)}`} />
          </div>
          <p className="text-sm text-muted-foreground truncate">{password.website}</p>
          <p className="text-sm text-muted-foreground truncate mt-1">{password.username || password.email}</p>
        </div>
      </div>
    </button>
  )
}

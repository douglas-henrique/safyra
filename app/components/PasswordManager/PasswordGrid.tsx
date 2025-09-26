"use client"
import type { Password } from "."
import { PasswordCard } from "./PasswordCard"

interface PasswordGridProps {
  passwords: Password[]
  selectedPassword: Password | null
  onPasswordSelect: (password: Password) => void
}

export function PasswordGrid({ passwords, selectedPassword, onPasswordSelect }: PasswordGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {passwords.map((password) => (
        <PasswordCard
          key={password.id}
          password={password}
          isSelected={selectedPassword?.id === password.id}
          onClick={() => onPasswordSelect(password)}
        />
      ))}
    </div>
  )
}

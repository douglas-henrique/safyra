"use client"
import type { Password } from "."
import { PasswordCard } from "./PasswordCard"

interface PasswordGridProps {
  passwords: Password[]
  selectedPassword: Password | null
  onPasswordSelect: (password: Password) => void
  onDeletePassword?: (id: string) => void
  onRetrievePassword?: (id: string) => Promise<Password>
}

export function PasswordGrid({ passwords, selectedPassword, onPasswordSelect, onDeletePassword, onRetrievePassword }: PasswordGridProps) {
  return (
    <div 
      className="grid gap-3"
      style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
    >
      {passwords.map((password) => (
        <PasswordCard
          key={password.id}
          password={password}
          isSelected={selectedPassword?.id === password.id}
          onClick={() => onPasswordSelect(password)}
          onDelete={onDeletePassword}
          onRetrievePassword={onRetrievePassword}
        />
      ))}
    </div>
  )
}

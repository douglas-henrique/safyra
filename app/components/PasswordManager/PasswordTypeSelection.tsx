"use client"

import { Globe, Server, Key, X } from "lucide-react"

export type PasswordType = "website" | "server" | "general"

interface PasswordTypeSelectionProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: PasswordType) => void
}

export function PasswordTypeSelection({ isOpen, onClose, onSelect }: PasswordTypeSelectionProps) {
  if (!isOpen) return null

  const passwordTypes = [
    {
      type: "website" as PasswordType,
      title: "Senha de Site",
      description: "Para logins de websites, redes sociais, e-commerce",
      icon: Globe,
      color: "from-blue-500 to-blue-600"
    },
    {
      type: "server" as PasswordType,
      title: "Credenciais de Servidores",
      description: "SSH, FTP, banco de dados, APIs e servidores",
      icon: Server,
      color: "from-green-500 to-green-600"
    },
    {
      type: "general" as PasswordType,
      title: "Senha Geral",
      description: "Aplicativos, softwares, cartões e outros",
      icon: Key,
      color: "from-purple-500 to-purple-600"
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Escolha o tipo de senha</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Selecione o tipo que melhor se adequa à sua necessidade
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-6">
          <div className="grid gap-4">
            {passwordTypes.map(({ type, title, description, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="flex items-start p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 transition-all duration-200 text-left group"
              >
                <div className={`p-3 rounded-lg bg-gradient-to-r ${color} mr-4 flex-shrink-0 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 rounded-b-lg">
          <p className="text-xs text-muted-foreground text-center">
            Você pode sempre editar essas informações depois de criar a senha
          </p>
        </div>
      </div>
    </div>
  )
}
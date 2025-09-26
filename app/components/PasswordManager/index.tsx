"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Sidebar } from "./Sidebar"
import { PasswordGrid } from "./PasswordGrid"
import { PasswordDetails } from "./PasswordDetails"
import { SearchBar } from "./SearchBar"
import { ActionButtons } from "./ActionButtons"
import { CreatePasswordModal } from "./CreatePasswordModal"

export interface Password {
  id: string
  name: string
  username: string
  email: string
  website: string
  category: string
  lastModified: string
  strength: "weak" | "medium" | "strong"
}

const mockPasswords: Password[] = [
  {
    id: "1",
    name: "Gmail Account",
    username: "user@gmail.com",
    email: "user@gmail.com",
    website: "gmail.com",
    category: "Email",
    lastModified: "2 days ago",
    strength: "strong",
  },
  {
    id: "2",
    name: "GitHub",
    username: "developer",
    email: "dev@company.com",
    website: "github.com",
    category: "Development",
    lastModified: "1 week ago",
    strength: "strong",
  },
  {
    id: "3",
    name: "Netflix",
    username: "moviefan",
    email: "user@gmail.com",
    website: "netflix.com",
    category: "Entertainment",
    lastModified: "3 days ago",
    strength: "medium",
  },
  {
    id: "4",
    name: "Bank Account",
    username: "john.doe",
    email: "john@email.com",
    website: "mybank.com",
    category: "Finance",
    lastModified: "1 day ago",
    strength: "strong",
  },
  {
    id: "5",
    name: "Social Media",
    username: "socialuser",
    email: "social@email.com",
    website: "facebook.com",
    category: "Social",
    lastModified: "5 days ago",
    strength: "weak",
  },
  {
    id: "6",
    name: "Work Email",
    username: "employee",
    email: "work@company.com",
    website: "outlook.com",
    category: "Work",
    lastModified: "2 hours ago",
    strength: "strong",
  },
]

export function PasswordManager() {
  const [selectedPassword, setSelectedPassword] = useState<Password | null>(mockPasswords[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Passwords")
  const [sidebarVisible, setSidebarVisible] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [passwords, setPasswords] = useState<Password[]>(mockPasswords)

  const filteredPasswords = mockPasswords.filter((password) => {
    const matchesSearch =
      password.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.website.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Passwords" || password.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreatePassword = (newPasswordData: Omit<Password, "id" | "lastModified">) => {
    const newPassword: Password = {
      ...newPasswordData,
      id: Date.now().toString(),
      lastModified: "Just now",
    }
    setPasswords([newPassword, ...passwords])
    setSelectedPassword(newPassword)
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <div className={`transition-all duration-300 ease-in-out ${sidebarVisible ? "w-64" : "w-0"} overflow-hidden`}>
        <Sidebar selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between mb-4 ">
            <div className="flex items-center gap-4 ">
              <button
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="p-2 hover:bg-muted hover:cursor-pointer rounded-lg transition-colors"
                title={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
              >
                <Menu className="w-5 h-5" />
              </button>
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Find a password or website..." />
            </div>
            <ActionButtons onNewPassword={() => setIsCreateModalOpen(true)} />
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-6 flex flex-col overflow-hidden">
            <div className="mb-4 flex-shrink-0">
              <h2 className="text-2xl font-semibold text-balance">Passwords</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              <PasswordGrid
                passwords={filteredPasswords}
                selectedPassword={selectedPassword}
                onPasswordSelect={setSelectedPassword}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out ${selectedPassword ? "w-auto" : "w-0"} overflow-hidden`}>
        <PasswordDetails password={selectedPassword} onClose={() => setSelectedPassword(null)} />
      </div>


      <CreatePasswordModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePassword}
      />
    </div>
  )
}

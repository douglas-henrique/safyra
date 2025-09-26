"use client"

// Using Lucide React icons instead of Heroicons for better compatibility
import { Key } from "lucide-react"

interface SidebarProps {
  selectedCategory: string
  onCategorySelect: (category: string) => void
}

const menuItems = [
  { name: "All Passwords", icon: Key, count: 127 },
  // { name: "Favorites", icon: Shield, count: 8 },
  // { name: "Secure Notes", icon: FileText, count: 12 },
  // { name: "Credit Cards", icon: CreditCard, count: 4 },
  // { name: "Identities", icon: ClipboardList, count: 3 },
  // { name: "Reports", icon: BarChart3, count: null },
]

export function Sidebar({ selectedCategory, onCategorySelect }: SidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">SecureVault</h1>
            <p className="text-sm text-muted-foreground">Password Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isSelected = selectedCategory === item.name

            return (
              <li key={item.name}>
                <button
                  onClick={() => onCategorySelect(item.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {item.count !== null && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isSelected ? "bg-primary-foreground text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* <div className="p-4 border-t border-border max-h-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-accent-foreground">JD</span>
          </div>
          <div className="flex-1 mt-3">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-muted-foreground">Personal vault</p>
          </div>
        </div>
      </div> */}
    </div>
  )
}

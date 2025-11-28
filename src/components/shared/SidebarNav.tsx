'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types/database.types'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FolderKanban, 
  Settings, 
  BarChart3,
  UserCircle,
  Ticket,
  Plus
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[] | 'all'
}

const navigationItems: NavItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    roles: 'all' 
  },
  { 
    name: 'Tickets', 
    href: '/tickets', 
    icon: Ticket,
    roles: 'all' 
  },
  { 
    name: 'New Ticket', 
    href: '/tickets/create', 
    icon: Plus,
    roles: ['user', 'org_admin', 'contractor'] 
  },
  { 
    name: 'Organizations', 
    href: '/admin/organizations', 
    icon: Building2,
    roles: ['super_admin'] 
  },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: Users,
    roles: ['super_admin', 'org_admin'] 
  },
  { 
    name: 'Projects', 
    href: '/projects', 
    icon: FolderKanban,
    roles: 'all' 
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart3,
    roles: ['super_admin', 'org_admin'] 
  },
  { 
    name: 'Profile', 
    href: '/profile', 
    icon: UserCircle,
    roles: 'all' 
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    roles: 'all' 
  },
]

interface SidebarNavProps {
  userRole: UserRole
}

export function SidebarNav({ userRole }: SidebarNavProps) {
  const pathname = usePathname()

  // Debug: log the role
  console.log('SidebarNav - Current role:', userRole)

  const filteredNavigation = navigationItems.filter((item) => {
    if (item.roles === 'all') return true
    return item.roles.includes(userRole)
  })

  // Debug: log filtered items
  console.log('SidebarNav - Filtered items:', filteredNavigation.map(i => i.name))

  return (
    <nav className="space-y-1">
      {filteredNavigation.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icon className={cn('h-5 w-5', isActive ? 'text-blue-700' : 'text-gray-500')} />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}

import { Badge } from '@/components/ui/badge'
import { UserRole } from '@/types/database.types'
import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

const roleConfig: Record<UserRole, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  super_admin: { label: 'Super Admin', variant: 'destructive' },
  org_admin: { label: 'Org Admin', variant: 'default' },
  contractor: { label: 'Contractor', variant: 'secondary' },
  user: { label: 'User', variant: 'outline' },
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = roleConfig[role]
  
  return (
    <Badge variant={config.variant} className={cn('', className)}>
      {config.label}
    </Badge>
  )
}

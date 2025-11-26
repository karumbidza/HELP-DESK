export interface TenantConfig {
  features: string[]
  limits: {
    users: number
    projects: number
  }
  theme: {
    primaryColor: string
  }
}

export const getTenantConfig = (organizationId: string): TenantConfig => {
  // In a real application, this would fetch from the database
  // For now, return default configuration
  return {
    features: ['projects', 'users', 'analytics'],
    limits: { 
      users: 50, 
      projects: 100 
    },
    theme: { 
      primaryColor: '#3B82F6' 
    }
  }
}

export const canAccessFeature = (
  organizationId: string,
  feature: string
): boolean => {
  const config = getTenantConfig(organizationId)
  return config.features.includes(feature)
}

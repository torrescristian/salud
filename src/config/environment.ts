export const config = {
  // Configuración de la API
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    timeout: 10000,
  },
  
  // Configuración de React Query
  reactQuery: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 3,
    refetchOnWindowFocus: false,
  },
  
  // Configuración de la aplicación
  app: {
    name: 'Control Médico',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
    debug: import.meta.env.DEV,
  },
  
  // Configuración de características
  features: {
    enableNotifications: true,
    enableOfflineMode: false,
    enableAnalytics: import.meta.env.PROD,
  },
  
  // Configuración de validación
  validation: {
    glucose: {
      min: 0,
      max: 1000,
    },
    pressure: {
      systolic: { min: 50, max: 300 },
      diastolic: { min: 30, max: 200 },
    },
  },
} as const;

export type Config = typeof config;

import { UserProfile, DailyEntry, GlucoseMeasurement, PressureMeasurement, InsulinEntry, UserMedication } from '../types/health'

// Clave para almacenamiento local
const STORAGE_KEYS = {
  USER_PROFILE: 'user_profile',
  DAILY_ENTRIES: 'daily_entries',
  GLUCOSE_MEASUREMENTS: 'glucose_measurements',
  PRESSURE_MEASUREMENTS: 'pressure_measurements',
  INSULIN_ENTRIES: 'insulin_entries',
  USER_MEDICATIONS: 'user_medications'
} as const

// Utilidades para almacenamiento local
export const LocalStorage = {
  // Guardar perfil de usuario
  saveUserProfile: (profile: UserProfile): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile))
    } catch (error) {
      console.error('Error guardando perfil de usuario:', error)
    }
  },

  // Cargar perfil de usuario
  loadUserProfile: (): UserProfile | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error cargando perfil de usuario:', error)
      return null
    }
  },

  // Guardar entradas diarias
  saveDailyEntries: (entries: DailyEntry[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_ENTRIES, JSON.stringify(entries))
    } catch (error) {
      console.error('Error guardando entradas diarias:', error)
    }
  },

  // Cargar entradas diarias
  loadDailyEntries: (): DailyEntry[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DAILY_ENTRIES)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error cargando entradas diarias:', error)
      return []
    }
  },

  // Guardar mediciones de glucemia
  saveGlucoseMeasurements: (measurements: GlucoseMeasurement[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.GLUCOSE_MEASUREMENTS, JSON.stringify(measurements))
    } catch (error) {
      console.error('Error guardando mediciones de glucemia:', error)
    }
  },

  // Cargar mediciones de glucemia
  loadGlucoseMeasurements: (): GlucoseMeasurement[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GLUCOSE_MEASUREMENTS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error cargando mediciones de glucemia:', error)
      return []
    }
  },

  // Guardar mediciones de presión
  savePressureMeasurements: (measurements: PressureMeasurement[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRESSURE_MEASUREMENTS, JSON.stringify(measurements))
    } catch (error) {
      console.error('Error guardando mediciones de presión:', error)
    }
  },

  // Cargar mediciones de presión
  loadPressureMeasurements: (): PressureMeasurement[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRESSURE_MEASUREMENTS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error cargando mediciones de presión:', error)
      return []
    }
  },

  // Guardar entradas de insulina
  saveInsulinEntries: (entries: InsulinEntry[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.INSULIN_ENTRIES, JSON.stringify(entries))
    } catch (error) {
      console.error('Error guardando entradas de insulina:', error)
    }
  },

  // Cargar entradas de insulina
  loadInsulinEntries: (): InsulinEntry[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INSULIN_ENTRIES)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error cargando entradas de insulina:', error)
      return []
    }
  },

  // Guardar medicamentos del usuario
  saveUserMedications: (medications: UserMedication[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_MEDICATIONS, JSON.stringify(medications))
    } catch (error) {
      console.error('Error guardando medicamentos del usuario:', error)
    }
  },

  // Cargar medicamentos del usuario
  loadUserMedications: (): UserMedication[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_MEDICATIONS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error cargando medicamentos del usuario:', error)
      return []
    }
  },

  // Limpiar todos los datos
  clearAll: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error('Error limpiando datos:', error)
    }
  }
}

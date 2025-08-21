# MVP: App de Seguimiento de Medicación

## Análisis de Briefs y Priorización MVP

### Funcionalidades Esenciales (MVP)
- ✅ Registro básico de medicación tomada
- ✅ Autocompletado inteligente que aprende del usuario
- ✅ Sin normalización - respeta nombres exactos del usuario
- ✅ Relación con comidas (antes/después/durante)
- ✅ Vista diaria de medicaciones
- ✅ Perfil básico de usuario

### Funcionalidades para Etapa 2
- 🔄 Notificaciones y recordatorios
- 🔄 Análisis de tendencias y estadísticas
- 🔄 Exportación de datos médicos
- 🔄 Sincronización entre dispositivos

### Funcionalidades para Etapa 3
- 📋 Análisis avanzados y reportes
- 📋 Integración con sistemas médicos
- 📋 Personalización avanzada de interfaz
- 📋 Sistema de alertas inteligentes

## Modelo de Datos MVP

```typescript
// Perfil de usuario simplificado
interface UserProfile {
  id: string
  name: string
  criticalGlucose: { min: number, max: number }
  criticalPressure: { systolic: number, diastolic: number }
}

// Medicamento del usuario (se aprende automáticamente)
interface UserMedication {
  id: string
  name: string // Nombre exacto como lo escribe el usuario
  frequency: 'daily' | 'twice_daily' | 'three_times' | 'custom'
  timeSlots: string[] // ['08:00', '14:00', '20:00']
  withFood: 'before' | 'after' | 'during' | 'none'
  usageCount: number // Cuántas veces se ha usado
  lastUsed: Date // Última vez que se registró
}

// Registro de medicación tomada
interface MedicationEntry {
  id: string
  userId: string
  medicationId: string
  timestamp: Date
  taken: boolean
  withFood: 'before' | 'after' | 'during' | 'none'
  notes?: string // Opcional, texto simple
}

// Entrada diaria unificada
interface DailyEntry {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  entries: Array<{
    type: 'medication' | 'food' | 'glucose' | 'pressure'
    time: string // HH:MM
    data: MedicationEntry | FoodEntry | GlucoseEntry | PressureEntry
  }>
}
```

## Sistema de Autocompletado Inteligente para MVP

```typescript
// Medicamentos del usuario (se aprenden automáticamente)
interface UserMedication {
  id: string
  name: string // Nombre exacto como lo escribe el usuario
  frequency: 'daily' | 'twice_daily' | 'three_times' | 'custom'
  timeSlots: string[] // ['08:00', '14:00', '20:00']
  withFood: 'before' | 'after' | 'during' | 'none'
  usageCount: number // Cuántas veces se ha usado
  lastUsed: Date // Última vez que se registró
}

// Ejemplos de nombres que podrían escribir los usuarios:
// - "Metformina 500mg"
// - "Mi pastilla para la diabetes"
// - "Insulina rápida"
// - "La pastilla azul"
// - "Vitamina D3"
// - "Medicamento de la presión"
```

### Cómo Funciona el Autocompletado

1. **Primera vez**: Usuario escribe el nombre completo del medicamento
2. **Aprendizaje**: Sistema guarda el nombre exacto y lo asocia con la frecuencia/relación con comida
3. **Sugerencias**: En futuras entradas, el sistema sugiere basándose en:
   - **Frecuencia de uso** (más usado = más arriba en la lista)
   - **Coincidencia de texto** (búsqueda parcial)
   - **Uso reciente** (últimos medicamentos usados)
4. **Sin normalización**: Si el usuario escribe "Mi pastilla azul" y luego "mi pastilla azul", se consideran diferentes
5. **Ordenamiento inteligente**: Las sugerencias se ordenan por relevancia personal del usuario

### Ventajas del Enfoque

- **Personalización total**: Cada usuario tiene su propia "biblioteca" de medicamentos
- **Sin configuración previa**: Funciona desde el primer uso
- **Flexibilidad**: Acepta cualquier nombre, apodo o descripción
- **Aprendizaje continuo**: Mejora con el uso
- **Sin dependencias externas**: No requiere base de datos de medicamentos

## Flujos de Usuario MVP

### 1. Registro de Medicación
```
Pantalla Principal → Botón "Medicación" → 
Campo de texto con autocompletado inteligente →
Sugerencias basadas en uso previo →
Confirmación de Toma → 
Registro en Entrada Diaria + Aprendizaje del nombre
```

### 2. Vista Diaria
```
Mostrar medicamentos del día con:
- ✅ Medicación tomada
- ❌ Medicación pendiente
- 🕐 Hora programada
- 🍽️ Relación con comida
```

### 3. Configuración Básica
```
Perfil de Usuario:
- Nombre
- Límites críticos de glucemia
- Límites críticos de presión
- Medicamentos activos (toggle on/off)
```

## Componentes MVP

### 1. MedicationInputWithAutocomplete
- Campo de texto con autocompletado inteligente
- Sugerencias basadas en uso previo del usuario
- Aprendizaje automático de nuevos nombres
- Sin normalización - respeta exactamente lo que escribe el usuario

### 2. MedicationEntryForm
- Selección de medicamento
- Confirmación de toma
- Campo de notas opcional (simple)

### 3. DailyMedicationView
- Lista de medicamentos del día
- Estado visual (tomado/pendiente)
- Hora programada
- Relación con comida

### 4. UserProfileForm
- Campos básicos de perfil
- Límites críticos configurables
- Activación/desactivación de medicamentos

## Interfaz de Usuario MVP

### Pantalla Principal
```
┌─────────────────────────────┐
│        HOY - Medicación     │
├─────────────────────────────┤
│  🕐 08:00                   │
│  ✅ Metformina (con comida) │
│  ❌ Insulina (antes comida) │
├─────────────────────────────┤
│  🕐 14:00                   │
│  ❌ Insulina (antes comida) │
├─────────────────────────────┤
│  🕐 20:00                   │
│  ❌ Metformina (con comida) │
│  ❌ Insulina (antes comida) │
├─────────────────────────────┤
│  [REGISTRAR MEDICACIÓN]     │
│  [VER HISTORIAL]            │
└─────────────────────────────┘
```

### Modal de Registro
```
┌─────────────────────────────┐
│    Registrar Medicación     │
├─────────────────────────────┤
│  Nombre del medicamento:    │
│  [_________________________] │
│  ↓ Sugerencias:             │
│  • Metformina 500mg         │
│  • Mi pastilla azul         │
│  • Insulina rápida          │
├─────────────────────────────┤
│  Relación con comida:       │
│  🍽️⬅️ Antes  🍽️⏺️ Durante  │
│  🍽️➡️ Después 🚫 Ninguna    │
├─────────────────────────────┤
│  Notas (opcional):          │
│  [_________________________] │
├─────────────────────────────┤
│  [CANCELAR]  [REGISTRAR]    │
└─────────────────────────────┘
```

## Implementación Técnica MVP

### 1. Estado de la Aplicación
```typescript
interface AppState {
  userProfile: UserProfile
  dailyEntries: DailyEntry[]
  userMedications: UserMedication[] // Medicamentos aprendidos del usuario
  currentDate: string
}
```

### 2. Hooks Principales
```typescript
// Hook para medicaciones con autocompletado inteligente
const useMedications = () => {
  const [userMedications, setUserMedications] = useState<UserMedication[]>([])
  const [dailyEntries, setDailyEntries] = useState<DailyEntry[]>([])
  
  const takeMedication = (medicationName: string, withFood: string, notes?: string) => {
    // Lógica de registro + aprendizaje automático
    const existingMed = userMedications.find(m => m.name.toLowerCase() === medicationName.toLowerCase())
    
    if (existingMed) {
      // Actualizar uso existente
      updateMedicationUsage(existingMed.id)
    } else {
      // Crear nuevo medicamento aprendido
      addNewLearnedMedication(medicationName, withFood)
    }
  }
  
  const getMedicationSuggestions = (input: string): UserMedication[] => {
    // Sugerencias basadas en uso previo, ordenadas por frecuencia
    return userMedications
      .filter(m => m.name.toLowerCase().includes(input.toLowerCase()))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
  }
  
  const getDailyMedications = (date: string) => {
    // Obtener medicaciones del día
  }
  
  return { 
    userMedications, 
    dailyEntries, 
    takeMedication, 
    getMedicationSuggestions,
    getDailyMedications 
  }
}

// Hook para perfil de usuario
const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  
  const updateProfile = (updates: Partial<UserProfile>) => {
    // Actualizar perfil
  }
  
  const toggleMedication = (medicationId: string) => {
    // Activar/desactivar medicamento
  }
  
  return { profile, updateProfile, toggleMedication }
}
```

### 3. Almacenamiento Local
```typescript
// Persistencia simple en localStorage
const MedicationStorage = {
  saveDailyEntries: (entries: DailyEntry[]) => {
    localStorage.setItem('medication_entries', JSON.stringify(entries))
  },
  
  loadDailyEntries: (): DailyEntry[] => {
    const stored = localStorage.getItem('medication_entries')
    return stored ? JSON.parse(stored) : []
  },
  
  saveUserProfile: (profile: UserProfile) => {
    localStorage.setItem('user_profile', JSON.stringify(profile))
  },
  
  loadUserProfile: (): UserProfile | null => {
    const stored = localStorage.getItem('user_profile')
    return stored ? JSON.parse(stored) : null
  }
}
```

## Criterios de Éxito MVP

### Funcional
- ✅ Usuario puede registrar medicación tomada
- ✅ Sistema aprende automáticamente nombres de medicamentos
- ✅ Autocompletado inteligente basado en uso previo
- ✅ Sistema muestra medicaciones pendientes del día
- ✅ Perfil básico configurable
- ✅ Persistencia de datos local

### Usabilidad
- ✅ Interfaz simple y clara
- ✅ Botones grandes y accesibles
- ✅ Flujos lineales sin complejidad
- ✅ Confirmaciones visuales claras

### Técnico
- ✅ Código limpio y mantenible
- ✅ Separación clara de responsabilidades
- ✅ Hooks reutilizables
- ✅ Estado centralizado y predecible

## Roadmap Post-MVP

### Etapa 2 (Siguiente Sprint)
- 🔄 Sistema de notificaciones básico
- 🔄 Historial de medicaciones
- 🔄 Exportación simple de datos
- 🔄 Validaciones de entrada

### Etapa 3 (Sprint 3)
- 📋 Análisis de adherencia
- 📋 Reportes semanales/mensuales
- 📋 Personalización de medicamentos
- 📋 Sincronización básica

### Etapa 4 (Sprint 4)
- 🚀 Integración con calendario
- 🚀 Recordatorios inteligentes
- 🚀 Análisis de tendencias
- 🚀 Exportación avanzada

## Consideraciones de Diseño

### Accesibilidad
- Fuentes grandes (mínimo 18px)
- Alto contraste
- Botones grandes (mínimo 44x44px)
- Navegación simple

### Responsividad
- Diseño mobile-first
- Adaptación a tablets
- Gestos táctiles simples

### Performance
- Estado local optimizado
- Renderizado eficiente
- Persistencia asíncrona

Este MVP se centra en la funcionalidad core de seguimiento de medicación, manteniendo la simplicidad y usabilidad para adultos mayores, mientras establece una base sólida para futuras expansiones.

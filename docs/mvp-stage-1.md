# MVP Etapa 1: Seguimiento de Medicación y Mediciones

## Funcionalidades Core (Etapa 1)

### ✅ Medicamentos
- Registro de medicación tomada
- Autocompletado inteligente que aprende del usuario
- Sin normalización - respeta nombres exactos del usuario
- Relación con comidas (antes/después/durante)

### ✅ Mediciones de Tensión Arterial
- Registro de presión sistólica y diastólica
- Clasificación visual por colores (verde/amarillo/rojo)
- Límites personalizables por usuario
- Historial diario

### ✅ Mediciones de Glucemia/Insulina
- Registro de valores de glucosa
- Registro de dosis de insulina
- Clasificación por contexto (ayunas, postprandial)
- Límites personalizables por usuario

## Modelo de Datos Etapa 1

```typescript
// Perfil de usuario básico
interface UserProfile {
  id: string
  name: string
  criticalGlucose: { min: number, max: number }
  criticalPressure: { 
    systolic: { min: number, max: number }
    diastolic: { min: number, max: number }
  }
}

// Medicamento del usuario (se aprende automáticamente)
interface UserMedication {
  id: string
  name: string // Nombre exacto como lo escribe el usuario
  withFood: 'before' | 'after' | 'during' | 'none'
  usageCount: number
  lastUsed: Date
}

// Medición de glucemia
interface GlucoseMeasurement {
  id: string
  userId: string
  timestamp: Date
  value: number
  context: 'fasting' | 'postPrandial' | 'custom'
  status: 'normal' | 'warning' | 'critical' // calculado según límites
}

// Contextos de glucemia explicados:
// - 'fasting': En ayunas (antes del desayuno, sin comer por 8+ horas)
// - 'postPrandial': Después de comer (2 horas después de una comida)
// - 'custom': Otro momento del día

// Medición de presión arterial
interface PressureMeasurement {
  id: string
  userId: string
  timestamp: Date
  systolic: number // Presión alta (número superior)
  diastolic: number // Presión baja (número inferior)
  status: 'normal' | 'warning' | 'critical' // calculado según límites
}

// Explicación de presión arterial:
// - Sistólica (alta): Presión cuando el corazón late y bombea sangre
// - Diastólica (baja): Presión cuando el corazón está en reposo entre latidos
// - Ejemplo: 120/80 mmHg significa sistólica 120, diastólica 80

// Registro de insulina
interface InsulinEntry {
  id: string
  userId: string
  timestamp: Date
  dose: number // unidades
  type: 'rapid' | 'long' | 'mixed'
  context: 'fasting' | 'postprandial' | 'correction'
  notes?: string
}

// Entrada diaria unificada
interface DailyEntry {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  entries: Array<{
    type: 'medication' | 'glucose' | 'pressure' | 'insulin'
    time: string // HH:MM
    data: UserMedication | GlucoseMeasurement | PressureMeasurement | InsulinEntry
  }>
}
```

## Flujos de Usuario Etapa 1

### 1. Registro de Medicación
```
Pantalla Principal → Botón "Medicación" → 
Campo de texto con autocompletado inteligente →
Sugerencias basadas en uso previo →
Confirmación de Toma → 
Registro en Entrada Diaria + Aprendizaje del nombre
```

### 2. Registro de Glucemia
```
Pantalla Principal → Botón "Glucemia" → 
Modal con campo numérico →
Selección de contexto (ayunas/después de comer/otro) →
Confirmación visual con color →
Registro con timestamp
```

### 3. Registro de Presión
```
Pantalla Principal → Botón "Presión" → 
Modal con dos campos (sistólica/diastólica) →
Confirmación visual con color →
Registro con timestamp
```

### 4. Registro de Insulina
```
Pantalla Principal → Botón "Insulina" → 
Modal con dosis y tipo →
Selección de contexto →
Registro con timestamp
```

## Componentes Etapa 1

### 1. MedicationInputWithAutocomplete
- Campo de texto con autocompletado inteligente
- Sugerencias basadas en uso previo del usuario
- Aprendizaje automático de nuevos nombres
- Sin normalización - respeta exactamente lo que escribe el usuario

### Nota sobre Frecuencia de Medicación
La frecuencia se maneja completamente en la interfaz de usuario:
- **Pantalla Principal:** Muestra medicaciones pendientes del día según patrones de uso
- **UI Inteligente:** Aprende automáticamente cuándo el usuario suele tomar cada medicamento
- **Sin Configuración:** No requiere que el usuario configure horarios predefinidos
- **Flexibilidad:** Se adapta a cambios en la rutina del usuario automáticamente

### 2. GlucoseMeasurementForm
- Campo numérico para valor de glucosa
- Selector de contexto (ayunas/después de comer/otro)
- Indicador visual de estado (verde/amarillo/rojo)
- Validación de rangos normales

### 3. PressureMeasurementForm
- Dos campos numéricos (presión alta/baja)
- Indicador visual de estado
- Validación de rangos normales
- Confirmación visual clara

### 4. InsulinEntryForm
- Campo numérico para dosis
- Selector de tipo de insulina
- Selector de contexto
- Campo de notas opcional

### 5. DailyOverview
- Vista unificada del día
- Medicaciones pendientes y tomadas
- Últimas mediciones de glucemia y presión
- Resumen visual del estado de salud

## Interfaz de Usuario Etapa 1

### Pantalla Principal
```
┌─────────────────────────────┐
│        HOY - Resumen        │
├─────────────────────────────┤
│  🕐 08:00                   │
│  ✅ Metformina (con comida) │
│  ❌ Insulina (antes comida) │
│  📊 Glucemia: 120 mg/dL     │
│  ❤️ Presión: 120/80 mmHg    │
├─────────────────────────────┤
│  🕐 14:00                   │
│  ❌ Insulina (antes comida) │
├─────────────────────────────┤
│  🕐 20:00                   │
│  ❌ Metformina (con comida) │
│  ❌ Insulina (antes comida) │
├─────────────────────────────┤
│  [MEDICACIÓN] [GLUCEMIA]    │
│  [PRESIÓN]   [INSULINA]     │
│  [VER HISTORIAL]            │
└─────────────────────────────┘
```

### Modal de Glucemia
```
┌─────────────────────────────┐
│      Registrar Glucemia     │
├─────────────────────────────┤
│  Valor (mg/dL):             │
│  [       120        ]       │
│                             │
│  Contexto:                  │
│  ☑️ En ayunas               │
│  ☐ Después de comer         │
│  ☐ Otro momento             │
├─────────────────────────────┤
│  Estado: 🟢 Normal          │
├─────────────────────────────┤
│  [CANCELAR]  [REGISTRAR]    │
└─────────────────────────────┘
```

### Modal de Presión
```
┌─────────────────────────────┐
│    Registrar Presión        │
├─────────────────────────────┤
│  Presión Alta (mmHg):       │
│  [       120        ]       │
│                             │
│  Presión Baja (mmHg):       │
│  [        80        ]       │
├─────────────────────────────┤
│  Estado: 🟢 Normal          │
├─────────────────────────────┤
│  [CANCELAR]  [REGISTRAR]    │
└─────────────────────────────┘
```

## Implementación Técnica Etapa 1

### 1. Estado de la Aplicación
```typescript
interface AppState {
  userProfile: UserProfile
  dailyEntries: DailyEntry[]
  userMedications: UserMedication[]
  currentDate: string
  measurements: {
    glucose: GlucoseMeasurement[]
    pressure: PressureMeasurement[]
    insulin: InsulinEntry[]
  }
}
```

### 2. Hooks Principales
```typescript
// Hook para medicaciones
const useMedications = () => {
  const [userMedications, setUserMedications] = useState<UserMedication[]>([])
  
  const takeMedication = (medicationName: string, withFood: string, notes?: string) => {
    // Lógica de registro + aprendizaje automático
  }
  
  const getMedicationSuggestions = (input: string): UserMedication[] => {
    // Sugerencias basadas en uso previo
  }
  
  return { userMedications, takeMedication, getMedicationSuggestions }
}

// Hook para mediciones de glucemia
const useGlucoseMeasurements = () => {
  const [measurements, setMeasurements] = useState<GlucoseMeasurement[]>([])
  
  const addMeasurement = (value: number, context: string) => {
    const status = calculateGlucoseStatus(value, userProfile.criticalGlucose)
    const newMeasurement: GlucoseMeasurement = {
      id: generateId(),
      userId: userProfile.id,
      timestamp: new Date(),
      value,
      context,
      status
    }
    setMeasurements(prev => [...prev, newMeasurement])
  }
  
  return { measurements, addMeasurement }
}

// Hook para mediciones de presión
const usePressureMeasurements = () => {
  const [measurements, setMeasurements] = useState<PressureMeasurement[]>([])
  
  const addMeasurement = (systolic: number, diastolic: number) => {
    const status = calculatePressureStatus(systolic, diastolic, userProfile.criticalPressure)
    const newMeasurement: PressureMeasurement = {
      id: generateId(),
      userId: userProfile.id,
      timestamp: new Date(),
      systolic,
      diastolic,
      status
    }
    setMeasurements(prev => [...prev, newMeasurement])
  }
  
  return { measurements, addMeasurement }
}

// Hook para insulina
const useInsulinEntries = () => {
  const [entries, setEntries] = useState<InsulinEntry[]>([])
  
  const addEntry = (dose: number, type: string, context: string, notes?: string) => {
    const newEntry: InsulinEntry = {
      id: generateId(),
      userId: userProfile.id,
      timestamp: new Date(),
      dose,
      type,
      context,
      notes
    }
    setEntries(prev => [...prev, newEntry])
  }
  
  return { entries, addEntry }
}
```

### 3. Cálculo de Estados
```typescript
// Determinar estado de glucemia según límites personalizados
function calculateGlucoseStatus(value: number, limits: any): 'normal' | 'warning' | 'critical' {
  if (value >= limits.min && value <= limits.max) {
    return 'normal' // Verde
  } else if (
    (value >= limits.min * 0.9 && value < limits.min) || 
    (value > limits.max && value <= limits.max * 1.2)
  ) {
    return 'warning' // Amarillo
  } else {
    return 'critical' // Rojo
  }
}

// Determinar estado de presión según límites personalizados
function calculatePressureStatus(systolic: number, diastolic: number, limits: any): 'normal' | 'warning' | 'critical' {
  const systolicStatus = calculateGlucoseStatus(systolic, limits.systolic)
  const diastolicStatus = calculateGlucoseStatus(diastolic, limits.diastolic)
  
  if (systolicStatus === 'critical' || diastolicStatus === 'critical') {
    return 'critical'
  } else if (systolicStatus === 'warning' || diastolicStatus === 'warning') {
    return 'warning'
  } else {
    return 'normal'
  }
}
```

### 4. Almacenamiento Local
```typescript
const LocalStorage = {
  saveDailyEntries: (entries: DailyEntry[]) => {
    localStorage.setItem('daily_entries', JSON.stringify(entries))
  },
  
  loadDailyEntries: (): DailyEntry[] => {
    const stored = localStorage.getItem('daily_entries')
    return stored ? JSON.parse(stored) : []
  },
  
  saveUserProfile: (profile: UserProfile) => {
    localStorage.setItem('user_profile', JSON.stringify(profile))
  },
  
  loadUserProfile: (): UserProfile | null => {
    const stored = localStorage.getItem('user_profile')
    return stored ? JSON.parse(stored) : null
  },
  
  saveMeasurements: (type: string, data: any[]) => {
    localStorage.setItem(`${type}_measurements`, JSON.stringify(data))
  },
  
  loadMeasurements: (type: string): any[] => {
    const stored = localStorage.getItem(`${type}_measurements`)
    return stored ? JSON.parse(stored) : []
  }
}
```

## Criterios de Éxito Etapa 1

### Funcional
- ✅ Usuario puede registrar medicación con autocompletado inteligente
- ✅ Usuario puede registrar mediciones de glucemia con clasificación visual
- ✅ Usuario puede registrar mediciones de presión con clasificación visual
- ✅ Usuario puede registrar dosis de insulina
- ✅ Sistema muestra resumen diario unificado
- ✅ Perfil básico configurable con límites críticos

### Usabilidad
- ✅ Interfaz simple y clara para adultos mayores
- ✅ Botones grandes y accesibles
- ✅ Flujos lineales sin complejidad
- ✅ Confirmaciones visuales claras con colores
- ✅ Autocompletado no intrusivo

### Técnico
- ✅ Código limpio con hooks reutilizables
- ✅ Separación clara de responsabilidades
- ✅ Estado centralizado y predecible
- ✅ Persistencia local eficiente
- ✅ Cálculos de estado en tiempo real

## Consideraciones de Diseño Etapa 1

### Accesibilidad
- Fuentes grandes (mínimo 18px)
- Alto contraste para colores de estado
- Botones grandes (mínimo 44x44px)
- Navegación simple con pestañas grandes

### Responsividad
- Diseño mobile-first
- Adaptación a tablets
- Gestos táctiles simples
- Campos de entrada optimizados para móvil

### Performance
- Estado local optimizado
- Renderizado eficiente de listas
- Persistencia asíncrona
- Cálculos de estado optimizados

## Glosario de Términos Médicos

### Glucemia (Glucosa en Sangre)
- **mg/dL:** Miligramos por decilitro, unidad de medida de glucosa
- **En ayunas:** Sin comer por 8 horas o más (típicamente por la mañana)
- **Después de comer:** 2 horas después de una comida (postprandial)
- **Rangos normales:** 70-100 mg/dL en ayunas, <140 mg/dL después de comer

### Presión Arterial
- **mmHg:** Milímetros de mercurio, unidad de medida de presión
- **Presión Alta (Sistólica):** Presión cuando el corazón late (número superior)
- **Presión Baja (Diastólica):** Presión cuando el corazón descansa (número inferior)
- **Rango normal:** <120/80 mmHg
- **Ejemplo:** 120/80 se lee "ciento veinte sobre ochenta"

### Insulina
- **Unidades:** Medida estándar de dosis de insulina
- **Rápida:** Insulina que actúa en 15-30 minutos
- **Lenta:** Insulina que actúa en 1-2 horas y dura 12-24 horas
- **Mixta:** Combinación de insulina rápida y lenta

### Relación con Comidas
- **Antes de comer:** Tomar medicamento 15-30 minutos antes de la comida
- **Durante la comida:** Tomar medicamento mientras se come
- **Después de comer:** Tomar medicamento después de terminar de comer
- **Sin relación:** Medicamento que no depende de las comidas

---

Esta Etapa 1 establece la base sólida para el seguimiento de salud, enfocándose en las funcionalidades core que los usuarios necesitan diariamente, con una interfaz simple pero completa.

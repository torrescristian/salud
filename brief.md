# Análisis y Diseño: App de Seguimiento de Alimentación y Salud

Entiendo que necesitas un análisis y diseño completo en lugar de la implementación directa. Vamos a realizar un event storming y diseñar la arquitectura de la aplicación.

## Event Storming - Análisis de Dominio

### Eventos (Eventos de negocio significativos):
- Comida registrada
- Medición de glucemia tomada
- Medición de presión arterial tomada
- Límites personalizados configurados
- Perfil de usuario creado
- Resumen médico generado

### Comandos (Acciones que desencadenan eventos):
- Registrar comida
- Tomar medición de glucemia
- Tomar medición de presión arterial
- Configurar límites personalizados
- Crear perfil de usuario
- Generar vista médica

### Agregados (Agrupaciones de entidades):
- Perfil de usuario (datos personales, límites configurados)
- Registro de alimentos (comidas, categorías, horarios)
- Registro de glucemia (valores, horarios, contexto)
- Registro de presión arterial (valores, horarios)
- Vista médica (resúmenes, alertas, tendencias)

### Políticas (Reglas de negocio):
- La glucemia debe medirse según la frecuencia configurada (por defecto 3 veces/día)
- Los valores se clasifican según límites personalizables (verde/amarillo/rojo)
- Los alimentos se categorizan automáticamente según tipo
- La vista médica debe mostrar resúmenes claros con indicadores visuales

### Vistas (Interfaces de usuario):
- Registro diario de alimentos y mediciones
- Configuración de límites y frecuencia
- Vista médica con resumen visual
- Historial y tendencias

## Diseño de Arquitectura

### Modelo de Datos
```javascript
// Perfil de usuario
UserProfile {
  id: string
  name: string
  birthDate: Date
  weight: number
  height: number
  medicalConditions: string[]
  glucoseLimits: {
    fasting: { min: number, max: number }
    postPrandial: { min: number, max: number }
    custom: { min: number, max: number }[]
  }
  pressureLimits: {
    systolic: { min: number, max: number }
    diastolic: { min: number, max: number }
  }
  measurementFrequency: {
    glucose: number // veces por día
    pressure: number // veces por día
  }
}

// Registro de alimento
FoodEntry {
  id: string
  userId: string
  timestamp: Date
  foodType: 'carbohydrates' | 'proteins' | 'vegetables' | 'eggs' | 'dairy'
  description: string
  quantity: number
  emoji: string
}

// Registro de glucemia
GlucoseMeasurement {
  id: string
  userId: string
  timestamp: Date
  value: number
  context: 'fasting' | 'postPrandial' | 'custom'
  status: 'normal' | 'warning' | 'critical' // calculado según límites
}

// Registro de presión arterial
PressureMeasurement {
  id: string
  userId: string
  timestamp: Date
  systolic: number
  diastolic: number
  status: 'normal' | 'warning' | 'critical' // calculado según límites
}
```

### Algoritmos para Valores por Defecto
```javascript
// Cálculo de límites de glucemia por defecto según peso/altura/edad
function calculateDefaultGlucoseLimits(age, weight, height) {
  // Lógica médica para calcular valores normales
  const bmi = weight / ((height / 100) ** 2);
  
  let fastingMin = 70;
  let fastingMax = 100;
  
  if (age > 50) fastingMax += 10;
  if (bmi > 25) {
    fastingMin += 5;
    fastingMax += 15;
  }
  
  return {
    fasting: { min: fastingMin, max: fastingMax },
    postPrandial: { min: fastingMin + 30, max: fastingMax + 40 }
  };
}

// Cálculo de límites de presión arterial por defecto
function calculateDefaultPressureLimits(age, weight, height) {
  const bmi = weight / ((height / 100) ** 2);
  
  let systolicMin = 110;
  let systolicMax = 120;
  let diastolicMin = 70;
  let diastolicMax = 80;
  
  if (age > 50) {
    systolicMax += 15;
    diastolicMax += 10;
  }
  
  if (bmi > 25) {
    systolicMin += 5;
    systolicMax += 10;
    diastolicMin += 5;
    diastolicMax += 5;
  }
  
  return {
    systolic: { min: systolicMin, max: systolicMax },
    diastolic: { min: diastolicMin, max: diastolicMax }
  };
}
```

### Sistema de Clasificación por Colores
```javascript
// Determinar estado según los valores y límites
function determineStatus(value, limits, type) {
  if (value >= limits.min && value <= limits.max) {
    return 'normal'; // Verde
  } else if (
    (value >= limits.min * 0.9 && value < limits.min) || 
    (value > limits.max && value <= limits.max * 1.2)
  ) {
    return 'warning'; // Amarillo
  } else {
    return 'critical'; // Rojo
  }
}

// Asignar emojis según tipo de alimento
function getFoodEmoji(foodType) {
  const emojis = {
    carbohydrates: '🍞',
    proteins: '🍗',
    vegetables: '🥦',
    eggs: '🥚',
    dairy: '🥛'
  };
  return emojis[foodType] || '🍽️';
}
```

### Vista Médica - Diseño Conceptual
La vista médica debería incluir:

1. **Resumen de estado general**: Semáforo con porcentajes de mediciones normales/alertas/críticas
2. **Gráfico de tendencias**: Evolución de glucemia y presión a lo largo del tiempo
3. **Balance nutricional**: Distribución de grupos alimenticios con emojis
4. **Alertas destacadas**: Mediciones críticas que requieren atención
5. **Panel de configuración**: Mostrar los límites establecidos para contextualizar los valores

### Flujo de Configuración
1. El usuario ingresa peso, altura y edad
2. El sistema calcula valores por defecto
3. El usuario puede ajustar manualmente estos valores
4. El usuario configura la frecuencia de mediciones (3 veces/día u otra)
5. El sistema aplica estos límites para todas las clasificaciones

## Consideraciones de Implementación

- La aplicación debe ser responsiva para verse bien en móviles y tablets
- Los datos deben persistirse localmente y tener capacidad de exportación
- La vista médica debe ser imprimible y exportable como PDF
- Debe implementarse un sistema de recordatorios para las mediciones
- Los colores deben ser accesibles para personas con daltonismo

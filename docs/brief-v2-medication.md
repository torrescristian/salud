# Análisis y Diseño: App de Seguimiento de Salud (Versión Simplificada)

## Event Storming para Adultos Mayores

### Eventos Principales:
- Comida registrada
- Medicación tomada registrada
- Medición de glucemia registrada
- Medición de presión registrada
- Nota añadida a cualquier registro

### Comandos Simplificados:
- Registrar comida (con selección de tipo mediante emojis grandes)
- Registrar medicación (con autocompletado de medicamentos usados antes)
- Registrar glucemia
- Registrar presión arterial
- Añadir nota rápida

### Agregados Simplificados:
- Registro diario (combina alimentos, medicación y mediciones)
- Lista de medicamentos frecuentes (se aprende del uso)
- Perfil de salud básico (valores críticos personalizables)

### Políticas Simplificadas:
- Interfaz con botones grandes y texto amplio
- Autocompletado inteligente pero no intrusivo
- Flujos lineales sin pantallas complejas
- Confirmaciones visuales claras de las acciones

### Vistas Simplificadas:
- Hoy: Vista principal de registro
- Historial: Lista cronológica simple
- Vista médico: Resumen visual claro

## Diseño de Interfaz Simplificada

### Modelo de Datos Simplificado

```javascript
// Perfil de usuario simplificado
UserProfile {
  id: string
  name: string
  criticalGlucose: { min: number, max: number } // Valores críticos personalizados
  criticalPressure: { systolic: number, diastolic: number }
}

// Registro diario unificado
DailyEntry {
  id: string
  userId: string
  date: string // Fecha en formato YYYY-MM-DD
  entries: Array<{
    type: 'food' | 'medication' | 'glucose' | 'pressure' | 'note'
    time: string // HH:MM
    data: FoodData | MedicationData | GlucoseData | PressureData | NoteData
  }>
}

// Datos de comida simplificados
FoodData {
  type: 'carbs' | 'protein' | 'vegetables' | 'eggs' | 'dairy'
  description: string // Opcional, solo si el usuario quiere detallar
}

// Datos de medicación simplificados
MedicationData {
  name: string // Con autocompletado
  taken: boolean
  withFood: 'before' | 'after' | 'during' | 'none'
  notes: string // Opcional
}

// Datos de glucemia
GlucoseData {
  value: number
}

// Datos de presión arterial
PressureData {
  systolic: number
  diastolic: number
}

// Nota general
NoteData {
  text: string
}
```

## Flujos de Usuario Simplificados

### 1. Registro de Medicación con Autocompletado

```
Pantalla Principal (Hoy) -> Botón "Medicación" -> 
[Modal de Registro de Medicación]
- Campo de texto con autocompletado (muestra medicamentos usados antes)
- Selector de relación con comida (iconos grandes: 🍽️⬅️, 🍽️➡️, 🍽️⏺️, 🚫)
- Campo de notas opcional (solo si se hace clic en "añadir nota")
- Botón grande "REGISTRAR"
```

### 2. Registro de Comidas

```
Pantalla Principal -> Botón "Comida" ->
[Selector de Tipo de Comida]
- Botones grandes con emojis: 🍞 Carbohidratos, 🥩 Proteínas, 🥦 Verduras, 🥚 Huevos, 🧀 Lácteos
- Al seleccionar: registro inmediato con hora actual
- Opción de "detallar" para añadir texto opcional
```

### 3. Registro de Mediciones

```
Pantalla Principal -> Botón "Glucemia" o "Presión" ->
[Modal de Registro]
- Campo numérico grande con teclado amplio
- Confirmación visual inmediata con color (verde/amarillo/rojo)
- Botón grande "GUARDAR"
```

## Implementación de Autocompletado Simplificado

```javascript
// Almacenamiento de medicamentos frecuentes
let frequentMedications = [];

// Función de autocompletado simplificada
function setupMedicationAutocomplete() {
  const input = document.getElementById('medication-input');
  const suggestions = document.getElementById('medication-suggestions');
  
  input.addEventListener('input', function() {
    const value = this.value.toLowerCase();
    
    // Filtrar medicamentos frecuentes que coincidan
    const matches = frequentMedications.filter(med => 
      med.toLowerCase().includes(value)
    );
    
    // Mostrar sugerencias (máximo 3)
    suggestions.innerHTML = '';
    matches.slice(0, 3).forEach(med => {
      const div = document.createElement('div');
      div.textContent = med;
      div.classList.add('suggestion-item');
      div.addEventListener('click', () => {
        input.value = med;
        suggestions.innerHTML = '';
      });
      suggestions.appendChild(div);
    });
  });
}

// Al agregar una nueva medicación
function addMedication(name) {
  // Agregar a registros del día
  addToDailyEntries({
    type: 'medication',
    time: getCurrentTime(),
    data: { name, taken: true, withFood: 'none' }
  });
  
  // Actualizar lista de medicamentos frecuentes
  if (!frequentMedications.includes(name)) {
    frequentMedications.push(name);
    saveFrequentMedications();
  }
}
```

## Vista Médica Simplificada

La vista médica mostrará:

1. **Resumen Visual por Día**:
   - Emojis de comidas consumidas
   - Círculos de colores para mediciones (verde/amarillo/rojo)
   - Checkmarks para medicaciones tomadas

2. **Leyenda Simple**:
   - 🟢 = Valores normales
   - 🟡 = Valores moderados
   - 🔴 = Valores críticos
   - ✅ = Medicación tomada
   - ❌ = Medicación omitida

3. **Notas Destacadas**:
   - Solo notas con contenido, mostradas con fecha y hora

## Consideraciones de Accesibilidad

- Fuentes grandes (mínimo 18px)
- Alto contraste de colores
- Botones grandes (mínimo 44x44px)
- Navegación simple con pestañas grandes
- Confirmaciones visuales y de audio opcionales
- Instrucciones con iconos reconocibles

Este diseño mantiene la esencia de la aplicación pero simplifica enormemente la interacción, haciendo que sea adecuada para adultos mayores o personas con poca experiencia tecnológica. El autocompletado funciona de manera no intrusiva, aprendiendo de lo que el usuario introduce sin requerir configuración previa.

# Testing Guide - Control Médico App

## Configuración de Tests

Esta aplicación utiliza **Vitest** como framework de testing, siguiendo el enfoque **TDD (Test-Driven Development)**.

### Dependencias de Testing

- **Vitest**: Framework de testing principal
- **@testing-library/react**: Testing de componentes React
- **@testing-library/jest-dom**: Matchers adicionales para DOM
- **@testing-library/user-event**: Simulación de eventos de usuario
- **jsdom**: Entorno DOM para tests

## Estructura de Tests

```
src/test/
├── setup.ts                           # Configuración global de tests
└── integration/                       # Tests de integración
    ├── domain/                        # Tests del dominio
    │   ├── UserProfile.test.ts        # Tests de perfil de usuario
    │   ├── GlucoseMeasurement.test.ts # Tests de medición de glucemia
    │   ├── PressureMeasurement.test.ts # Tests de medición de presión
    │   ├── FoodEntry.test.ts          # Tests de entrada de alimentos
    │   └── MedicalView.test.ts        # Tests de vista médica
    └── use-cases/                     # Tests de casos de uso
        ├── UserProfileUseCase.test.ts # Tests de UC de perfil
        ├── MeasurementUseCase.test.ts # Tests de UC de mediciones
        ├── FoodEntryUseCase.test.ts   # Tests de UC de alimentos
        └── MedicalViewUseCase.test.ts # Tests de UC de vista médica
```

## Comandos de Testing

### Ejecutar Tests en Modo Watch
```bash
npm run test
```

### Ejecutar Tests una Vez
```bash
npm run test:run
```

### Ejecutar Tests con UI
```bash
npm run test:ui
```

### Ejecutar Tests con Cobertura
```bash
npm run test:coverage
```

## Enfoque TDD Implementado

### 1. Tests de Dominio
Los tests de dominio verifican la lógica de negocio pura:

- **UserProfile**: Cálculo de BMI, límites por defecto, validaciones
- **GlucoseMeasurement**: Clasificación de valores, validaciones de contexto
- **PressureMeasurement**: Categorización de presión, validaciones
- **FoodEntry**: Categorización automática, cálculo de calorías
- **MedicalView**: Análisis de tendencias, generación de resúmenes

### 2. Tests de Casos de Uso
Los tests de casos de uso verifican la orquestación de la lógica:

- **UserProfileUseCase**: CRUD de perfiles, cálculos médicos
- **MeasurementUseCase**: Gestión de mediciones, estadísticas
- **FoodEntryUseCase**: Gestión de alimentos, análisis nutricional
- **MedicalViewUseCase**: Generación de vistas médicas, reportes

### 3. Patrones de Testing

#### Mocks y Stubs
```typescript
const mockRepository = {
  save: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findAll: vi.fn()
}
```

#### Tests de Integración
```typescript
describe('UserProfile Domain Integration Tests', () => {
  let userProfile: UserProfile

  beforeEach(() => {
    userProfile = new UserProfile({...})
  })

  it('should calculate BMI correctly', () => {
    const bmi = userProfile.calculateBMI()
    expect(bmi).toBeCloseTo(24.22, 2)
  })
})
```

#### Validación de Errores
```typescript
it('should throw error for invalid glucose value', async () => {
  await expect(measurementUseCase.createGlucoseMeasurement(invalidData))
    .rejects.toThrow('Glucose value must be positive')
})
```

## Cobertura de Tests

Los tests cubren:

- ✅ **Creación** de entidades del dominio
- ✅ **Validación** de datos de entrada
- ✅ **Cálculos** médicos y nutricionales
- ✅ **Persistencia** de datos
- ✅ **Casos de error** y excepciones
- ✅ **Integración** entre diferentes capas
- ✅ **Lógica de negocio** compleja

## Próximos Pasos

1. **Implementar entidades del dominio** basándose en los tests
2. **Crear repositorios** para persistencia de datos
3. **Implementar casos de uso** siguiendo los tests
4. **Crear componentes React** con atomic design
5. **Integrar react-hook-form** para formularios
6. **Configurar react-query** para gestión de estado

## Arquitectura Limpia

La estructura sigue los principios de **Clean Architecture**:

```
src/
├── domain/           # Entidades y lógica de negocio
├── use-cases/        # Casos de uso de la aplicación
├── repositories/     # Interfaces de persistencia
├── infrastructure/   # Implementaciones concretas
├── presentation/     # Componentes React
└── shared/          # Utilidades compartidas
```

## Atomic Design

Los componentes seguirán el patrón **Atomic Design**:

- **Atoms**: Botones, inputs, etiquetas
- **Molecules**: Formularios, tarjetas de medición
- **Organisms**: Paneles de control, vistas de resumen
- **Templates**: Layouts de página
- **Pages**: Páginas completas de la aplicación

# 🏥 Control Médico

Aplicación web para el control y seguimiento de parámetros médicos personales, construida con **Clean Architecture** y **Atomic Design**.

## ✨ Características

- **📊 Dashboard de salud** con métricas en tiempo real
- **🩸 Mediciones de glucosa** con contexto y notas
- **💓 Mediciones de presión arterial** con categorización automática
- **🍎 Registro de alimentación** con análisis nutricional
- **📈 Análisis de tendencias** y reportes médicos
- **🔔 Sistema de notificaciones** inteligente
- **📱 Diseño responsive** optimizado para móviles

## 🏗️ Arquitectura

### Clean Architecture
```
src/
├── domain/           # Entidades y reglas de negocio
├── use-cases/        # Lógica de aplicación
├── repositories/     # Interfaces de persistencia
├── components/       # UI siguiendo Atomic Design
├── hooks/           # Custom hooks de React
└── services/        # Servicios externos
```

### Atomic Design
- **Atoms**: Input, Button, Badge, Modal, Table
- **Molecules**: Formularios, Listas, Cards
- **Organisms**: Dashboards, Gestión de datos
- **Templates**: Layouts y estructuras de página
- **Pages**: Páginas completas de la aplicación

## 🚀 Tecnologías

- **Frontend**: React 18 + TypeScript
- **Estado**: TanStack Query (React Query)
- **Formularios**: React Hook Form + Zod
- **Estilos**: Tailwind CSS v4
- **Testing**: Vitest + React Testing Library
- **Build**: Vite
- **Linting**: ESLint + Prettier

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd control-medico

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar tests
npm run test

# Build de producción
npm run build
```

## 🔧 Configuración

### Variables de entorno
```env
# API (para futura implementación)
REACT_APP_API_BASE_URL=http://localhost:3001/api

# Características
NODE_ENV=development
```

### Configuración de Tailwind
La aplicación usa Tailwind CSS v4 con PostCSS. La configuración está en:
- `tailwind.config.js` - Configuración de Tailwind
- `postcss.config.js` - Plugin de PostCSS

## 📱 Uso de la aplicación

### 1. Dashboard Principal
- Vista general de métricas de salud
- Gráficos de tendencias
- Alertas y recomendaciones

### 2. Gestión de Glucosa
- Agregar mediciones con contexto
- Ver historial y tendencias
- Análisis de patrones

### 3. Control de Presión
- Registrar mediciones sistólica/diastólica
- Categorización automática según guías médicas
- Seguimiento temporal

### 4. Nutrición
- Registrar comidas y snacks
- Análisis nutricional semanal
- Recomendaciones dietéticas

## 🧪 Testing

### Ejecutar tests
```bash
# Todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Tests específicos
npm run test src/test/components/atoms/

# Coverage
npm run test:coverage
```

### Estructura de tests
- **Unit**: Hooks, utilidades, lógica de negocio
- **Integration**: Use cases, repositorios
- **Component**: UI components con React Testing Library

## 🔄 Estado actual del proyecto

### ✅ Completado
- [x] Arquitectura Clean Architecture
- [x] Componentes Atomic Design
- [x] Sistema de formularios con validación
- [x] Gestión de estado con React Query
- [x] Sistema de notificaciones
- [x] Manejo de errores
- [x] Tests unitarios e integración
- [x] Configuración de Tailwind CSS v4

### 🔄 En progreso
- [ ] Documentación de API
- [ ] Guías de desarrollo

### 📋 Pendiente
- [ ] Implementación de backend
- [ ] Migración de repositorios en memoria a API
- [ ] Tests end-to-end
- [ ] CI/CD pipeline

## 🚀 Roadmap

### Fase 1: MVP (✅ Completado)
- Funcionalidad básica con datos en memoria
- UI/UX completa
- Tests de calidad

### Fase 2: Backend (🔄 En desarrollo)
- API REST con Node.js/Express
- Base de datos PostgreSQL
- Autenticación JWT

### Fase 3: Producción
- Deploy en Vercel/Netlify
- Base de datos en la nube
- Monitoreo y analytics

## 🏗️ Extensibilidad

### Agregar nuevas entidades
1. Crear entidad en `src/domain/`
2. Implementar repositorio en `src/repositories/`
3. Crear use case en `src/use-cases/`
4. Implementar hooks en `src/hooks/`
5. Crear componentes UI en `src/components/`

### Agregar nuevas características
1. Definir en `src/config/features.ts`
2. Implementar lógica en use cases
3. Crear componentes UI
4. Agregar tests

## 🤝 Contribución

### Estándares de código
- **TypeScript**: Tipado estricto
- **ESLint**: Reglas de linting
- **Prettier**: Formateo automático
- **Conventional Commits**: Mensajes de commit

### Proceso de desarrollo
1. Fork del repositorio
2. Crear feature branch
3. Implementar cambios
4. Agregar tests
5. Crear Pull Request

## 📚 Recursos

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Atomic Design - Brad Frost](https://bradfrost.com/blog/post/atomic-web-design/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles.

## 👥 Autores

Desarrollado como proyecto de aprendizaje de Clean Architecture y React moderno.

---

**¿Necesitas ayuda?** Abre un issue o contacta al equipo de desarrollo.

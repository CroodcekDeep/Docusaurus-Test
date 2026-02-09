---
sidebar_position: 1
---

# Estándares de Código

| Acción | Autor | Fecha |
|--------|-------|-------|
| Creado | Equipo de Arquitectura | 2026-02-09 |
| Modificado | Equipo de Arquitectura | 2026-02-09 |

Lineamientos generales para mantener un código limpio, consistente y mantenible en todos los proyectos de Banco Pichincha.

## Principios generales

- **Legibilidad sobre brevedad**: el código se lee más veces de las que se escribe
- **Consistencia**: seguir las convenciones del proyecto existente
- **Simplicidad**: preferir soluciones simples y directas
- **Documentar lo no obvio**: agregar comentarios solo cuando la lógica no es evidente

## Nomenclatura

### Variables y funciones

| Lenguaje | Convención | Ejemplo |
|----------|-----------|---------|
| TypeScript / JavaScript | camelCase | `getUserData()` |
| Python | snake_case | `get_user_data()` |
| Java / C# | camelCase (métodos), PascalCase (clases) | `getUserData()`, `UserService` |
| CSS | kebab-case | `main-container` |

### Archivos y carpetas

- Componentes React/Angular: **PascalCase** → `UserProfile.tsx`
- Archivos de utilidad: **camelCase** → `formatDate.ts`
- Archivos de configuración: **kebab-case** → `app-config.json`

## Estructura de commits

Seguimos la convención de **Conventional Commits**:

```
<tipo>(<alcance>): <descripción corta>

[cuerpo opcional]

[footer opcional]
```

### Tipos permitidos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `style` | Cambios de formato (no afectan lógica) |
| `refactor` | Refactorización sin cambio funcional |
| `test` | Agregar o modificar tests |
| `chore` | Tareas de mantenimiento |
| `ci` | Cambios en CI/CD |

### Ejemplos

```bash
feat(auth): agregar login con Azure AD
fix(api): corregir timeout en servicio de pagos
docs(readme): actualizar instrucciones de despliegue
```

## Code Review

Toda contribución debe pasar por un **Pull Request** con al menos una aprobación:

- Verificar que el código sigue los estándares descritos aquí
- Revisar que existan tests para la funcionalidad nueva
- Validar que no se introduzcan vulnerabilidades de seguridad
- Comentar de forma constructiva y específica

## Herramientas recomendadas

| Herramienta | Propósito |
|-------------|-----------|
| **ESLint** | Linting para JavaScript/TypeScript |
| **Prettier** | Formateo automático de código |
| **SonarQube** | Análisis estático de calidad |
| **Husky** | Git hooks para validaciones pre-commit |

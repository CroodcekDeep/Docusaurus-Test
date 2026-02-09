---
sidebar_position: 2
---

# Flujo de Trabajo con Git

| Acción | Autor | Fecha |
|--------|-------|-------|
| Creado | Equipo de Arquitectura | 2026-02-09 |
| Modificado | Equipo de Arquitectura | 2026-02-09 |

Guía del flujo de trabajo con Git adoptado por los equipos de desarrollo de Banco Pichincha.

## Estrategia de ramas

Utilizamos un modelo basado en **GitFlow simplificado**:

```
main ─────────────────────────────────────────────►
  │                                    ▲
  └── develop ─────────────────────────┤
        │               ▲              │
        └── feature/xxx ┘              │
        └── bugfix/xxx ────────────────┘
```

### Ramas principales

| Rama | Propósito | Protegida |
|------|-----------|-----------|
| `main` | Código en producción | Sí |
| `develop` | Integración de desarrollo | Sí |

### Ramas de trabajo

| Prefijo | Uso | Ejemplo |
|---------|-----|---------|
| `feature/` | Nueva funcionalidad | `feature/login-azure-ad` |
| `bugfix/` | Corrección de errores | `bugfix/fix-token-refresh` |
| `hotfix/` | Corrección urgente en producción | `hotfix/patch-auth-error` |
| `release/` | Preparación de release | `release/v2.1.0` |

## Flujo de trabajo diario

### 1. Crear una rama de trabajo

```bash
git checkout develop
git pull origin develop
git checkout -b feature/mi-funcionalidad
```

### 2. Hacer commits frecuentes

```bash
git add .
git commit -m "feat(modulo): descripción del cambio"
```

### 3. Sincronizar con develop

```bash
git fetch origin
git rebase origin/develop
```

### 4. Crear Pull Request

- Título descriptivo siguiendo Conventional Commits
- Descripción del cambio y cómo probarlo
- Asignar al menos un reviewer
- Vincular el ticket/issue correspondiente

### 5. Merge después de aprobación

Una vez aprobado, hacer **squash merge** a `develop`:

```bash
# Desde la interfaz de Azure DevOps / GitHub
# Seleccionar "Squash and merge"
```

## Buenas prácticas

- **No commitear directamente** a `main` o `develop`
- **Commits pequeños y frecuentes** en lugar de commits grandes
- **Rebase** en lugar de merge para mantener historial limpio
- **Eliminar ramas** después del merge
- **No incluir** archivos sensibles (`.env`, credenciales, certificados)

## Archivo `.gitignore` recomendado

```gitignore
# Dependencias
node_modules/
vendor/

# Variables de entorno
.env
.env.local
.env.*.local

# Build
dist/
build/
.next/

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
```

## Resolución de conflictos

1. Identificar los archivos en conflicto: `git status`
2. Abrir cada archivo y resolver manualmente los bloques `<<<<<<<` / `=======` / `>>>>>>>`
3. Marcar como resuelto: `git add <archivo>`
4. Continuar el rebase: `git rebase --continue`

:::caution
Nunca uses `git push --force` en ramas compartidas (`main`, `develop`). Solo usa `--force-with-lease` en tu rama personal si es necesario después de un rebase.
:::

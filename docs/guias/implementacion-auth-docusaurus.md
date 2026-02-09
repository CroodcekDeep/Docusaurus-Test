---
sidebar_position: 6
---

# Implementación de Autenticación Azure AD en Docusaurus

| Acción | Autor | Fecha |
|--------|-------|-------|
| Creado | Equipo de Arquitectura | 2026-02-09 |

Guía técnica sobre cómo implementamos la autenticación con Microsoft Entra ID (Azure AD) directamente en Docusaurus, sin depender de proveedores de hosting externos.

---

## ¿Por qué Autenticación Client-Side?

### El Problema

Muchas soluciones de autenticación dependen del proveedor de hosting:

| Proveedor | Solución Nativa | Limitación |
|-----------|-----------------|------------|
| Azure Static Web Apps | EasyAuth | Solo funciona en Azure |
| Vercel | Vercel Authentication | Solo funciona en Vercel |
| Netlify | Netlify Identity | Solo funciona en Netlify |
| AWS Amplify | Cognito | Solo funciona en AWS |

Si cambias de proveedor, **pierdes la autenticación**.

### La Solución

Implementar autenticación **100% client-side** usando MSAL.js:

- Funciona en **cualquier hosting** de archivos estáticos
- No requiere backend ni serverless functions
- Usa estándares de Microsoft Entra ID (Azure AD)
- Tokens manejados directamente en el navegador

```
┌─────────────────────────────────────────────────────────────┐
│                    HOSTING AGNÓSTICO                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Azure  │  │ Vercel  │  │ Netlify │  │ GitHub  │  ...   │
│  │  SWA    │  │         │  │         │  │ Pages   │        │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        │
│       │            │            │            │              │
│       └────────────┴─────┬──────┴────────────┘              │
│                          │                                   │
│                   ┌──────▼──────┐                           │
│                   │  MSAL.js    │  ← Misma implementación   │
│                   │  (Browser)  │    en todos               │
│                   └──────┬──────┘                           │
│                          │                                   │
│                   ┌──────▼──────┐                           │
│                   │  Azure AD   │                           │
│                   │  (Auth)     │                           │
│                   └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquitectura de la Implementación

### Componentes Principales

```
src/
├── auth/                          # Módulo de autenticación
│   ├── msalConfig.ts              # Configuración de MSAL
│   ├── AuthProvider.tsx           # Provider que inicializa MSAL
│   ├── AuthGuard.tsx              # Protección de rutas
│   ├── useAuth.ts                 # Hook para acceder a auth
│   └── index.ts                   # Exports
├── components/
│   └── UserMenu/                  # UI del usuario
│       ├── index.tsx
│       └── styles.module.css
└── theme/                         # Swizzling de Docusaurus
    ├── Root.tsx                   # Envuelve la app con auth
    └── Navbar/Content/
        └── index.tsx              # Agrega UserMenu al navbar
```

### Flujo de Datos

```
┌──────────────────────────────────────────────────────────────┐
│                         Root.tsx                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    AuthProvider                         │  │
│  │  - Inicializa PublicClientApplication (MSAL)           │  │
│  │  - Maneja handleRedirectPromise()                      │  │
│  │  - Provee MsalProvider a toda la app                   │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │                   AuthGuard                       │  │  │
│  │  │  - Verifica isAuthenticated                      │  │  │
│  │  │  - Si no auth → redirect a Microsoft login       │  │  │
│  │  │  - Si auth → renderiza children                  │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │              Docusaurus App                 │  │  │  │
│  │  │  │  ┌──────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  Navbar (con UserMenu)               │  │  │  │  │
│  │  │  │  │  - Avatar con iniciales              │  │  │  │  │
│  │  │  │  │  - Dropdown: nombre, email, logout   │  │  │  │  │
│  │  │  │  └──────────────────────────────────────┘  │  │  │  │
│  │  │  │  ┌──────────────────────────────────────┐  │  │  │  │
│  │  │  │  │  Contenido (docs, blog, pages)       │  │  │  │  │
│  │  │  │  └──────────────────────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Implementación Paso a Paso

### 1. Instalar Dependencias

```bash
npm install @azure/msal-browser @azure/msal-react
```

| Paquete | Propósito |
|---------|-----------|
| `@azure/msal-browser` | Core de MSAL para navegadores |
| `@azure/msal-react` | Hooks y componentes React para MSAL |

### 2. Configuración MSAL (`src/auth/msalConfig.ts`)

Este archivo contiene la configuración de conexión con Azure AD:

```typescript
import { Configuration, LogLevel } from '@azure/msal-browser';

// IDs de Azure AD
const AZURE_CONFIG = {
  clientId: 'tu-client-id',      // Application (client) ID
  tenantId: 'tu-tenant-id',      // Directory (tenant) ID
};

export const getMsalConfig = (): Configuration => {
  return {
    auth: {
      clientId: AZURE_CONFIG.clientId,
      authority: `https://login.microsoftonline.com/${AZURE_CONFIG.tenantId}`,
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: 'localStorage',  // Persiste sesión entre tabs
      storeAuthStateInCookie: false,
    },
  };
};

// Permisos solicitados al usuario
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};
```

**Puntos clave:**
- `authority`: URL de login de Microsoft con tu tenant
- `redirectUri`: A dónde vuelve el usuario después del login
- `cacheLocation: 'localStorage'`: Mantiene sesión al cerrar pestaña
- `scopes`: Permisos que la app solicita (User.Read = leer perfil)

### 3. AuthProvider (`src/auth/AuthProvider.tsx`)

Inicializa MSAL y provee el contexto a toda la aplicación:

```typescript
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';

let msalInstance: PublicClientApplication | null = null;

const initializeMsal = async () => {
  const config = getMsalConfig();
  msalInstance = new PublicClientApplication(config);

  // CRÍTICO: Inicializar antes de usar
  await msalInstance.initialize();

  // Procesar respuesta de redirect (si viene de login)
  const response = await msalInstance.handleRedirectPromise();
  if (response) {
    msalInstance.setActiveAccount(response.account);
  }

  return msalInstance;
};

export const AuthProvider = ({ children }) => {
  const [instance, setInstance] = useState(null);

  useEffect(() => {
    initializeMsal().then(setInstance);
  }, []);

  if (!instance) return <Loading />;

  return (
    <MsalProvider instance={instance}>
      {children}
    </MsalProvider>
  );
};
```

**Puntos clave:**
- `PublicClientApplication`: Clase principal de MSAL para SPAs
- `initialize()`: Nuevo en MSAL v3, debe llamarse antes de cualquier operación
- `handleRedirectPromise()`: Procesa el código de autorización al volver del login

### 4. AuthGuard (`src/auth/AuthGuard.tsx`)

Protege el contenido y fuerza autenticación:

```typescript
import { useAuth } from './useAuth';

export const AuthGuard = ({ children }) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    // Si no está autenticado, redirigir a login
    if (!isAuthenticated && !isLoading) {
      login();
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <LoginScreen />;

  return children;
};
```

**Flujo:**
1. Usuario accede a la app
2. `AuthGuard` detecta que no está autenticado
3. Llama a `login()` → redirect a Microsoft
4. Usuario se autentica en Microsoft
5. Redirect de vuelta a la app
6. `AuthGuard` detecta autenticación exitosa
7. Renderiza el contenido

### 5. Hook useAuth (`src/auth/useAuth.ts`)

Abstrae la lógica de MSAL en un hook simple:

```typescript
import { useMsal, useIsAuthenticated } from '@azure/msal-react';

export const useAuth = () => {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const login = async () => {
    await instance.loginRedirect(loginRequest);
  };

  const logout = async () => {
    await instance.logoutRedirect();
  };

  const user = accounts[0] ? {
    name: accounts[0].name,
    email: accounts[0].username,
  } : null;

  return { isAuthenticated, user, login, logout };
};
```

### 6. Swizzling Root (`src/theme/Root.tsx`)

Docusaurus permite "swizzlear" componentes para personalizarlos. `Root.tsx` envuelve toda la aplicación:

```typescript
import { AuthProvider, AuthGuard } from '@site/src/auth';

export default function Root({ children }) {
  return (
    <AuthProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </AuthProvider>
  );
}
```

**¿Por qué Root.tsx?**
- Se ejecuta antes que cualquier otro componente
- Envuelve TODA la aplicación (incluyendo navbar, footer, contenido)
- Es el lugar ideal para providers globales

### 7. Swizzling Navbar (`src/theme/Navbar/Content/index.tsx`)

Agregamos el `UserMenu` al navbar existente:

```typescript
import UserMenu from '@site/src/components/UserMenu';

export default function NavbarContent() {
  return (
    <div className="navbar__inner">
      <div className="navbar__items">
        <NavbarLogo />
        <NavbarItems items={leftItems} />
      </div>
      <div className="navbar__items navbar__items--right">
        <NavbarItems items={rightItems} />
        <NavbarColorModeToggle />
        <SearchBar />
        <UserMenu />  {/* ← Agregado aquí */}
      </div>
    </div>
  );
}
```

---

## Flujo Completo de Autenticación

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────┐
│ Usuario │     │  Docusaurus │     │   MSAL.js   │     │ Azure AD │
└────┬────┘     └──────┬──────┘     └──────┬──────┘     └────┬─────┘
     │                 │                   │                  │
     │  1. Accede      │                   │                  │
     │────────────────>│                   │                  │
     │                 │                   │                  │
     │                 │  2. AuthGuard     │                  │
     │                 │  detecta no auth  │                  │
     │                 │──────────────────>│                  │
     │                 │                   │                  │
     │                 │                   │  3. loginRedirect│
     │                 │                   │─────────────────>│
     │                 │                   │                  │
     │  4. Redirect a login.microsoft.com                    │
     │<──────────────────────────────────────────────────────│
     │                                                        │
     │  5. Usuario ingresa credenciales                       │
     │───────────────────────────────────────────────────────>│
     │                                                        │
     │  6. Redirect con código de autorización                │
     │<──────────────────────────────────────────────────────│
     │                 │                   │                  │
     │────────────────>│                   │                  │
     │                 │  7. handleRedirect│                  │
     │                 │──────────────────>│                  │
     │                 │                   │                  │
     │                 │                   │  8. Intercambia  │
     │                 │                   │  código por token│
     │                 │                   │─────────────────>│
     │                 │                   │                  │
     │                 │                   │  9. Access token │
     │                 │                   │<─────────────────│
     │                 │                   │                  │
     │                 │  10. Usuario      │                  │
     │                 │  autenticado      │                  │
     │                 │<──────────────────│                  │
     │                 │                   │                  │
     │  11. Contenido  │                   │                  │
     │<────────────────│                   │                  │
     │                 │                   │                  │
```

---

## Comparación con Autenticación del Proveedor

| Aspecto | MSAL.js (Nuestra Implementación) | Auth del Proveedor |
|---------|----------------------------------|-------------------|
| **Portabilidad** | Funciona en cualquier hosting | Solo en ese proveedor |
| **Configuración** | Código en el proyecto | Panel del proveedor |
| **Dependencia** | Solo Azure AD | Proveedor + Azure AD |
| **Control** | Total sobre el flujo | Limitado a opciones |
| **Migración** | Sin cambios al mover | Reconfigurar todo |
| **Debugging** | Console del navegador | Logs del proveedor |
| **Costo** | Gratis (Azure AD) | Puede tener costo extra |

---

## Personalización

### Cambiar Comportamiento del Login

Editar `src/auth/AuthGuard.tsx`:

```typescript
// Login automático (actual)
useEffect(() => {
  if (!isAuthenticated && !isLoading) {
    login();  // Redirige automáticamente
  }
}, [isAuthenticated, isLoading]);

// Login manual (con botón)
if (!isAuthenticated) {
  return (
    <div>
      <h1>Bienvenido</h1>
      <button onClick={login}>Iniciar Sesión</button>
    </div>
  );
}
```

### Restringir por Dominio de Email

```typescript
const ALLOWED_DOMAINS = ['bancopichincha.com'];

if (isAuthenticated && user) {
  const domain = user.email.split('@')[1];
  if (!ALLOWED_DOMAINS.includes(domain)) {
    return <AccessDenied />;
  }
}
```

### Deshabilitar Auth para Desarrollo

En `src/theme/Root.tsx`:

```typescript
const DISABLE_AUTH = process.env.NODE_ENV === 'development';

export default function Root({ children }) {
  if (DISABLE_AUTH) {
    return children;  // Sin autenticación
  }

  return (
    <AuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AuthProvider>
  );
}
```

### Proteger Solo Ciertas Rutas

```typescript
const PUBLIC_PATHS = ['/', '/docs/intro'];

export const AuthGuard = ({ children }) => {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();

  const isPublicPath = PUBLIC_PATHS.includes(location.pathname);

  if (isPublicPath) {
    return children;  // No requiere auth
  }

  if (!isAuthenticated) {
    login();
    return <Loading />;
  }

  return children;
};
```

---

## Troubleshooting

### Error: AADSTS9002326 (Cross-origin token redemption)

**Causa:** El Redirect URI está configurado como tipo "Web" en lugar de "SPA".

**Solución:** En Azure Portal → Authentication, eliminar el URI de la sección "Web" y agregarlo en "Single-page application".

### Error: AADSTS50011 (Reply URL mismatch)

**Causa:** El redirect URI no coincide exactamente.

**Solución:** Verificar que la URL en Azure coincida exactamente con `window.location.origin` (incluyendo protocolo y puerto).

### La sesión no persiste

**Causa:** `cacheLocation` no está configurado correctamente.

**Solución:** Usar `localStorage` en lugar de `sessionStorage`:
```typescript
cache: {
  cacheLocation: 'localStorage',
}
```

### Loop infinito de redirects

**Causa:** `handleRedirectPromise()` no se está procesando correctamente.

**Solución:** Asegurarse de que MSAL esté inicializado completamente antes de cualquier operación.

---

## Referencias

- [MSAL.js v3 Migration Guide](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/v2-migration.md)
- [Docusaurus Swizzling](https://docusaurus.io/docs/swizzling)
- [Microsoft Identity Platform](https://learn.microsoft.com/en-us/azure/active-directory/develop/)

---
sidebar_position: 5
---

# Autenticación con Microsoft Entra ID

| Acción | Autor | Fecha |
|--------|-------|-------|
| Creado | Equipo de Arquitectura | 2026-02-09 |

Guía completa para configurar la autenticación con Microsoft Entra ID (Azure AD) usando MSAL.js en Docusaurus.

---

## Arquitectura

La autenticación está implementada 100% del lado del cliente usando MSAL.js, lo que permite desplegar en cualquier hosting de archivos estáticos.

```
┌─────────────────────────────────────────────────────┐
│                    Root.tsx                          │
│  ┌───────────────────────────────────────────────┐  │
│  │              AuthProvider                      │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │            AuthGuard                     │  │  │
│  │  │  ┌───────────────────────────────────┐  │  │  │
│  │  │  │      Docusaurus App               │  │  │  │
│  │  │  │  ┌─────────────────────────────┐  │  │  │  │
│  │  │  │  │ Navbar + UserMenu           │  │  │  │  │
│  │  │  │  │ Content (protected)         │  │  │  │  │
│  │  │  │  └─────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Flujo de Autenticación

1. Usuario accede a la app → `AuthGuard` detecta no autenticado
2. Redirect automático a Microsoft login (`login.microsoftonline.com`)
3. Usuario ingresa credenciales Microsoft
4. Redirect de vuelta a la app con tokens
5. MSAL procesa tokens → usuario autenticado
6. `AuthGuard` permite acceso → contenido renderizado
7. `UserMenu` muestra nombre/email + opción logout

---

## Configuración en Azure Portal

### Paso 1: Crear App Registration

1. Ir a [Azure Portal](https://portal.azure.com)
2. Navegar a **Microsoft Entra ID** → **App registrations**
3. Click en **New registration**
4. Completar:
   - **Name**: `Docusaurus Banco Pichincha`
   - **Supported account types**: Seleccionar según necesidad (ver tabla)
   - **Redirect URI**: Single-page application → `http://localhost:3000`
5. Click **Register**

### Tipos de Cuenta Soportados

| Tipo | Uso | Tenant ID |
|------|-----|-----------|
| Single tenant | Solo usuarios de tu organización | Tu tenant ID específico |
| Multitenant | Usuarios de cualquier organización | `organizations` |
| Multitenant + Personal | Org + cuentas personales Microsoft | `common` |
| Personal only | Solo cuentas personales | `consumers` |

### Paso 2: Copiar IDs

Desde la página **Overview** del App Registration, copiar:

- **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### Paso 3: Configurar Authentication

1. Ir a **Authentication** en el menú lateral
2. En **Single-page application**, agregar los URIs de redirect:
   - Desarrollo: `http://localhost:3000`
   - Producción: `https://tu-dominio.com`
3. En **Implicit grant and hybrid flows**, marcar:
   - ✅ Access tokens
   - ✅ ID tokens
4. Click **Save**

### Paso 4: Configurar API Permissions (Opcional)

Por defecto, la app tiene el permiso `User.Read` de Microsoft Graph. Si necesitas permisos adicionales:

1. Ir a **API permissions**
2. Click **Add a permission**
3. Seleccionar **Microsoft Graph** → **Delegated permissions**
4. Agregar permisos necesarios
5. Si son permisos admin-only, click **Grant admin consent**

---

## Configuración en Docusaurus

### Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# Azure AD / Microsoft Entra ID
AZURE_CLIENT_ID=tu-client-id-aqui
AZURE_TENANT_ID=tu-tenant-id-aqui
# AZURE_REDIRECT_URI=http://localhost:3000  # Opcional, usa origin por defecto
```

:::caution Seguridad
Nunca commits el archivo `.env` al repositorio. Asegúrate de que esté en `.gitignore`.
:::

### Configuración Alternativa (Hardcoded)

Si no usas variables de entorno, puedes configurar directamente en `docusaurus.config.ts`:

```typescript
customFields: {
  azureClientId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
  azureTenantId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
},
```

:::warning No recomendado
Hardcodear credenciales no es recomendable para producción. Usa variables de entorno.
:::

---

## Restringir a Dominio Corporativo

Para permitir solo usuarios con correo `@bancopichincha.com`:

### Opción 1: Single Tenant (Recomendado)

Usar el tenant ID específico de tu organización:

```typescript
// docusaurus.config.ts
customFields: {
  azureClientId: 'tu-client-id',
  azureTenantId: 'tu-tenant-id-corporativo', // No 'common'
},
```

### Opción 2: Validación en Frontend

Modificar `src/auth/AuthGuard.tsx`:

```typescript
const ALLOWED_DOMAINS = ['bancopichincha.com', 'pichincha.com'];

const isAllowedDomain = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase();
  return ALLOWED_DOMAINS.includes(domain);
};

// En el componente AuthGuard:
if (isAuthenticated && user && !isAllowedDomain(user.email)) {
  return (
    <div className="auth-error">
      <h2>Acceso Denegado</h2>
      <p>Solo usuarios de Banco Pichincha pueden acceder.</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### Opción 3: Claims en Azure AD

1. En el App Registration, ir a **Token configuration**
2. Click **Add optional claim** → **ID**
3. Agregar claim `email`
4. Configurar **User assignment required** en Enterprise Applications

---

## Estructura de Archivos

```
src/
├── auth/
│   ├── index.ts           # Barrel exports
│   ├── msalConfig.ts      # Configuración MSAL
│   ├── AuthProvider.tsx   # Provider React con MsalProvider
│   ├── AuthGuard.tsx      # Protección de rutas
│   └── useAuth.ts         # Hook personalizado
├── components/
│   └── UserMenu/
│       ├── index.tsx      # Componente avatar + dropdown
│       └── styles.module.css
└── theme/
    ├── Root.tsx           # Swizzle: envuelve app con auth
    └── Navbar/
        └── Content/
            ├── index.tsx  # Swizzle: agrega UserMenu
            └── styles.module.css
```

---

## API del Hook useAuth

```typescript
import { useAuth } from '@site/src/auth';

const MyComponent = () => {
  const {
    isAuthenticated,  // boolean: usuario autenticado
    isLoading,        // boolean: procesando auth
    user,             // AuthUser | null: datos del usuario
    login,            // () => Promise<void>: iniciar login
    logout,           // () => Promise<void>: cerrar sesión
    getAccessToken,   // () => Promise<string | null>: obtener token
  } = useAuth();

  // user contiene:
  // - name: string
  // - email: string
  // - username: string
  // - tenantId: string
  // - localAccountId: string
};
```

---

## Deshabilitar Autenticación (Desarrollo)

Para desarrollo sin autenticación, comentar el `AuthGuard` en `Root.tsx`:

```typescript
// src/theme/Root.tsx
export default function Root({ children }: RootProps): JSX.Element {
  return (
    <AuthProvider>
      {/* <AuthGuard> */}
        {children}
      {/* </AuthGuard> */}
    </AuthProvider>
  );
}
```

---

## Compatibilidad con Hosting

| Hosting | Status | Notas |
|---------|--------|-------|
| Azure Static Web Apps | ✅ | Compatible nativo |
| Vercel | ✅ | Configurar redirect URIs |
| Netlify | ✅ | Configurar redirect URIs |
| GitHub Pages | ✅ | Configurar redirect URIs |
| Servidor propio | ✅ | Cualquier servidor de archivos estáticos |

---

## Solución de Problemas

### Error: AADSTS50011 (Reply URL mismatch)

**Causa**: El redirect URI no coincide con los configurados en Azure.

**Solución**:
1. Verificar que `AZURE_REDIRECT_URI` coincida exactamente
2. Agregar el URI en Azure Portal → Authentication → Redirect URIs

### Error: AADSTS700054 (Response type not enabled)

**Causa**: No están habilitados los tokens implícitos.

**Solución**: En Azure Portal → Authentication, marcar:
- ✅ Access tokens
- ✅ ID tokens

### Loop infinito de login

**Causa**: El redirect no se procesa correctamente.

**Solución**:
1. Verificar que MSAL está inicializado antes de `handleRedirectPromise`
2. Limpiar caché del navegador y cookies

### Token expirado

**Causa**: El access token tiene tiempo de vida limitado (1 hora por defecto).

**Solución**: `useAuth` maneja automáticamente el refresh con `acquireTokenSilent`.

---

## Referencias

- [MSAL.js Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Microsoft Entra ID Documentation](https://learn.microsoft.com/en-us/entra/identity/)
- [Docusaurus Swizzling](https://docusaurus.io/docs/swizzling)

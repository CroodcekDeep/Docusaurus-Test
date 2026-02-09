# Autenticacion con Azure

Esta guia explica como agregar autenticacion con cuentas de Microsoft/Azure DevOps a un sitio Docusaurus desplegado en Azure Static Web Apps, y como restringir el acceso a un dominio corporativo (ej. `@pichincha.com`).

---

## Requisitos previos

- Un sitio Docusaurus desplegado en **Azure Static Web Apps**
- Acceso al **Azure Portal** con permisos para crear App Registrations
- Acceso a **Microsoft Entra ID** (antes Azure Active Directory)

---

## Paso 1: Archivo base `staticwebapp.config.json`

Este archivo se coloca en la carpeta `static/` del proyecto Docusaurus. Con esta configuracion basica, **cualquier cuenta Microsoft puede iniciar sesion**:

```json
{
  "routes": [
    {
      "route": "/assets/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/img/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "responseOverrides": {
    "401": {
      "redirect": "/.auth/login/aad",
      "statusCode": 302
    }
  },
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/img/*", "/assets/*"]
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  }
}
```

### Que hace cada seccion

| Seccion | Descripcion |
|---------|-------------|
| `routes` | Define que rutas requieren autenticacion (`authenticated`) y cuales son publicas (`anonymous`) |
| `responseOverrides` | Cuando un usuario no esta autenticado (401), lo redirige al login de Azure AD |
| `navigationFallback` | Permite que las rutas de Docusaurus (SPA) funcionen correctamente |
| `globalHeaders` | Headers de seguridad para proteger contra clickjacking y MIME sniffing |

---

## Paso 2: Restringir acceso a `@pichincha.com`

Para que **solo cuentas del dominio corporativo** puedan acceder, se necesita agregar el bloque `auth` y bloquear otros proveedores de login.

### Configuracion completa con restriccion de dominio

```json
{
  "auth": {
    "identityProviders": {
      "azureActiveDirectory": {
        "registration": {
          "openIdIssuer": "https://login.microsoftonline.com/TU_TENANT_ID/v2.0",
          "clientIdSettingName": "AAD_CLIENT_ID",
          "clientSecretSettingName": "AAD_CLIENT_SECRET"
        }
      }
    }
  },
  "routes": [
    {
      "route": "/.auth/login/github",
      "statusCode": 404
    },
    {
      "route": "/.auth/login/twitter",
      "statusCode": 404
    },
    {
      "route": "/assets/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/img/*",
      "allowedRoles": ["anonymous"]
    },
    {
      "route": "/*",
      "allowedRoles": ["authenticated"]
    }
  ],
  "responseOverrides": {
    "401": {
      "redirect": "/.auth/login/aad",
      "statusCode": 302
    }
  },
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/img/*", "/assets/*"]
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  }
}
```

### Que se agrego y por que

#### Bloque `auth.identityProviders.azureActiveDirectory`

```json
"auth": {
  "identityProviders": {
    "azureActiveDirectory": {
      "registration": {
        "openIdIssuer": "https://login.microsoftonline.com/TU_TENANT_ID/v2.0",
        "clientIdSettingName": "AAD_CLIENT_ID",
        "clientSecretSettingName": "AAD_CLIENT_SECRET"
      }
    }
  }
}
```

- **`openIdIssuer`**: Vincula la autenticacion al tenant especifico de tu organizacion. Reemplazar `TU_TENANT_ID` con el ID real del tenant (lo encuentras en Azure Portal > Entra ID > Overview).
- **`clientIdSettingName`**: Nombre de la variable de entorno donde se almacena el Client ID de la App Registration.
- **`clientSecretSettingName`**: Nombre de la variable de entorno donde se almacena el Client Secret.

> Sin este bloque, Azure SWA usa un proveedor generico de Microsoft que acepta **cualquier cuenta**, incluyendo cuentas personales (@hotmail.com, @outlook.com).

#### Bloqueo de otros proveedores

```json
{
  "route": "/.auth/login/github",
  "statusCode": 404
},
{
  "route": "/.auth/login/twitter",
  "statusCode": 404
}
```

- Deshabilita los proveedores de login de GitHub y Twitter devolviendo un error 404.
- Esto asegura que **Azure AD sea la unica forma de autenticarse**.

---

## Paso 3: Configuracion en Azure Portal

### 3.1 Crear App Registration

1. Ir a **Azure Portal** > **Microsoft Entra ID** > **App registrations**
2. Click en **New registration**
3. Configurar:
   - **Name**: `Docusaurus Docs` (o el nombre que prefieras)
   - **Supported account types**: Seleccionar **"Accounts in this organizational directory only (Single tenant)"**
     - **Esta es la opcion clave** que restringe el acceso al dominio `@pichincha.com`
   - **Redirect URI**: Tipo `Web`, valor: `https://TU_SITIO.azurestaticapps.net/.auth/login/aad/callback`
4. Click en **Register**
5. Copiar el **Application (client) ID** y el **Directory (tenant) ID**

### 3.2 Crear Client Secret

1. En la App Registration creada, ir a **Certificates & secrets**
2. Click en **New client secret**
3. Agregar una descripcion y seleccionar la expiracion
4. **Copiar el valor del secret inmediatamente** (no se puede ver despues)

### 3.3 Configurar variables en Azure Static Web App

1. Ir al recurso **Static Web App** en Azure Portal
2. Ir a **Configuration** > **Application settings**
3. Agregar dos variables:

| Nombre | Valor |
|--------|-------|
| `AAD_CLIENT_ID` | El Application (client) ID del paso 3.1 |
| `AAD_CLIENT_SECRET` | El valor del secret del paso 3.2 |

4. Click en **Save**

### 3.4 Actualizar el archivo `staticwebapp.config.json`

Reemplazar `TU_TENANT_ID` en el archivo con el **Directory (tenant) ID** copiado en el paso 3.1.

---

## Resumen: Diferencias entre configuracion basica y restringida

| Aspecto | Basica | Restringida a @pichincha.com |
|---------|--------|------------------------------|
| Bloque `auth` | No necesario | Requerido con Tenant ID, Client ID y Secret |
| Proveedores de login | GitHub, Twitter y AAD disponibles | Solo Azure AD (otros bloqueados con 404) |
| App Registration | No necesaria | Requerida en modo Single Tenant |
| Variables de entorno | No necesarias | `AAD_CLIENT_ID` y `AAD_CLIENT_SECRET` |
| Quien puede acceder | Cualquier cuenta Microsoft | Solo cuentas `@pichincha.com` |

---

## Flujo de autenticacion

```
Usuario visita el sitio
        |
        v
  ¿Esta autenticado? ── Si ──> Accede al contenido
        |
       No
        |
        v
  Redirige a /.auth/login/aad
        |
        v
  Login con cuenta Microsoft
        |
        v
  ¿Cuenta es @pichincha.com? ── No ──> Error: acceso denegado
        |
       Si
        |
        v
  Regresa al sitio con sesion activa
```

---

## Endpoints utiles de Azure SWA

Una vez configurada la autenticacion, estos endpoints estan disponibles automaticamente:

| Endpoint | Descripcion |
|----------|-------------|
| `/.auth/login/aad` | Inicia el flujo de login con Azure AD |
| `/.auth/logout` | Cierra la sesion del usuario |
| `/.auth/me` | Devuelve informacion del usuario autenticado (JSON) |

### Ejemplo de respuesta de `/.auth/me`

```json
{
  "clientPrincipal": {
    "identityProvider": "aad",
    "userId": "abc123",
    "userDetails": "usuario@pichincha.com",
    "userRoles": ["authenticated", "anonymous"]
  }
}
```

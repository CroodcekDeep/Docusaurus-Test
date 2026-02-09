import { Configuration, LogLevel } from '@azure/msal-browser';

/**
 * Configuración de MSAL para Microsoft Entra ID (Azure AD)
 *
 * Los valores se configuran directamente aquí o desde customFields de Docusaurus.
 */

// Configuración de Azure AD - Banco Pichincha
const AZURE_CONFIG = {
  clientId: 'e003d34d-4474-45b3-9f9a-58fb40dbe21b',
  tenantId: 'b4da2b3c-2624-4bee-84f5-e72c99044c9b',
};

const getRedirectUri = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

export const getMsalConfig = (): Configuration => {
  return {
    auth: {
      clientId: AZURE_CONFIG.clientId,
      authority: `https://login.microsoftonline.com/${AZURE_CONFIG.tenantId}`,
      redirectUri: getRedirectUri(),
      postLogoutRedirectUri: getRedirectUri(),
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
    system: {
      loggerOptions: {
        loggerCallback: (level, message, containsPii) => {
          if (containsPii) return;
          switch (level) {
            case LogLevel.Error:
              console.error(message);
              break;
            case LogLevel.Warning:
              console.warn(message);
              break;
            case LogLevel.Info:
              // console.info(message);
              break;
            case LogLevel.Verbose:
              // console.debug(message);
              break;
          }
        },
        logLevel: LogLevel.Warning,
      },
    },
  };
};

// Scopes para Microsoft Graph API
export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
};

// Scopes adicionales para Graph API (si se necesitan)
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

import React, { useEffect, useState } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { getMsalConfig } from './msalConfig';

interface AuthProviderProps {
  children: React.ReactNode;
}

let msalInstance: PublicClientApplication | null = null;

const initializeMsal = async (): Promise<PublicClientApplication> => {
  if (msalInstance) {
    return msalInstance;
  }

  const config = getMsalConfig();
  msalInstance = new PublicClientApplication(config);

  await msalInstance.initialize();

  // Manejar respuesta de redirect al cargar
  const response = await msalInstance.handleRedirectPromise();
  if (response) {
    msalInstance.setActiveAccount(response.account);
  }

  // Establecer cuenta activa si hay cuentas en caché
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0 && !msalInstance.getActiveAccount()) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  // Escuchar eventos de login
  msalInstance.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      msalInstance?.setActiveAccount(payload.account);
    }
  });

  return msalInstance;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [instance, setInstance] = useState<PublicClientApplication | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initializeMsal()
      .then((msalInst) => {
        setInstance(msalInst);
        setIsInitializing(false);
      })
      .catch((err) => {
        console.error('Error initializing MSAL:', err);
        setError(err);
        setIsInitializing(false);
      });
  }, []);

  if (isInitializing) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner" />
        <p>Inicializando autenticación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-error">
        <h2>Error de Autenticación</h2>
        <p>No se pudo inicializar el sistema de autenticación.</p>
        <p className="auth-error__details">{error.message}</p>
        <button onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!instance) {
    return null;
  }

  return (
    <MsalProvider instance={instance}>
      {children}
    </MsalProvider>
  );
};

export default AuthProvider;

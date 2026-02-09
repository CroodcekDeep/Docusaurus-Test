import { useMsal, useIsAuthenticated, useAccount } from '@azure/msal-react';
import { AccountInfo, InteractionStatus } from '@azure/msal-browser';
import { useCallback, useMemo } from 'react';
import { loginRequest } from './msalConfig';

export interface AuthUser {
  name: string;
  email: string;
  username: string;
  tenantId: string;
  localAccountId: string;
}

export interface UseAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const mapAccountToUser = (account: AccountInfo | null): AuthUser | null => {
  if (!account) return null;

  return {
    name: account.name || account.username || 'Usuario',
    email: account.username || '',
    username: account.username || '',
    tenantId: account.tenantId || '',
    localAccountId: account.localAccountId || '',
  };
};

export const useAuth = (): UseAuthResult => {
  const { instance, inProgress, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = useAccount(accounts[0] || {});

  const isLoading = inProgress !== InteractionStatus.None;

  const user = useMemo(() => mapAccountToUser(account), [account]);

  const login = useCallback(async () => {
    try {
      // Usar redirect en lugar de popup para mejor compatibilidad
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error('Error durante el login:', error);
      throw error;
    }
  }, [instance]);

  const logout = useCallback(async () => {
    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin,
      });
    } catch (error) {
      console.error('Error durante el logout:', error);
      throw error;
    }
  }, [instance]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!account) return null;

    try {
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: account,
      });
      return response.accessToken;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      // Si falla el token silencioso, intentar con redirect
      try {
        await instance.acquireTokenRedirect(loginRequest);
        return null;
      } catch (redirectError) {
        console.error('Error en redirect para token:', redirectError);
        return null;
      }
    }
  }, [instance, account]);

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    getAccessToken,
  };
};

export default useAuth;

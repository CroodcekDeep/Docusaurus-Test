import React, { useState } from 'react';
import { useAuth } from './useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Componente AuthGuard para proteger contenido que requiere autenticación.
 *
 * @param children - Contenido a renderizar cuando está autenticado
 * @param fallback - Contenido opcional mientras carga o no autenticado
 * @param requireAuth - Si es true, muestra pantalla de login (default: true)
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireAuth = true
}) => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [guestMode, setGuestMode] = useState(false);

  // Mostrar loading mientras se inicializa o durante el proceso de auth
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner" />
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // Si está en modo invitado, renderizar contenido directamente
  if (guestMode) {
    return <>{children}</>;
  }

  // Si no está autenticado
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Mostrar pantalla de login con dos opciones
    return (
      <div className="auth-login-screen">
        <div className="auth-login-screen__content">
          <h1>Banco Pichincha</h1>
          <h2>Centro de Documentación Técnica</h2>
          <div className="auth-login-screen__buttons">
            <button
              className="auth-login-screen__btn-azure"
              onClick={() => login()}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M11.4 2L0 9.2l4.1 7.2L11.4 15V2zm1.2 0v13l11.4 7.2L12.6 2zM0 17.8L11.4 22v-5.8L4.1 17.8H0zm12.6-1.6V22l11.4-4.2h-4.1l-7.3 1.6z" />
              </svg>
              Iniciar sesión con Microsoft
            </button>
            <button
              className="auth-login-screen__btn-guest"
              onClick={() => setGuestMode(true)}
            >
              Entrar como Invitado
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Usuario autenticado, renderizar contenido
  return <>{children}</>;
};

export default AuthGuard;

import React, { useEffect } from 'react';
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
 * @param requireAuth - Si es true, redirige automáticamente al login (default: true)
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  requireAuth = true
}) => {
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    // Si requiere auth y no está autenticado ni cargando, iniciar login
    if (requireAuth && !isAuthenticated && !isLoading) {
      login();
    }
  }, [requireAuth, isAuthenticated, isLoading, login]);

  // Mostrar loading mientras se inicializa o durante el proceso de auth
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner" />
        <p>Verificando autenticación...</p>
      </div>
    );
  }

  // Si no está autenticado
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Mostrar pantalla de login mientras se redirige
    return (
      <div className="auth-login-screen">
        <div className="auth-login-screen__content">
          <h1>Banco Pichincha</h1>
          <h2>Centro de Documentación Técnica</h2>
          <p>Iniciando sesión con Microsoft...</p>
          <div className="auth-loading__spinner" />
        </div>
      </div>
    );
  }

  // Usuario autenticado, renderizar contenido
  return <>{children}</>;
};

export default AuthGuard;

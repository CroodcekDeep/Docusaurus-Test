import React from 'react';
import { AuthProvider, AuthGuard } from '@site/src/auth';

interface RootProps {
  children: React.ReactNode;
}

/**
 * Root component que envuelve toda la aplicación Docusaurus.
 * Se usa para integrar el AuthProvider y AuthGuard.
 *
 * Documentación: https://docusaurus.io/docs/swizzling#wrapper-your-site-with-root
 */
export default function Root({ children }: RootProps): JSX.Element {
  return (
    <AuthProvider>
      <AuthGuard>
        {children}
      </AuthGuard>
    </AuthProvider>
  );
}

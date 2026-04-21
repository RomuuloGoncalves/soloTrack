import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAutenticacao } from '../../contexts/ContextoAuth';
import { useToast } from '../../contexts/ToastContext';
import type { ReactNode } from 'react';

export function RotaPrivada({ children }: { children: ReactNode }) {
  const { estaAutenticado } = useAutenticacao();
  const { showToast } = useToast();

  useEffect(() => {
    if (!estaAutenticado) {
      showToast('Faça login para acessar esta página.', 'error');
    }
  }, []);

  return estaAutenticado ? <>{children}</> : <Navigate to="/login" replace />;
}

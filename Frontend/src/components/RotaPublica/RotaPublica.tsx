import { Navigate } from 'react-router-dom';
import { useAutenticacao } from '../../contexts/ContextoAuth';
import type { ReactNode } from 'react';

export function RotaPublica({ children }: { children: ReactNode }) {
  const { estaAutenticado } = useAutenticacao();
  return estaAutenticado ? <Navigate to="/" replace /> : <>{children}</>;
}

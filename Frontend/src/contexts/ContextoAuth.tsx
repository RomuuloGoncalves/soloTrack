import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import usuarioService from '../services/usuarioService';
import type { Usuario } from '../types/types';

interface ValorContextoAuth {
  usuario: Usuario | null;
  estaAutenticado: boolean;
  entrar: (token: string, usuario: Usuario) => void;
  sair: () => Promise<void>;
  atualizarDadosUsuario: (dadosAtualizados: Usuario) => void;
}

const ContextoAuth = createContext<ValorContextoAuth | null>(null);

function obterUsuarioSalvo(): Usuario | null {
  try {
    const dados = localStorage.getItem('usuario');
    return dados ? JSON.parse(dados) : null;
  } catch {
    return null;
  }
}

export function ProvedorAuth({ children }: { children: ReactNode }) {
  const navegar = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const token = Cookies.get('token');
    return token ? obterUsuarioSalvo() : null;
  });

  const entrar = useCallback((token: string, dadosUsuario: Usuario) => {
    Cookies.set('token', token, { expires: 7, path: '/' });
    localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
    setUsuario(dadosUsuario);
  }, []);

  const sair = useCallback(async () => {
    try {
      await usuarioService.logout();
    } catch {
      // ignora erro de rede; limpa sessão de qualquer forma
    } finally {
      Cookies.remove('token');
      localStorage.removeItem('usuario');
      setUsuario(null);
      navegar('/login');
    }
  }, [navegar]);

  const atualizarDadosUsuario = useCallback((dadosAtualizados: Usuario) => {
    localStorage.setItem('usuario', JSON.stringify(dadosAtualizados));
    setUsuario(dadosAtualizados);
  }, []);

  return (
    <ContextoAuth.Provider value={{ usuario, estaAutenticado: !!usuario, entrar, sair, atualizarDadosUsuario }}>
      {children}
    </ContextoAuth.Provider>
  );
}

export function useAutenticacao(): ValorContextoAuth {
  const ctx = useContext(ContextoAuth);
  if (!ctx) throw new Error('useAutenticacao deve ser usado dentro de ProvedorAuth');
  return ctx;
}

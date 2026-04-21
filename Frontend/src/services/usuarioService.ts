import api from './api';
import type { LoginPayload, LoginResponse, StoreUsuarioRequest, CadastroResponse, LogoutResponse, Usuario } from '../types/types';
import type { AxiosPromise } from 'axios';

export interface AtualizarUsuarioPayload {
  nome?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

interface AtualizarUsuarioResponse {
  success: boolean;
  message: string;
  data: Usuario;
}

const usuarioService = {
  login: (dados: LoginPayload): AxiosPromise<LoginResponse> => {
    return api.post<LoginResponse>('/login', dados);
  },

  cadastro: (dados: StoreUsuarioRequest): AxiosPromise<CadastroResponse> => {
    return api.post<CadastroResponse>('/usuarios', dados);
  },

  logout: (): AxiosPromise<LogoutResponse> => {
    return api.post<LogoutResponse>('/logout');
  },

  atualizar: (id: number, dados: AtualizarUsuarioPayload): AxiosPromise<AtualizarUsuarioResponse> => {
    return api.put<AtualizarUsuarioResponse>(`/usuarios/${id}`, dados);
  },
};

export default usuarioService;

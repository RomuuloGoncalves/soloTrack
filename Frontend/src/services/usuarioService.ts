import api from './api';
import type { LoginPayload, LoginResponse, StoreUsuarioRequest, CadastroResponse, LogoutResponse } from '../types/types';
import type { AxiosPromise } from 'axios';

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
};

export default usuarioService;

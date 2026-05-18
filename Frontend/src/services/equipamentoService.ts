import type { AxiosPromise } from 'axios';
import api from './api';
import type { Equipamento } from '../types/types';

type EquipamentoIndexResponse = {
  success: boolean;
  message: string;
  data: Equipamento[];
};

type EquipamentoStoreResponse = {
  success: boolean;
  message: string;
  data: Equipamento;
};

export type StoreEquipamentoRequest = {
  mac_address: string;
  nome_apelido?: string;
};

const equipamentoService = {
  listar: (): AxiosPromise<EquipamentoIndexResponse> => {
    return api.get('/equipamentos');
  },

  criar: (payload: StoreEquipamentoRequest): AxiosPromise<EquipamentoStoreResponse> => {
    return api.post('/equipamentos', payload);
  },

  atualizar: (id: number, payload: Partial<StoreEquipamentoRequest>): AxiosPromise<EquipamentoStoreResponse> => {
    return api.put(`/equipamentos/${id}`, payload);
  },

  excluir: (id: number): AxiosPromise<void> => {
    return api.delete(`/equipamentos/${id}`);
  },
};

export default equipamentoService;

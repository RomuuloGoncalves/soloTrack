import type { AxiosPromise } from 'axios';
import api from './api';
import type { components, operations } from '../types/api';
import type { StoreInsumoRequest } from '../types/types';

export type Insumo = components['schemas']['Insumo'];
export type InsumoFinanceiro = Insumo & { quantidade: number };

export type PaginatedInsumos = {
  current_page: number;
  data: InsumoFinanceiro[];
  first_page_url?: string | null;
  from?: number | null;
  last_page_url?: string | null;
  last_page: number;
  links?: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url?: string | null;
  path?: string | null;
  per_page: number;
  prev_page_url?: string | null;
  to?: number | null;
  total: number;
};

type InsumosIndexResponse = {
  success: boolean;
  message: 'Insumos encontrados';
  data: PaginatedInsumos;
};

type InsumoStoreResponse = operations['insumos.store']['responses'][201]['content']['application/json'] & {
  data: InsumoFinanceiro;
};

type InsumoResumoResponse = {
  success: boolean;
  message: 'Resumo financeiro gerado';
  data: {
    patrimonio_total: number;
    tipos_de_insumos: number;
    economia_estimada: number;
  };
};

const insumoService = {
  listar: (page: number = 1, perPage: number = 10): AxiosPromise<InsumosIndexResponse> => {
    return api.get('/insumos', {
      params: { page, per_page: perPage },
    });
  },

  resumo: (): AxiosPromise<InsumoResumoResponse> => {
    return api.get('/insumos/resumo');
  },

  criar: (payload: StoreInsumoRequest): AxiosPromise<InsumoStoreResponse> => {
    return api.post('/insumos', payload);
  },

  atualizar: (id: number, payload: Partial<StoreInsumoRequest>): AxiosPromise<InsumoStoreResponse> => {
    return api.put(`/insumos/${id}`, payload);
  },

  excluir: (id: number): AxiosPromise<void> => {
    return api.delete(`/insumos/${id}`);
  },
};

export default insumoService;
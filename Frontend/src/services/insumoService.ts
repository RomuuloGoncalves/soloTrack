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

type ResumoFinanceiroResponse = {
  success: boolean;
  message: string;
  data: {
    sucesso: boolean;
    usuario_id: number;
    patrimonio_total: number;
    valor_real_investido: number;
    valor_teorico_ideal: number;
    diferenca_absoluta: number;
    diferenca_percentual: number;
    economia_estimada: number;
    sobrecusto_estimado: number;
    tipos_de_insumos: number;
    areas_com_parametro: number;
    status_comparacao: string;
    resumo: string;
    detalhes_areas: Array<{
      id: number;
      nome_area: string;
      propriedade?: string | null;
      tamanho_area_m2?: number | string | null;
      valor_teorico: number;
      insumos: Array<{
        id: number;
        nome_fertilizante: string;
        quantidade_padrao: number;
        preco_pago: number;
        valor_teorico: number;
      }>;
    }>;
  };
};

type RespostaAnaliseFinanceira = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: string;
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

  resumoFinanceiro: (): AxiosPromise<ResumoFinanceiroResponse> => {
    return api.get('/mcp/financas/resumo');
  },

  analiseFinanceira: (mensagem: string): AxiosPromise<RespostaAnaliseFinanceira> => {
    return api.post('/mcp/financas/analisar', { mensagem });
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
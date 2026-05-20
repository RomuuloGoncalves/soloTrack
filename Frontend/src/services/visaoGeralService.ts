import type { AxiosPromise } from 'axios';
import api from './api';

export type VisaoGeralParams = {
  area_id: string | number;
  equipamento_id: string | number;
  data_inicio: string;
  data_fim: string;
  sensor_id: number;
};

export type DadoComparacao = {
  name: string;
  esperado: number;
  usado: number;
};

export type DadoEvolucao = {
  name: string;
  ideal: number;
  real: number;
};

export type KpisDashboard = {
  economia_reais: number;
  economia_percentual: number;
  score_fertilidade: number;
  score_percentual: number;
};

export type VisaoGeralResponse = {
  dadosComparacao: DadoComparacao[];
  dadosEvolucao: DadoEvolucao[];
  kpis: KpisDashboard;
};

export type FiltroArea = {
  id: number;
  nome_area: string;
};

export type FiltroSensor = {
  id: number;
  grandeza: string;
};

export type VisaoGeralFiltrosResponse = {
  areas: FiltroArea[];
  sensores: FiltroSensor[];
};

export const visaoGeralService = {
  obterDados: (params: VisaoGeralParams): AxiosPromise<VisaoGeralResponse> => {
    return api.get('/visao-geral', { params });
  },

  obterFiltros: (): AxiosPromise<VisaoGeralFiltrosResponse> => {
    return api.get('/visao-geral/filtros');
  },
};
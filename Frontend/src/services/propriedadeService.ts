import api from './api';
import type { AxiosPromise } from 'axios';
import type { Propriedade } from '../types/types';

interface PropriedadeResponse {
  success: boolean;
  message: string;
  data: Propriedade;
}

interface PropriedadesResponse {
  success: boolean;
  message: string;
  data: Propriedade[];
}

const propriedadeService = {
  listar: (): AxiosPromise<PropriedadesResponse> => {
    return api.get('/propriedades');
  },

  criar: (dados: Propriedade): AxiosPromise<PropriedadeResponse> => {
    return api.post('/propriedades', dados);
  },

  atualizar: (id: number, dados: Propriedade): AxiosPromise<PropriedadeResponse> => {
    return api.put(`/propriedades/${id}`, dados);
  },

  deletar: (id: number): AxiosPromise<PropriedadeResponse> => {
    return api.delete(`/propriedades/${id}`);
  },
};

export default propriedadeService;

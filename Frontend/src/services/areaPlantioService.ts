import api from './api';
import type { AxiosPromise } from 'axios';
import type { AreaPlantio, StoreAreaPlantioRequest, UpdateAreaPlantioRequest } from '../types/types';

interface AreaPlantioResponse {
  success: boolean;
  message: string;
  data: AreaPlantio;
}

interface AreasPlantioResponse {
  success: boolean;
  message: string;
  data: AreaPlantio[];
}

const areaPlantioService = {
  listar: (propriedadeId?: number): AxiosPromise<AreasPlantioResponse> => {
    const params = propriedadeId ? `?propriedade_id=${propriedadeId}` : '';
    return api.get(`/areas-plantio${params}`);
  },

  criar: (dados: StoreAreaPlantioRequest): AxiosPromise<AreaPlantioResponse> => {
    return api.post('/areas-plantio', dados);
  },

  atualizar: (id: number, dados: UpdateAreaPlantioRequest): AxiosPromise<AreaPlantioResponse> => {
    return api.put(`/areas-plantio/${id}`, dados);
  },

  deletar: (id: number): AxiosPromise<AreaPlantioResponse> => {
    return api.delete(`/areas-plantio/${id}`);
  },
};

export default areaPlantioService;

import type { components, operations } from './api';

// npx openapi-typescript http://localhost:8000/docs/api.json -o src/types/api.d.ts

export type Usuario              = components['schemas']['Usuario'];
export type StoreUsuarioRequest  = components['schemas']['StoreUsuarioRequest'];

export type Propriedade              = components['schemas']['Propriedade'];
export type StorePropriedadeRequest  = components['schemas']['StorePropriedadeRequest'];
export type UpdatePropriedadeRequest = components['schemas']['UpdatePropriedadeRequest'];

export type AreaPlantio              = components['schemas']['AreaPlantio'];
export type StoreAreaPlantioRequest  = components['schemas']['StoreAreaPlantioRequest'];
export type UpdateAreaPlantioRequest = components['schemas']['UpdateAreaPlantioRequest'];

export type Equipamento = components['schemas']['Equipamento'];
export type Cultura      = components['schemas']['Cultura'];
export type Insumo       = components['schemas']['Insumo'];

export type LoginPayload    = operations['auth.login']['requestBody']['content']['application/json'];
export type LoginResponse   = operations['auth.login']['responses']['200']['content']['application/json'];
export type CadastroResponse = operations['usuario.store']['responses']['201']['content']['application/json'];
export type LogoutResponse  = operations['auth.logout']['responses']['200']['content']['application/json'];
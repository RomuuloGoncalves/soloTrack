import type { components, operations } from './api';

// npx openapi-typescript http://localhost:8000/docs/api.json -o src/types/api.d.ts

export type Usuario              = components['schemas']['Usuario'];
export type StoreUsuarioRequest  = components['schemas']['StoreUsuarioRequest'];

export type LoginPayload         = operations['auth.login']['requestBody']['content']['application/json'];
export type LoginResponse        = operations['auth.login']['responses']['200']['content']['application/json'];
export type CadastroResponse     = operations['usuarios.store']['responses']['201']['content']['application/json'];
export type LogoutResponse       = operations['auth.logout']['responses']['200']['content']['application/json'];
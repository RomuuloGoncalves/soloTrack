import type { components } from './api';

// npx openapi-typescript http://localhost:8000/docs/api.json -o src/types/api.d.ts

// extrair as interfaces
export type Usuario = components['schemas']['Usuario'];
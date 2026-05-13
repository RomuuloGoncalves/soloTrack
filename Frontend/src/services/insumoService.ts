// services/insumoService.ts
import type { Insumo } from '../types/types';

// Tipagens para o Payload e Respostas
export interface InsumoPayload {
  nome: string;
  quantidade: number;
  unidade: string;
  preco_unitario: number;
}

export interface PaginatedInsumos {
  current_page: number;
  data: Insumo[];
  last_page: number;
  per_page: number;
  total: number;
  // Outros campos de paginação do Laravel podem ser adicionados aqui se necessário
}

export interface ResumoFinanceiro {
  patrimonio_total: number;
  tipos_de_insumos: number;
  economia_estimada: number;
}

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("auth_token"); // Ajuste conforme seu auth (Sanctum / Passport)
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Simulando o formato de erro do Axios para o seu Financas.tsx não quebrar 
    // ao procurar por "error.response?.data?.errors"
    const errorMessage = body?.message || (body?.errors ? Object.values(body.errors).flat().join(" ") : "Erro inesperado.");
    const error: any = new Error(errorMessage);
    error.response = {
      status: res.status,
      data: body
    };
    throw error;
  }

  return body as T;
}

// ─── Insumos ───────────────────────────────────────────────

export function listarInsumos(page: number = 1, perPage: number = 10): Promise<PaginatedInsumos> {
  return request<PaginatedInsumos>(`/api/insumos?page=${page}&per_page=${perPage}`);
}

export function buscarResumo(): Promise<ResumoFinanceiro> {
  return request<ResumoFinanceiro>("/api/insumos/resumo");
}

export function criarInsumo(data: InsumoPayload): Promise<Insumo> {
  return request<Insumo>("/api/insumos", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function atualizarInsumo(id: number, data: Partial<InsumoPayload>): Promise<Insumo> {
  return request<Insumo>(`/api/insumos/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function excluirInsumo(id: number): Promise<void> {
  return request<void>(`/api/insumos/${id}`, { method: "DELETE" });
}

// ─── Export para o Componente (Compatibilidade) ──────────────────────────────
// Esse export default simula o encapsulamento ".data" do Axios, 
// garantindo que os "res.data" que já estão no seu Financas.tsx funcionem perfeitamente.

const insumoService = {
  listar: async (page: number = 1, perPage: number = 10) => {
    const data = await listarInsumos(page, perPage);
    return { data };
  },
  resumo: async () => {
    const data = await buscarResumo();
    return { data };
  },
  criar: async (payload: InsumoPayload) => {
    const data = await criarInsumo(payload);
    return { data };
  },
  atualizar: async (id: number, payload: Partial<InsumoPayload>) => {
    const data = await atualizarInsumo(id, payload);
    return { data };
  },
  excluir: async (id: number) => {
    await excluirInsumo(id);
    return true;
  }
};

export default insumoService;
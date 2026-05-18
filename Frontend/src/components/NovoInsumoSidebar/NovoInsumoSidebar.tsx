import { useState, useEffect } from 'react';
import styles from './NovoInsumoSidebar.module.css';
import insumoService from '../../services/insumoService';
import type { InsumoFinanceiro } from '../../services/insumoService';
import type { StoreInsumoRequest } from '../../types/types';
import { useToast } from '../../contexts/ToastContext';

interface NovoInsumoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  insumoParaEditar?: InsumoFinanceiro | null;
}

type Erros = Record<string, string>;

export function NovoInsumoSidebar({
  isOpen,
  onClose,
  onSuccess,
  insumoParaEditar,
}: NovoInsumoSidebarProps) {
  const { showToast } = useToast();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Erros>({});

  // --- Form fields ---
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState('');

  // --- Reset/Populate form ---
  useEffect(() => {
    if (isOpen) {
      if (insumoParaEditar) {
        setNome(insumoParaEditar.nome_fertilizante || '');
        setQuantidade(String(insumoParaEditar.quantidade ?? ''));
        setUnidade(insumoParaEditar.unidade_medida || '');
        setPrecoUnitario(String(insumoParaEditar.preco_pago ?? ''));
      } else {
        setNome('');
        setQuantidade('');
        setUnidade('');
        setPrecoUnitario('');
      }
      setErros({});
    }
  }, [isOpen, insumoParaEditar]);

  if (!isOpen) return null;

  function extrairErros(error: any): Erros {
    const apiErrors = error.response?.data?.errors;
    if (!apiErrors) return {};
    const mapeado: Erros = {};
    for (const campo in apiErrors) {
      mapeado[campo] = Array.isArray(apiErrors[campo])
        ? apiErrors[campo][0]
        : apiErrors[campo];
    }
    return mapeado;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErros({});
    setSalvando(true);

    try {
      const payload: StoreInsumoRequest = {
        nome_fertilizante: nome,
        quantidade: parseFloat(quantidade) || 0,
        unidade_medida: unidade,
        preco_pago: parseFloat(precoUnitario) || 0,
      };

      if (insumoParaEditar) {
        await insumoService.atualizar(insumoParaEditar.id, payload);
        showToast('Insumo atualizado com sucesso!', 'success');
      } else {
        await insumoService.criar(payload);
        showToast('Insumo adicionado com sucesso!', 'success');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErros(extrairErros(error));
        showToast('Corrija os erros no formulário.', 'error');
      } else {
        showToast(error.response?.data?.message || 'Erro ao salvar insumo.', 'error');
      }
    } finally {
      setSalvando(false);
    }
  }

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const valorTotalEstimado =
    quantidade && precoUnitario && !isNaN(+quantidade) && !isNaN(+precoUnitario)
      ? +quantidade * +precoUnitario
      : null;

  return (
    <div className={styles.sidebarOverlay} onClick={onClose}>
      <div className={styles.sidebarContainer} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.sidebarHeader}>
          <div className={styles.headerText}>
            <h2 className={styles.sidebarTitle}>
              {insumoParaEditar ? 'Editar Insumo' : 'Novo Insumo'}
            </h2>
            <p className={styles.sidebarSubtitle}>
              {insumoParaEditar
                ? 'Atualize os dados e valores do insumo estoque.'
                : 'Cadastre um novo fertilizante ou insumo em seu galpão.'}
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className={styles.sidebarBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="nome">Nome do Insumo</label>
              <input
                id="nome"
                type="text"
                className={`${styles.formInput} ${erros.nome_fertilizante ? styles.inputError : ''}`}
                placeholder="Ex: Ureia, NPK 10-10-10, Calcário..."
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setErros((prev) => ({ ...prev, nome_fertilizante: '' }));
                }}
              />
              {erros.nome_fertilizante && (
                <span className={styles.fieldError}>{erros.nome_fertilizante}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="preco">Valor Unitário</label>
              <div className={`${styles.inputPrefix} ${erros.preco_pago ? styles.inputPrefixError : ''}`}>
                <span>R$</span>
                <input
                  id="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={precoUnitario}
                  onChange={(e) => {
                    setPrecoUnitario(e.target.value);
                    setErros((prev) => ({ ...prev, preco_pago: '' }));
                  }}
                />
              </div>
              {erros.preco_pago && (
                <span className={styles.fieldError}>{erros.preco_pago}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="unidade">Unidade de Medida</label>
              <input
                id="unidade"
                type="text"
                className={`${styles.formInput} ${erros.unidade_medida ? styles.inputError : ''}`}
                placeholder="Ex: Sacos, Kg, Litros..."
                value={unidade}
                onChange={(e) => {
                  setUnidade(e.target.value);
                  setErros((prev) => ({ ...prev, unidade_medida: '' }));
                }}
              />
              {erros.unidade_medida && (
                <span className={styles.fieldError}>{erros.unidade_medida}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="quantidade">Quantidade</label>
              <input
                id="quantidade"
                type="number"
                min="0"
                step="any"
                className={`${styles.formInput} ${erros.quantidade ? styles.inputError : ''}`}
                placeholder="Ex: 50"
                value={quantidade}
                onChange={(e) => {
                  setQuantidade(e.target.value);
                  setErros((prev) => ({ ...prev, quantidade: '' }));
                }}
              />
              {erros.quantidade && (
                <span className={styles.fieldError}>{erros.quantidade}</span>
              )}
            </div>

            {valorTotalEstimado !== null && valorTotalEstimado > 0 && (
              <div className={styles.totalEstimado}>
                Valor total estimado:{' '}
                <strong>{fmt(valorTotalEstimado)}</strong>
              </div>
            )}
          </div>

          <div className={styles.sidebarFooter}>
            <button type="submit" className={styles.btnPrimary} disabled={salvando}>
              {salvando ? 'Salvando...' : insumoParaEditar ? 'Atualizar Insumo' : 'Adicionar Insumo'}
            </button>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

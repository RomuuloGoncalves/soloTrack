import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar.tsx';
import { Pencil, Trash2, X } from 'lucide-react';
import styles from './Financas.module.css';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../contexts/ToastContext';
import lightLogo from '../../assets/images/Light-logo.svg';
import darkLogo from '../../assets/images/Dark-Logo.svg';
import insumoService from '../../services/insumoService.ts';
import type { Insumo } from '../../types/types';

type Erros = Record<string, string>;

function primeiroErro(erros: Erros, campo: string): string | undefined {
  return erros[campo] || undefined;
}

export function Financas() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const logo = useMemo(() => (theme === 'dark' ? darkLogo : lightLogo), [theme]);

  // --- Insumos state ---
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loadingInsumos, setLoadingInsumos] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;

  // --- Resumo financeiro ---
  const [patrimonio, setPatrimonio] = useState(0);
  const [tiposCount, setTiposCount] = useState(0);
  const [economiaPercent, setEconomiaPercent] = useState(0);

  // --- Modal state ---
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoInsumo, setEditandoInsumo] = useState<Insumo | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Erros>({});

  // --- Form fields ---
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState('');

  useEffect(() => {
    carregarInsumos(currentPage);
    carregarResumo();
  }, [currentPage]);

  async function carregarInsumos(page: number) {
    setLoadingInsumos(true);
    try {
      const res = await insumoService.listar(page, perPage);
      setInsumos(res.data.data);
      setCurrentPage(res.data.current_page);
      setTotalPages(res.data.last_page);
      setTotal(res.data.total);
    } catch {
      showToast('Erro ao carregar insumos.', 'error');
    } finally {
      setLoadingInsumos(false);
    }
  }

  async function carregarResumo() {
    try {
      const res = await insumoService.resumo();
      setPatrimonio(res.data.patrimonio_total);
      setTiposCount(res.data.tipos_de_insumos);
      setEconomiaPercent(res.data.economia_estimada);
    } catch {
      // silencioso — cards mostram zero se falhar
    }
  }

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

  function abrirModalNovo() {
    setEditandoInsumo(null);
    setNome('');
    setQuantidade('');
    setUnidade('');
    setPrecoUnitario('');
    setErros({});
    setModalAberto(true);
  }

  function abrirModalEdicao(insumo: Insumo) {
    setEditandoInsumo(insumo);
    setNome(insumo.nome_fertilizante);
    setUnidade(insumo.unidade_medida);
    setPrecoUnitario(String(insumo.preco_pago));
    setErros({});
    setModalAberto(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErros({});
    setSalvando(true);
    try {
      const payload = {
        nome_fertilizante: nome,
        quantidade: parseFloat(quantidade),
        unidade_medida: unidade,
        preco_unitario: parseFloat(precoUnitario),
      }as any;

      if (editandoInsumo) {
        const res = await insumoService.atualizar(editandoInsumo.id, payload);
        setInsumos(prev => prev.map(i => (i.id === editandoInsumo.id ? res.data : i)));
        showToast('Insumo atualizado com sucesso!', 'success');
      } else {
        const res = await insumoService.criar(payload);
        setInsumos(prev => [...prev, res.data]);
        showToast('Insumo criado com sucesso!', 'success');
      }

      setModalAberto(false);
      carregarResumo();
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

  async function handleExcluir(id: number) {
    if (!confirm('Deseja excluir este insumo?')) return;
    try {
      await insumoService.excluir(id);
      setInsumos(prev => prev.filter(i => i.id !== id));
      showToast('Insumo excluído com sucesso!', 'success');
      carregarResumo();
    } catch {
      showToast('Erro ao excluir insumo.', 'error');
    }
  }

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const valorTotalEstimado =
    quantidade && precoUnitario && !isNaN(+quantidade) && !isNaN(+precoUnitario)
      ? +quantidade * +precoUnitario
      : null;

  const inicioItem = (currentPage - 1) * perPage + 1;
  const fimItem = Math.min(currentPage * perPage, total);

  return (
    <div className={styles.pageLayout}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
        logo={logo}
      />

      <main className={styles.mainContent} style={{ marginLeft: '260px' }}>
        <header className={styles.header}>
          <div>
            <h1>Finanças</h1>
            <p>Gestão de insumos e controle financeiro do seu galpão</p>
          </div>
          <button className={styles.addBtn} onClick={abrirModalNovo}>
            <span>+</span> Adicionar Insumo
          </button>
        </header>

        {/* Cards de métricas */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} data-color="green">$</div>
            <div>
              <span className={styles.metricLabel}>Patrimônio em insumos</span>
              <strong className={styles.metricValue}>{fmt(patrimonio)}</strong>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} data-color="blue">◈</div>
            <div>
              <span className={styles.metricLabel}>Tipos de insumos</span>
              <strong className={styles.metricValue}>{tiposCount}</strong>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} data-color="amber">↑</div>
            <div>
              <span className={styles.metricLabel}>Economia Estimada</span>
              <strong className={styles.metricValue}>{economiaPercent}%</strong>
              <span className={styles.metricSub}>no mês atual</span>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <section className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h2>Inventário do Galpão</h2>
            <p>Gerencie fertilizantes e outros insumos estocados.</p>
          </div>

          {loadingInsumos ? (
            <div className={styles.loadingState}>Carregando...</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nome do Insumo</th>
                    <th>Quantidade</th>
                    <th>Unidade</th>
                    <th>Preço pago(Un.)</th>
                    <th>Valor Total</th>
                    <th className={styles.thCenter}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {insumos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyRow}>
                        Nenhum insumo cadastrado.
                      </td>
                    </tr>
                  ) : (
                    insumos.map(insumo => (
                      <tr key={insumo.id}>
                        <td className={styles.tdNome}>{insumo.nome_fertilizante}</td>
                        <td>{(insumo as any).quantidade}</td>
                        <td>{insumo.unidade_medida}</td>
                        <td>{insumo.preco_pago ? fmt(parseFloat(insumo.preco_pago)) : '-'}</td>
                        <td>{fmt(((insumo as any).valor_total) ?? 0)}</td>
                        <td className={styles.tdActions}>
                          <button
                            className={styles.actionBtn}
                            data-variant="edit"
                            onClick={() => abrirModalEdicao(insumo)}
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className={styles.actionBtn}
                            data-variant="delete"
                            onClick={() => handleExcluir(insumo.id)}
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              {total > 0
                ? `Mostrando ${inicioItem} a ${fimItem} de ${total}`
                : 'Nenhum registro'}
            </span>
            <div className={styles.paginationControls}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={currentPage === 1}
              >
                &#8249;
              </button>
              {Array.from({ length: totalPages || 1 }, (_, i) => (
                <button
                  key={i}
                  className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.pageBtnActive : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= totalPages}
              >
                &#8250;
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Modal slide-in direita */}
      {modalAberto && (
        <div className={styles.modalOverlay} onClick={() => setModalAberto(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>{editandoInsumo ? 'Editar Insumo' : 'Novo Insumo'}</h2>
                <p>{editandoInsumo ? 'Atualize os dados do insumo' : 'Adicione um novo insumo'}</p>
              </div>
              <button
                className={styles.modalClose}
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <form className={styles.modalBody} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Nome do insumo</label>
                <input
                  type="text"
                  placeholder="Digite um nome..."
                  value={nome}
                  onChange={e => { setNome(e.target.value); setErros(p => ({ ...p, nome: '' })); }}
                  className={primeiroErro(erros, 'nome') ? styles.inputError : ''}
                />
                {primeiroErro(erros, 'nome') && (
                  <span className={styles.fieldError}>{primeiroErro(erros, 'nome')}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Valor unitário</label>
                <div className={`${styles.inputPrefix} ${primeiroErro(erros, 'preco_unitario') ? styles.inputPrefixError : ''}`}>
                  <span>R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={precoUnitario}
                    onChange={e => { setPrecoUnitario(e.target.value); setErros(p => ({ ...p, preco_unitario: '' })); }}
                  />
                </div>
                {primeiroErro(erros, 'preco_unitario') && (
                  <span className={styles.fieldError}>{primeiroErro(erros, 'preco_unitario')}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Unidade de Medida</label>
                <input
                  type="text"
                  placeholder="Digite a unidade de medida..."
                  value={unidade}
                  onChange={e => { setUnidade(e.target.value); setErros(p => ({ ...p, unidade: '' })); }}
                  className={primeiroErro(erros, 'unidade') ? styles.inputError : ''}
                />
                {primeiroErro(erros, 'unidade') && (
                  <span className={styles.fieldError}>{primeiroErro(erros, 'unidade')}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Quantidade</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={quantidade}
                  onChange={e => { setQuantidade(e.target.value); setErros(p => ({ ...p, quantidade: '' })); }}
                  className={primeiroErro(erros, 'quantidade') ? styles.inputError : ''}
                />
                {primeiroErro(erros, 'quantidade') && (
                  <span className={styles.fieldError}>{primeiroErro(erros, 'quantidade')}</span>
                )}
              </div>

              {valorTotalEstimado !== null && (
                <div className={styles.totalEstimado}>
                  Valor total estimado:{' '}
                  <strong>{fmt(valorTotalEstimado)}</strong>
                </div>
              )}

              <div className={styles.modalFooter}>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={salvando}
                >
                  {salvando
                    ? 'Salvando...'
                    : editandoInsumo
                      ? 'Atualizar insumo'
                      : 'Criar insumo'}
                </button>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financas;
import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar.tsx';
import { Pencil, Trash2 } from 'lucide-react';
import styles from './Financas.module.css';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../contexts/ToastContext';
import lightLogo from '../../assets/images/Light-logo.svg';
import darkLogo from '../../assets/images/Dark-Logo.svg';
import insumoService from '../../services/insumoService.ts';
import type { InsumoFinanceiro } from '../../services/insumoService';
import { NovoInsumoSidebar } from '../../components/NovoInsumoSidebar/NovoInsumoSidebar';

export function Financas() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const logo = useMemo(() => (theme === 'dark' ? darkLogo : lightLogo), [theme]);

  // --- Insumos state ---
  const [insumos, setInsumos] = useState<InsumoFinanceiro[]>([]);
  const [loadingInsumos, setLoadingInsumos] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 10;

  // --- Resumo financeiro ---
  const [patrimonio, setPatrimonio] = useState(0);
  const [tiposCount, setTiposCount] = useState(0);
  const [economiaPercent, setEconomiaPercent] = useState(0);

  // --- Sidebar state ---
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoInsumo, setEditandoInsumo] = useState<InsumoFinanceiro | null>(null);

  useEffect(() => {
    carregarInsumos(currentPage);
    carregarResumo();
  }, [currentPage]);

  async function carregarInsumos(page: number) {
    setLoadingInsumos(true);
    try {
      const res = await insumoService.listar(page, perPage);
      setInsumos(res.data.data.data ?? []);
      setCurrentPage(res.data.data.current_page ?? 1);
      setTotalPages(res.data.data.last_page ?? 1);
      setTotal(res.data.data.total ?? 0);
    } catch {
      showToast('Erro ao carregar insumos.', 'error');
    } finally {
      setLoadingInsumos(false);
    }
  }

  async function carregarResumo() {
    try {
      const res = await insumoService.resumo();
      setPatrimonio(res.data.data.patrimonio_total ?? 0);
      setTiposCount(res.data.data.tipos_de_insumos ?? 0);
      setEconomiaPercent(res.data.data.economia_estimada ?? 0);
    } catch {
      // silencioso — cards mostram zero se falhar
    }
  }

  function abrirModalNovo() {
    setEditandoInsumo(null);
    setModalAberto(true);
  }

  function abrirModalEdicao(insumo: InsumoFinanceiro) {
    setEditandoInsumo(insumo);
    setModalAberto(true);
  }

  async function handleExcluir(id: number) {
    if (!confirm('Deseja excluir este insumo?')) return;
    try {
      await insumoService.excluir(id);
      setInsumos(prev => prev.filter(i => i.id !== id));
      showToast('Insumo excluído com sucesso!', 'success');
      carregarInsumos(currentPage);
      carregarResumo();
    } catch {
      showToast('Erro ao excluir insumo.', 'error');
    }
  }

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

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
                        <td>{insumo.quantidade}</td>
                        <td>{insumo.unidade_medida}</td>
                        <td>{insumo.preco_pago ? fmt(parseFloat(String(insumo.preco_pago))) : '-'}</td>
                        <td>{fmt(Number(insumo.valor_total ?? 0))}</td>
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

      <NovoInsumoSidebar
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={() => {
          carregarInsumos(currentPage);
          carregarResumo();
        }}
        insumoParaEditar={editandoInsumo}
      />
    </div>
  );
}

export default Financas;
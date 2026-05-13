import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar.tsx';
import { Pencil, Trash2, X } from 'lucide-react';
import styles from './Financas.module.css';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../contexts/ToastContext';
import lightLogo from '../../assets/images/Light-logo.svg';
import darkLogo from '../../assets/images/Dark-Logo.svg';
import insumoService from '../../services/insumoService.ts';
import type { InsumoFinanceiro } from '../../services/insumoService';
import type { StoreInsumoRequest } from '../../types/types';

type Erros = Record<string, string>;

function primeiroErro(erros: Erros, campo: string): string | undefined {
  return erros[campo] || undefined;
}

function extrairTextoAnalise(resposta: any): string {
  const candidates = resposta?.candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return '';

  const parts = candidates[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';

  return parts
    .map((part: { text?: string }) => part.text ?? '')
    .filter(Boolean)
    .join('\n')
    .trim();
}

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
  const [valorRealInvestido, setValorRealInvestido] = useState(0);
  const [valorTeoricoIdeal, setValorTeoricoIdeal] = useState(0);
  const [diferencaAbsoluta, setDiferencaAbsoluta] = useState(0);
  const [diferencaPercentual, setDiferencaPercentual] = useState(0);
  const [tiposCount, setTiposCount] = useState(0);
  const [areasComparadas, setAreasComparadas] = useState(0);
  const [resumoFinanceiro, setResumoFinanceiro] = useState('');
  const [promptAnalise, setPromptAnalise] = useState('');
  const [analiseIA, setAnaliseIA] = useState('');
  const [carregandoAnalise, setCarregandoAnalise] = useState(false);

  // --- Modal state ---
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoInsumo, setEditandoInsumo] = useState<InsumoFinanceiro | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Erros>({});

  // --- Form fields ---
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [unidade, setUnidade] = useState('');
  const [precoUnitario, setPrecoUnitario] = useState('');

  useEffect(() => {
    carregarInsumos(currentPage);
  }, [currentPage]);

  useEffect(() => {
    carregarResumoFinanceiro();
  }, []);

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

  async function carregarResumoFinanceiro() {
    try {
      const res = await insumoService.resumoFinanceiro();
      setValorRealInvestido(res.data.data.valor_real_investido ?? 0);
      setValorTeoricoIdeal(res.data.data.valor_teorico_ideal ?? 0);
      setDiferencaAbsoluta(res.data.data.diferenca_absoluta ?? 0);
      setDiferencaPercentual(res.data.data.diferenca_percentual ?? 0);
      setTiposCount(res.data.data.tipos_de_insumos ?? 0);
      setAreasComparadas(res.data.data.areas_com_parametro ?? 0);
      setResumoFinanceiro(res.data.data.resumo ?? '');
    } catch {
      // silencioso — cards mostram zero se falhar
    }
  }

  async function solicitarAnaliseIA() {
    setCarregandoAnalise(true);
    setAnaliseIA('');

    try {
      const pergunta = promptAnalise.trim() || 'Explique a comparacao financeira, destaque o valor real investido, o valor teorico ideal e recomende a proxima acao.';
      const res = await insumoService.analiseFinanceira(pergunta);

      if (res.data.error) {
        throw new Error(res.data.error);
      }

      const texto = extrairTextoAnalise(res.data);
      setAnaliseIA(texto || 'A IA nao retornou um texto de analise.');
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Erro ao analisar as finanças.';
      showToast(message, 'error');
      setAnaliseIA(`Erro ao analisar as finanças: ${message}`);
    } finally {
      setCarregandoAnalise(false);
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

  function abrirModalEdicao(insumo: InsumoFinanceiro) {
    setEditandoInsumo(insumo);
    setNome(insumo.nome_fertilizante);
    setQuantidade(String(insumo.quantidade ?? ''));
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
      const payload: StoreInsumoRequest = {
        nome_fertilizante: nome,
        quantidade: parseFloat(quantidade),
        unidade_medida: unidade,
        preco_pago: parseFloat(precoUnitario),
      };

      if (editandoInsumo) {
        const res = await insumoService.atualizar(editandoInsumo.id, payload);
        setInsumos(prev => prev.map(i => (i.id === editandoInsumo.id ? res.data.data : i)));
        showToast('Insumo atualizado com sucesso!', 'success');
      } else {
        const res = await insumoService.criar(payload);
        setInsumos(prev => [res.data.data, ...prev]);
        showToast('Insumo criado com sucesso!', 'success');
      }

      setModalAberto(false);
      carregarInsumos(currentPage);
      carregarResumoFinanceiro();
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
      carregarInsumos(currentPage);
      carregarResumoFinanceiro();
    } catch {
      showToast('Erro ao excluir insumo.', 'error');
    }
  }

  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const diferencaVisivel = diferencaAbsoluta >= 0 ? diferencaAbsoluta : Math.abs(diferencaAbsoluta);
  const tituloComparacao =
    diferencaAbsoluta > 0 ? 'Acima do ideal' : diferencaAbsoluta < 0 ? 'Economia estimada' : 'Em equilíbrio';
  const subtituloComparacao =
    diferencaAbsoluta > 0
      ? 'valor gasto acima do padrão'
      : diferencaAbsoluta < 0
        ? 'valor abaixo do padrão'
        : 'sem desvio em relação ao padrão';
  const iconeComparacao = diferencaAbsoluta > 0 ? '↑' : diferencaAbsoluta < 0 ? '↓' : '≋';
  const corComparacao = diferencaAbsoluta > 0 ? 'amber' : 'green';

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
              <span className={styles.metricLabel}>Valor real investido</span>
              <strong className={styles.metricValue}>{fmt(valorRealInvestido)}</strong>
              <span className={styles.metricSub}>{tiposCount} tipos cadastrados</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} data-color="blue">◈</div>
            <div>
              <span className={styles.metricLabel}>Valor teórico ideal</span>
              <strong className={styles.metricValue}>{fmt(valorTeoricoIdeal)}</strong>
              <span className={styles.metricSub}>{areasComparadas} áreas com padrão</span>
            </div>
          </div>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon} data-color={corComparacao}>{iconeComparacao}</div>
            <div>
              <span className={styles.metricLabel}>{tituloComparacao}</span>
              <strong className={styles.metricValue}>{fmt(diferencaVisivel)}</strong>
              <span className={styles.metricSub}>{Math.abs(diferencaPercentual).toFixed(1)}% {subtituloComparacao}</span>
            </div>
          </div>
        </div>

        <section className={styles.aiCard}>
          <div className={styles.aiHeader}>
            <div>
              <h2>Comparação assistida por IA</h2>
              <p>
                A base teórica vem dos vínculos entre áreas e insumos. A IA interpreta esse quadro e devolve uma leitura
                prática para decisão.
              </p>
            </div>
            <button className={styles.aiBtn} onClick={solicitarAnaliseIA} disabled={carregandoAnalise}>
              {carregandoAnalise ? 'Analisando...' : 'Gerar análise'}
            </button>
          </div>

          {resumoFinanceiro && <div className={styles.aiHint}>{resumoFinanceiro}</div>}

          <div className={styles.aiSummaryGrid}>
            <div className={styles.aiSummaryItem}>
              <span>Real investido</span>
              <strong>{fmt(valorRealInvestido)}</strong>
            </div>
            <div className={styles.aiSummaryItem}>
              <span>Ideal teórico</span>
              <strong>{fmt(valorTeoricoIdeal)}</strong>
            </div>
            <div className={styles.aiSummaryItem}>
              <span>Diferença</span>
              <strong>{fmt(diferencaVisivel)}</strong>
            </div>
          </div>

          <div className={styles.aiPromptGroup}>
            <label>Pedido para a IA</label>
            <textarea
              className={styles.aiTextarea}
              value={promptAnalise}
              onChange={e => setPromptAnalise(e.target.value)}
              placeholder="Ex: diga onde estou acima do ideal e qual insumo revisar primeiro."
            />
          </div>

          <div className={styles.aiResponse} aria-live="polite">
            {analiseIA || 'A análise da IA aparece aqui depois que você gerar o resumo.'}
          </div>
        </section>

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
                  className={primeiroErro(erros, 'nome_fertilizante') ? styles.inputError : ''}
                />
                {primeiroErro(erros, 'nome_fertilizante') && (
                  <span className={styles.fieldError}>{primeiroErro(erros, 'nome_fertilizante')}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Valor unitário</label>
                <div className={`${styles.inputPrefix} ${primeiroErro(erros, 'preco_pago') ? styles.inputPrefixError : ''}`}>
                  <span>R$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={precoUnitario}
                    onChange={e => { setPrecoUnitario(e.target.value); setErros(p => ({ ...p, preco_pago: '' })); }}
                  />
                </div>
                {primeiroErro(erros, 'preco_pago') && (
                  <span className={styles.fieldError}>{primeiroErro(erros, 'preco_pago')}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label>Unidade de Medida</label>
                <input
                  type="text"
                  placeholder="Digite a unidade de medida..."
                  value={unidade}
                  onChange={e => { setUnidade(e.target.value); setErros(p => ({ ...p, unidade_medida: '' })); }}
                  className={primeiroErro(erros, 'unidade_medida') ? styles.inputError : ''}
                />
                {primeiroErro(erros, 'unidade_medida') && (
                  <span className={styles.fieldError}>{primeiroErro(erros, 'unidade_medida')}</span>
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
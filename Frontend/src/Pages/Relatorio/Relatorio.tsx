import { useState, useMemo, useEffect } from 'react';
import lightLogo from '../../assets/images/Light-logo.svg';
import darkLogo from '../../assets/images/Dark-Logo.svg';
import {
  Download, FileText, Search, Calendar,
  Warehouse, Sprout, Thermometer, Droplets,
  Droplet, Filter, Pipette, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import styles from './Relatorio.module.css';
import { useTheme } from '../../hooks/useTheme';
import api from '../../services/api';

export function Relatorio() {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const logo = useMemo(() => theme === 'dark' ? darkLogo : lightLogo, [theme]);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos filtros
  const [filtroEstufa, setFiltroEstufa] = useState('Todas as estufas');
  const [filtroCultura, setFiltroCultura] = useState('Todas as culturas');
  const [filtroData, setFiltroData] = useState('');
  const [filtroBusca, setFiltroBusca] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    async function loadRelatorios() {
      try {
        const response = await api.get('/leituras');
        setData(response.data);
      } catch (error) {
        console.error('Erro ao carregar leituras:', error);
      } finally {
        setLoading(false);
      }
    }
    loadRelatorios();
  }, []);

  const estufasUnicas = useMemo(() => {
    const unicas = new Set(data.map(item => item.origin));
    return ['Todas as estufas', ...Array.from(unicas)];
  }, [data]);

  const culturasUnicas = useMemo(() => {
    const unicas = new Set(data.map(item => item.cultura).filter(c => c && c !== 'Sem cultura'));
    return ['Todas as culturas', ...Array.from(unicas)];
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchEstufa = filtroEstufa === 'Todas as estufas' || item.origin === filtroEstufa;
      const matchCultura = filtroCultura === 'Todas as culturas' || item.cultura === filtroCultura;
      const matchData = filtroData === '' || item.date.includes(filtroData);
      const matchBusca = filtroBusca === '' || item.id.toLowerCase().includes(filtroBusca.toLowerCase());
      
      return matchEstufa && matchCultura && matchData && matchBusca;
    });
  }, [data, filtroEstufa, filtroCultura, filtroData, filtroBusca]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroEstufa, filtroCultura, filtroData, filtroBusca]);

  const totalItems = filteredData.length;
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  return (
    <div className={styles.pageLayout}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpen={() => setIsSidebarOpen(true)}
        logo={logo} 
      />
      <main className={styles.mainContent}>

        <header className={styles.header}>
          <div className={styles.titleArea}>
            <h1>Relatório</h1>
            <p>Consulte o histórico bruto de todas as leituras e exporte laudos.</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.exportCsv}>
              <Download size={18} /> Exportar CSV/ Excel
            </button>
            <button className={styles.exportPdf}>
              <FileText size={18} /> Exportar Laudo em PDF
            </button>
          </div>
        </header>

        <section className={styles.contentCard}>
          <div className={styles.filtersHeader}>
            <Filter size={20} />
            <span>Filtros Avançados</span>
          </div>

          <div className={styles.filtersGrid}>
            <div className={styles.filterGroup}>
              <label><Warehouse size={16} /> ESTUFA</label>
              <select value={filtroEstufa} onChange={(e) => setFiltroEstufa(e.target.value)}>
                {estufasUnicas.map((estufa: any, idx) => (
                  <option key={idx} value={estufa}>{estufa}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label><Sprout size={16} /> CULTURA</label>
              <select value={filtroCultura} onChange={(e) => setFiltroCultura(e.target.value)}>
                {culturasUnicas.map((cultura: any, idx) => (
                  <option key={idx} value={cultura}>{cultura}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label><Calendar size={16} /> DATA</label>
              <input 
                type="text" 
                placeholder="dd/mm/aaaa" 
                value={filtroData}
                onChange={(e) => setFiltroData(e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label><Search size={16} /> BUSCA RÁPIDA</label>
              <input 
                type="text" 
                placeholder="Pesquise por ID" 
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.alignLeft}>ID LEITURA</th>
                  <th className={styles.alignLeft}>DATA E HORA</th>
                  <th className={styles.centerTh}><Thermometer size={14} /> TEMP.</th>
                  <th className={styles.centerTh}><Droplets size={14} /> UMID. AR</th>
                  <th className={styles.centerTh}><Droplet size={14} /> UMID. SOLO</th>
                  <th className={styles.centerTh}><Pipette size={14} /> PH</th>
                  <th className={styles.centerTh}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className={styles.centerTd}>Carregando relatórios...</td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.centerTd}>Nenhum relatório encontrado.</td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <tr key={index}>
                      <td className={styles.idCol}>{row.id}</td>
                      <td>
                        <span className={styles.mainText}>{row.date}</span>
                        <span className={styles.subText}>{row.time}</span>
                      </td>
                      <td className={styles.centerTd}>{row.temp}</td>
                      <td className={styles.centerTd}>{row.humAir}</td>
                      <td className={styles.centerTd}>{row.humSoil}</td>
                      <td className={styles.centerTd}>{row.ph}</td>
                      <td className={styles.centerTd}>
                        <span className={`${styles.statusBadge} ${row.status === 'Alerta' ? styles.alerta : styles.normal}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className={styles.paginationArea}>
            <span>Mostrando <strong>{totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)}</strong> de <strong>{totalItems}</strong></span>
            <div className={styles.pagination}>
              <button 
                className={styles.pageArrow} 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`${styles.pageNum} ${i + 1 === currentPage ? styles.active : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              <button 
                className={styles.pageArrow} 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default Relatorio;
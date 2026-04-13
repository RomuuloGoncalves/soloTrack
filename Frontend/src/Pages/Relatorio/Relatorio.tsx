import { useState, useMemo } from 'react';
import lightLogo from '../../assets/images/Light-logo.svg';
import darkLogo from '../../assets/images/Dark-Logo.svg';
import {
  Download, FileText, Search, Calendar,
  Warehouse, Sprout, Thermometer, Droplets,
  Droplet, Filter, Pipette, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { Sidebar } from '../../Components/Sidebar/Sidebar';
import styles from './Relatorio.module.css';
import { useTheme } from '../../hooks/useTheme';

export function Relatorio() {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const logo = useMemo(() => theme === 'dark' ? darkLogo : lightLogo, [theme]);

  const [data] = useState([
    { id: 'LEIT - 100018', date: '10 de abr, 2026', time: '11:22', origin: 'Estufa B - Sul Morango', temp: '29 °C', humAir: '75,3%', humSoil: '42,1%', ph: '7.2', status: 'Alerta' },
    { id: 'LEIT - 100018', date: '10 de abr, 2026', time: '11:22', origin: 'Estufa B - Sul Morango', temp: '29 °C', humAir: '75,3%', humSoil: '42,1%', ph: '7.2', status: 'Normal' },
    { id: 'LEIT - 100018', date: '10 de abr, 2026', time: '11:22', origin: 'Estufa B - Sul Morango', temp: '29 °C', humAir: '75,3%', humSoil: '42,1%', ph: '7.2', status: 'Alerta' },
  ]);

  const totalItems = data.length;
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  return (
    <div className={styles.pageLayout}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
        logo={logo}
      />

      <main className={styles.mainContent}>
        <button className={styles.hamburgerButton} onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>

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
              <select><option>Todas as estufas</option></select>
            </div>
            <div className={styles.filterGroup}>
              <label><Sprout size={16} /> CULTURA</label>
              <select><option>Todas as culturas</option></select>
            </div>
            <div className={styles.filterGroup}>
              <label><Calendar size={16} /> DATA</label>
              <input type="text" placeholder="dd/mm/aaaa" />
            </div>
            <div className={styles.filterGroup}>
              <label><Search size={16} /> BUSCA RÁPIDA</label>
              <input type="text" placeholder="Pesquise por ID" />
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
                {data.map((row, index) => (
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
                ))}
              </tbody>
            </table>
          </div>

          <footer className={styles.paginationArea}>
            <span>Mostrando <strong>1 a {totalItems}</strong> de <strong>{totalItems}</strong></span>
            <div className={styles.pagination}>
              <button className={styles.pageArrow}><ChevronLeft size={18} /></button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`${styles.pageNum} ${i === 0 ? styles.active : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              <button className={styles.pageArrow}><ChevronRight size={18} /></button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default Relatorio;
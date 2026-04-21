import { ChevronLeft, Printer, Sprout, QrCode, FileText, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './DetalheArea.module.css';

export function DetalheArea() {
  return (
    <div className={styles.pageContainer}>
      
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/GestaoPropriedade" className={styles.backLink}>
            <ChevronLeft size={16} /> Voltar áreas
          </Link>
          
          <h1 className={styles.title}>Estufa Norte</h1>
          
          <div className={styles.subtitle}>
            <Sprout size={16} /> 
            <span>Cultura atual:</span> 
            <span className={styles.highlightText}>Tomate cereja</span>
          </div>
        </div>

        <button className={styles.actionButton}>
          <Printer size={18} />
          Gerar etiqueta (QR Code)
        </button>
      </header>

      <main className={styles.contentGrid}>
        
        <aside className={styles.qrColumn}>
          <div className={styles.card}>
            <div className={styles.qrIconWrapper}>
              <QrCode size={120} strokeWidth={1.5} />
            </div>
            <h2 className={styles.cardTitleCentered}>Qr code de Identificação</h2>
            <p className={styles.cardDescriptionCentered}>
              Imprima e cole fisicamente na estufa para check-ins rápidos
            </p>
          </div>
        </aside>

        <div className={styles.tablesColumn}>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FileText size={18} className={styles.cardIcon} color="#FFC409" />
              <h2 className={styles.cardTitle}>Receitas de Insumo da área</h2>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Insumo</th>
                    <th>Quantidade</th>
                    <th>Frequência</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.rowHighlight}>NPK - 10 - 10</td>
                    <td>2kg</td>
                    <td>A cada 15 dias</td>
                  </tr>
                  <tr>
                    <td className={styles.rowHighlight}>Cálcio Liquido</td>
                    <td>500ml</td>
                    <td>Semanal</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <History size={18} className={styles.cardIcon} color="#093AFF" />
              <h2 className={styles.cardTitle}>Histórico de cultura</h2>
            </div>
            
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Cultura</th>
                    <th>Período</th>
                    <th>Rendimento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.rowHighlight}>Alface Americana</td>
                    <td>10/01 até 10/02</td>
                    <td>800kg</td>
                  </tr>
                  <tr>
                    <td className={styles.rowHighlight}>Rúcula</td>
                    <td>05/11 até 05/12</td>
                    <td>450kg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
} export default DetalheArea;
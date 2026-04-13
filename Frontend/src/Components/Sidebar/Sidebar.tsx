import { 
  LayoutGrid, Layers, Banknote, ClipboardList, TrendingUp, 
  Package, Sparkles, Settings, X, Sun, Moon, Menu
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import styles from './Sidebar.module.css';
import { useState } from 'react';
import { ConfiguracaoModal } from '../ConfiguracaoModal/ConfiguracaoModal';
import { Link } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  logo: string;
}

export function Sidebar({ isOpen, onClose, onOpen, logo }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.getAttribute('data-theme') === 'dark'
    : theme === 'dark';

  return (
    <>
      <div className="hamburguerWrapper">
        {!isOpen && (
        <button className={styles.hamburger} onClick={onOpen} aria-label="Abrir menu">
          <Menu size={24} />
        </button>
      )}
      </div>

      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`} 
        onClick={onClose} 
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <button className={styles.closeButton} onClick={onClose} aria-label="Fechar menu">
          <X size={24} />
        </button>

        <div className={styles.sidebarHeader}>
          <div className={styles.heroImage} style={{ backgroundImage: `url(${logo})` }}></div>
          <span className={styles.logoText}>Solo<span className={styles.track}>Track.</span></span>
        </div>

        <nav className={styles.navSection}>
          <p className={styles.sectionTitle}>Organização</p>
          <Link to="/" className={styles.navItem}><LayoutGrid size={18} /> Visão Geral</Link>
          <Link to="" className={styles.navItem}><Layers size={18} /> Gestão</Link>
          <Link to="" className={styles.navItem}><Banknote size={18} /> Finanças</Link>
          <Link to="/Relatorio" className={styles.navItem}><ClipboardList size={18} /> Relatório</Link>
          
          <p className={styles.sectionTitle} style={{marginTop: '20px'}}>Funções</p>
          <Link to="" className={styles.navItem}><TrendingUp size={18} /> Projeção</Link>
          <Link to="" className={styles.navItem}><Package size={18} /> Dispositivos</Link>
          <Link to="/ChatBot" className={styles.navItem}>
            <Sparkles size={18} /> Suporte
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.navItem} onClick={toggleTheme}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isDarkMode ? 'Tema Claro' : 'Tema Escuro'}
          </div>
          <div className={styles.navItem} onClick={() => setIsSettingsOpen(true)}>
            <Settings size={18} /> Configuração
          </div>
        </div>
      </aside>

      <ConfiguracaoModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}
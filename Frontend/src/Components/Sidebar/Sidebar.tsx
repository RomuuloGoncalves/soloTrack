import { useState } from 'react';
import { 
  LayoutGrid, Layers, Banknote, ClipboardList, TrendingUp, 
  Package, Sparkles, Settings, X, Sun, Moon 
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { SettingsModal } from '../SettingsModal/SettingsModal';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  logo: string;
}

export function Sidebar({ isOpen, onClose, logo }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ''}`} 
        onClick={onClose} 
      />

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.sidebarHeader}>
          <div className={styles.heroImage} style={{ backgroundImage: `url(${logo})` }}></div>
          <span className={styles.logoText}>Solo<span className={styles.track}>Track.</span></span>
        </div>

        <nav className={styles.navSection}>
          <p className={styles.sectionTitle}>Organização</p>
          <div className={styles.navItem}><LayoutGrid size={18} /> Visão Geral</div>
          <div className={styles.navItem}><Layers size={18} /> Gestão</div>
          <div className={styles.navItem}><Banknote size={18} /> Finanças</div>
          <div className={styles.navItem}><ClipboardList size={18} /> Relatório</div>
          
          <p className={styles.sectionTitle} style={{ marginTop: '20px' }}>Funções</p>
          <div className={styles.navItem}><TrendingUp size={18} /> Projeção</div>
          <div className={styles.navItem}><Package size={18} /> Dispositivos</div>
          <div className={styles.navItem}><Sparkles size={18} /> Suporte</div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.navItem} onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
          </div>
          
          <div className={styles.navItem} onClick={() => setIsSettingsOpen(true)}>
            <Settings size={18} /> Configuração
          </div>
        </div>
      </aside>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
}
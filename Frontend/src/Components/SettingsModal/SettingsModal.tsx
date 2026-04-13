import { LogOut, Sun, Monitor, Moon, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={22} />
        </button>
        <h1 className={styles.title}>Configurações</h1>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Geral</h2>
          <div className={styles.card}>
            <label className={styles.label}>Aparência</label>
            <div className={styles.themeSwitcher}>
              <button 
                className={`${styles.themeBtn} ${theme === 'light' ? styles.active : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={18} /> Claro
              </button>
              <button 
                className={`${styles.themeBtn} ${theme === 'system' ? styles.active : ''}`}
                onClick={() => setTheme('system')}
              >
                <Monitor size={18} /> Sistema
              </button>
              <button 
                className={`${styles.themeBtn} ${theme === 'dark' ? styles.active : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={18} /> Escuro
              </button>
            </div>
          </div>
        </section>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Conta</h2>
          <div className={styles.card}>
            <div className={styles.inputGroup}>
              <label>Nome</label>
              <input type="text" placeholder="Digite seu nome" />
            </div>
            <div className={styles.inputGroup}>
              <label>Email</label>
              <input type="email" placeholder="Digite seu email" />
            </div>
            <div className={styles.inputGroup}>
              <label>Senha</label>
              <input type="password" placeholder="Digite sua senha" />
            </div>
            <div className={styles.actionButtons}>
              <button className={styles.confirmBtn}>Confirmar</button>
              <button className={styles.cancelBtn} onClick={onClose}>Cancelar</button>
            </div>
          </div>
        </section>
        <button className={styles.logoutBtn}>
          <LogOut size={18} /> Sair
        </button>
      </div>
    </div>
  );
}
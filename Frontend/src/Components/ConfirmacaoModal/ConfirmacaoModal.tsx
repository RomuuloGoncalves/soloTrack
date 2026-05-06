import { HelpCircle, Trash2, X } from 'lucide-react';
import styles from './ConfirmacaoModal.module.css';

interface ConfirmacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'confirm' | 'delete';
}

export function ConfirmacaoModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'confirm'
}: ConfirmacaoModalProps) {
  if (!isOpen) return null;

  const isDelete = type === 'delete';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        
        {/* Botão Fechar */}
        <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>

        {/* Ícone com o efeito de Halo (Borda esfumaçada) */}
        <div className={styles.iconWrapper}>
          <div className={`${styles.iconHalo} ${isDelete ? styles.haloRed : styles.haloBlue}`}>
            <div className={`${styles.iconInner} ${isDelete ? styles.bgRed : styles.bgBlue}`}>
              {isDelete ? <Trash2 size={24} color="#fff" /> : <HelpCircle size={24} color="#fff" />}
            </div>
          </div>
        </div>

        {/* Textos */}
        <div className={styles.textContent}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.message}>{message}</p>
        </div>

        {/* Botões de Ação */}
        <div className={styles.buttonGroup}>
          <button className={styles.btnCancel} onClick={onClose}>
            {cancelText}
          </button>
          <button 
            className={`${styles.btnAction} ${isDelete ? styles.btnRed : styles.btnGreen}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
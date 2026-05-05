import styles from './NovaAreaSidebar.module.css';

interface NovaAreaSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NovaAreaSidebar({ isOpen, onClose }: NovaAreaSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.sidebarOverlay} onClick={onClose}>
      <div className={styles.sidebarContainer} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.sidebarHeader}>
          <div className={styles.headerText}>
            <h2 className={styles.sidebarTitle}>Nova Área de plantio</h2>
            <p className={styles.sidebarSubtitle}>
              Cadastre estufas, canteiros ou setores do seu terreno.
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>

        <div className={styles.sidebarBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="areaName">Nome da área</label>
            <input
              id="areaName"
              type="text"
              className={styles.formInput}
              placeholder="Ex: Horta Sul, Estufa 02..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="areaSize">Tamanho (m²)</label>
            <input
              id="areaSize"
              type="number"
              className={styles.formInput}
              placeholder="220"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="currentCrop">Cultura Atual</label>
            <select
              id="currentCrop"
              className={styles.formInput}
              defaultValue=""
            >
              <option value="" disabled>
                Selecione uma cultura...
              </option>
              <option value="tomate_cereja">Tomate Cereja</option>
              <option value="alface">Alface</option>
              <option value="milho">Milho</option>
              <option value="soja">Soja</option>
            </select>
          </div>
        </div>

        <div className={styles.sidebarFooter}>
          <button className={styles.btnPrimary}>Criar área</button>
          <button className={styles.btnSecondary} onClick={onClose}>Cancelar</button>
        </div>

      </div>
    </div>
  );
}
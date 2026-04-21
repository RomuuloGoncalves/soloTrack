import { Map, Sprout, Trash2 } from 'lucide-react';
import styles from './AreaCard.module.css';

interface AreaCardProps {
  nome: string;
  tamanho: string;
  cultura?: string;
  onExcluir?: () => void;
}

export function AreaCard({ nome, tamanho, cultura, onExcluir }: AreaCardProps) {
  return (
    <div className={styles.areaCard}>
      <div className={styles.cardTop}>
        <div className={styles.areaInfo}>
          <h3>{nome}</h3>
          <p>{tamanho}</p>
        </div>
        <div className={styles.cardTopActions}>
          <div className={styles.mapIconCircle}>
            <Map size={20} color="#58C411" />
          </div>
          {onExcluir && (
            <button
              className={styles.deleteBtn}
              onClick={onExcluir}
              aria-label="Excluir área"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.cardDivider} />

      <div className={styles.cardBottom}>
        <span className={styles.cultureLabel}>Cultura atual</span>
        <div className={styles.cultureInfo}>
          <Sprout size={16} color="#58C411" />
          <span>{cultura ?? 'Nenhuma'}</span>
        </div>
      </div>
    </div>
  );
}
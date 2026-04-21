import { Map, Sprout } from 'lucide-react';
import styles from './AreaCard.module.css';

interface AreaCardProps {
  nome: string;
  tamanho: string;
  cultura: string;
}

export function AreaCard({ nome, tamanho, cultura }: AreaCardProps) {
  return (
    <div className={styles.areaCard}>
      <div className={styles.cardTop}>
        <div className={styles.areaInfo}>
          <h3>{nome}</h3>
          <p>{tamanho}</p>
        </div>
        <div className={styles.mapIconCircle}>
          <Map size={20} color="#58C411" />
        </div>
      </div>
      
      <div className={styles.cardDivider} />
      
      <div className={styles.cardBottom}>
        <span className={styles.cultureLabel}>Cultura atual</span>
        <div className={styles.cultureInfo}>
          <Sprout size={16} color="#58C411" />
          <span>{cultura}</span>
        </div>
      </div>
    </div>
  );
}
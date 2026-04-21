import { Map, Sprout, Trash2 } from 'lucide-react';
import styles from './AreaCard.module.css';
import { useNavigate } from 'react-router-dom';
import type { AreaPlantio } from '../../types/types';

interface AreaCardProps {
  area: AreaPlantio;
  cultura?: string; 
  onExcluir?: (id: number) => void; 
}

export function AreaCard({ area, cultura, onExcluir }: AreaCardProps) {
  const navigate = useNavigate();

  const handleAbrirDetalhes = () => {
    navigate(`/detalhearea/${area.id}`);
  };

  return (
    <div 
      className={styles.areaCard}
      onClick={handleAbrirDetalhes}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.cardTop}>
        <div className={styles.areaInfo}>
          {/* Mapeando para os novos nomes do banco */}
          <h3>{area.nome_area}</h3>
          <p>{area.tamanho_area_m2 ? `${area.tamanho_area_m2} m²` : 'Tamanho não definido'}</p>
        </div>
        
        <div className={styles.cardTopActions}>
          <div className={styles.mapIconCircle}>
            <Map size={20} color="#58C411" />
          </div>
          
          {onExcluir && (
            <button
              className={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                onExcluir(area.id);
              }}
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
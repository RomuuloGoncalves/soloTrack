import { useState, useMemo } from 'react';
import { Sidebar } from '../../Components/Sidebar/Sidebar';
import { Target, MapPin, Tractor, Map } from 'lucide-react';
import styles from './GestaoPropriedade.module.css';
import { useTheme } from '../../hooks/useTheme';
import lightLogo from '../../assets/images/Light-logo.svg';
import darkLogo from '../../assets/images/Dark-Logo.svg';

import { AreaCard } from '../../Components/AreaCard/AreaCard';

export function GestaoPropriedade() {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('fazenda');

  const logo = useMemo(() => theme === 'dark' ? darkLogo : lightLogo, [theme]);

  const areas = [
    { id: '1', nome: 'Estufa norte', tamanho: '250m²', cultura: 'Tomate cereja' },
    { id: '2', nome: 'Setor Sul', tamanho: '180m²', cultura: 'Alface Lisa' },
    { id: '3', nome: 'Setor Sul', tamanho: '180m²', cultura: 'Alface Lisa' },
    { id: '4', nome: 'Campo Aberto', tamanho: '500m²', cultura: 'Milho' },
    { id: '5', nome: 'Campo Aberto', tamanho: '500m²', cultura: 'Milho' }
  ];

  return (
    <div className={styles.pageLayout}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
        logo={logo}
      />

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Gestão</h1>
          <p>Espelhe a realidade física do seu terreno e gerencie suas áreas de plantio.</p>
        </header>

        <nav className={styles.toolbar}>
          <button
            className={`${styles.tab} ${activeTab === 'fazenda' ? styles.active : ''}`}
            onClick={() => setActiveTab('fazenda')}
          >
            <Tractor size={20} /> Minha fazenda
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'areas' ? styles.active : ''}`}
            onClick={() => setActiveTab('areas')}
          >
            <Map size={20} /> Áreas de plantio
          </button>
        </nav>

        {activeTab === 'fazenda' && (
          <section className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h2>Dados da propriedade</h2>
              <p>Configure os dados gerais do seu terreno.</p>
            </div>

            <form className={styles.form}>
              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Nome da propriedade</label>
                  <input type="text" placeholder="Fazenda do pássaros" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Tamanho total (Hectares)</label>
                  <input type="number" placeholder="150" />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Cidade</label>
                  <input type="text" placeholder="Sorocaba" />
                </div>
                <div className={styles.inputGroup}>
                  <label>Estado</label>
                  <input type="text" placeholder="SP" />
                </div>
              </div>

              <div className={styles.geoSection}>
                <div className={styles.geoHeader}>
                  <div className={styles.geoTitle}>
                    <MapPin size={20} />
                    <div>
                      <h3>Localização Geográfica</h3>
                      <p>Coordenadas centrais da propriedade</p>
                    </div>
                  </div>
                  <button type="button" className={styles.captureBtn}>
                    <Target size={16} /> Capturar atual
                  </button>
                </div>

                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label>Latitude</label>
                    <input type="text" placeholder="Ex: -23.550529" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Longitude</label>
                    <input type="text" placeholder="Ex: -46.633308" />
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.saveBtn}>Salvar propriedade</button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'areas' && (
          <div className={styles.areasContainer}>
            <div className={styles.areasHeader}>
              <h2 className={styles.areasTitle}>Áreas Existentes</h2>
              <button className={styles.addAreaBtn}>
                <span>+</span> Nova área
              </button>
            </div>

            <div className={styles.areasGrid}>
              {areas.map((area) => (
                  <AreaCard
                    key={area.id}
                    id={area.id}
                    nome={area.nome}
                    tamanho={area.tamanho}
                    cultura={area.cultura}
                  />
                ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
} export default GestaoPropriedade;
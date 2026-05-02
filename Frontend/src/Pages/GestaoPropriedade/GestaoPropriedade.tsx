import { useState, useMemo, useEffect } from 'react';
import { Sidebar } from '../../Components/Sidebar/Sidebar';
import { Target, MapPin, Tractor, Map, X } from 'lucide-react';
import styles from './GestaoPropriedade.module.css';
import { useTheme } from '../../hooks/useTheme';
import { useAutenticacao } from '../../contexts/ContextoAuth';
import lightLogo from '../../assets/images/Light-logo.svg';
import darkLogo from '../../assets/images/Dark-Logo.svg';
import { AreaCard } from '../../Components/AreaCard/AreaCard';
import { useToast } from '../../contexts/ToastContext';
import propriedadeService from '../../services/propriedadeService';
import areaPlantioService from '../../services/areaPlantioService';
import type { Propriedade, AreaPlantio } from '../../types/types';

type Erros = Record<string, string>;

function primeiroErro(erros: Erros, campo: string): string | undefined {
  return erros[campo];
}

export function GestaoPropriedade() {
  const { theme } = useTheme();
  const { usuario } = useAutenticacao();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('fazenda');

  const logo = useMemo(() => theme === 'dark' ? darkLogo : lightLogo, [theme]);

  // --- Propriedade form state ---
  const [propriedadeId, setPropriedadeId] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [tamanhoHectares, setTamanhoHectares] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [loadingPropriedade, setLoadingPropriedade] = useState(true);
  const [salvandoPropriedade, setSalvandoPropriedade] = useState(false);
  const [errosPropriedade, setErrosPropriedade] = useState<Erros>({});

  // --- Áreas state ---
  const [areas, setAreas] = useState<AreaPlantio[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // --- Modal nova área ---
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeArea, setNomeArea] = useState('');
  const [tamanhoAreaM2, setTamanhoAreaM2] = useState('');
  const [latitudeArea, setLatitudeArea] = useState('');
  const [longitudeArea, setLongitudeArea] = useState('');
  const [salvandoArea, setSalvandoArea] = useState(false);
  const [errosArea, setErrosArea] = useState<Erros>({});

  useEffect(() => {
    async function carregarPropriedade() {
      try {
        const res = await propriedadeService.listar();
        const lista = res.data.data;
        if (lista.length > 0) {
          preencherFormulario(lista[0]);
        }
      } catch {
        showToast('Erro ao carregar dados da propriedade.', 'error');
      } finally {
        setLoadingPropriedade(false);
      }
    }
    carregarPropriedade();
  }, []);

  useEffect(() => {
    if (activeTab === 'areas' && propriedadeId) {
      carregarAreas(propriedadeId);
    }
  }, [activeTab, propriedadeId]);

  function preencherFormulario(p: Propriedade) {
    setPropriedadeId(p.id);
    setNome(p.nome);
    setTamanhoHectares(p.tamanho_hectares ?? '');
    setCidade(p.cidade ?? '');
    setEstado(p.estado ?? '');
    setLatitude(p.latitude ?? '');
    setLongitude(p.longitude ?? '');
  }

  async function carregarAreas(idPropriedade: number) {
    setLoadingAreas(true);
    try {
      const res = await areaPlantioService.listar(idPropriedade);
      setAreas(res.data.data);
    } catch {
      showToast('Erro ao carregar áreas de plantio.', 'error');
    } finally {
      setLoadingAreas(false);
    }
  }

  function capturarLocalizacao(
    setLat: (v: string) => void,
    setLng: (v: string) => void
  ) {
    if (!navigator.geolocation) {
      showToast('Geolocalização não suportada pelo navegador.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toString());
        setLng(pos.coords.longitude.toString());
        showToast('Localização capturada com sucesso!', 'success');
      },
      () => showToast('Não foi possível obter a localização.', 'error')
    );
  }

  function extrairErros(error: any): Erros {
    const apiErrors = error.response?.data?.errors;
    if (!apiErrors) return {};
    const mapeado: Erros = {};
    for (const campo in apiErrors) {
      mapeado[campo] = Array.isArray(apiErrors[campo])
        ? apiErrors[campo][0]
        : apiErrors[campo];
    }
    return mapeado;
  }

  async function handleSubmitPropriedade(e: React.FormEvent) {
    e.preventDefault();

    if (propriedadeId) {
      const confirmacao = window.confirm('Você já possui uma fazenda cadastrada. Deseja atualizar suas informações?');
      if (!confirmacao) {
        return;
      }
    }

    setErrosPropriedade({});
    setSalvandoPropriedade(true);
    try {
      const payload = {
        nome,
        cidade: cidade || undefined,
        estado: estado || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        tamanho_hectares: tamanhoHectares ? parseFloat(tamanhoHectares) : undefined,
        usuario_id: usuario?.id,
      };

      if (propriedadeId) {
        const res = await propriedadeService.atualizar(propriedadeId, payload);
        preencherFormulario(res.data.data);
        showToast(res.data.message || 'Propriedade atualizada!', 'success');
      } else {
        const res = await propriedadeService.criar(payload);
        preencherFormulario(res.data.data);
        showToast(res.data.message || 'Propriedade criada!', 'success');
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrosPropriedade(extrairErros(error));
        showToast('Corrija os erros no formulário.', 'error');
      } else {
        showToast(error.response?.data?.message || 'Erro ao salvar propriedade.', 'error');
      }
    } finally {
      setSalvandoPropriedade(false);
    }
  }

  function abrirModal() {
    setNomeArea('');
    setTamanhoAreaM2('');
    setLatitudeArea('');
    setLongitudeArea('');
    setErrosArea({});
    setModalAberto(true);
  }

  async function handleSubmitArea(e: React.FormEvent) {
    e.preventDefault();
    if (!propriedadeId) return;
    setErrosArea({});
    setSalvandoArea(true);
    try {
      const payload = {
        propriedade_id: propriedadeId,
        nome_area: nomeArea,
        tamanho_area_m2: tamanhoAreaM2 ? parseFloat(tamanhoAreaM2) : undefined,
        latitude: latitudeArea ? parseFloat(latitudeArea) : undefined,
        longitude: longitudeArea ? parseFloat(longitudeArea) : undefined,
      };
      const res = await areaPlantioService.criar(payload);
      setAreas(prev => [...prev, res.data.data]);
      setModalAberto(false);
      showToast(res.data.message || 'Área criada!', 'success');
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrosArea(extrairErros(error));
        showToast('Corrija os erros no formulário.', 'error');
      } else {
        showToast(error.response?.data?.message || 'Erro ao criar área.', 'error');
      }
    } finally {
      setSalvandoArea(false);
    }
  }

  async function handleExcluirArea(id: number) {
    try {
      await areaPlantioService.deletar(id);
      setAreas(prev => prev.filter(a => a.id !== id));
      showToast('Área removida com sucesso!', 'success');
    } catch {
      showToast('Erro ao remover área.', 'error');
    }
  }

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

            {loadingPropriedade ? (
              <div className={styles.loadingState}>Carregando...</div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmitPropriedade}>
                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label>Nome da propriedade</label>
                    <input
                      type="text"
                      placeholder="Fazenda dos Pássaros"
                      value={nome}
                      onChange={e => { setNome(e.target.value); setErrosPropriedade(p => ({ ...p, nome: '' })); }}
                      className={primeiroErro(errosPropriedade, 'nome') ? styles.inputError : ''}
                    />
                    {primeiroErro(errosPropriedade, 'nome') && (
                      <span className={styles.fieldError}>{primeiroErro(errosPropriedade, 'nome')}</span>
                    )}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Tamanho total (Hectares)</label>
                    <input
                      type="number"
                      placeholder="150"
                      step="0.01"
                      value={tamanhoHectares}
                      onChange={e => { setTamanhoHectares(e.target.value); setErrosPropriedade(p => ({ ...p, tamanho_hectares: '' })); }}
                      className={primeiroErro(errosPropriedade, 'tamanho_hectares') ? styles.inputError : ''}
                    />
                    {primeiroErro(errosPropriedade, 'tamanho_hectares') && (
                      <span className={styles.fieldError}>{primeiroErro(errosPropriedade, 'tamanho_hectares')}</span>
                    )}
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.inputGroup}>
                    <label>Cidade</label>
                    <input
                      type="text"
                      placeholder="Sorocaba"
                      value={cidade}
                      onChange={e => { setCidade(e.target.value); setErrosPropriedade(p => ({ ...p, cidade: '' })); }}
                      className={primeiroErro(errosPropriedade, 'cidade') ? styles.inputError : ''}
                    />
                    {primeiroErro(errosPropriedade, 'cidade') && (
                      <span className={styles.fieldError}>{primeiroErro(errosPropriedade, 'cidade')}</span>
                    )}
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Estado</label>
                    <input
                      type="text"
                      placeholder="SP"
                      value={estado}
                      onChange={e => { setEstado(e.target.value.toUpperCase()); setErrosPropriedade(p => ({ ...p, estado: '' })); }}
                      className={primeiroErro(errosPropriedade, 'estado') ? styles.inputError : ''}
                    />
                    {primeiroErro(errosPropriedade, 'estado') && (
                      <span className={styles.fieldError}>{primeiroErro(errosPropriedade, 'estado')}</span>
                    )}
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
                    <button
                      type="button"
                      className={styles.captureBtn}
                      onClick={() => capturarLocalizacao(setLatitude, setLongitude)}
                    >
                      <Target size={16} /> Capturar atual
                    </button>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.inputGroup}>
                      <label>Latitude</label>
                      <input
                        type="text"
                        placeholder="Ex: -23.550529"
                        value={latitude}
                        onChange={e => { setLatitude(e.target.value); setErrosPropriedade(p => ({ ...p, latitude: '' })); }}
                        className={primeiroErro(errosPropriedade, 'latitude') ? styles.inputError : ''}
                      />
                      {primeiroErro(errosPropriedade, 'latitude') && (
                        <span className={styles.fieldError}>{primeiroErro(errosPropriedade, 'latitude')}</span>
                      )}
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Longitude</label>
                      <input
                        type="text"
                        placeholder="Ex: -46.633308"
                        value={longitude}
                        onChange={e => { setLongitude(e.target.value); setErrosPropriedade(p => ({ ...p, longitude: '' })); }}
                        className={primeiroErro(errosPropriedade, 'longitude') ? styles.inputError : ''}
                      />
                      {primeiroErro(errosPropriedade, 'longitude') && (
                        <span className={styles.fieldError}>{primeiroErro(errosPropriedade, 'longitude')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={salvandoPropriedade}
                  >
                    {salvandoPropriedade
                      ? 'Salvando...'
                      : propriedadeId
                        ? 'Atualizar propriedade'
                        : 'Salvar propriedade'}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}

        {activeTab === 'areas' && (
          <div className={styles.areasContainer}>
            {!propriedadeId ? (
              <div className={styles.emptyState}>
                <p>Cadastre sua propriedade na aba <strong>Minha fazenda</strong> antes de adicionar áreas.</p>
              </div>
            ) : (
              <>
                <div className={styles.areasHeader}>
                  <h2 className={styles.areasTitle}>Áreas de Plantio</h2>
                  <button className={styles.addAreaBtn} onClick={abrirModal}>
                    <span>+</span> Nova área
                  </button>
                </div>

                {loadingAreas ? (
                  <div className={styles.loadingState}>Carregando áreas...</div>
                ) : areas.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>Nenhuma área cadastrada. Clique em <strong>Nova área</strong> para começar.</p>
                  </div>
                ) : (
                  <div className={styles.areasGrid}>
                    {areas.map(area => (
                      <AreaCard
                            key={area.id}
                            area={area} 
                            onExcluir={handleExcluirArea}
                          />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {modalAberto && (
        <div className={styles.modalOverlay} onClick={() => setModalAberto(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nova área de plantio</h2>
              <button
                className={styles.modalClose}
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitArea}>
              <div className={styles.modalBody}>
                <div className={styles.inputGroup}>
                  <label>Nome da área</label>
                  <input
                    type="text"
                    placeholder="Ex: Estufa Norte"
                    value={nomeArea}
                    onChange={e => { setNomeArea(e.target.value); setErrosArea(p => ({ ...p, nome_area: '' })); }}
                    className={primeiroErro(errosArea, 'nome_area') ? styles.inputError : ''}
                  />
                  {primeiroErro(errosArea, 'nome_area') && (
                    <span className={styles.fieldError}>{primeiroErro(errosArea, 'nome_area')}</span>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label>Tamanho (m²)</label>
                  <input
                    type="number"
                    placeholder="Ex: 250"
                    step="0.01"
                    value={tamanhoAreaM2}
                    onChange={e => { setTamanhoAreaM2(e.target.value); setErrosArea(p => ({ ...p, tamanho_area_m2: '' })); }}
                    className={primeiroErro(errosArea, 'tamanho_area_m2') ? styles.inputError : ''}
                  />
                  {primeiroErro(errosArea, 'tamanho_area_m2') && (
                    <span className={styles.fieldError}>{primeiroErro(errosArea, 'tamanho_area_m2')}</span>
                  )}
                </div>

                <div className={styles.geoSection}>
                  <div className={styles.geoHeader}>
                    <div className={styles.geoTitle}>
                      <MapPin size={20} />
                      <div>
                        <h3>Localização Geográfica</h3>
                        <p>Coordenadas centrais da área</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.captureBtn}
                      onClick={() => capturarLocalizacao(setLatitudeArea, setLongitudeArea)}
                    >
                      <Target size={16} /> Capturar atual
                    </button>
                  </div>

                  <div className={styles.row}>
                    <div className={styles.inputGroup}>
                      <label>Latitude</label>
                      <input
                        type="text"
                        placeholder="Ex: -23.550529"
                        value={latitudeArea}
                        onChange={e => { setLatitudeArea(e.target.value); setErrosArea(p => ({ ...p, latitude: '' })); }}
                        className={primeiroErro(errosArea, 'latitude') ? styles.inputError : ''}
                      />
                      {primeiroErro(errosArea, 'latitude') && (
                        <span className={styles.fieldError}>{primeiroErro(errosArea, 'latitude')}</span>
                      )}
                    </div>
                    <div className={styles.inputGroup}>
                      <label>Longitude</label>
                      <input
                        type="text"
                        placeholder="Ex: -46.633308"
                        value={longitudeArea}
                        onChange={e => { setLongitudeArea(e.target.value); setErrosArea(p => ({ ...p, longitude: '' })); }}
                        className={primeiroErro(errosArea, 'longitude') ? styles.inputError : ''}
                      />
                      {primeiroErro(errosArea, 'longitude') && (
                        <span className={styles.fieldError}>{primeiroErro(errosArea, 'longitude')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={salvandoArea}
                >
                  {salvandoArea ? 'Salvando...' : 'Criar área'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestaoPropriedade;

import { useTheme } from "../../hooks/useTheme";
import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import darkLogo from "../../assets/images/Dark-Logo.svg";
import lightLogo from "../../assets/images/Light-logo.svg";
import styles from "./Dispositivos.module.css";
import { Plus, Search, Cpu, Activity, Wifi } from "lucide-react";
import Accordion, { type Dispositivo } from "../../components/Accordion/Accordion";
import equipamentoService from "../../services/equipamentoService";
import { NovoDispositivoSidebar } from "../../components/NovoDispositivoSidebar/NovoDispositivoSidebar";
import { useToast } from "../../contexts/ToastContext";
import { ConfirmacaoModal } from "../../components/ConfirmacaoModal/ConfirmacaoModal";

export function Dispositivos() {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- Devices State ---
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Sidebar/Modal State ---
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoDispositivo, setEditandoDispositivo] = useState<Dispositivo | null>(null);

  // --- Delete confirmation state ---
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deviceToDeleteId, setDeviceToDeleteId] = useState<number | null>(null);

  useEffect(() => {
    carregarDispositivos();
  }, []);

  async function carregarDispositivos() {
    setLoading(true);
    try {
      const res = await equipamentoService.listar();
      // Map API Equipamento schema to Accordion's expected Dispositivo format
      const mapped = (res.data.data ?? []).map((equip: any) => ({
        id: equip.id,
        nome: equip.nome_apelido || "Dispositivo sem nome",
        mac: equip.mac_address,
        status: equip.ativo ? "online" : "offline",
        sensores: (equip.tipo_sensores ?? []).map((s: any, index: number) => ({
          id: s.id || index,
          nome: s.nome_sensor || s.nome || "Sensor Integrado",
          status: equip.ativo ? "conectado" : "erro",
          label: `P${index + 1}`
        }))
      }));
      setDispositivos(mapped);
    } catch {
      showToast("Erro ao carregar dispositivos.", "error");
    } finally {
      setLoading(false);
    }
  }

  // --- Filtered devices ---
  const filteredDispositivos = useMemo(() => {
    if (!searchTerm.trim()) return dispositivos;
    return dispositivos.filter(
      (d) =>
        d.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.mac.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dispositivos, searchTerm]);

  // --- Dynamic Stats calculation ---
  const stats = useMemo(() => {
    const total = dispositivos.length;
    const ativos = dispositivos.filter((d) => d.status === "online").length;
    // Count sensors associated with online devices
    const totalSensors = dispositivos.reduce((acc, curr) => {
      if (curr.status === "online") {
        return acc + (curr.sensores?.length || 0);
      }
      return acc;
    }, 0);

    return { total, ativos, totalSensors };
  }, [dispositivos]);

  function abrirSidebarCriar() {
    setEditandoDispositivo(null);
    setModalAberto(true);
  }

  function abrirSidebarEdicao(dispositivo: Dispositivo) {
    setEditandoDispositivo(dispositivo);
    setModalAberto(true);
  }

  function acionarExclusao(id: number) {
    setDeviceToDeleteId(id);
    setConfirmDeleteOpen(true);
  }

  async function confirmarExclusao() {
    if (deviceToDeleteId === null) return;
    try {
      await equipamentoService.excluir(deviceToDeleteId);
      showToast("Dispositivo excluído com sucesso!", "success");
      carregarDispositivos();
    } catch {
      showToast("Erro ao excluir dispositivo.", "error");
    } finally {
      setConfirmDeleteOpen(false);
      setDeviceToDeleteId(null);
    }
  }

  const logo = useMemo(
    () => (theme === "dark" ? darkLogo : lightLogo),
    [theme]
  );

  return (
    <div className={styles.pageLayout}>
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpen={() => setIsSidebarOpen(true)}
        logo={logo}
      />

      <div className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <h1>Dispositivos</h1>
            <p>Gerencie seus sensores e dispositivos IoT integrados na fazenda.</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.addDispositivo} onClick={abrirSidebarCriar}>
              <Plus /> Adicionar novo dispositivo
            </button>
          </div>
        </header>

        {/* Dynamic Stats Grid */}
        <div className={styles.containerCardStats}>
          <div className={`${styles.totalDispositivos} ${styles.card}`}>
            <div className={styles.icon}>
              <Cpu size={22} />
            </div>
            <div className={styles.info}>
              <p>Total de Dispositivos</p>
              <p>{stats.total}</p>
            </div>
          </div>
          <div className={`${styles.sensoresAtivos} ${styles.card}`}>
            <div className={styles.icon}>
              <Activity size={22} />
            </div>
            <div className={styles.info}>
              <p>Sensores ativos</p>
              <p>{stats.totalSensors}</p>
            </div>
          </div>
          <div className={`${styles.dispositivosAtivos} ${styles.card}`}>
            <div className={styles.icon}>
              <Wifi size={22} />
            </div>
            <div className={styles.info}>
              <p>Dispositivos ativos</p>
              <p>{stats.ativos}</p>
            </div>
          </div>
        </div>

        {/* Device List Section */}
        <div className={styles.containerDispositivos}>
          <div className={styles.containerHeader}>
            <h1>Dispositivos</h1>
            <div className={styles.containerSearch}>
              <button disabled>
                <Search size={18} />
              </button>
              <input
                type="text"
                placeholder="Pesquise por nome ou MAC Address"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.dispositivos}>
            {loading ? (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>
                Carregando dispositivos...
              </p>
            ) : filteredDispositivos.length > 0 ? (
              filteredDispositivos.map((disp) => (
                <Accordion
                  key={disp.id}
                  dispositivo={disp}
                  onEdit={abrirSidebarEdicao}
                  onDelete={acionarExclusao}
                />
              ))
            ) : (
              <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>
                Nenhum dispositivo encontrado.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Slide-in sidebar form */}
      <NovoDispositivoSidebar
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={carregarDispositivos}
        dispositivoParaEditar={editandoDispositivo}
      />

      {/* Confirmation Modal */}
      <ConfirmacaoModal
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmarExclusao}
        title="Deseja excluir o dispositivo?"
        message="Esta ação irá desvincular o dispositivo permanentemente do painel da fazenda. Deseja prosseguir?"
        confirmText="Excluir"
        cancelText="Cancelar"
        type="delete"
      />
    </div>
  );
}

export default Dispositivos;

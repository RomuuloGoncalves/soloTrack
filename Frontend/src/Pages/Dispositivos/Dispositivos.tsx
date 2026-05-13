import { useTheme } from "../../hooks/useTheme";
import { useState, useMemo } from "react";
import { Sidebar } from "../../components/Sidebar/Sidebar";
import darkLogo from "../../assets/images/Dark-Logo.svg";
import lightLogo from "../../assets/images/Light-logo.svg";
import styles from "./Dispositivos.module.css";
import { Plus, Search, Cpu, Activity, Wifi } from "lucide-react";
import Accordion, { type Dispositivo } from "../../components/Accordion/Accordion";

function Dispositivos() {
  const { theme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Retirar apos a integraçao
  const dispositivosMock: Dispositivo[] = [
  {
    id: 1,
    nome: "Estação Norte",
    mac: "00:1A:C2:7B:00:47",
    status: "online",
    sensores: [
      {
        id: 1,
        nome: "Sensor de Umidade",
        status: "conectado",
        label: "P1",
      },
      {
        id: 2,
        nome: "Sensor de Temperatura",
        status: "erro",
        label: "P2",
      },
    ],
  },
  {
    id: 2,
    nome: "Estação Sul",
    mac: "00:1A:C2:7B:00:99",
    status: "offline",
    sensores: [],
  },
  {
    id: 3,
    nome: "Estação Sul",
    mac: "00:1A:C2:7B:00:99",
    status: "offline",
    sensores: [],
  },
];

  const [dispositivos] = useState(dispositivosMock);
  
  const logo = useMemo(
    () => (theme === "dark" ? darkLogo : lightLogo),
    [theme],
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
            <h1>Relatório</h1>
            <p>
              Consulte o histórico bruto de todas as leituras e exporte laudos.
            </p>
          </div>
          <div className={styles.actions}>
            <button className={styles.addDispositivo}>
              <Plus /> Adicionar novo dispositivo
            </button>
          </div>
        </header>
        <div className={styles.containerCardStats}>
          <div className={`${styles.totalDispositivos} ${styles.card} `}>
            <div className={styles.icon}>
              <Cpu color="#58C411" />
            </div>
            <div className={styles.info}>
              <p>Total de Dispositivos</p>
              <p>X</p>
            </div>
          </div>
          <div className={`${styles.sensoresAtivos} ${styles.card} `}>
            <div className={styles.icon}>
              <Activity color="#2B7FFF" />
            </div>
            <div className={styles.info}>
              <p>Sensores ativos</p>
              <p>X</p>
            </div>
          </div>
          <div className={`${styles.dispositivosAtivos} ${styles.card} `}>
            <div className={styles.icon}>
              <Wifi color="#FE9A00" />
            </div>
            <div className={styles.info}>
              <p>Dispositivos ativos</p>
              <p>X</p>
            </div>
          </div>
        </div>
        <div className={styles.containerDispositivos}>
          <div className={styles.containerHeader}>
            <h1>Dispositivos</h1>
            <div className={styles.containerSearch}>
              <button>
                <Search />
              </button>
              <input type="text" placeholder="Pesquise por um dispositivo" />
            </div>
          </div>
          <div className={styles.dispositivos}>
            {dispositivos.length > 0 ? (
              dispositivos.map((disp) => (
                <Accordion key={disp.id} dispositivo={disp} />
              ))
            ) : (
              <p style={{color: "#244C4E"}}> Nenhum dispositivo encontrado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dispositivos;

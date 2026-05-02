import { useEffect, useRef } from "react";
import styles from "./Accordion.module.css";
import { ChevronDown, Trash2, Pencil } from "lucide-react";

export interface Sensor {
  id: number;
  nome: string;
  status: "conectado" | "erro";
  label: string;
}

export interface Dispositivo {
  id: number;
  nome: string;
  mac: string;
  // status: "online" | "offline";
  status: string;
  sensores?: Sensor[];
}

interface Props {
  dispositivo: Dispositivo;
}

function Accordion({ dispositivo }: Props) {
  const { nome, mac, status, sensores } = dispositivo;

  const detailsRef = useRef<HTMLDetailsElement>(null);

  // Reset da animação de forma mais controlada
  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;

    const handleToggle = () => {
      const content = el.querySelector(`.${styles.expandedContent}`);

      if (el.open && content instanceof HTMLElement) {
        content.classList.remove(styles.resetAnimation);
        void content.offsetWidth;
        content.classList.add(styles.resetAnimation);
      }
    };

    el.addEventListener("toggle", handleToggle);
    return () => el.removeEventListener("toggle", handleToggle);
  }, []);

  return (
    <div className={styles.row}>
      <details ref={detailsRef} className={styles.accordion}>
        <summary>
          <div className={styles.infoHeader}>
            <h3>{nome}</h3>
            <p className={styles.mac}>{mac}</p>
            <p
              className={`${styles.status} ${
                status === "online" ? styles.statusGreen : styles.statusRed
              }`}
            >
              <span className={styles.dot}></span>
              {status === "online" ? "Online" : "Offline"}
            </p>
          </div>

          <div className={styles.arrowIcon}>
            <ChevronDown />
          </div>
        </summary>

        <div className={`${styles.expandedContent} ${styles.resetAnimation}`}>
          <div className={styles.divider}></div>

          <div className={styles.sensorList}>
            {sensores?.length ? (
              sensores.map((sensor) => (
                <div key={sensor.id} className={styles.sensorItem}>
                  <div
                    className={`${styles.sensorBadge} ${
                      sensor.status === "conectado"
                        ? styles.badgeGreen
                        : styles.badgeRed
                    }`}
                  >
                    {sensor.label}
                  </div>

                  <div className={styles.sensorInfo}>
                    <h4>{sensor.nome}</h4>

                    <p
                      className={`${styles.status} ${
                        sensor.status === "conectado"
                          ? styles.statusGreen
                          : styles.statusRed
                      }`}
                    >
                      <span className={styles.dot}></span>
                      {sensor.status === "conectado"
                        ? "Coletando dados"
                        : "Erro ao coletar dados"}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noSensors}>
                Nenhum sensor encontrado para este dispositivo.
              </p>
            )}
          </div>
        </div>
      </details>

      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.btnDelete}`}>
          <Trash2 />
        </button>

        <button className={`${styles.btn} ${styles.btnEdit}`}>
          <Pencil />
        </button>
      </div>
    </div>
  );
}

export default Accordion;

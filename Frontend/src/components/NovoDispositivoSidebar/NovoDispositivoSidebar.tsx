import { useState, useEffect } from 'react';
import styles from './NovoDispositivoSidebar.module.css';
import equipamentoService from '../../services/equipamentoService';
import type { Dispositivo } from '../Accordion/Accordion';
import { useToast } from '../../contexts/ToastContext';

interface NovoDispositivoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dispositivoParaEditar?: Dispositivo | null;
}

type Erros = Record<string, string>;

export function NovoDispositivoSidebar({
  isOpen,
  onClose,
  onSuccess,
  dispositivoParaEditar,
}: NovoDispositivoSidebarProps) {
  const { showToast } = useToast();
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<Erros>({});

  // --- Form fields ---
  const [nome, setNome] = useState('');
  const [macAddress, setMacAddress] = useState('');

  // --- Reset/Populate form ---
  useEffect(() => {
    if (isOpen) {
      if (dispositivoParaEditar) {
        setNome(dispositivoParaEditar.nome || '');
        setMacAddress(dispositivoParaEditar.mac || '');
      } else {
        setNome('');
        setMacAddress('');
      }
      setErros({});
    }
  }, [isOpen, dispositivoParaEditar]);

  if (!isOpen) return null;

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

  // Auto-format MAC address as XX:XX:XX:XX:XX:XX while typing
  function handleMacChange(value: string) {
    const cleanValue = value.replace(/[^a-fA-F0-9]/g, '').slice(0, 12).toUpperCase();
    const formattedMac = cleanValue.match(/.{1,2}/g)?.join(':') || cleanValue;
    setMacAddress(formattedMac);
    setErros((prev) => ({ ...prev, mac_address: '' }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErros({});
    setSalvando(true);

    try {
      const payload = {
        nome_apelido: nome,
        mac_address: macAddress,
      };

      if (dispositivoParaEditar) {
        await equipamentoService.atualizar(dispositivoParaEditar.id, payload);
        showToast('Dispositivo atualizado com sucesso!', 'success');
      } else {
        await equipamentoService.criar(payload);
        showToast('Dispositivo criado com sucesso!', 'success');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErros(extrairErros(error));
        showToast('Corrija os erros no formulário.', 'error');
      } else {
        showToast(error.response?.data?.message || 'Erro ao salvar dispositivo.', 'error');
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.sidebarOverlay} onClick={onClose}>
      <div className={styles.sidebarContainer} onClick={(e) => e.stopPropagation()}>
        
        <div className={styles.sidebarHeader}>
          <div className={styles.headerText}>
            <h2 className={styles.sidebarTitle}>
              {dispositivoParaEditar ? 'Editar Dispositivo' : 'Novo Dispositivo'}
            </h2>
            <p className={styles.sidebarSubtitle}>
              {dispositivoParaEditar
                ? 'Atualize o apelido ou endereço MAC do dispositivo.'
                : 'Cadastre um novo hardware IoT na plataforma informando o endereço físico.'}
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div className={styles.sidebarBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="nome">Nome/Apelido do Dispositivo</label>
              <input
                id="nome"
                type="text"
                className={`${styles.formInput} ${erros.nome_apelido ? styles.inputError : ''}`}
                placeholder="Ex: Estufa Norte, Canteiro Lateral..."
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value);
                  setErros((prev) => ({ ...prev, nome_apelido: '' }));
                }}
              />
              {erros.nome_apelido && (
                <span className={styles.fieldError}>{erros.nome_apelido}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="mac">Endereço MAC Address</label>
              <input
                id="mac"
                type="text"
                className={`${styles.formInput} ${erros.mac_address ? styles.inputError : ''}`}
                placeholder="Ex: 00:1A:C2:7B:00:47"
                value={macAddress}
                onChange={(e) => handleMacChange(e.target.value)}
              />
              {erros.mac_address && (
                <span className={styles.fieldError}>{erros.mac_address}</span>
              )}
              <span style={{ fontSize: '11px', color: 'var(--sidebar-text-secondary)', textAlign: 'left' }}>
                Endereço de hardware físico único (12 caracteres hexadecimais).
              </span>
            </div>
          </div>

          <div className={styles.sidebarFooter}>
            <button type="submit" className={styles.btnPrimary} disabled={salvando}>
              {salvando ? 'Salvando...' : dispositivoParaEditar ? 'Atualizar Dispositivo' : 'Criar Dispositivo'}
            </button>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

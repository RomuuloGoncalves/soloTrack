import { useState, useEffect } from 'react';
import { LogOut, Sun, Monitor, Moon, X } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAutenticacao } from '../../contexts/ContextoAuth';
import { useToast } from '../../contexts/ToastContext';
import usuarioService from '../../services/usuarioService';
import styles from './ConfiguracaoModal.module.css';

interface ConfiguracaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfiguracaoModal({ isOpen, onClose }: ConfiguracaoModalProps) {
  const { theme, setTheme } = useTheme();
  const { usuario, sair, atualizarDadosUsuario } = useAutenticacao();
  const { showToast } = useToast();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (isOpen && usuario) {
      setNome(usuario.nome ?? '');
      setEmail(usuario.email ?? '');
      setSenha('');
      setConfirmarSenha('');
      setErros({});
    }
  }, [isOpen, usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.id) return;

    setErros({});
    setCarregando(true);

    const payload: Record<string, string> = {};

    if (nome !== usuario.nome) payload.nome = nome;
    if (email !== usuario.email) payload.email = email;
    if (senha) {
      payload.password = senha;
      payload.password_confirmation = confirmarSenha;
    }

    if (Object.keys(payload).length === 0) {
      showToast('Nenhuma alteração detectada.', 'error');
      setCarregando(false);
      return;
    }

    try {
      const resposta = await usuarioService.atualizar(usuario.id, payload);
      atualizarDadosUsuario(resposta.data.data);
      showToast(resposta.data.message, 'success');
      setSenha('');
      setConfirmarSenha('');
    } catch (erro: any) {
      if (erro.response?.status === 422) {
        setErros(erro.response.data.errors ?? {});
        showToast('Corrija os erros no formulário.', 'error');
      } else {
        const msg = erro.response?.data?.message || 'Erro ao atualizar dados.';
        showToast(msg, 'error');
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleCancelar = () => {
    if (usuario) {
      setNome(usuario.nome ?? '');
      setEmail(usuario.email ?? '');
    }
    setSenha('');
    setConfirmarSenha('');
    setErros({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={22} />
        </button>

        <h1 className={styles.title}>Configurações</h1>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Geral</h2>
          <div className={styles.card}>
            <label className={styles.label}>Aparência</label>
            <div className={styles.themeSwitcher}>
              <button
                className={`${styles.themeBtn} ${theme === 'light' ? styles.active : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={18} /> Claro
              </button>
              <button
                className={`${styles.themeBtn} ${theme === 'system' ? styles.active : ''}`}
                onClick={() => setTheme('system')}
              >
                <Monitor size={18} /> Sistema
              </button>
              <button
                className={`${styles.themeBtn} ${theme === 'dark' ? styles.active : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={18} /> Escuro
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Conta</h2>
          <div className={styles.card}>
            <form onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label>Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                />
                {erros.nome && <span className={styles.erroMsg}>{erros.nome[0]}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                />
                {erros.email && <span className={styles.erroMsg}>{erros.email[0]}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>Nova senha <span className={styles.opcional}>(opcional)</span></label>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                />
                {erros.password && <span className={styles.erroMsg}>{erros.password[0]}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label>Confirmar nova senha</label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Confirme a nova senha"
                  disabled={!senha}
                />
              </div>

              <div className={styles.actionButtons}>
                <button type="submit" className={styles.confirmBtn} disabled={carregando}>
                  {carregando ? 'Salvando...' : 'Confirmar'}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={handleCancelar}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </section>

        <button className={styles.logoutBtn} onClick={sair}>
          <LogOut size={18} /> Sair
        </button>
      </div>
    </div>
  );
}

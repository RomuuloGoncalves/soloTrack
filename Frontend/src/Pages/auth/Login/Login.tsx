import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import style from './Login.module.css';
import usuarioService from '../../../services/usuarioService';
import { useToast } from '../../../contexts/ToastContext';

function Login() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string[];
    password?: string[];
    general?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await usuarioService.login({ email, password });
      const { access_token, usuario, message } = response.data;

      Cookies.set('token', access_token, { expires: 7, path: '/' });
      localStorage.setItem('user', JSON.stringify(usuario));

      showToast(message || 'Login realizado com sucesso!', 'success');
      navigate('/');
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 422) {
          setErrors(data.errors || {});
          showToast('Por favor, corrija os erros no formulário.', 'error');
        } else if (status === 401) {
          const msg = data.message || 'E-mail ou senha inválidos.';
          setErrors({ general: msg });
          showToast(msg, 'error');
        } else {
          const msg = 'Ocorreu um erro inesperado. Tente novamente.';
          setErrors({ general: msg });
          showToast(msg, 'error');
        }
      } else {
        const msg = 'Não foi possível conectar ao servidor.';
        setErrors({ general: msg });
        showToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={style.pageWrapper}>
      <div className={style.mainContent}>
        {/* Top Grid */}
        <div className={style.gridBar}></div>

        <div className={style.container}>
          {/* Esquerda: Formulário de Login */}
          <div className={style.formSection}>
            <div className={style.formContainer}>
              <div className={style.logoContainer}>
                <h1 className={style.titleLogo}>
                  <span className={style.titleGreen}>Solo</span>Track.
                </h1>
              </div>

              <form className={style.form} onSubmit={handleSubmit}>
                <div className={style.inputGroup}>
                  <input
                    type="text"
                    placeholder="Digite o seu email"
                    className={`${style.input} ${errors.email ? style.inputError : ''}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && (
                    <span className={style.errorMessage}>{errors.email[0]}</span>
                  )}
                </div>

                <div className={style.inputGroup}>
                  <input
                    type="password"
                    placeholder="Digite a sua senha"
                    className={`${style.input} ${errors.password ? style.inputError : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.password && (
                    <span className={style.errorMessage}>{errors.password[0]}</span>
                  )}
                </div>

                {errors.general && (
                  <p className={style.errorGeneral}>{errors.general}</p>
                )}

                <button type="submit" className={style.submitButton} disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <p className={style.footerText}>
                Não tem conta? <Link to="/signup" className={style.link}>Crie uma <strong>agora</strong></Link>
              </p>
            </div>
          </div>

          {/* Direita: Imagem */}
          <div className={style.imageSection}>
            <div className={style.heroImage} title="SoloTrack Logo"></div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className={style.gridBarBottom}></div>
      </div>
    </div>
  );
}

export default Login;

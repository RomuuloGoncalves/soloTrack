import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import style from './SignUp.module.css';
import usuarioService from '../../../services/usuarioService';
import { useToast } from '../../../contexts/ToastContext';

function SignUp() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    nome?: string[];
    email?: string[];
    password?: string[];
    password_confirmation?: string[];
    general?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await usuarioService.cadastro({
        nome,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      showToast('Cadastro realizado com sucesso! Faça seu login.', 'success');
      navigate('/login');
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 422) {
          setErrors(data.errors || {});
          showToast('Por favor, corrija os erros no formulário.', 'error');
        } else {
          const msg = data?.message || 'Ocorreu um erro inesperado. Tente novamente.';
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
          {/* Esquerda: Formulário de Cadastro */}
          <div className={style.formSection}>
            <div className={style.formContainer}>
              <div className={style.logoContainer}>
                <h1 className={style.titleLogo}>
                  Bem-vindo ao
                  <span className={style.titleGreen}> Solo</span>Track.
                </h1>
              </div>

              <form className={style.form} onSubmit={handleSubmit}>
                <div className={style.inputGroup}>
                  <input
                    type="text"
                    placeholder="Digite seu nome completo"
                    className={`${style.input} ${errors.nome ? style.inputError : ''}`}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                  />
                  {errors.nome && (
                    <span className={style.errorMessage}>{errors.nome[0]}</span>
                  )}
                </div>

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

                <div className={style.inputGroup}>
                  <input
                    type="password"
                    placeholder="Confirme sua senha"
                    className={`${style.input} ${errors.password_confirmation ? style.inputError : ''}`}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                  />
                  {errors.password_confirmation && (
                    <span className={style.errorMessage}>{errors.password_confirmation[0]}</span>
                  )}
                </div>

                {errors.general && (
                  <p className={style.errorGeneral}>{errors.general}</p>
                )}

                <button type="submit" className={style.submitButton} disabled={loading}>
                  {loading ? 'Cadastrando...' : 'Cadastrar-se'}
                </button>
              </form>

              <p className={style.footerText}>
                Já tem conta? <Link to="/login" className={style.link}><strong>Entrar.</strong></Link>
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

export default SignUp;

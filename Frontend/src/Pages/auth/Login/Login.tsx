import { Link } from 'react-router-dom';
import style from './Login.module.css';

function Login() {
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

              <form className={style.form}>
                <input type="email" placeholder="Digite o seu email" className={style.input} required/>
                <input type="password" placeholder="Digite a sua senha" className={style.input} required/>

                <button type="submit" className={style.submitButton}>
                  Entrar
                </button>
              </form>

              <p className={style.footerText}>
                Não tem conta? <Link to="/signup" className={style.link}>Crie uma <strong>agora</strong></Link>
              </p>
            </div>
          </div>

          {/* Direita: Imagem (renderizada como background-image dinâmico via CSS vars) */}
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
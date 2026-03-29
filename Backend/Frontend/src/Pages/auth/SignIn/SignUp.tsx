import { Link } from 'react-router-dom';
import style from './SignUp.module.css';

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
                  Bem-vindo ao
                  <span className={style.titleGreen}> Solo</span>Track.
                </h1>
              </div>

              <form className={style.form}>
                <input type="text" placeholder="Digite seu nome completo" className={style.input} required/>
                <input type="email" placeholder="Digite a seu email" className={style.input} required/>
                <input type="password" placeholder="Digite a sua senha" className={style.input} required/>
                <input type="password" placeholder="Confirme sua senha" className={style.input} required/>

                <button type="submit" className={style.submitButton}>
                  Cadastrar-se
                </button>
              </form>

              <p className={style.footerText}>
                Já tem conta? <Link to="/login" className={style.link}><strong>Entrar.</strong></Link>
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
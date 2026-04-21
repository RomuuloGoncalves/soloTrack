import { Link } from 'react-router-dom';
import style from './Home.module.css';

function PublicHome() {
  return (
    <div className={style.pageWrapper}>
      <div className={style.mainContent}>
        {/* Top Grid */}
        <div className={style.gridBar}></div>

        <div className={style.container}>
          {/* Esquerda: Tela Inicial */}
          <div className={style.formSection}>
            <div className={style.formContainer}>
              <div className={style.logoContainer}>
                <h1 className={style.titleLogo}>Transforme <span className={style.titleGreen}>dados </span>do <span className={style.titleGreen}>solo </span>
                em <span className={style.titleGreen}>resultados reais </span>no campo.
                </h1>
              </div>

              <p className={style.MainText}>
                <span className={style.titleGreen}>Monitore </span>a fertilidade, <span className={style.titleGreen}>identifique </span>deficiências nutricionais e <span className={style.titleGreen}>receba insights </span>que ajudam a aumentar a produtividade e <span className={style.titleGreen}>reduzir custos operacionais.</span>
              </p>
              
              <Link to="/login" className={style.submitButton}>
                Entrar
              </Link>
              
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

export default PublicHome;

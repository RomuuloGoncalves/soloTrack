import { Link, Navigate } from 'react-router-dom';
import style from './Home.module.css';
import { useAutenticacao } from '../../../contexts/ContextoAuth';

function PublicHome() {
  const { estaAutenticado } = useAutenticacao();

  if (estaAutenticado) {
    return <Navigate to="/gestaopropriedade" replace />;
  }

  return (
    <div className={style.pageWrapper}>
      <div className={style.mainContent}>
        {/* Top Grid */}
        <div className={style.gridBar}></div>

        <div className={style.container}>
          {/* Esquerda: Textos de Apresentação */}
          <div className={style.secaoTexto}>
            <div className={style.containerTexto}>
              <h1 className={style.tituloApresentacao}>
                Transforme <span className={style.textoVerde}>dados do solo</span> em <span className={style.textoVerde}>resultados reais</span> no campo.
              </h1>
              
              <p className={style.textoApresentacao}>
                <span className={style.textoVerde}>Monitore</span> a fertilidade, <span className={style.textoVerde}>identifique</span> deficiências nutricionais e <span className={style.textoVerde}>receba insights</span> que ajudam a aumentar a produtividade e <span className={style.textoVerde}>reduzir custos operacionais.</span>
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
            <div className={style.heroImage} title="SoloTrack"></div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className={style.gridBarBottom}></div>
      </div>
    </div>
  );
}

export default PublicHome;

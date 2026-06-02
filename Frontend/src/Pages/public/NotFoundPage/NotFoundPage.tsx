import { Link } from 'react-router-dom'
import style from './NotFoundPage.module.css'

function NotFoundPage() {
  return (
    <div className={style.pageWrapper}>
      <div className={style.card}>
        <div className={style.status}>404</div>
        <h1>Pagina não encontrada</h1>
        <p>Desculpe, mas a página que você está procurando não existe ou foi movida.</p>
        <Link to="/" className={style.homeButton}>
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
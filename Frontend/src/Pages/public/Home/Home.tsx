import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import serverService from '../../../services/serverService';

function PublicHome() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await serverService.get<any>('/usuarios');
        
        const fetchedData = response.data;
        const list = Array.isArray(fetchedData) ? fetchedData : (fetchedData?.data || []);
        
        setUsuarios(list);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar usuários');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  return (

    // Depois tem que tirar isso aqui, é só pra ficar facil de navegar
    <div style={{ padding: '40px', fontFamily: 'var(--font-family)' }}>
      <nav style={{ marginBottom: '30px', display: 'flex', gap: '15px' }}>
        <Link to="/login" style={{
          padding: '10px 20px',
          backgroundColor: 'var(--color-secondary)',
          color: 'var(--color-white)',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          Ir para Login
        </Link>
        <Link to="/signup" style={{
          padding: '10px 20px',
          border: '2px solid var(--color-secondary)',
          color: 'var(--color-secondary)',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          Cadastrar-se
        </Link>
      </nav>

      <h1>Usuários Cadastrados</h1>
      
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && (
        <ul style={{ marginTop: '20px' }}>
          {usuarios.map((usuario: any) => (
            <li key={usuario.id} style={{ marginBottom: '10px' }}>
              <strong>{usuario.nome || usuario.name}</strong> - {usuario.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PublicHome;
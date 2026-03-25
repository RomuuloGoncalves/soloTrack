import { useEffect, useState } from 'react';
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
    <div style={{ padding: '20px' }}>
      <h1>Usuários Cadastrados</h1>
      
      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && (
        <ul>
          {usuarios.map((usuario: any) => (
            <li key={usuario.id}>
              <strong>{usuario.nome || usuario.name}</strong> - {usuario.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PublicHome;
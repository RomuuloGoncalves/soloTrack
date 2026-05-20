import { useState, useMemo, useEffect } from 'react';
import { Calendar, Sprout, ArrowUpRight, TrendingUp, Activity } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import styles from './VisaoGeral.module.css';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import lightLogo from '../../assets/images/Light-logo.svg';
import darkLogo from '../../assets/images/Dark-Logo.svg';
import { useTheme } from '../../hooks/useTheme';

import { visaoGeralService } from '../../services/visaoGeralService';
import type { DadoComparacao, DadoEvolucao, FiltroArea, FiltroSensor, KpisDashboard } from '../../services/visaoGeralService';

const DonutProgress = ({ percentage, color }: { percentage: number; color: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="12" />
      <circle 
        cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
        strokeLinecap="round" transform="rotate(-90 50 50)"
      />
    </svg>
  );
};

export function VisaoGeral() {
  const [dataInicio, setDataInicio] = useState('2026-05-01');
  const [dataFim, setDataFim] = useState('2026-05-31');
  const [estufa, setEstufa] = useState('todas'); 
  const [sensor, setSensor] = useState('4'); 
  
  const [dadosComparacao, setDadosComparacao] = useState<DadoComparacao[]>([]);
  const [dadosEvolucao, setDadosEvolucao] = useState<DadoEvolucao[]>([]);
  const [areasDisponiveis, setAreasDisponiveis] = useState<FiltroArea[]>([]);
  const [sensoresDisponiveis, setSensoresDisponiveis] = useState<FiltroSensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [kpis, setKpis] = useState<KpisDashboard>({
    economia_reais: 0,
    economia_percentual: 0,
    score_fertilidade: 0,
    score_percentual: 0
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { theme } = useTheme();
  const logo = useMemo(() => theme === 'dark' ? darkLogo : lightLogo, [theme]);

  useEffect(() => {
    async function carregarFiltros() {
      try {
        const response = await visaoGeralService.obterFiltros();
        setAreasDisponiveis(response.data.areas);
        setSensoresDisponiveis(response.data.sensores);
      } catch (error) {
        console.error("Erro ao carregar os filtros:", error);
      }
    }
    carregarFiltros();
  }, []);

  useEffect(() => {
    async function carregarDashboard() {
      setIsLoading(true);
      try {
        const response = await visaoGeralService.obterDados({
          area_id: estufa,
          equipamento_id: 1,
          data_inicio: dataInicio,
          data_fim: dataFim,
          sensor_id: Number(sensor)
        });

        setDadosComparacao(response.data.dadosComparacao);
        setDadosEvolucao(response.data.dadosEvolucao);
        setKpis(response.data.kpis);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    carregarDashboard();
  }, [estufa, sensor, dataInicio, dataFim]);

  return (
    <div className={styles.pageLayout}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onOpen={() => setIsSidebarOpen(true)}
        logo={logo} 
      />
      <div className={styles.mainContent}>
        
        {/* ================= FILTROS ================= */}
        <div className={styles.filtersRow}>
          <div className={styles.filterSelect}>
            <Calendar size={18} color="#94A3B8" />
            <select 
              value={dataInicio} 
              onChange={(e) => setDataInicio(e.target.value)} 
              style={{border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', color: 'inherit'}}
            >
              <option value="2026-01-01">Janeiro de 2026 (Início)</option>
              <option value="2026-02-01">Fevereiro de 2026 (Início)</option>
              <option value="2026-03-01">Março de 2026 (Início)</option>
              <option value="2026-04-01">Abril de 2026 (Início)</option>
              <option value="2026-05-01">Maio de 2026 (Início)</option>
            </select>
          </div>
          
          <span className={styles.filterSeparator}>até</span>

          <div className={styles.filterSelect}>
            <Calendar size={18} color="#94A3B8" />
            <select 
              value={dataFim} 
              onChange={(e) => setDataFim(e.target.value)} 
              style={{border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', color: 'inherit'}}
            >
              <option value="2026-01-31">Janeiro de 2026 (Fim)</option>
              <option value="2026-02-28">Fevereiro de 2026 (Fim)</option>
              <option value="2026-03-31">Março de 2026 (Fim)</option>
              <option value="2026-04-30">Abril de 2026 (Fim)</option>
              <option value="2026-05-31">Maio de 2026 (Fim)</option>
            </select>
          </div>

          <div className={styles.filterSelect}>
            <Activity size={18} color="#94A3B8" />
            <select 
              value={sensor} 
              onChange={(e) => setSensor(e.target.value)} 
              style={{border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', color: 'inherit'}}
            >
              {sensoresDisponiveis.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.grandeza}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterSelect}>
            <Sprout size={18} color="#94A3B8" />
            <select 
              value={estufa} 
              onChange={(e) => setEstufa(e.target.value)} 
              style={{border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', color: 'inherit'}}
            >
              <option value="todas">Todas as Áreas</option>
              {areasDisponiveis.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.nome_area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ================= CARDS DE RESUMO ================= */}
        <div className={styles.summarySection}>
          <h2 className={styles.summaryTitle}>Economia & Score</h2>
          
          <div className={styles.kpiCard}>
            <div className={styles.kpiInfo}>
              <h3><span>R$</span> {kpis.economia_reais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <p>Economizado <span className={styles.kpiColorDot} style={{background: '#134E4A'}}></span></p>
            </div>
            <DonutProgress percentage={kpis.economia_percentual} color="#134E4A" /> 
          </div>

          <div className={styles.kpiCard}>
            <DonutProgress percentage={kpis.score_percentual} color="#22C55E" /> 
            <div className={styles.kpiInfo}>
              <h3>{kpis.score_fertilidade.toFixed(1)}</h3>
              <p>Score Geral de fertilidade</p>
            </div>
          </div>
        </div>

        {/* MENSAGEM DE CARREGAMENTO */}
        {isLoading && <p style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>Carregando dados dos gráficos...</p>}

        {/* ================= GRÁFICO: LINHAS ================= */}
        {!isLoading && (
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <div className={styles.chartTitle}>
                <h3><TrendingUp size={18} /> Evolução dos nutrientes no tempo</h3>
                <p>Período Selecionado</p>
              </div>
              <a href="#" className={styles.linkVerTudo}>Ver tudo <ArrowUpRight size={16} /></a>
            </div>
            
            <div style={{ width: '100%', height: 300, minHeight: 300 }}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dadosEvolucao} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIdeal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#134E4A" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#134E4A" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorReal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#58C411" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#58C411" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="ideal" stroke="#134E4A" strokeWidth={2} fillOpacity={1} fill="url(#colorIdeal)" />
                  <Area type="monotone" dataKey="real" stroke="#58C411" strokeWidth={2} fillOpacity={1} fill="url(#colorReal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ================= GRÁFICO: BARRAS ================= */}
        {!isLoading && (
          <div className={styles.chartContainer}>
            <div className={styles.chartHeader}>
              <div className={styles.chartTitle}>
                <h3><TrendingUp size={18} /> Valor ideal x valor lido</h3>
                <p>Período Selecionado</p>
              </div>
              <a href="#" className={styles.linkVerTudo}>Ver tudo <ArrowUpRight size={16} /></a>
            </div>
            
            <div className={styles.chartLayoutBox}>
              <div className={styles.chartScrollWrapper}>
                <div className={styles.chartInnerArea} style={{ width: '100%', height: 300, minHeight: 300 }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dadosComparacao} margin={{ top: 20, right: 0, left: -20, bottom: 5 }} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                      <XAxis dataKey="name" axisLine={true} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                      <Tooltip cursor={{fill: 'transparent'}} wrapperClassName={styles.customTooltipWrapper} />                    
                      
                      <Bar dataKey="esperado" name="Valor ideal" fill="#254E4A" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="usado" name="Valor lido" fill="#58C411" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={styles.myCustomLegend}>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ backgroundColor: '#254E4A' }}></span>
                  Valor ideal
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ backgroundColor: '#58C411' }}></span>
                  Valor lido
                </div>
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default VisaoGeral;
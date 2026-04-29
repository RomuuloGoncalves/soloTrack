import React, { useState, useMemo } from 'react'; // CORREÇÃO 1: Adicionado useMemo
import { Calendar, Cpu, Sprout, ArrowUpRight, TrendingUp } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import styles from './VisaoGeral.module.css';
import { Sidebar } from '../../Components/Sidebar/Sidebar';
import lightLogo from '../../assets/images/Light-logo.svg';
import darkLogo from '../../assets/images/Dark-Logo.svg';
import { useTheme } from '../../hooks/useTheme';

// --- DADOS MOCKADOS (Depois virão do seu banco de dados) ---
const dadosEvolucao = [
  { name: 'Mon', ideal: 100, real: 57 },
  { name: 'Tue', ideal: 120, real: 300 },
  { name: 'Wed', ideal: 180, real: 240 },
  { name: 'Thu', ideal: 240, real: 570 },
  { name: 'Fri', ideal: 200, real: 210 },
  { name: 'Sat', ideal: 200, real: 215 },
  { name: 'Sun', ideal: 380, real: 180 },
];

const dadosComparacao = [
  { name: 'Mar', ideal: 120, lido: 35 },
  { name: 'Abril', ideal: 120, lido: 150 },
];

// --- COMPONENTE AUXILIAR: Gráfico Circular (Donut) ---
const DonutProgress = ({ percentage, color }: { percentage: number, color: string }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      {/* Círculo de fundo */}
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="12" />
      {/* Círculo de progresso */}
      <circle 
        cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
        strokeLinecap="round" transform="rotate(-90 50 50)"
      />
    </svg>
  );
};

export function VisaoGeral() {
  // Estados para os filtros
  const [dataInicio, setDataInicio] = useState('Março de 2026');
  const [dataFim, setDataFim] = useState('Março de 2026');
  const [equipamento, setEquipamento] = useState('ESP32');
  const [estufa, setEstufa] = useState('Estufa 1');
  
  // CORREÇÃO 2: Criado o estado para controlar a abertura da Sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // CORREÇÃO 3: Declarada a variável theme (substitua pelo seu hook de tema se existir)
  const { theme } = useTheme();
  const logo = useMemo(() => theme === 'dark' ? darkLogo : lightLogo, [theme]);
  
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
            <select value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', color: 'inherit'}}>
              <option>Março de 2026</option>
              <option>Abril de 2026</option>
            </select>
          </div>
          
          <span className={styles.filterSeparator}>até</span>

          <div className={styles.filterSelect}>
            <Calendar size={18} color="#94A3B8" />
            <select value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', color: 'inherit'}}>
              <option>Março de 2026</option>
              <option>Abril de 2026</option>
            </select>
          </div>

          <div className={styles.filterSelect}>
            <Cpu size={18} color="#94A3B8" />
            <select value={equipamento} onChange={(e) => setEquipamento(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', color: 'inherit'}}>
              <option>ESP32</option>
              <option>Raspberry</option>
            </select>
          </div>

          <div className={styles.filterSelect}>
            <Sprout size={18} color="#94A3B8" />
            <select value={estufa} onChange={(e) => setEstufa(e.target.value)} style={{border: 'none', background: 'transparent', outline: 'none', cursor: 'pointer', color: 'inherit'}}>
              <option>Estufa 1</option>
              <option>Campo Aberto</option>
            </select>
          </div>
        </div>

        {/* ================= CARDS DE RESUMO ================= */}
        <div className={styles.summarySection}>
          <h2 className={styles.summaryTitle}>Economia & Score</h2>
          
          <div className={styles.kpiCard}>
            <div className={styles.kpiInfo}>
              <h3><span>R$</span> 2,000</h3>
              <p>Economizado <span className={styles.kpiColorDot} style={{background: '#134E4A'}}></span></p>
            </div>
            <DonutProgress percentage={65} color="#134E4A" /> {/* Verde escuro */}
          </div>

          <div className={styles.kpiCard}>
            <DonutProgress percentage={95} color="#22C55E" /> {/* Verde claro */}
            <div className={styles.kpiInfo}>
              <h3>9.5</h3>
              <p>Score Geral de fertilidade</p>
            </div>
          </div>
        </div>

        {/* ================= GRÁFICO: LINHAS ================= */}
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <h3><TrendingUp size={18} /> Evolução dos nutrientes no tempo</h3>
              <p>Março 1, 2026 - Março 31, 2026</p>
            </div>
            <a href="#" className={styles.linkVerTudo}>Ver tudo <ArrowUpRight size={16} /></a>
          </div>
          
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
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

        {/* ================= GRÁFICO: BARRAS ================= */}
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <h3><TrendingUp size={18} /> Valor ideal x valor lido</h3>
              <p>Março 1, 2026 - Março 31, 2026</p>
            </div>
            <a href="#" className={styles.linkVerTudo}>Ver tudo <ArrowUpRight size={16} /></a>
          </div>
          
          <div className={styles.chartLayoutBox}>
            {/* O Gráfico (Sem a tag Legend) */}
            <div className={styles.chartScrollWrapper}>
              <div className={styles.chartInnerArea}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosComparacao} margin={{ top: 20, right: 0, left: -20, bottom: 5 }} barSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                    <XAxis dataKey="name" axisLine={true} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-secondary)', fontSize: 12}} />
                    <Tooltip cursor={{fill: 'transparent'}} wrapperClassName={styles.customTooltipWrapper}
                  />                    
                    <Bar dataKey="ideal" name="Valor ideal" fill="#254E4A" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="lido" name="Valor lido" fill="#58C411" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SUA LEGENDA CUSTOMIZADA (100% controlável por CSS) */}
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

      </div>
    </div>
  );
} 

export default VisaoGeral;
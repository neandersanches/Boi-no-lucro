
import React, { useState, useEffect, useMemo } from 'react';
import { ScenarioType, FarmInputs, ProjectionData } from './types';
import { SCENARIO_DEFAULTS, KILOS_POR_ARROBA_BRUTA, KILOS_POR_ARROBA_CARNE, PERIODOS } from './constants';
import { getAiAnalysis } from './services/geminiService';

const InputField: React.FC<{
  label: string;
  id: string;
  value: string;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
  suffix?: string;
  placeholder?: string;
  highlight?: boolean;
}> = ({ label, id, value, onChange, icon, suffix, placeholder, highlight }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium text-slate-600 dark:text-slate-400">{label}</label>
    <div className={`relative flex items-center rounded-xl border transition-all ${
      highlight 
        ? 'border-emerald-300 ring-2 ring-emerald-50 dark:ring-emerald-900/20 dark:border-emerald-700' 
        : 'border-slate-300 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700'
    } focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500`}>
      {icon && <div className="pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">{icon}</div>}
      <input
        type="number"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent px-3 py-2.5 text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium ${!icon ? 'pl-4' : ''}`}
        placeholder={placeholder}
      />
      {suffix && <span className="pr-3 text-slate-400 dark:text-slate-500 font-semibold text-xs select-none">{suffix}</span>}
    </div>
  </div>
);

const ResultCard: React.FC<{ label: string; value: string; color?: string; highlight?: boolean }> = ({ label, value, color = "blue", highlight }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300",
    amber: "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-900 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300",
  };
  
  return (
    <div className={`rounded-xl p-4 border transition-all ${highlight ? 'ring-2 ring-blue-500 scale-105' : ''} ${colorClasses[color as keyof typeof colorClasses]} shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-xl font-bold truncate">{value}</p>
    </div>
  );
};

const ProfitabilityChart: React.FC<{ data: ProjectionData[] }> = ({ data }) => {
  const maxVal = Math.max(...data.map(d => Math.abs(d.rentabilidadeMensal)), 5);
  
  return (
    <div className="bg-white dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm mt-8">
      <h3 className="text-lg font-black text-blue-900 dark:text-blue-400 mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-emerald-500 rounded-full"></span> 
        Tendência de Rentabilidade Mensal
      </h3>
      <div className="relative h-[240px] w-full flex items-end justify-between gap-1 sm:gap-2 pt-10">
        <div className="absolute left-0 right-0 border-t border-slate-100 dark:border-slate-700" style={{ bottom: '50%' }}></div>
        
        {data.map((d, i) => {
          const heightPercent = (Math.abs(d.rentabilidadeMensal) / maxVal) * 50;
          const isPositive = d.rentabilidadeMensal >= 0;
          
          return (
            <div key={d.dias} className="flex-1 flex flex-col items-center group relative h-full">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap font-bold">
                {d.rentabilidadeMensal.toFixed(2)}% ao mês
              </div>
              
              <div className="flex-1 w-full flex items-center justify-center relative">
                <div 
                  className={`w-full max-w-[32px] rounded-sm transition-all duration-500 ${
                    isPositive 
                      ? 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500' 
                      : 'bg-red-400 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400'
                  }`}
                  style={{ 
                    height: `${heightPercent}%`,
                    position: 'absolute',
                    bottom: isPositive ? '50%' : 'auto',
                    top: isPositive ? 'auto' : '50%'
                  }}
                />
              </div>
              
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-2 rotate-[-45px] sm:rotate-0 whitespace-nowrap">
                {d.dias}d
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-8 flex justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Rentável
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-400 rounded-sm"></div> Prejuízo
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [activeScenario, setActiveScenario] = useState<ScenarioType | null>(() => {
    const saved = localStorage.getItem('lastActiveScenario');
    return (saved as ScenarioType) || null;
  });

  const [inputs, setInputs] = useState<FarmInputs>(() => {
    const savedScenario = localStorage.getItem('lastActiveScenario');
    if (savedScenario) {
      const savedData = localStorage.getItem(`scenario_data_${savedScenario}`);
      if (savedData) return JSON.parse(savedData);
    }
    return SCENARIO_DEFAULTS.novilha;
  });

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (activeScenario) {
      localStorage.setItem('lastActiveScenario', activeScenario);
      localStorage.setItem(`scenario_data_${activeScenario}`, JSON.stringify(inputs));
    }
  }, [inputs, activeScenario]);

  const handleScenarioChange = (scenario: ScenarioType) => {
    setActiveScenario(scenario);
    const savedData = localStorage.getItem(`scenario_data_${scenario}`);
    if (savedData) {
      setInputs(JSON.parse(savedData));
    } else {
      setInputs(SCENARIO_DEFAULTS[scenario]);
    }
    setAiInsight(null);
  };

  const handleInputChange = (field: keyof FarmInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const clearFields = () => {
    setInputs({
      preco: '', peso: '', comissao: '', frete: '', castracao: '',
      gastoDiario: '', gmd: '', rendimentoCarcaca: '', precoVendaArroba: ''
    });
    setActiveScenario(null);
    localStorage.removeItem('lastActiveScenario');
    setAiInsight(null);
  };

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const results = useMemo(() => {
    const pBase = parseFloat(inputs.preco) || 0;
    const pInicial = parseFloat(inputs.peso) || 0;
    const comm = parseFloat(inputs.comissao) || 0;
    const fr = parseFloat(inputs.frete) || 0;
    const cast = parseFloat(inputs.castracao) || 0;
    const gDiario = parseFloat(inputs.gastoDiario) || 0;
    const gmdVal = parseFloat(inputs.gmd) || 0;
    const rend = parseFloat(inputs.rendimentoCarcaca) || 50;
    const pVendaAt = parseFloat(inputs.precoVendaArroba) || 0;

    const arrobasBrutas = pInicial > 0 ? pInicial / KILOS_POR_ARROBA_BRUTA : 0;
    const precoArrobaBase = arrobasBrutas > 0 ? pBase / arrobasBrutas : 0;
    const custoTotalAquisicao = pBase + (pBase * (comm / 100)) + fr + cast;
    const custoPorArrobaAquisicao = arrobasBrutas > 0 ? custoTotalAquisicao / arrobasBrutas : 0;
    const custoPorKgAquisicao = pInicial > 0 ? custoTotalAquisicao / pInicial : 0;

    const projections: ProjectionData[] = PERIODOS.map(dias => {
      const meses = dias / 30;
      const pesoFinal = pInicial + (gmdVal * dias);
      const arrobasCarneLiquidaTotal = (pesoFinal * (rend / 100)) / KILOS_POR_ARROBA_CARNE;
      const custoManutencao = gDiario * dias;
      const pesoGanho = pesoFinal - pInicial;
      const arrobasProduzidasNoPeriodo = (pesoGanho * (rend / 100)) / KILOS_POR_ARROBA_CARNE;
      const custoPorArrobaProduzida = arrobasProduzidasNoPeriodo > 0 ? custoManutencao / arrobasProduzidasNoPeriodo : 0;
      const custoTotalPeriodo = custoTotalAquisicao + custoManutencao;
      const receitaTotal = arrobasCarneLiquidaTotal * pVendaAt;
      const lucroPrejuizo = receitaTotal - custoTotalPeriodo;
      const roi = custoTotalPeriodo > 0 ? (lucroPrejuizo / custoTotalPeriodo) * 100 : 0;
      const rentabilidadeMensal = meses > 0 ? roi / meses : 0;

      return {
        dias, pesoFinal, arrobasCarneLiquidaTotal, custoPorArrobaProduzida,
        custoTotalPeriodo, receitaTotal, lucroPrejuizo, rentabilidadeMensal
      };
    });

    const bestProjection = projections.reduce((prev, current) => 
      (prev.rentabilidadeMensal > current.rentabilidadeMensal) ? prev : current
    );

    return {
      arrobasBrutas,
      precoArrobaBase,
      custoTotalAquisicao,
      custoPorArrobaAquisicao,
      custoPorKgAquisicao,
      projections,
      bestProjection
    };
  }, [inputs]);

  const handleAiConsult = async () => {
    if (!inputs.preco || !inputs.peso) return;
    setIsAiLoading(true);
    const insight = await getAiAnalysis(inputs, results.bestProjection);
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-colors duration-300 ${isDarkMode ? 'bg-slate-900' : ''}`}>
      <div className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-colors">
        
        {/* Header Section */}
        <div className="p-8 pb-4 relative">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-blue-900 dark:text-blue-500 tracking-tight flex items-center justify-center gap-3">
              <span>🐮</span> Boi no Lucro
            </h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
              Descubra se a compra é viável: simples, rápido e direto ao ponto.
            </p>
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="px-8 pb-8">
          <div className="flex flex-wrap justify-center gap-3 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto">
            <button onClick={() => handleScenarioChange('novilha')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeScenario === 'novilha' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>Cenário: Novilha</button>
            <button onClick={() => handleScenarioChange('boi_magro')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeScenario === 'boi_magro' ? 'bg-sky-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>Cenário: Boi Magro</button>
            <button onClick={() => handleScenarioChange('vaca_magra')} className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeScenario === 'vaca_magra' ? 'bg-cyan-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'}`}>Cenário: Vaca Magra</button>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-8 pt-0 grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Inputs Column */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <InputField label="Preço Base (R$)" id="preco" value={inputs.preco} placeholder="0,00" onChange={(v) => handleInputChange('preco', v)} icon={<span className="text-sm font-bold">$</span>} />
            <InputField label="Peso Inicial (kg)" id="peso" value={inputs.peso} placeholder="0" onChange={(v) => handleInputChange('peso', v)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>} />
            <InputField label="Comissão (%)" id="comissao" value={inputs.comissao} placeholder="0" onChange={(v) => handleInputChange('comissao', v)} suffix="%" />
            <InputField label="Frete (R$)" id="frete" value={inputs.frete} placeholder="0,00" onChange={(v) => handleInputChange('frete', v)} icon={<span className="text-sm font-bold">$</span>} />
            <InputField label="Castração (R$)" id="castracao" value={inputs.castracao} placeholder="0,00" onChange={(v) => handleInputChange('castracao', v)} icon={<span className="text-sm font-bold">$</span>} />
            <InputField label="Gasto Diário (R$)" id="gastoDiario" value={inputs.gastoDiario} placeholder="0,00" onChange={(v) => handleInputChange('gastoDiario', v)} icon={<span className="text-sm font-bold">$</span>} />
            <InputField label="GMD (Ganho)" id="gmd" value={inputs.gmd} placeholder="0.0" onChange={(v) => handleInputChange('gmd', v)} suffix="kg" />
            <InputField label="Preço Venda @ (R$)" id="precoVendaArroba" value={inputs.precoVendaArroba} placeholder="0,00" onChange={(v) => handleInputChange('precoVendaArroba', v)} icon={<span className="text-sm font-bold">$</span>} highlight />
            <div className="lg:col-span-4">
              <InputField label="Rendimento Carcaça (%)" id="rendimentoCarcaca" value={inputs.rendimentoCarcaca} placeholder="54" onChange={(v) => handleInputChange('rendimentoCarcaca', v)} suffix="%" />
            </div>
          </div>

          {/* AI and Controls Bar */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row items-center gap-4 py-6 border-t border-slate-100 dark:border-slate-800">
            <button onClick={handleAiConsult} disabled={isAiLoading || !inputs.preco} className={`flex-1 w-full sm:w-auto flex items-center justify-center gap-3 py-3.5 px-8 rounded-2xl font-extrabold transition-all shadow-xl ${isAiLoading ? 'bg-slate-200 dark:bg-slate-800 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100 dark:shadow-none active:scale-[0.98]'}`}>
              {isAiLoading ? <span className="animate-pulse">Consultando Especialista IA...</span> : <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Parecer de análise do especialista</>}
            </button>
            <button onClick={clearFields} className="w-full sm:w-auto px-8 py-3.5 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all">Limpar Campos</button>
          </div>

          {/* AI Insight Insight */}
          {aiInsight && (
            <div className="lg:col-span-4 bg-emerald-900 dark:bg-emerald-950 text-emerald-50 p-6 rounded-3xl shadow-2xl border-l-8 border-emerald-400 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="flex items-start gap-4">
                 <div className="bg-emerald-400/20 p-2.5 rounded-xl"><svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg></div>
                 <div>
                   <h3 className="font-black text-lg mb-1 tracking-tight">Estratégia Recomendada</h3>
                   <p className="text-emerald-100/90 leading-relaxed italic text-sm">"{aiInsight}"</p>
                 </div>
               </div>
            </div>
          )}

          {/* Acquisition and Best Sale Dashboard */}
          <div className="lg:col-span-4 grid grid-cols-1 xl:grid-cols-6 gap-8">
            <div className="xl:col-span-4">
              <h2 className="text-xl font-black text-blue-900 dark:text-blue-500 mb-5 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full"></span> Resultados de Aquisição
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <ResultCard label="Qtde. Arrobas" value={`${results.arrobasBrutas.toFixed(2)} @`} />
                <ResultCard label="Preço @ (Base)" value={formatCurrency(results.precoArrobaBase)} />
                <ResultCard label="Custo Aquisição" value={formatCurrency(results.custoTotalAquisicao)} color="amber" />
                <ResultCard label="Custo @ Aquisição" value={formatCurrency(results.custoPorArrobaAquisicao)} />
                <ResultCard label="Custo Kg Aquisição" value={formatCurrency(results.custoPorKgAquisicao)} />
              </div>
            </div>

            <div className="xl:col-span-2">
              <h2 className="text-xl font-black text-indigo-900 dark:text-indigo-400 mb-5 flex items-center gap-2">
                <span className="w-2 h-6 bg-indigo-500 rounded-full"></span> Melhor Prazo p/ Venda
              </h2>
              <ResultCard 
                label="Recomendação" 
                value={`${results.bestProjection.dias} dias`} 
                color="indigo" 
                highlight 
              />
              <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center">
                Pico de Rentabilidade Mensal: {results.bestProjection.rentabilidadeMensal.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="lg:col-span-4">
            <ProfitabilityChart data={results.projections} />
          </div>

          {/* Projections Table */}
          <div className="lg:col-span-4 mt-4">
            <h2 className="text-xl font-black text-blue-900 dark:text-blue-500 mb-5 flex items-center gap-2">
              <span className="w-2 h-6 bg-sky-500 rounded-full"></span> Projeções de Engorda e Rentabilidade
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <table className="min-w-full text-left">
                <thead className="bg-blue-50 dark:bg-blue-900/30">
                  <tr>
                    <th className="px-5 py-4 text-[10px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest">Período</th>
                    <th className="px-5 py-4 text-[10px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest text-right">Peso Final</th>
                    <th className="px-5 py-4 text-[10px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest text-right">Carne Líquida (@)</th>
                    <th className="px-5 py-4 text-[10px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest text-right">Custo p/ @ Prod.</th>
                    <th className="px-5 py-4 text-[10px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest text-right">Custo Total</th>
                    <th className="px-5 py-4 text-[10px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest text-right">Lucro/Prejuízo</th>
                    <th className="px-5 py-4 text-[10px] font-black text-blue-800 dark:text-blue-400 uppercase tracking-widest text-right">Rent. Mensal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/50 transition-colors">
                  {results.projections.map((p) => (
                    <tr key={p.dias} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${p.dias === results.bestProjection.dias ? 'bg-indigo-50 dark:bg-indigo-900/20 font-bold' : 'even:bg-slate-50/30 dark:even:bg-slate-800/20'}`}>
                      <td className="px-5 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {p.dias} dias {p.dias === results.bestProjection.dias && '⭐'}
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-400 tabular-nums">{p.pesoFinal.toFixed(1)} kg</td>
                      <td className="px-5 py-4 text-right text-sm font-bold text-blue-700 dark:text-blue-400 tabular-nums">{p.arrobasCarneLiquidaTotal.toFixed(2)} @</td>
                      <td className="px-5 py-4 text-right text-sm text-red-600 dark:text-red-400 font-bold tabular-nums">{formatCurrency(p.custoPorArrobaProduzida)}</td>
                      <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800 dark:text-slate-300 tabular-nums">{formatCurrency(p.custoTotalPeriodo)}</td>
                      <td className={`px-5 py-4 text-right text-sm font-black tabular-nums ${p.lucroPrejuizo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatCurrency(p.lucroPrejuizo)}
                      </td>
                      <td className={`px-5 py-4 text-right text-sm font-black tabular-nums ${p.rentabilidadeMensal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {p.rentabilidadeMensal.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Branding */}
      <footer className="mt-8 text-center text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest">
        &copy; 2025 Boi no Lucro - Gestão Inteligente de Pecuária
      </footer>
    </div>
  );
}


export type ScenarioType = 'novilha' | 'boi_magro' | 'vaca_magra';

export interface FarmInputs {
  preco: string;
  peso: string;
  comissao: string;
  frete: string;
  castracao: string;
  gastoDiario: string;
  gmd: string;
  rendimentoCarcaca: string;
  precoVendaArroba: string;
}

export interface ProjectionData {
  dias: number;
  pesoFinal: number;
  arrobasCarneLiquidaTotal: number;
  custoPorArrobaProduzida: number;
  custoTotalPeriodo: number;
  receitaTotal: number;
  lucroPrejuizo: number;
  rentabilidadeMensal: number;
}

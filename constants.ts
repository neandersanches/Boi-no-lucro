
import { ScenarioType, FarmInputs } from './types';

export const KILOS_POR_ARROBA_BRUTA = 30;
export const KILOS_POR_ARROBA_CARNE = 15;
export const PERIODOS = [60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];

export const SCENARIO_DEFAULTS: Record<ScenarioType, FarmInputs> = {
  novilha: {
    preco: '',
    peso: '300',
    gmd: '0.5',
    precoVendaArroba: '280',
    gastoDiario: '2.5',
    comissao: '3',
    frete: '65',
    castracao: '0',
    rendimentoCarcaca: '50'
  },
  boi_magro: {
    preco: '',
    peso: '390',
    gmd: '0.5',
    precoVendaArroba: '290',
    gastoDiario: '2.5',
    comissao: '3',
    frete: '65',
    castracao: '50',
    rendimentoCarcaca: '54'
  },
  vaca_magra: {
    preco: '',
    peso: '330',
    gmd: '0.5',
    precoVendaArroba: '280',
    gastoDiario: '2.5',
    comissao: '3',
    frete: '65',
    castracao: '0',
    rendimentoCarcaca: '47'
  }
};


import { GoogleGenAI, Type } from "@google/genai";
import { FarmInputs, ProjectionData } from "../types";

export const getAiAnalysis = async (inputs: FarmInputs, bestProjection: ProjectionData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Como um consultor especialista em pecuária de corte do aplicativo "Boi no Lucro", analise os seguintes dados:
    
    DADOS DE AQUISIÇÃO:
    - Preço Base: R$ ${inputs.preco}
    - Peso Inicial: ${inputs.peso} kg
    - GMD (Ganho Médio Diário): ${inputs.gmd} kg
    
    MELHOR PROJEÇÃO (em ${bestProjection.dias} dias):
    - Lucro Total: R$ ${bestProjection.lucroPrejuizo.toFixed(2)}
    - Rentabilidade Mensal: ${bestProjection.rentabilidadeMensal.toFixed(2)}%
    - Custo por @ Produzida: R$ ${bestProjection.custoPorArrobaProduzida.toFixed(2)}
    
    Forneça uma análise curta (máximo 150 palavras) em Português do Brasil sobre a viabilidade deste negócio, riscos e uma recomendação estratégica baseada no melhor prazo de venda identificado.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Não foi possível gerar a análise no momento. Verifique sua conexão.";
  }
};

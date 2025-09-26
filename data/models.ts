export interface ModelInfo {
  title: string;
  description: string;
  experiment: string;
  limitations: string;
}

export const MODEL_DATA: Record<string, ModelInfo> = {
  dalton: {
    title: "Modelo de Dalton (1803)",
    description: "John Dalton propôs que a matéria é composta por átomos, que imaginou como esferas maciças, indivisíveis e indestrutíveis.",
    experiment: "Baseado em leis ponderais e proporções de reações químicas, não em um único experimento definitivo.",
    limitations: "Não explicava a natureza elétrica da matéria, a existência de partículas subatômicas ou por que os átomos se combinavam."
  },
  thomson: {
    title: "Modelo de Thomson (1897)",
    description: "Após a descoberta do elétron, J.J. Thomson propôs o modelo do 'pudim de passas', onde o átomo seria uma esfera de carga positiva com elétrons de carga negativa incrustados.",
    experiment: "Experimentos com tubos de raios catódicos, que levaram à descoberta do elétron e à medição de sua relação carga/massa.",
    limitations: "Não explicava a estabilidade do átomo nem a distribuição da carga positiva, que se provou não ser difusa."
  },
  rutherford: {
    title: "Modelo de Rutherford (1911)",
    description: "O modelo planetário de Ernest Rutherford descreve o átomo com um núcleo central muito pequeno, denso e positivo, com elétrons orbitando ao seu redor.",
    experiment: "O famoso 'experimento da folha de ouro', onde partículas alfa foram bombardeadas contra uma fina folha de ouro. A maioria passava direto, mas algumas desviavam drasticamente, indicando um núcleo denso.",
    limitations: "Pela física clássica, um elétron em órbita deveria irradiar energia, colapsando no núcleo em uma fração de segundo, o que não acontece. O modelo não garantia a estabilidade atômica."
  },
  bohr: {
    title: "Modelo de Bohr (1913)",
    description: "Niels Bohr aprimorou o modelo de Rutherford, propondo que os elétrons se movem em órbitas circulares com níveis de energia quantizados e definidos. Um elétron só irradia energia ao saltar de um nível para outro.",
    experiment: "Baseado no espectro de emissão do átomo de hidrogênio, que mostrava linhas discretas em vez de um espectro contínuo, indicando níveis de energia específicos.",
    limitations: "Funcionava perfeitamente apenas para o átomo de hidrogênio e não explicava por que os níveis de energia eram quantizados ou o comportamento de átomos mais complexos."
  },
  sommerfeld: {
    title: "Modelo de Sommerfeld (1916)",
    description: "Arnold Sommerfeld refinou o modelo de Bohr, introduzindo órbitas elípticas e o número quântico azimutal (l), explicando as linhas finas no espectro atômico.",
    experiment: "Análise de espectros de emissão com espectrômetros de alta resolução, que revelaram que as linhas espectrais de Bohr eram, na verdade, compostas por múltiplas linhas mais finas.",
    limitations: "Embora fosse um avanço, ainda era um modelo clássico com correções quânticas e não explicava completamente todos os fenômenos, como o Efeito Zeeman anômalo."
  },
  schrodinger: {
    title: "Modelo de Schrödinger (1926)",
    description: "Erwin Schrödinger descreveu o elétron como uma onda de probabilidade. O modelo não define uma trajetória, mas uma região no espaço (um orbital) onde há a maior probabilidade de encontrar o elétron.",
    experiment: "Baseado na equação de onda de Schrödinger e no princípio da incerteza de Heisenberg. Não é derivado de um único experimento, mas de um formalismo matemático.",
    limitations: "O modelo é matematicamente complexo e não-intuitivo. A visualização de uma 'nuvem' é apenas uma representação da densidade de probabilidade, não uma imagem física do átomo."
  }
};
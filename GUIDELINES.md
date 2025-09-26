
# Diretrizes de Design e Desenvolvimento - Simulador de Modelos Atômicos

## 1. Filosofia do Projeto

Este documento serve como a "Estrela Polar" para o desenvolvimento desta aplicação. Nosso objetivo é criar uma ferramenta educacional de alta qualidade que seja:

- **Educacionalmente Precisa**: Cada modelo atômico deve refletir os principais conceitos propostos em sua época, destacando visualmente as inovações e limitações de cada teoria.
- **Visualmente Atraente**: A estética deve ser moderna, limpa e cativante. Usamos 3D para tornar conceitos abstratos em algo concreto e memorável. A iluminação, os materiais e as animações são cruciais.
- **Interativa e Intuitiva**: O usuário deve se sentir no controle. Sliders, botões e feedback visual imediato são essenciais para o aprendizado ativo. A interface deve ser autoexplicativa.
- **Historicamente Progressiva**: A linha do tempo é o eixo central da experiência, guiando o usuário através da evolução do pensamento científico.

---

## 2. Paleta de Cores (`constants.ts`)

A consistência de cores é fundamental para a identidade visual e para a clareza da informação.

| Elemento  | Cor (Tailwind CSS) | Hex Code  | Uso                                |
| :-------- | :----------------- | :-------- | :--------------------------------- |
| **Próton**  | `red-400`          | `#f87171` | Partículas positivas no núcleo.    |
| **Nêutron** | `green-300`        | `#86efac` | Partículas neutras no núcleo.      |
| **Elétron** | `blue-400`         | `#60a5fa` | Partículas negativas na eletrosfera. |
| **Órbita**  | `gray-600`         | `#4b5563` | Linhas de órbita e a esfera de Thomson. |
| **Texto**   | `gray-200`         | `#e5e7eb` | Todo o texto principal da UI.      |

---

## 3. Guia de Estilo dos Modelos Atômicos

Cada modelo possui uma identidade visual única que reflete sua teoria.

### a. Modelo de Dalton (1803)
- **Conceito**: Átomo como uma esfera maciça, indivisível e indestrutível.
- **Visual**:
  - Uma única esfera (`<sphereGeometry>`).
  - Material: `meshStandardMaterial` com aparência de pedra ou metal fosco (`color: #a1a1aa`, `roughness: 0.8`).
  - Iluminação: Simples, para destacar sua forma sólida.
  - Interatividade: Apenas rotação e zoom. Sem sliders.

### b. Modelo de Thomson (1897)
- **Conceito**: "Pudim de Passas". Uma esfera de carga positiva com elétrons de carga negativa incrustados.
- **Visual**:
  - **Esfera Positiva**: Uma grande esfera (`<sphereGeometry>`) com um material de vidro fumê (`<meshPhysicalMaterial>`) para dar um aspecto etéreo e volumétrico. Cor baseada em `COLORS.orbit`.
  - **Cargas (Prótons e Elétrons)**:
    - Usam `<Billboard>` para sempre estarem viradas para a câmera.
    - São posicionadas na superfície externa, "coladas" na esfera principal.
    - A distribuição é uniforme e organizada, usando o algoritmo "Fibonacci sphere".
    - Elétrons são círculos azuis com `-`. Prótons são círculos vermelhos com `+`.
  - **Interatividade**: Slider para controlar o número de pares de carga (+/-) em proporção 1:1.

### c. Modelo de Rutherford (1911)
- **Conceito**: Modelo planetário. Um núcleo denso, pequeno e positivo, com elétrons orbitando ao redor.
- **Visual**:
  - **Núcleo**: Um agrupamento denso de esferas (prótons e nêutrons) no centro. A distribuição interna usa "Fibonacci sphere" para parecer natural.
  - **Eletrosfera**:
    - Elétrons são pequenas esferas brilhantes.
    - Cada elétron segue uma órbita elíptica (`<EllipseCurve>`).
    - Cada órbita é inclinada em um ângulo 3D aleatório para criar uma aparência caótica e volumétrica, como na imagem de referência.
    - As linhas de órbita (`<Line>`) são finas, semitransparentes e na cor `COLORS.orbit`.
  - **Interatividade**: Slider para controlar o número de prótons e elétrons.

### d. Modelo de Bohr (1913)
- **Conceito**: Níveis de energia quantizados. Elétrons em órbitas circulares e definidas.
- **Visual**:
  - **Núcleo**: Idêntico ao de Rutherford.
  - **Eletrosfera**:
    - Órbitas são anéis (`<ringGeometry>`) perfeitamente circulares e coplanares.
    - Órbitas ocupadas têm opacidade alta (`0.8`), enquanto as vazias são semitransparentes (`0.2`), indicando sua existência.
    - Elétrons são distribuídos uniformemente sobre suas respectivas órbitas.
  - **Animação (Salto Quântico)**: A simulação de excitação deve ser fluida. O elétron salta para uma camada externa e, ao retornar, emite um fóton (partícula de luz pulsante e brilhante) que viaja para fora do átomo.

---

## 4. Princípios da Interface do Usuário (UI)

- **Layout**: A UI é dividida em três áreas: Header (Timeline, Legenda, Info), Viewport 3D (principal) e Footer (Controles).
- **Timeline**: Fica no topo, centralizada. O modelo ativo é destacado.
- **Painéis (Controles, Legenda, Info)**: Usam um fundo semitransparente com desfoque (`bg-gray-800/60 backdrop-blur-sm`) para se integrarem suavemente sobre a visualização 3D.
- **Contextualidade**: A UI deve ser inteligente. Painéis e controles que não se aplicam a um modelo específico (ex: sliders de elétrons para Dalton) devem ser ocultados para evitar confusão.
- **Interatividade**: Todos os valores numéricos devem ser editáveis, seja por slider ou por digitação direta, para dar ao usuário controle total e rápido.

---

## 5. Ideias para o Futuro

- **Modelo Quântico (Schrödinger, 1926)**: O próximo passo lógico na linha do tempo. O desafio será visualizar as "nuvens de probabilidade" (orbitais s, p, d, f) de forma intuitiva.
- **Painel de Informações Históricas**: Um painel que explica os conceitos, o experimento chave (ex: Folha de Ouro de Rutherford) e as limitações de cada modelo selecionado.

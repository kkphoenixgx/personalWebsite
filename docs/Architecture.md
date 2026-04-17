# Arquitetura do Personal Website

Este documento descreve a arquitetura do projeto **Personal Website** (Kkphoenix), um portfólio interativo construído com Angular 19, utilizando integrações avançadas de gráficos 3D (Three.js), física 2D (Matter.js) e animações (GSAP).

## 1. Visão Geral (Overview)

O projeto é uma Single Page Application (SPA) Angular standalone, voltada para demonstrar habilidades em desenvolvimento frontend, especialmente em interações e renderização 3D no navegador. A aplicação possui um sistema de modo escuro global, controle de animações (para performance) e um explorador de arquivos (Second Brain Notes) integrado a uma API externa.

### Tecnologias Principais
- **Framework:** Angular 19 (Componentes Standalone)
- **Linguagem:** TypeScript
- **Estilização:** SCSS (com variáveis globais)
- **Gráficos 3D:** Three.js (com pós-processamento via `EffectComposer`)
- **Física 2D:** Matter.js
- **Animações:** GSAP (GreenSock Animation Platform)
- **Gerenciamento de Estado:** RxJS (`BehaviorSubject` e `Observable`)

---

## 2. Estrutura de Diretórios

A aplicação segue a estrutura padrão do Angular, com o código-fonte principal localizado em `src/app/`:

```text
src/app/
├── elements/      # Componentes UI independentes e isolados (ex: Lampada com física)
├── interface/     # Interfaces e tipagens TypeScript (ex: IPlanet, IPage)
├── pages/         # Componentes de rotas principais (Páginas)
│   ├── articles/  # Página de artigos
│   └── home/      # Página principal e suas seções (Hero, History, Portfolio, etc.)
├── services/      # Serviços de lógica de negócio, APIs e estado global
├── shared/        # Componentes compartilhados em toda a aplicação (Header, Footer, Menu)
├── styles/        # Arquivos SCSS globais e variáveis
└── utils/         # Classes utilitárias auxiliares (ex: ViewportHelper)
```

---

## 3. Gerenciamento de Estado e Serviços

A aplicação não utiliza bibliotecas externas de gerenciamento de estado (como NgRx ou Redux), mas adota um padrão reativo utilizando `BehaviorSubject` do RxJS injetados via serviços (Singleton).

### Serviços Principais (`src/app/services/`):
- **`DarkModeControllerService`**: Gerencia o estado de "Dark Mode" ou "White Mode". Componentes se inscrevem neste serviço para alterar classes CSS (`.darkMode`, `.whiteMode`) dinamicamente ou atualizar cores no Three.js.
- **`AnimationControllerService`**: Gerencia um booleano que determina se as animações pesadas (GSAP, loops do Three.js) devem estar ativas. Útil para economia de bateria ou acessibilidade.
- **`SideBarMenuControllerService`**: Controla o estado de abertura/fechamento do menu lateral.
- **`FileNavigatorService`**: Realiza requisições HTTP para uma API backend (`api-personalwebsite.kkphoenix.com.br/api/pages/`) para buscar a árvore de arquivos de anotações e realizar o parsing/ordenação dos nós.
- **`Text3dService`**: Serviço auxiliar para a criação e controle de rotação de malhas de texto 3D utilizando `TextGeometry` do Three.js.

---

## 4. Roteamento e Estrutura de Páginas

As rotas são definidas em `app.routes.ts`:
- `/` -> `HomeComponent`
- `/articles` -> `ArticlesComponent`

O `AppComponent` (`app.component.ts`) serve como o layout base, renderizando `<app-header>`, o `<router-outlet>` e o `<app-footer>`.

### HomeComponent (`pages/home/`)
A página inicial atua como um agregador de componentes. Ela renderiza sempre o `<app-hero>` e possui um sistema de abas (tabs) gerenciado internamente que alterna a visualização entre:
- **History**: (`<app-history>`) História pessoal, com integração Three.js ao fundo.
- **Professional History**: (`<app-professional-history>`) Exibe histórico profissional com layout estilizado usando CSS 3D Transforms (perspectiva em um livro).
- **Portfolio**: (`<app-portifolio>`) Lista de projetos com diferentes layouts (Carousel, Grid lateral, Cards) baseada nos dados do componente.
- **Hire Me**: (`<app-hire-me>`) Informações de contato simples.

---

## 5. Integrações Especiais

Uma das características marcantes do projeto são as integrações com bibliotecas de terceiros para criar experiências lúdicas.

### Three.js (Gráficos 3D)
O Three.js é utilizado em três locais distintos:
1. **Header Text3D (`shared/header/partials/text3d/`)**: Renderiza a palavra "KKPHOENIX" em 3D. A fonte é carregada via `FontLoader` e texturizada com `TextGeometry`. O loop de animação é controlado pelo `AnimationControllerService`.
2. **Footer Planet System (`shared/footer/`)**: Renderiza um "universo" interativo.
   - Utiliza a classe `PlanetFactory` para instanciar esferas texturizadas simulando planetas.
   - A classe `ReactPlanet` cria um sistema customizado com anéis orbitais.
   - Implementa **Raycasting** (`THREE.Raycaster`) para detectar o _hover_ e cliques nos planetas (que redirecionam para links externos).
   - Utiliza `EffectComposer` e `OutlinePass` para criar um brilho (glow) quando o mouse passa por cima de um planeta.
3. **History Background (`pages/home/partials/history/`)**: Renderiza um fundo de partículas em movimento e uma malha de linhas (Grid). Utiliza `IntersectionObserver` nativo do navegador para pausar o laço de renderização (`requestAnimationFrame`) quando o elemento sai da tela, otimizando muito a performance.

### Matter.js (Física 2D)
A aplicação possui um "Easter Egg" / Feature no componente **LampComponent** (`elements/lamp/`):
- Consiste em um canvas renderizado por cima de tudo (`z-index: 10`).
- Usa a engine Matter.js para simular uma lâmpada pendurada por um fio (`Constraint`, `Bodies`).
- O usuário pode interagir puxando ou clicando na lâmpada (`MouseConstraint`).
- Ao clicar na lâmpada, o estado global de Dark Mode é invertido e o texto 3D do header sofre uma rotação.
- Por ser um componente pesado, ele pode ser destruído/criado dinamicamente pelo `ConfigMenuComponent` (`loadLampComponent` / `destroyLampComponent`).

### GSAP (Animações CSS/SVG)
- Utilizado na seção Hero (`pages/home/partials/hero/`).
- O componente pega uma lista de ícones SVG de frameworks e utiliza o `gsap.timeline` para criar efeitos randômicos de queda, rotação e _bounce_, como se os ícones estivessem chovendo na tela.

---

## 6. Componentes Compartilhados (`shared/`)

- **Header**: Contém botões de ação para abrir o menu lateral e o menu de configurações, além de abrigar o `<app-text3d>`.
- **Config Menu**: Menu deslizante com "switches" (toggle) para ativar/desativar as animações globais e o modo escuro. Também gerencia a montagem/desmontagem em tempo de execução do componente da Lâmpada (Matter.js).
- **Side Menu**: Um Drawer de navegação que contém os links da aplicação e o **File Navigator**.
- **File Navigator (`shared/header/partials/side-menu/file-navigator/`)**: 
  - Renderiza uma estrutura de árvore de arquivos obtida do `FileNavigatorService`.
  - É um componente *recursivo* (ele chama a si mesmo `<app-file-navigator>` para renderizar subpastas).
  - Utiliza `ChangeDetectionStrategy.OnPush` para otimização de performance, uma vez que a estrutura da árvore pode ser grande.

---

## 7. Estilização, Temas (SCSS) e Performance

- **Temas Globais**: Fortemente baseado na alternância de temas (Dark Mode e White Mode). Cada componente subscreve ao estado de Dark Mode através do serviço e aplica dinamicamente as classes `.darkMode` ou `.whiteMode` usando `[ngClass]`.
- **Gerenciamento de Recursos**: Para evitar *Memory Leaks*, todas as subscrições RxJS (geralmente geradas utilizando o padrão `takeUntil(this.destroy$)`) e animações geradas fora do ciclo do Angular (`cancelAnimationFrame` para o Three.js, disposições das malhas e renderizadores) são devidamente limpas no lifecycle hook `ngOnDestroy`.
- **Carregamento Assíncrono Dinâmico**: O carregamento on-demand de componentes pesados (como a Lampada que traz a dependência do `matter.js` inteiro) permite otimizar o tempo de carregamento inicial da página.

---

## 8. Mapeamento Detalhado de Módulos e Componentes

Esta seção detalha a fundo a responsabilidade, as dependências e o comportamento de cada arquivo significativo dentro da árvore `src/app/`.

### 8.1. Core e Configuração Raiz (`src/app/`)
- **`app.component.ts`**: Componente Entry-Point da aplicação. Renderiza globalmente o `<app-header>`, o `<app-footer>` e provê o `<router-outlet>` para as páginas.
- **`app.config.ts`**: Define os providers globais, como configuração de detecção de mudanças (Zone.js com `eventCoalescing`), Rotas (`provideRouter`) e cliente HTTP (`provideHttpClient`).
- **`app.routes.ts`**: Contém o roteamento (`/` para `HomeComponent` e `/articles` para `ArticlesComponent`). Trata rotas curingas (`**`) caindo no `HomeComponent`.

### 8.2. Páginas (`src/app/pages/`)

#### Módulo: Home (`pages/home/`)
- **`HomeComponent`**: Centralizador da página inicial. Renderiza fixamente a introdução (`HeroComponent`) e contém uma barra de navegação local (`ul/li`) que altera a variável `currentTab`. Com base nessa variável, renderiza via `*ngIf` um dos "Partials" abaixo.
- **Partials do Home:**
  - **`hero/hero.component.ts`**: A tela principal ("Nice to meet you"). Utiliza o `gsap.timeline` e uma matriz de ícones (`listOfFrameworks`) para animar logos SVG chovendo na tela (movimentos de queda, rotação e bounce gerados randomicamente). Contém uma função recursiva `typeWriter` para o texto inicial e gerencia a responsividade e o dark mode do fundo/foto de perfil.
  - **`history/history.component.ts`**: Descreve o "Who I am" e a jornada acadêmica.
    - **3D Render**: Inicializa uma cena Three.js contendo 1000 partículas (`THREE.Points`) e um chão em malha paramétrica (`THREE.LineSegments`). 
    - **Performance**: Implementa um `IntersectionObserver` que observa o container 3D. O loop de `requestAnimationFrame` **só executa se o elemento estiver visível na tela** (`_isThreeContainerVisible`). Se não, a renderização congela.
    - **Animações DOM**: Usa esse mesmo observer para adicionar as classes CSS `.fadeInOnScrollY` e `.fadeInOnScrollX` nos parágrafos textuais à medida que surgem.
  - **`professional-history/professional-history.component.ts`**: Componente puramente visual (CSS 3D Transforms) exibindo as informações dentro de um desenho estilizado de um "livro aberto" usando `perspective`, `skewY` e `transform-origin` no layout.
  - **`portifolio/portifolio.component.ts`**: Galeria de projetos.
    - Divide um array de objetos `PortfolioProject` contendo links, imagens e descrições.
    - Separa a exibição por chaves "type" (carousel, side-left, side-right, card, end-projects), renderizando blocos CSS Grid e um Carrossel com *Scroll Snap*.
  - **`hire-me/hire-me.component.ts`**: Um cartão de apresentação simplificado com e-mail, linkedin, celular e os links sociais baseados no global Dark Mode.

#### Módulo: Articles (`pages/articles/`)
- **`ArticlesComponent`**: Página avulsa em construção (Placeholder). Utiliza injeção do token global `DOCUMENT` para injetar variáveis CSS diretas no `:root` através do Javascript no `ngOnInit` e limpar no `ngOnDestroy`.

### 8.3. Componentes Compartilhados (`src/app/shared/`)

#### Header e Menu (`shared/header/`)
- **`HeaderComponent`**: Abriga os controles de navegação superior, botão de configurações (engrenagem) e renderiza o `<app-text3d>`. Se a animação for desligada, exibe o texto HTML estático "KKPHOENIX" em vez do canvas 3D.
- **Partials do Header:**
  - **`text3d/text3d.component.ts`**: Cria um `THREE.WebGLRenderer` para renderizar as letras "KKPHOENIX" em 3D. Atualiza dinamicamente as posições de câmera (Eixo Z) com base num *HostListener* de resize de janela (afastando/acercando em telas menores).
  - **`config-menu/config-menu.component.ts`**: Drawer lateral direito (Configurações).
    - Possui botões `<input type="checkbox">` controlados por RxJS (Toggle Dark Mode, Toggle Animations).
    - **Carregamento Assíncrono (`loadLampComponent`)**: Importa o módulo do `LampComponent` on-demand (Dynamic Import de ES Modules) e o insere no DOM usando `ViewContainerRef.createComponent`. Se o usuário desligar, ele destrói a referência.
  - **`side-menu/side-menu.component.ts`**: Drawer lateral esquerdo (Navegação Principal). Contém os links de navegação (`RouterLink`) e chama o `FileNavigatorService` para popular os projetos.
    - **`file-navigator/file-navigator.component.ts`**: Um componente de árvore de diretórios **recursivo**. Ele importa a si mesmo (`forwardRef(() => FileNavigatorComponent)`) para criar a árvore `<details>/<summary>`. Usa a estratégia reativa `ChangeDetectionStrategy.OnPush` para melhorar o tempo de renderização em árvores grandes.

#### Footer (`shared/footer/`)
- **`FooterComponent`**: O rodapé da aplicação hospeda uma grande simulação de mini-sistema solar do Three.js.
  - Utiliza `EffectComposer`, `RenderPass` e `OutlinePass` (pós-processamento) para colocar contornos cintilantes em volta do planeta sob o cursor do mouse.
  - Utiliza `THREE.Raycaster` disparado no `HostListener('mousemove')` para detectar qual modelo está sendo focado pelo cursor. Atualiza variaveis do DOM `tooltipX`, `tooltipY` e `tooltipText` para mostrar uma div acompanhando o mouse (o nome do planeta).
  - Utiliza `HostListener('click')` acoplado ao Raycaster para redirecionar o usuário a um link (`window.open`).
- **Partials do Footer:**
  - **`planet/PlanetFactory.ts`**: Padrão de design "Factory" (método estático). Recebe uma lista de dados e cria instâncias em lote de `THREE.Mesh` com `SphereGeometry` e `MeshStandardMaterial` importando texturas png via `TextureLoader`. Adiciona um pacote de dados customizado dentro do construto em `mesh.userData`.
  - **`reactPlanet/reactPlanet.ts`**: Uma malha complexa do Three.js gerada na mão simulando o emblema do React. Cria anéis de órbita via `TubeGeometry` calculados por `THREE.Curve<THREE.Vector3>` e esferas rotacionando sobre pivôs tridimensionais nas inclinações (Math.PI / 3, -Math.PI / 3, 0).

### 8.4. Elementos Isolados (`src/app/elements/`)

#### A Lâmpada (`elements/lamp/`)
- **`LampComponent`**: Componente visual do Easter Egg de Modo Escuro operado via **Matter.js**.
  - É renderizado em um `<canvas>` de `z-index: 10` que se sobrepõe à UI, sendo totalmente "clicável" (pointer-events: click).
  - **Física Inicial**: Instancia no OnInit as entidades do Matter.js: `Engine`, `Runner` e `Render`.
  - **Corpos (`Bodies` e `Constraint`)**: Cria um corpo retangular estático no teto e liga a lâmpada (Corpo dinâmico baseado em uma imagem SVG e dimensões extraídas do carregamento do DOM) a ele através de uma "corda" física (`Constraint`) calculando `stiffness` (rigidez) e `length` (tamanho).
  - **Interatividade (`MouseConstraint`)**: Vincula o cursor do mouse à física de arraste da engine para permitir ao usuário puxar a lâmpada pela tela.
  - **Eventos Avançados**: Tem *listeners* diretos para `click`, `touchstart` e `touchend`. Calcula o diferencial de movimento em X e Y para descartar se o usuário está puxando a tela (no mobile) versus efetivamente clicando para "acender/apagar".
  - Acionar a lâmpada dá toggle no serviço RxJS `DarkModeControllerService` e chama uma rotação contínua e intermitente no Header usando o `Text3dService`.

### 8.5. Serviços (`src/app/services/`)

Os serviços injetáveis (`@Injectable({ providedIn: 'root' })`) provêm dados para toda a arquitetura utilizando o padrão Observer e injeções Singleton.

- **`AnimationControllerService`**:
  - Guarda a variável `animationDelayInMs` (1500ms) que define atrasos programados em timeouts pela aplicação inteira.
  - Usa um `BehaviorSubject<boolean>` para alternar e enviar o sinal ligado/desligado das animações em tempo real.

- **`DarkModeControllerService`**:
  - `BehaviorSubject<boolean>` exposto por `getDarkModeObserbable()`. Componentes se assinam aqui ou usam o pipe `async` para setar `[class.darkMode]="isDarkMode$ | async"`.

- **`FileNavigatorService`**:
  - Serviço HTTP conectado a `api-personalwebsite.kkphoenix.com.br/api/pages/`.
  - Mantém o retorno de dados cacheado numa promessa interna local (`itemsCache: Promise<IPage[]> | null`).
  - O método `transformToPage(items)` remove conteúdos em black-list (ex: "404", ".excalidraw", "sync conflict").
  - Processa recursivamente arrays mapeando a montagem de diretórios virtuais e criando a rota absoluta (`this.BACKEND + item.path`).
  - Ao final do mapeamento, ordena pastas e arquivos de acordo com sua prioridade de leitura (ex: Programming, Study primeiro, alocando os nós "folder" antes dos nós "file").

- **`SideBarMenuControllerService`**:
  - Subject booleano para disparar animação de Drawer Aberto / Drawer Fechado da side-bar sem depender de @Input/@Output ou componentes parentescos.

- **`Text3dService`**:
  - Serviço de estado utilitário de gráficos. Ele abstrai o recarregamento do `FontLoader` do Three.js (geralmente assíncrono).
  - Constrói o `TextGeometry` configurado (curvas, bevels). Mantém em sua propriedade de classe a referência final à malha instanciada no Header.
  - Exponibiliza métodos como `rotateTextOnce(delta: number)` para aplicar rotações diretas à Mesh gerada do exterior (Ex: O `LampComponent` chama o serviço de texto, faz o texto do header rodar toda vez que o cursor for clicado, sem a Lampada precisar saber a instância física do header).

### 8.6. Interfaces e Tipagens (`src/app/interface/`)

- **`IPlanet.ts`**: Estrutura contendo `id`, `imagePath`, `position` de coordenadas vetoriais, `label` (Tooltip) e `site` (Link externo).
- **`ITitlesResponse.ts`**: 
  - `IPage`: Tipagem recursiva `title`, `path` e um array `items: Array<IPage>` para o segundo cérebro.
  - `IPagesResponse`: A resposta raiz em array do back-end.

### 8.7. Utilitários (`src/app/utils/`)

- **`Viewport.ts` (`ViewportHelper`)**:
  - Abstração estática simples do `window.innerWidth` e `navigator.userAgent`. Ajuda em funções como `isMobile()` rodando uma checagem de Regex contra agentes mobile (Mobi, Android, iPhone, etc), sendo chamada, por exemplo, na câmera Three.js do rodapé.
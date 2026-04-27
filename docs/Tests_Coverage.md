# Documentação de Testes (Unit Testing)

Este documento descreve a atual cobertura de testes unitários da aplicação **Personal Website**. Os testes são executados utilizando o **Karma** como test runner e o **Jasmine** como framework de asserção.

Devido à natureza altamente visual da aplicação (Canvas, Three.js, Matter.js, GSAP), muitas suítes de teste focam em garantir a correta montagem do DOM e a injeção de dependências sem disparar loops de renderização pesados que quebrariam o ambiente de testes.

## 1. Visão Geral da Cobertura

De forma geral, a aplicação possui **Smoke Tests** (`should create`) garantidos para todos os componentes e serviços gerados. Algumas partes cruciais da aplicação receberam testes mais detalhados para comportamento lógico e renderização de dados condicionais.

---

Com: 

> ng test --code-coverage

A cobertura de testes mede qual porcentagem do seu código-fonte foi "pintada" por esse marca-texto enquanto os testes rodavam. Se uma linha nunca foi pintada, significa que nenhum teste verificou o comportamento dela.

* **Statements (Declarações)** = Uma "declaração" é a menor unidade de execução do seu código. Pense em cada comando individual: uma atribuição de variável (let a = 1;), uma chamada de função (this.myFunction();), um return.
* **Branches** (Bifurcações) = Essa é a métrica mais crítica e a que explica por que sua cobertura não é 100%. Uma "branch" é um caminho de decisão no seu código. Toda vez que você escreve um if, else, switch, um loop ou um operador ternário (condicao ? valor1 : valor2), você cria uma bifurcação.
* **Functions** = Mede a porcentagem de funções e métodos que foram chamados pelo menos uma vez durante a execução dos testes
* **Lines** =  A métrica mais simples e literal. Conta quantas linhas de código executáveis foram de fato executadas. É muito parecida com "Statements", mas pode haver pequenas diferenças (uma linha pode conter múltiplas declarações, por exemplo).

Para ver métricas de abstração e instabilidade:

> npx dependency-cruiser --validate .dependency-cruiser.js src




---

## 2. Testes de Componentes Compartilhados (`shared/`)

Esta seção concentra a maior parte dos testes com lógicas avançadas (Mocking de UI e fluxos assíncronos).

### `Text3dComponent` (`shared/header/partials/text3d/`)
Apresenta a cobertura mais completa entre os componentes 3D.
- **Cenários testados:**
  - **Criação básica:** Verifica se o componente é instanciado.
  - **Inicialização do WebGL:** Garante que o `THREE.WebGLRenderer`, `Scene` e `PerspectiveCamera` são instanciados corretamente.
  - **Reatividade de Tema (Dark Mode):** Chama o método `updateColors()` e faz asserção checando se o mock do `Text3dService` foi engatilhado com a cor correta (`0xffffff` para Dark Mode).
  - **Delegação de Criação:** Verifica se a função `createText` do serviço responsável é chamada na inicialização.
- **Técnicas utilizadas:** Utiliza Spies (`jasmine.createSpyObj`) para mockar fortemente o `Text3dService`, `DarkModeControllerService` e `AnimationControllerService`. Possui rotina de teardown (`afterEach`) limpando o `renderer.dispose()` da memória do Karma.

### `FileNavigatorComponent` (`shared/header/partials/side-menu/file-navigator/`)
Possui testes que asseguram a correta renderização recursiva e assíncrona da árvore do *Second Brain*.
- **Cenários testados:**
  - **Criação básica.**
  - **Renderização de Estrutura:** Injeta um payload falso simulando o back-end (`IObjectResponse` contendo uma pasta e dois arquivos txt) e verifica se o DOM renderizou o nome da pasta raiz e dos filhos (`Folder 1`, `file1.txt`, `file2.txt`).
- **Técnicas utilizadas:** Uso do `fakeAsync` e `tick()` para aguardar a resolução dos Promises do `FileNavigatorService`.

### `SideMenuComponent` (`shared/header/partials/side-menu/`)
- **Cenários testados:** Criação e montagem correta injetando providers vazios de roteamento (`provideRouter`) e garantindo que requisições ao back-end reais não ocorram no CI/CD através de Mocking do `FileNavigatorService` (`Promise.resolve([])`).

### `FooterComponent` (`shared/footer/`)
- **Cenários testados:**
  - **Criação básica:** Garante que o componente é instanciado.
  - **Interatividade do Raycaster:** Simula eventos de `mousemove` sobre um planeta e verifica se a `tooltip` (dica de tela) é exibida com o texto e posição corretos.
  - **Redirecionamento de Links:** Simula um evento de `click` em um planeta e espiona (`spyOn`) a função `window.open` para garantir que ela é chamada com a URL correta do projeto.
- **Técnicas utilizadas:** Mocking dos serviços de animação e dark mode, uso de `fakeAsync` e `tick()` para controlar o ciclo de vida do Three.js, e `spyOn` para interceptar chamadas do Raycaster e do `window`.

### Demais Componentes Compartilhados
Os componentes `HeaderComponent`, `FooterComponent` e `ConfigMenuComponent` possuem testes de "sanity check" (`should create`). O `HeaderComponent` especificamente utiliza o `NO_ERRORS_SCHEMA` para ignorar templates aninhados e utiliza um mock simples do `ActivatedRoute`.

---

## 3. Testes das Páginas e UI (`pages/` e `elements/`)

Testar as páginas exigiu configurações customizadas para lidar com timeouts e laços de animações infinitas.

### `HomeComponent`
- **Desafios e Soluções:** Como a Home inicia o GSAP no HeroComponent e contém variáveis baseadas no DOM, o teste sobrecreve o template (`overrideTemplate`) providenciando elementos mínimos (`#firstTab`, `#helloBackground`) para a view não quebrar.
- **Técnicas utilizadas:**
  - `SpyOn` na biblioteca global do `gsap.timeline` para retornar objetos falsos com `.clear()` e `.to()`, evitando timeouts.
  - Aumento manual do timeout do Jasmine (`jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000`).
  - Utilização de classes Stub customizadas (`AnimationControllerServiceStub`) provendo delays zerados ou bem curtos para testes rápidos.

### `HistoryComponent`
- **Desafios e Soluções:** Evitar a instigação do Canvas (Three.js) e do IntersectionObserver.
- **Técnicas utilizadas:** Faz uso da intercepção via spy: `spyOn(component, 'initThreeJS').and.stub()` e `spyOn(component, 'animate').and.stub()` para congelar completamente a execução de lógicas 3D.

### `LampComponent` (`elements/lamp/`)
- **Desafios e Soluções:** Instancia a motor do Matter.js em tempo de execução que poderia engasgar os testes.
- **Técnicas utilizadas:** Configura um ambiente tolerante com timeout ampliado e uso nativo do `fakeAsync` + `tick()` para pular o fluxo de tempo o suficiente para resolver as requisições assíncronas no lifecycle do componente.

### Demais Páginas
`ArticlesComponent`, `HeroComponent`, `HireMeComponent`, `PortfolioComponent` e `ProfessionalHistoryComponent` possuem cobertura básica (`should create`), utilizando `NO_ERRORS_SCHEMA` quando há elementos visuais muito complexos sem a necessidade de instanciamento profundo.

---

## 4. Testes de Serviços (`services/`)

Todos os serviços da aplicação, como operam via Injeção de Dependência (`providedIn: 'root'`) e gerenciam estados através do RxJS, possuem testes unitários estruturais garantindo que o Angular consiga provê-los.

- `AnimationControllerService`: `should be created`.
- `DarkModeControllerService`: `should be created`.
- `SideBarMenuControllerService`: `should be created`.
- `Text3dService`: `should be created`.
- `FileNavigatorService` (O arquivo de teste foi nomeado como `file-navigator-service.service.spec.ts` mas engloba checagens do `SideMenuComponent` renderizando arquivos simulando o provimento das informações).

---

## 5. Visualização em Tempo Real (`HealthComponent`)

A aplicação conta com um dashboard de "Saúde" (`/health`) que integra os resultados dos testes e métricas de performance diretamente na UI:

- **Métricas de Cobertura**: O componente realiza o fetch do arquivo `coverage.json` gerado pelo pipeline de testes e renderiza gráficos circulares (SVG) com as porcentagens de Statements, Functions e Branches.
- **Transparência de Qualidade**: Esta funcionalidade permite que qualquer pessoa (ou cliente) valide a integridade do código sem precisar acessar o terminal.
- **Monitoramento de FPS**: Além dos testes estáticos, monitora a performance runtime para garantir que as engines 3D não degradem a experiência.

---

## 6. Avaliação e Próximos Passos (Next Steps)

A estrutura base dos testes garante que alterações de roteamento ou injeção de dependência na aplicação não causem quebras catastróficas desapercebidas (Crash de inicialização). 

Para melhorar a confiabilidade e atingir uma maior pontuação de Test Coverage, recomenda-se:

1. **Testar Lógicas de Negócio no FileNavigatorService:** O serviço atual tem um método importante de `transformToPage` que remove strings (`.excalidraw`, `sync conflict`) e ordena pastas. Criar um teste que envia um array cru e valida se a saída está correta e ordenada.
2. **Testar Eventos do DOM no Footer:** Simular cliques (`dispatchEvent`) do mouse com raycaster em planetas e verificar se o `window.open` é invocado para os links corretos.
3. **Testar RxJS Subscriptions:** Garantir explicitamente que métodos de `unsubscribe` (ou subscrições utilizando o `takeUntil(destroy$)`) estão sendo devidamente limpos no ciclo do `ngOnDestroy` (evitando false-positives para memory leaks no test runner). **(Concluído)**

---

## 6. Testes de Métricas (Performance e Acessibilidade)

Foram adicionados testes globais para monitorar a saúde da aplicação em tempo de execução, gerando um relatório em `logs/metrics.log`.
- **Acessibilidade (a11y):** Utiliza a engine `axe-core` para escanear o DOM da aplicação inteira (`AppComponent`). Após refatorações, os débitos críticos e sérios (como *Color Contrast* e *ARIA Roles*) foram zerados para estar em conformidade com as diretrizes WCAG AA.
- **Velocidade de Renderização:** Mede o tempo de renderização da SPA e o tempo até a injeção dos motores 3D (Three.js/Matter.js), classificando os resultados como ÓTIMO, ACEITÁVEL ou LENTO.
- **Complexidade do DOM:** Conta o número total de nós no DOM na carga inicial para monitorar a complexidade da página e prevenir degradação de performance.
- **Responsividade:** Simula uma tela de celular e verifica se o layout quebra, causando barras de rolagem horizontais indesejadas.
- **Payload Budget (Arquitetura):** Confirma programaticamente que módulos pesados (como o `LampComponent` com `Matter.js`) não são pré-carregados no bundle principal e são carregados apenas sob demanda (Lazy Loading).
- **SEO (Search Engine Optimization):** Verifica se a página (`index.html`) contém as tags essenciais, meta descriptions e injeção de `JSON-LD` para criar Rich Snippets de desenvolvedor na aba do Google.

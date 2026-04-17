# Todos

## ISSUES

- [ ] Sessão dos artigos
- [ ] Testes
  - [ ] Verificar cobertura atual de testes
  - [ ] Criar testes de métricas para esse software
- [ ] Precisamos de um lugar que lista melhor todas as provas antigas do cefet, substituir o banco de provas atual do cefet, uma nova page para o banco de provas do cefet, pode ser o cefet-exams 
- [ ] Refatorar scss
  - [ ] Escrever scss melhor, precisa ser scss mesmo, não css disfraçado, usar as melhores práticas
- [ ] Produzir fotos para a aba portifólio.
- [ ] Preciso de alguma claude para rodar meus projetos principais com banco de dados e servidor de graça.
- [ ] Melhorar a UI para deixar mais impressionante
- [ ] window sem focus tira o animate
- [~] profissional-history partial
- [ ] Profissional history vai ser um livro
- [ ] Github API para listar os repositórios em algum lugar
- [ ] Change mouse, no site o mouse do cliente vai ser diferente. Opção para desativar isso.
- [ ] listando sync conflicts e .excalidraw **no quartz**
- [ ] Sugestão: O botão de "Toggle Animations" que vi no seu código (<app-config-menu>) precisa funcionar perfeitamente. Se detectar FPS baixo, sugira desligar a física automaticamente ou mostre um aviso.

### Sub projetos

- [ ] Definir melhor os requisitos dos sub projetos
- [ ] - excalidraw no site
  - Google desenhos exporta para pdf com resulição vetorial de zoom de 1000x
- [ ] Sessão de freelas para clientes acompanharem os freelas
  - Registro um freela com um repositôrio no github e o cliente pode ver os últimos commits e se tiver um link checkar o site em realtime.
- [ ] Um blog para minhas ideias de software.

### Completed

- [X] listando sync conflicts e .excalidraw
- [X] Quando acontece um resize aumentando a tela acima de 890px e abaixo de 1260 - o canvas não ocupa 100% do history
- [X] Se eu ligo a animação pelo menos 3 vezes (6 clicks no toogle animation) o container do tree.js no history buga e dá erro na criação do container com tema escuro e continua com o fumdo claro, tornando impossível ler o texto
- [X] A color não tá mudando quando desliga a animação 
- [X] Lamp não está funcionando no mobile
- [X] Menu fallbacks
- [X] File explorer clicka e fica tudo azul
- [X] Links da hero não tão mudando na mudança para o dark mode
- [X] A hero não tá funcionando do jeito que precisa
- [X] O history ainda buga ( Se eu dou resize na página, o canvas as vezes buga e não fica do tamanho correto )
- [X] Tira o TCC project por enquanto
- [X] Ajeita o menu
- [X] Backend Java
- [X] Full screen o texto buga
- [X] Responsividade do Portifólio ( & Margin no portifólio)
- [X] Responsividade do Hire Me
- [X] Responsividade do footer
- [X] hire-me partial
- [X] portifolio partial
- [X] planetas do footer na esfera
- [X] Pointer events and css Header components
- [X] abaixo de 700px -> hello container quebra
- [?] Fazer Mobile para os componetes já existentes
- [?] Module logic refactored
- [X] Perfromance No app Component
- [X] Fazer o zoom do text ser atualizado de acordo com a tela do usuário
- [X] Definir o tamanho correto do header
- [X] Diminuir o tempo de load dos componentes
- [X] Alterar animation-service para definir tempo de loading para os componentes
- [X] Testes unitários para os componentes: Certeza que os compoenentes three não estão deixando garbage
- [X] Refactoring: "Reecomponentizar"
- [X] Ajustar os ícones do hello component
- [X] History resize with background
- [X] Mobile do header
- [X] Mobile do Home
- [X] Mobile do History

## Requisitos

## Novos testes

Sua arquitetura atual é rica em integrações de hardware (WebGL/Physics Engine), o que a torna frágil sob a ótica de performance se não houver um cinturão de testes de telemetria. Testes puramente funcionais (`should create`) são irrelevantes para sistemas que manipulam o **Game Loop** e a **Heap**.

Abaixo, apresento a estratégia de testes e métricas estruturada para o seu ecossistema Angular 19 / Three.js / Matter.js.

---

## 1. Testes de Métricas e Performance (Runtime)

Para evitar que seu site se torne um "vazador de memória" ou um "aquecedor de CPU", você deve implementar testes de **estresse e telemetria**.

### A. Teste de Leak de Memória (GC Check)
O Three.js e o Matter.js não limpam a memória sozinhos. Se você destruir um componente e as geometrias/texturas continuarem na GPU, você gerou um vazamento.
* **Métrica:** `performance.memory.usedJSHeapSize`.
* **Teste:**
    1. Instanciar o componente (`Lamp` ou `History`).
    2. Executar o loop por 100 frames.
    3. Destruir o componente (`fixture.destroy()`).
    4. Forçar ou aguardar um ciclo e validar se o delta de Heap retornou ao estado base.

### B. Teste de Estabilidade de Frame (FPS/Jank)
Validar se o `AnimationControllerService` está efetivamente mitigando carga em ambientes de baixo recurso.
* **Métrica:** Delta de tempo entre `requestAnimationFrame`.
* **Teste:** Simular um ambiente com `animationDelayInMs` alto e verificar se o número de chamadas ao `renderer.render()` cai proporcionalmente. Se a CPU continuar em 100%, sua lógica de "pausa" está falha no nível de AST.

### C. Teste de Lazy Loading (Payload Budget)
O `LampComponent` traz o `matter.js`. Se ele for carregado no bundle principal, a arquitetura falhou.
* **Métrica:** `entrypoint size`.
* **Teste (Via Webpack/Esbuild Bundle Analyzer):** Validar se o chunk de física está isolado e só é carregado após o trigger do `config-menu`.

---

## 2. Testes Arquiteturais (Dependency Guard)

Para impedir que "IAs alucinem" ou que você acople acidentalmente o domínio à infraestrutura, utilize o conceito de **ArchUnit** (via bibliotecas como `ts-arch` ou regras de ESLint customizadas).

### A. Isolamento do Domínio 3D
Impor uma regra onde a lógica matemática (ex: `PlanetFactory` e `reactPlanet.ts`) não pode importar `@angular/core` ou dependências de UI.
* **Por quê?** A lógica de translação e órbita deve ser testável em um ambiente Node puro (Headless), sem depender do ciclo de vida do Angular.

### B. Integridade Hexagonal
Testar se os serviços (como `FileNavigatorService`) dependem de interfaces e não de implementações concretas da API.
* **O Teste:** Verificar se o serviço aceita um `HttpClient` mockado que injeta falhas de rede (500, 404) e se o `transformToPage` lida com isso sem quebrar a árvore recursiva.

---

## 3. Testes de Produção (Vercel Alignment)

A Vercel utiliza o **Build Output API**. Para simular o ambiente de produção localmente, você precisa validar:

### A. Dados Estáticos Necessários
Antes de testar, você deve fornecer ao ambiente de CI:
* **`VERCEL_ENV`**: (production/preview).
* **`API_URL`**: A URL do seu servidor Java (para testar o CORS pré-flight).
* **Node Version Mapping**: Garantir que o `engines` no `package.json` é `20.x` ou `22.x` para evitar incompatibilidade com as Edge Functions.

### B. Teste de Compilação AOT (Ahead-of-Time)
Muitas vezes o código funciona em `ng serve`, mas quebra no `ng build` por acessos a propriedades privadas no template.
* **O Teste:** Incluir no pipeline de CI um passo de `ng build --configuration production`. Se o build falhar por tipagem, o teste impede o deploy.

---

## 4. Integração Angular + Servidor Java

Como seu backend é Java, o maior risco é a **dessincronização do contrato**.

### A. Contract Testing (Pact.io)
Em vez de mocks estáticos, use testes de contrato.
* **Como funciona:** O Angular gera um "contrato" (JSON) do que espera da API `/api/pages/`. O servidor Java roda um teste para garantir que ele ainda fornece exatamente esses campos. Se você mudar o Java e quebrar o Angular, o build do Java falha antes do deploy.

### B. Validação de Árvore Recursiva
Seu `FileNavigatorService` possui lógica complexa de ordenação e blacklist.
* **Teste Sugerido:** Crie um "Stress Dataset" no Java com 10 níveis de profundidade e nomes de arquivos proibidos (`sync conflict`). O teste no Angular deve garantir que a profundidade não causa **Stack Overflow** na recursão do componente.

---

## Resumo Diagnóstico

| Categoria | Teste Crítico | Ferramenta |
| :--- | :--- | :--- |
| **Performance** | `Memory Leak` no `ngOnDestroy` (Three.js dispose). | Jasmine + Performance API. |
| **Arquitetura** | Impedir que `Elements` importem `Services` globais. | ESLint Boundaries / ts-arch. |
| **Produção** | Simulação de latência de rede em Assets 3D. | Cypress / Playwright (Network throttling). |
| **Java Sync** | Validação de Schema do `IPage`. | Pact / Ajv (JSON Schema Validator). |

**Sentença:** Sua prioridade zero é o teste de **limpeza de memória** do Three.js. Sem isso, quanto mais tempo o usuário navega, mais o browser degrada. Se o `renderer.info.memory` não zerar no destroy, sua arquitetura está gerando débito técnico invisível.


## Requisitos


1. Implementar o Dashboard de Observabilidade (Prioridade Alta)

A Stefanini e o Boticário valorizam quem sabe o que acontece com o código depois do deploy.

    O que fazer: Crie uma rota /health ou /status no seu Angular.

    Ação: Use o Performance API do navegador para medir o tempo de injeção dos motores (Three.js/Matter.js) e o consumo de memória. Se o backend na AWS estiver no ar, faça um "ping" via serviço Angular para mostrar se a API está UP ou DOWN.

    Diferencial: Exiba o gráfico de FPS do Three.js integrado ao layout, mostrando que você monitora a performance para evitar gargalos em máquinas mais fracas.

2. O "Showcase" de Arquitetura (O trunfo do Back-end)

Você já tem o documento Architecture.md. Agora, torne-o visual.

    O que fazer: Crie uma página de "Arquitetura" dentro do site.

    Ação: Use um diagrama (pode ser SVG ou uma imagem do seu Obsidian) que explique o fluxo: Obsidian → Git-as-Database → AWS EC2 → Java Spring (Hexagonal) → Angular.

    Texto de apoio: Escreva dois parágrafos explicando por que você escolheu Arquitetura Hexagonal para o seu Second Brain (foco em desacoplamento e testabilidade).

3. Publicar o Relatório de Testes (Qualidade de Código)

Você já tem a estrutura de testes no Karma/Jasmine.

    O que fazer: Pegue o output do ng test --code-coverage e gere uma visualização no site.

    Ação: Não precisa ser o relatório completo, mas um badge ou uma seção que diga: "Test Coverage: X%" e mencione que você testa especificamente o ngOnDestroy para evitar memory leaks no Three.js. Isso prova que você resolveu o "Issue" crítico que estava no seu Todo.md.

4. Demonstrar a IA do CHON Group (O fator "Uau")

Isso valida a sua pesquisa acadêmica para o mercado.

    O que fazer: Integre um pequeno terminal ou chat interativo.

    Ação: Como você trabalha com tradução de linguagem natural para KQML e LLMs locais, crie uma demo onde o usuário possa digitar um comando simples e ver como o seu sistema interpretaria aquilo logicamente.

    Nota: Se não puder expor a API real por custos/segurança, faça uma simulação (mock) fiel ao funcionamento do projeto Athena para demonstrar a lógica BDI.
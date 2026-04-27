# Arquitetura do Personal Website

Este documento descreve a arquitetura detalhada do projeto **Personal Website** (Kkphoenix). A aplicação segue os princípios da Clean Architecture e Modularização, utilizando Angular 19.

## 1. Visão Geral (Overview)

O projeto é uma Single Page Application (SPA) que integra gráficos 3D (Three.js), física (Matter.js) e animações (GSAP). A arquitetura é desenhada para ser altamente performática e desacoplada.

### Tecnologias Principais
- **Framework:** Angular 19 (Componentes Standalone)
- **Gráficos 3D:** Three.js
- **Física 2D:** Matter.js
- **Animações:** GSAP
- **Estado:** RxJS (Padrão Reativo)

---

## 2. Métricas de Arquitetura (Módulos)

Abaixo estão as métricas de acoplamento e abstração calculadas para cada módulo lógico do sistema.

| Módulo | Ca | Ce | I (Instabilidade) | A (Abstração) | D (Distância) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Interfaces** | 3 | 0 | 0.00 | 1.00 | 0.00 |
| **AppRoot** | 0 | 3 | 1.00 | 0.00 | 0.00 |
| **Services** | 4 | 1 | 0.20 | 0.00 | 0.80 |
| **Pages** | 1 | 3 | 0.75 | 0.00 | 0.25 |
| **Shared** | 2 | 3 | 0.60 | 0.00 | 0.40 |
| **Elements** | 1 | 1 | 0.50 | 0.00 | 0.50 |
| **Utils** | 1 | 0 | 0.00 | 0.00 | 1.00 |

*   **Ca (Afferent Coupling):** Quantos módulos dependem deste módulo.
*   **Ce (Efferent Coupling):** De quantos módulos este módulo depende.
*   **I (Instability):** $Ce / (Ca + Ce)$. 0 = Estável, 1 = Instável.
*   **A (Abstraction):** Proporção de interfaces/classes abstratas.
*   **D (Distance):** $|A + I - 1|$. Quão longe o módulo está da "Main Sequence".

---

## 3. Estrutura Completa de Arquivos

### 3.1. App Root (`src/app/`)
Responsável pela inicialização, roteamento global e configuração do framework.
- `app.component.ts`: Layout principal e orquestração de Header/Footer.
- `app.config.ts`: Configurações globais de providers (HTTP, Router).
- `app.routes.ts`: Definição de todas as rotas da aplicação.

### 3.2. Services (`src/app/services/`)
Contém a lógica de negócio, gerenciamento de estado global e integrações com APIs.
- `animation-controller.service.ts`: Controle global de ativação de animações pesadas.
- `dark-mode-controller.service.ts`: Gerenciamento reativo do tema (Dark/White mode).
- `file-navigator-service.service.ts`: Integração com o backend para o Second Brain.
- `pdf-extraction.service.ts`: Lógica de renderização de PDFs via pdf.js.
- `side-bar-menu-controller.service.ts`: Controle de estado do menu lateral.
- `text3d.service.service.ts`: Abstração para criação de geometrias de texto 3D.
- `the-eye-controller.service.ts`: Lógica específica para o componente interativo "The Eye".

### 3.3. Pages (`src/app/pages/`)
Componentes que representam rotas e visões completas.
- `home/`: Página inicial com seções Hero, History, Portfolio e Hire Me.
- `articles/`: Hub de publicações acadêmicas com leitor de PDF integrado.
- `projects/`: Cases de estudo detalhados e arquitetura de subprojetos.
- `health/`: Dashboard de telemetria e métricas de qualidade.

### 3.4. Shared (`src/app/shared/`)
Componentes e módulos reutilizáveis em múltiplas páginas.
- `header/`: Contém o menu de navegação, botão de configurações e Texto 3D.
- `footer/`: Implementa o sistema solar interativo em Three.js.
- `shared.module.ts`: Módulo para exportação de utilitários comuns.

### 3.5. Elements (`src/app/elements/`)
Componentes isolados, geralmente pesados ou com lógica física/gráfica específica.
- `lamp/`: Componente da lâmpada interativa utilizando Matter.js. Carregado de forma assíncrona.

### 3.6. Interfaces (`src/app/interface/`)
Contratos de dados e tipagens puras.
- `IPlanet.ts`: Definição de dados para os corpos celestes do footer.
- `ITitlesResponse.ts`: Tipagem para a árvore de arquivos do backend.

### 3.7. Utils (`src/app/utils/`)
Funções utilitárias puras e helpers de infraestrutura.
- `Viewport.ts`: Helper para detecção de tamanho de tela e dispositivo (Mobile vs Desktop).

---

## 4. Roteamento e Estrutura de Páginas

As rotas são definidas em `app.routes.ts`:
- `/` -> `HomeComponent`
- `/articles` -> `ArticlesComponent` (Lista de publicações e leitor de PDF)
- `/projects` -> `ProjectsComponent` (Cases de estudo e arquitetura de subprojetos)
- `/health` -> `HealthComponent` (Telemetria de performance e cobertura de testes em tempo real)

---

## 5. Integrações Especiais

### Three.js (Gráficos 3D)
O Three.js é utilizado em três locais distintos:
1. **Header Text3D**: Renderiza a palavra "KKPHOENIX" em 3D.
2. **Footer Planet System**: Renderiza um "universo" interativo com Raycasting para cliques.
3. **History Background**: Fundo de partículas que pausa automaticamente via `IntersectionObserver`.

### Matter.js (Física 2D)
Utilizado no `LampComponent` para simular uma lâmpada pendurada com restrições físicas e interatividade por arraste.

### GSAP (Animações)
Utilizado para animações de entrada, efeitos de "chuva de ícones" e transições de abas na Home.

---

## 6. Estilização e Temas
A aplicação utiliza SCSS com variáveis globais (`src/app/styles/variables.scss`) e um sistema de temas dinâmico injetado via classes `.darkMode` e `.whiteMode` nos elementos raiz de cada componente, sincronizados pelo `DarkModeControllerService`.

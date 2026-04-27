# Project Roadmap

## 🎯 Active Issues

- [ ] **Cefet-Exams**: New page/system to list old Cefet exams, replacing the current "banco de provas".
- [ ] **SCSS Refactoring**: Improve styles using best practices (mixins, variables, proper nesting), moving away from "disguised CSS".
- [ ] **Portfolio Assets**: Produce/Gather high-quality photos for the portfolio tab.
- [ ] **GitHub API Integration**: List repositories dynamically on the projects page.
- [ ] **Custom Cursor**: Implement a custom themed cursor with an option to toggle it off.
- [ ] **Low FPS Warning**: Automatically suggest disabling physics/heavy animations if low FPS is detected.
- [ ] **Blog**: Integrated blog for software engineering ideas and deep dives.

### Sub-projects
- [ ] **Excalidraw Integration**: Embed Excalidraw or a similar tool for architectural sketches.
- [ ] **Freelance Dashboard**: A section for clients to track progress, commits, and live previews of their projects.

- [ ] Falar da arquitetura do rpg-roguelite-bullethell
- [ ] hero ainda trava os ícones


## ✅ Completed

### 🏗 Architecture & UI
- [x] **Architecture Showcase**: Dedicated page detailing the system design.
- [x] **Health Dashboard**: Real-time FPS monitoring and test coverage visualization.
- [x] **Professional History**: Visual "Book" layout using CSS 3D transforms.
- [x] **Hero Section**: Dynamic SVG "rain" with GSAP and responsive layout.
- [x] **Dark Mode**: Global reactive system toggled by a physical lamp (Matter.js).
- [x] **Performance Optimization**: `IntersectionObserver` implementation for Three.js renders.
- [x] **Responsive Design**: Fixed layouts for mobile (Header, Home, History, Portfolio).
- [x] **Dynamic Loading**: Async loading for heavy components like the Lamp (Matter.js).

### 📝 Research & Articles
- [x] **PDF Research Hub**: Integrated PDF reader and academic articles list.
- [x] **SEO**: Dynamic title and meta tag updates for publications.

### 🧪 Quality & DevOps
- [x] **Unit Testing**: Comprehensive smoke tests and logical tests for complex components.
- [x] **CI/CD Pipeline**: Automated scripts for auditing, testing (Karma), and building.
- [x] **Telemetria**: Health component displaying coverage metrics.
- [x] **Mutation Testing**: Stryker integration.

---

## 🚀 Strategic Roadmap (Future Improvements)

### 1. Advanced Telemetry
- [ ] **Memory Leak Guard**: Automated tests to validate `renderer.info.memory` drops to zero after component destruction.
- [ ] **Payload Budgets**: Ensure `matter.js` and `three.js` remain in lazy-loaded chunks.

### 2. Architectural Integrity
- [ ] **Dependency Guard**: Implement ESLint rules to prevent 3D logic from importing Angular UI dependencies (Hexagonal isolation).
- [ ] **Contract Testing**: Implement Pact.io for the Java Backend/Angular Frontend contract.

### 3. IA Integration (The "Athena" Project)
- [ ] **BDI Demo**: Interactive terminal to demonstrate Multi-Agent System (MAS) logic and BDI (Belief-Desire-Intention) mapping.

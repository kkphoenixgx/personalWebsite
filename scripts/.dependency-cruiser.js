/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Injeção Circular: Dependências recíprocas geram Memory Leaks e travam a injeção do Angular.',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-elements-to-pages',
      severity: 'error',
      comment: 'Arquitetura de Camadas: Elementos isolados (ex: lamp) não devem acoplar a lógicas de Páginas.',
      from: { path: "^src/app/elements" },
      to: { path: "^src/app/pages" }
    },
    {
      name: 'no-utils-dependencies',
      severity: 'error',
      comment: 'Arquitetura Hexagonal: Utilitários (ex: Viewport) devem ser puros e não depender de services ou shared.',
      from: { path: "^src/app/utils" },
      to: { path: "^src/app/(services|pages|elements|shared)" }
    },
    {
      name: 'services-domain-isolation',
      severity: 'warn',
      comment: 'Análise Estática: Serviços idealmente não devem importar componentes de UI diretamente.',
      from: { path: "^src/app/services" },
      to: { path: "^src/app/(shared|elements|pages)" }
    }
  ],
  options: {
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    exclude: "(node_modules|\\.spec\\.ts$)"
  }
};
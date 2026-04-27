import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Vercel Production Readiness & CI/CD Compliance', () => {

  test('[Infraestrutura] O script de "build" NÃO deve conter testes para evitar Crash de Binário de Navegador na Vercel', async () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    const buildScript = packageJson.scripts.build;

    // Contêineres da Vercel (CD) não possuem Firefox/Chrome nativos. Testes devem rodar no Github Actions (CI).
    // Se o script de build chamar `ng test`, a Vercel quebrará tentando abrir um navegador fantasma.
    expect(buildScript, 'O script "build" contém a palavra test! Isso quebrará o deploy na Vercel.').not.toMatch(/test/);

    // Valida se o Node Engine está setado (A Vercel usa isso para provisionar o ambiente base do contêiner)
    expect(packageJson.engines?.node).toBeDefined();
    
    // Registra a passagem na nossa telemetria
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    const timeStr = new Date().toLocaleTimeString();
    const msg = `[${timeStr}] [Métrica] [Produção/Vercel] Conformidade de CD validada (Build isolado de testes de UI).\n`;
    fs.appendFileSync(path.join(logDir, 'metrics.log'), msg);
    fs.appendFileSync(path.join(logDir, 'latest.log'), msg);
  });

  test('[Infraestrutura] Angular.json deve permitir matter-js e ter budgets de CSS adequados para evitar falha no build', async () => {
    const angularJsonPath = path.join(process.cwd(), 'angular.json');
    const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, 'utf8'));

    const buildOptions = angularJson.projects['personal-website'].architect.build.options;
    const buildConfigs = angularJson.projects['personal-website'].architect.build.configurations.production;

    // 1. Verifica se matter-js está na whitelist para não dar Crash de Otimização (Bailout)
    expect(buildOptions.allowedCommonJsDependencies, 
      'matter-js deve estar em allowedCommonJsDependencies no angular.json para o build não falhar.').toContain('matter-js');

    // 2. Verifica se o budget de SCSS suporta componentes com animações complexas/shaders (Mínimo de 10kB esperado)
    const componentBudget = buildConfigs.budgets.find((b: any) => b.type === 'anyComponentStyle');
    expect(componentBudget).toBeDefined();

    // Ex: Extrai os dígitos de "25kB" -> 25 e testa o threshold de segurança.
    const maxErrorVal = parseInt(componentBudget.maximumError.replace(/\D/g, ''), 10);
    expect(maxErrorVal).toBeGreaterThanOrEqual(10);

    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    const timeStr = new Date().toLocaleTimeString();
    const msg = `[${timeStr}] [Métrica] [Produção/Vercel] Conformidade de Angular.json validada (Budgets SCSS e CommonJS alinhados).\n`;
    fs.appendFileSync(path.join(logDir, 'metrics.log'), msg);
  });
});
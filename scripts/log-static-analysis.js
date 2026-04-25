const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const logDir = path.join(__dirname, '../logs');
const logPath = path.join(logDir, 'metrics.log');
const latestPath = path.join(logDir, 'latest.log');
const activeFlag = path.join(logDir, '.metrics_active');

let firstWrite = true;

function logMetric(msg) {
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
  const timeStr = new Date().toLocaleTimeString();
  const formattedMsg = `[${timeStr}] ${msg}\n`;
  
  fs.appendFileSync(logPath, formattedMsg);
  
  // Se não estiver no pipeline (flag ausente), o primeiro script limpa o latest.log
  if (firstWrite && !fs.existsSync(activeFlag)) {
    fs.writeFileSync(latestPath, `[EXECUÇÃO AVULSA] ${new Date().toLocaleString()}\n${formattedMsg}`);
    firstWrite = false;
  } else {
    fs.appendFileSync(latestPath, formattedMsg);
  }
  
  console.log(formattedMsg.trim());
}

// 1. Dependency Cruiser
try {
  const depResult = execSync('npx --yes dependency-cruiser src --config .dependency-cruiser.js --output-type json', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  const depData = JSON.parse(depResult);
  const violations = depData.summary.violations.length;
  
  if (violations === 0) {
    logMetric('[Métrica] [Arquitetura] Grafo de Dependências: 🟢 EXCELENTE (0 injeções circulares e 0 violações de camada).');
  } else {
    logMetric(`[Métrica] [Arquitetura] Grafo de Dependências: 🔴 PERIGO (${violations} violações de acoplamento detectadas).`);
  }
} catch (e) {
  if (e.stdout) {
    try {
      const depData = JSON.parse(e.stdout);
      const violations = depData.summary.violations;
      logMetric(`[Métrica] [Arquitetura] Grafo de Dependências: 🔴 PERIGO (${violations.length} violações de camada/injeção circular detectadas).`);
    } catch(err) {
      logMetric('[Métrica] [Arquitetura] Grafo de Dependências: ⚠️ Erro ao analisar o grafo.');
    }
  }
}

// 2. ESLint
try {
  execSync('node_modules/.bin/eslint "src/**/*.ts" --no-color', { encoding: 'utf8', stdio: 'pipe' });
  logMetric('[Métrica] [Qualidade] Padrões de Código: 🟢 ÓTIMO (Sem violações críticas).');
} catch (e) {
  const stdout = e.stdout || '';
  const errors = (stdout.match(/error/g) || []).length;
  const warnings = (stdout.match(/warning/g) || []).length;
  
  logMetric(`[Métrica] [Qualidade] Padrões de Código: 🔴 ALERTA (${errors} erros, ${warnings} avisos encontrados).`);
  
  const lines = stdout.split('\n').filter(l => l.includes('error') || l.includes('warning')).slice(0, 5);
  lines.forEach(l => logMetric(`    -> ${l.trim()}`));
}

// 3. Test Coverage
const coveragePath = path.join(__dirname, '../coverage/personal-website/coverage-summary.json');
const assetsCovPath = path.join(__dirname, '../src/assets/coverage.json');

if (fs.existsSync(coveragePath)) {
  try {
    const covData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const getPct = (pct) => (pct === 'Unknown' || isNaN(pct) || pct === null) ? 0 : pct;
    
    const linesPct = getPct(covData.total.lines.pct);
    const functionsPct = getPct(covData.total.functions.pct);
    const branchesPct = getPct(covData.total.branches.pct);

    const status = linesPct >= 80 ? '🟢 EXCELENTE' : (linesPct >= 60 ? '🟡 ACEITÁVEL' : '🔴 BAIXA');
    logMetric(`[Métrica] [Cobertura de Teste] Linhas: ${linesPct}% | Funções: ${functionsPct}% | Branches: ${branchesPct}% - ${status}`);
    
    fs.writeFileSync(assetsCovPath, JSON.stringify(covData));
  } catch (err) {
    logMetric('[Métrica] [Cobertura de Teste] ⚠️ Erro ao ler relatório de cobertura.');
  }
} else {
  logMetric('[Métrica] [Cobertura de Teste] ⚠️ Relatório de cobertura não encontrado.');
}
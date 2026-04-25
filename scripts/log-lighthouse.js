const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const logDir = path.join(__dirname, '../logs');
const logPath = path.join(logDir, 'metrics.log');
const latestPath = path.join(logDir, 'latest.log');
const activeFlag = path.join(logDir, '.metrics_active');

function logMetric(msg) {
  const timeStr = new Date().toLocaleTimeString();
  const formattedMsg = `[${timeStr}] ${msg}\n`;
  fs.appendFileSync(logPath, formattedMsg);
  
  if (!fs.existsSync(activeFlag)) {
    fs.writeFileSync(latestPath, `[EXECUÇÃO AVULSA] ${new Date().toLocaleString()}\n${formattedMsg}`);
  } else {
    fs.appendFileSync(latestPath, formattedMsg);
  }
  
  console.log(formattedMsg.trim());
}

console.log("\n[Sistema] Preparando auditoria do Lighthouse (DevTools)...");
const server = spawn('npx', ['--yes', 'http-server', 'dist/personal-website/browser', '-p', '4205'], { stdio: 'ignore', shell: true });

const checkServer = () => new Promise((resolve) => {
  http.get('http://localhost:4205', (res) => resolve(true)).on('error', () => resolve(false));
});

async function runLighthouse() {
  let isUp = false;
  for (let i = 0; i < 15; i++) {
    if (await checkServer()) { isUp = true; break; }
    await new Promise(r => setTimeout(r, 1000));
  }
  if (!isUp) {
    console.error("[Lighthouse] Timeout aguardando o servidor de produção.");
    server.kill(); process.exit(1);
  }

  const reportPath = path.join(__dirname, '../reports/lighthouse.json');
  if (!fs.existsSync(path.join(__dirname, '../reports'))) fs.mkdirSync(path.join(__dirname, '../reports'));

  try {
    console.log("[Sistema] Analisando Performance, SEO e Acessibilidade no Chrome Headless...");
    execSync(`npx --yes lighthouse http://localhost:4205 --output=json --output-path=${reportPath} --chrome-flags="--headless" --only-categories=performance,accessibility,best-practices,seo`, { stdio: 'ignore' });
    
    const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const perfScore = Math.round(data.categories.performance.score * 100);
    logMetric(`[Métrica] [Lighthouse/Google] Performance: ${perfScore}% | Acessibilidade: ${Math.round(data.categories.accessibility.score * 100)}% | Boas Práticas: ${Math.round(data.categories['best-practices'].score * 100)}% | SEO: ${Math.round(data.categories.seo.score * 100)}%`);

    if (perfScore < 80) {
      logMetric(`[Métrica] [Lighthouse/Google] 🚨 Detalhamento dos Gargalos de Performance:`);
      const audits = data.audits;
      if (audits['largest-contentful-paint']?.displayValue) logMetric(`[Métrica] [Lighthouse/Google]    - LCP: ${audits['largest-contentful-paint'].displayValue}`);
      if (audits['total-blocking-time']?.displayValue) logMetric(`[Métrica] [Lighthouse/Google]    - TBT: ${audits['total-blocking-time'].displayValue}`);
    }
  } catch(e) {
    console.error("Falha ao rodar o Lighthouse:", e.message);
  } finally {
    server.kill();
    process.exit(0);
  }
}
runLighthouse();
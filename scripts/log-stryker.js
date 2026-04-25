const fs = require('fs');
const path = require('path');

try {
  const reportPath = path.join(__dirname, '../reports/mutation/mutation.json');
  const logDir = path.join(__dirname, '../logs');
  const logPath = path.join(logDir, 'metrics.log');
  const latestPath = path.join(logDir, 'latest.log');
  const activeFlag = path.join(logDir, '.metrics_active');

  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

  if (fs.existsSync(reportPath)) {
    const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    let metricsObj = data.metrics || (data.systemContext && data.systemContext.metrics);
    
    if (!metricsObj) {
      let killed = 0;
      let totalValid = 0;
      Object.values(data.files || {}).forEach(file => {
        file.mutants.forEach(mutant => {
          if (mutant.status === 'Killed') killed++;
          if (['Killed', 'Survived'].includes(mutant.status)) totalValid++;
        });
      });
      metricsObj = { killed, totalValid, mutationScore: totalValid > 0 ? (killed / totalValid) * 100 : 0 };
    }

    const score = metricsObj.mutationScore || 0;
    const killed = metricsObj.killed || 0;
    const total = metricsObj.totalValid || 0;
    const timeStr = new Date().toLocaleTimeString();
    const scoreFormatted = Number(score).toFixed(2);
    
    let status = '🔴 PERIGO (Blindagem Crítica)';
    if (score >= 80) status = '🟢 EXCELENTE (Alta blindagem)';
    else if (score >= 60) status = '🟡 ACEITÁVEL (Sobreviventes detectados)';

    const msg = `[${timeStr}] [Métrica] [Mutação] Stryker finalizado! Mutantes Mortos: ${killed}/${total} | Cobertura Real (Mutation Score): ${scoreFormatted}% - ${status}\n`;

    fs.appendFileSync(logPath, msg);
    
    // Se não estiver no pipeline, limpa o log
    if (!fs.existsSync(activeFlag)) {
       fs.writeFileSync(latestPath, `[EXECUÇÃO AVULSA] ${new Date().toLocaleString()}\n${msg}`);
    } else {
       fs.appendFileSync(latestPath, msg);
    }
    
    console.log(msg.trim());
  } else {
    console.log("\n[Aviso] Relatório JSON do Stryker não encontrado.");
  }
} catch(e) {
  console.error("Erro ao registrar métrica do Stryker: ", e.message);
}
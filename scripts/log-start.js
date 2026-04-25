const fs = require('fs');
const path = require('path');
const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const dateStr = new Date().toLocaleString();
const header = `====================================================================================================
=================================== 🚀 NOVA EXECUÇÃO DE MÉTRICAS 🚀 ================================
====================================================================================================
[SISTEMA] Execução iniciada em: ${dateStr}
`;

// Ativa o modo de acumulação para o pipeline
fs.writeFileSync(path.join(logDir, '.metrics_active'), 'true');

// "latest.log" sempre refletirá apenas a ÚLTIMA execução completa do pipeline.
fs.writeFileSync(path.join(logDir, 'latest.log'), header);

// "metrics.log" continua sendo o histórico acumulado, mas com separadores claros.
fs.appendFileSync(path.join(logDir, 'metrics.log'), `\n${header}`);

console.log(header.trim());
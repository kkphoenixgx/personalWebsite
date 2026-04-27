const fs = require('fs');
const path = require('path');
const logDir = path.join(__dirname, '../logs');

const footer = `\n====================================================================================================\n=================================== 🏁 FIM DA EXECUÇÃO DE MÉTRICAS 🏁 ==============================\n====================================================================================================\n\n`;
fs.appendFileSync(path.join(logDir, 'latest.log'), footer);
fs.appendFileSync(path.join(logDir, 'metrics.log'), footer);

// Remove o flag de pipeline ativo
const activeFlag = path.join(logDir, '.metrics_active');
if (fs.existsSync(activeFlag)) fs.unlinkSync(activeFlag);

console.log(footer.trim());
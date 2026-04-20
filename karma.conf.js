const fs = require('fs');
const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-firefox-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      {
        'reporter:metrics-logger': ['type', function() {
          const logDir = path.join(__dirname, 'logs');
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
          
          const latestLogPath = path.join(logDir, 'latest.log');
          const metricsLogPath = path.join(logDir, 'metrics.log');

          // Limpa o arquivo latest.log toda vez que uma nova bateria de testes começar
          this.onRunStart = function() {
            const dateStr = new Date().toLocaleString();
            const header = `\n====================================================================================================\n[SISTEMA] Execução iniciada em: ${dateStr}\n====================================================================================================\n`;
            fs.writeFileSync(latestLogPath, header);
            fs.appendFileSync(metricsLogPath, header);
          };

          this.onBrowserLog = function(browser, log, type) {
            // Intercepta qualquer console log que venha dos testes de métrica
            if (typeof log === 'string' && (log.includes('[Métrica]') || log.includes('===='))) {
              // Limpa formatação bruta e insere no arquivo
              let cleanLog = log.replace(/^'|'$/g, '').replace(/\\n/g, '\n');
              
              if (!cleanLog.includes('====')) {
                const timeStr = new Date().toLocaleTimeString();
                cleanLog = `[${timeStr}] ${cleanLog}`;
              }
              
              fs.appendFileSync(metricsLogPath, cleanLog + '\n');
              fs.appendFileSync(latestLogPath, cleanLog + '\n');
            }
          };
        }]
      }
    ],
    client: {
      jasmine: { }
    },
    jasmineHtmlReporter: {
      suppressAll: true 
    },
    // Adicionamos nosso extrator de logs à lista de executores
    reporters: ['kjhtml', 'metrics-logger'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Firefox'],
    singleRun: false,
    restartOnFileChange: true
  });
};
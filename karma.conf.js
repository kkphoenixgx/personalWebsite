const fs = require('fs');
const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      {
        'reporter:metrics-logger': ['type', function() {
          this.onBrowserLog = function(browser, log, type) {
            // Intercepta qualquer console log que venha dos testes de métrica
            if (typeof log === 'string' && log.includes('[Métrica]')) {
              const logDir = path.join(__dirname, 'logs');
              if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
              
              // Limpa formatação bruta e insere no arquivo
              const cleanLog = log.replace(/^'|'$/g, '').replace(/\\n/g, '\n');
              fs.appendFileSync(path.join(logDir, 'metrics.log'), cleanLog + '\n');
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
    reporters: ['progress', 'kjhtml', 'metrics-logger'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true
  });
};
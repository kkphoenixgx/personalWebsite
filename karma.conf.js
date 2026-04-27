const fs = require('fs');
const path = require('path');

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-firefox-launcher'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
      {
        'reporter:metrics-logger': ['type', function() {
          const logDir = path.join(__dirname, 'logs');
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
          
          const latestLogPath = path.join(logDir, 'latest.log');
          const metricsLogPath = path.join(logDir, 'metrics.log');
          const activeFlag = path.join(logDir, '.metrics_active');

          let sessionCleared = false;

          this.onBrowserLog = function(browser, log, type) {
            if (typeof log === 'string' && (log.includes('[Métrica]') || log.includes('===='))) {
              let cleanLog = log.replace(/^'|'$/g, '').replace(/\\n/g, '\n').trim();
              
              if (!cleanLog.includes('====')) {
                const timeStr = new Date().toLocaleTimeString();
                cleanLog = `[${timeStr}] ${cleanLog}`;
              }
              
              fs.appendFileSync(metricsLogPath, cleanLog + '\n');

              const isInPipeline = fs.existsSync(activeFlag);

              if (!isInPipeline && !sessionCleared) {
                fs.writeFileSync(latestLogPath, `[TESTE UNITÁRIO AVULSO] ${new Date().toLocaleString()}\n${cleanLog}\n`);
                sessionCleared = true;
              } else {
                fs.appendFileSync(latestLogPath, cleanLog + '\n');
              }
            }
          };
        }]
      }
    ],
    client: {
      jasmine: { }
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/personal-website'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'json-summary' }
      ]
    },
    jasmineHtmlReporter: {
      suppressAll: true 
    },
    // Adicionamos 'coverage' para engatilhar o relatório estruturado
    reporters: ['progress', 'kjhtml', 'metrics-logger', 'coverage'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader']
      }
    },
    singleRun: false,
    restartOnFileChange: true
  });
};
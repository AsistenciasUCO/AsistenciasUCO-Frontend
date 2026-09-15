// Config estándar de Angular/Karma. Existe solo para poder añadir el
// reporter `lcovonly` (coverageReporter.reporters) además de html/
// text-summary, de forma que scripts/check-realtime-coverage.mjs pueda leer
// coverage/gestio-asistencia-frontend/lcov.info. Pasar un `karmaConfig`
// personalizado a @angular-devkit/build-angular:karma le pide a ESTE archivo
// que declare frameworks/plugins/reporters completos (el builder no rellena
// los suyos por defecto en ese caso), así que replica la config por defecto
// de Angular 18 tal cual.

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
    ],
    client: {
      jasmine: {},
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/gestio-asistencia-frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcovonly', file: 'lcov.info' },
      ],
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
  });
};

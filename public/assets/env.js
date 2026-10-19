(function (window) {
  window.env = window.env || {};
  var host = window.location.hostname || 'localhost';
  window.env['API_URL'] = 'http://' + host + ':8080/api/v1';
  window.env['KEYCLOAK_URL'] = 'http://' + host + ':8081';
  window.env['KEYCLOAK_REALM'] = 'asistencias-uco';
  window.env['KEYCLOAK_CLIENT_ID'] = 'asistencias-uco-frontend';
  window.env['USE_MOCKS'] = 'false';
  window.env['SECURITY_BASELINE_ENABLED'] = 'false';
})(this);

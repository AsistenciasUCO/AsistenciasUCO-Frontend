(function (window) {
  window.env = window.env || {};
  window.env['API_URL'] = 'http://localhost:8080/api/v1';
  window.env['KEYCLOAK_URL'] = 'http://127.0.0.1:8081';
  window.env['KEYCLOAK_REALM'] = 'asistencias-uco';
  window.env['KEYCLOAK_CLIENT_ID'] = 'asistencias-frontend';
  window.env['USE_MOCKS'] = 'false';
})(this);

(function (window) {
  window.env = window.env || {};
  window.env['API_URL'] = 'http://localhost:8080/api/v1';
  // Switch de Seguridad: Modo Propio (8081 / asistencias-uco)
  window.env['KEYCLOAK_URL'] = 'http://127.0.0.1:8081';
  window.env['KEYCLOAK_REALM'] = 'asistencias-uco';
  window.env['KEYCLOAK_CLIENT_ID'] = 'asistencias-uco-frontend';
  window.env['USE_MOCKS'] = 'false';
  window.env['SECURITY_BASELINE_ENABLED'] = 'false';
})(this);

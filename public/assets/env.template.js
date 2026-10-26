(function (window) {
  window.env = window.env || {};
  window.env['API_URL'] = '${API_URL}';
  window.env['KEYCLOAK_URL'] = '${KEYCLOAK_URL}';
  window.env['KEYCLOAK_REALM'] = '${KEYCLOAK_REALM}';
  window.env['KEYCLOAK_CLIENT_ID'] = '${KEYCLOAK_CLIENT_ID}';
  window.env['USE_MOCKS'] = '${USE_MOCKS}';
  window.env['SECURITY_PROVIDER'] = '${SECURITY_PROVIDER}';
  window.env['SECURITY_BASELINE_URL'] = '${SECURITY_BASELINE_URL}';
  window.env['SECURITY_BASELINE_APPLICATION_NAME'] = '${SECURITY_BASELINE_APPLICATION_NAME}';
})(this);

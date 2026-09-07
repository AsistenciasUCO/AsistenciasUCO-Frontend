export const environment = {
  production: false,
  apiUrl: window.env?.API_URL || 'http://localhost:8080/api/v1',
  useFrontendMocks: window.env?.USE_MOCKS === 'true' || false,
  features: {
    sessionsEnabled: false,
    attendanceEnabled: false,
  },
  keycloak: {
    url: window.env?.KEYCLOAK_URL || 'http://127.0.0.1:8081',
    realm: window.env?.KEYCLOAK_REALM || 'asistencias-uco',
    clientId: window.env?.KEYCLOAK_CLIENT_ID || 'asistencias-frontend',
  },
};

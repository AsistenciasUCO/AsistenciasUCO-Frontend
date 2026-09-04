export const environment = {
  production: false,
  apiUrl: (window as any)['env']?.['API_URL'] || 'http://localhost:8080/api/v1',
  useMocks:
    typeof localStorage !== 'undefined' && localStorage.getItem('USE_MOCKS') !== null
      ? localStorage.getItem('USE_MOCKS') === 'true'
      : (window as any)['env']?.['USE_MOCKS'] === 'false'
        ? false
        : true,
  keycloak: {
    url: (window as any)['env']?.['KEYCLOAK_URL'] || 'http://127.0.0.1:8081',
    realm: (window as any)['env']?.['KEYCLOAK_REALM'] || 'asistencias-uco',
    clientId: (window as any)['env']?.['KEYCLOAK_CLIENT_ID'] || 'asistencias-uco-frontend',
  },
};

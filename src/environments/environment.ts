function getHost(): string {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
}

export const environment = {
  production: false,
  get apiUrl(): string {
    const explicit = (window as any)['env']?.['API_URL'];
    if (explicit) return explicit;
    const host = getHost();
    return `http://${host}:8080/api/v1`;
  },
  get useFrontendMocks(): boolean {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('USE_MOCKS') !== null) {
      return localStorage.getItem('USE_MOCKS') === 'true';
    }
    return (window as any)['env']?.['USE_MOCKS'] === 'true' || false;
  },
  get useMocks(): boolean {
    return this.useFrontendMocks;
  },
  features: {
    sessionsEnabled: true,
    attendanceEnabled: true,
  },
  keycloak: {
    get url(): string {
      const explicit = (window as any)['env']?.['KEYCLOAK_URL'];
      if (explicit) return explicit;
      const host = getHost();
      return `http://${host}:8081`;
    },
    realm: (window as any)['env']?.['KEYCLOAK_REALM'] || 'asistencias-uco',
    clientId: (window as any)['env']?.['KEYCLOAK_CLIENT_ID'] || 'asistencias-uco-frontend',
  },
};


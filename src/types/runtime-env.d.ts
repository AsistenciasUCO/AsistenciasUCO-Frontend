interface RuntimeEnv {
  API_URL?: string;
  KEYCLOAK_URL?: string;
  KEYCLOAK_REALM?: string;
  KEYCLOAK_CLIENT_ID?: string;
  USE_MOCKS?: string;
  SECURITY_PROVIDER?: string;
  SECURITY_BASELINE_URL?: string;
  SECURITY_BASELINE_ISSUER_URL?: string;
  SECURITY_BASELINE_CLIENT_ID?: string;
}

declare global {
  interface Window {
    env?: RuntimeEnv;
  }
}

export {};

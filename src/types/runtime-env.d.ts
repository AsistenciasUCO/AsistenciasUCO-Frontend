interface RuntimeEnv {
  API_URL?: string;
  KEYCLOAK_URL?: string;
  KEYCLOAK_REALM?: string;
  KEYCLOAK_CLIENT_ID?: string;
  USE_MOCKS?: string;
  SECURITY_PROVIDER?: string;
  SECURITY_BASELINE_URL?: string;
  SECURITY_BASELINE_APPLICATION_NAME?: string;
}

declare global {
  interface Window {
    env?: RuntimeEnv;
  }
}

export {};

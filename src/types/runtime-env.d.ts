interface RuntimeEnv {
  API_URL?: string;
  KEYCLOAK_URL?: string;
  KEYCLOAK_REALM?: string;
  KEYCLOAK_CLIENT_ID?: string;
  USE_MOCKS?: string;
  USE_SESSIONS_V2?: string;
}

declare global {
  interface Window {
    env?: RuntimeEnv;
  }
}

export {};

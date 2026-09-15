#!/bin/sh
set -eu

template="/usr/share/nginx/html/assets/env.template.js"
target="/usr/share/nginx/html/assets/env.js"

if [ -f "$template" ]; then
  API_URL="${API_URL:-http://localhost:8080/api/v1}"
  KEYCLOAK_URL="${KEYCLOAK_URL:-http://127.0.0.1:8081}"
  KEYCLOAK_REALM="${KEYCLOAK_REALM:-asistencias-uco}"
  KEYCLOAK_CLIENT_ID="${KEYCLOAK_CLIENT_ID:-asistencias-uco-frontend}"
  USE_MOCKS="${USE_MOCKS:-false}"

  export API_URL KEYCLOAK_URL KEYCLOAK_REALM KEYCLOAK_CLIENT_ID USE_MOCKS
  envsubst '${API_URL} ${KEYCLOAK_URL} ${KEYCLOAK_REALM} ${KEYCLOAK_CLIENT_ID} ${USE_MOCKS}' < "$template" > "$target"
fi

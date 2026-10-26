import { Injectable } from '@angular/core';

/** Navegación de página completa (login/logout OIDC): aislada para poder sustituirla en pruebas. */
@Injectable({ providedIn: 'root' })
export class BrowserNavigator {
  assign(url: string): void {
    window.location.assign(url);
  }
}

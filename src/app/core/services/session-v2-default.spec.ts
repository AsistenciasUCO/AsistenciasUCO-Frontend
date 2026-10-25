import { environment } from '../../../environments/environment';

describe('Session V2 local default', () => {
  let previousRuntimeEnv: Record<string, unknown> | undefined;

  afterEach(() => {
    localStorage.removeItem('USE_SESSIONS_V2');
    if (previousRuntimeEnv === undefined) delete (window as any).env;
    else (window as any).env = previousRuntimeEnv;
  });

  it('ignora el opt-out histórico de localStorage y mantiene UTC V2', () => {
    localStorage.setItem('USE_SESSIONS_V2', 'false');

    expect(environment.useSessionsV2).toBeTrue();
  });

  it('ignora también un valor runtime falso y mantiene UTC V2', () => {
    previousRuntimeEnv = (window as any).env;
    (window as any).env = { ...(previousRuntimeEnv ?? {}), USE_SESSIONS_V2: 'false' };

    expect(environment.useSessionsV2).toBeTrue();
  });
});

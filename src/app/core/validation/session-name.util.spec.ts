import {
  SESSION_NAME_MAX_LENGTH,
  SESSION_NAME_MIN_LENGTH,
  getSessionNameError,
} from './session-name.util';

describe('session name validation (BACKEND_GOLDEN_PATH_CONTRACT §C: 1..50)', () => {
  it('expone los límites contractuales', () => {
    expect(SESSION_NAME_MIN_LENGTH).toBe(1);
    expect(SESSION_NAME_MAX_LENGTH).toBe(50);
  });

  it('acepta 1 y 50 caracteres', () => {
    expect(getSessionNameError('a')).toBeNull();
    expect(getSessionNameError('x'.repeat(50))).toBeNull();
  });

  it('rechaza vacío, solo espacios y 51 caracteres', () => {
    expect(getSessionNameError('')).toContain('obligatorio');
    expect(getSessionNameError('   ')).toContain('obligatorio');
    expect(getSessionNameError('x'.repeat(51))).toContain('entre 1 y 50');
  });

  it('mide la longitud tras recortar espacios, como se envía', () => {
    expect(getSessionNameError(`  ${'x'.repeat(50)}  `)).toBeNull();
  });
});

import { User, effectiveRoles, hasAnyRole } from './user.model';

describe('roles efectivos del usuario', () => {
  const base = (role: User['role'], roles?: User['roles']): Pick<User, 'role' | 'roles'> => ({ role, roles });

  it('incluye siempre el rol principal y normaliza ADMIN a ADMINISTRADOR sin duplicados', () => {
    expect(effectiveRoles(base('ADMIN'))).toEqual(['ADMINISTRADOR']);
    expect(effectiveRoles(base('DOCENTE', ['DOCENTE', 'ESTUDIANTE']))).toEqual(['DOCENTE', 'ESTUDIANTE']);
    expect(effectiveRoles(base('DECANO'))).toEqual(['DECANO']);
  });

  it('hasAnyRole acepta si algún rol efectivo está permitido y rechaza si ninguno lo está', () => {
    const usuario = base('COORDINADOR', ['COORDINADOR', 'DOCENTE']);

    expect(hasAnyRole(usuario, ['DOCENTE'])).toBeTrue();
    expect(hasAnyRole(usuario, ['ESTUDIANTE', 'DECANO'])).toBeFalse();
    expect(hasAnyRole(base('ADMIN'), ['ADMINISTRADOR'])).toBeTrue();
    expect(hasAnyRole(usuario, [])).toBeFalse();
  });
});

import {
  getPasswordValidationError,
  parseIdentificationNumber,
  validateInstitutionalEmail,
} from './request-form-validation.util';

describe('request form validation utilities', () => {
  it('acepta una identificación válida y normaliza espacios', () => {
    expect(parseIdentificationNumber(' 123456 ')).toEqual({ valid: true, value: 123456 });
  });

  it('rechaza cada forma inválida de identificación', () => {
    const invalidInputs = [
      '',
      '12A456',
      '0123456',
      '12345',
      '12345678901',
      '2147483648',
    ];

    for (const input of invalidInputs) {
      const result = parseIdentificationNumber(input);
      expect(result.valid).toBeFalse();
      if (!result.valid) {
        expect(result.error).toBeTruthy();
      }
    }
  });

  it('acepta una contraseña explícita que cumple el contrato', () => {
    expect(getPasswordValidationError('ClaveSegura1!', '123456')).toBeUndefined();
  });

  it('rechaza contraseñas vacías, débiles o iguales a la identificación', () => {
    const invalidCases: Array<[string, string]> = [
      ['', '123456'],
      ['Corta1!', '123456'],
      ['Clave Con1!', '123456'],
      ['clavesegura1!', '123456'],
      ['CLAVESEGURA1!', '123456'],
      ['ClaveSegura!!', '123456'],
      ['ClaveSegura12', '123456'],
      ['Abcdef1!', 'Abcdef1!'],
    ];

    for (const [password, identification] of invalidCases) {
      expect(getPasswordValidationError(password, identification)).toBeTruthy();
    }
  });

  it('valida el formato del correo institucional sin imponer un dominio', () => {
    expect(validateInstitutionalEmail('')).toEqual({
      valid: false,
      error: 'El campo Correo Institucional es obligatorio.',
    });
    expect(validateInstitutionalEmail('correo-invalido').valid).toBeFalse();
    expect(validateInstitutionalEmail('  docente@uco.edu.co  ')).toEqual({ valid: true });
  });
});

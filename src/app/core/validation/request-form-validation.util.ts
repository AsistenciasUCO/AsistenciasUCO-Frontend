const BACKEND_INTEGER_MAX = 2_147_483_647;
const PASSWORD_SPECIAL_CHARS = '!@#$%^&*()_+-=%';

export type IdentificationNumberResult =
  | { valid: true; value: number }
  | { valid: false; error: string };

export function parseIdentificationNumber(
  input: string
): IdentificationNumberResult {
  const normalized = input.trim();

  if (!normalized) {
    return {
      valid: false,
      error: 'El número de identificación es obligatorio.',
    };
  }

  if (!/^\d+$/.test(normalized)) {
    return {
      valid: false,
      error: 'Debe ser un número entero positivo.',
    };
  }

  if (normalized.startsWith('0')) {
    return {
      valid: false,
      error: 'Debe ser positivo y no comenzar con cero.',
    };
  }

  if (normalized.length < 6 || normalized.length > 10) {
    return {
      valid: false,
      error: 'Debe contener entre 6 y 10 dígitos.',
    };
  }

  const value = Number(normalized);

  if (!Number.isInteger(value) || value > BACKEND_INTEGER_MAX) {
    return {
      valid: false,
      error: 'El número excede el rango permitido por el sistema.',
    };
  }

  return { valid: true, value };
}

export function getPasswordValidationError(
  password: string,
  identificationNumber: string
): string | undefined {
  if (!password) {
    return 'La contraseña es obligatoria.';
  }

  if (password.length < 8 || password.length > 255) {
    return 'Debe contener entre 8 y 255 caracteres.';
  }

  if (/\s/.test(password)) {
    return 'No debe contener espacios.';
  }

  if (!/\p{Lu}/u.test(password)) {
    return 'Debe incluir al menos una letra mayúscula.';
  }

  if (!/\p{Ll}/u.test(password)) {
    return 'Debe incluir al menos una letra minúscula.';
  }

  if (!/\p{Nd}/u.test(password)) {
    return 'Debe incluir al menos un número.';
  }

  const hasAllowedSpecialCharacter = Array.from(password).some((character) =>
    PASSWORD_SPECIAL_CHARS.includes(character)
  );

  if (!hasAllowedSpecialCharacter) {
    return 'Debe incluir al menos un carácter especial permitido.';
  }

  if (password === identificationNumber.trim()) {
    return 'La contraseña no debe ser igual al número de identificación.';
  }

  return undefined;
}

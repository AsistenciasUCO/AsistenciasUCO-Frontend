import { User, UserRole } from '../models/user.model';

/**
 * Data Transfer Object (DTO) para la entidad Usuario del Backend.
 */
export interface UserDTO {
  id_usuario: string;
  tipo_identificacion_id?: string | null;
  numero_identificacion?: string | number | null;
  primer_nombre?: string | null;
  segundo_nombre?: string | null;
  primer_apellido?: string | null;
  segundo_apellido?: string | null;
  nombre_completo: string;
  correo_electronico: string;
  rol_sistema: string;
  avatar_url?: string | null;
  nombre_institucion: string;
  departamento_facultad?: string | null;
  telefono_contacto?: string | null;
  correo_alternativo?: string | null;
  estado_cuenta: 'active' | 'inactive';
}

/**
 * Mapper para la conversión bidireccional entre UserDTO y el modelo User.
 */
export class UserMapper {
  static fromDTO(dto: UserDTO): User {
    return {
      id: dto.id_usuario,
      tipoIdentificacionId: dto.tipo_identificacion_id ?? undefined,
      numeroIdentificacion: dto.numero_identificacion ?? undefined,
      primerNombre: dto.primer_nombre ?? undefined,
      segundoNombre: dto.segundo_nombre ?? undefined,
      primerApellido: dto.primer_apellido ?? undefined,
      segundoApellido: dto.segundo_apellido ?? undefined,
      name: dto.nombre_completo,
      email: dto.correo_electronico,
      role: (dto.rol_sistema as UserRole) || 'DOCENTE',
      avatarUrl: dto.avatar_url ?? undefined,
      institutionName: dto.nombre_institucion,
      department: dto.departamento_facultad ?? undefined,
      telefono: dto.telefono_contacto ?? undefined,
      correoAlternativo: dto.correo_alternativo ?? undefined,
      status: dto.estado_cuenta,
    };
  }

  static toDTO(model: User): UserDTO {
    return {
      id_usuario: model.id,
      tipo_identificacion_id: model.tipoIdentificacionId ?? null,
      numero_identificacion: model.numeroIdentificacion ?? null,
      primer_nombre: model.primerNombre ?? null,
      segundo_nombre: model.segundoNombre ?? null,
      primer_apellido: model.primerApellido ?? null,
      segundo_apellido: model.segundoApellido ?? null,
      nombre_completo: model.name,
      correo_electronico: model.email,
      rol_sistema: model.role,
      avatar_url: model.avatarUrl ?? null,
      nombre_institucion: model.institutionName,
      departamento_facultad: model.department ?? null,
      telefono_contacto: model.telefono ?? null,
      correo_alternativo: model.correoAlternativo ?? null,
      estado_cuenta: model.status,
    };
  }
}

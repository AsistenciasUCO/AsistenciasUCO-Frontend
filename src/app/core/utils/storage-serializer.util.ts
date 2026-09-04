/**
 * Utilidad de Serialización y Deserialización Segura para Almacenamiento Local (LocalStorage).
 * Gestiona el ciclo de vida: Objeto/Modelo <-> DTO <-> String JSON con manejo de errores y tipado estricto.
 */
export class StorageSerializer {
  /**
   * Serializa un objeto directamente a JSON en localStorage.
   */
  static serialize<T>(key: string, data: T): boolean {
    try {
      const jsonText = JSON.stringify(data);
      localStorage.setItem(key, jsonText);
      return true;
    } catch (error) {
      console.warn(`[StorageSerializer] Error al serializar la clave "${key}":`, error);
      return false;
    }
  }

  /**
   * Deserializa una cadena JSON desde localStorage al tipo especificado.
   */
  static deserialize<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch (error) {
      console.warn(`[StorageSerializer] Error al deserializar la clave "${key}":`, error);
      return fallback;
    }
  }

  /**
   * Serializa un arreglo de Modelos de UI transformándolos previamente a DTOs mediante su Mapper.
   */
  static serializeWithMapper<DTO, Model>(
    key: string,
    models: Model[],
    mapper: (model: Model) => DTO
  ): boolean {
    const dtos = models.map(mapper);
    return this.serialize<DTO[]>(key, dtos);
  }

  /**
   * Deserializa un arreglo de DTOs almacenados como JSON y los transforma a Modelos de UI mediante su Mapper.
   */
  static deserializeWithMapper<DTO, Model>(
    key: string,
    mapper: (dto: DTO) => Model,
    fallback: Model[] = []
  ): Model[] {
    const rawDtos = this.deserialize<DTO[]>(key, []);
    if (!rawDtos || !Array.isArray(rawDtos) || rawDtos.length === 0) {
      return fallback;
    }
    return rawDtos.map(mapper);
  }

  /**
   * Elimina un elemento del almacenamiento local.
   */
  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[StorageSerializer] Error al eliminar la clave "${key}":`, error);
    }
  }
}

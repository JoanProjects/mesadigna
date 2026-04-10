export class ApiError extends Error {
  status: number;
  errors: string[] | null;
  fieldErrors?: Record<string, string[]>;

  constructor(status: number, message: string, errors: string[] | null = null, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.fieldErrors = fieldErrors;
  }

  static fromResponse(status: number, body: Record<string, unknown>): ApiError {
    const message = (body.message as string) || getDefaultMessage(status);
    const errors = (body.errors as string[] | null) || null;
    const fieldErrors = body.fieldErrors as Record<string, string[]> | undefined;
    return new ApiError(status, message, errors, fieldErrors);
  }
}

function getDefaultMessage(status: number): string {
  switch (status) {
    case 400: return 'Solicitud inválida.';
    case 401: return 'Sesión expirada. Inicie sesión nuevamente.';
    case 403: return 'No tiene permisos para realizar esta acción.';
    case 404: return 'Recurso no encontrado.';
    case 409: return 'Ya existe un registro con estos datos.';
    case 422: return 'Error de validación.';
    case 500: return 'Error interno del servidor.';
    default: return 'Error de conexión. Intente nuevamente.';
  }
}

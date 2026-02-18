export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // isOperational indica que es un error previsto de negocio, no un bug no controlado o imprevisto
    this.isOperational = true; 
    
    // Restaurar la cadena de prototipos (Fix para TypeScript/V8)
    Object.setPrototypeOf(this, new.target.prototype);
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado o credenciales inválidas') {
    super(message, 401);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Datos de validación incorrectos') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto en la base de datos (Ej. registro duplicado)') {
    super(message, 409);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
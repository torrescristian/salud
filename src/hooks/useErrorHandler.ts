import { useCallback } from 'react';
import { config } from '../config/environment';

export interface ErrorInfo {
  message: string;
  code?: string;
  details?: any;
  severity: 'error' | 'warning' | 'info';
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: any): ErrorInfo => {
    // Si es un error de red
    if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
      return {
        message: 'Error de conexión. Verifica tu conexión a internet.',
        code: 'NETWORK_ERROR',
        severity: 'error',
      };
    }

    // Si es un error de timeout
    if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
      return {
        message: 'La operación tardó demasiado. Intenta nuevamente.',
        code: 'TIMEOUT',
        severity: 'warning',
      };
    }

    // Si es un error de validación
    if (error?.code === 'VALIDATION_ERROR' || error?.message?.includes('validation')) {
      return {
        message: 'Los datos ingresados no son válidos. Revisa la información.',
        code: 'VALIDATION_ERROR',
        severity: 'warning',
        details: error.details,
      };
    }

    // Si es un error de autenticación
    if (error?.status === 401 || error?.code === 'UNAUTHORIZED') {
      return {
        message: 'Sesión expirada. Inicia sesión nuevamente.',
        code: 'UNAUTHORIZED',
        severity: 'error',
      };
    }

    // Si es un error de permisos
    if (error?.status === 403 || error?.code === 'FORBIDDEN') {
      return {
        message: 'No tienes permisos para realizar esta acción.',
        code: 'FORBIDDEN',
        severity: 'error',
      };
    }

    // Si es un error del servidor
    if (error?.status >= 500) {
      return {
        message: 'Error del servidor. Intenta más tarde.',
        code: 'SERVER_ERROR',
        severity: 'error',
      };
    }

    // Si es un error personalizado con mensaje
    if (error?.message) {
      return {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
        severity: 'error',
        details: error.details,
      };
    }

    // Error genérico
    return {
      message: 'Ha ocurrido un error inesperado. Intenta nuevamente.',
      code: 'UNKNOWN_ERROR',
      severity: 'error',
    };
  }, []);

  const logError = useCallback((error: any, context?: string) => {
    if (config.app.debug) {
      console.error(`[${context || 'App'}] Error:`, error);
    }
  }, []);

  const isNetworkError = useCallback((error: any): boolean => {
    return error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR';
  }, []);

  const isValidationError = useCallback((error: any): boolean => {
    return error?.code === 'VALIDATION_ERROR' || error?.message?.includes('validation');
  }, []);

  const isAuthError = useCallback((error: any): boolean => {
    return error?.status === 401 || error?.code === 'UNAUTHORIZED';
  }, []);

  return {
    handleError,
    logError,
    isNetworkError,
    isValidationError,
    isAuthError,
  };
};

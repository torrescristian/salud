import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useErrorHandler } from "../../hooks/useErrorHandler";

describe("useErrorHandler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle network errors correctly", () => {
    const { result } = renderHook(() => useErrorHandler());

    const networkError = new Error("Network Error");
    networkError.name = "NetworkError";

    const errorInfo = result.current.handleError(networkError);

    expect(errorInfo.message).toContain("Error de conexión");
    expect(errorInfo.severity).toBe("error");
    expect(result.current.isNetworkError(networkError)).toBe(true);
  });

  it("should handle validation errors correctly", () => {
    const { result } = renderHook(() => useErrorHandler());

    const validationError = {
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      details: { field: "email" },
    };

    const errorInfo = result.current.handleError(validationError);

    expect(errorInfo.message).toBe(
      "Los datos ingresados no son válidos. Revisa la información."
    );
    expect(errorInfo.severity).toBe("warning");
    expect(result.current.isValidationError(validationError)).toBe(true);
  });

  it("should handle authentication errors correctly", () => {
    const { result } = renderHook(() => useErrorHandler());

    const authError = {
      status: 401,
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    };

    const errorInfo = result.current.handleError(authError);

    expect(errorInfo.message).toBe(
      "Sesión expirada. Inicia sesión nuevamente."
    );
    expect(errorInfo.severity).toBe("error");
    expect(result.current.isAuthError(authError)).toBe(true);
  });

  it("should handle unknown errors correctly", () => {
    const { result } = renderHook(() => useErrorHandler());

    const unknownError = new Error("Something went wrong");

    const errorInfo = result.current.handleError(unknownError);

    expect(errorInfo.message).toBe("Something went wrong");
    expect(errorInfo.severity).toBe("error");
    expect(result.current.isNetworkError(unknownError)).toBe(false);
    expect(result.current.isValidationError(unknownError)).toBe(false);
    expect(result.current.isAuthError(unknownError)).toBe(false);
  });

  it("should handle errors with custom codes", () => {
    const { result } = renderHook(() => useErrorHandler());

    const customError = {
      message: "Custom error",
      code: "CUSTOM_001",
      details: { field: "email" },
    };

    const errorInfo = result.current.handleError(customError);

    expect(errorInfo.message).toBe("Custom error");
    expect(errorInfo.code).toBe("CUSTOM_001");
    expect(errorInfo.details).toEqual({ field: "email" });
    expect(errorInfo.severity).toBe("error");
  });

  it("should identify network errors by name", () => {
    const { result } = renderHook(() => useErrorHandler());

    const networkError = new Error("Network failed");
    networkError.name = "NetworkError";

    expect(result.current.isNetworkError(networkError)).toBe(true);
  });

  it("should identify network errors by code", () => {
    const { result } = renderHook(() => useErrorHandler());

    const networkError = {
      code: "NETWORK_ERROR",
      message: "Failed to fetch",
    };

    expect(result.current.isNetworkError(networkError)).toBe(true);
  });

  it("should identify validation errors by code", () => {
    const { result } = renderHook(() => useErrorHandler());

    const validationError = {
      code: "VALIDATION_ERROR",
      message: "Invalid input",
    };

    expect(result.current.isValidationError(validationError)).toBe(true);
  });

  it("should identify validation errors by message", () => {
    const { result } = renderHook(() => useErrorHandler());

    const validationError = {
      message: "validation failed",
    };

    expect(result.current.isValidationError(validationError)).toBe(true);
  });

  it("should identify auth errors by status", () => {
    const { result } = renderHook(() => useErrorHandler());

    const authError = {
      status: 401,
      message: "Access denied",
    };

    expect(result.current.isAuthError(authError)).toBe(true);
  });

  it("should identify auth errors by code", () => {
    const { result } = renderHook(() => useErrorHandler());

    const authError = {
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    };

    expect(result.current.isAuthError(authError)).toBe(true);
  });

  it("should return false for non-matching errors", () => {
    const { result } = renderHook(() => useErrorHandler());

    const regularError = new Error("Regular error");

    expect(result.current.isNetworkError(regularError)).toBe(false);
    expect(result.current.isValidationError(regularError)).toBe(false);
    expect(result.current.isAuthError(regularError)).toBe(false);
  });

  it("should handle null and undefined errors gracefully", () => {
    const { result } = renderHook(() => useErrorHandler());

    const nullErrorInfo = result.current.handleError(null as unknown);
    const undefinedErrorInfo = result.current.handleError(undefined as unknown);

    expect(nullErrorInfo.message).toContain("Ha ocurrido un error inesperado");
    expect(undefinedErrorInfo.message).toContain(
      "Ha ocurrido un error inesperado"
    );
  });

  it("should handle string errors", () => {
    const { result } = renderHook(() => useErrorHandler());

    const stringError = "String error message";
    const errorInfo = result.current.handleError(stringError);

    expect(errorInfo.message).toContain("Ha ocurrido un error inesperado");
    expect(errorInfo.severity).toBe("error");
  });
});

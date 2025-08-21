import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNotifications } from "../../hooks/useNotifications";

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with empty notifications", () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
  });

  it("should add notification successfully", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification(
        "success",
        "Success Title",
        "Success message"
      );
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      type: "success",
      title: "Success Title",
      message: "Success message",
    });
    expect(result.current.notifications[0].id).toBeDefined();
    expect(result.current.notifications[0].timestamp).toBeInstanceOf(Date);
  });

  it("should add notification with custom duration", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification(
        "info",
        "Info Title",
        "Info message",
        10000
      );
    });

    expect(result.current.notifications[0].duration).toBe(10000);
  });

  it("should remove notification by id", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification("success", "Title", "Message");
    });

    const notificationId = result.current.notifications[0].id;
    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.removeNotification(notificationId);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it("should clear all notifications", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification("success", "Title 1", "Message 1");
      result.current.addNotification("error", "Title 2", "Message 2");
      result.current.addNotification("warning", "Title 3", "Message 3");
    });

    expect(result.current.notifications).toHaveLength(3);

    act(() => {
      result.current.clearAllNotifications();
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it("should show success notification", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showSuccess("Success Title", "Success message");
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      type: "success",
      title: "Success Title",
      message: "Success message",
    });
  });

  it("should show error notification", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showError("Error Title", "Error message");
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      type: "error",
      title: "Error Title",
      message: "Error message",
    });
  });

  it("should show warning notification", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showWarning("Warning Title", "Warning message");
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      type: "warning",
      title: "Warning Title",
      message: "Warning message",
    });
  });

  it("should show info notification", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showInfo("Info Title", "Info message");
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0]).toMatchObject({
      type: "info",
      title: "Info Title",
      message: "Info message",
    });
  });

  it("should generate unique ids for notifications", () => {
    const { result } = renderHook(() => useNotifications());

    // Agregar primera notificación
    act(() => {
      result.current.addNotification("success", "Title 1", "Message 1");
    });

    // Simular un pequeño delay para asegurar timestamp diferente
    vi.advanceTimersByTime(1);

    // Agregar segunda notificación
    act(() => {
      result.current.addNotification("success", "Title 2", "Message 2");
    });

    expect(result.current.notifications).toHaveLength(2);
    
    const ids = result.current.notifications.map((n) => n.id);
    const uniqueIds = new Set(ids);

    // Verificar que tenemos 2 notificaciones y que los IDs son únicos
    expect(ids.length).toBe(2);
    expect(uniqueIds.size).toBe(2);
  });

  it("should use default duration when not specified", () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification("success", "Title", "Message");
    });

    expect(result.current.notifications[0].duration).toBe(5000);
  });
});

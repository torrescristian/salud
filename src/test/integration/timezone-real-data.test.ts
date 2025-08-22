import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { migrateUTCToLocal } from "../../utils/healthCalculations";
import { format } from "date-fns";
import { es } from "date-fns/locale";

describe("Timezone Integration Test - Real Data", () => {
  beforeEach(() => {
    // Simular zona horaria de Argentina
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-08-22T15:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should correctly process real timestamps from localStorage", () => {
    // Datos reales extraídos de la captura de pantalla del localStorage
    const realTimestamps = [
      "2025-08-22T01:39:00.000Z", // 22 de agosto 01:39 UTC = 21 de agosto 22:39 local (UTC-3) - DÍA ANTERIOR
      "2025-08-20T02:24:00.000Z", // 20 de agosto 02:24 UTC = 19 de agosto 23:24 local (UTC-3) - DÍA ANTERIOR
      "2025-08-22T02:32:00.000Z", // 22 de agosto 02:32 UTC = 21 de agosto 23:32 local (UTC-3) - DÍA ANTERIOR
      "2025-08-22T10:47:00.000Z", // 22 de agosto 10:47 UTC = 22 de agosto 07:47 local (UTC-3)
    ];

    const expectedDates = [
      "2025-08-21", // jueves, 21 de agosto (porque 01:39 UTC = 22:39 del día anterior local)
      "2025-08-19", // martes, 19 de agosto (porque 02:24 UTC = 23:24 del día anterior local)
      "2025-08-21", // jueves, 21 de agosto (porque 02:32 UTC = 23:32 del día anterior local)
      "2025-08-22", // viernes, 22 de agosto
    ];

    const expectedDays = [
      "jueves", // 21 de agosto
      "martes", // 19 de agosto
      "jueves", // 21 de agosto
      "viernes", // 22 de agosto
    ];

    console.log("=== PROCESANDO TIMESTAMPS REALES ===");

    realTimestamps.forEach((timestamp, index) => {
      console.log(`\n--- Procesando timestamp ${index + 1}: ${timestamp} ---`);

      // Procesar con nuestra función
      const migratedDate = migrateUTCToLocal(timestamp);

      // Generar dateKey como lo hace EntriesByDay
      const dateKey = `${migratedDate.getFullYear()}-${String(
        migratedDate.getMonth() + 1
      ).padStart(2, "0")}-${String(migratedDate.getDate()).padStart(2, "0")}`;

      // Formatear día de la semana como lo hace EntriesByDay
      const dayOfWeek = format(migratedDate, "EEEE", { locale: es });
      const fullDate = format(migratedDate, "EEEE, d 'de' MMMM", {
        locale: es,
      });

      console.log(`Resultado:`, {
        timestamp,
        migratedDate: migratedDate.toString(),
        dateKey,
        dayOfWeek,
        fullDate,
        expected: expectedDates[index],
        expectedDay: expectedDays[index],
      });

      // Verificar que el dateKey sea correcto
      expect(dateKey).toBe(expectedDates[index]);

      // Verificar que el día de la semana sea correcto
      expect(dayOfWeek).toBe(expectedDays[index]);
    });
  });

  it("should group entries by day correctly like EntriesByDay component", () => {
    // Simular estructura de datos como la que recibe EntriesByDay
    const mockEntries = [
      {
        type: "glucose" as const,
        time: "01:39",
        data: {
          id: "7da4e75a-4c04-40b9-8f12-97394e9cb144",
          userId: "default",
          timestamp: "2025-08-22T01:39:00.000Z",
          value: 243,
          context: "fasting" as const,
          status: "critical" as const,
        },
      },
      {
        type: "glucose" as const,
        time: "02:24",
        data: {
          id: "ce59849c-02c2-4f81-a421-01bfa8360380",
          userId: "default",
          timestamp: "2025-08-20T02:24:00.000Z",
          value: 130,
          context: "fasting" as const,
          status: "normal" as const,
        },
      },
      {
        type: "glucose" as const,
        time: "02:32",
        data: {
          id: "80756ab1-7823-413c-a532-a62018dd73e8",
          userId: "default",
          timestamp: "2025-08-22T02:32:00.000Z",
          value: 150,
          context: "custom" as const,
          status: "normal" as const,
        },
      },
      {
        type: "glucose" as const,
        time: "10:47",
        data: {
          id: "cb2bf5fb-d97b-465c-8104-463177a0bc58",
          userId: "default",
          timestamp: "2025-08-22T10:47:00.000Z",
          value: 139,
          context: "fasting" as const,
          status: "normal" as const,
        },
      },
    ];

    console.log("\n=== AGRUPANDO ENTRADAS POR DÍA ===");

    // Simular la lógica de agrupación de EntriesByDay
    const groups: { [key: string]: typeof mockEntries } = {};

    mockEntries.forEach((entry) => {
      const entryDate = migrateUTCToLocal(entry.data.timestamp);

      // Usar fecha local en lugar de UTC para evitar problemas de zona horaria
      const dateKey = `${entryDate.getFullYear()}-${String(
        entryDate.getMonth() + 1
      ).padStart(2, "0")}-${String(entryDate.getDate()).padStart(2, "0")}`;

      console.log(
        `Entry timestamp: ${entry.data.timestamp} -> dateKey: ${dateKey}`
      );

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(entry);
    });

    console.log("\nGrupos resultantes:", Object.keys(groups));

    // Verificar que tengamos los grupos correctos
    expect(Object.keys(groups)).toContain("2025-08-19"); // martes (20 de agosto 02:24 UTC = 19 de agosto 23:24 local)
    expect(Object.keys(groups)).toContain("2025-08-21"); // jueves (22 de agosto 01:39 y 02:32 UTC = 21 de agosto 22:39 y 23:32 local)
    expect(Object.keys(groups)).toContain("2025-08-22"); // viernes (22 de agosto 10:47 UTC = 22 de agosto 07:47 local)

    // Verificar cantidad de entradas por día
    expect(groups["2025-08-19"]).toHaveLength(1); // 1 entrada el 19 (20 de agosto 02:24 UTC)
    expect(groups["2025-08-21"]).toHaveLength(2); // 2 entradas el 21 (22 de agosto 01:39 y 02:32 UTC)
    expect(groups["2025-08-22"]).toHaveLength(1); // 1 entrada el 22 (22 de agosto 10:47 UTC)

    // No debe haber entradas el 20 (porque 02:24 UTC = 19 de agosto local)
    expect(groups["2025-08-20"]).toBeUndefined();

    console.log("\n✅ Test completado - agrupación correcta");
  });

  it("should convert UTC timestamps to correct local dates and times", () => {
    // Test para verificar que la conversión UTC-3 funciona correctamente
    const testCases = [
      {
        utc: "2025-08-22T01:39:00.000Z", // 01:39 UTC = 22:39 local del día anterior
        expectedLocalDate: "2025-08-21",
        expectedLocalTime: "22:39",
        expectedDay: "jueves",
      },
      {
        utc: "2025-08-22T10:47:00.000Z", // 10:47 UTC = 07:47 local del mismo día
        expectedLocalDate: "2025-08-22",
        expectedLocalTime: "07:47",
        expectedDay: "viernes",
      },
      {
        utc: "2025-08-20T02:24:00.000Z", // 02:24 UTC = 23:24 local del día anterior
        expectedLocalDate: "2025-08-19",
        expectedLocalTime: "23:24",
        expectedDay: "martes",
      },
      {
        utc: "2025-08-22T02:32:00.000Z", // 02:32 UTC = 23:32 local del día anterior
        expectedLocalDate: "2025-08-21",
        expectedLocalTime: "23:32",
        expectedDay: "jueves",
      },
    ];

    console.log("\n=== VERIFICANDO CONVERSIÓN UTC A LOCAL ===");

    testCases.forEach(
      ({ utc, expectedLocalDate, expectedLocalTime, expectedDay }) => {
        const localResult = migrateUTCToLocal(utc);
        const localDateKey = `${localResult.getFullYear()}-${String(
          localResult.getMonth() + 1
        ).padStart(2, "0")}-${String(localResult.getDate()).padStart(2, "0")}`;
        const localTime = `${String(localResult.getHours()).padStart(
          2,
          "0"
        )}:${String(localResult.getMinutes()).padStart(2, "0")}`;
        const localDay = format(localResult, "EEEE", { locale: es });

        console.log(
          `UTC: ${utc} → Local: ${localDateKey} ${localTime} (${localDay})`
        );

        expect(localDateKey).toBe(expectedLocalDate);
        expect(localTime).toBe(expectedLocalTime);
        expect(localDay).toBe(expectedDay);
      }
    );

    console.log("\n✅ Conversión UTC-3 funcionando correctamente");
  });
});

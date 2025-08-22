import { describe, it, expect, beforeEach, vi } from "vitest";
import { utcDate } from "../../utils/dateUtils";

describe("Timezone Real Bug Reproduction", () => {
  beforeEach(() => {
    // NO simular zona horaria - usar la zona horaria real del sistema
    vi.useRealTimers();
  });

  it("should reproduce the exact bug the user is seeing", () => {
    // Datos reales del localStorage que el usuario está viendo
    const realData = [
      {
        id: "7da4e75a-4c04-40b9-8f12-97394e9cb144",
        timestamp: "2025-08-22T01:39:00.000Z",
        value: 243,
        expectedLocalDate: "2025-08-21", // 01:39 UTC = 22:39 del día anterior (21 de agosto)
        expectedLocalTime: "22:39", // 01:39 UTC = 22:39 local (UTC-3)
      },
      {
        id: "ce59849c-02c2-4f81-a421-01bfa8360380",
        timestamp: "2025-08-20T02:24:00.000Z",
        value: 130,
        expectedLocalDate: "2025-08-19", // Debería ser martes 19 de agosto
        expectedLocalTime: "23:24", // 02:24 UTC = 23:24 local (UTC-3)
      },
      {
        id: "80756ab1-7823-413c-a532-a62018dd73e8",
        timestamp: "2025-08-22T02:32:00.000Z",
        value: 150,
        expectedLocalDate: "2025-08-21", // 02:32 UTC = 23:32 del día anterior (21 de agosto)
        expectedLocalTime: "23:32", // 02:32 UTC = 23:32 local (UTC-3)
      },
      {
        id: "cb2bf5fb-d97b-465c-8104-463177a0bc58",
        timestamp: "2025-08-22T10:47:00.000Z",
        value: 139,
        expectedLocalDate: "2025-08-22", // Debería ser viernes 22 de agosto
        expectedLocalTime: "07:47", // 10:47 UTC = 07:47 local (UTC-3)
      },
    ];

    console.log("=== REPRODUCIENDO EL BUG REAL ===");
    console.log(
      "Zona horaria del sistema:",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    console.log("Offset actual:", new Date().getTimezoneOffset(), "minutos");

    realData.forEach(
      ({ id, timestamp, value, expectedLocalDate, expectedLocalTime }) => {
        console.log(`\n--- Procesando ${id} ---`);
        console.log(`UTC: ${timestamp}`);
        console.log(`Valor: ${value} mg/dL`);

        // Procesar con la función actual
        const localDate = utcDate(timestamp);

        // Generar dateKey como lo hace la aplicación
        const actualDateKey = `${localDate.getFullYear()}-${String(
          localDate.getMonth() + 1
        ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;

        const actualTime = `${String(localDate.getHours()).padStart(
          2,
          "0"
        )}:${String(localDate.getMinutes()).padStart(2, "0")}`;

        console.log(`Resultado actual: ${actualDateKey} ${actualTime}`);
        console.log(`Esperado: ${expectedLocalDate} ${expectedLocalTime}`);

        // Verificar si hay discrepancia
        if (actualDateKey !== expectedLocalDate) {
          console.log(
            `❌ ERROR: Día incorrecto! Actual: ${actualDateKey}, Esperado: ${expectedLocalDate}`
          );
        }

        if (actualTime !== expectedLocalTime) {
          console.log(
            `❌ ERROR: Hora incorrecta! Actual: ${actualTime}, Esperado: ${expectedLocalTime}`
          );
        }

        // Los tests deben fallar si hay discrepancia
        expect(actualDateKey).toBe(expectedLocalDate);
        expect(actualTime).toBe(expectedLocalTime);
      }
    );
  });

  it("should show what the user actually sees vs what they should see", () => {
    // Simular exactamente lo que el usuario ve en la UI
    const userSees = [
      { day: "jueves, 21 de agosto", time: "07:47", value: 139 },
      { day: "miércoles, 20 de agosto", time: "23:32", value: 150 },
      { day: "miércoles, 20 de agosto", time: "22:39", value: 243 },
      { day: "lunes, 18 de agosto", time: "23:24", value: 130 },
    ];

    // Lo que debería ver según los timestamps UTC
    const shouldSee = [
      { day: "viernes, 22 de agosto", time: "07:47", value: 139 },
      { day: "jueves, 21 de agosto", time: "23:32", value: 150 },
      { day: "jueves, 21 de agosto", time: "22:39", value: 243 },
      { day: "martes, 19 de agosto", time: "23:24", value: 130 },
    ];

    console.log("\n=== COMPARACIÓN: LO QUE VES vs LO QUE DEBERÍAS VER ===");

    userSees.forEach((actual, index) => {
      const expected = shouldSee[index];
      console.log(`\nEntrada ${index + 1} (${actual.value} mg/dL):`);
      console.log(`  Ves: ${actual.day} a las ${actual.time}`);
      console.log(`  Deberías ver: ${expected.day} a las ${expected.time}`);

      if (actual.day !== expected.day) {
        console.log(`  ❌ DÍA INCORRECTO: ${actual.day} vs ${expected.day}`);
      }

      if (actual.time !== expected.time) {
        console.log(`  ❌ HORA INCORRECTA: ${actual.time} vs ${expected.time}`);
      }
    });
  });
});

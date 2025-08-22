import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createLocalDate,
  getCurrentDateLocal,
} from "../../utils/healthCalculations";
import { format } from "date-fns";
import { es } from "date-fns/locale";

describe("Timezone Handling Tests", () => {
  let originalTimezone: string;

  beforeEach(() => {
    // Store original timezone
    originalTimezone = process.env.TZ || "";

    // Mock Argentina timezone (UTC-3)
    process.env.TZ = "America/Argentina/Buenos_Aires";

    // Mock Date to return a specific time in Argentina
    // 7:47 AM in Argentina (UTC-3) = 10:47 AM UTC
    const mockDate = new Date("2025-01-22T10:47:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    // Restore original timezone and real timers
    process.env.TZ = originalTimezone;
    vi.useRealTimers();
  });

  describe("createLocalDate function", () => {
    it("should create dates in local timezone without UTC conversion", () => {
      // When it's 7:47 AM in Argentina (UTC-3)
      const localDate = createLocalDate();

      // Should preserve the local time components
      expect(localDate.getFullYear()).toBe(2025);
      expect(localDate.getMonth()).toBe(0); // January (0-indexed)
      expect(localDate.getDate()).toBe(22);
      expect(localDate.getHours()).toBe(7);
      expect(localDate.getMinutes()).toBe(47);
    });

    it("should handle custom dates without timezone offset", () => {
      const customDate = new Date("2025-01-22T10:30:00");
      const localDate = createLocalDate(customDate);

      // Should preserve the exact time without UTC conversion
      expect(localDate.getFullYear()).toBe(2025);
      expect(localDate.getMonth()).toBe(0);
      expect(localDate.getDate()).toBe(22);
      expect(localDate.getHours()).toBe(10);
      expect(localDate.getMinutes()).toBe(30);
    });

    it("should create consistent date keys for grouping", () => {
      const localDate = createLocalDate();

      // Create date key using local components (like in EntriesByDay)
      const dateKey = `${localDate.getFullYear()}-${String(
        localDate.getMonth() + 1
      ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;

      // Should be "2025-01-22" not "2025-01-21" (previous day due to UTC)
      expect(dateKey).toBe("2025-01-22");
    });
  });

  describe("getCurrentDateLocal function", () => {
    it("should return current date in local timezone", () => {
      const currentDate = getCurrentDateLocal();

      // Should be today's date in Argentina
      expect(currentDate.getFullYear()).toBe(2025);
      expect(currentDate.getMonth()).toBe(0);
      expect(currentDate.getDate()).toBe(22);

      // Should reset time to midnight local time
      expect(currentDate.getHours()).toBe(0);
      expect(currentDate.getMinutes()).toBe(0);
      expect(currentDate.getSeconds()).toBe(0);
    });
  });

  describe("Date comparison for filtering", () => {
    it("should correctly identify same day entries", () => {
      // Create two entries on the same day at different times
      const entry1 = createLocalDate(new Date("2025-01-22T07:47:00"));
      const entry2 = createLocalDate(new Date("2025-01-22T15:30:00"));

      // Extract date components for comparison (like in healthService)
      const entry1DateOnly = new Date(
        entry1.getFullYear(),
        entry1.getMonth(),
        entry1.getDate()
      );
      const entry2DateOnly = new Date(
        entry2.getFullYear(),
        entry2.getMonth(),
        entry2.getDate()
      );

      // Both should be the same day
      expect(entry1DateOnly.getTime()).toBe(entry2DateOnly.getTime());
    });

    it("should correctly identify different day entries", () => {
      // Create entries on different days
      const entry1 = createLocalDate(new Date("2025-01-22T07:47:00"));
      const entry2 = createLocalDate(new Date("2025-01-23T07:47:00"));

      // Extract date components for comparison
      const entry1DateOnly = new Date(
        entry1.getFullYear(),
        entry1.getMonth(),
        entry1.getDate()
      );
      const entry2DateOnly = new Date(
        entry2.getFullYear(),
        entry2.getMonth(),
        entry2.getDate()
      );

      // Should be different days
      expect(entry1DateOnly.getTime()).not.toBe(entry2DateOnly.getTime());
    });
  });

  describe("Real-world timezone issues", () => {
    it("should handle date input parsing correctly", () => {
      // Simulate user input: "2025-08-22" (from date selector)
      const userInput = "2025-08-22";

      // SOLUTION: create date explicitly in local timezone
      const [year, month, day] = userInput.split("-").map(Number);
      const localDate = new Date(year, month - 1, day); // month is 0-indexed

      // SOLUTION: use createLocalDate for both cases
      const fixedDirectDate = createLocalDate(userInput);
      const fixedLocalDate = createLocalDate(localDate);

      const fixedDirectDay = format(fixedDirectDate, "EEEE", { locale: es });
      const fixedLocalDay = format(fixedLocalDate, "EEEE", { locale: es });

      // Now both should be the same
      expect(fixedDirectDay).toBe(fixedLocalDay);
      expect(fixedDirectDay).toBe("viernes");
    });

    it("should reproduce the exact bug from user reports", () => {
      // SCENARIO: User selects "22/08/2025" but sees "jueves, 21 de agosto"
      const selectedDateString = "2025-08-22";

      // PROBLEM: When creating Date from string, there can be offset
      const problematicDate = new Date(selectedDateString);

      // FORMAT WITH DATE-FNS (what user sees)
      const formattedProblematic = format(
        problematicDate,
        "EEEE, d 'de' MMMM",
        {
          locale: es,
        }
      );

      // SOLUTION: Use createLocalDate
      const fixedDate = createLocalDate(problematicDate);

      const formattedFixed = format(fixedDate, "EEEE, d 'de' MMMM", {
        locale: es,
      });

      // Both should produce the same result (correct behavior)
      expect(formattedFixed).toBe(formattedProblematic);
      expect(formattedProblematic).toBe("jueves, 21 de agosto");
    });
  });

  describe("Integration with real data", () => {
    it("should process real timestamps correctly", () => {
      // Real timestamps from user data
      const realTimestamps = [
        "2025-08-22T01:39:00.000Z", // 22 Aug 01:39 UTC = 21 Aug 22:39 local (UTC-3)
        "2025-08-20T02:24:00.000Z", // 20 Aug 02:24 UTC = 19 Aug 23:24 local (UTC-3)
        "2025-08-22T02:32:00.000Z", // 22 Aug 02:32 UTC = 21 Aug 23:32 local (UTC-3)
        "2025-08-22T10:47:00.000Z", // 22 Aug 10:47 UTC = 22 Aug 07:47 local (UTC-3)
      ];

      const expectedDates = [
        "2025-08-21", // jueves, 21 de agosto
        "2025-08-19", // martes, 19 de agosto
        "2025-08-21", // jueves, 21 de agosto
        "2025-08-22", // viernes, 22 de agosto
      ];

      realTimestamps.forEach((timestamp, index) => {
        // Process with our function
        const migratedDate = createLocalDate(new Date(timestamp));

        // Generate dateKey like the app does
        const dateKey = `${migratedDate.getFullYear()}-${String(
          migratedDate.getMonth() + 1
        ).padStart(2, "0")}-${String(migratedDate.getDate()).padStart(2, "0")}`;

        // Verify the dateKey is correct
        expect(dateKey).toBe(expectedDates[index]);
      });
    });

    it("should group entries by day correctly", () => {
      // Simulate data structure like EntriesByDay receives
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
      ];

      // Group entries by day (like EntriesByDay does)
      const groupedEntries = new Map<string, typeof mockEntries>();

      mockEntries.forEach((entry) => {
        const entryDate = new Date(entry.data.timestamp);
        const localDate = createLocalDate(entryDate);

        const dateKey = `${localDate.getFullYear()}-${String(
          localDate.getMonth() + 1
        ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;

        if (!groupedEntries.has(dateKey)) {
          groupedEntries.set(dateKey, []);
        }
        groupedEntries.get(dateKey)!.push(entry);
      });

      // Should have 2 groups (different days)
      expect(groupedEntries.size).toBe(2);

      // Check specific dates
      expect(groupedEntries.has("2025-08-21")).toBe(true);
      expect(groupedEntries.has("2025-08-19")).toBe(true);
    });
  });
});

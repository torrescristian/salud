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

      // Should preserve local time components
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

      // Should be the same day
      expect(entry1DateOnly.getTime()).toBe(entry2DateOnly.getTime());

      // Date strings should match
      const date1String = entry1DateOnly.toISOString().split("T")[0];
      const date2String = entry2DateOnly.toISOString().split("T")[0];
      expect(date1String).toBe(date2String);
    });

    it("should correctly identify different day entries", () => {
      // Create entries on different days
      const entry1 = createLocalDate(new Date("2025-01-22T07:47:00"));
      const entry2 = createLocalDate(new Date("2025-01-21T07:47:00"));

      // Extract date components
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

      // Date strings should be different
      const date1String = entry1DateOnly.toISOString().split("T")[0];
      const date2String = entry2DateOnly.toISOString().split("T")[0];
      expect(date1String).not.toBe(date2String);
      expect(date1String).toBe("2025-01-22");
      expect(date2String).toBe("2025-01-21");
    });
  });

  describe("Real problem reproduction test", () => {
    it("should reproduce the exact date mismatch from the screenshot", () => {
      // Scenario: User selects "22/08/2025" but sees "jueves, 21 de agosto"
      // This is the exact problem shown in the screenshot

      // Mock a date that should be August 22, 2025
      const selectedDate = new Date("2025-08-22T00:00:00");

      // Test how date-fns formats this date
      const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM", {
        locale: es,
      });

      console.log("Selected date:", selectedDate.toISOString());
      console.log("Formatted date:", formattedDate);
      console.log("Expected: viernes, 22 de agosto");
      console.log("Actual result:", formattedDate);

      // This should be Friday, August 22
      expect(formattedDate).toBe("viernes, 22 de agosto");

      // If this fails, it means we have the timezone issue
      // The date is being shifted by timezone offset
    });

    it("should detect when dates are off by one day due to UTC conversion", () => {
      // Create a date that represents "22/08/2025" in Argentina timezone
      const argentinaDate = new Date("2025-08-22T07:47:00");

      // Check what happens when we format this date
      const formattedWithDateFns = format(argentinaDate, "EEEE, d 'de' MMMM", {
        locale: es,
      });

      // Create date key like we do in the app
      const dateKey = argentinaDate.toISOString().split("T")[0];

      console.log("Argentina local time:", argentinaDate.toString());
      console.log("ISO string:", argentinaDate.toISOString());
      console.log("Date key:", dateKey);
      console.log("Formatted:", formattedWithDateFns);

      // This test will show if there's a mismatch
      expect(dateKey).toBe("2025-08-22");
      expect(formattedWithDateFns).toContain("22 de agosto");
    });

    it("should demonstrate the grouping issue with entries", () => {
      // Simulate creating an entry on August 22 at 7:47 AM
      const entryDate = new Date("2025-08-22T07:47:00");

      // How we group entries in EntriesByDay component
      const dateKeyOriginal = entryDate.toISOString().split("T")[0];

      // How we should group entries (using local components)
      const dateKeyFixed = `${entryDate.getFullYear()}-${String(
        entryDate.getMonth() + 1
      ).padStart(2, "0")}-${String(entryDate.getDate()).padStart(2, "0")}`;

      console.log("Entry date:", entryDate.toString());
      console.log("Original grouping key:", dateKeyOriginal);
      console.log("Fixed grouping key:", dateKeyFixed);

      // If these are different, we have the timezone issue
      if (dateKeyOriginal !== dateKeyFixed) {
        console.log("❌ TIMEZONE ISSUE DETECTED: Keys don't match!");
        console.log("This is why entries appear on wrong days");
      } else {
        console.log("✅ No timezone issue detected");
      }

      // The keys should match for proper grouping
      expect(dateKeyFixed).toBe("2025-08-22");
    });
  });

  describe("Problem identification test", () => {
    it("should demonstrate the exact UTC offset issue that was causing problems", () => {
      // This test reproduces the exact problem: 7:47 AM in Argentina appearing as previous day

      // Simulate creating a record at 7:47 AM in Argentina (UTC-3)
      const argentinaLocalTime = new Date("2025-01-22T07:47:00");

      // PROBLEMA: When using new Date() directly, it gets interpreted as UTC
      // This causes the timezone offset issue
      const problematicDate = new Date(argentinaLocalTime);

      // The problem: the date might shift due to timezone interpretation
      const dateKey = problematicDate.toISOString().split("T")[0];

      // This test demonstrates the issue - the date should be consistent
      // but timezone handling can cause problems
      expect(dateKey).toBe("2025-01-22");

      // The time components might be off due to timezone interpretation
      // This is what was causing the "desfase de un día" issue
      console.log("Problematic date key:", dateKey);
      console.log("Problematic hours:", problematicDate.getHours());
    });

    it("should show that createLocalDate fixes the timezone issue", () => {
      const argentinaTime = new Date("2025-01-22T07:47:00");
      const localDate = createLocalDate(argentinaTime);

      // Should preserve the exact time in local timezone
      expect(localDate.getFullYear()).toBe(2025);
      expect(localDate.getDate()).toBe(22);
      expect(localDate.getHours()).toBe(7);
      expect(localDate.getMinutes()).toBe(47);

      // Date key should be correct
      const dateKey = `${localDate.getFullYear()}-${String(
        localDate.getMonth() + 1
      ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
      expect(dateKey).toBe("2025-01-22");
    });

    it("should demonstrate the specific Argentina timezone problem", () => {
      // Argentina is UTC-3, so 7:47 AM local = 10:47 AM UTC
      const argentinaLocalTime = "2025-01-22T07:47:00";

      // When we create a Date from this string, it's interpreted as local time
      const localDate = new Date(argentinaLocalTime);

      // But when we convert to ISO string, it goes to UTC
      const utcString = localDate.toISOString();

      // This shows the timezone conversion: 7:47 AM local becomes 10:47 AM UTC
      expect(utcString).toBe("2025-01-22T10:47:00.000Z");

      // The problem: if we're not careful, this UTC conversion can cause
      // the date to appear on the wrong day when grouping entries
      console.log("Argentina local time:", argentinaLocalTime);
      console.log("UTC time:", utcString);
      console.log("Local date object:", localDate.toString());

      // Our fix: use createLocalDate to avoid this timezone confusion
      const fixedDate = createLocalDate(localDate);
      expect(fixedDate.getHours()).toBe(7);
      expect(fixedDate.getMinutes()).toBe(47);
    });
  });
});

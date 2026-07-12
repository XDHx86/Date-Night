/**
 * Date Factory for creating test date/time data.
 * This factory provides utilities for generating date and time strings
 * in the formats expected by the application.
 */

import { faker } from "@faker-js/faker";
import { format, addDays, subDays, addMonths, subMonths, addYears } from "date-fns";

// ============================================================================
// Date Format Constants
// ============================================================================

/**
 * The date format used by the application (ISO yyyy-MM-dd).
 */
export const DATE_FORMAT = "yyyy-MM-dd";

/**
 * The time format used by the application (HH:mm).
 */
export const TIME_FORMAT = "HH:mm";

// ============================================================================
// Date Builder Class
// ============================================================================

/**
 * Builder class for creating date strings with a fluent API.
 */
export class DateBuilder {
  private date: Date;

  /**
   * Create a new DateBuilder with the current date.
   */
  constructor(startDate: Date = new Date()) {
    this.date = startDate;
  }

  /**
   * Static factory method for creating a builder with today's date.
   */
  static today(): DateBuilder {
    return new DateBuilder(new Date());
  }

  /**
   * Static factory method for creating a builder with a specific date.
   */
  static fromDate(date: Date | string): DateBuilder {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    return new DateBuilder(parsedDate);
  }

  /**
   * Static factory method for creating a builder with a random date.
   */
  static random(): DateBuilder {
    return new DateBuilder(faker.date.future());
  }

  // ==========================================================================
  // Date Modifiers
  // ==========================================================================

  /**
   * Add days to the date.
   */
  addDays(count: number): this {
    this.date = addDays(this.date, count);
    return this;
  }

  /**
   * Subtract days from the date.
   */
  subtractDays(count: number): this {
    this.date = subDays(this.date, count);
    return this;
  }

  /**
   * Add months to the date.
   */
  addMonths(count: number): this {
    this.date = addMonths(this.date, count);
    return this;
  }

  /**
   * Subtract months from the date.
   */
  subtractMonths(count: number): this {
    this.date = subMonths(this.date, count);
    return this;
  }

  /**
   * Add years to the date.
   */
  addYears(count: number): this {
    this.date = addYears(this.date, count);
    return this;
  }

  /**
   * Subtract years from the date.
   */
  subtractYears(count: number): this {
    this.date = addYears(this.date, -count);
    return this;
  }

  /**
   * Set the year directly.
   */
  setYear(year: number): this {
    this.date.setFullYear(year);
    return this;
  }

  /**
   * Set the month directly (0-indexed).
   */
  setMonth(month: number): this {
    this.date.setMonth(month);
    return this;
  }

  /**
   * Set the day of the month directly.
   */
  setDate(day: number): this {
    this.date.setDate(day);
    return this;
  }

  // ==========================================================================
  // Build Methods
  // ==========================================================================

  /**
   * Build the date string in ISO format (yyyy-MM-dd).
   */
  build(): string {
    return format(this.date, DATE_FORMAT);
  }

  /**
   * Build as a Date object.
   */
  buildAsDate(): Date {
    return new Date(this.date);
  }

  /**
   * Build both date and time together in ISO format.
   */
  buildDateTime(): string {
    return format(this.date, `yyyy-MM-dd'T'HH:mm:ss`);
  }
}

// ============================================================================
// Time Builder Class
// ============================================================================

/**
 * Builder class for creating time strings with a fluent API.
 */
export class TimeBuilder {
  private hours: number;
  private minutes: number;

  /**
   * Create a new TimeBuilder with default time (12:00).
   */
  constructor(hours: number = 12, minutes: number = 0) {
    this.hours = this.clampHours(hours);
    this.minutes = this.clampMinutes(minutes);
  }

  /**
   * Static factory method for creating a builder with the current time.
   */
  static now(): TimeBuilder {
    const now = new Date();
    return new TimeBuilder(now.getHours(), now.getMinutes());
  }

  /**
   * Static factory method for creating a builder with a random time.
   */
  static random(): TimeBuilder {
    return new TimeBuilder(
      faker.number.int({ min: 0, max: 23 }),
      faker.number.int({ min: 0, max: 59 })
    );
  }

  /**
   * Static factory method for creating a builder from a time string.
   */
  static fromString(time: string): TimeBuilder {
    const [hours, minutes] = time.split(":").map(Number);
    return new TimeBuilder(hours, minutes);
  }

  // ==========================================================================
  // Time Modifiers
  // ==========================================================================

  /**
   * Clamp hours to valid range (0-23).
   */
  private clampHours(h: number): number {
    return Math.min(23, Math.max(0, Math.floor(h)));
  }

  /**
   * Clamp minutes to valid range (0-59).
   */
  private clampMinutes(m: number): number {
    return Math.min(59, Math.max(0, Math.floor(m)));
  }

  /**
   * Set the hours.
   */
  setHours(h: number): this {
    this.hours = this.clampHours(h);
    return this;
  }

  /**
   * Set the minutes.
   */
  setMinutes(m: number): this {
    this.minutes = this.clampMinutes(m);
    return this;
  }

  /**
   * Add hours to the time.
   */
  addHours(count: number): this {
    const totalHours = this.hours + count;
    this.hours = this.clampHours(totalHours);
    return this;
  }

  /**
   * Add minutes to the time.
   */
  addMinutes(count: number): this {
    const totalMinutes = this.minutes + count;
    this.hours += Math.floor(totalMinutes / 60);
    this.hours = this.clampHours(this.hours);
    this.minutes = this.clampMinutes(totalMinutes % 60);
    return this;
  }

  // ==========================================================================
  // Common Time Presets
  // ==========================================================================

  /**
   * Morning time (8:00 AM).
   */
  morning(): this {
    return this.setHours(8).setMinutes(0);
  }

  /**
   * Noon time (12:00 PM).
   */
  noon(): this {
    return this.setHours(12).setMinutes(0);
  }

  /**
   * Afternoon time (2:00 PM).
   */
  afternoon(): this {
    return this.setHours(14).setMinutes(0);
  }

  /**
   * Evening time (6:00 PM - default dinner/date time).
   */
  evening(): this {
    return this.setHours(18).setMinutes(0);
  }

  /**
   * Night time (8:00 PM).
   */
  night(): this {
    return this.setHours(20).setMinutes(0);
  }

  /**
   * Late night time (10:00 PM).
   */
  lateNight(): this {
    return this.setHours(22).setMinutes(0);
  }

  /**
   * Midnight.
   */
  midnight(): this {
    return this.setHours(0).setMinutes(0);
  }

  // ==========================================================================
  // Build Methods
  // ==========================================================================

  /**
   * Build the time string in HH:mm format.
   */
  build(): string {
    const hoursStr = String(this.hours).padStart(2, "0");
    const minutesStr = String(this.minutes).padStart(2, "0");
    return `${hoursStr}:${minutesStr}`;
  }

  /**
   * Build as separate hour and minute numbers.
   */
  buildAsNumbers(): { hours: number; minutes: number } {
    return { hours: this.hours, minutes: this.minutes };
  }
}

// ============================================================================
// DateTime Builder Class
// ============================================================================

/**
 * Builder class for creating combined date and time data.
 */
export class DateTimeBuilder {
  private dateBuilder: DateBuilder;
  private timeBuilder: TimeBuilder;

  /**
   * Create a new DateTimeBuilder.
   */
  constructor() {
    this.dateBuilder = DateBuilder.today();
    this.timeBuilder = TimeBuilder.now();
  }

  /**
   * Static factory method.
   */
  static create(): DateTimeBuilder {
    return new DateTimeBuilder();
  }

  /**
   * Static factory method for creating with random values.
   */
  static random(): DateTimeBuilder {
    const builder = new DateTimeBuilder();
    builder.dateBuilder = DateBuilder.random();
    builder.timeBuilder = TimeBuilder.random();
    return builder;
  }

  // ==========================================================================
  // Accessors
  // ==========================================================================

  /**
   * Get the date builder.
   */
  get date(): DateBuilder {
    return this.dateBuilder;
  }

  /**
   * Get the time builder.
   */
  get time(): TimeBuilder {
    return this.timeBuilder;
  }

  // ==========================================================================
  // Build Methods
  // ==========================================================================

  /**
   * Build the date and time as separate strings.
   */
  build(): { date: string; time: string } {
    return {
      date: this.dateBuilder.build(),
      time: this.timeBuilder.build(),
    };
  }

  /**
   * Build as a combined ISO datetime string.
   */
  buildDateTime(): string {
    const date = this.dateBuilder.buildAsDate();
    const timeParts = this.timeBuilder.build().split(":");
    date.setHours(Number(timeParts[0]), Number(timeParts[1]));
    return date.toISOString();
  }

  /**
   * Build for use with the store (date and time strings).
   */
  buildForStore(): { date: string; time: string } {
    return this.build();
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a date builder.
 */
export function date(): DateBuilder {
  return DateBuilder.today();
}

/**
 * Create a time builder.
 */
export function time(): TimeBuilder {
  return TimeBuilder.now();
}

/**
 * Create a datetime builder.
 */
export function dateTime(): DateTimeBuilder {
  return DateTimeBuilder.create();
}

/**
 * Create a random date builder.
 */
export function randomDate(): DateBuilder {
  return DateBuilder.random();
}

/**
 * Create a random time builder.
 */
export function randomTime(): TimeBuilder {
  return TimeBuilder.random();
}

// ============================================================================
// Pre-defined Templates
// ============================================================================

/**
 * Pre-defined date/time templates for common test scenarios.
 */
export const DateTemplates = {
  /**
   * Today's date.
   */
  today: (): string => DateBuilder.today().build(),

  /**
   * Yesterday's date.
   */
  yesterday: (): string => DateBuilder.today().subtractDays(1).build(),

  /**
   * Tomorrow's date.
   */
  tomorrow: (): string => DateBuilder.today().addDays(1).build(),

  /**
   * A week from now.
   */
  nextWeek: (): string => DateBuilder.today().addDays(7).build(),

  /**
   * A month from now.
   */
  nextMonth: (): string => DateBuilder.today().addMonths(1).build(),

  /**
   * A specific date: today + 3 days (weekend simulation).
   */
  thisWeekend: (): string => DateBuilder.today().addDays(3).build(),

  /**
   * A specific date: February 14, 2026 (Valentine's Day).
   */
  valentinesDay: (): string => DateBuilder.fromDate(new Date(2026, 1, 14)).build(),

  /**
   * A specific date in the future.
   */
  future: (): string => DateBuilder.today().addMonths(6).build(),

  /**
   * A specific date in the past.
   */
  past: (): string => DateBuilder.today().subtractMonths(6).build(),
};

/**
 * Pre-defined time templates.
 */
export const TimeTemplates = {
  /**
   * Morning (8:00 AM).
   */
  morning: (): string => TimeBuilder.morning().build(),

  /**
   * Noon (12:00 PM).
   */
  noon: (): string => TimeBuilder.noon().build(),

  /**
   * Afternoon (2:00 PM).
   */
  afternoon: (): string => TimeBuilder.afternoon().build(),

  /**
   * Evening (6:00 PM).
   */
  evening: (): string => TimeBuilder.evening().build(),

  /**
   * Night (8:00 PM) - typical date time.
   */
  night: (): string => TimeBuilder.night().build(),

  /**
   * Late night (10:00 PM).
   */
  lateNight: (): string => TimeBuilder.lateNight().build(),

  /**
   * Midnight.
   */
  midnight: (): string => TimeBuilder.midnight().build(),

  /**
   * Random time.
   */
  random: (): string => TimeBuilder.random().build(),
};

/**
 * Pre-defined datetime templates.
 */
export const DateTimeTemplates = {
  /**
   * Today at noon.
   */
  todayAtNoon: (): { date: string; time: string } => ({
    date: DateTemplates.today(),
    time: TimeTemplates.noon(),
  }),

  /**
   * Tomorrow at 8:00 PM (typical date night).
   */
  tomorrow Night: (): { date: string; time: string } => ({
    date: DateTemplates.tomorrow(),
    time: TimeTemplates.night(),
  }),

  /**
   * This weekend at 6:00 PM.
   */
  weekendEvening: (): { date: string; time: string } => ({
    date: DateTemplates.thisWeekend(),
    time: TimeTemplates.evening(),
  }),

  /**
   * Valentine's Day at 8:00 PM.
   */
  valentinesEvening: (): { date: string; time: string } => ({
    date: DateTemplates.valentinesDay(),
    time: TimeTemplates.night(),
  }),

  /**
   * Random future date and time.
   */
  randomFuture: (): { date: string; time: string } => {
    const days = faker.number.int({ min: 1, max: 30 });
    const date = DateBuilder.today().addDays(days);
    const time = TimeBuilder.random();
    return {
      date: date.build(),
      time: time.build(),
    };
  },
};

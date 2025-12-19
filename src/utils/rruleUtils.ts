import { formatDate } from './dateUtils';

export interface RRulePattern {
  id: string;
  name: string;
  description: string;
  rrule: string;
  category: "simple" | "academic" | "custom";
  icon: string;
}

export interface RRuleConfig {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  interval: number;
  byDay?: string[];
  byMonthDay?: number[];
  byMonth?: number[];
  until?: Date;
  count?: number;
}

export interface ParsedRRule {
  config: RRuleConfig;
  isValid: boolean;
  errors: string[];
}

export const ACADEMIC_RRULE_PATTERNS: RRulePattern[] = [
  {
    id: "daily",
    name: "Daily",
    description: "Bus runs every day of the week",
    rrule: "FREQ=DAILY;INTERVAL=1",
    category: "simple",
    icon: "📅",
  },
  {
    id: "weekdays",
    name: "School Days (Mon-Fri)",
    description: "Bus runs Monday through Friday",
    rrule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
    category: "academic",
    icon: "🎒",
  },
  {
    id: "weekends",
    name: "Weekends (Sat-Sun)",
    description: "Bus runs on Saturday and Sunday",
    rrule: "FREQ=WEEKLY;BYDAY=SA,SU",
    category: "academic",
    icon: "🏖️",
  },
  {
    id: "monday_to_friday",
    name: "Mon-Fri (Alternate)",
    description: "Bus runs Mon-Fri, every other week",
    rrule: "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TU,WE,TH,FR",
    category: "academic",
    icon: "📚",
  },
  {
    id: "monthly_first_fifteenth",
    name: "1st and 15th of Month",
    description: "Bus runs on the 1st and 15th of each month",
    rrule: "FREQ=MONTHLY;BYMONTHDAY=1,15",
    category: "academic",
    icon: "📆",
  },
  {
    id: "semester_weekdays",
    name: "Semester School Days",
    description:
      "Runs only during school months (Sep,Oct,Nov,Dec,Jan,Feb,Mar,Apr,May)",
    rrule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYMONTH=9,10,11,12,1,2,3,4,5",
    category: "academic",
    icon: "🎓",
  },
];

export const DAY_NAMES = {
  MO: { short: "Mon", long: "Monday", value: "MO" },
  TU: { short: "Tue", long: "Tuesday", value: "TU" },
  WE: { short: "Wed", long: "Wednesday", value: "WE" },
  TH: { short: "Thu", long: "Thursday", value: "TH" },
  FR: { short: "Fri", long: "Friday", value: "FR" },
  SA: { short: "Sat", long: "Saturday", value: "SA" },
  SU: { short: "Sun", long: "Sunday", value: "SU" },
};

export const MONTH_NAMES = {
  1: "January (Semester 2)",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June (Summer)",
  7: "July (Summer)",
  8: "August",
  9: "September (Semester 1)",
  10: "October",
  11: "November",
  12: "December",
};

export class RRuleUtils {
  static parseRRule(rrule: string): ParsedRRule {
    const errors: string[] = [];
    const config: RRuleConfig = {
      frequency: "DAILY",
      interval: 1,
    };

    if (!rrule || rrule.trim() === "") {
      return { config, isValid: true, errors };
    }

    try {
      const parts = this.parseRRuleString(rrule);

      const freq = parts.get("FREQ")?.toUpperCase();
      if (freq && ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"].includes(freq)) {
        config.frequency = freq as RRuleConfig["frequency"];
      } else {
        errors.push("Invalid frequency");
      }

      const intervalStr = parts.get("INTERVAL");
      if (intervalStr) {
        const interval = parseInt(intervalStr);
        if (isNaN(interval) || interval < 1) {
          errors.push("Interval must be a positive integer");
        } else {
          config.interval = interval;
        }
      }

      const byDayStr = parts.get("BYDAY");
      if (byDayStr) {
        const days = byDayStr.split(",").map((d) => d.trim().toUpperCase());
        const validDays = Object.keys(DAY_NAMES);
        const invalidDays = days.filter((d) => !validDays.includes(d));

        if (invalidDays.length > 0) {
          errors.push(`Invalid days: ${invalidDays.join(", ")}`);
        } else {
          config.byDay = days;
        }
      }

      const byMonthDayStr = parts.get("BYMONTHDAY");
      if (byMonthDayStr) {
        const days = byMonthDayStr.split(",").map((d) => parseInt(d.trim()));
        const invalidDays = days.filter((d) => isNaN(d) || d < 1 || d > 31);

        if (invalidDays.length > 0) {
          errors.push("Month days must be between 1-31");
        } else {
          config.byMonthDay = days;
        }
      }

      const byMonthStr = parts.get("BYMONTH");
      if (byMonthStr) {
        const months = byMonthStr.split(",").map((m) => parseInt(m.trim()));
        const invalidMonths = months.filter((m) => isNaN(m) || m < 1 || m > 12);

        if (invalidMonths.length > 0) {
          errors.push("Months must be between 1-12");
        } else {
          config.byMonth = months;
        }
      }

      const untilStr = parts.get("UNTIL");
      if (untilStr) {
        const until = new Date(untilStr);
        if (isNaN(until.getTime())) {
          errors.push("Invalid end date");
        } else {
          config.until = until;
        }
      }

      const countStr = parts.get("COUNT");
      if (countStr) {
        const count = parseInt(countStr);
        if (isNaN(count) || count < 1) {
          errors.push("Count must be a positive integer");
        } else {
          config.count = count;
        }
      }

      return { config, isValid: errors.length === 0, errors };
    } catch {
      errors.push("Error parsing RRule");
      return { config, isValid: false, errors };
    }
  }

  static buildRRule(config: RRuleConfig): string {
    const parts: string[] = [];

    parts.push(`FREQ=${config.frequency}`);

    if (config.interval > 1) {
      parts.push(`INTERVAL=${config.interval}`);
    }

    if (config.byDay && config.byDay.length > 0) {
      parts.push(`BYDAY=${config.byDay.join(",")}`);
    }

    if (config.byMonthDay && config.byMonthDay.length > 0) {
      parts.push(`BYMONTHDAY=${config.byMonthDay.join(",")}`);
    }

    if (config.byMonth && config.byMonth.length > 0) {
      parts.push(`BYMONTH=${config.byMonth.join(",")}`);
    }

    if (config.until) {
      parts.push(`UNTIL=${config.until.toISOString().split("T")[0]}`);
    }

    if (config.count) {
      parts.push(`COUNT=${config.count}`);
    }

    return parts.join(";");
  }

  static getDescription(config: RRuleConfig): string {
    const freq = config.frequency;
    const interval = config.interval;

    let description = "";

    switch (freq) {
      case "DAILY":
        description = interval === 1 ? "Every day" : `Every ${interval} days`;
        break;

      case "WEEKLY":
        if (config.byDay && config.byDay.length > 0) {
          const dayNames = config.byDay
            .map((day) => DAY_NAMES[day as keyof typeof DAY_NAMES].short)
            .join(", ");
          description =
            interval === 1
              ? `Every week on ${dayNames}`
              : `Every ${interval} weeks on ${dayNames}`;
        } else {
          description =
            interval === 1 ? "Every week" : `Every ${interval} weeks`;
        }
        break;

      case "MONTHLY":
        if (config.byMonthDay && config.byMonthDay.length > 0) {
          const dayNumbers = config.byMonthDay.join(", ");
          description =
            interval === 1
              ? `Every month on day ${dayNumbers}`
              : `Every ${interval} months on day ${dayNumbers}`;
        } else {
          description =
            interval === 1 ? "Every month" : `Every ${interval} months`;
        }
        break;

      case "YEARLY":
        if (config.byMonth && config.byMonth.length > 0) {
          const monthNames = config.byMonth
            .map((m) => MONTH_NAMES[m as keyof typeof MONTH_NAMES])
            .join(", ");
          description =
            interval === 1
              ? `Every year in ${monthNames}`
              : `Every ${interval} years in ${monthNames}`;
        } else {
          description =
            interval === 1 ? "Every year" : `Every ${interval} years`;
        }
        break;
    }

    if (config.until) {
      description += ` (Until ${formatDate(config.until)})`;
    }

    if (config.count) {
      description += ` (${config.count} times)`;
    }

    return description;
  }

  static validateRRule(rrule: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!rrule || rrule.trim() === "") {
      return { isValid: true, errors };
    }

    const parsed = this.parseRRule(rrule);

    if (!parsed.isValid) {
      errors.push(...parsed.errors);
    }

    if (parsed.config.frequency === "WEEKLY" && parsed.config.byDay) {
      const academicDays = ["MO", "TU", "WE", "TH", "FR"];
      const hasAcademicDays = parsed.config.byDay.some((day) =>
        academicDays.includes(day)
      );
      const hasWeekendDays = parsed.config.byDay.some((day) =>
        ["SA", "SU"].includes(day)
      );

      if (hasAcademicDays && hasWeekendDays) {
        errors.push(
          "Cannot combine school days and weekends in the same schedule"
        );
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static getPatternByRRule(rrule: string): RRulePattern | null {
    return (
      ACADEMIC_RRULE_PATTERNS.find((pattern) => pattern.rrule === rrule) || null
    );
  }

  static isAcademicPattern(rrule: string): boolean {
    const pattern = this.getPatternByRRule(rrule);
    return pattern?.category === "academic" || false;
  }

  static generatePreviewDates(
    rrule: string,
    startDate: Date,
    count: number = 10
  ): Date[] {
    const dates: Date[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < count; i++) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7); 
    }

    return dates;
  }

  private static parseRRuleString(rrule: string): Map<string, string> {
    const parts = new Map<string, string>();
    const segments = rrule
      .split(";")
      .filter((segment) => segment.trim() !== "");

    for (const segment of segments) {
      const [key, value] = segment.split("=", 2);
      if (key && value) {
        parts.set(key.trim().toUpperCase(), value.trim());
      }
    }

    return parts;
  }
}

export const parseRRule = RRuleUtils.parseRRule;
export const buildRRule = RRuleUtils.buildRRule;
export const getRRuleDescription = RRuleUtils.getDescription;
export const validateRRule = RRuleUtils.validateRRule;
export const getAcademicPatterns = () => ACADEMIC_RRULE_PATTERNS;

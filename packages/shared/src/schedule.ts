const santiagoTimeZone = "America/Santiago";

function numberPart(parts: readonly Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): number {
  const value = parts.find((part) => part.type === type)?.value;

  if (value === undefined) {
    throw new RangeError(`Missing ${type} while resolving timezone`);
  }

  return Number.parseInt(value, 10);
}

function offsetForTimeZone(date: Date, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const asUtc = Date.UTC(
    numberPart(parts, "year"),
    numberPart(parts, "month") - 1,
    numberPart(parts, "day"),
    numberPart(parts, "hour"),
    numberPart(parts, "minute"),
    numberPart(parts, "second"),
  );

  return asUtc - date.getTime();
}

function parseDateTimeParts(date: string, blockStart: string): {
  day: number;
  hour: number;
  minute: number;
  month: number;
  year: number;
} {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/u.exec(blockStart);

  if (dateMatch === null || timeMatch === null) {
    throw new RangeError("Invalid scheduled date or block start");
  }

  const year = Number.parseInt(dateMatch[1] ?? "", 10);
  const month = Number.parseInt(dateMatch[2] ?? "", 10);
  const day = Number.parseInt(dateMatch[3] ?? "", 10);
  const hour = Number.parseInt(timeMatch[1] ?? "", 10);
  const minute = Number.parseInt(timeMatch[2] ?? "", 10);

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    throw new RangeError("Invalid scheduled date or block start");
  }

  return { day, hour, minute, month, year };
}

export function buildScheduledDateTime(date: string, blockStart: string): Date {
  const parts = parseDateTimeParts(date, blockStart);
  const localAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, 0, 0);
  let utcTime = localAsUtc;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const offset = offsetForTimeZone(new Date(utcTime), santiagoTimeZone);
    const nextUtcTime = localAsUtc - offset;

    if (nextUtcTime === utcTime) {
      break;
    }

    utcTime = nextUtcTime;
  }

  const scheduledFor = new Date(utcTime);

  if (Number.isNaN(scheduledFor.getTime())) {
    throw new RangeError("Invalid scheduled date or block start");
  }

  return scheduledFor;
}

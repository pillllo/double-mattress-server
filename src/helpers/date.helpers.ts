const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function daysInMonth(month: number, year: number): number {
  // Month in JavaScript is 0-indexed (January is 0, February is 1, etc),
  // but by using 0 as the day it will give us the last day of the prior
  // month. So passing in 1 as the month number will return the last day
  // of January, not February
  return new Date(year, month, 0).getDate();
}

export function changeMonth(date: Date, operation: "add" | "subtract"): Date {
  let day = date.getDate();
  let month = date.getMonth();
  let year = date.getFullYear();
  // increment +/- wrap month / year as necessary
  if (operation === "add") {
    month += 1;
    month = month > 11 ? 0 : month;
    month === 0 && (year = year + 1);
  } else if (operation === "subtract") {
    month -= 1;
    month = month < 0 ? 11 : month;
    month === 11 && (year = year - 1);
  }
  return new Date(year, month, day);
}

export function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getMonthName(date: Date): string {
  return MONTH_NAMES[date.getMonth()];
}

export function dateIsInCurrentMonth(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

export function getSanitisedDate(input: any): Date | undefined {
  if (typeof input === "string") {
    const date = new Date(input);
    // if initialised with invalid string, getTime() returns NaN
    if (!isNaN(date.getTime())) return date;
  }
  return undefined;
}

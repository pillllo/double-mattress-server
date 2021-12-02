export function daysInMonth(month: number, year: number): number {
  // Month in JavaScript is 0-indexed (January is 0, February is 1, etc),
  // but by using 0 as the day it will give us the last day of the prior
  // month. So passing in 1 as the month number will return the last day
  // of January, not February
  return new Date(year, month, 0).getDate();
}

export function getSanitisedDate(input: any): Date | undefined {
  if (typeof input === "string") {
    const date = new Date(input);
    // if initialised with invalid string, getTime() returns NaN
    if (!isNaN(date.getTime())) return date;
  }
  return undefined;
}

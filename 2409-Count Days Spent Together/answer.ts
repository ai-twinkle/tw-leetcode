// Cumulative days before each month in a non-leap year; index is the 1-based month number.
const DAYS_BEFORE_MONTH = new Int16Array([
  0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
]);

/**
 * Converts a "MM-DD" date string into its 1-based day of the year.
 *
 * @param date - A 5-character date string in the "MM-DD" format.
 * @returns The day of the year, from 1 (January 1st) to 365 (December 31st).
 */
function toDayOfYear(date: string): number {
  // Read the four digits directly as char codes to skip substring/parseInt overhead.
  const month = (date.charCodeAt(0) - 48) * 10 + (date.charCodeAt(1) - 48);
  const day = (date.charCodeAt(3) - 48) * 10 + (date.charCodeAt(4) - 48);

  return DAYS_BEFORE_MONTH[month] + day;
}

/**
 * Counts the days Alice and Bob are both in Rome.
 *
 * @param arriveAlice - Alice's arrival date as "MM-DD".
 * @param leaveAlice - Alice's departure date as "MM-DD".
 * @param arriveBob - Bob's arrival date as "MM-DD".
 * @param leaveBob - Bob's departure date as "MM-DD".
 * @returns The number of overlapping days of the two stays.
 */
function countDaysTogether(
  arriveAlice: string,
  leaveAlice: string,
  arriveBob: string,
  leaveBob: string
): number {
  const aliceStart = toDayOfYear(arriveAlice);
  const bobStart = toDayOfYear(arriveBob);

  // The shared window starts at the later arrival and ends at the earlier departure.
  const overlapStart = aliceStart > bobStart ? aliceStart : bobStart;

  const aliceEnd = toDayOfYear(leaveAlice);
  const bobEnd = toDayOfYear(leaveBob);
  const overlapEnd = aliceEnd < bobEnd ? aliceEnd : bobEnd;

  const overlap = overlapEnd - overlapStart + 1;

  // A negative width means the two stays never intersect.
  return overlap > 0 ? overlap : 0;
}

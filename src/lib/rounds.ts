/**
 * Calculate all rounds since group creation until current month
 */
export function getRoundsSinceCreation(startMonth: Date) {
  const rounds = [];
  const now = new Date();

  // Set start date to first day of month
  const start = new Date(startMonth);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  // Set current date to first day of current month
  const current = new Date(now.getFullYear(), now.getMonth(), 1);
  current.setHours(0, 0, 0, 0);

  // Loop through each month from start date to current month
  const iterateMonth = new Date(start);

  while (iterateMonth <= current) {
    rounds.push({
      month: new Date(iterateMonth),
      label: formatMonthYear(iterateMonth),
    });

    // Move to next month
    iterateMonth.setMonth(iterateMonth.getMonth() + 1);
  }

  return rounds;
}

/**
 * Format a date to show only month and year in Indonesian format
 */
export function formatMonthYear(date: Date) {
  return date.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Check if a round is for the current month
 */
export function isCurrentMonth(date: Date) {
  const now = new Date();
  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/**
 * Check if a round date is in the past
 */
export function isPastRound(date: Date) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return date < currentMonth;
}

/**
 * Check if a round date is in the future
 */
export function isFutureRound(date: Date) {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  return date > currentMonth;
}

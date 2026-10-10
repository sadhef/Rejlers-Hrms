/** Odoo returns UTC timestamps with no timezone marker (e.g. "2026-08-08T08:06:49"); append Z before parsing. */
export const parseOdooTimestamp = (value) => {
  if (!value) return null;
  const iso = value.endsWith('Z') ? value : `${value}Z`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
};

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a calendar date as "19/Sep/2026".
 * @param {Date|string|null|undefined} value - Date or date string.
 * @returns {string} Formatted date, or a dash when absent or invalid.
 */
export const formatDate = (value) => {
  if (!value) return '-';
  let date;
  if (value instanceof Date) date = value;
  else if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) date = new Date(`${value}T00:00:00`);
  else date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return `${String(date.getDate()).padStart(2, '0')}/${SHORT_MONTHS[date.getMonth()]}/${date.getFullYear()}`;
};

/**
 * Formats a from/to date pair as one date or a range.
 * @param {Date|string|null|undefined} from - Start date.
 * @param {Date|string|null|undefined} to - End date.
 * @returns {string} Date, range, or a dash when start date is absent.
 */
export const formatDateRange = (from, to) => {
  if (!from) return '-';
  if (!to || from === to) return formatDate(from);
  return `${formatDate(from)} - ${formatDate(to)}`;
};

/** Formats a Date as "08:32 AM", or a dash when absent. */
export const formatTime = (date) => {
  if (!date) return '-';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Formats a local calendar date for backend query params and leave requests.
 * @param {Date} date - Local date to format.
 * @returns {string} Date in YYYY-MM-DD format.
 */
export const toApiDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Start-of-month, end-of-month, and start-of-year helpers used to build the Attendance page's date-range tabs. */
export const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
export const startOfPreviousMonth = (date) => new Date(date.getFullYear(), date.getMonth() - 1, 1);
export const endOfPreviousMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 0);
export const startOfYear = (date) => new Date(date.getFullYear(), 0, 1);

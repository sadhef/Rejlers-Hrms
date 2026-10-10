import axios from '../../../config/axios.js';
import { parseOdooTimestamp, toApiDate } from '../../../shared/utils/date.js';

/**
 * Lists all attendance punches in an inclusive date range, newest first.
 * @param {{dateFrom: Date, dateTo: Date}} range - Local calendar dates to query.
 * @returns {Promise<Array<object>>} Attendance records with parsed timestamps.
 * @throws {Error} When dates or response records are invalid, history is too large, or the request fails.
 */
export const listAttendance = async ({ dateFrom, dateTo }) => {
  if (!(dateFrom instanceof Date) || !(dateTo instanceof Date) || !Number.isFinite(dateFrom.getTime()) || !Number.isFinite(dateTo.getTime())) {
    throw new Error('Choose valid attendance dates.');
  }
  const from = toApiDate(dateFrom);
  const to = toApiDate(dateTo);
  if (from > to) throw new Error('The end date must be on or after the start date.');
  let limit = 62;
  let data;
  do {
    data = await axios.get('/attendance/list', {
      params: { date_from: from, date_to: to, limit },
    });
    if (!data || !Array.isArray(data.records)) throw new Error('The server returned invalid attendance records.');
    if (data.records.length >= limit && from < to) {
      const start = new Date(dateFrom.getFullYear(), dateFrom.getMonth(), dateFrom.getDate());
      const end = new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate());
      const middle = new Date((start.getTime() + end.getTime()) / 2);
      middle.setHours(0, 0, 0, 0);
      const nextDay = new Date(middle);
      nextDay.setDate(nextDay.getDate() + 1);
      const [earlier, later] = await Promise.all([
        listAttendance({ dateFrom: start, dateTo: middle }),
        listAttendance({ dateFrom: nextDay, dateTo: end }),
      ]);
      return [...later, ...earlier].sort((a, b) => (b.checkIn?.getTime() || 0) - (a.checkIn?.getTime() || 0));
    }
    if (data.records.length < limit) break;
    limit *= 2;
    if (!Number.isSafeInteger(limit)) throw new Error('Attendance history is too large to load.');
  } while (true);
  return data.records
    .map((r) => ({
      id: r.id,
      checkIn: parseOdooTimestamp(r.check_in),
      checkOut: parseOdooTimestamp(r.check_out),
      checkInCoords: r.in_latitude != null && r.in_longitude != null ? { latitude: r.in_latitude, longitude: r.in_longitude } : null,
      checkOutCoords: r.out_latitude != null && r.out_longitude != null ? { latitude: r.out_latitude, longitude: r.out_longitude } : null,
      workedHours: typeof r.worked_hours === 'number' ? r.worked_hours : null,
    }))
    .sort((a, b) => (b.checkIn?.getTime() || 0) - (a.checkIn?.getTime() || 0));
};

/** Sends a check-in or check-out only when the attendance punch includes valid coordinates. */
export const punchAttendance = async ({ action, latitude, longitude }) => {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error('A valid location is mandatory for check-in and check-out.');
  }
  if (action === 'in') return axios.post('/attendance/checkin', { latitude, longitude });
  if (action === 'out') return axios.post('/attendance/checkout', { latitude, longitude });
  throw new Error('Invalid attendance action.');
};

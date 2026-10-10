import axios from '../../../config/axios.js';

/** Odoo leave states, mapped to the badge labels shown across the UI. */
const STATUS_BY_STATE = {
  confirm: 'Pending',
  validate1: 'Pending',
  validate: 'Approved',
  refuse: 'Rejected',
};

/** Fetches this employee's leave balances, one entry per leave type. */
export const getBalances = async () => {
  const data = await axios.get('/leave/balances');
  return {
    totalRemaining: data.total_remaining,
    balances: data.balances.map((b) => ({
      leaveTypeId: b.leave_type_id,
      name: b.leave_type_name,
      allocated: b.allocated,
      taken: b.taken,
      remaining: b.remaining,
    })),
  };
};

/** Fetches the leave types selectable when applying for leave. */
export const getTypes = async () => {
  const data = await axios.get('/leave/types');
  return data.map((t) => ({ id: t.id, name: t.name }));
};

/**
 * Submits a leave request with the required empty attachment fields.
 * @param {{leaveTypeId: number, dateFrom: string, dateTo: string, description: string}} request - Leave type, inclusive YYYY-MM-DD dates and reason.
 * @returns {Promise<object>} The created leave request.
 * @throws {Error} When the type, dates or reason are invalid, or the API rejects the request.
 */
export const applyLeave = async ({ leaveTypeId, dateFrom, dateTo, description }) => {
  if (!Number.isSafeInteger(leaveTypeId) || leaveTypeId <= 0) throw new Error('Choose a valid leave type.');
  for (const date of [dateFrom, dateTo]) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
      throw new Error('Choose valid leave dates.');
    }
  }
  if (dateFrom > dateTo) throw new Error('The end date must be on or after the start date.');
  if (typeof description !== 'string') throw new Error('Enter a valid leave reason.');
  return axios.post('/leave/apply', {
    leave_type_id: leaveTypeId,
    date_from: dateFrom,
    date_to: dateTo,
    description: description.trim(),
    attachment: { filename: '', content: '' },
  });
};

/** Fetches every leave request raised by this employee - also the data source for the Requests page. */
export const getLeaveList = async () => {
  const data = await axios.get('/leave/list');
  return data.map((r) => ({
    id: r.id,
    leaveTypeName: r.leave_type?.name,
    dateFrom: r.date_from,
    dateTo: r.date_to,
    numberOfDays: r.number_of_days,
    description: r.description,
    state: r.state,
    status: STATUS_BY_STATE[r.state] || r.state_label || 'Pending',
  }));
};

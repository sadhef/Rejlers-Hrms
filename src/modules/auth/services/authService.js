import axios from '../../../config/axios.js';

/**
 * Authenticates against the Odoo HR backend.
 * @returns {Promise<{employee_id: number, employee_name: string, token: string}>}
 */
export const login = async ({ username, password }) => {
  if (typeof username !== 'string' || username.trim().length === 0) {
    throw new Error('Username is required');
  }
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password is required');
  }
  return axios.post('/auth/login', { username: username.trim(), password });
};

/** Best-effort server-side logout; the caller always clears local session state regardless of outcome. */
export const logout = async () => axios.post('/auth/logout');

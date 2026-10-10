const TONE_BY_STATUS = {
  Pending: 'bg-[var(--warn-bg)] text-[var(--warn)]',
  Late: 'bg-[var(--warn-bg)] text-[var(--warn)]',
  Open: 'bg-[var(--warn-bg)] text-[var(--warn)]',
  'Expiring soon': 'bg-[var(--warn-bg)] text-[var(--warn)]',
  HR: 'bg-[var(--warn-bg)] text-[var(--warn)]',
  Rejected: 'bg-[var(--bad-bg)] text-[var(--bad)]',
  Absent: 'bg-[var(--bad-bg)] text-[var(--bad)]',
  'In Progress': 'bg-[var(--pri-bg)] text-[var(--pri-d)]',
  'Missed Checkout': 'bg-[var(--bad-bg)] text-[var(--bad)]',
  Remote: 'bg-[var(--pri-bg)] text-[var(--pri-d)]',
  IT: 'bg-[var(--pri-bg)] text-[var(--pri-d)]',
  Company: 'bg-[var(--ink-bg)] text-[var(--ink)]',
};

/** Statuses that mean "as expected" - plain text keeps color reserved for what actually needs attention. */
const PLAIN_STATUSES = new Set(['Approved', 'Present', 'Paid', 'Valid']);

/** Status/category pill used across every HR list, table, and card grid - tone keyed by the label's exact text. */
const StatusBadge = ({ children }) => {
  if (PLAIN_STATUSES.has(children)) {
    return <span className="whitespace-nowrap text-xs font-semibold tracking-[0.03em] text-[var(--ok)]">{children}</span>;
  }
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-md px-3 py-[5px] text-xs font-semibold tracking-[0.03em] ${TONE_BY_STATUS[children] || 'bg-[var(--surface-2)] text-[var(--tx2)]'}`}>
      {children}
    </span>
  );
};

export default StatusBadge;

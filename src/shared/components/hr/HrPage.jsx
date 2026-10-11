import { useState } from 'react';
import StatusBadge from './StatusBadge.jsx';
import SortHeader from './SortHeader.jsx';
import Icon from '../Icon.jsx';

/** Skeleton matching MetricGrid's shape, shown while its query loads. */
export const SkeletonMetrics = ({ count = 4 }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="h-3 w-24 rounded bg-[var(--surface-2)]" />
        <div className="mt-3 h-7 w-16 rounded bg-[var(--surface-2)]" />
        <div className="mt-2 h-3 w-28 rounded bg-[var(--surface-2)]" />
      </div>
    ))}
  </div>
);

/** Skeleton matching DataTable's shape (header row plus body rows), shown while its query loads. */
export const SkeletonTable = ({ columns = 5, rows = 6 }) => (
  <section className="-mx-4 max-w-[calc(100%+2rem)] overflow-hidden border-y border-[var(--border)] bg-[var(--surface)] sm:mx-0 sm:max-w-full sm:rounded-[14px] sm:border">
    <div className="border-b border-[var(--border)] bg-[var(--surface-2)] px-5 py-[15px] sm:px-6">
      <div className="h-3 w-32 rounded bg-[var(--border-2)]" />
    </div>
    <div className="animate-pulse divide-y divide-[var(--border)]">
      {Array.from({ length: rows }).map((_, ri) => (
        <div
          key={ri}
          className="grid items-center gap-[18px] px-5 py-[16px] sm:px-6"
          style={{ gridTemplateColumns: `1.6fr repeat(${columns - 1}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, ci) => (
            <div key={ci} className="h-3.5 rounded bg-[var(--surface-2)]" style={{ width: ci === 0 ? '80%' : '55%' }} />
          ))}
        </div>
      ))}
    </div>
  </section>
);

/** Centered placeholder shown when a page's primary query fails, with a retry action. */
export const ErrorState = ({ message = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center gap-3.5 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-14 text-center sm:py-16">
    <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--bad-bg)]">
      <Icon name="alertCircle" size={20} color="var(--bad)" />
    </div>
    <p className="m-0 max-w-[380px] text-[14.5px] text-[var(--tx2)]">{message}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 text-[14px] font-medium text-[var(--tx)] transition-colors duration-200 hover:border-[var(--border-2)] hover:bg-[var(--surface-2)]"
      >
        Try again
      </button>
    )}
  </div>
);

/** Centered placeholder shown when a query succeeds but returns no rows - an optional action turns the dead end into the page's next step. */
export const EmptyState = ({ label, actionLabel, onAction }) => (
  <div className="flex flex-col items-center gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] px-4 py-12 text-center sm:py-16">
    <p className="m-0 text-sm text-[var(--tx3)]">{label}</p>
    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="cursor-pointer rounded-xl border-0 bg-[var(--pri)] px-5 py-2.5 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-[var(--pri-d)]"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

/**
 * Renders an HR page title and optional primary action.
 * @param {object} props - Header configuration.
 * @param {string} props.title - Page title.
 * @param {string} [props.subtitle] - Supporting description.
 * @param {string} [props.actionLabel] - Primary action text.
 * @param {() => void} [props.onAction] - Primary action handler.
 * @param {boolean} [props.actionDisabled=false] - Whether the primary action is unavailable.
 * @returns {JSX.Element} Page header.
 */
export const PageHeader = ({ title, subtitle, actionLabel, onAction, actionDisabled = false }) => (
  <div className="flex flex-wrap items-start justify-between gap-4 sm:items-end sm:gap-5">
    <div className="min-w-0">
      <h1 className="m-0 break-words text-[26px] font-medium tracking-[-0.01em] text-[var(--tx)] sm:text-[30px]">{title}</h1>
      {subtitle && <p className="m-0 mt-1.5 text-[15px] text-[var(--tx2)]">{subtitle}</p>}
    </div>
    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        disabled={actionDisabled}
        className="min-h-11 w-full cursor-pointer rounded-full border-0 bg-[var(--pri)] px-6 py-3 text-[15px] font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pri)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

/** Pill tab bar used for the All / status / period filters at the top of each list page. */
export const TabBar = ({ tabs, active, onChange }) => (
  <div className="no-scrollbar -mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onChange(tab)}
        aria-pressed={tab === active}
        className={[
          'min-h-11 flex-none cursor-pointer whitespace-nowrap rounded-full border px-5 py-2 text-[14.5px] font-medium transition-colors duration-200',
          tab === active
            ? 'border-[var(--ink-solid)] bg-[var(--ink-solid)] text-white'
            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--tx2)] hover:border-[var(--border-2)]',
        ].join(' ')}
      >
        {tab}
      </button>
    ))}
  </div>
);

/**
 * KPI tile grid - auto-fills so an arbitrary (backend-driven) tile count never leaves a lopsided
 * last row. A metric flagged `highlight` renders on the brand sweep instead of a plain surface,
 * which is how the page's headline number (net pay, for example) leads the row.
 * @param {{ metrics: Array<{label: string, value: string, note: string, highlight?: boolean}> }} props - Tiles in display order.
 */
export const MetricGrid = ({ metrics }) => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-5">
    {metrics.map((m, i) =>
      m.highlight ? (
        <div
          key={m.label}
          className="gs-fade relative overflow-hidden rounded-[14px] p-5 text-white"
          style={{ animationDelay: `${i * 0.05}s`, backgroundImage: 'var(--brand-sweep)' }}
        >
          <img src={`${import.meta.env.BASE_URL}brand/rejlers-mark-white.svg`} alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-[14px] -right-[10px] w-[120px] opacity-[0.12]" />
          <div className="relative text-[12.5px] font-bold uppercase tracking-[0.09em] text-[var(--rj-green)]">{m.label}</div>
          <div className="relative mt-2 text-[28px] font-extrabold tabular-nums tracking-[-0.03em]">{m.value}</div>
          <div className="relative mt-1 text-[12.5px] text-white/70">{m.note}</div>
        </div>
      ) : (
        <div
          key={m.label}
          className="gs-fade rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5 transition-[background-color,border-color] duration-200 hover:border-[var(--border-2)] hover:bg-[var(--surface-2)]"
          style={{ animationDelay: `${i * 0.05}s` }}
        >
          <div className="text-[12.5px] font-semibold uppercase tracking-[0.08em] text-[var(--tx2)]">{m.label}</div>
          <div className="mt-2 text-[28px] font-bold tabular-nums tracking-[-0.02em] text-[var(--ink)]">{m.value}</div>
          <div className="mt-1 text-[12.5px] text-[var(--tx3)]">{m.note}</div>
        </div>
      ),
    )}
  </div>
);

const compareTableValues = (left, right) => {
  if (typeof left === 'number') return left - right;
  return left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' });
};

/**
 * Bordered sortable data table with explicit render and sort contracts per column.
 * @param {{ columns: Array<{key: string, label: string, group: string|null, width: string, render: (row: object) => React.ReactNode, sortValue: (row: object) => string|number}>, rows: Array<{id: string|number}>, statusColumn: string }} props - Table configuration and records; columns sharing a non-null group must be adjacent.
 * @returns {JSX.Element} A responsive semantic table with sortable headers.
 */
export const DataTable = ({ columns, rows, statusColumn }) => {
  const [sortState, setSortState] = useState({ key: null, direction: null });
  const [filters, setFilters] = useState({});
  const activeColumn = sortState.key === null ? null : columns.find((column) => column.key === sortState.key);
  const groupedHeaders = [];
  columns.forEach((column) => {
    const previousGroup = groupedHeaders[groupedHeaders.length - 1];
    if (column.group !== null && previousGroup?.label === column.group) {
      previousGroup.columns.push(column);
      return;
    }
    groupedHeaders.push({ key: column.key, label: column.group, columns: [column] });
  });
  const hasGroupedHeaders = groupedHeaders.some((group) => group.label !== null);
  const lastColumnKey = columns[columns.length - 1].key;
  const filteredRows = rows.filter((row) => columns.every((column) => {
    const filterValue = filters[column.key];
    if (!filterValue) return true;
    return String(column.sortValue(row)).toLowerCase().includes(filterValue.trim().toLowerCase());
  }));
  const displayedRows = activeColumn === null
    ? filteredRows
    : [...filteredRows].sort((left, right) => {
        const result = compareTableValues(activeColumn.sortValue(left), activeColumn.sortValue(right));
        return sortState.direction === 'desc' ? -result : result;
      });

  const setColumnFilter = (columnKey, value) => setFilters((current) => ({ ...current, [columnKey]: value }));

  return (
    <section className="gs-fade -mx-4 max-w-[calc(100%+2rem)] overflow-hidden border-y border-[var(--border)] bg-[var(--surface)] sm:mx-0 sm:max-w-full sm:rounded sm:border">
      <div className="table-scroll max-w-full overscroll-x-contain overflow-x-auto">
        <table className="w-full min-w-[680px] table-fixed sm:min-w-[720px]" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <colgroup>
            {columns.map((column) => <col key={column.key} style={{ width: column.width }} />)}
          </colgroup>
          <thead>
            <tr>
              {groupedHeaders.map((group) => {
                if (group.label !== null) {
                  return (
                    <th
                      key={group.key}
                      scope="colgroup"
                      colSpan={group.columns.length}
                      className={`border-b border-[var(--border-2)] bg-[var(--surface-2)] px-3 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--tx)] ${group.columns[group.columns.length - 1].key === lastColumnKey ? '' : 'border-r'}`}
                    >
                      {group.label}
                    </th>
                  );
                }
                const column = group.columns[0];
                return (
                  <SortHeader
                    key={column.key}
                    label={column.label}
                    columnKey={column.key}
                    sortState={sortState}
                    setSortState={setSortState}
                    filterValue={filters[column.key] || ''}
                    onFilterValueChange={(value) => setColumnFilter(column.key, value)}
                    rowSpan={hasGroupedHeaders ? 2 : 1}
                    isLast={column.key === lastColumnKey}
                  />
                );
              })}
            </tr>
            {hasGroupedHeaders && (
              <tr>
                {groupedHeaders.flatMap((group) => group.label === null ? [] : group.columns).map((column) => (
                  <SortHeader
                    key={column.key}
                    label={column.label}
                    columnKey={column.key}
                    sortState={sortState}
                    setSortState={setSortState}
                    filterValue={filters[column.key] || ''}
                    onFilterValueChange={(value) => setColumnFilter(column.key, value)}
                    rowSpan={1}
                    isLast={column.key === lastColumnKey}
                  />
                ))}
              </tr>
            )}
          </thead>
          <tbody>
            {displayedRows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-3.5 py-7 text-center text-[13.5px] text-[var(--tx2)]">No rows match this filter.</td></tr>
            ) : displayedRows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className="gs-slide-in bg-[var(--surface)] transition-colors [&:last-child>td]:border-b-0 hover:bg-[var(--ink-bg)]"
                style={{ animationDelay: `${rowIndex * 0.035}s` }}
              >
                {columns.map((column, columnIndex) => {
                  const cell = column.render(row);
                  return (
                    <td
                      key={column.key}
                      className={`border-b border-[var(--border-2)] px-3 py-2.5 text-xs tabular-nums text-[var(--tx)] ${columnIndex === 0 ? 'font-semibold' : ''} ${columnIndex === columns.length - 1 ? '' : 'border-r'}`}
                    >
                      <div className="min-w-0 truncate">
                        {column.key === statusColumn ? <StatusBadge>{cell}</StatusBadge> : cell}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

/** Grid of content cards (documents, directory entries, help articles). */
export const CardGrid = ({ cards, columns = 3 }) => (
  <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 ${columns === 3 ? 'xl:grid-cols-3' : ''}`}>
    {cards.map((c, i) => (
      <div
        key={c.title}
        className="gs-fade flex min-w-0 flex-col gap-2.5 rounded-[14px] border border-[var(--border)] bg-[var(--surface)] p-5"
        style={{ animationDelay: `${i * 0.04}s` }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`grid h-11 w-11 flex-shrink-0 place-items-center rounded-[11px] text-[12px] font-extrabold tracking-[0.04em] ${
              typeof c.avatar === 'string' ? 'bg-[var(--ink-solid)] text-white' : c.avatar.tag ? 'text-white' : 'bg-[var(--ink-bg)]'
            }`}
            style={c.avatar?.tag ? { backgroundImage: 'var(--brand-sweep)' } : undefined}
          >
            {typeof c.avatar === 'string' ? (
              c.avatar
            ) : c.avatar.tag ? (
              c.avatar.tag
            ) : (
              <Icon name={c.avatar.icon} size={20} color="var(--ink)" />
            )}
          </div>
          <div className="min-w-0">
            <div className="break-words text-[16px] font-medium text-[var(--tx)]">{c.title}</div>
            <div className="mt-0.5 break-words text-[13.5px] text-[var(--tx2)]">{c.subtitle}</div>
          </div>
        </div>
        <div className="break-words text-[13.8px] leading-[1.55] text-[var(--tx2)]">{c.body}</div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2.5">
          <span className="text-[12.5px] text-[var(--tx2)]">{c.meta}</span>
          <StatusBadge>{c.badge}</StatusBadge>
        </div>
      </div>
    ))}
  </div>
);

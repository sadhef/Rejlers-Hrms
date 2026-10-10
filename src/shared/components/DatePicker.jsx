import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarBlankIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { formatDate } from '../utils/date.js';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Local YYYY-MM-DD (never UTC-shifted, unlike `Date#toISOString`). */
const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseIsoDate = (value) => {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameDay = (a, b) => !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Calendar-popover date field styled to match the rest of the form chrome (radius, borders,
 * accent colour) instead of the browser's native date input. The calendar itself renders through
 * a portal to `document.body` so it always escapes a scrollable/clipped ancestor (e.g. a modal).
 * @param {string} value - Selected date as `YYYY-MM-DD`, or empty.
 * @param {(value: string) => void} onChange - Called with the newly selected `YYYY-MM-DD`.
 * @param {string} [placeholder] - Shown in the trigger when no date is selected.
 * @param {string} [minDate] - Earliest selectable `YYYY-MM-DD` date.
 * @param {string} [maxDate] - Latest selectable `YYYY-MM-DD` date.
 * @param {import('react').RefObject<HTMLDialogElement>} [portalRef] - Open native dialog that owns the calendar, when used inside one.
 * @returns {import('react').ReactElement} Calendar trigger and popover.
 */
const DatePicker = ({ value, onChange, placeholder = 'Select date', minDate, maxDate, portalRef }) => {
  const selected = parseIsoDate(value);
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => selected || new Date());
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);

  const reposition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    // The app root is CSS-zoomed on desktop: rects are in screen pixels but `fixed` offsets get scaled again.
    const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    if (rect) setCoords({ top: (rect.bottom + 6) / zoom, left: rect.left / zoom, width: rect.width / zoom });
  };

  useEffect(() => {
    if (!open) return;
    setViewMonth(selected || new Date());
    reposition();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onOutside = (e) => {
      if (triggerRef.current?.contains(e.target) || popoverRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onEscape = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEscape);
    window.addEventListener('resize', reposition);
    document.addEventListener('scroll', reposition, true);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEscape);
      window.removeEventListener('resize', reposition);
      document.removeEventListener('scroll', reposition, true);
    };
  }, [open]);

  const today = new Date();
  const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const leadingBlanks = firstOfMonth.getDay();
  const cells = [...Array(leadingBlanks).fill(null), ...Array(daysInMonth).keys()].map((d) => (d === null ? null : d + 1));

  const displayLabel = selected ? formatDate(selected) : placeholder;

  const pick = (day) => {
    const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    const isoDate = toIsoDate(date);
    if ((minDate && isoDate < minDate) || (maxDate && isoDate > maxDate)) return;
    onChange(isoDate);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`mt-[7px] flex min-w-0 w-full max-w-full items-center justify-between gap-2 rounded-[9px] border border-[var(--border-2)] bg-[var(--surface)] px-3.5 py-3 text-left text-[15px] normal-case outline-none transition-colors duration-150 ${selected ? 'text-[var(--tx)]' : 'text-[var(--tx3)]'} ${open ? 'border-[var(--ink-2)]' : ''}`}
      >
        {displayLabel}
        <CalendarBlankIcon size={17} className="flex-shrink-0 text-[var(--tx3)]" />
      </button>

      {open && coords && createPortal(
        <div
          ref={popoverRef}
          className="gs-pop fixed z-[300] w-[280px] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-[0_20px_46px_rgba(27,27,43,0.16)]"
          style={{ top: coords.top, left: coords.left }}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-[var(--tx2)] hover:bg-[var(--bg)]"
              aria-label="Previous month"
            >
              <CaretLeftIcon size={14} />
            </button>
            <span className="text-[13.5px] font-semibold text-[var(--tx)]">
              {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-[var(--tx2)] hover:bg-[var(--bg)]"
              aria-label="Next month"
            >
              <CaretRightIcon size={14} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--tx3)]">{w}</span>
            ))}
            {cells.map((day, i) => {
              if (day === null) return <span key={`b${i}`} />;
              const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
              const isoDate = toIsoDate(date);
              const disabled = (minDate && isoDate < minDate) || (maxDate && isoDate > maxDate);
              const isSelected = isSameDay(date, selected);
              const isToday = isSameDay(date, today);
              return (
                <button
                  key={day}
                  type="button"
                  aria-label={formatDate(date)}
                  onClick={() => pick(day)}
                  disabled={disabled}
                  className={[
                    'mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-[13.5px] tabular-nums transition-colors duration-150',
                    disabled
                      ? 'cursor-not-allowed text-[var(--tx3)] opacity-50'
                      : isSelected
                        ? 'cursor-pointer bg-[var(--pri)] font-semibold text-white'
                        : isToday
                          ? 'cursor-pointer border border-[var(--ink-2)] text-[var(--ink-2)]'
                          : 'cursor-pointer text-[var(--tx)] hover:bg-[var(--bg)]',
                  ].join(' ')}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>,
        portalRef?.current ?? document.body
      )}
    </>
  );
};

export default DatePicker;

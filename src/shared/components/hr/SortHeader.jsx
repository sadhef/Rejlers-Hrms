import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const SortAscIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
const SortDescIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);
const MenuDotsIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="19" r="1.6" />
  </svg>
);
const StreamIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
);
const FilterIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></svg>
);

/**
 * Sortable table heading with an inline filter input and a floating action menu
 * (clear sort, sort asc/desc, clear filter, filter by column). Menu renders via
 * a portal so it isn't clipped by the table's own scroll container.
 * @param {{
 *   label: string, columnKey: string,
 *   sortState: {key: string|null, direction: null|'asc'|'desc'}, setSortState: Function,
 *   filterValue: string, onFilterValueChange: (value: string) => void,
 *   rowSpan: number, isLast: boolean
 * }} props
 */
const SortHeader = ({ label, columnKey, sortState, setSortState, filterValue, onFilterValueChange, rowSpan, isLast }) => {
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const menuWidth = 220;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleOutsideClick = (event) => {
      const clickedInsideHeader = containerRef.current?.contains(event.target);
      const clickedInsideMenu = menuRef.current?.contains(event.target);
      if (!clickedInsideHeader && !clickedInsideMenu) setMenuOpen(false);
    };
    const handleEscape = (event) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const updateMenuPosition = () => {
      if (!menuButtonRef.current) return;
      const rect = menuButtonRef.current.getBoundingClientRect();
      const maxLeft = Math.max(8, window.innerWidth - menuWidth - 8);
      setMenuPosition({ top: rect.bottom + 6, left: Math.min(Math.max(8, rect.left), maxLeft) });
    };
    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [menuOpen]);

  const sortActive = sortState.key === columnKey && !!sortState.direction;
  const isAscActive = sortState.key === columnKey && sortState.direction === 'asc';
  const isDescActive = sortState.key === columnKey && sortState.direction === 'desc';
  const isFilterActive = filterValue.trim().length > 0;
  const ariaSort = isAscActive ? 'ascending' : isDescActive ? 'descending' : 'none';

  const toggleSortByArrow = () => {
    setSortState((prev) => {
      if (prev.key !== columnKey) return { key: columnKey, direction: 'asc' };
      return { key: columnKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const setColumnSort = (direction) => { setSortState({ key: columnKey, direction }); setMenuOpen(false); };
  const clearColumnSort = () => { if (sortState.key === columnKey) setSortState({ key: null, direction: null }); setMenuOpen(false); };
  const clearColumnFilter = () => { if (isFilterActive) onFilterValueChange(''); setMenuOpen(false); };
  const showColumnFilter = () => { setFilterVisible(true); setMenuOpen(false); };

  const handleMenuToggle = () => {
    if (menuOpen) { setMenuOpen(false); return; }
    if (!menuButtonRef.current) return;
    const rect = menuButtonRef.current.getBoundingClientRect();
    const maxLeft = Math.max(8, window.innerWidth - menuWidth - 8);
    setMenuPosition({ top: rect.bottom + 6, left: Math.min(Math.max(8, rect.left), maxLeft) });
    setMenuOpen(true);
  };

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      rowSpan={rowSpan}
      className={`relative z-20 overflow-visible border-b border-[var(--border-2)] bg-[var(--surface-2)] px-3 py-2.5 text-left align-middle ${isLast ? '' : 'border-r'}`}
    >
      <div ref={containerRef} className="flex min-w-0 items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--tx)]">
        <span className={`min-w-0 truncate ${sortActive ? 'text-[var(--pri)]' : ''}`}>{label}</span>
        <button type="button" onClick={toggleSortByArrow} aria-label={`Sort ${label} ${isAscActive ? 'descending' : 'ascending'}`} className={`cursor-pointer ${sortActive ? 'text-[var(--pri)]' : 'text-[var(--tx3)] hover:text-[var(--pri)]'}`}>
          {isDescActive ? <SortDescIcon /> : <SortAscIcon />}
        </button>
        <button ref={menuButtonRef} type="button" onClick={handleMenuToggle} aria-label={`${label} column options`} className={`ml-auto cursor-pointer ${isFilterActive ? 'text-[var(--pri)]' : 'text-[var(--border-2)] hover:text-[var(--tx2)]'}`}>
          <MenuDotsIcon />
        </button>
      </div>

      {filterVisible && (
        <div className="mt-1.5">
          <input
            type="text"
            value={filterValue}
            onChange={(event) => onFilterValueChange(event.target.value)}
            placeholder={`Filter by ${label}`}
            className="h-7 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-normal normal-case tracking-normal text-[var(--tx)] outline-none focus:border-[var(--pri)]"
          />
        </div>
      )}

      {menuOpen && menuPosition && typeof document !== 'undefined' && createPortal(
        <div ref={menuRef} className="fixed min-w-[220px] rounded-md border border-[var(--border)] bg-[var(--surface)] p-1 text-[13px] font-normal normal-case tracking-normal shadow-lg" style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px`, zIndex: 9999 }}>
          <button type="button" onClick={clearColumnSort} disabled={!sortActive} className={`flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-xs ${sortActive ? 'text-[var(--tx)] hover:bg-[var(--surface-2)]' : 'cursor-not-allowed text-[var(--border-2)]'}`}>
            <StreamIcon /> Clear sort
          </button>
          <button type="button" onClick={() => setColumnSort('asc')} disabled={isAscActive} className={`flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-xs ${isAscActive ? 'cursor-not-allowed text-[var(--border-2)]' : 'text-[var(--tx)] hover:bg-[var(--surface-2)]'}`}>
            <SortAscIcon /> Sort by {label} ascending
          </button>
          <button type="button" onClick={() => setColumnSort('desc')} disabled={isDescActive} className={`flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-xs ${isDescActive ? 'cursor-not-allowed text-[var(--border-2)]' : 'text-[var(--tx)] hover:bg-[var(--surface-2)]'}`}>
            <SortDescIcon /> Sort by {label} descending
          </button>
          <button type="button" onClick={clearColumnFilter} disabled={!isFilterActive} className={`flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-xs ${isFilterActive ? 'text-[var(--tx)] hover:bg-[var(--surface-2)]' : 'cursor-not-allowed text-[var(--border-2)]'}`}>
            <FilterIcon /> Clear filter
          </button>
          <button type="button" onClick={showColumnFilter} className="flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-xs text-[var(--tx)] hover:bg-[var(--surface-2)]">
            <FilterIcon /> Filter by {label}
          </button>
        </div>,
        document.body,
      )}
    </th>
  );
};

export default SortHeader;

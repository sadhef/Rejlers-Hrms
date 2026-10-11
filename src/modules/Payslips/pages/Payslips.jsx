import { SAMPLE_PAYSLIPS } from '../data/sampleData.js';
import { useState } from 'react';
import Layout from '../../../shared/components/Layout.jsx';
import { PageHeader, TabBar, MetricGrid, DataTable } from '../../../shared/components/hr/HrPage.jsx';

const currency = (value) => `AED ${value.toLocaleString('en-US')}`;
const COLUMNS = [
  { key: 'period', label: 'Period', group: null, width: '25%', render: (row) => row.period, sortValue: (row) => row.periodDate },
  { key: 'gross', label: 'Gross', group: null, width: '18.75%', render: (row) => currency(row.gross), sortValue: (row) => row.gross },
  { key: 'deductions', label: 'Deductions', group: null, width: '18.75%', render: (row) => currency(row.deductions), sortValue: (row) => row.deductions },
  { key: 'netPay', label: 'Net Pay', group: null, width: '18.75%', render: (row) => currency(row.netPay), sortValue: (row) => row.netPay },
  { key: 'status', label: 'Status', group: null, width: '18.75%', render: (row) => row.status, sortValue: (row) => row.status },
];

/** Renders sample payroll with year filters and sortable statements. No props or custom errors; returns a page element. */
const Payslips = () => {
  const [year, setYear] = useState('2026');
  const rows = SAMPLE_PAYSLIPS.filter((row) => row.periodDate.startsWith(year));
  const latest = rows[0];
  const metrics = [
    { label: 'Latest Net Pay', value: latest ? currency(latest.netPay) : '—', note: latest ? latest.period : 'No statements', highlight: true },
    { label: 'Gross Total', value: currency(rows.reduce((sum, row) => sum + row.gross, 0)), note: `${year} available statements` },
    { label: 'Deductions', value: currency(rows.reduce((sum, row) => sum + row.deductions, 0)), note: `${year} available statements` },
    { label: 'Statements', value: String(rows.length), note: `For ${year}` },
  ];
  return (
    <Layout>
      <div className="flex flex-col gap-[22px]">
        <PageHeader title="Payroll" subtitle="Monthly statements, transfers and pay totals" />
        <p className="m-0 text-sm text-[var(--tx2)]">Sample data · These statements do not represent your salary.</p>
        <TabBar tabs={['2026', '2025']} active={year} onChange={setYear} />
        <MetricGrid metrics={metrics} />
        <DataTable columns={COLUMNS} rows={rows} statusColumn="status" />
      </div>
    </Layout>
  );
};
export default Payslips;

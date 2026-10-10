import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '../../../shared/components/Layout.jsx';
import { PageHeader, TabBar, MetricGrid, DataTable, SkeletonMetrics, SkeletonTable, ErrorState, EmptyState } from '../../../shared/components/hr/HrPage.jsx';
import ApplyLeaveModal from '../components/ApplyLeaveModal.jsx';
import { getBalances, getLeaveList } from '../services/leaveService.js';
import { formatDate } from '../../../shared/utils/date.js';

const TABS = ['All', 'Approved', 'Pending', 'Rejected'];

const COLUMNS = [
  { key: 'leaveType', label: 'Leave Type', group: null, width: '18%', render: (row) => row.leaveTypeName, sortValue: (row) => row.leaveTypeName },
  { key: 'dateFrom', label: 'From Date', group: 'Dates', width: '16%', render: (row) => formatDate(row.dateFrom), sortValue: (row) => new Date(row.dateFrom).getTime() },
  { key: 'dateTo', label: 'To Date', group: 'Dates', width: '16%', render: (row) => formatDate(row.dateTo), sortValue: (row) => new Date(row.dateTo).getTime() },
  { key: 'days', label: 'Days', group: null, width: '10%', render: (row) => String(row.numberOfDays), sortValue: (row) => row.numberOfDays },
  { key: 'description', label: 'Description', group: null, width: '24%', render: (row) => row.description || '-', sortValue: (row) => row.description || '' },
  { key: 'status', label: 'Status', group: null, width: '16%', render: (row) => row.status, sortValue: (row) => row.status },
];

const Leave = () => {
  const [tab, setTab] = useState(TABS[0]);
  const [applyOpen, setApplyOpen] = useState(false);

  const balancesQuery = useQuery({ queryKey: ['leave', 'balances'], queryFn: getBalances });
  const listQuery = useQuery({ queryKey: ['leave', 'list'], queryFn: getLeaveList });

  const metrics = useMemo(
    () => (balancesQuery.data?.balances || []).map((b) => ({ label: b.name, value: String(b.remaining), note: 'Days available' })),
    [balancesQuery.data]
  );

  const rows = useMemo(() => {
    const list = listQuery.data || [];
    return tab === 'All' ? list : list.filter((r) => r.status === tab);
  }, [listQuery.data, tab]);

  return (
    <Layout>
      <div className="flex flex-col gap-[22px]">
        <PageHeader
          title="Leave Requests"
          subtitle="Balances, history and new requests"
          actionLabel="Apply Leave"
          onAction={() => setApplyOpen(true)}
        />
        <TabBar tabs={TABS} active={tab} onChange={setTab} />

        {balancesQuery.isLoading ? (
          <SkeletonMetrics count={3} />
        ) : balancesQuery.isError ? (
          <ErrorState message={balancesQuery.error.message} onRetry={balancesQuery.refetch} />
        ) : (
          <MetricGrid metrics={metrics} />
        )}

        {listQuery.isLoading ? (
          <SkeletonTable columns={6} rows={5} />
        ) : listQuery.isError ? (
          <ErrorState message={listQuery.error.message} onRetry={listQuery.refetch} />
        ) : rows.length ? (
          <DataTable columns={COLUMNS} rows={rows} statusColumn="status" />
        ) : (
          <EmptyState label="No leave requests here yet." actionLabel="Apply Leave" onAction={() => setApplyOpen(true)} />
        )}
      </div>

      <ApplyLeaveModal open={applyOpen} onClose={() => setApplyOpen(false)} />
    </Layout>
  );
};

export default Leave;

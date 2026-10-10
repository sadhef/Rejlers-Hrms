import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Layout from '../../../shared/components/Layout.jsx';
import { PageHeader, TabBar, MetricGrid, DataTable, SkeletonMetrics, SkeletonTable, ErrorState, EmptyState } from '../../../shared/components/hr/HrPage.jsx';
import { listAttendance, punchAttendance } from '../services/attendanceService.js';
import { getCurrentCoords } from '../../../shared/utils/geolocation.js';
import { formatDate, formatTime, startOfMonth, startOfPreviousMonth, endOfPreviousMonth, startOfYear } from '../../../shared/utils/date.js';

const TABS = ['This Month', 'Last Month', 'Year to Date'];

/** Resolves a tab label to the concrete date range the backend query needs. */
const rangeForTab = (tab) => {
  const now = new Date();
  if (tab === 'Last Month') return { dateFrom: startOfPreviousMonth(now), dateTo: endOfPreviousMonth(now) };
  if (tab === 'Year to Date') return { dateFrom: startOfYear(now), dateTo: now };
  return { dateFrom: startOfMonth(now), dateTo: now };
};

const todayRange = () => {
  const now = new Date();
  return { dateFrom: now, dateTo: now };
};

/** Punch time plus a link to the captured coordinates on a map, when the punch has a location. */
const PunchCell = ({ time, coords }) => (
  <div>
    <div>{time}</div>
    {coords && (
      <a
        href={`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`}
        target="_blank"
        rel="noreferrer"
        className="text-[12px] text-[var(--pri)] hover:text-[var(--pri-d)]"
        onClick={(e) => e.stopPropagation()}
      >
        View on map
      </a>
    )}
  </div>
);

const COLUMNS = [
  { key: 'date', label: 'Date', group: null, width: '22%', render: (row) => formatDate(row.checkIn), sortValue: (row) => row.checkIn.getTime() },
  { key: 'checkIn', label: 'Check In', group: null, width: '22%', render: (row) => <PunchCell time={formatTime(row.checkIn)} coords={row.checkInCoords} />, sortValue: (row) => row.checkIn.getTime() },
  { key: 'checkOut', label: 'Check Out', group: null, width: '22%', render: (row) => <PunchCell time={formatTime(row.checkOut)} coords={row.checkOutCoords} />, sortValue: (row) => (row.checkOut === null ? 0 : row.checkOut.getTime()) },
  { key: 'worked', label: 'Worked', group: null, width: '15%', render: (row) => (!row.checkOut || row.workedHours === null ? '-' : `${row.workedHours.toFixed(1)}h`), sortValue: (row) => (row.workedHours === null ? 0 : row.workedHours) },
  {
    key: 'status',
    label: 'Status',
    group: null,
    width: '19%',
    render: (row) => (row.checkOut ? 'Present' : row.checkIn.toDateString() === new Date().toDateString() ? 'In Progress' : 'Missed Checkout'),
    sortValue: (row) => (row.checkOut ? 2 : row.checkIn.toDateString() === new Date().toDateString() ? 1 : 0),
  },
];

const Attendance = () => {
  const [tab, setTab] = useState(TABS[0]);
  const queryClient = useQueryClient();
  const range = rangeForTab(tab);

  const recordsQuery = useQuery({
    queryKey: ['attendance', 'range', tab],
    queryFn: () => listAttendance(range),
  });

  const todayQuery = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => listAttendance(todayRange()),
    refetchInterval: 60_000,
  });

  const punchMutation = useMutation({
    mutationFn: async (action) => {
      const coords = await getCurrentCoords();
      return punchAttendance({ action, ...coords });
    },
    onSuccess: (_, action) => {
      toast.success(action === 'in' ? 'Checked in' : 'Checked out');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error) => toast.error(error.message),
  });

  const latestRecord = todayQuery.data?.[0];
  const activeRecord = todayQuery.data?.find((record) => !record.checkOut);
  const isCheckedIn = !!activeRecord;
  const action = isCheckedIn ? 'out' : 'in';
  const actionDisabled = todayQuery.isFetching || todayQuery.isError || punchMutation.isPending;
  let actionLabel = isCheckedIn ? 'Check Out' : 'Check In';
  if (todayQuery.isLoading) actionLabel = 'Loading Attendance…';
  if (todayQuery.isError) actionLabel = 'Attendance Unavailable';
  if (punchMutation.isPending) actionLabel = isCheckedIn ? 'Checking Out…' : 'Checking In…';

  let currentStatus = 'Not Checked In';
  let currentStatusNote = 'No punches today';
  if (latestRecord) {
    currentStatus = 'Checked Out';
    currentStatusNote = `At ${formatTime(latestRecord.checkOut)}`;
  }
  if (activeRecord) {
    currentStatus = 'Checked In';
    currentStatusNote = `Since ${formatTime(activeRecord.checkIn)}`;
  }
  if (todayQuery.isError) {
    currentStatus = 'Unavailable';
    currentStatusNote = 'Could not load attendance';
  }

  const metrics = useMemo(() => {
    const records = recordsQuery.data || [];
    const withHours = records.filter((r) => r.checkOut && r.workedHours != null);
    const totalHours = withHours.reduce((sum, r) => sum + r.workedHours, 0);
    const avgHours = withHours.length ? totalHours / withHours.length : 0;
    return [
      { label: 'Days Recorded', value: String(records.length).padStart(2, '0'), note: `In ${tab.toLowerCase()}` },
      { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, note: `Across ${withHours.length} completed days` },
      { label: 'Avg. Hours / Day', value: `${avgHours.toFixed(1)}h`, note: 'On completed days' },
      {
        label: 'Current Status',
        value: currentStatus,
        note: currentStatusNote,
      },
    ];
  }, [recordsQuery.data, tab, currentStatus, currentStatusNote]);

  const rows = recordsQuery.data || [];

  return (
    <Layout>
      <div className="flex flex-col gap-[22px]">
        <PageHeader
          title="Attendance"
          subtitle={`Check-ins, timesheets and worked hours for ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}
          actionLabel={actionLabel}
          actionDisabled={actionDisabled}
          onAction={() => punchMutation.mutate(action)}
        />
        <TabBar tabs={TABS} active={tab} onChange={setTab} />

        {recordsQuery.isLoading ? (
          <>
            <SkeletonMetrics count={4} />
            <SkeletonTable columns={5} rows={6} />
          </>
        ) : recordsQuery.isError ? (
          <ErrorState message={recordsQuery.error.message} onRetry={recordsQuery.refetch} />
        ) : (
          <>
            <MetricGrid metrics={metrics} />
            {rows.length ? <DataTable columns={COLUMNS} rows={rows} statusColumn="status" /> : <EmptyState label="No attendance records in this range." />}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Attendance;

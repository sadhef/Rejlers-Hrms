import { SAMPLE_ANNOUNCEMENTS } from '../data/sampleData.js';
import { useState } from 'react';
import Layout from '../../../shared/components/Layout.jsx';
import { PageHeader, TabBar, CardGrid } from '../../../shared/components/hr/HrPage.jsx';

/** Renders sample company updates with category filters. No props or custom errors; returns a page element. */
const Announcements = () => {
  const [tab, setTab] = useState('All');
  const cards = SAMPLE_ANNOUNCEMENTS.filter((card) => tab === 'All' || card.group === tab);
  return (
    <Layout>
      <div className="flex flex-col gap-[22px]">
        <PageHeader title="Announcements" subtitle="Company news and updates" />
        <p className="m-0 text-sm text-[var(--tx2)]">Sample announcements · For preview purposes.</p>
        <TabBar tabs={['All', 'Company', 'HR', 'IT']} active={tab} onChange={setTab} />
        <CardGrid cards={cards} columns={2} />
      </div>
    </Layout>
  );
};
export default Announcements;

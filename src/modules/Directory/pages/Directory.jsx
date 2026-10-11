import { SAMPLE_COLLEAGUES } from '../data/sampleData.js';
import { useState } from 'react';
import Layout from '../../../shared/components/Layout.jsx';
import { PageHeader, TabBar, CardGrid, EmptyState } from '../../../shared/components/hr/HrPage.jsx';

/** Renders a searchable sample directory with team filters. No props or custom errors; returns a page element. */
const Directory = () => {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const cards = SAMPLE_COLLEAGUES.filter((card) => (tab === 'All' || card.group === tab)
    && `${card.title} ${card.subtitle} ${card.body} ${card.meta}`.toLowerCase().includes(query));
  return (
    <Layout>
      <div className="flex flex-col gap-[22px]">
        <PageHeader title="Team Directory" subtitle="Find colleagues across teams and offices" />
        <p className="m-0 text-sm text-[var(--tx2)]">Sample directory · Names and contact details are fictional.</p>
        <label className="flex w-full flex-col gap-2 text-sm text-[var(--tx2)] sm:max-w-md">
          Search colleagues
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, role, team or office" className="min-h-11 rounded-xl border border-[var(--border-2)] bg-[var(--surface)] px-4 py-2.5 text-[var(--tx)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--acc)]" />
        </label>
        <TabBar tabs={['All', 'Energy', 'Industry', 'Communities', 'Corporate']} active={tab} onChange={setTab} />
        {cards.length > 0 ? <CardGrid cards={cards} columns={3} /> : <EmptyState label="No colleagues match your search." actionLabel="Clear filters" onAction={() => { setTab('All'); setSearch(''); }} />}
      </div>
    </Layout>
  );
};
export default Directory;

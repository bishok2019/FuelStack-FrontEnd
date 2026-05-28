import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import ErrorState from '../../components/ErrorState';
import LoadingState from '../../components/LoadingState';
import Modal from '../../components/Modal';
import { useCreateDealer, useCreateHub, useDealers, useHubs } from '../../hooks/useDealers';
import { nameOf, rowsOf } from '../../utils/data';

export default function DealersPage() {
  const dealers = useDealers();
  const hubs = useHubs();
  const createDealer = useCreateDealer();
  const createHub = useCreateHub();
  const dealerRows = rowsOf(dealers.data);
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [dealerModal, setDealerModal] = useState(false);
  const [hubModal, setHubModal] = useState(false);
  const [dealerName, setDealerName] = useState('');
  const [hubForm, setHubForm] = useState({ name: '', address: '' });
  const activeDealerId = selectedDealerId || dealerRows[0]?.id || '';

  const dealerHubs = useMemo(
    () => rowsOf(hubs.data).filter((hub) => String(hub.dealer_id || hub.dealer?.id) === String(activeDealerId)),
    [hubs.data, activeDealerId],
  );

  const addDealer = (event) => {
    event.preventDefault();
    createDealer.mutate({ name: dealerName }, { onSuccess: () => { setDealerName(''); setDealerModal(false); } });
  };

  const addHub = (event) => {
    event.preventDefault();
    createHub.mutate({ ...hubForm, dealer_id: activeDealerId }, { onSuccess: () => { setHubForm({ name: '', address: '' }); setHubModal(false); } });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Dealers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage dealers and their fulfillment hubs.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => setDealerModal(true)}><Plus className="h-4 w-4" /> Add dealer</button>
          <button className="btn-primary" onClick={() => setHubModal(true)} disabled={!activeDealerId}><Plus className="h-4 w-4" /> Add hub</button>
        </div>
      </div>
      {(dealers.isLoading || hubs.isLoading) ? <LoadingState label="Loading dealers" /> : null}
      {dealers.isError ? <ErrorState error={dealers.error} /> : null}
      {hubs.isError ? <ErrorState error={hubs.error} /> : null}
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="panel p-3">
          <h2 className="px-2 pb-3 text-sm font-semibold text-slate-500">Dealers</h2>
          <div className="space-y-2">
            {dealerRows.map((dealer) => (
              <button key={dealer.id} className={`w-full rounded-md px-3 py-3 text-left text-sm font-semibold ${String(activeDealerId) === String(dealer.id) ? 'bg-blue-50 text-primary' : 'hover:bg-slate-100'}`} onClick={() => setSelectedDealerId(dealer.id)}>
                {nameOf(dealer)}
              </button>
            ))}
          </div>
        </aside>
        <section className="panel p-5">
          <h2 className="text-lg font-semibold text-slate-950">Hubs under {nameOf(dealerRows.find((dealer) => String(dealer.id) === String(activeDealerId)), 'selected dealer')}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {dealerHubs.map((hub) => (
              <article key={hub.id} className="rounded-md border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-950">{nameOf(hub)}</h3>
                <p className="mt-2 text-sm text-slate-500">{hub.address || hub.location || 'No address provided.'}</p>
              </article>
            ))}
            {!dealerHubs.length ? <p className="text-sm text-slate-500">No hubs for this dealer.</p> : null}
          </div>
        </section>
      </div>
      <Modal open={dealerModal} title="Add dealer" onClose={() => setDealerModal(false)}>
        <form className="space-y-4" onSubmit={addDealer}><label className="label block">Dealer name<input className="input mt-1" value={dealerName} onChange={(event) => setDealerName(event.target.value)} required /></label><div className="flex justify-end"><button className="btn-primary">Save</button></div></form>
      </Modal>
      <Modal open={hubModal} title="Add hub" onClose={() => setHubModal(false)}>
        <form className="space-y-4" onSubmit={addHub}><label className="label block">Hub name<input className="input mt-1" value={hubForm.name} onChange={(event) => setHubForm({ ...hubForm, name: event.target.value })} required /></label><label className="label block">Address<textarea className="input mt-1 min-h-24" value={hubForm.address} onChange={(event) => setHubForm({ ...hubForm, address: event.target.value })} /></label><div className="flex justify-end"><button className="btn-primary">Save</button></div></form>
      </Modal>
    </div>
  );
}

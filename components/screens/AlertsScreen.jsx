'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, RotateCcw, BellOff } from 'lucide-react';
import { useAlertStore } from '@/store/alertStore';
import Panel from '@/components/ui/Panel';
import AlertCreateForm from '@/components/alerts/AlertCreateForm';
import NotificationPermissionButton from '@/components/alerts/NotificationPermissionButton';
import { fmtDateTime } from '@/lib/formatters';

const TYPE_LABEL = { price: 'PRICE', percent_change: '% CHANGE', ma_cross: '50D MA CROSS' };
const STATUS_COLOR = { active: 'text-bb-blue', triggered: 'text-bb-amber', dismissed: 'text-bb-dark' };

export default function AlertsScreen() {
  const { alerts, fetchAll, dismiss, reactivate, remove } = useAlertStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-full flex-col gap-0.5 p-0.5">
      <Panel
        title="ALERTS · ALERT"
        right={(
          <div className="flex items-center gap-3">
            <NotificationPermissionButton />
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1 text-2xs font-bold text-bb-orange hover:text-bb-amber">
              <Plus size={11} /> NEW ALERT
            </button>
          </div>
        )}
        noPad
        className="min-h-0 flex-1"
      >
        <div className="border-b border-terminal-divider bg-terminal-header px-2 py-1.5 text-2xs text-bb-dark">
          Alerts only fire while this server process and at least one browser tab are running — this is not push-to-closed-browser.
        </div>
        <div className="overflow-auto thin-scroll">
          <table className="bb-table">
            <thead>
              <tr>
                <th>SYMBOL</th><th>TYPE</th><th>CONDITION</th><th>VALUE</th>
                <th>STATUS</th><th>CREATED</th><th>TRIGGERED</th><th /><th />
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className="bb-row-hover">
                  <td className="font-bold text-bb-blue">{a.symbol}</td>
                  <td className="text-bb-gray">{TYPE_LABEL[a.type]}</td>
                  <td className="text-bb-gray">{a.condition.toUpperCase()}</td>
                  <td className="text-right tabular-nums text-bb-gray">{a.value != null ? a.value : '—'}</td>
                  <td className={`font-bold ${STATUS_COLOR[a.status]}`}>{a.status.toUpperCase()}</td>
                  <td className="text-2xs text-bb-dark">{fmtDateTime(a.createdAt)}</td>
                  <td className="text-2xs text-bb-dark">{a.triggeredAt ? fmtDateTime(a.triggeredAt) : '—'}</td>
                  <td className="w-4" onClick={() => (a.status === 'dismissed' ? reactivate(a.id) : dismiss(a.id))}>
                    {a.status === 'dismissed'
                      ? <RotateCcw size={12} className="text-bb-dark hover:text-bb-green" />
                      : <BellOff size={12} className="text-bb-dark hover:text-bb-amber" />}
                  </td>
                  <td className="w-4" onClick={() => remove(a.id)}>
                    <Trash2 size={12} className="text-bb-dark hover:text-bb-red" />
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr><td colSpan={9} className="py-6 text-center text-bb-dark">NO ALERTS — CREATE ONE ABOVE</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {showCreate && <AlertCreateForm onClose={() => setShowCreate(false)} />}
    </div>
  );
}

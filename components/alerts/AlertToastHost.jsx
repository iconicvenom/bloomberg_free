'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Bell } from 'lucide-react';
import { useAlertStore } from '@/store/alertStore';

const TYPE_LABEL = { price: 'PRICE', percent_change: '% CHANGE', ma_cross: '50D MA CROSS' };

// Mounted once at the shell root. Owns the single SSE connection (guarded so
// only one EventSource exists per tab) so alerts fire regardless of which
// screen is active. Always shows an in-app toast on trigger; additionally
// fires a native Notification if permission was granted.
export default function AlertToastHost() {
  const connectSSE = useAlertStore((s) => s.connectSSE);
  const lastTriggeredEvent = useAlertStore((s) => s.lastTriggeredEvent);
  const [toasts, setToasts] = useState([]);
  const seen = useRef(new Set());

  useEffect(() => {
    connectSSE();
  }, [connectSSE]);

  useEffect(() => {
    const alert = lastTriggeredEvent;
    if (!alert || seen.current.has(alert.id + alert.triggeredAt)) return;
    seen.current.add(alert.id + alert.triggeredAt);

    setToasts((t) => [...t, alert]);
    setTimeout(() => setToasts((t) => t.filter((a) => a.id !== alert.id)), 8000);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(`${alert.symbol} alert triggered`, {
        body: `${TYPE_LABEL[alert.type]} — ${alert.condition.toUpperCase()}${alert.value != null ? ` ${alert.value}` : ''}`,
      });
    }
  }, [lastTriggeredEvent]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] space-y-2">
      {toasts.map((alert) => (
        <div key={alert.id} className="flex items-start gap-2 border border-bb-orange bg-terminal-bg p-3 shadow-bb-glow">
          <Bell size={14} className="mt-0.5 text-bb-orange" />
          <div className="text-2xs">
            <div className="font-bold text-bb-orange">{alert.symbol} ALERT TRIGGERED</div>
            <div className="text-bb-gray">{TYPE_LABEL[alert.type]} — {alert.condition.toUpperCase()}{alert.value != null ? ` ${alert.value}` : ''}</div>
          </div>
          <X size={12} className="ml-2 mt-0.5 cursor-pointer text-bb-dark hover:text-bb-red" onClick={() => setToasts((t) => t.filter((a) => a.id !== alert.id))} />
        </div>
      ))}
    </div>
  );
}

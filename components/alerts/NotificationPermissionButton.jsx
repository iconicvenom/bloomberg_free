'use client';

import { useEffect, useState } from 'react';
import { BellRing } from 'lucide-react';

// Requests Notification.permission only on explicit user click — never
// automatically on page load, per requirement.
export default function NotificationPermissionButton() {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  const request = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const label = {
    granted: 'DESKTOP ALERTS ENABLED',
    denied: 'DESKTOP ALERTS BLOCKED (CHECK BROWSER SETTINGS)',
    default: 'ENABLE DESKTOP ALERTS',
  }[permission];

  return (
    <button
      onClick={request}
      disabled={permission !== 'default'}
      className={`flex items-center gap-1 text-2xs font-bold ${
        permission === 'granted' ? 'text-bb-green' : permission === 'denied' ? 'text-bb-dark' : 'text-bb-orange hover:text-bb-amber'
      }`}
    >
      <BellRing size={11} /> {label}
    </button>
  );
}

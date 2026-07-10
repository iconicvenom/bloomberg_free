'use client';

import { useEffect, useState } from 'react';
import { useDialogStore } from '@/store/dialogStore';

// Mounted once at the shell root. Renders whatever prompt/confirm/alert
// dialog is currently pending (see lib/dialog.js) as an in-app modal.
export default function DialogHost() {
  const request = useDialogStore((s) => s.request);
  const close = useDialogStore((s) => s.close);
  const [value, setValue] = useState('');

  useEffect(() => {
    if (request?.type === 'prompt') setValue(request.defaultValue || '');
  }, [request]);

  if (!request) return null;

  const finish = (result) => {
    request.resolve(result);
    close();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') finish(request.type === 'prompt' ? null : request.type === 'confirm' ? false : undefined);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70" onKeyDown={onKeyDown}>
      <div className="w-80 border border-bb-orange/40 bg-terminal-bg p-4">
        <div className="mb-3 whitespace-pre-wrap text-xs text-bb-white">{request.message}</div>

        {request.type === 'prompt' && (
          <form
            onSubmit={(e) => { e.preventDefault(); finish(value); }}
          >
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="mb-3 w-full bg-terminal-header p-1.5 text-xs text-bb-white"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => finish(null)} className="px-3 py-1 text-2xs font-bold text-bb-gray hover:text-bb-white">CANCEL</button>
              <button type="submit" className="bg-bb-orange px-3 py-1 text-2xs font-bold text-black">OK</button>
            </div>
          </form>
        )}

        {request.type === 'confirm' && (
          <div className="flex justify-end gap-2">
            <button onClick={() => finish(false)} className="px-3 py-1 text-2xs font-bold text-bb-gray hover:text-bb-white">CANCEL</button>
            <button autoFocus onClick={() => finish(true)} className="bg-bb-orange px-3 py-1 text-2xs font-bold text-black">CONFIRM</button>
          </div>
        )}

        {request.type === 'alert' && (
          <div className="flex justify-end">
            <button autoFocus onClick={() => finish(undefined)} className="bg-bb-orange px-3 py-1 text-2xs font-bold text-black">OK</button>
          </div>
        )}
      </div>
    </div>
  );
}

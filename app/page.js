'use client';

import dynamic from 'next/dynamic';

const Terminal = dynamic(() => import('@/components/shell/Terminal'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-black text-bb-orange">
      <span className="text-sm tracking-widest">BLOOMBERG PROFESSIONAL…</span>
    </div>
  ),
});

export default function Page() {
  return <Terminal />;
}

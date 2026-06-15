'use client';

import { PanelGroup, Panel as RPanel, PanelResizeHandle } from 'react-resizable-panels';
import { useUIStore } from '@/store/uiStore';

const handleClass =
  'relative flex items-center justify-center bg-terminal-border transition-colors data-[resize-handle-state=hover]:bg-bb-orange data-[resize-handle-state=drag]:bg-bb-orange';

export function HResizeHandle() {
  return (
    <PanelResizeHandle className={`${handleClass} w-1`}>
      <div className="h-6 w-px bg-bb-dark" />
    </PanelResizeHandle>
  );
}

export function VResizeHandle() {
  return (
    <PanelResizeHandle className={`${handleClass} h-1`}>
      <div className="h-px w-6 bg-bb-dark" />
    </PanelResizeHandle>
  );
}

export function HGroup({ id, children, className = '' }) {
  const savePanelSizes = useUIStore((s) => s.savePanelSizes);
  return (
    <PanelGroup
      direction="horizontal"
      autoSaveId={id ? `bbt-${id}` : undefined}
      onLayout={id ? (sizes) => savePanelSizes(id, sizes) : undefined}
      className={className}
    >
      {children}
    </PanelGroup>
  );
}

export function VGroup({ id, children, className = '' }) {
  return (
    <PanelGroup direction="vertical" autoSaveId={id ? `bbt-v-${id}` : undefined} className={className}>
      {children}
    </PanelGroup>
  );
}

export { RPanel as GridPanel };

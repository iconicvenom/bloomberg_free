'use client';

export default function Panel({ title, right, children, className = '', noPad = false }) {
  return (
    <div className={`bb-panel h-full ${className}`}>
      {title && (
        <div className="bb-panel-header">
          <span>{title}</span>
          {right && <span className="font-normal normal-case">{right}</span>}
        </div>
      )}
      <div className={`min-h-0 flex-1 overflow-auto thin-scroll ${noPad ? '' : 'p-2'}`}>{children}</div>
    </div>
  );
}

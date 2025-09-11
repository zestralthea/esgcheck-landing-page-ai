import React, { useEffect, useState } from 'react';

interface IdleMountProps {
  children: React.ReactNode;
  delayMs?: number;
}

export default function IdleMount({ children, delayMs = 60 }: IdleMountProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const onReady = () => { if (!cancelled) setReady(true); };

    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(onReady, { timeout: delayMs });
      return () => { cancelled = true; (window as any).cancelIdleCallback?.(id); };
    }
    const t = setTimeout(onReady, delayMs);
    return () => { cancelled = true; clearTimeout(t); };
  }, [delayMs]);

  if (!ready) return null;
  return <>{children}</>;
}


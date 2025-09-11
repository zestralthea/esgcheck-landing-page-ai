import { useEffect } from 'react';

export default function RouteLoader() {
  useEffect(() => {
    try { document.documentElement.classList.add('route-transitioning'); } catch {}
    return () => { try { document.documentElement.classList.remove('route-transitioning'); } catch {} };
  }, []);

  return (
    <div className="route-loader fixed inset-0 z-[100] grid place-items-center bg-background">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        <span className="text-sm text-muted-foreground">Loading…</span>
      </div>
    </div>
  );
}

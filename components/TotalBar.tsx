export function TotalBar({
  total,
  savings,
  children,
}: {
  total: number;
  savings: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="fixed bottom-16 left-1/2 z-30 w-full max-w-md -translate-x-1/2 px-4">
      <div className="flex items-center justify-between gap-3 rounded-xl2 bg-caddy-ink px-4 py-3 text-white shadow-floating">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/60">Total cost</p>
          <p className="text-lg font-bold">£{total.toFixed(2)}</p>
          {savings > 0 && (
            <p className="text-[11px] font-medium text-caddy-orange">
              Saving £{savings.toFixed(2)} vs full price
            </p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

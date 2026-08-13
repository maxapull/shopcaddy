"use client";

import { useState } from "react";
import { Building2, Loader2, ShieldCheck, X } from "lucide-react";
import { useAppState } from "@/lib/store";

const BANKS = ["Monzo", "Barclays", "HSBC", "Revolut", "NatWest"];

export function BankLinkSheet({ onClose }: { onClose: () => void }) {
  const { linkBank } = useAppState();
  const [connecting, setConnecting] = useState<string | null>(null);

  function handleConnect(bank: string) {
    setConnecting(bank);
    setTimeout(() => {
      linkBank(bank);
      setConnecting(null);
      onClose();
    }, 1100);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-md rounded-t-2xl bg-white p-5 shadow-floating">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-caddy-ink">Link your bank</h2>
          <button onClick={onClose} className="text-caddy-gray hover:text-caddy-ink">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 flex items-start gap-2 rounded-xl2 bg-caddy-orange-light p-3 text-xs text-caddy-orange-dark">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <p>
            Demo only — this prototype does not contact a real bank. In production this screen
            uses Open Banking (read-only + confirmation-of-payment consent) so ShopCaddy never
            stores your card details.
          </p>
        </div>

        <div className="space-y-2">
          {BANKS.map((bank) => (
            <button
              key={bank}
              onClick={() => handleConnect(bank)}
              disabled={connecting !== null}
              className="flex w-full items-center justify-between rounded-xl2 border border-caddy-orange-light px-4 py-3 text-left transition-colors hover:border-caddy-orange disabled:opacity-60"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-caddy-orange-light text-caddy-orange-dark">
                  <Building2 size={16} />
                </span>
                <span className="font-medium text-caddy-ink">{bank}</span>
              </span>
              {connecting === bank && <Loader2 size={18} className="animate-spin text-caddy-orange" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

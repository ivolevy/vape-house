import * as React from "react";
import { useCart } from "@/lib/cart-store";
import { formatARS } from "@/lib/format";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { CheckoutModal } from "./CheckoutModal";

export function CartDrawer() {
  const { open, setOpen, items, setQty, remove, total } = useCart();
  const [checkoutOpen, setCheckoutOpen] = React.useState(false);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full sm:w-[420px] glass-strong shadow-2xl flex flex-col transition-transform duration-500 ${open ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <h2 className="font-display text-lg tracking-wide">Mi compra</h2>
            <button onClick={() => setOpen(false)} className="h-9 w-9 rounded-full hover:bg-white/5 flex items-center justify-center">
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-20">Tu carrito está vacío</p>
            ) : (
              items.map((i) => (
                <div key={i.id} className="flex gap-4 items-center">
                  <div className="h-16 w-16 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    {i.image_url ? <img src={i.image_url} alt="" className="w-full h-full object-contain" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{i.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatARS(i.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => setQty(i.id, i.qty - 1)} className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center">
                        <Minus className="size-3" />
                      </button>
                      <span className="text-sm w-6 text-center">{i.qty}</span>
                      <button onClick={() => setQty(i.id, i.qty + 1)} className="h-7 w-7 rounded-full bg-white/5 flex items-center justify-center">
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>
                  <button onClick={() => remove(i.id)} className="text-muted-foreground hover:text-foreground p-2">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-white/5 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-semibold">{formatARS(total)}</span>
            </div>
            <button
              disabled={items.length === 0}
              onClick={() => setCheckoutOpen(true)}
              className="btn-premium w-full disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Realizar pedido
            </button>
          </div>
        </aside>
      </div>

      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  );
}

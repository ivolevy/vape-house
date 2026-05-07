import * as React from "react";
import { useCart } from "@/lib/cart-store";
import { formatARS } from "@/lib/format";
import { X } from "lucide-react";

const WHATSAPP_NUMBER = "5491138240929";

export function CheckoutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, total, clear, setOpen } = useCart();
  const [delivery, setDelivery] = React.useState<"Retiro" | "Envío">("Envío");
  const [payment, setPayment] = React.useState<"Efectivo" | "Transferencia">("Transferencia");

  if (!open) return null;

  const confirm = () => {
    const lines = items.map((i) => `${i.name} x${i.qty}`).join("\n");
    const msg = `Hola, quiero hacer un pedido:\n\n${lines}\n\nTotal: ${formatARS(total)}\n\nEntrega: ${delivery}\nPago: ${payment}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    clear();
    onClose();
    setOpen(false);
  };

  const Option = ({
    selected, onClick, children,
  }: { selected: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl py-4 text-sm font-medium transition border ${
        selected
          ? "bg-gradient-to-br from-[oklch(0.62_0.18_320)]/90 to-[oklch(0.45_0.16_18)]/90 text-white border-transparent"
          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-white hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div className="relative glass-strong rounded-3xl w-full max-w-md p-8">
        <button onClick={onClose} className="absolute right-4 top-4 h-9 w-9 rounded-full hover:bg-white/5 flex items-center justify-center">
          <X className="size-4" />
        </button>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Finalizar pedido</h2>
        <p className="text-sm text-muted-foreground mt-1">Confirmá tu pedido por WhatsApp.</p>

        <div className="mt-8 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Seleccione un método de envío</p>
            <div className="flex gap-3">
              <Option selected={delivery === "Envío"} onClick={() => setDelivery("Envío")}>Envío</Option>
              <Option selected={delivery === "Retiro"} onClick={() => setDelivery("Retiro")}>Retiro</Option>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Seleccione un método de pago</p>
            <div className="flex gap-3">
              <Option selected={payment === "Transferencia"} onClick={() => setPayment("Transferencia")}>Transferencia</Option>
              <Option selected={payment === "Efectivo"} onClick={() => setPayment("Efectivo")}>Efectivo</Option>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total</span>
          <span className="font-display text-xl font-semibold">{formatARS(total)}</span>
        </div>

        <button onClick={confirm} className="btn-premium w-full mt-6">
          Enviar pedido por WhatsApp
        </button>
      </div>
    </div>
  );
}

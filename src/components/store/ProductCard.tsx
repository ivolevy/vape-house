import { useCart } from "@/lib/cart-store";
import { formatARS } from "@/lib/format";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export type Product = {
  id: string;
  name: string;
  price: number;
  puff_count: number | null;
  stock_count: number;
  stock_status: string | null;
  image_url: string | null;
  featured: boolean;
};

function stockLabel(p: Product) {
  if (p.stock_status === "out_of_stock" || p.stock_count === 0) return "Sin stock";
  if (p.stock_status === "last_unit" || p.stock_count === 1) return "Última unidad";
  return `Stock: ${p.stock_count}`;
}

export function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const out = p.stock_status === "out_of_stock" || p.stock_count === 0;
  return (
    <article className="product-card p-5 flex flex-col">
      <div className="relative aspect-square rounded-xl overflow-hidden mb-5 flex items-center justify-center"
           style={{ background: "radial-gradient(closest-side, oklch(0.20 0.05 320 / 0.6), transparent 70%)" }}>
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="product-img w-3/4 h-3/4 object-contain" loading="lazy" />
        ) : (
          <div className="product-img text-muted-foreground text-xs">Sin imagen</div>
        )}
        {p.featured && (
          <span className="absolute top-3 left-3 text-[10px] tracking-widest uppercase px-2 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10">
            Destacado
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        <h3 className="font-display text-base font-semibold leading-snug">{p.name}</h3>
        <div className="mt-1 text-xs text-muted-foreground flex items-center gap-2">
          {p.puff_count ? <span>{p.puff_count.toLocaleString("es-AR")} puffs</span> : null}
          <span className={out ? "text-[oklch(0.7_0.2_25)]" : ""}>· {stockLabel(p)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-lg font-semibold">{formatARS(p.price)}</span>
          <button
            disabled={out}
            onClick={() => {
              add({ id: p.id, name: p.name, price: Number(p.price), image_url: p.image_url });
              toast.success("Agregado al carrito");
            }}
            className="h-9 w-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[oklch(0.62_0.18_320)] to-[oklch(0.45_0.16_18)] text-white disabled:opacity-30 disabled:cursor-not-allowed transition hover:scale-105"
            aria-label="Agregar al carrito"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
